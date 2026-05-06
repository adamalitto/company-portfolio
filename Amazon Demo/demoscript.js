// Sample city data
const cities = [
    { name: 'New York', state: 'NY' }, { name: 'Los Angeles', state: 'CA' },
    { name: 'Chicago', state: 'IL' }, { name: 'Houston', state: 'TX' },
    { name: 'Phoenix', state: 'AZ' }, { name: 'Philadelphia', state: 'PA' },
    { name: 'San Antonio', state: 'TX' }, { name: 'San Diego', state: 'CA' },
    { name: 'Dallas', state: 'TX' }, { name: 'San Jose', state: 'CA' },
    { name: 'Austin', state: 'TX' }, { name: 'Jacksonville', state: 'FL' },
    { name: 'Fort Worth', state: 'TX' }, { name: 'Columbus', state: 'OH' },
    { name: 'Charlotte', state: 'NC' }, { name: 'San Francisco', state: 'CA' },
    { name: 'Indianapolis', state: 'IN' }, { name: 'Seattle', state: 'WA' },
    { name: 'Denver', state: 'CO' }, { name: 'Washington', state: 'DC' },
    { name: 'Baltimore', state: 'MD' }
];

// Predefined distances between cities in miles
const distanceLookup = {
    'New York, NY': {
        'Los Angeles, CA': 2795, 'Chicago, IL': 790, 'Houston, TX': 1627, 'Phoenix, AZ': 2447, 
        'Philadelphia, PA': 94, 'San Antonio, TX': 1794, 'San Diego, CA': 2820, 
        'Dallas, TX': 1550, 'San Jose, CA': 2934, 'Austin, TX': 1747, 'Jacksonville, FL': 936,
        'Fort Worth, TX': 1550, 'Columbus, OH': 550, 'Charlotte, NC': 634, 'San Francisco, CA': 2900,
        'Indianapolis, IN': 660, 'Seattle, WA': 2854, 'Denver, CO': 1770, 'Washington, DC': 226
    },
    'Los Angeles, CA': {
        'New York, NY': 2795, 'Chicago, IL': 1745, 'Houston, TX': 1374, 'Phoenix, AZ': 372, 
        'Philadelphia, PA': 2714, 'San Antonio, TX': 1200, 'San Diego, CA': 120, 
        'Dallas, TX': 1435, 'San Jose, CA': 340, 'Austin, TX': 1370, 'Jacksonville, FL': 2405,
        'Fort Worth, TX': 1445, 'Columbus, OH': 2175, 'Charlotte, NC': 2430, 'San Francisco, CA': 380,
        'Indianapolis, IN': 2055, 'Seattle, WA': 1135, 'Denver, CO': 1016, 'Washington, DC': 2683
    },
    'Chicago, IL': {
        'New York, NY': 790, 'Los Angeles, CA': 1745, 'Houston, TX': 1083, 'Phoenix, AZ': 1750,
        'Philadelphia, PA': 760, 'San Antonio, TX': 1237, 'San Diego, CA': 2054, 
        'Dallas, TX': 968, 'San Jose, CA': 2137, 'Austin, TX': 1118, 'Jacksonville, FL': 1005,
        'Fort Worth, TX': 963, 'Columbus, OH': 350, 'Charlotte, NC': 725, 'San Francisco, CA': 2131,
        'Indianapolis, IN': 180, 'Seattle, WA': 2064, 'Denver, CO': 1005, 'Washington, DC': 700
    },
    'Houston, TX': {
        'New York, NY': 1627, 'Los Angeles, CA': 1374, 'Chicago, IL': 1083, 'Phoenix, AZ': 1174,
        'Philadelphia, PA': 1554, 'San Antonio, TX': 197, 'San Diego, CA': 1500, 
        'Dallas, TX': 239, 'San Jose, CA': 1846, 'Austin, TX': 165, 'Jacksonville, FL': 849,
        'Fort Worth, TX': 264, 'Columbus, OH': 1192, 'Charlotte, NC': 1038, 'San Francisco, CA': 1900,
        'Indianapolis, IN': 1000, 'Seattle, WA': 2340, 'Denver, CO': 1030, 'Washington, DC': 1400
    },
    'Phoenix, AZ': {
        'New York, NY': 2447, 'Los Angeles, CA': 372, 'Chicago, IL': 1750, 'Houston, TX': 1174,
        'Philadelphia, PA': 2310, 'San Antonio, TX': 983, 'San Diego, CA': 355, 
        'Dallas, TX': 1065, 'San Jose, CA': 731, 'Austin, TX': 951, 'Jacksonville, FL': 1845,
        'Fort Worth, TX': 1060, 'Columbus, OH': 1756, 'Charlotte, NC': 1797, 'San Francisco, CA': 750,
        'Indianapolis, IN': 1660, 'Seattle, WA': 1445, 'Denver, CO': 810, 'Washington, DC': 2284
    },
    'Philadelphia, PA': {
    'New York, NY': 94, 'Los Angeles, CA': 2714, 'Chicago, IL': 760, 'Houston, TX': 1554,
    'Phoenix, AZ': 2310, 'San Antonio, TX': 1680, 'San Diego, CA': 2735, 'Dallas, TX': 1460,
    'San Jose, CA': 2820, 'Austin, TX': 1542, 'Jacksonville, FL': 860, 'Fort Worth, TX': 1465,
    'Columbus, OH': 475, 'Charlotte, NC': 540, 'San Francisco, CA': 2900, 'Indianapolis, IN': 650,
    'Seattle, WA': 2800, 'Denver, CO': 1775, 'Washington, DC': 140
},
'San Antonio, TX': {
    'New York, NY': 1794, 'Los Angeles, CA': 1200, 'Chicago, IL': 1237, 'Houston, TX': 197,
    'Phoenix, AZ': 983, 'Philadelphia, PA': 1680, 'San Diego, CA': 1300, 'Dallas, TX': 275,
    'San Jose, CA': 1605, 'Austin, TX': 80, 'Jacksonville, FL': 1050, 'Fort Worth, TX': 270,
    'Columbus, OH': 1380, 'Charlotte, NC': 1220, 'San Francisco, CA': 1750, 'Indianapolis, IN': 1200,
    'Seattle, WA': 2090, 'Denver, CO': 930, 'Washington, DC': 1585
},
'San Diego, CA': {
    'New York, NY': 2820, 'Los Angeles, CA': 120, 'Chicago, IL': 2054, 'Houston, TX': 1500,
    'Phoenix, AZ': 355, 'Philadelphia, PA': 2735, 'San Antonio, TX': 1300, 'Dallas, TX': 1372,
    'San Jose, CA': 460, 'Austin, TX': 1347, 'Jacksonville, FL': 2420, 'Fort Worth, TX': 1370,
    'Columbus, OH': 2170, 'Charlotte, NC': 2435, 'San Francisco, CA': 500, 'Indianapolis, IN': 2055,
    'Seattle, WA': 1250, 'Denver, CO': 1050, 'Washington, DC': 2700
},
'Dallas, TX': {
    'New York, NY': 1550, 'Los Angeles, CA': 1435, 'Chicago, IL': 968, 'Houston, TX': 239,
    'Phoenix, AZ': 1065, 'Philadelphia, PA': 1460, 'San Antonio, TX': 275, 'San Diego, CA': 1372,
    'San Jose, CA': 1700, 'Austin, TX': 195, 'Jacksonville, FL': 990, 'Fort Worth, TX': 30,
    'Columbus, OH': 1050, 'Charlotte, NC': 940, 'San Francisco, CA': 1720, 'Indianapolis, IN': 890,
    'Seattle, WA': 2100, 'Denver, CO': 795, 'Washington, DC': 1350
},
'San Jose, CA': {
    'New York, NY': 2934, 'Los Angeles, CA': 340, 'Chicago, IL': 2137, 'Houston, TX': 1846,
    'Phoenix, AZ': 731, 'Philadelphia, PA': 2820, 'San Antonio, TX': 1605, 'San Diego, CA': 460,
    'Dallas, TX': 1700, 'Austin, TX': 1680, 'Jacksonville, FL': 2500, 'Fort Worth, TX': 1710,
    'Columbus, OH': 2320, 'Charlotte, NC': 2725, 'San Francisco, CA': 50, 'Indianapolis, IN': 2120,
    'Seattle, WA': 820, 'Denver, CO': 1300, 'Washington, DC': 2820
},
'Austin, TX': {
    'New York, NY': 1747, 'Los Angeles, CA': 1370, 'Chicago, IL': 1118, 'Houston, TX': 165,
    'Phoenix, AZ': 951, 'Philadelphia, PA': 1542, 'San Antonio, TX': 80, 'San Diego, CA': 1347,
    'Dallas, TX': 195, 'San Jose, CA': 1680, 'Jacksonville, FL': 960, 'Fort Worth, TX': 190,
    'Columbus, OH': 1250, 'Charlotte, NC': 1160, 'San Francisco, CA': 1750, 'Indianapolis, IN': 1110,
    'Seattle, WA': 2100, 'Denver, CO': 935, 'Washington, DC': 1490
},
'Jacksonville, FL': {
    'New York, NY': 936, 'Los Angeles, CA': 2405, 'Chicago, IL': 1005, 'Houston, TX': 849,
    'Phoenix, AZ': 1845, 'Philadelphia, PA': 860, 'San Antonio, TX': 1050, 'San Diego, CA': 2420,
    'Dallas, TX': 990, 'San Jose, CA': 2500, 'Austin, TX': 960, 'Fort Worth, TX': 1010,
    'Columbus, OH': 700, 'Charlotte, NC': 345, 'San Francisco, CA': 2535, 'Indianapolis, IN': 845,
    'Seattle, WA': 2850, 'Denver, CO': 1800, 'Washington, DC': 720
},
'Fort Worth, TX': {
    'New York, NY': 1550, 'Los Angeles, CA': 1445, 'Chicago, IL': 963, 'Houston, TX': 264,
    'Phoenix, AZ': 1060, 'Philadelphia, PA': 1465, 'San Antonio, TX': 270, 'San Diego, CA': 1370,
    'Dallas, TX': 30, 'San Jose, CA': 1710, 'Austin, TX': 190, 'Jacksonville, FL': 1010,
    'Columbus, OH': 1050, 'Charlotte, NC': 935, 'San Francisco, CA': 1730, 'Indianapolis, IN': 890,
    'Seattle, WA': 2090, 'Denver, CO': 790, 'Washington, DC': 1355
},
'Columbus, OH': {
    'New York, NY': 550, 'Los Angeles, CA': 2175, 'Chicago, IL': 350, 'Houston, TX': 1192,
    'Phoenix, AZ': 1756, 'Philadelphia, PA': 475, 'San Antonio, TX': 1380, 'San Diego, CA': 2170,
    'Dallas, TX': 1050, 'San Jose, CA': 2320, 'Austin, TX': 1250, 'Jacksonville, FL': 700,
    'Fort Worth, TX': 1050, 'Charlotte, NC': 410, 'San Francisco, CA': 2330, 'Indianapolis, IN': 170,
    'Seattle, WA': 2320, 'Denver, CO': 1200, 'Washington, DC': 400
},
'Charlotte, NC': {
    'New York, NY': 634, 'Los Angeles, CA': 2430, 'Chicago, IL': 725, 'Houston, TX': 1038,
    'Phoenix, AZ': 1797, 'Philadelphia, PA': 540, 'San Antonio, TX': 1220, 'San Diego, CA': 2435,
    'Dallas, TX': 940, 'San Jose, CA': 2725, 'Austin, TX': 1160, 'Jacksonville, FL': 345,
    'Fort Worth, TX': 935, 'Columbus, OH': 410, 'San Francisco, CA': 2800, 'Indianapolis, IN': 600,
    'Seattle, WA': 2725, 'Denver, CO': 1580, 'Washington, DC': 400
},
'San Francisco, CA': {
    'New York, NY': 2900, 'Los Angeles, CA': 380, 'Chicago, IL': 2131, 'Houston, TX': 1900,
    'Phoenix, AZ': 750, 'Philadelphia, PA': 2900, 'San Antonio, TX': 1750, 'San Diego, CA': 500,
    'Dallas, TX': 1720, 'San Jose, CA': 50, 'Austin, TX': 1750, 'Jacksonville, FL': 2535,
    'Fort Worth, TX': 1730, 'Columbus, OH': 2330, 'Charlotte, NC': 2800, 'Indianapolis, IN': 2120,
    'Seattle, WA': 810, 'Denver, CO': 1270, 'Washington, DC': 2800
},
'Indianapolis, IN': {
    'New York, NY': 650, 'Los Angeles, CA': 2045, 'Chicago, IL': 185, 'Houston, TX': 1050,
    'Phoenix, AZ': 1632, 'Philadelphia, PA': 650, 'San Antonio, TX': 1200, 'San Diego, CA': 2055,
    'Dallas, TX': 890, 'San Jose, CA': 2120, 'Austin, TX': 1110, 'Jacksonville, FL': 845,
    'Fort Worth, TX': 890, 'Columbus, OH': 170, 'Charlotte, NC': 600, 'San Francisco, CA': 2120,
    'Seattle, WA': 2160, 'Denver, CO': 1000, 'Washington, DC': 550
},
'Seattle, WA': {
    'New York, NY': 2860, 'Los Angeles, CA': 1136, 'Chicago, IL': 2060, 'Houston, TX': 2370,
    'Phoenix, AZ': 1575, 'Philadelphia, PA': 2800, 'San Antonio, TX': 2090, 'San Diego, CA': 1250,
    'Dallas, TX': 2100, 'San Jose, CA': 820, 'Austin, TX': 2100, 'Jacksonville, FL': 2850,
    'Fort Worth, TX': 2090, 'Columbus, OH': 2320, 'Charlotte, NC': 2725, 'San Francisco, CA': 810,
    'Indianapolis, IN': 2160, 'Denver, CO': 1300, 'Washington, DC': 2750
},
'Denver, CO': {
    'New York, NY': 1790, 'Los Angeles, CA': 1020, 'Chicago, IL': 1000, 'Houston, TX': 1020,
    'Phoenix, AZ': 825, 'Philadelphia, PA': 1775, 'San Antonio, TX': 930, 'San Diego, CA': 1050,
    'Dallas, TX': 795, 'San Jose, CA': 1300, 'Austin, TX': 935, 'Jacksonville, FL': 1800,
    'Fort Worth, TX': 790, 'Columbus, OH': 1200, 'Charlotte, NC': 1580, 'San Francisco, CA': 1270,
    'Indianapolis, IN': 1000, 'Seattle, WA': 1300, 'Washington, DC': 1670
},
'Washington, DC': {
    'New York, NY': 225, 'Los Angeles, CA': 2680, 'Chicago, IL': 700, 'Houston, TX': 1400,
    'Phoenix, AZ': 2250, 'Philadelphia, PA': 140, 'San Antonio, TX': 1585, 'San Diego, CA': 2700,
    'Dallas, TX': 1350, 'San Jose, CA': 2820, 'Austin, TX': 1490, 'Jacksonville, FL': 720,
    'Fort Worth, TX': 1355, 'Columbus, OH': 400, 'Charlotte, NC': 400, 'San Francisco, CA': 2820,
    'Indianapolis, IN': 550, 'Seattle, WA': 2750, 'Denver, CO': 1670
},
'Baltimore, MD': {
    'New York, NY': 190, 'Los Angeles, CA': 2670, 'Chicago, IL': 700, 'Houston, TX': 1425,
    'Phoenix, AZ': 2290, 'Philadelphia, PA': 100, 'San Antonio, TX': 1605, 'San Diego, CA': 2690,
    'Dallas, TX': 1370, 'San Jose, CA': 2840, 'Austin, TX': 1525, 'Jacksonville, FL': 745,
    'Fort Worth, TX': 1375, 'Columbus, OH': 410, 'Charlotte, NC': 435, 'San Francisco, CA': 2845,
    'Indianapolis, IN': 585, 'Seattle, WA': 2780, 'Denver, CO': 1680, 'Washington, DC': 40
}

  
};

