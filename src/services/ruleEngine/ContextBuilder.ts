/**
 * Context Builder - Builds comprehensive user context for rule evaluation
 * 
 * This class gathers all relevant user data and transforms it into a structured
 * context object that the rule engine can use for intelligent decision making.
 */

import { UserContext, VisaPhase, VisaType, RuleEngineError } from './types';
import { supabase } from '@/integrations/supabase/client';

export class ContextBuilder {
  
  /**
   * Build comprehensive user context for rule evaluation
   */
  public async buildContext(userId: string): Promise<UserContext> {
    try {
      // Fetch user profile data
      const profile = await this.fetchUserProfile(userId);
      if (!profile) {
        throw new RuleEngineError(`User profile not found: ${userId}`, 'USER_CONTEXT_INVALID', undefined, userId);
      }

      // Fetch additional data in parallel
      const [documents, complianceTasks, employmentHistory] = await Promise.all([
        this.fetchUserDocuments(userId),
        this.fetchComplianceTasks(userId),
        this.fetchEmploymentHistory(userId)
      ]);

      // Determine current visa phase
      const currentPhase = this.determineVisaPhase(profile);
      
      // Build comprehensive context
      const context: UserContext = {
        // Basic Info
        userId,
        email: profile.email || '',
        name: profile.name || '',
        
        // Visa Information
        visaType: this.normalizeVisaType(profile.visa_type),
        currentPhase,
        visaStatus: profile.visa_status || '',
        sevisId: profile.sevis_id || '',
        i94Number: profile.i94_number || '',
        
        // Important Dates
        dates: {
          usEntryDate: this.parseDate(profile.us_entry_date),
          visaExpiryDate: this.parseDate(profile.visa_expiry_date),
          passportExpiryDate: this.parseDate(profile.passport_expiry_date),
          courseStartDate: this.parseDate(profile.course_start_date),
          graduationDate: this.parseDate(profile.graduation_date),
          employmentStartDate: this.parseDate(profile.employment_start_date),
          employmentEndDate: this.parseDate(profile.employment_end_date),
          optStartDate: this.parseDate(profile.opt_start_date),
          optEndDate: this.parseDate(profile.opt_end_date),
          stemOptEndDate: this.parseDate(profile.stem_opt_end_date),
          i20ExpiryDate: this.parseDate(profile.i20_expiry_date),
          lastAddressUpdate: this.parseDate(profile.last_address_update)
        },
        
        // Academic Information
        academic: {
          university: profile.university || '',
          universityId: profile.university_id || '',
          fieldOfStudy: profile.field_of_study || '',
          degreeLevel: profile.degree_level || '',
          isSTEM: profile.is_stem || false,
          gpa: profile.gpa || undefined,
          creditsCompleted: profile.credits_completed || undefined,
          totalCredits: profile.total_credits || undefined,
          isTransferStudent: profile.is_transfer_student || false,
          previousUniversities: profile.previous_universities || []
        },
        
        // Employment Information
        employment: {
          status: profile.employment_status || 'Not Employed',
          employer: profile.employer_name || '',
          jobTitle: profile.job_title || '',
          isFieldRelated: profile.is_field_related || false,
          authorizationType: profile.auth_type || '',
          eadNumber: profile.ead_number || '',
          unemploymentDaysUsed: profile.unemployment_days ? parseInt(profile.unemployment_days, 10) : 0,
          maxUnemploymentDays: this.calculateMaxUnemploymentDays(profile.visa_type, profile.is_stem),
          eVerifyCompliant: profile.e_verify_compliant || false
        },
        
        // Document Status
        documents: this.buildDocumentStatus(documents),
        
        // Location & Contact
        location: {
          currentAddress: profile.address || '',
          state: profile.state || '',
          zipCode: profile.zip_code || '',
          lastMoved: this.parseDate(profile.last_moved_date),
          addressReportedToSevis: profile.address_reported_to_sevis || false
        },
        
        // Compliance History
        compliance: {
          tasksCompleted: complianceTasks.filter(t => t.is_completed).length,
          tasksOverdue: complianceTasks.filter(t => !t.is_completed && new Date(t.due_date || '') < new Date()).length,
          lastComplianceCheck: this.parseDate(profile.last_compliance_check),
          riskScore: this.calculateRiskScore(profile, complianceTasks, documents),
          warningsIssued: profile.warnings_issued || []
        },
        
        // Contextual Flags
        flags: {
          hasUnemploymentPeriods: (profile.unemployment_days && parseInt(profile.unemployment_days, 10) > 0) || false,
          hasTransferHistory: profile.is_transfer_student || false,
          isFirstTimeOpt: !profile.previous_opt_periods || profile.previous_opt_periods.length === 0,
          hasH1BPetition: profile.h1b_petition_filed || false,
          planningToTravel: profile.planning_travel || false,
          addressChangeRecent: this.isAddressChangeRecent(profile.last_moved_date)
        },
        
        // University-specific data
        universityContext: profile.university_context || {}
      };

      return context;

    } catch (error) {
      throw new RuleEngineError(
        `Failed to build user context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'USER_CONTEXT_INVALID',
        undefined,
        userId
      );
    }
  }

  /**
   * Fetch user profile from database
   */
  private async fetchUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new RuleEngineError(`Failed to fetch user profile: ${error.message}`, 'USER_CONTEXT_INVALID', undefined, userId);
    }

    return data;
  }

  /**
   * Fetch user documents
   */
  private async fetchUserDocuments(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (error) {
      console.warn(`Failed to fetch user documents: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Fetch compliance tasks
   */
  private async fetchComplianceTasks(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (error) {
      console.warn(`Failed to fetch compliance tasks: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Fetch employment history (placeholder for future implementation)
   */
  private async fetchEmploymentHistory(userId: string): Promise<any[]> {
    // TODO: Implement when employment history table is created
    return [];
  }

  /**
   * Determine current visa phase based on profile data
   */
  private determineVisaPhase(profile: any): VisaPhase {
    const now = new Date();
    const visaType = profile.visa_type;
    
    // Parse important dates
    const usEntryDate = this.parseDate(profile.us_entry_date);
    const courseStartDate = this.parseDate(profile.course_start_date);
    const graduationDate = this.parseDate(profile.graduation_date);
    const employmentStartDate = this.parseDate(profile.employment_start_date);
    const optStartDate = this.parseDate(profile.opt_start_date);
    const optEndDate = this.parseDate(profile.opt_end_date);

    // Pre-arrival phase
    if (!usEntryDate || usEntryDate > now) {
      return 'pre_arrival';
    }

    // Initial entry (first 30 days)
    if (usEntryDate && this.daysBetween(usEntryDate, now) <= 30) {
      return 'initial_entry';
    }

    // F1 Student phases
    if (visaType === 'F1') {
      if (graduationDate) {
        const daysUntilGraduation = this.daysBetween(now, graduationDate);
        
        // Pre-graduation (90 days before)
        if (daysUntilGraduation <= 90 && graduationDate > now) {
          return 'pre_graduation';
        }
        
        // Post-graduation (after graduation, before OPT)
        if (graduationDate <= now && (!optStartDate || optStartDate > now)) {
          return 'post_graduation';
        }
      }
      
      // During program
      if (courseStartDate && courseStartDate <= now) {
        return 'during_program';
      }
    }

    // OPT phases
    if (profile.employment_status === 'OPT' || optStartDate) {
      if (profile.opt_type === 'STEM' || profile.is_stem_opt) {
        return 'stem_active';
      }
      
      // Check if applying for STEM extension
      if (optEndDate && this.daysBetween(now, optEndDate) <= 90 && profile.is_stem) {
        return 'stem_application';
      }
      
      return 'opt_active';
    }

    // H1B or other status changes
    if (visaType === 'H1B' || profile.h1b_petition_filed) {
      return 'status_change';
    }

    // Default to general
    return 'general';
  }

  /**
   * Normalize visa type from database format
   */
  private normalizeVisaType(visaType: string | null): VisaType {
    if (!visaType) return 'F1';
    
    const normalized = visaType.toUpperCase();
    switch (normalized) {
      case 'F1':
      case 'F-1':
        return 'F1';
      case 'J1':
      case 'J-1':
        return 'J1';
      case 'H1B':
      case 'H-1B':
        return 'H1B';
      case 'OPT':
        return 'OPT';
      case 'STEM_OPT':
      case 'STEM OPT':
        return 'STEM_OPT';
      default:
        return 'Other';
    }
  }

  /**
   * Build document status map
   */
  private buildDocumentStatus(documents: any[]): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    // Check for common document types
    const documentTypes = ['passport', 'visa', 'i20', 'ead', 'i983', 'i797'];
    
    for (const docType of documentTypes) {
      const hasValidDoc = documents.some(doc => 
        doc.category?.toLowerCase().includes(docType) && 
        doc.status !== 'expired' && 
        doc.status !== 'rejected'
      );
      status[`${docType}Valid`] = hasValidDoc;
    }
    
    return status;
  }

  /**
   * Calculate maximum unemployment days allowed
   */
  private calculateMaxUnemploymentDays(visaType: string | null, isSTEM: boolean | null): number {
    if (visaType === 'OPT') {
      return isSTEM ? 150 : 90; // STEM OPT allows 150 days, regular OPT allows 90
    }
    return 0;
  }

  /**
   * Calculate risk score based on profile and compliance data
   */
  private calculateRiskScore(profile: any, tasks: any[], documents: any[]): number {
    let riskScore = 0;
    
    // Overdue tasks increase risk
    const overdueTasks = tasks.filter(t => !t.is_completed && new Date(t.due_date || '') < new Date());
    riskScore += overdueTasks.length * 10;
    
    // Expired documents increase risk
    const expiredDocs = documents.filter(d => d.status === 'expired');
    riskScore += expiredDocs.length * 15;
    
    // High unemployment days increase risk
    const unemploymentDays = profile.unemployment_days ? parseInt(profile.unemployment_days, 10) : 0;
    const maxDays = this.calculateMaxUnemploymentDays(profile.visa_type, profile.is_stem);
    if (maxDays > 0) {
      const unemploymentRatio = unemploymentDays / maxDays;
      riskScore += Math.floor(unemploymentRatio * 50);
    }
    
    // Passport expiring soon increases risk
    const passportExpiry = this.parseDate(profile.passport_expiry_date);
    if (passportExpiry && this.daysBetween(new Date(), passportExpiry) < 180) {
      riskScore += 20;
    }
    
    // Cap at 100
    return Math.min(riskScore, 100);
  }

  /**
   * Check if address change is recent (within 30 days)
   */
  private isAddressChangeRecent(lastMovedDate: string | null): boolean {
    if (!lastMovedDate) return false;
    
    const moveDate = this.parseDate(lastMovedDate);
    if (!moveDate) return false;
    
    return this.daysBetween(moveDate, new Date()) <= 30;
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateString: string | null): Date | undefined {
    if (!dateString) return undefined;
    
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  /**
   * Calculate days between two dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
