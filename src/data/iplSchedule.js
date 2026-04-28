// IPL 2025 Schedule — Static data with team colors & match status
// Status: 'completed' | 'live' | 'upcoming'

export const TEAM_INFO = {
  RCB:  { name: 'Royal Challengers Bengaluru', short: 'RCB',  color: '#EC1C24', bg: 'rgba(236,28,36,0.12)',  flag: '🔴' },
  MI:   { name: 'Mumbai Indians',              short: 'MI',   color: '#005DA0', bg: 'rgba(0,93,160,0.12)',   flag: '🔵' },
  CSK:  { name: 'Chennai Super Kings',         short: 'CSK',  color: '#F7B926', bg: 'rgba(247,185,38,0.12)', flag: '🟡' },
  KKR:  { name: 'Kolkata Knight Riders',       short: 'KKR',  color: '#8B6FC6', bg: 'rgba(139,111,198,0.12)',flag: '🟣' },
  SRH:  { name: 'Sunrisers Hyderabad',         short: 'SRH',  color: '#F7A825', bg: 'rgba(247,168,37,0.12)', flag: '🟠' },
  RR:   { name: 'Rajasthan Royals',            short: 'RR',   color: '#EA1A8C', bg: 'rgba(234,26,140,0.12)', flag: '🩷' },
  DC:   { name: 'Delhi Capitals',              short: 'DC',   color: '#0078BC', bg: 'rgba(0,120,188,0.12)',  flag: '🔷' },
  PBKS: { name: 'Punjab Kings',               short: 'PBKS', color: '#ED1B24', bg: 'rgba(237,27,36,0.12)',  flag: '❤️' },
  LSG:  { name: 'Lucknow Super Giants',        short: 'LSG',  color: '#29AFCE', bg: 'rgba(41,175,206,0.12)', flag: '🩵' },
  GT:   { name: 'Gujarat Titans',              short: 'GT',   color: '#1DA1A0', bg: 'rgba(29,161,160,0.12)', flag: '🟢' },
};

