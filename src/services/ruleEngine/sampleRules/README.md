# Smart Compliance Rule Definitions

This directory contains sample rule definitions that demonstrate the intelligent, contextual compliance guidance system. These rules showcase how the engine provides personalized, phase-aware compliance tasks with smart dates and dependencies.

## 🎯 **Rule Philosophy**

Instead of generic checklists, our rules provide:
- **Contextual Intelligence**: "Your passport expires in 3 months - renew now to maintain F1 status"
- **Smart Timing**: "Apply for OPT between March 15 and June 15 (90 days before graduation)"
- **Personalized Guidance**: "Submit STEM OPT extension 90 days before your current OPT expires on May 1"
- **Proactive Warnings**: "You've used 65/90 unemployment days - find work within 25 days"

## 📁 **Rule Files**

### **F1 Student Rules** (`f1-student-rules.json`)
Core compliance rules for F1 students during their academic program:
- **Passport renewal urgency** with F1 status implications
- **I-20 travel signature** requirements
- **Address change reporting** to SEVIS
- **Course load maintenance** for status compliance
- **OPT application window** timing
- **DSO consultation** scheduling
- **STEM eligibility** verification

### **OPT Rules** (`opt-rules.json`)
Specialized rules for Optional Practical Training period:
- **Unemployment tracking** with 90-day limit monitoring
- **Employment reporting** within 10 days
- **SEVP Portal** address updates
- **Travel preparation** with document requirements
- **EAD renewal** and STEM extension planning
- **Field relationship** verification
- **Tax obligations** awareness

### **STEM OPT Rules** (`stem-opt-rules.json`)
Advanced rules for STEM OPT extension with enhanced requirements:
- **Application window** with 90-day deadline
- **E-Verify verification** for employer compliance
- **I-983 training plan** completion
- **12-month self-evaluation** mandatory reporting
- **Employer evaluations** every 6 months
- **150-day unemployment** limit tracking
- **Final comprehensive evaluation** at completion

## 🏗️ **Rule Structure**

### **Rule Definition Schema**
```json
{
  "id": "unique-rule-identifier",
  "name": "Human-readable rule name",
  "description": "Detailed rule purpose",
  "ruleGroup": "documents|employment|reporting|travel|academic",
  "phase": ["during_program", "opt_active", "stem_active"],
  "visaTypes": ["F1", "OPT", "STEM_OPT"],
  "priority": 95,
  "conditions": [
    {
      "field": "user.context.field.path",
      "operator": "lessThan|equals|greaterThan|exists",
      "value": "comparison_value",
      "timeValue": "6months|90days|1year",
      "logicOperator": "AND|OR"
    }
  ],
  "taskTemplate": {
    "titleTemplate": "Task title with {placeholders}",
    "descriptionTemplate": "Detailed guidance with {user.data} and {#calculations}",
    "category": "immigration|employment|reporting",
    "priority": "high|medium|low",
    "dueDateConfig": {
      "type": "calculated|relative|fixed|recurring",
      "calculation": "smart_date_function",
      "baseDate": "user.dates.field",
      "offset": "-90days|+30days"
    },
    "dependsOn": ["prerequisite-rule-id"]
  }
}
```

## 🧠 **Intelligent Features**

### **1. Contextual Conditions**
Rules evaluate complex user context:
```json
{
  "field": "dates.passportExpiryDate",
  "operator": "lessThan",
  "timeValue": "6months"
}
```

### **2. Template Placeholders**
Dynamic content generation:
- `{user.name}` - User's name
- `{dates.graduationDate}` - Formatted dates
- `{#days_until_expiry}` - Calculated values
- `{?condition:true_text:false_text}` - Conditional text

### **3. Smart Date Calculations**
Intelligent due date computation:
- `passport_renewal_urgent` - 6 months before expiry, urgent if past
- `opt_application_window` - 90 days before graduation
- `stem_extension_deadline` - 90 days before OPT expiry
- `address_update_deadline` - 10 days after moving