const LOAD_RESULTS_SESSION_KEY = 'amazonDemoRawLoadResults';
const LOAD_RESULTS_WINDOW_NAME_PREFIX = '__amazonDemoLoadResults__:';
const INTERMODAL_TARGET_LOAD_COUNT = 400;
const BLOCK_TARGET_LOAD_COUNT = 500;
const SHUFFLE_TARGET_LOAD_COUNT = 500;
const MULTI_STOP_TARGET_LOAD_COUNT = 2500;
const ROUND_TRIP_TARGET_LOAD_COUNT = 2500;
const LOADBOARD_FAST_BOOT_COUNT = 500;

const INTERMODAL_FACILITIES = [
    { market: 'New York, NY', facility: 'North Bergen, NJ', code: 'NS-NORTH-BERGEN', carrier: 'NS', address: { line1: '6201 Tonnelle Ave', line2: 'NORTH BERGEN, NJ 07047', shortCode: 'NS-NORTH-BERGEN' } },
    { market: 'Los Angeles, CA', facility: 'Hobart, CA', code: 'BNSF-HOBART', carrier: 'BNSF', address: { line1: '4000 Sheila St', line2: 'LOS ANGELES, CA 90023', shortCode: 'BNSF-HOBART' } },
    { market: 'Chicago, IL', facility: 'Bedford Park, IL', code: 'CSX-BEDFORD-PARK', carrier: 'CSX', address: { line1: '7000 W 71st St', line2: 'BEDFORD PARK, IL 60638', shortCode: 'CSX-BEDFORD-PARK' } },
    { market: 'Houston, TX', facility: 'Pearland, TX', code: 'BNSF-HOUSTON', carrier: 'BNSF', address: { line1: '214 Brisbane Rd', line2: 'HOUSTON, TX 77061', shortCode: 'BNSF-HOUSTON' } },
    { market: 'Phoenix, AZ', facility: 'Glendale, AZ', code: 'BNSF-PHOENIX', carrier: 'BNSF', address: { line1: '5281 N Tom Murray Ave', line2: 'GLENDALE, AZ 85301', shortCode: 'BNSF-PHOENIX' } },
    { market: 'Philadelphia, PA', facility: 'Morrisville, PA', code: 'NS-MORRISVILLE', carrier: 'NS', address: { line1: '1 Penn Warner Dr', line2: 'MORRISVILLE, PA 19067', shortCode: 'NS-MORRISVILLE' } },
    { market: 'San Antonio, TX', facility: 'Kirby, TX', code: 'UPRR-SAN-ANTONIO', carrier: 'UPRR', address: { line1: '4663 Binz Engleman Rd', line2: 'SAN ANTONIO, TX 78219', shortCode: 'UPRR-SAN-ANTONIO' } },
    { market: 'San Diego, CA', facility: 'Otay Mesa, CA', code: 'BNSF-SAN-DIEGO', carrier: 'BNSF', address: { line1: '7979 Airway Rd', line2: 'SAN DIEGO, CA 92154', shortCode: 'BNSF-SAN-DIEGO' } },
    { market: 'Dallas, TX', facility: 'Mesquite, TX', code: 'UPRR-DALLAS', carrier: 'UPRR', address: { line1: '3700 Samuell Blvd', line2: 'MESQUITE, TX 75149', shortCode: 'UPRR-DALLAS' } },
    { market: 'San Jose, CA', facility: 'Lathrop, CA', code: 'UPRR-LATHROP', carrier: 'UPRR', address: { line1: '1000 Roth Rd', line2: 'LATHROP, CA 95330', shortCode: 'UPRR-LATHROP' } },
    { market: 'Austin, TX', facility: 'Taylor, TX', code: 'UPRR-TAYLOR', carrier: 'UPRR', address: { line1: '1901 W 2nd St', line2: 'TAYLOR, TX 76574', shortCode: 'UPRR-TAYLOR' } },
    { market: 'Jacksonville, FL', facility: 'Jacksonville, FL', code: 'CSX-JACKSONVILLE', carrier: 'CSX', address: { line1: '5902 Sportsman Club Rd', line2: 'JACKSONVILLE, FL 32219', shortCode: 'CSX-JACKSONVILLE' } },
    { market: 'Fort Worth, TX', facility: 'Alliance, TX', code: 'BNSF-ALLIANCE', carrier: 'BNSF', address: { line1: '14821 Blue Mound Rd', line2: 'HASLET, TX 76052', shortCode: 'BNSF-ALLIANCE' } },
    { market: 'Columbus, OH', facility: 'Rickenbacker, OH', code: 'NS-RICKENBACKER', carrier: 'NS', address: { line1: '3329 Thoroughbred Dr', line2: 'COLUMBUS, OH 43217', shortCode: 'NS-RICKENBACKER' } },
    { market: 'Charlotte, NC', facility: 'Charlotte, NC', code: 'NS-CHARLOTTE', carrier: 'NS', address: { line1: '5430 Hovis Rd', line2: 'CHARLOTTE, NC 28208', shortCode: 'NS-CHARLOTTE' } },
    { market: 'San Francisco, CA', facility: 'Oakland, CA', code: 'UPRR-OAKLAND', carrier: 'UPRR', address: { line1: '1408 Middle Harbor Rd', line2: 'OAKLAND, CA 94607', shortCode: 'UPRR-OAKLAND' } },
    { market: 'Indianapolis, IN', facility: 'Avon, IN', code: 'CSX-AVON', carrier: 'CSX', address: { line1: '9300 Bradford Rd', line2: 'AVON, IN 46123', shortCode: 'CSX-AVON' } },
    { market: 'Seattle, WA', facility: 'Tacoma, WA', code: 'BNSF-TACOMA', carrier: 'BNSF', address: { line1: '1738 Milwaukee Way', line2: 'TACOMA, WA 98421', shortCode: 'BNSF-TACOMA' } },
    { market: 'Denver, CO', facility: 'Commerce City, CO', code: 'BNSF-DENVER', carrier: 'BNSF', address: { line1: '585 W 53rd Place', line2: 'DENVER, CO 80216', shortCode: 'BNSF-DENVER' } },
    { market: 'Washington, DC', facility: 'Springfield, VA', code: 'NS-SPRINGFIELD', carrier: 'NS', address: { line1: '7130 Newington Rd', line2: 'LORTON, VA 22079', shortCode: 'NS-SPRINGFIELD' } },
    { market: 'Baltimore, MD', facility: 'Curtis Bay, MD', code: 'CSX-BALTIMORE', carrier: 'CSX', address: { line1: '2600 Broening Hwy', line2: 'BALTIMORE, MD 21224', shortCode: 'CSX-BALTIMORE' } },
    { market: 'Phoenix, AZ', facility: 'San Bernardino, CA', code: 'BNSF-BERNARDINO-CS', carrier: 'BNSF', address: { line1: '1535 W 4th Street', line2: 'SAN BERNARDINO, CA 92411', shortCode: 'BNSF-BERNARDINO-CS' } }
];

