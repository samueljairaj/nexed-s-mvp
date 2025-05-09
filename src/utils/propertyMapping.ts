
// This file contains utility functions for mapping properties from user profiles

/**
 * Gets a property from a user profile object with null safety
 * @param profile The user profile object
 * @param property The property to get
 * @returns The property value or undefined if not found
 */
export function getProfileProperty(profile: any, property: string): any {
  if (!profile) return undefined;
  
  // Handle nested properties with dot notation
  if (property.includes('.')) {
    const parts = property.split('.');
    let value = profile;
    
    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }
    
    return value;
  }
  
  return profile[property];
}

/**
 * Sets a property on a user profile object
 * @param profile The user profile object
 * @param property The property to set
 * @param value The value to set
 * @returns A new object with the property set
 */
export function setProfileProperty(profile: any, property: string, value: any): any {
  if (!profile) return { [property]: value };
  
  // Handle nested properties with dot notation
  if (property.includes('.')) {
    const parts = property.split('.');
    const result = { ...profile };
    let current = result;
    
    // Navigate to the deepest level
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    
    // Set the value at the deepest level
    current[parts[parts.length - 1]] = value;
    return result;
  }
  
  return { ...profile, [property]: value };
}

/**
 * Checks if a user is a DSO based on their profile
 * @param profile The user profile object
 * @returns Boolean indicating if the user is a DSO
 */
export function isDSOUser(profile: any): boolean {
  if (!profile) return false;
  return profile.role === 'dso';
}

/**
 * Debug function to log the user profile and authentication state
 * @param profile The user profile object
 */
export function debugAuthState(profile: any): void {
  console.log("DEBUG - Auth State:", {
    profile: profile,
    role: profile?.role,
    isDSO: profile?.role === 'dso',
    onboardingComplete: profile?.onboarding_complete
  });
}
