/**
 * Location record shape.
 */
export interface DbLocation {
  id: string;
  value: string;
  name: string;
  description: string | null;
}

export const LOCATIONS: DbLocation[] = [
  { id: '1', value: 'delhi', name: 'Delhi', description: null },
  { id: '2', value: 'bihar', name: 'Bihar', description: null },
  { id: '3', value: 'madhya-pradesh', name: 'Madhya Pradesh', description: null },
  { id: '4', value: 'maharashtra', name: 'Maharashtra', description: null },
  { id: '5', value: 'punjab', name: 'Punjab', description: null },
  { id: '6', value: 'goa', name: 'Goa', description: null },
  { id: '7', value: 'arunachal-pradesh', name: 'Arunachal Pradesh', description: null },
  { id: '8', value: 'andhra-pradesh', name: 'Andhra Pradesh', description: null },
  { id: '9', value: 'assam', name: 'Assam', description: null },
  { id: '10', value: 'chhattisgarh', name: 'Chhattisgarh', description: null },
  { id: '11', value: 'gujarat', name: 'Gujarat', description: null },
  { id: '12', value: 'haryana', name: 'Haryana', description: null },
  { id: '13', value: 'himachal-pradesh', name: 'Himachal Pradesh', description: null },
  { id: '14', value: 'jharkhand', name: 'Jharkhand', description: null },
  { id: '15', value: 'karnataka', name: 'Karnataka', description: null },
  { id: '16', value: 'kerala', name: 'Kerala', description: null },
  { id: '17', value: 'manipur', name: 'Manipur', description: null },
  { id: '18', value: 'meghalaya', name: 'Meghalaya', description: null },
  { id: '19', value: 'mizoram', name: 'Mizoram', description: null },
  { id: '20', value: 'nagaland', name: 'Nagaland', description: null },
  { id: '21', value: 'odisha', name: 'Odisha', description: null },
  { id: '22', value: 'rajasthan', name: 'Rajasthan', description: null },
  { id: '23', value: 'sikkim', name: 'Sikkim', description: null },
  { id: '24', value: 'tamil-nadu', name: 'Tamil Nadu', description: null },
  { id: '25', value: 'telangana', name: 'Telangana', description: null },
  { id: '26', value: 'tripura', name: 'Tripura', description: null },
  { id: '27', value: 'uttar-pradesh', name: 'Uttar Pradesh', description: null },
  { id: '28', value: 'uttarakhand', name: 'Uttarakhand', description: null },
  { id: '29', value: 'west-bengal', name: 'West Bengal', description: null },
  { id: '30', value: 'chandigarh', name: 'Chandigarh', description: null },
  { id: '31', value: 'andaman-nicobar-islands', name: 'Andaman and Nicobar Islands', description: null },
  {
    id: '32',
    value: 'dadra-nagar-haveli-daman-diu',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    description: null,
  },
  { id: '33', value: 'jammu-kashmir', name: 'Jammu and Kashmir', description: null },
  { id: '34', value: 'ladakh', name: 'Ladakh', description: null },
  { id: '35', value: 'lakshadweep', name: 'Lakshadweep', description: null },
  { id: '36', value: 'puducherry', name: 'Puducherry', description: null },
  { id: '37', value: 'foreign', name: 'Foreign (Outside India)', description: null },
];
