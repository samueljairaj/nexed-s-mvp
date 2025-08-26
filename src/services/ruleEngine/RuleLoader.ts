/**
 * Rule Loader - Manages loading and caching of compliance rules
 * 
 * This class handles loading rules from various sources and provides
 * caching and management capabilities for the rule engine.
 */

import { RuleDefinition, RuleEngineError, VisaPhase, VisaType, RuleGroup } from './types';

/**
 * Rule source configuration
 */
export interface RuleSource {
  type: 'embedded' | 'database' | 'api';
  location: string;
  priority?: number;
  enabled?: boolean;
}

/**
 * Rule loading result
 */
export interface RuleLoadResult {
  rules: RuleDefinition[];
  source: RuleSource;
  loadedAt: Date;
  errors: string[];
}

/**
 * Rule cache entry
 */
interface RuleCacheEntry {
  rules: RuleDefinition[];
  loadedAt: Date;
  expiresAt: Date;
  source: RuleSource;
}

/**
 * Main RuleLoader class
 */
export class RuleLoader {
  private cache = new Map<string, RuleCacheEntry>();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private sources: RuleSource[] = [];

  constructor(sources: RuleSource[] = []) {
    this.sources = sources;
    this.setupDefaultSources();
  }

  /**
   * Setup default rule sources
   */
  private setupDefaultSources(): void {
    if (this.sources.length === 0) {
      // Default to embedded rule sources
      this.sources = [
        {
          type: 'embedded',
          location: 'f1-student-rules',
          priority: 100,
          enabled: true
        },
        {
          type: 'embedded', 
          location: 'opt-rules',
          priority: 100,
          enabled: true
        },
        {
          type: 'embedded',
          location: 'stem-opt-rules',
          priority: 100,
          enabled: true
        }
      ];
    }
  }

  /**
   * Load all rules from configured sources
   */
  public async loadAllRules(): Promise<RuleDefinition[]> {
    const allRules: RuleDefinition[] = [];
    const loadPromises: Promise<RuleLoadResult>[] = [];

    // Load from all enabled sources
    const enabledSources = this.sources.filter(s => s.enabled !== false);
    for (const source of enabledSources) {
      loadPromises.push(this.loadFromSource(source));
    }

    try {
      const results = await Promise.allSettled(loadPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const loadResult = result.value;
          allRules.push(...loadResult.rules);
          
          // Cache the results (use the actual source returned)
          this.cacheRules(loadResult.source, loadResult.rules);
        } else {
          console.error(`Failed to load rules from source ${index}:`, result.reason);
        }
      });

      // Remove duplicates based on rule ID
      const uniqueRules = this.deduplicateRules(allRules);
      
      console.log(`✅ Loaded ${uniqueRules.length} unique rules from ${this.sources.length} sources`);
      