const MULTI_STOP_LOCATION_OPTIONS = {
    'New York, NY': ['Bronx, NY', 'Elizabeth, NJ', 'North Bergen, NJ'],
    'Los Angeles, CA': ['Commerce, CA', 'Carson, CA', 'Ontario, CA'],
    'Chicago, IL': ['Bedford Park, IL', 'Joliet, IL', 'Elwood, IL'],
    'Houston, TX': ['Katy, TX', 'Pearland, TX', 'Baytown, TX'],
    'Phoenix, AZ': ['Glendale, AZ', 'Tolleson, AZ', 'Goodyear, AZ'],
    'Philadelphia, PA': ['Swedesboro, NJ', 'Morrisville, PA', 'Carlisle, PA'],
    'San Antonio, TX': ['Kirby, TX', 'New Braunfels, TX', 'Schertz, TX'],
    'San Diego, CA': ['Otay Mesa, CA', 'Escondido, CA', 'National City, CA'],
    'Dallas, TX': ['Lancaster, TX', 'Mesquite, TX', 'Hutchins, TX'],
    'San Jose, CA': ['Milpitas, CA', 'Lathrop, CA', 'Tracy, CA'],
    'Austin, TX': ['Round Rock, TX', 'Taylor, TX', 'Pflugerville, TX'],
    'Jacksonville, FL': ['Baldwin, FL', 'Jacksonville, FL', 'Ponte Vedra, FL'],
    'Fort Worth, TX': ['Alliance, TX', 'Haslet, TX', 'Arlington, TX'],
    'Columbus, OH': ['Rickenbacker, OH', 'Groveport, OH', 'West Jefferson, OH'],
    'Charlotte, NC': ['Concord, NC', 'Gastonia, NC', 'Salisbury, NC'],
    'San Francisco, CA': ['Oakland, CA', 'Richmond, CA', 'Livermore, CA'],
    'Indianapolis, IN': ['Plainfield, IN', 'Avon, IN', 'Greenwood, IN'],
    'Seattle, WA': ['Kent, WA', 'Tacoma, WA', 'Sumner, WA'],
    'Denver, CO': ['Aurora, CO', 'Commerce City, CO', 'Fort Lupton, CO'],
    'Washington, DC': ['Springfield, VA', 'Upper Marlboro, MD', 'Laurel, MD'],
    'Baltimore, MD': ['Curtis Bay, MD', 'Sparrows Point, MD', 'Aberdeen, MD']
};

