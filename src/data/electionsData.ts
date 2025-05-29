
import { Election } from '@/types/election';

export const electionsData: Election[] = [
  {
    id: 'nj-primary-2025',
    title: 'New Jersey Gubernatorial Primary',
    date: '2025-06-10',
    type: 'Primary',
    state: 'New Jersey',
    description: 'Democratic and Republican primaries for Governor and General Assembly seats',
    candidates: [
      { name: 'Josh Gottheimer', party: 'Democratic', pollingPercentage: 35, trend: 'up', endorsements: 12 },
      { name: 'Steve Fulop', party: 'Democratic', pollingPercentage: 28, trend: 'stable', endorsements: 8 },
      { name: 'Ras Baraka', party: 'Democratic', pollingPercentage: 22, trend: 'down', endorsements: 6 },
      { name: 'Jack Ciattarelli', party: 'Republican', pollingPercentage: 45, trend: 'up', endorsements: 15 },
      { name: 'Jon Bramnick', party: 'Republican', pollingPercentage: 32, trend: 'stable', endorsements: 9 }
    ],
    keyRaces: ['Governor', 'General Assembly']
  },
  {
    id: 'va-primary-2025',
    title: 'Virginia Gubernatorial Primary',
    date: '2025-06-10',
    type: 'Primary',
    state: 'Virginia',
    description: 'Party primaries for Governor, Lieutenant Governor, Attorney General, and House of Delegates',
    candidates: [
      { name: 'Abigail Spanberger', party: 'Democratic', pollingPercentage: 41, trend: 'up', endorsements: 18 },
      { name: 'Eugene Vindman', party: 'Democratic', pollingPercentage: 29, trend: 'stable', endorsements: 11 },
      { name: 'Winsome Sears', party: 'Republican', pollingPercentage: 38, trend: 'up', endorsements: 14 },
      { name: 'Glenn Davis', party: 'Republican', pollingPercentage: 31, trend: 'down', endorsements: 8 }
    ],
    keyRaces: ['Governor', 'Lieutenant Governor', 'Attorney General']
  },
  {
    id: 'fl-special-2025',
    title: 'Florida Legislative Special Elections',
    date: '2025-06-10',
    type: 'Special',
    state: 'Florida',
    description: 'Special elections for State House Districts 3, 32 and State Senate District 19',
    candidates: [
      { name: 'Maria Rodriguez', party: 'Democratic', pollingPercentage: 47, trend: 'up', endorsements: 5 },
      { name: 'John Smith', party: 'Republican', pollingPercentage: 52, trend: 'stable', endorsements: 7 }
    ],
    keyRaces: ['House District 3', 'House District 32', 'Senate District 19']
  },
  {
    id: 'az-special-primary-2025',
    title: 'Arizona 7th District Special Primary',
    date: '2025-07-15',
    type: 'Primary',
    state: 'Arizona',
    description: 'Special primary for U.S. House Arizona District 7 to replace Rep. Raúl Grijalva',
    candidates: [
      { name: 'Adelita Grijalva', party: 'Democratic', pollingPercentage: 43, trend: 'up', endorsements: 15 },
      { name: 'Ruben Gallego Jr.', party: 'Democratic', pollingPercentage: 31, trend: 'stable', endorsements: 9 },
      { name: 'Mark Kelly', party: 'Republican', pollingPercentage: 38, trend: 'down', endorsements: 6 }
    ],
    keyRaces: ['U.S. House AZ-7']
  },
  {
    id: 'az-special-general-2025',
    title: 'Arizona 7th District Special Election',
    date: '2025-09-23',
    type: 'Special',
    state: 'Arizona',
    description: 'Special general election for U.S. House AZ-7',
    candidates: [
      { name: 'TBD Democratic Nominee', party: 'Democratic', pollingPercentage: 65, trend: 'stable', endorsements: 20 },
      { name: 'TBD Republican Nominee', party: 'Republican', pollingPercentage: 35, trend: 'stable', endorsements: 8 }
    ],
    keyRaces: ['U.S. House AZ-7']
  },
  {
    id: 'nj-general-2025',
    title: 'New Jersey General Election',
    date: '2025-11-04',
    type: 'General',
    state: 'New Jersey',
    description: 'Statewide general election for Governor, Lieutenant Governor, and General Assembly',
    candidates: [
      { name: 'Democratic Nominee TBD', party: 'Democratic', pollingPercentage: 48, trend: 'stable', endorsements: 25 },
      { name: 'Republican Nominee TBD', party: 'Republican', pollingPercentage: 45, trend: 'up', endorsements: 18 },
      { name: 'Independent Candidate', party: 'Independent', pollingPercentage: 4, trend: 'stable', endorsements: 1 }
    ],
    keyRaces: ['Governor', 'Lieutenant Governor', 'General Assembly']
  },
  {
    id: 'va-general-2025',
    title: 'Virginia General Election',
    date: '2025-11-04',
    type: 'General',
    state: 'Virginia',
    description: 'Statewide election for Governor, Lieutenant Governor, Attorney General, and House of Delegates',
    candidates: [
      { name: 'Democratic Nominee TBD', party: 'Democratic', pollingPercentage: 46, trend: 'down', endorsements: 22 },
      { name: 'Republican Nominee TBD', party: 'Republican', pollingPercentage: 49, trend: 'up', endorsements: 19 },
      { name: 'Libertarian Candidate', party: 'Libertarian', pollingPercentage: 3, trend: 'stable', endorsements: 0 }
    ],
    keyRaces: ['Governor', 'Lieutenant Governor', 'Attorney General']
  },
  {
    id: 'tx-special-2025',
    title: 'Texas 18th District Special Election',
    date: '2025-11-04',
    type: 'Special',
    state: 'Texas',
    description: 'Special election for U.S. House Texas District 18',
    candidates: [
      { name: 'Sheila Jackson Lee', party: 'Democratic', pollingPercentage: 72, trend: 'stable', endorsements: 28 },
      { name: 'Republican Challenger', party: 'Republican', pollingPercentage: 25, trend: 'stable', endorsements: 5 }
    ],
    keyRaces: ['U.S. House TX-18']
  },
  {
    id: 'super-tuesday-2026',
    title: 'Super Tuesday Primaries',
    date: '2026-03-03',
    type: 'Primary',
    state: 'Multiple States',
    description: 'Arkansas, North Carolina, and Texas hold primaries for federal and state offices',
    candidates: [
      { name: 'Various Candidates', party: 'Democratic', pollingPercentage: 50, trend: 'stable', endorsements: 100 },
      { name: 'Various Candidates', party: 'Republican', pollingPercentage: 48, trend: 'stable', endorsements: 95 }
    ],
    keyRaces: ['U.S. House', 'U.S. Senate', 'State Offices']
  },
  {
    id: 'midterm-2026',
    title: '2026 Midterm Elections',
    date: '2026-11-03',
    type: 'General',
    state: 'Nationwide',
    description: 'All 435 House seats, 35 Senate seats, 36 governors, and state/local elections',
    candidates: [
      { name: 'Democratic Candidates', party: 'Democratic', pollingPercentage: 47, trend: 'up', endorsements: 500 },
      { name: 'Republican Candidates', party: 'Republican', pollingPercentage: 46, trend: 'down', endorsements: 485 },
      { name: 'Independent/Third Party', party: 'Independent', pollingPercentage: 4, trend: 'stable', endorsements: 15 },
      { name: 'Green Party', party: 'Green', pollingPercentage: 2, trend: 'stable', endorsements: 8 },
      { name: 'Libertarian Party', party: 'Libertarian', pollingPercentage: 1, trend: 'stable', endorsements: 3 }
    ],
    keyRaces: ['U.S. House (435 seats)', 'U.S. Senate (35 seats)', 'Governors (36 states)', 'State Legislatures']
  },
  {
    id: 'ca-governor-primary-2026',
    title: 'California Governor Primary',
    date: '2026-06-02',
    type: 'Primary',
    state: 'California',
    description: 'Primary election for California Governor and other statewide offices',
    candidates: [
      { name: 'Lt. Gov. Eleni Kounalakis', party: 'Democratic', pollingPercentage: 32, trend: 'up', endorsements: 45 },
      { name: 'Attorney General Rob Bonta', party: 'Democratic', pollingPercentage: 28, trend: 'stable', endorsements: 38 },
      { name: 'Kevin Faulconer', party: 'Republican', pollingPercentage: 24, trend: 'up', endorsements: 22 },
      { name: 'John Cox', party: 'Republican', pollingPercentage: 16, trend: 'down', endorsements: 8 }
    ],
    keyRaces: ['Governor', 'Lt. Governor', 'Attorney General']
  }
];
