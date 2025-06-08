
export const getHouseDistricts = (state: string): number => {
  const districtMap: Record<string, number> = {
    'CA': 52, 'TX': 38, 'FL': 28, 'NY': 26, 'PA': 17, 'IL': 17,
    'OH': 15, 'GA': 14, 'NC': 14, 'MI': 13, 'NJ': 12, 'VA': 11,
    'WA': 10, 'IN': 9, 'AZ': 9, 'TN': 9, 'MA': 9, 'MD': 8,
    'MN': 8, 'MO': 8, 'WI': 8, 'CO': 8, 'AL': 7, 'SC': 7,
    'LA': 6, 'KY': 6, 'OR': 6, 'OK': 5, 'CT': 5, 'IA': 4,
    'AR': 4, 'KS': 4, 'UT': 4, 'NV': 4, 'NM': 3, 'WV': 2,
    'NE': 3, 'ID': 2, 'NH': 2, 'ME': 2, 'HI': 2, 'RI': 2,
    'MT': 2, 'DE': 1, 'SD': 1, 'ND': 1, 'AK': 1, 'VT': 1,
    'WY': 1, 'DC': 1
  };
  
  return districtMap[state] || 1;
};
