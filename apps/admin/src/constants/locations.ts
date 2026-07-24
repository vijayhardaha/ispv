/**
 * A single location entry used across the admin for filtering and display.
 *
 * @type {LocationRecord}
 * @property {string} slug - URL-friendly slug derived from the location name.
 * @property {string} name - Human-readable location name.
 */
export interface LocationRecord {
  slug: string;
  name: string;
}

/**
 * Hardcoded locations used across the admin for filtering and display.
 * Order here determines display order.
 */
export const LOCATIONS: LocationRecord[] = [
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
  { slug: 'andaman-nicobar-islands', name: 'Andaman and Nicobar Islands' },
  { slug: 'dadra-nagar-haveli-daman-diu', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { slug: 'jammu-kashmir', name: 'Jammu and Kashmir' },
  { slug: 'ladakh', name: 'Ladakh' },
  { slug: 'lakshadweep', name: 'Lakshadweep' },
  { slug: 'puducherry', name: 'Puducherry' },
  { slug: 'foreign', name: 'Foreign (Outside India)' },
];