const DEMO_AMAZON_FACILITY_POOLS = {
    'New York, NY': [
        { code: 'JFK8', city: 'Staten Island, NY', line1: '546 Gulf Avenue', line2: 'STATEN ISLAND, NY 10314' },
        { code: 'EWR4', city: 'Robbinsville, NJ', line1: '50 New Canton Way', line2: 'ROBBINSVILLE, NJ 08691' },
        { code: 'TEB3', city: 'Logan Township, NJ', line1: '2651 Oldmans Creek Rd', line2: 'LOGAN TOWNSHIP, NJ 08085' }
    ],
    'Los Angeles, CA': [
        { code: 'LGB3', city: 'Eastvale, CA', line1: '4950 Goodman Way', line2: 'EASTVALE, CA 91752' },
        { code: 'ULA6', city: 'Los Angeles, CA', line1: '5119 District Blvd', line2: 'LOS ANGELES, CA 90058' },
        { code: 'MAG1', city: 'Los Angeles, CA', line1: '6855 S La Cienega Blvd', line2: 'LOS ANGELES, CA 90045' }
    ],
    'Chicago, IL': [
        { code: 'MDW6', city: 'Romeoville, IL', line1: '1125 W Remington Blvd', line2: 'ROMEOVILLE, IL 60446' },
        { code: 'MDW8', city: 'Waukegan, IL', line1: '1750 Bridge Drive', line2: 'WAUKEGAN, IL 60085' },
        { code: 'RFD2', city: 'Huntley, IL', line1: '11500 Freeman Rd', line2: 'HUNTLEY, IL 60142' }
    ],
    'Houston, TX': [
        { code: 'HOU2', city: 'Houston, TX', line1: '10550 Ella Blvd', line2: 'HOUSTON, TX 77038' },
        { code: 'HOU7', city: 'Houston, TX', line1: '16275 Port Northwest Dr', line2: 'HOUSTON, TX 77041' },
        { code: 'IAH3', city: 'Katy, TX', line1: '31555 Highway 90 E', line2: 'KATY, TX 77494' }
    ],
    'Phoenix, AZ': [
        { code: 'GYR1', city: 'Goodyear, AZ', line1: '605 S Bullard Ave', line2: 'GOODYEAR, AZ 85338' },
        { code: 'GYR2', city: 'Goodyear, AZ', line1: '17341 W Minnezona Ave', line2: 'GOODYEAR, AZ 85395' },
        { code: 'PHX5', city: 'Goodyear, AZ', line1: '16920 W Commerce Drive', line2: 'GOODYEAR, AZ 85338' }
    ],
    'Philadelphia, PA': [
        { code: 'ABE4', city: 'Easton, PA', line1: '1610 Van Buren Rd', line2: 'EASTON, PA 18045' },
        { code: 'HPA1', city: 'Lewisberry, PA', line1: '200 Goodman Drive', line2: 'LEWISBERRY, PA 17339' },
        { code: 'MTN1', city: 'Wilmington, DE', line1: '1025 Boxwood Rd', line2: 'WILMINGTON, DE 19804' }
    ],
    'San Antonio, TX': [
        { code: 'SAT1', city: 'Schertz, TX', line1: '6000 Schertz Pkwy', line2: 'SCHERTZ, TX 78154' },
        { code: 'SAT3', city: 'San Antonio, TX', line1: '6806 Cal Turner Dr', line2: 'SAN ANTONIO, TX 78220' },
        { code: 'SAT4', city: 'San Antonio, TX', line1: '10384 W US Highway 90', line2: 'SAN ANTONIO, TX 78245' }
    ],
    'San Diego, CA': [
        { code: 'UCA6', city: 'San Diego, CA', line1: '2727 Kurtz St', line2: 'SAN DIEGO, CA 92110' },
        { code: 'USD1', city: 'San Diego, CA', line1: '4976 Overland Ave', line2: 'SAN DIEGO, CA 92123' },
        { code: 'PSD4', city: 'San Diego, CA', line1: '16915 Via Del Campo', line2: 'SAN DIEGO, CA 92127' }
    ],
    'Dallas, TX': [
        { code: 'DAL2', city: 'Dallas, TX', line1: '2601 S Airfield Dr', line2: 'DALLAS, TX 75261' },
        { code: 'FTW1', city: 'Dallas, TX', line1: '33333 Lyndon B Johnson Fwy', line2: 'DALLAS, TX 75241' },
        { code: 'DFW6', city: 'Coppell, TX', line1: '940 W Bethel Rd', line2: 'COPPELL, TX 75019' }
    ],
    'San Jose, CA': [
        { code: 'USF1', city: 'Santa Clara, CA', line1: '750 Laurelwood Road', line2: 'SANTA CLARA, CA 95054' },
        { code: 'SJC7', city: 'Tracy, CA', line1: '188 Mountain House Parkway', line2: 'TRACY, CA 95377' },
        { code: 'SCK4', city: 'Stockton, CA', line1: '6001 S Austin Rd', line2: 'STOCKTON, CA 95215' }
    ],
    'Austin, TX': [
        { code: 'AUS2', city: 'Pflugerville, TX', line1: '2000 E Pecan St', line2: 'PFLUGERVILLE, TX 78660' },
        { code: 'STX6', city: 'Austin, TX', line1: '4616 W Howard Ln', line2: 'AUSTIN, TX 78728' },
        { code: 'STX9', city: 'Buda, TX', line1: '2956 Main St', line2: 'BUDA, TX 78610' }
    ],
    'Jacksonville, FL': [
        { code: 'JAX2', city: 'Jacksonville, FL', line1: '12900 Pecan Park Rd', line2: 'JACKSONVILLE, FL 32218' },
        { code: 'JAX3', city: 'Jacksonville, FL', line1: '13333 103rd St', line2: 'JACKSONVILLE, FL 32210' },
        { code: 'PJA1', city: 'Jacksonville, FL', line1: '4948 Bulls Bay Hwy', line2: 'JACKSONVILLE, FL 32219' }
    ],
    'Fort Worth, TX': [
        { code: 'AFW1', city: 'Fort Worth, TX', line1: '1851 NE Loop 820 Service Rd', line2: 'FORT WORTH, TX 76131' },
        { code: 'FTW3', city: 'Haslet, TX', line1: '15201 Heritage Pkwy', line2: 'HASLET, TX 76177' },
        { code: 'DFW7', city: 'Fort Worth, TX', line1: '700 Westport Pkwy', line2: 'FORT WORTH, TX 76177' }
    ],
    'Columbus, OH': [
        { code: 'CMH2', city: 'Obetz, OH', line1: '6050 Gateway Ct', line2: 'OBETZ, OH 43125' },
        { code: 'CMH7', city: 'Etna, OH', line1: '11999 National Rd SW', line2: 'ETNA, OH 43062' },
        { code: 'UOH4', city: 'Columbus, OH', line1: '4400 Equity Dr', line2: 'COLUMBUS, OH 43228' }
    ],
    'Charlotte, NC': [
        { code: 'CLT2', city: 'Charlotte, NC', line1: '10240 Old Dowd Rd', line2: 'CHARLOTTE, NC 28214' },
        { code: 'CLT4', city: 'Concord, NC', line1: '8000 Tuckaseegee Rd', line2: 'CONCORD, NC 28027' },
        { code: 'CLT6', city: 'Charlotte, NC', line1: '6800 Bringle Ferry Rd', line2: 'CHARLOTTE, NC 28214' }
    ],
    'San Francisco, CA': [
        { code: 'USF1', city: 'Santa Clara, CA', line1: '750 Laurelwood Road', line2: 'SANTA CLARA, CA 95054' },
        { code: 'USF2', city: 'San Leandro, CA', line1: '1788 Fairway Dr', line2: 'SAN LEANDRO, CA 94577' },
        { code: 'PSF2', city: 'Brisbane, CA', line1: '3745 Bayshore Blvd', line2: 'BRISBANE, CA 94005' }
    ],
    'Indianapolis, IN': [
        { code: 'IND2', city: 'Plainfield, IN', line1: '715 Airtech Pkwy', line2: 'PLAINFIELD, IN 46168' },
        { code: 'IND3', city: 'Indianapolis, IN', line1: '7155 W Morris St', line2: 'INDIANAPOLIS, IN 46241' },
        { code: 'IND9', city: 'Greenwood, IN', line1: '2140 Stacie Way', line2: 'GREENWOOD, IN 46143' }
    ],
    'Seattle, WA': [
        { code: 'BFI1', city: 'Sumner, WA', line1: '1800 140th Ave E', line2: 'SUMNER, WA 98390' },
        { code: 'BFI4', city: 'Kent, WA', line1: '21005 64th Ave S', line2: 'KENT, WA 98032' },
        { code: 'BFI3', city: 'DuPont, WA', line1: '2700 Center Dr', line2: 'DUPONT, WA 98327' }
    ],
    'Denver, CO': [
        { code: 'DEN2', city: 'Aurora, CO', line1: '22205 E 19th Ave', line2: 'AURORA, CO 80019' },
        { code: 'DEN7', city: 'Aurora, CO', line1: '22300 E 26th Avenue', line2: 'AURORA, CO 80019' },
        { code: 'UCO1', city: 'Denver, CO', line1: '3880 N Lisbon St', line2: 'DENVER, CO 80249' }
    ],
    'Washington, DC': [
        { code: 'UVA1', city: 'Springfield, VA', line1: '5617 Industrial Dr', line2: 'SPRINGFIELD, VA 22151' },
        { code: 'ZDC5', city: 'Washington, DC', line1: '845 Bladensburg Rd NE', line2: 'WASHINGTON, DC 20002' },
        { code: 'DDC3', city: 'Springfield, VA', line1: '6885 Commercial Dr', line2: 'SPRINGFIELD, VA 22151' }
    ],
    'Baltimore, MD': [
        { code: 'DCA6', city: 'Sparrows Point, MD', line1: '6001 Bethlehem Blvd', line2: 'SPARROWS POINT, MD 21219' },
        { code: 'BWI2', city: 'Baltimore, MD', line1: '2010 Broening Hwy', line2: 'BALTIMORE, MD 21224' },
        { code: 'MTN1', city: 'Wilmington, DE', line1: '1025 Boxwood Rd', line2: 'WILMINGTON, DE 19804' }
    ],
    'Atlanta, GA': [
        { code: 'HAT9', city: 'Austell, GA', line1: '7520 Factory Shoals Road', line2: 'AUSTELL, GA 30168' }
    ]
};

const DEMO_VENDOR_FACILITIES = [
    { code: 'VENDOR-1010661248', market: 'Fort Worth, TX', city: 'Fort Worth, TX', line1: '5600 Mark IV Pky', line2: 'FORT WORTH, TX 76131' },
    { code: 'VENDOR-DHL-BWI', market: 'Baltimore, MD', city: 'Baltimore, MD', line1: '1200 E Patapsco Ave', line2: 'BALTIMORE, MD 21225' },
    { code: 'VENDOR-NJ-PORT', market: 'New York, NY', city: 'Elizabeth, NJ', line1: '1000 Jefferson Ave', line2: 'ELIZABETH, NJ 07201' }
];

function cloneDemoFacilityAddress(facility) {
    return {
        line1: facility.line1,
        line2: facility.line2,
        shortCode: facility.code
    };
}

function getDemoFacilityPool(market) {
    if (DEMO_AMAZON_FACILITY_POOLS[market]) {
        return DEMO_AMAZON_FACILITY_POOLS[market];
    }

    const stateMatch = String(market || '').match(/,\s*([A-Z]{2})\b/);
    if (stateMatch) {
        const sameStatePool = Object.values(DEMO_AMAZON_FACILITY_POOLS)
            .flat()
            .filter((facility) => facility.line2.includes(`, ${stateMatch[1]} `));

        if (sameStatePool.length) {
            return sameStatePool;
        }
    }

    return DEMO_AMAZON_FACILITY_POOLS['Baltimore, MD'];
}