      return uniqueRules;

    } catch (error) {
      throw new RuleEngineError(
        `Failed to load rules: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_LOADING_FAILED'
      );
    }
  }

  /**
   * Load rules from a specific source
   */
  private async loadFromSource(source: RuleSource): Promise<RuleLoadResult> {
    const cacheKey = `${source.type}:${source.location}`;
    
    // Check cache first
    const cached = this.getCachedRules(cacheKey);
    if (cached) {
      return {
        rules: cached.rules,
        source,
        loadedAt: cached.loadedAt,
        errors: []
      };
    }

    try {
      let rules: RuleDefinition[] = [];
      
      switch (source.type) {
        case 'embedded':
          rules = await this.loadEmbeddedRules(source.location);
          break;
        case 'database':
          rules = await this.loadFromDatabase(source.location);
          break;
        case 'api':
          rules = await this.loadFromAPI(source.location);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }

      return {
        rules,
        source,
        loadedAt: new Date(),
        errors: []
      };

    } catch (error) {
      throw new RuleEngineError(
        `Failed to load from ${source.type} source ${source.location}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RULE_LOADING_FAILED'
      );
    }
  }

  /**
   * Load embedded rules based on location
   */
  private async loadEmbeddedRules(location: string): Promise<RuleDefinition[]> {
    switch (location) {
      case 'f1-student-rules':
        return this.getF1StudentRules();
      case 'opt-rules':
        return this.getOPTRules();
      case 'stem-opt-rules':
        return this.getSTEMOPTRules();
      default:
        throw new Error(`Unknown embedded rule location: ${location}`);
    }
  }

  /**
   * Sample F1 student rules
   */
  private getF1StudentRules(): RuleDefinition[] {
    return [
      {
        id: "f1-passport-renewal-urgent",
        name: "Passport Renewal - Urgent F1 Status Risk",
        description: "Passport expiring soon threatens F1 status maintenance",
        ruleGroup: "documents" as RuleGroup,
        phase: ["during_program", "pre_graduation", "general"] as VisaPhase[],
        visaTypes: ["F1"] as VisaType[],
        priority: 90,
        conditions: [
          {
            field: "dates.passportExpiryDate",
            operator: "lessThan",
            timeValue: "6months",
            logicOperator: "AND"
          },
          {
            field: "visaType",
            operator: "equals",
            value: "F1"
          }
        ],
        taskTemplate: {
          titleTemplate: "🚨 Renew Passport - F1 Status at Risk",
          descriptionTemplate: `Your passport expires on {dates.passportExpiryDate} ({#days_until_passport_expiry} days). Renew immediately to maintain F1 status.

⚠️ **Critical**: Passports must be valid for 6+ months for:
• Travel authorization
• I-20 renewals
• Status maintenance
• Future visa applications

📋 **Next Steps**:
1. Apply for passport renewal at your country's consulate
2. Allow 4-8 weeks processing time
3. Update passport info in SEVIS once received`,
          category: "immigration",
          priority: "high",
          dueDateConfig: {
            type: "calculated",
            calculation: "passport_renewal_urgent"
          }
        },
        isActive: true,
        tags: ["passport", "urgent", "f1-status"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "f1-graduation-opt-window",
        name: "OPT Application Window Opens",
        description: "OPT application window opens 90 days before graduation",
        ruleGroup: "employment" as RuleGroup,
        phase: "pre_graduation" as VisaPhase,
        visaTypes: ["F1"] as VisaType[],
        priority: 75,
        conditions: [
          {
            field: "dates.graduationDate",
            operator: "exists",
            logicOperator: "AND"
          },
          {
            field: "dates.graduationDate",
            operator: "lessThan",
            timeValue: "90days",
            logicOperator: "AND"
          },
          {
            field: "employment.optApplicationSubmitted",
            operator: "equals",
            value: false
          }
        ],
        taskTemplate: {
          titleTemplate: "🎓 OPT Application Window Now Open",
          descriptionTemplate: `You graduate on {dates.graduationDate} ({#days_until_graduation} days). Your OPT application window is now open!

📅 **Application Window**:
• **Opens**: 90 days before graduation
• **Closes**: 60 days after graduation
• **Recommended**: Apply ASAP for maximum work time

💼 **OPT Benefits**:
• 12 months of work authorization
• {?academic.isSTEM:Additional 24 months if STEM:Standard 12 months}
• Gain valuable US work experience
• Potential pathway to H1B

📋 **Required Documents**:
• Form I-765 (Application)
• I-20 with OPT recommendation
• $410 filing fee
• Passport-style photos

🏃‍♂️ **Next Steps**:
1. Meet with DSO for OPT recommendation
2. Gather required documents
3. Submit I-765 to USCIS

⏰ **Optimal Timeline**: Submit within next 2 weeks`,
          category: "employment",
          priority: "high",
          dueDateConfig: {
            type: "calculated",
            calculation: "opt_application_window"
          },
          dependsOn: ["f1-meet-dso-opt"]
        },
        isActive: true,
        tags: ["opt", "graduation", "employment", "application"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "f1-address-change-sevis",
        name: "Report Address Change to SEVIS",
        description: "New address must be reported to SEVIS within 10 days",
        ruleGroup: "reporting" as RuleGroup,
        phase: ["during_program", "opt_active", "stem_active"] as VisaPhase[],
        visaTypes: ["F1"] as VisaType[],
        priority: 85,
        conditions: [
          {
            field: "flags.addressChangeRecent",
            operator: "equals",
            value: true,
            logicOperator: "AND"
          },
          {
            field: "location.addressReportedToSevis",
            operator: "equals",
            value: false
          }
        ],
        taskTemplate: {
          titleTemplate: "⚡ Report Address Change to SEVIS (Due: {#address_update_deadline})",
          descriptionTemplate: `You moved to {location.currentAddress} on {dates.lastMoved}. Federal law requires reporting this within 10 days.

📍 **New Address**: {location.currentAddress}
{location.state} {location.zipCode}

🏛️ **Legal Requirement**: 8 CFR 214.3(g)
• Must report within 10 days of moving
• Failure to report can affect status
• $1,000+ penalties possible

📋 **How to Report**:
1. Log into your university's international student portal
2. Update address in SEVIS system
3. Save confirmation receipt

⏰ **Deadline**: {#address_update_deadline}`,
          category: "reporting",
          priority: "high",
          dueDateConfig: {
            type: "calculated",
            calculation: "address_update_deadline"
          }
        },
        isActive: true,
        tags: ["address", "sevis", "reporting", "urgent"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Sample OPT rules
   */
  private getOPTRules(): RuleDefinition[] {
    return [
      {
        id: "opt-unemployment-tracking",
        name: "OPT Unemployment Days Alert",
        description: "Track unemployment days to prevent exceeding 90-day limit",
        ruleGroup: "employment" as RuleGroup,
        phase: "opt_active" as VisaPhase,
        visaTypes: ["OPT"] as VisaType[],
        priority: 95,
        conditions: [
          {
            field: "employment.unemploymentDaysUsed",
            operator: "greaterThan",
            value: 60,
            logicOperator: "AND"
          },
          {
            field: "employment.status",
            operator: "equals",
            value: "unemployed"
          }
        ],
        taskTemplate: {
          titleTemplate: "🚨 OPT Unemployment Limit Warning ({employment.unemploymentDaysUsed}/90 days used)",
          descriptionTemplate: `⚠️ **CRITICAL**: You've used {employment.unemploymentDaysUsed} of your 90 allowed unemployment days.

📊 **Your Status**:
• Days Used: {employment.unemploymentDaysUsed}/90
• Days Remaining: {#unemployment_days_remaining}
• Current Status: Unemployed since {dates.employmentEndDate}

🚨 **Immediate Action Required**:
• Find employment within {#unemployment_days_remaining} days
• Report new job to DSO within 10 days of starting
• Consider returning to school if no job prospects

💼 **Job Search Resources**:
• University career center
• Professional networking events
• LinkedIn job alerts
• Industry-specific job boards

📞 **DSO Contact**: {user.academic.dsoContact.name}
📧 **Email**: {user.academic.dsoContact.email}

⏰ **Status at Risk**: Exceeding 90 days terminates OPT authorization`,
          category: "employment",
          priority: "high",
          dueDateConfig: {
            type: "calculated",
            calculation: "unemployment_grace_end"
          }
        },
        isActive: true,
        tags: ["unemployment", "critical", "job-search"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "opt-job-reporting",
        name: "Report New Employment to DSO",
        description: "New OPT employment must be reported within 10 days",
        ruleGroup: "reporting" as RuleGroup,
        phase: "opt_active" as VisaPhase,
        visaTypes: ["OPT"] as VisaType[],
        priority: 85,
        conditions: [
          {
            field: "employment.newJobStarted",
            operator: "equals",
            value: true,
            logicOperator: "AND"
          },
          {
            field: "employment.jobReportedToDSO",
            operator: "equals",
            value: false
          }
        ],
        taskTemplate: {
          titleTemplate: "📝 Report New Job to DSO (Due: {#job_reporting_deadline})",
          descriptionTemplate: `Congratulations on your new position! Report your employment details to your DSO within 10 days.

🎉 **New Position**:
• **Company**: {employment.employer}
• **Title**: {employment.jobTitle}
• **Start Date**: {dates.employmentStartDate}
• **Location**: {employment.workLocation}

📋 **Required Reporting**:
• Employer name and address
• Job title and duties
• Start and end dates
• Supervisor contact information
• Salary information

👤 **DSO Contact**: {user.academic.dsoContact.name}
📧 **Email**: {user.academic.dsoContact.email}

⏰ **Legal Deadline**: 10 days from start date`,
          category: "reporting",
          priority: "high",
          dueDateConfig: {
            type: "relative",
            baseDate: "dates.employmentStartDate",
            offset: "+10days"
          }
        },
        isActive: true,
        tags: ["employment", "reporting", "dso"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Sample STEM OPT rules
   */
  private getSTEMOPTRules(): RuleDefinition[] {
    return [
      {
        id: "stem-opt-application-window",
        name: "STEM OPT Extension Application Window",
        description: "Apply for STEM extension 90 days before current OPT expires",
        ruleGroup: "employment" as RuleGroup,
        phase: ["opt_active", "stem_application"] as VisaPhase[],
        visaTypes: ["OPT"] as VisaType[],
        priority: 95,
        conditions: [
          {
            field: "dates.optEndDate",
            operator: "lessThan",
            timeValue: "90days",
            logicOperator: "AND"
          },
          {
            field: "academic.isSTEM",
            operator: "equals",
            value: true,
            logicOperator: "AND"
          },
          {
            field: "employment.stemOptApplicationSubmitted",
            operator: "equals",
            value: false
          }
        ],
        taskTemplate: {
          titleTemplate: "🚀 STEM OPT Application Window Open - Apply Now!",
          descriptionTemplate: `Your OPT expires on {dates.optEndDate} ({#days_until_opt_expiry} days). Apply for STEM extension immediately!

🎓 **Your STEM Eligibility**:
• **Degree**: {academic.fieldOfStudy}
• **University**: {academic.university}
• **STEM Verified**: ✅ Confirmed

⏰ **Critical Timeline**:
• **OPT Expires**: {dates.optEndDate}
• **Application Deadline**: Must apply within 90 days
• **Processing Time**: 3-5 months typical
• **Gap Risk**: Apply NOW to avoid work authorization gap

📋 **Required for Application**:
• Form I-765 with STEM documents
• Form I-983 (Training Plan)
• E-Verify employer confirmation
• $410 filing fee
• Current I-20 with STEM recommendation

💼 **Employer Requirements**:
• Must be enrolled in E-Verify
• Provide structured training program
• Complete Form I-983 training plan
• Commit to mentorship and evaluation

🏃‍♂️ **URGENT NEXT STEPS**:
1. Confirm employer E-Verify enrollment TODAY
2. Schedule DSO meeting this week
3. Complete I-983 with employer
4. Gather all required documents
5. Submit I-765 application ASAP

⚠️ **CRITICAL**: Delays can result in work authorization gaps!`,
          category: "employment",
          priority: "high",
          dueDateConfig: {
            type: "calculated",
            calculation: "stem_extension_deadline"
          },
          dependsOn: ["stem-opt-everify-check", "stem-opt-i983-completion"]
        },
        isActive: true,
        tags: ["stem-extension", "application", "urgent", "deadline"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "stem-opt-everify-check",
        name: "Verify Employer E-Verify Enrollment",
        description: "STEM OPT requires employer to be enrolled in E-Verify system",
        ruleGroup: "employment" as RuleGroup,
        phase: ["opt_active", "stem_application"] as VisaPhase[],
        visaTypes: ["OPT"] as VisaType[],
        priority: 90,
        conditions: [
          {
            field: "academic.isSTEM",
            operator: "equals",
            value: true,
            logicOperator: "AND"
          },
          {
            field: "employment.status",
            operator: "equals",
            value: "employed",
            logicOperator: "AND"
          },
          {
            field: "employment.eVerifyCompliant",
            operator: "equals",
            value: false
          }
        ],
        taskTemplate: {
          titleTemplate: "🔍 Verify Employer E-Verify Enrollment (REQUIRED)",
          descriptionTemplate: `STEM OPT requires your employer to be enrolled in E-Verify. Verify this immediately!

🏢 **Your Employer**: {employment.employer}
📍 **Location**: {employment.workLocation}

✅ **E-Verify Requirements**:
• Employer must be enrolled in E-Verify system
• Must verify all employees' work authorization
• Required for ALL STEM OPT students
• No exceptions or alternatives

🔍 **How to Verify**:
1. **Ask HR directly**: "Is [Company] enrolled in E-Verify?"
2. **Check E-Verify website**: www.e-verify.gov/about-e-verify/e-verify-data/how-to-find-participating-employers
3. **Request documentation**: Ask for E-Verify MOU number
4. **Verify with DSO**: They can help confirm enrollment

⚠️ **If NOT Enrolled**:
• Employer MUST enroll before STEM application
• Enrollment process takes 1-2 weeks
• Cannot proceed with STEM extension without E-Verify
• Consider changing employers if they won't enroll

🚨 **URGENT**: This is a hard requirement - no E-Verify = no STEM OPT`,
          category: "employment",
          priority: "high",
          dueDateConfig: {
            type: "relative",
            baseDate: "dates.optEndDate",
            offset: "-120days"
          }
        },
        isActive: true,
        tags: ["e-verify", "employer", "requirement", "stem"],
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Load rules from database (placeholder)
   */
  private async loadFromDatabase(connectionString: string): Promise<RuleDefinition[]> {
    // TODO: Implement database loading
    // This would connect to Supabase and load rules from compliance_rules table
    throw new Error('Database rule loading not yet implemented');
  }

  /**
   * Load rules from API (placeholder)
   */
  private async loadFromAPI(apiUrl: string): Promise<RuleDefinition[]> {
    // TODO: Implement API loading
    // This would fetch rules from an external API
    throw new Error('API rule loading not yet implemented');
  }

  /**
   * Cache rules for a source
   */
  private cacheRules(source: RuleSource, rules: RuleDefinition[]): void {
    const cacheKey = `${source.type}:${source.location}`;
    const entry: RuleCacheEntry = {
      rules,
      loadedAt: new Date(),
      expiresAt: new Date(Date.now() + this.defaultCacheTTL),
      source
    };
    
    this.cache.set(cacheKey, entry);
  }

  /**
   * Get cached rules if not expired
   */
  private getCachedRules(cacheKey: string): RuleCacheEntry | null {
    const entry = this.cache.get(cacheKey);
    
    if (entry && entry.expiresAt > new Date()) {
      return entry;
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Remove duplicate rules based on ID, keeping highest priority
   */
  private deduplicateRules(rules: RuleDefinition[]): RuleDefinition[] {
    const ruleMap = new Map<string, RuleDefinition>();
    
    rules.forEach(rule => {
      const existing = ruleMap.get(rule.id);
      
      if (!existing || rule.priority > existing.priority) {
        ruleMap.set(rule.id, rule);
      }
    });
    
    return Array.from(ruleMap.values());
  }

  /**
   * Reload rules and clear cache
   */
  public async reloadRules(): Promise<RuleDefinition[]> {
    this.clearCache();
    return this.loadAllRules();
  }

  /**
   * Clear rule cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current sources
   */
  public getSources(): RuleSource[] {
    return [...this.sources];
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { entries: number; totalRules: number; oldestEntry: Date | null } {
    let totalRules = 0;
    let oldestEntry: Date | null = null;
    
    this.cache.forEach(entry => {
      totalRules += entry.rules.length;
      if (!oldestEntry || entry.loadedAt < oldestEntry) {
        oldestEntry = entry.loadedAt;
      }
    });
    
    return {
      entries: this.cache.size,
      totalRules,
      oldestEntry
    };
  }
}