export const IPL_2025_MATCHES = [
  // ── Completed ──
  { id: 1,  home: 'KKR',  away: 'RCB',  date: 'Mar 22', time: '7:30 PM', venue: 'Eden Gardens, Kolkata',        status: 'completed', winner: 'RCB',  score: { home: '174/8', away: '175/4' } },
  { id: 2,  home: 'SRH',  away: 'RR',   date: 'Mar 23', time: '3:30 PM', venue: 'Rajiv Gandhi Stadium, Hyd',    status: 'completed', winner: 'SRH',  score: { home: '186/5', away: '145/10'} },
  { id: 3,  home: 'CSK',  away: 'MI',   date: 'Mar 23', time: '7:30 PM', venue: 'MA Chidambaram, Chennai',      status: 'completed', winner: 'CSK',  score: { home: '167/6', away: '163/8' } },
  { id: 4,  home: 'DC',   away: 'LSG',  date: 'Mar 24', time: '7:30 PM', venue: 'Arun Jaitley Stadium, Delhi',  status: 'completed', winner: 'DC',   score: { home: '198/4', away: '155/10'} },
  { id: 5,  home: 'GT',   away: 'PBKS', date: 'Mar 25', time: '7:30 PM', venue: 'Narendra Modi Stadium, Ahd',   status: 'completed', winner: 'PBKS', score: { home: '143/8', away: '144/3' } },
  { id: 6,  home: 'RR',   away: 'MI',   date: 'Mar 29', time: '7:30 PM', venue: 'Sawai Mansingh, Jaipur',       status: 'completed', winner: 'MI',   score: { home: '161/8', away: '164/5' } },
  { id: 7,  home: 'RCB',  away: 'SRH',  date: 'Mar 31', time: '7:30 PM', venue: 'M. Chinnaswamy, Bangalore',    status: 'completed', winner: 'RCB',  score: { home: '202/4', away: '197/9' } },
  { id: 8,  home: 'CSK',  away: 'KKR',  date: 'Apr 1',  time: '7:30 PM', venue: 'MA Chidambaram, Chennai',      status: 'completed', winner: 'KKR',  score: { home: '152/8', away: '155/6' } },
  { id: 9,  home: 'MI',   away: 'DC',   date: 'Apr 3',  time: '7:30 PM', venue: 'Wankhede Stadium, Mumbai',     status: 'completed', winner: 'DC',   score: { home: '158/7', away: '161/4' } },
  { id: 10, home: 'PBKS', away: 'LSG',  date: 'Apr 5',  time: '7:30 PM', venue: 'Mullanpur, Mohali',            status: 'completed', winner: 'PBKS', score: { home: '178/5', away: '160/8' } },
  { id: 11, home: 'GT',   away: 'RR',   date: 'Apr 6',  time: '3:30 PM', venue: 'Narendra Modi Stadium, Ahd',   status: 'completed', winner: 'RR',   score: { home: '166/9', away: '170/6' } },
  { id: 12, home: 'SRH',  away: 'KKR',  date: 'Apr 7',  time: '7:30 PM', venue: 'Rajiv Gandhi Stadium, Hyd',    status: 'completed', winner: 'KKR',  score: { home: '159/8', away: '162/3' } },
  { id: 13, home: 'RCB',  away: 'CSK',  date: 'Apr 12', time: '7:30 PM', venue: 'M. Chinnaswamy, Bangalore',    status: 'completed', winner: 'RCB',  score: { home: '213/3', away: '202/8' } },
  { id: 14, home: 'MI',   away: 'PBKS', date: 'Apr 13', time: '3:30 PM', venue: 'Wankhede Stadium, Mumbai',     status: 'completed', winner: 'PBKS', score: { home: '169/7', away: '171/5' } },
  { id: 15, home: 'LSG',  away: 'GT',   date: 'Apr 14', time: '7:30 PM', venue: 'Ekana Cricket Stadium, Luck',  status: 'completed', winner: 'GT',   score: { home: '145/10','away': '146/4'} },
  { id: 16, home: 'DC',   away: 'RR',   date: 'Apr 15', time: '7:30 PM', venue: 'Arun Jaitley Stadium, Delhi',  status: 'completed', winner: 'RR',   score: { home: '177/6', away: '179/5' } },
  { id: 17, home: 'KKR',  away: 'MI',   date: 'Apr 17', time: '7:30 PM', venue: 'Eden Gardens, Kolkata',        status: 'completed', winner: 'KKR',  score: { home: '180/5', away: '168/9' } },
  { id: 18, home: 'SRH',  away: 'RCB',  date: 'Apr 19', time: '7:30 PM', venue: 'Rajiv Gandhi Stadium, Hyd',    status: 'completed', winner: 'RCB',  score: { home: '176/7', away: '177/3' } },

  // ── Live (today, Apr 21) ──
  { id: 19, home: 'CSK',  away: 'GT',   date: 'Apr 21', time: '7:30 PM', venue: 'MA Chidambaram, Chennai',      status: 'live',      liveScore: { home: '84/3 (11.2)', away: 'Yet to bat' } },

  // ── Upcoming ──
  { id: 20, home: 'PBKS', away: 'DC',   date: 'Apr 22', time: '7:30 PM', venue: 'Mullanpur, Mohali',            status: 'upcoming' },
  { id: 21, home: 'RR',   away: 'KKR',  date: 'Apr 23', time: '7:30 PM', venue: 'Sawai Mansingh, Jaipur',       status: 'upcoming' },
  { id: 22, home: 'MI',   away: 'LSG',  date: 'Apr 24', time: '7:30 PM', venue: 'Wankhede Stadium, Mumbai',     status: 'upcoming' },
  { id: 23, home: 'GT',   away: 'SRH',  date: 'Apr 25', time: '7:30 PM', venue: 'Narendra Modi Stadium, Ahd',   status: 'upcoming' },
  { id: 24, home: 'RCB',  away: 'DC',   date: 'Apr 26', time: '7:30 PM', venue: 'M. Chinnaswamy, Bangalore',    status: 'upcoming' },
  { id: 25, home: 'CSK',  away: 'RR',   date: 'Apr 27', time: '3:30 PM', venue: 'MA Chidambaram, Chennai',      status: 'upcoming' },
  { id: 26, home: 'KKR',  away: 'PBKS', date: 'Apr 27', time: '7:30 PM', venue: 'Eden Gardens, Kolkata',        status: 'upcoming' },
  { id: 27, home: 'MI',   away: 'GT',   date: 'Apr 29', time: '7:30 PM', venue: 'Wankhede Stadium, Mumbai',     status: 'upcoming' },
  { id: 28, home: 'SRH',  away: 'LSG',  date: 'Apr 30', time: '7:30 PM', venue: 'Rajiv Gandhi Stadium, Hyd',    status: 'upcoming' },
];

// Points table for 2025 (simplified)
export const IPL_2025_POINTS = [
  { team: 'RCB',  p: 7, w: 6, l: 1, pts: 12, nrr: '+1.24' },
  { team: 'PBKS', p: 7, w: 5, l: 2, pts: 10, nrr: '+0.88' },
  { team: 'DC',   p: 7, w: 5, l: 2, pts: 10, nrr: '+0.54' },
  { team: 'KKR',  p: 7, w: 4, l: 3, pts: 8,  nrr: '+0.32' },
  { team: 'MI',   p: 7, w: 3, l: 4, pts: 6,  nrr: '-0.12' },
  { team: 'RR',   p: 7, w: 3, l: 4, pts: 6,  nrr: '-0.21' },
  { team: 'GT',   p: 6, w: 2, l: 4, pts: 4,  nrr: '-0.44' },
  { team: 'SRH',  p: 7, w: 2, l: 5, pts: 4,  nrr: '-0.67' },
  { team: 'CSK',  p: 6, w: 2, l: 4, pts: 4,  nrr: '-0.80' },
  { team: 'LSG',  p: 6, w: 1, l: 5, pts: 2,  nrr: '-1.23' },
];