function pickDemoFacility(market, seed = 0, options = {}) {
    if (options.vendor) {
        const vendorPool = DEMO_VENDOR_FACILITIES.filter((facility) => facility.market === market);
        const pool = vendorPool.length ? vendorPool : DEMO_VENDOR_FACILITIES;
        return pool[Math.abs(seed) % pool.length];
    }

    const pool = getDemoFacilityPool(market);
    return pool[Math.abs(seed) % pool.length];
}

function pickDemoFacilityStop(market, seed = 0, options = {}) {
    const facility = pickDemoFacility(market, seed, options);
    const stopMarket = options.market || market || facility.market || facility.city;
    return {
        market: stopMarket,
        location: facility.city,
        facilityCode: facility.code,
        code: facility.code,
        address: cloneDemoFacilityAddress(facility)
    };
}

if (typeof window !== 'undefined') {
    window.pickDemoFacilityStop = pickDemoFacilityStop;
    window.getDemoFacilityPool = getDemoFacilityPool;
}

const MULTI_STOP_DISTANCE_TEMPLATES = {
    3: [[40, 320], [180, 1050]],
    4: [[35, 260], [90, 520], [180, 1100]],
    5: [[35, 240], [70, 420], [120, 650], [220, 1250]],
    6: [[30, 220], [60, 360], [90, 520], [130, 760], [240, 1350]]
};

function cloneLoadResults(results) {
    return Array.isArray(results) ? results.slice() : [];
}

function readWindowNamedLoadResults() {
    if (typeof window === 'undefined' || typeof window.name !== 'string') {
        return null;
    }

    const raw = window.name || '';
    if (!raw.startsWith(LOAD_RESULTS_WINDOW_NAME_PREFIX)) {
        return null;
    }

    try {
        return JSON.parse(raw.slice(LOAD_RESULTS_WINDOW_NAME_PREFIX.length));
    } catch (error) {
        console.warn('Unable to read demo load results from window.name.', error);
        return null;
    }
}

function writeWindowNamedLoadResults(results) {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        window.name = `${LOAD_RESULTS_WINDOW_NAME_PREFIX}${JSON.stringify(results)}`;
        return true;
    } catch (error) {
        console.warn('Unable to write demo load results to window.name.', error);
        return false;
    }
}

function clearLegacySessionStoredLoadResults() {
    try {
        sessionStorage.removeItem(LOAD_RESULTS_SESSION_KEY);
    } catch (error) {
        console.warn('Unable to clear legacy demo load results from session storage.', error);
    }
}

function formatLoadRate(amount) {
    return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function buildDemoFacilityCode(location, seed, suffix = '') {
    const letters = String(location || '')
        .split(',')[0]
        .replace(/[^A-Z]/gi, '')
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, 'X');
    const number = 1 + ((seed * 17) % 8);
    return `${letters}${number}${suffix}`;
}

function getIntermodalTripMiles(originMarket, destinationMarket, seedIndex) {
    const direct = distanceLookup[originMarket]?.[destinationMarket];
    const reverse = distanceLookup[destinationMarket]?.[originMarket];

    if (typeof direct === 'number') return direct;
    if (typeof reverse === 'number') return reverse;

    return 225 + ((seedIndex * 137) % 2550);
}

function getDemoCityMarkets() {
    return cities.map((city) => `${city.name}, ${city.state}`);
}

function getDeterministicMiles(originMarket, destinationMarket, seedIndex = 1) {
    const direct = distanceLookup[originMarket]?.[destinationMarket];
    const reverse = distanceLookup[destinationMarket]?.[originMarket];

    if (typeof direct === 'number') return direct;
    if (typeof reverse === 'number') return reverse;

    return 120 + ((seedIndex * 149) % 2100);
}

function getMultiStopLocationLabel(market, loadIndex, stopIndex) {
    const options = MULTI_STOP_LOCATION_OPTIONS[market];
    if (!Array.isArray(options) || !options.length) {
        return market;
    }

    return options[(loadIndex + stopIndex) % options.length];
}

function pickNextMultiStopMarket(currentMarket, usedMarkets, loadIndex, segmentIndex, segmentCount) {
    const cityMarkets = getDemoCityMarkets();
    const allCandidates = cityMarkets.filter((market) => market !== currentMarket && !usedMarkets.has(market));
    const template = MULTI_STOP_DISTANCE_TEMPLATES[segmentCount + 1] || MULTI_STOP_DISTANCE_TEMPLATES[6];
    const [minMiles, maxMiles] = template[Math.min(segmentIndex, template.length - 1)] || [40, 1000];
    const midpoint = (minMiles + maxMiles) / 2;

    const rankedCandidates = allCandidates
        .map((market) => ({
            market,
            miles: getDeterministicMiles(currentMarket, market, loadIndex + (segmentIndex * 17) + 1)
        }))
        .sort((left, right) => left.miles - right.miles);

    const preferred = rankedCandidates.filter((candidate) => candidate.miles >= minMiles && candidate.miles <= maxMiles);
    const pool = preferred.length
        ? preferred
        : rankedCandidates.sort((left, right) => Math.abs(left.miles - midpoint) - Math.abs(right.miles - midpoint));

    if (!pool.length) {
        return currentMarket;
    }

    const pickIndex = (loadIndex + (segmentIndex * 3)) % Math.min(pool.length, 7);
    return pool[pickIndex].market;
}

function buildMultiStopRouteMarkets(loadIndex) {
    const cityMarkets = getDemoCityMarkets();
    const stopCount = 3 + (loadIndex % 4);
    const segmentCount = stopCount - 1;
    const routeMarkets = [cityMarkets[loadIndex % cityMarkets.length]];
    const usedMarkets = new Set(routeMarkets);

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        const currentMarket = routeMarkets[routeMarkets.length - 1];
        const nextMarket = pickNextMultiStopMarket(currentMarket, usedMarkets, loadIndex, segmentIndex, segmentCount);
        routeMarkets.push(nextMarket);
        usedMarkets.add(nextMarket);
    }

    return routeMarkets;
}

function buildRoundTripRouteMarkets(loadIndex) {
    const cityMarkets = getDemoCityMarkets();
    const stopCount = 3 + (loadIndex % 4);
    const intermediateStopCount = stopCount - 2;
    const originMarket = cityMarkets[loadIndex % cityMarkets.length];
    const routeMarkets = [originMarket];
    const usedMarkets = new Set(routeMarkets);

    for (let segmentIndex = 0; segmentIndex < intermediateStopCount; segmentIndex += 1) {
        const currentMarket = routeMarkets[routeMarkets.length - 1];
        const nextMarket = pickNextMultiStopMarket(
            currentMarket,
            usedMarkets,
            loadIndex + 5000,
            segmentIndex,
            intermediateStopCount + 1
        );
        routeMarkets.push(nextMarket);
        usedMarkets.add(nextMarket);
    }

    routeMarkets.push(originMarket);
    return routeMarkets;
}

function buildBlockFacilityCode(market, loadIndex) {
    const cityName = String(market || '').split(',')[0].trim();
    const words = cityName.split(/\s+/).filter(Boolean);
    const abbreviation = words.length > 1
        ? words.map((word) => word[0]).join('').slice(0, 3)
        : cityName.replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 3);

    return (abbreviation || 'BLK').toUpperCase().padEnd(3, 'X');
}

function buildFutureBlockRouteMarkets(originMarket, loadIndex) {
    const stopCount = 3 + (loadIndex % 4);
    const intermediateStopCount = stopCount - 2;
    const routeMarkets = [originMarket];
    const usedMarkets = new Set(routeMarkets);

    for (let segmentIndex = 0; segmentIndex < intermediateStopCount; segmentIndex += 1) {
        const currentMarket = routeMarkets[routeMarkets.length - 1];
        const nextMarket = pickNextMultiStopMarket(
            currentMarket,
            usedMarkets,
            loadIndex + 9000,
            segmentIndex,
            intermediateStopCount + 1
        );
        routeMarkets.push(nextMarket);
        usedMarkets.add(nextMarket);
    }

    routeMarkets.push(originMarket);
    return routeMarkets;
}

