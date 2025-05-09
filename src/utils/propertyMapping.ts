
/**
 * Get a property from a profile object, handling possible missing values.
 * This function safely accesses profile properties, including those in the "meta" object.
 * 
 * @param profile The profile object or null/undefined
 * @param property The property name to retrieve
 * @returns The property value or undefined if not found or profile is null
 */
export function getProfileProperty<T extends object>(profile: T | null | undefined, property: string): any {
  if (!profile) return undefined;
  
  // Direct property access
  if (property in profile) {
    return (profile as any)[property];
  }
  
  // Check in a meta property if it exists
  if ('meta' in profile && profile.meta && typeof profile.meta === 'object') {
    if (property in profile.meta) {
      return (profile.meta as any)[property];
    }
  }
  
  // Check in a raw_user_meta_data property if it exists
  if ('raw_user_meta_data' in profile && profile.raw_user_meta_data && typeof profile.raw_user_meta_data === 'object') {
    if (property in profile.raw_user_meta_data) {
      return (profile.raw_user_meta_data as any)[property];
    }
  }
  
  return undefined;
}
