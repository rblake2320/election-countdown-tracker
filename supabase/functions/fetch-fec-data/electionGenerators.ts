
import { ElectionData, CandidateData } from './types.ts';
import { SENATE_STATES_2026, GOVERNOR_STATES_2025, GOVERNOR_STATES_2026, MAJOR_CITIES } from './constants.ts';
import { getHouseDistricts } from './districtData.ts';

export const generateFederalElections = (state: string): ElectionData[] => {
  const elections: ElectionData[] = [];

  // U.S. Senate elections (2026 midterms)
  if (SENATE_STATES_2026.includes(state)) {
    elections.push({
      office_level: 'Federal',
      office_name: `U.S. Senate - ${state}`,
      state: state,
      election_dt: new Date('2026-11-03T20:00:00Z').toISOString(),
      is_special: false,
      description: `U.S. Senate election for ${state}`
    });
  }

  // U.S. House elections
  const houseDistricts = getHouseDistricts(state);
  for (let i = 1; i <= houseDistricts; i++) {
    elections.push({
      office_level: 'Federal',
      office_name: `U.S. House - ${state} District ${i}`,
      state: state,
      election_dt: new Date('2026-11-03T20:00:00Z').toISOString(),
      is_special: false,
      description: `U.S. House election for ${state} District ${i}`
    });
  }

  return elections;
};

export const generateStateElections = (state: string): ElectionData[] => {
  const elections: ElectionData[] = [];

  // Governor elections
  if (GOVERNOR_STATES_2025.includes(state)) {
    elections.push({
      office_level: 'State',
      office_name: `Governor - ${state}`,
      state: state,
      election_dt: new Date('2025-11-04T20:00:00Z').toISOString(),
      is_special: false,
      description: `Gubernatorial election for ${state}`
    });
  }

  if (GOVERNOR_STATES_2026.includes(state)) {
    elections.push({
      office_level: 'State',
      office_name: `Governor - ${state}`,
      state: state,
      election_dt: new Date('2026-11-03T20:00:00Z').toISOString(),
      is_special: false,
      description: `Gubernatorial election for ${state}`
    });
  }

  // State Legislature elections
  elections.push({
    office_level: 'State',
    office_name: `State Senate - ${state}`,
    state: state,
    election_dt: new Date('2026-11-03T20:00:00Z').toISOString(),
    is_special: false,
    description: `State Senate elections for ${state}`
  });

  elections.push({
    office_level: 'State',
    office_name: `State House - ${state}`,
    state: state,
    election_dt: new Date('2026-11-03T20:00:00Z').toISOString(),
    is_special: false,
    description: `State House elections for ${state}`
  });

  return elections;
};

export const generateLocalElections = (state: string): ElectionData[] => {
  const elections: ElectionData[] = [];

  if (MAJOR_CITIES[state as keyof typeof MAJOR_CITIES]) {
    MAJOR_CITIES[state as keyof typeof MAJOR_CITIES].forEach(city => {
      elections.push({
        office_level: 'Local',
        office_name: `Mayor - ${city}, ${state}`,
        state: state,
        election_dt: new Date('2025-11-04T20:00:00Z').toISOString(),
        is_special: false,
        description: `Mayoral election for ${city}, ${state}`
      });

      elections.push({
        office_level: 'Local',
        office_name: `City Council - ${city}, ${state}`,
        state: state,
        election_dt: new Date('2025-11-04T20:00:00Z').toISOString(),
        is_special: false,
        description: `City Council elections for ${city}, ${state}`
      });
    });
  } else {
    // At least one local election per state
    elections.push({
      office_level: 'Local',
      office_name: `County Commissioner - ${state}`,
      state: state,
      election_dt: new Date('2025-11-04T20:00:00Z').toISOString(),
      is_special: false,
      description: `County elections for ${state}`
    });
  }

  return elections;
};

export const generateCandidates = (elections: ElectionData[]): CandidateData[] => {
  const candidates: CandidateData[] = [];
  const candidateElections = elections.slice(0, 50); // Add candidates to first 50 elections

  for (const election of candidateElections) {
    if (election.office_level === 'Federal') {
      candidates.push(
        {
          election_id: election.id,
          name: 'Democratic Nominee',
          party: 'Democratic',
          incumbent: false,
          poll_pct: 48 + Math.random() * 10,
          intent_pct: 45 + Math.random() * 10
        },
        {
          election_id: election.id,
          name: 'Republican Nominee',
          party: 'Republican',
          incumbent: Math.random() > 0.7,
          poll_pct: 47 + Math.random() * 10,
          intent_pct: 44 + Math.random() * 10
        }
      );
    }
  }

  return candidates;
};