function buildBlockLoadResults(today) {
    const nextLoads = [];
    const cityMarkets = getDemoCityMarkets();

    for (let index = 0; index < BLOCK_TARGET_LOAD_COUNT; index += 1) {
        const market = cityMarkets[index % cityMarkets.length];
        const facilityStop = pickDemoFacilityStop(market, index);
        const location = facilityStop.location;
        const facilityCode = facilityStop.facilityCode;
        const startOffsetSlots = 96 + ((index * 7) % 192);
        const blockDurationMinutes = (35 * 60) + (((index % 7) + 1) * 60);
        const payout = 1425 + ((index * 73) % 880);
        const futureRouteMarkets = buildFutureBlockRouteMarkets(market, index);
        const futureStopPlan = futureRouteMarkets.map((routeMarket, stopIndex) => {
            const isOriginStop = stopIndex === 0;
            const isReturnStop = stopIndex === futureRouteMarkets.length - 1;

            return {
                market: routeMarket,
                location: (isOriginStop || isReturnStop)
                    ? location
                    : pickDemoFacilityStop(routeMarket, index + 9000 + stopIndex).location,
                facilityCode: (isOriginStop || isReturnStop)
                    ? facilityCode
                    : pickDemoFacilityStop(routeMarket, index + 9000 + stopIndex).facilityCode,
                address: (isOriginStop || isReturnStop)
                    ? { ...facilityStop.address }
                    : pickDemoFacilityStop(routeMarket, index + 9000 + stopIndex).address
            };
        });
        const futureSegmentMiles = futureRouteMarkets.slice(0, -1).map((routeMarket, segmentIndex) => (
            getDeterministicMiles(routeMarket, futureRouteMarkets[segmentIndex + 1], index + 12000 + (segmentIndex * 13))
        ));

        nextLoads.push({
            pickupDate: today,
            pickupOffsetSlots: startOffsetSlots,
            truck: 'V',
            f_p: 'F',
            pickup: location,
            pickupMarket: market,
            trip: 0,
            destination: location,
            destinationMarket: market,
            company: `Relay Block ${String(index + 1).padStart(4, '0')}`,
            contact: `555-${String(6200 + index).padStart(4, '0')}`,
            length: '53 ft',
            weight: `${18000 + ((index * 211) % 8000)} lbs`,
            rate: formatLoadRate(payout),
            workType: 'Block',
            driverType: 'Solo',
            loadType: 'Block',
            equipment: "53' Trailer",
            stops: 0,
            stopPlan: [{
                market,
                location,
                facilityCode,
                address: { ...facilityStop.address }
            }, {
                market,
                location,
                facilityCode,
                address: { ...facilityStop.address }
            }],
            segmentMiles: [0],
            blockDurationMinutes,
            isBlockLoad: true,
            futureStopPlan,
            futureSegmentMiles
        });
    }

    return nextLoads;
}

function buildShuffleLoadResults(today) {
    const nextLoads = [];
    const cityMarkets = getDemoCityMarkets();

    for (let index = 0; index < SHUFFLE_TARGET_LOAD_COUNT; index += 1) {
        const market = cityMarkets[index % cityMarkets.length];
        const facilityStop = pickDemoFacilityStop(market, index + 500);
        const location = facilityStop.location;
        const facilityCode = facilityStop.facilityCode;
        const startOffsetSlots = 6 + ((index * 5) % 120);
        const shuffleDurationMinutes = (10 * 60) + (((index % 9) * 30));
        const payout = 980 + ((index * 49) % 540);

        nextLoads.push({
            pickupDate: today,
            pickupOffsetSlots: startOffsetSlots,
            truck: 'V',
            f_p: 'F',
            pickup: location,
            pickupMarket: market,
            trip: 1,
            destination: location,
            destinationMarket: market,
            company: `Relay Shuffle ${String(index + 1).padStart(4, '0')}`,
            contact: `555-${String(7800 + index).padStart(4, '0')}`,
            length: '53 ft',
            weight: `${15000 + ((index * 173) % 6000)} lbs`,
            rate: formatLoadRate(payout),
            workType: 'Shuffle',
            driverType: 'Solo',
            loadType: 'Shuffle',
            equipment: "53' Trailer",
            stops: 2,
            stopPlan: [{
                market,
                location,
                facilityCode,
                address: { ...facilityStop.address }
            }, {
                market,
                location,
                facilityCode,
                address: { ...facilityStop.address }
            }],
            segmentMiles: [1],
            shuffleDurationMinutes,
            isShuffleLoad: true
        });
    }

    return nextLoads;
}

function buildMultiStopLoadResults(today) {
    const nextLoads = [];
    const truckTypes = ['V', 'V', 'VA', 'VR'];

    for (let index = 0; index < MULTI_STOP_TARGET_LOAD_COUNT; index += 1) {
        const routeMarkets = buildMultiStopRouteMarkets(index);
        const stopPlan = routeMarkets.map((market, stopIndex) => {
            const facilityStop = pickDemoFacilityStop(market, index + (stopIndex * 17));
            return {
                market,
                location: facilityStop.location,
                facilityCode: facilityStop.facilityCode,
                address: facilityStop.address
            };
        });
        const segmentMiles = routeMarkets.slice(0, -1).map((market, segmentIndex) => (
            getDeterministicMiles(market, routeMarkets[segmentIndex + 1], index + (segmentIndex * 11) + 1)
        ));
        const totalMiles = segmentMiles.reduce((sum, miles) => sum + miles, 0);
        const stopCount = stopPlan.length;
        const truck = truckTypes[index % truckTypes.length];
        const f_p = index % 5 === 0 ? 'P' : 'F';
        const length = truck === 'VR'
            ? '53 ft'
            : (index % 6 === 0 ? '48 ft' : '53 ft');
        const driverType = totalMiles >= 1100
            || segmentMiles.some((miles) => miles >= 850)
            || stopCount >= 5
            || index % 5 === 0
            ? 'Team'
            : 'Solo';
        const workType = 'One-Way/Round Trip';
        const loadType = index % 4 === 0
            ? 'Live/Drop'
            : (index % 3 === 0 ? 'Drop and hook' : 'Drop');
        const ratePerMile = 1.68
            + ((index % 11) * 0.06)
            + ((stopCount - 2) * 0.07)
            + (driverType === 'Team' ? 0.08 : 0);
        const pickupStop = stopPlan[0];
        const destinationStop = stopPlan[stopPlan.length - 1];

        nextLoads.push({
            pickupDate: today,
            truck,
            f_p,
            pickup: pickupStop.location,
            pickupMarket: pickupStop.market,
            trip: totalMiles,
            destination: destinationStop.location,
            destinationMarket: destinationStop.market,
            company: `Relay Multi-stop ${String(index + 1).padStart(4, '0')}`,
            contact: `555-${String(2000 + (index % 7000)).padStart(4, '0')}`,
            length,
            weight: `${22000 + ((index * 417) % 16000)} lbs`,
            rate: formatLoadRate(totalMiles * ratePerMile),
            workType,
            driverType,
            loadType,
            stops: stopCount,
            stopPlan,
            segmentMiles
        });
    }

    return nextLoads;
}

function buildRoundTripLoadResults(today) {
    const nextLoads = [];
    const truckTypes = ['V', 'V', 'VA', 'VR'];

    for (let index = 0; index < ROUND_TRIP_TARGET_LOAD_COUNT; index += 1) {
        const routeMarkets = buildRoundTripRouteMarkets(index);
        const originFacilityStop = pickDemoFacilityStop(routeMarkets[0], index + 5001);
        const originLocation = originFacilityStop.location;
        const originFacilityCode = originFacilityStop.facilityCode;
        const stopPlan = routeMarkets.map((market, stopIndex) => {
            const isOriginReturn = stopIndex === routeMarkets.length - 1;
            const facilityStop = (stopIndex === 0 || isOriginReturn)
                ? originFacilityStop
                : pickDemoFacilityStop(market, index + 5000 + (stopIndex * 17));
            return {
                market,
                location: facilityStop.location,
                facilityCode: facilityStop.facilityCode,
                address: { ...facilityStop.address }
            };
        });
        const segmentMiles = routeMarkets.slice(0, -1).map((market, segmentIndex) => (
            getDeterministicMiles(market, routeMarkets[segmentIndex + 1], index + 5000 + (segmentIndex * 13) + 1)
        ));
        const totalMiles = segmentMiles.reduce((sum, miles) => sum + miles, 0);
        const stopCount = stopPlan.length;
        const truck = truckTypes[index % truckTypes.length];
        const f_p = index % 6 === 0 ? 'P' : 'F';
        const length = truck === 'VR'
            ? '53 ft'
            : (index % 5 === 0 ? '48 ft' : '53 ft');
        const driverType = totalMiles >= 1200
            || segmentMiles.some((miles) => miles >= 900)
            || stopCount >= 5
            || index % 4 === 0
            ? 'Team'
            : 'Solo';
        const workType = 'One-Way/Round Trip';
        const loadType = index % 4 === 0
            ? 'Live/Drop'
            : (index % 3 === 0 ? 'Drop and hook' : 'Drop');
        const ratePerMile = 1.74
            + ((index % 10) * 0.06)
            + ((stopCount - 2) * 0.08)
            + (driverType === 'Team' ? 0.09 : 0);

        nextLoads.push({
            pickupDate: today,
            truck,
            f_p,
            pickup: stopPlan[0].location,
            pickupMarket: stopPlan[0].market,
            trip: totalMiles,
            destination: stopPlan[stopPlan.length - 1].location,
            destinationMarket: stopPlan[stopPlan.length - 1].market,
            company: `Relay Round Trip ${String(index + 1).padStart(4, '0')}`,
            contact: `555-${String(5000 + (index % 4000)).padStart(4, '0')}`,
            length,
            weight: `${24000 + ((index * 389) % 14000)} lbs`,
            rate: formatLoadRate(totalMiles * ratePerMile),
            workType,
            driverType,
            loadType,
            stops: stopCount,
            stopPlan,
            segmentMiles,
            isRoundTrip: true
        });
    }

    return nextLoads;
}

