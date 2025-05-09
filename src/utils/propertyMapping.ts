/**
 * Utility functions to help with property name mappings between camelCase and snake_case
 * This helps us avoid TypeScript errors when accessing properties with different naming conventions.
 */

/**
 * Helper function to safely access properties that might have different naming conventions
 * @param obj The object to access properties from
 * @param camelCaseProp The camelCase property name
 * @param snakeCaseProp The snake_case property name
 * @returns The value of the property, or undefined if neither exists
 */
export function getProperty<T, K extends keyof T>(
  obj: T, 
  camelCaseProp: string, 
  snakeCaseProp: K
): T[K] | undefined {
  // If the object has the camelCase property, return it
  if (camelCaseProp in obj) {
    return obj[camelCaseProp as unknown as K];
  }
  
  // Otherwise return the snake_case property
  return obj[snakeCaseProp];
}

/**
 * Helper function to uniformly access common profile properties
 * regardless of whether they're in camelCase or snake_case
 */
export function getProfileProperty(profile: any, property: string): any {
  const snakeMapping: Record<string, string> = {
    visaType: 'visa_type',
    onboardingComplete: 'onboarding_complete',
    dateOfBirth: 'date_of_birth',
    usEntryDate: 'us_entry_date',
    courseStartDate: 'course_start_date',
    employmentStartDate: 'employment_start_date',
    passportExpiryDate: 'passport_expiry_date',
    degreeLevel: 'degree_level',
    fieldOfStudy: 'field_of_study'
  };

  // DSO specific mappings
  const dsoMapping: Record<string, string> = {
    officeLocation: 'office_location',
    officeHours: 'office_hours',
    contactEmail: 'contact_email',
    contactPhone: 'contact_phone'
  };

  const allMappings = { ...snakeMapping, ...dsoMapping };
  
  // Check for both camelCase and snake_case versions
  const snakeVersion = allMappings[property];
  if (snakeVersion && snakeVersion in profile) {
    return profile[snakeVersion];
  }
  
  // Return the original property if it exists
  if (property in profile) {
    return profile[property];
  }
  
  return undefined;
}
