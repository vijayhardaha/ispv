/**
 * Location record shape.
 */
export interface LocationRecord {
  id: string;
  slug: string;
  name: string;
}

/**
 * Hardcoded locations used across the admin for filtering and display.
 * Order here determines display order.
 */
export const LOCATIONS: LocationRecord[] = [
  { id: '1', slug: 'delhi', name: 'Delhi' },
  { id: '2', slug: 'bihar', name: 'Bihar' },
  { id: '3', slug: 'madhya-pradesh', name: 'Madhya Pradesh' },
  { id: '4', slug: 'maharashtra', name: 'Maharashtra' },
  { id: '5', slug: 'punjab', name: 'Punjab' },
  { id: '6', slug: 'goa', name: 'Goa' },
  { id: '7', slug: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
  { id: '8', slug: 'andhra-pradesh', name: 'Andhra Pradesh' },
  { id: '9', slug: 'assam', name: 'Assam' },
  { id: '10', slug: 'chhattisgarh', name: 'Chhattisgarh' },
  { id: '11', slug: 'gujarat', name: 'Gujarat' },
  { id: '12', slug: 'haryana', name: 'Haryana' },
  { id: '13', slug: 'himachal-pradesh', name: 'Himachal Pradesh' },
  { id: '14', slug: 'jharkhand', name: 'Jharkhand' },
  { id: '15', slug: 'karnataka', name: 'Karnataka' },
  { id: '16', slug: 'kerala', name: 'Kerala' },
  { id: '17', slug: 'manipur', name: 'Manipur' },
  { id: '18', slug: 'meghalaya', name: 'Meghalaya' },
  { id: '19', slug: 'mizoram', name: 'Mizoram' },
  { id: '20', slug: 'nagaland', name: 'Nagaland' },
  { id: '21', slug: 'odisha', name: 'Odisha' },
  { id: '22', slug: 'rajasthan', name: 'Rajasthan' },
  { id: '23', slug: 'sikkim', name: 'Sikkim' },
  { id: '24', slug: 'tamil-nadu', name: 'Tamil Nadu' },
  { id: '25', slug: 'telangana', name: 'Telangana' },
  { id: '26', slug: 'tripura', name: 'Tripura' },
  { id: '27', slug: 'uttar-pradesh', name: 'Uttar Pradesh' },
  { id: '28', slug: 'uttarakhand', name: 'Uttarakhand' },
  { id: '29', slug: 'west-bengal', name: 'West Bengal' },
  { id: '30', slug: 'chandigarh', name: 'Chandigarh' },
  { id: '31', slug: 'andaman-nicobar-islands', name: 'Andaman and Nicobar Islands' },
  { id: '32', slug: 'dadra-nagar-haveli-daman-diu', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { id: '33', slug: 'jammu-kashmir', name: 'Jammu and Kashmir' },
  { id: '34', slug: 'ladakh', name: 'Ladakh' },
  { id: '35', slug: 'lakshadweep', name: 'Lakshadweep' },
  { id: '36', slug: 'puducherry', name: 'Puducherry' },
  { id: '37', slug: 'foreign', name: 'Foreign (Outside India)' },
];