function buildIntermodalLoadResults(today) {
    const carrierPools = INTERMODAL_FACILITIES.reduce((map, facility) => {
        map[facility.carrier] = map[facility.carrier] || [];
        map[facility.carrier].push(facility);
        return map;
    }, {});
    const nextLoads = [];

    for (let index = 0; index < INTERMODAL_TARGET_LOAD_COUNT; index += 1) {
        const originFacility = INTERMODAL_FACILITIES[index % INTERMODAL_FACILITIES.length];
        const carrierPool = carrierPools[originFacility.carrier] || [originFacility];
        const originPoolIndex = carrierPool.findIndex((facility) => facility.code === originFacility.code);
        const destinationPoolOffset = 1 + Math.floor(index / INTERMODAL_FACILITIES.length);
        let destinationFacility = carrierPool[(originPoolIndex + destinationPoolOffset) % carrierPool.length] || originFacility;

        if (destinationFacility.code === originFacility.code) {
            destinationFacility = INTERMODAL_FACILITIES[(index + 9) % INTERMODAL_FACILITIES.length];
        }

        const trip = getIntermodalTripMiles(originFacility.market, destinationFacility.market, index + 1);
        const ratePerMile = 2.05
            + ((index % 11) * 0.07)
            + (trip >= 1200 ? 0.28 : trip >= 800 ? 0.18 : 0.08);
        const driverType = trip >= 650 && (
            index % 2 === 0
            || trip >= 1100
            || originFacility.carrier === 'BNSF'
            || originFacility.carrier === 'UPRR'
        )
            ? 'Team'
            : 'Solo';
        const workType = 'One-Way/Round Trip';

        nextLoads.push({
            pickupDate: today,
            truck: 'VA',
            f_p: 'F',
            pickup: originFacility.facility,
            pickupMarket: originFacility.market,
            trip,
            destination: destinationFacility.facility,
            destinationMarket: destinationFacility.market,
            company: `${originFacility.carrier} Intermodal ${String(index + 1).padStart(3, '0')}`,
            contact: `555-${String(8000 + index).padStart(4, '0')}`,
            length: '53 ft',
            weight: `${24000 + ((index * 563) % 14000)} lbs`,
            rate: formatLoadRate(trip * ratePerMile),
            equipment: "53' Container",
            loadType: 'Drop',
            workType,
            driverType,
            pickupFacilityCode: originFacility.code,
            destinationFacilityCode: destinationFacility.code,
            pickupAddress: originFacility.address,
            destinationAddress: destinationFacility.address,
            intermodalCarrier: originFacility.carrier
        });
    }

    return nextLoads;
}

// Function to get distance between two cities from the lookup table
function getDistance(from, to) {
    if (from === to) return '-'; // Same city, no distance
    return distanceLookup[from]?.[to]
        || distanceLookup[to]?.[from]
        || Math.floor(Math.random() * 3000) + 500; // Fallback to random distance
}

function buildLoadResultsSnapshot() {
    const nextLoadResults = [];
    const today = new Date().toISOString().split('T')[0];

    cities.forEach(city => {
        for (let i = 1; i <= 100; i++) {
            const destinationCity = cities[Math.floor(Math.random() * cities.length)];
            const pickupCityKey = `${city.name}, ${city.state}`;
            const destinationCityKey = `${destinationCity.name}, ${destinationCity.state}`;
            const pickupFacility = pickDemoFacilityStop(pickupCityKey, i);
            const destinationFacility = pickDemoFacilityStop(destinationCityKey, i + 700);
            const tripMiles = getDistance(pickupCityKey, destinationCityKey);
            const ratePerMile = (Math.random() * (2.3 - 1.6) + 1.6).toFixed(2);
            const truckTypes = ['V', 'VR', 'VA'];
            const f_p = Math.random() > 0.2 ? 'F' : 'P';
            const truck = truckTypes[Math.floor(Math.random() * truckTypes.length)];
            const length = Math.random() > 0.5 ? '53 ft' : '48 ft';
            const weight = `${Math.floor(Math.random() * 30000) + 5000} lbs`;

            nextLoadResults.push({
                pickupDate: today,
                truck,
                f_p,
                pickup: pickupFacility.location,
                pickupMarket: pickupCityKey,
                pickupFacilityCode: pickupFacility.facilityCode,
                pickupAddress: pickupFacility.address,
                trip: tripMiles,
                destination: destinationFacility.location,
                destinationMarket: destinationCityKey,
                destinationFacilityCode: destinationFacility.facilityCode,
                destinationAddress: destinationFacility.address,
                company: `Company ${i}`,
                contact: `555-${Math.floor(Math.random() * 9000) + 1000}`,
                length,
                weight,
                rate: `$${(tripMiles * ratePerMile).toFixed(2)}`
            });
        }
    });

    buildIntermodalLoadResults(today).forEach((load) => {
        nextLoadResults.push(load);
    });

    buildBlockLoadResults(today).forEach((load) => {
        nextLoadResults.push(load);
    });

    buildShuffleLoadResults(today).forEach((load) => {
        nextLoadResults.push(load);
    });

    buildMultiStopLoadResults(today).forEach((load) => {
        nextLoadResults.push(load);
    });

    buildRoundTripLoadResults(today).forEach((load) => {
        nextLoadResults.push(load);
    });

    return nextLoadResults;
}

function getStoredLoadResults() {
    const expectedLoadCount = (cities.length * 100)
        + INTERMODAL_TARGET_LOAD_COUNT
        + BLOCK_TARGET_LOAD_COUNT
        + SHUFFLE_TARGET_LOAD_COUNT
        + MULTI_STOP_TARGET_LOAD_COUNT
        + ROUND_TRIP_TARGET_LOAD_COUNT;
    const windowNamedResults = readWindowNamedLoadResults();

    if (Array.isArray(windowNamedResults) && windowNamedResults.length === expectedLoadCount) {
        clearLegacySessionStoredLoadResults();
        return cloneLoadResults(windowNamedResults);
    }

    try {
        const raw = sessionStorage.getItem(LOAD_RESULTS_SESSION_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === expectedLoadCount) {
                writeWindowNamedLoadResults(parsed);
                clearLegacySessionStoredLoadResults();
                return cloneLoadResults(parsed);
            }
        }
    } catch (error) {
        console.warn('Unable to read demo load results from session storage.', error);
    }

    const nextLoadResults = buildLoadResultsSnapshot();
    writeWindowNamedLoadResults(nextLoadResults);
    clearLegacySessionStoredLoadResults();

    return cloneLoadResults(nextLoadResults);
}

function getExpectedLoadResultsCount() {
    return (cities.length * 100)
        + INTERMODAL_TARGET_LOAD_COUNT
        + BLOCK_TARGET_LOAD_COUNT
        + SHUFFLE_TARGET_LOAD_COUNT
        + MULTI_STOP_TARGET_LOAD_COUNT
        + ROUND_TRIP_TARGET_LOAD_COUNT;
}

function buildLoadboardFastLoadResultsSnapshot(limit = LOADBOARD_FAST_BOOT_COUNT) {
    const today = new Date().toISOString().split('T')[0];
    const nextLoadResults = [];

    for (let index = 0; index < limit; index += 1) {
        const city = cities[index % cities.length];
        const destinationCity = cities[(index * 7 + 5) % cities.length];
        const pickupCityKey = `${city.name}, ${city.state}`;
        const destinationCityKey = `${destinationCity.name}, ${destinationCity.state}`;
        const basePickupFacility = pickDemoFacilityStop(pickupCityKey, index);
        const tripMiles = getDistance(pickupCityKey, destinationCityKey);
        const category = index % 12;
        const equipment = category === 2 ? "53' Container" : (category === 5 ? "48' Trailer" : "53' Trailer");
        const workType = category === 0 ? 'Block' : (category === 1 ? 'Shuffle' : 'One-Way/Round Trip');
        const baseDestinationFacility = (workType === 'Block' || workType === 'Shuffle')
            ? basePickupFacility
            : pickDemoFacilityStop(destinationCityKey, index + 900);
        const loadType = category % 3 === 0 ? 'Live' : 'Drop and hook';
        const ratePerMile = 1.65 + ((index % 85) / 100);
        const shouldUseMultiStopPlan = workType === 'One-Way/Round Trip' && (category === 3 || category === 8);
        const shouldUseRoundTripPlan = workType === 'One-Way/Round Trip' && category === 4;
        const routeMarkets = shouldUseRoundTripPlan
            ? buildRoundTripRouteMarkets(index)
            : (shouldUseMultiStopPlan ? buildMultiStopRouteMarkets(index) : []);
        const stopPlan = routeMarkets.map((market, stopIndex) => {
            const isRoundTripReturn = shouldUseRoundTripPlan && stopIndex === routeMarkets.length - 1;
            const originFacilityStop = pickDemoFacilityStop(routeMarkets[0], index + 5000);
            const facilityStop = isRoundTripReturn
                ? originFacilityStop
                : pickDemoFacilityStop(market, index + (stopIndex * 17));
            return {
                market,
                location: facilityStop.location,
                facilityCode: facilityStop.facilityCode,
                address: facilityStop.address
            };
        });
        const segmentMiles = routeMarkets.slice(0, -1).map((market, segmentIndex) => (
            getDeterministicMiles(market, routeMarkets[segmentIndex + 1], index + (segmentIndex * 11) + 1)
        ));
        const multiStopTripMiles = segmentMiles.reduce((sum, miles) => sum + miles, 0);
        const pickupStop = stopPlan[0];
        const destinationStop = stopPlan[stopPlan.length - 1];
        const displayTripMiles = stopPlan.length ? multiStopTripMiles : Math.max(1, tripMiles);

        nextLoadResults.push({
            pickupDate: today,
            pickupOffsetSlots: 2 + (index % 260),
            truck: equipment.includes('Container') ? 'VA' : 'V',
            f_p: 'F',
            pickup: pickupStop?.location || basePickupFacility.location,
            pickupMarket: pickupStop?.market || pickupCityKey,
            pickupFacilityCode: pickupStop?.facilityCode || basePickupFacility.facilityCode,
            pickupAddress: pickupStop?.address || basePickupFacility.address,
            trip: workType === 'Block' ? 0 : displayTripMiles,
            destination: destinationStop?.location || baseDestinationFacility.location,
            destinationMarket: destinationStop?.market || (workType === 'Block' || workType === 'Shuffle' ? pickupCityKey : destinationCityKey),
            destinationFacilityCode: destinationStop?.facilityCode || baseDestinationFacility.facilityCode,
            destinationAddress: destinationStop?.address || baseDestinationFacility.address,
            company: `Company ${index + 1}`,
            contact: `555-${String(1000 + index).padStart(4, '0')}`,
            length: equipment.includes('48') ? '48 ft' : '53 ft',
            weight: `${12000 + ((index * 137) % 28000)} lbs`,
            rate: `$${(displayTripMiles * ratePerMile).toFixed(2)}`,
            equipment,
            workType,
            loadType,
            driverType: index % 5 === 0 || stopPlan.length >= 4 ? 'Team' : 'Solo',
            stops: stopPlan.length || (workType === 'Block' ? 0 : 2),
            stopPlan: stopPlan.length ? stopPlan : undefined,
            segmentMiles: segmentMiles.length ? segmentMiles : undefined,
            isRoundTrip: shouldUseRoundTripPlan
        });
    }

    return nextLoadResults;
}

