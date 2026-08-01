/**
 * Location record shape used across the frontend for filtering and display.
 *
 * @type {DbLocation}
 * @property {string} slug - URL-safe location identifier.
 * @property {string} name - Display name for the location.
 */
export interface DbLocation {
  slug: string;
  name: string;
}

/**
 * Hardcoded locations used across the frontend for filtering and display.
 * Order here determines display order.
 */
export const LOCATIONS: DbLocation[] = [
  { slug: 'delhi', name: 'Delhi' },
  { slug: 'bihar', name: 'Bihar' },
  { slug: 'madhya-pradesh', name: 'Madhya Pradesh' },
  { slug: 'maharashtra', name: 'Maharashtra' },
  { slug: 'punjab', name: 'Punjab' },
  { slug: 'goa', name: 'Goa' },
  { slug: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
  { slug: 'andhra-pradesh', name: 'Andhra Pradesh' },
  { slug: 'assam', name: 'Assam' },
  { slug: 'chhattisgarh', name: 'Chhattisgarh' },
  { slug: 'gujarat', name: 'Gujarat' },
  { slug: 'haryana', name: 'Haryana' },
  { slug: 'himachal-pradesh', name: 'Himachal Pradesh' },
  { slug: 'jharkhand', name: 'Jharkhand' },
  { slug: 'karnataka', name: 'Karnataka' },
  { slug: 'kerala', name: 'Kerala' },
  { slug: 'manipur', name: 'Manipur' },
  { slug: 'meghalaya', name: 'Meghalaya' },
  { slug: 'mizoram', name: 'Mizoram' },
  { slug: 'nagaland', name: 'Nagaland' },
  { slug: 'odisha', name: 'Odisha' },
  { slug: 'rajasthan', name: 'Rajasthan' },
  { slug: 'sikkim', name: 'Sikkim' },
  { slug: 'tamil-nadu', name: 'Tamil Nadu' },
  { slug: 'telangana', name: 'Telangana' },
  { slug: 'tripura', name: 'Tripura' },
  { slug: 'uttar-pradesh', name: 'Uttar Pradesh' },
  { slug: 'uttarakhand', name: 'Uttarakhand' },
  { slug: 'west-bengal', name: 'West Bengal' },
  { slug: 'chandigarh', name: 'Chandigarh' },
  { slug: 'jammu-kashmir', name: 'Jammu and Kashmir' },
  { slug: 'ladakh', name: 'Ladakh' },
  { slug: 'lakshadweep', name: 'Lakshadweep' },
  { slug: 'puducherry', name: 'Puducherry' },
  { slug: 'foreign', name: 'Foreign (Outside India)' },
];