### **4. Phase Awareness**
Rules activate based on user's visa journey phase:
- `pre_arrival` - Before entering US
- `during_program` - Active F1 status
- `pre_graduation` - 90 days before graduation
- `opt_active` - On Optional Practical Training
- `stem_active` - On STEM OPT extension

### **5. Dependency Management**
Tasks can depend on prerequisites:
```json
{
  "dependsOn": ["f1-meet-dso-opt"],
  "description": "Complete DSO meeting before applying for OPT"
}
```

## 🎨 **Template System**

### **Placeholder Types**

#### **User Data Placeholders**
- `{user.name}` - Student name
- `{user.academic.university}` - University name
- `{user.employment.employer}` - Current employer
- `{user.visaType}` - Visa classification

#### **Date Placeholders**
- `{dates.graduationDate}` - Formatted graduation date
- `{dates.optEndDate}` - OPT expiration date
- `{dates.passportExpiryDate}` - Passport expiry

#### **Calculated Placeholders**
- `{#days_until_graduation}` - Days until graduation
- `{#unemployment_days_remaining}` - Remaining unemployment days
- `{#address_update_deadline}` - Calculated deadline

#### **Conditional Placeholders**
- `{?academic.isSTEM:STEM eligible:Check STEM list}` - Conditional text
- `{?employment.status == 'employed':Currently employed:Job search needed}` - Complex conditions

## 🎯 **Real-World Examples**

### **Passport Renewal Rule**
**Trigger**: Passport expires within 6 months
**Generated Task**: 
> "🚨 Renew Passport - F1 Status at Risk
> 
> Your passport expires on March 15, 2025 (87 days). Renew immediately to maintain F1 status.
> 
> ⚠️ **Critical**: Passports must be valid for 6+ months for:
> • Travel authorization
> • I-20 renewals  
> • Status maintenance
> • Future visa applications"

### **OPT Application Rule**
**Trigger**: 90 days before graduation, no OPT application
**Generated Task**:
> "🎓 OPT Application Window Now Open
> 
> You graduate on May 15, 2025 (78 days). Your OPT application window is now open!
> 
> 📅 **Application Window**:
> • **Opens**: 90 days before graduation
> • **Closes**: 60 days after graduation  
> • **Recommended**: Apply ASAP for maximum work time"

### **STEM Extension Rule**
**Trigger**: OPT expires in 90 days, STEM eligible, no application
**Generated Task**:
> "🚀 STEM OPT Application Window Open - Apply Now!
> 
> Your OPT expires on August 1, 2025 (89 days). Apply for STEM extension immediately!
> 
> ⏰ **Critical Timeline**:
> • **OPT Expires**: August 1, 2025
> • **Processing Time**: 3-5 months typical
> • **Gap Risk**: Apply NOW to avoid work authorization gap"

## 🔄 **Rule Lifecycle**

### **Development Process**
1. **Identify Compliance Requirement** - Research regulation
2. **Define Trigger Conditions** - When rule should activate
3. **Create Task Template** - User-facing guidance
4. **Set Smart Dates** - Calculate optimal timing
5. **Add Dependencies** - Link prerequisite tasks
6. **Test with Sample Data** - Validate rule behavior
7. **Refine Based on Feedback** - Improve guidance quality

### **Rule Validation**
- **Condition Logic** - Verify triggers work correctly
- **Template Rendering** - Ensure placeholders resolve
- **Date Calculations** - Validate timing accuracy
- **Dependency Chains** - Check prerequisite ordering
- **User Experience** - Review guidance clarity

## 🚀 **Integration Notes**

These sample rules demonstrate the structure and capabilities of the smart compliance system. They will be loaded by the RuleLoader service and processed by the RuleEngine to generate personalized, intelligent compliance guidance.

The rules showcase how the system transforms generic compliance requirements into contextual, actionable guidance that adapts to each user's unique situation and timing needs.