// Initialize load results
const loadResults = window.LOADBOARD_FAST_BOOT === true
    ? buildLoadboardFastLoadResultsSnapshot()
    : getStoredLoadResults();

let currentPage = 1;
const resultsPerPage = 20;
let totalPages = Math.ceil(loadResults.length / resultsPerPage);
let filteredResults = [...loadResults]; // Copy of loadResults for display

function equipmentLabel(code) {
    if (code === 'VR') return 'Reefer';
    if (code === 'VA') return 'Van (Air Ride)';
    return 'Van';
}

function companySlug(name) {
    const slug = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return slug || 'logistics';
}

function computeCompanyMeta(seed) {
    const creditScore = 85 + (seed % 15);
    const daysToPay = 14 + (seed % 21);
    return { creditScore, daysToPay };
}

function buildLoadDetailHtml(load, seed, colspan) {
    const tripLabel = load.trip === '-' ? '—' : `${load.trip} miles`;
    const loadType = load.f_p === 'F' ? 'Full' : 'Partial';
    const refId = `${companySlug(load.company).slice(0, 6).toUpperCase()}-${String(seed).padStart(4, '0')}`;
    const email = `dispatch@${companySlug(load.company)}.com`;
    const meta = computeCompanyMeta(seed);
    const colSpanValue = colspan || 11;
    const rateNumber = parseFloat(String(load.rate).replace(/[^0-9.]/g, ''));
    const tripNumber = typeof load.trip === 'number' ? load.trip : parseFloat(load.trip);
    const ratePerMile = rateNumber && tripNumber
        ? `$${(rateNumber / tripNumber).toFixed(2)}`
        : '—';

    return `
        <tr class="dropdown-content" style="display:none;">
            <td colspan="${colSpanValue}">
                <div class="load-detail">
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="detail-title">Trip</div>
                            <div class="detail-item"><span class="label">Origin</span><span class="value">${load.pickup}</span></div>
                            <div class="detail-item"><span class="label">Destination</span><span class="value">${load.destination}</span></div>
                            <div class="detail-item"><span class="label">Trip</span><span class="value">${tripLabel}</span></div>
                            <div class="detail-item"><span class="label">Pickup</span><span class="value">${load.pickupDate}</span></div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-title">Rate</div>
                            <div class="detail-item"><span class="label">Total</span><span class="value">${load.rate}</span></div>
                            <div class="detail-item"><span class="label">Trip</span><span class="value">${tripLabel}</span></div>
                            <div class="detail-item"><span class="label">Rate / mi</span><span class="value">${ratePerMile}</span></div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-title">Equipment</div>
                            <div class="detail-item"><span class="label">Load</span><span class="value">${loadType}</span></div>
                            <div class="detail-item"><span class="label">Truck</span><span class="value">${equipmentLabel(load.truck)}</span></div>
                            <div class="detail-item"><span class="label">Length</span><span class="value">${load.length}</span></div>
                            <div class="detail-item"><span class="label">Weight</span><span class="value">${load.weight}</span></div>
                            <div class="detail-item"><span class="label">Ref ID</span><span class="value">${refId}</span></div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-title">Company</div>
                            <div class="detail-item"><span class="label">Name</span><span class="value">${load.company}</span></div>
                            <div class="detail-item"><span class="label">Contact</span><span class="value">${load.contact}</span></div>
                            <div class="detail-item"><span class="label">Email</span><span class="value">${email}</span></div>
                            <div class="detail-item"><span class="label">Credit Score</span><span class="value">${meta.creditScore} CS</span></div>
                            <div class="detail-item"><span class="label">Days to Pay</span><span class="value">${meta.daysToPay}</span></div>
                        </div>
                    </div>
                    <div class="detail-notes">
                        <div class="detail-title">Comments</div>
                        <p>Call for details. Quick turnaround with flexible appointment window.</p>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

// Function to render loads
function renderLoads(page, results) {
    const tbody = document.getElementById('load-results');
    tbody.innerHTML = '';

    const resultsToRender = results || loadResults;
    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const pageResults = resultsToRender.slice(start, end);

    pageResults.forEach((load, idx) => {
        const seed = start + idx + 1;
        const row = `
        <tr class="load-row" onclick="toggleDropdown(this)">
            <td>${load.pickupDate}</td>
            <td>${load.truck}</td>
            <td>${load.f_p}</td>
            <td>${load.pickup}</td>
            <td>${load.trip} miles</td>
            <td>${load.destination}</td>
            <td>${load.company}</td>
            <td>${load.contact}</td>
            <td>${load.length}</td>
            <td>${load.weight}</td>
            <td>${load.rate}</td>
        </tr>
        ${buildLoadDetailHtml(load, seed, 11)}`;
        tbody.innerHTML += row;
    });

    document.getElementById('pagination-info').innerText = `Page ${page} of ${totalPages}`;
}

// Function to toggle dropdown content
function toggleDropdown(row) {
    const dropdown = row.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'none' ? 'table-row' : 'none';
}

// Function to change page
function changePage(offset) {
    currentPage += offset;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    renderLoads(currentPage, filteredResults);
}

// Function to filter loads
function filterLoads() {
    const truckType = document.getElementById('truck-type').value;
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const availDate = document.getElementById('avail-date').value;
    const f_p = document.getElementById('f-p').value;
    const length = document.getElementById('length').value;
    const weight = document.getElementById('weight').value;

    let results = loadResults;

    if (truckType !== 'all') {
        results = results.filter(load => load.truck === truckType);
    }
    if (origin !== 'all') {
        results = results.filter(load => load.pickup === origin);
    }
    if (destination !== 'all' && destination) {
        results = results.filter(load => load.destination === destination);

        // Update trip distances based on lookup
        results.forEach(load => {
            const tripDistance = distanceLookup[origin]?.[destination];
            if (tripDistance) {
                load.trip = tripDistance;
                load.rate = `$${(tripDistance * (Math.random() * (2.3 - 1.6) + 1.6)).toFixed(2)}`;
            }
        });
    }
    if (availDate) {
        results = results.filter(load => load.pickupDate === availDate);
    }
    if (f_p !== 'all') {
        results = results.filter(load => load.f_p === f_p);
    }
    if (length !== 'all') {
        results = results.filter(load => load.length === length);
    }
    if (weight) {
        results = results.filter(load => parseInt(load.weight) <= parseInt(weight));
    }

    filteredResults = results;
    currentPage = 1;
    totalPages = Math.ceil(filteredResults.length / resultsPerPage);
    renderLoads(currentPage, filteredResults);
}

// Function to populate dropdowns
function populateDropdowns() {
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');

    originSelect.innerHTML = '<option value="all">All</option>';
    destinationSelect.innerHTML = '<option value="all">All</option>';

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = `${city.name}, ${city.state}`;
        option.textContent = `${city.name}, ${city.state}`;
        originSelect.appendChild(option);

        const destOption = document.createElement('option');
        destOption.value = `${city.name}, ${city.state}`;
        destOption.textContent = `${city.name}, ${city.state}`;
        destinationSelect.appendChild(destOption);
    });

    console.log('Dropdowns populated');
}

const dataOnlyMode = window.DEMO_DATA_ONLY === true;

if (!dataOnlyMode) {
    const cancelButton = document.getElementById('cancel-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.reload();
        });
    }

    const availDateInput = document.getElementById('avail-date');
    if (availDateInput) {
        availDateInput.max = today;
    }

    if (document.getElementById('origin') && document.getElementById('destination')) {
        populateDropdowns();
    }

    if (document.getElementById('load-results')) {
        renderLoads(currentPage, filteredResults);
    }

    const prevButton = document.getElementById('prev');
    if (prevButton) {
        prevButton.addEventListener('click', () => changePage(-1));
    }

    const nextButton = document.getElementById('next');
    if (nextButton) {
        nextButton.addEventListener('click', () => changePage(1));
    }

    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', filterLoads);
    }
}
