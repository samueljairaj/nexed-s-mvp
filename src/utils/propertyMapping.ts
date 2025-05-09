
// This file contains utility functions for mapping properties from user profiles

/**
 * Gets a property from a user profile object with null safety
 * @param profile The user profile object
 * @param property The property to get
 * @returns The property value or undefined if not found
 */
export function getProfileProperty(profile: any, property: string): any {
  if (!profile) return undefined;
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
  return { ...profile, [property]: value };
}
