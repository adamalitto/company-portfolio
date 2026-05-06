const DRIVER_ROSTER_SESSION_KEY = "amazonDemoDriverRosterState";
const REQUIRED_TRAILER_EQUIPMENT_LABEL = "53' Required";
const LEGACY_REQUIRED_TRAILER_EQUIPMENT_LABEL = "Trailer Required";
const DEFAULT_ASSIGNABLE_DRIVERS = [
    "Utkir Safarov",
    "Temur Jurakulov",
    "Shavkat Nurmatov",
    "Balbek Kadirov",
    "Sadullo Rakhimov",
    "Javokhir Usmanov",
    "Navruzbek Tursunov",
    "Dilshod Karimov",
    "Rustam Mavlonov",
    "Azizbek Ruziev"
];

function isDriverRosterReloadNavigation() {
    const navigationEntries = typeof performance.getEntriesByType === "function"
        ? performance.getEntriesByType("navigation")
        : [];

    if (navigationEntries.length) {
        return navigationEntries[0].type === "reload";
    }

    return Boolean(performance.navigation && performance.navigation.type === 1);
}

function clearDriverRosterSessionOnReload() {
    if (!isDriverRosterReloadNavigation()) {
        return;
    }

    try {
        sessionStorage.removeItem(DRIVER_ROSTER_SESSION_KEY);
    } catch (error) {
        console.warn("Unable to clear driver roster state.", error);
    }
}

function getAssignableDrivers() {
    try {
        const raw = sessionStorage.getItem(DRIVER_ROSTER_SESSION_KEY);
        if (!raw) {
            return DEFAULT_ASSIGNABLE_DRIVERS.slice();
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return DEFAULT_ASSIGNABLE_DRIVERS.slice();
        }

        return parsed
            .filter((driver) => driver && driver.eligibility === "eligible" && typeof driver.name === "string")
            .map((driver) => driver.name);
    } catch (error) {
        console.warn("Unable to read driver roster state.", error);
        return DEFAULT_ASSIGNABLE_DRIVERS.slice();
    }
}

clearDriverRosterSessionOnReload();

function parseNumber(value) {
    const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function seededValue(seed, mod, min = 0) {
    return (seed * 9301 + 49297) % mod + min;
}

function parseLocalDate(dateText) {
    if (!dateText) return new Date();
    const [year, month, day] = String(dateText).split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
}

function formatMoney(value) {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    });
}

function formatDateLabel(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function formatClockLabel(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatDateTimeLabel(date) {
    return `${formatDateLabel(date)} ${formatClockLabel(date)}`;
}

function formatDateTimeLocalInputValue(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateInputValue(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTimeInputValue(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function parseDateTimeLocalInputValue(value) {
    if (!value) return null;
    const [datePart, timePart] = String(value).split('T');
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const parsed = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateAndTimeInputValue(dateValue, timeValue) {
    if (!dateValue || !timeValue) return null;
    return parseDateTimeLocalInputValue(`${dateValue}T${timeValue}`);
}

const HALF_HOUR_TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, '0');
    const minutes = index % 2 === 0 ? '00' : '30';
    return `${hours}:${minutes}`;
});

function getLocationStateCode(locationText) {
    const match = String(locationText || '').match(/,\s*([A-Z]{2})\b/);
    return match ? match[1] : '';
}

function getLocationTimeZone(locationText) {
    return DETAIL_PANEL_TIMEZONES[getLocationStateCode(locationText)] || 'America/New_York';
}

function formatDetailStopDateTime(date, locationText) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '--';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: getLocationTimeZone(locationText),
        timeZoneName: 'short'
    }).format(date).replace(',', '');
}

function formatDetailWindowRange(startDate, endDate, locationText) {
    return `${formatDetailStopDateTime(startDate, locationText)} - ${formatDetailStopDateTime(endDate, locationText)}`;
}

function formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
    }

    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function addMinutes(date, minutes) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }
    return new Date(date.getTime() + (minutes * 60000));
}

function roundUpToTimeSlot(date, slotMinutes) {
    const slotMs = slotMinutes * 60000;
    return new Date(Math.ceil(date.getTime() / slotMs) * slotMs);
}

function facilityCode(city, seed) {
    const letters = city.split(',')[0].replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 3);
    const number = seededValue(seed, 8, 1);
    return `${letters}${number}`;
}

function pickLoadboardFacilityStop(market, seed, options = {}) {
    if (typeof window !== 'undefined' && typeof window.pickDemoFacilityStop === 'function') {
        return window.pickDemoFacilityStop(market, seed, options);
    }

    const code = facilityCode(market || 'FAC', seed);
    return {
        market,
        location: market,
        facilityCode: code,
        code,
        address: null
    };
}

const LOAD_TIME_SLOT_MINUTES = 30;
const LOAD_STOP_DWELL_MINUTES = 30;
const LOAD_TIME_ANCHOR_STORAGE_KEY = 'amazonDemoLoadTimeAnchor';

function getStoredLoadTimeAnchor() {
    try {
        const raw = sessionStorage.getItem(LOAD_TIME_ANCHOR_STORAGE_KEY);
        if (raw) {
            const parsed = new Date(raw);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn('Unable to read load board time anchor.', error);
    }

    const nextAnchor = roundUpToTimeSlot(addMinutes(new Date(), 60), LOAD_TIME_SLOT_MINUTES);

    try {
        sessionStorage.setItem(LOAD_TIME_ANCHOR_STORAGE_KEY, nextAnchor.toISOString());
    } catch (error) {
        console.warn('Unable to save load board time anchor.', error);
    }

    return nextAnchor;
}

const LOAD_TIME_ANCHOR = getStoredLoadTimeAnchor();

function buildPickupDateTime(_dateText, seed, explicitOffsetSlots = null) {
    const offsetSlots = Number.isFinite(explicitOffsetSlots)
        ? explicitOffsetSlots
        : seededValue(seed * 11, 192);
    return addMinutes(LOAD_TIME_ANCHOR, offsetSlots * LOAD_TIME_SLOT_MINUTES);
}

function combineDateAndTime(dateValue, timeValue, endOfRange = false) {
    if (!dateValue) return null;

    const combined = parseLocalDate(dateValue);
    if (timeValue) {
        const [hours, minutes] = timeValue.split(':').map(Number);
        combined.setHours(hours || 0, minutes || 0, 0, 0);
    } else if (endOfRange) {
        combined.setHours(23, 59, 59, 999);
    } else {
        combined.setHours(0, 0, 0, 0);
    }

    return combined;
}

function hashString(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

const DETAIL_PANEL_STREETS = [
    'Oak Ridge Dr',
    'Freeman Rd',
    'Commerce Dr',
    'Industrial Rd',
    'Valley View St',
    'Logistics Pkwy'
];

const DETAIL_PANEL_TIMEZONES = {
    CA: 'America/Los_Angeles',
    WA: 'America/Los_Angeles',
    OR: 'America/Los_Angeles',
    NV: 'America/Los_Angeles',
    AZ: 'America/Phoenix',
    CO: 'America/Denver',
    UT: 'America/Denver',
    ID: 'America/Denver',
    TX: 'America/Chicago',
    IL: 'America/Chicago',
    IN: 'America/Indiana/Indianapolis',
    WI: 'America/Chicago',
    MN: 'America/Chicago',
    MO: 'America/Chicago',
    KS: 'America/Chicago',
    TN: 'America/Chicago',
    AL: 'America/Chicago',
    OH: 'America/New_York',
    PA: 'America/New_York',
    NY: 'America/New_York',
    NJ: 'America/New_York',
    NC: 'America/New_York',
    SC: 'America/New_York',
    GA: 'America/New_York',
    FL: 'America/New_York',
    MD: 'America/New_York',
    VA: 'America/New_York',
    DC: 'America/New_York',
    DE: 'America/New_York',
    CT: 'America/New_York',
    MA: 'America/New_York',
    RI: 'America/New_York',
    NH: 'America/New_York',
    ME: 'America/New_York',
    VT: 'America/New_York',
    KY: 'America/New_York'
};

function buildDetailFacilityAddress(code, city, seed) {
    const zip = String(10000 + (seed % 89999)).padStart(5, '0');
    const baseNumber = 55 + (seed % 9800);
    return {
        line1: `${baseNumber} ${DETAIL_PANEL_STREETS[seed % DETAIL_PANEL_STREETS.length]}`,
        line2: `${city} ${zip}`,
        shortCode: code
    };
}

function isPickupTimeAdjusted(load) {
    const currentPickup = load?.pickupDateTime;
    const originalPickup = load?.originalPickupDateTime;

    if (!(currentPickup instanceof Date) || !(originalPickup instanceof Date)) {
        return false;
    }

    return currentPickup.getTime() !== originalPickup.getTime();
}

function buildPickupTimeLineMarkup(load) {
    const isAdjustable = Boolean(load?.isPickupAdjustable);
    const isAdjusted = isPickupTimeAdjusted(load);
    const timeClass = `muted amazon-pickup-time-line${isAdjusted ? ' is-adjusted' : ''}`;
    const iconMarkup = isAdjustable
        ? '<span class="amazon-adjustable-pickup-icon" data-tooltip="This trip has an adjustable pick-up time." aria-hidden="true">&#9998;</span>'
        : '';

    return `<span class="${timeClass}">${iconMarkup}${load.pickupWindow}</span>`;
}

function cloneRouteStopData(stops) {
    return Array.isArray(stops) ? stops.map((stop) => ({
        ...stop,
        address: stop?.address ? { ...stop.address } : stop?.address,
        arrival: stop?.arrival instanceof Date ? new Date(stop.arrival.getTime()) : stop?.arrival,
        departure: stop?.departure instanceof Date ? new Date(stop.departure.getTime()) : stop?.departure
    })) : [];
}

function cloneRouteSegmentData(segments) {
    return Array.isArray(segments) ? segments.map((segment) => ({ ...segment })) : [];
}

function cloneSegmentEquipmentStatuses(statuses) {
    return Array.isArray(statuses) ? statuses.map((status) => ({ ...status })) : [];
}

function getRawLoadStopPlan(load) {
    if (Array.isArray(load?.stopPlan) && load.stopPlan.length >= 2) {
        return load.stopPlan;
    }

    return [{
        market: load.pickupMarket || load.pickup,
        location: load.pickup,
        facilityCode: load.pickupFacilityCode,
        code: load.pickupFacilityCode,
        address: load.pickupAddress
    }, {
        market: load.destinationMarket || load.destination,
        location: load.destination,
        facilityCode: load.destinationFacilityCode,
        code: load.destinationFacilityCode,
        address: load.destinationAddress
    }];
}

function isBlockLoad(load) {
    return Boolean(load?.isBlockLoad) || String(load?.workType || '').toLowerCase() === 'block';
}

function isShuffleLoad(load) {
    return Boolean(load?.isShuffleLoad) || String(load?.workType || '').toLowerCase() === 'shuffle';
}

function isRoundTripLoad(load) {
    if (isBlockLoad(load)) {
        return false;
    }

    const rawStops = getRawLoadStopPlan(load);
    if (!Array.isArray(rawStops) || rawStops.length < 2) {
        return false;
    }

    const firstStop = rawStops[0];
    const lastStop = rawStops[rawStops.length - 1];
    const sameLocation = getStopLocationLabel(firstStop) === getStopLocationLabel(lastStop);
    const sameMarket = getStopMarketLabel(firstStop) === getStopMarketLabel(lastStop);
    const sameFacility = (firstStop?.code || firstStop?.facilityCode || '')
        && (firstStop?.code || firstStop?.facilityCode || '') === (lastStop?.code || lastStop?.facilityCode || '');

    return Boolean(load?.isRoundTrip) || (sameLocation && sameMarket) || Boolean(sameFacility);
}

function getStopLocationLabel(stop) {
    return stop?.location || stop?.city || stop?.market || '';
}

function getStopMarketLabel(stop) {
    return stop?.market || getStopLocationLabel(stop);
}

function getRouteSegmentMiles(fromStop, toStop, fallbackMiles, seed) {
    const direct = typeof distanceLookup !== 'undefined'
        ? distanceLookup[getStopMarketLabel(fromStop)]?.[getStopMarketLabel(toStop)]
        : null;
    const reverse = typeof distanceLookup !== 'undefined'
        ? distanceLookup[getStopMarketLabel(toStop)]?.[getStopMarketLabel(fromStop)]
        : null;

    if (typeof direct === 'number') return direct;
    if (typeof reverse === 'number') return reverse;
    if (typeof fallbackMiles === 'number' && Number.isFinite(fallbackMiles) && fallbackMiles > 0) {
        return fallbackMiles;
    }

    return seededValue(seed * 19, 780, 120);
}

function buildSegmentDurationMinutes(miles, driverType, seed, segmentIndex) {
    const driveMinutes = Math.round((miles / 55) * 60);
    const breakMinutes = Math.floor(miles / 550) * 30;
    const trafficBufferMinutes = seededValue((seed + 1) * (segmentIndex + 7), 41, 12);
    const soloSleeperBreakMinutes = driverType === 'Solo' && miles > 700 ? 600 : 0;
    return Math.max(90, driveMinutes + breakMinutes + trafficBufferMinutes + soloSleeperBreakMinutes);
}

function buildAmazonRouteData(load, seed, pickupDateTime, driverType) {
    const rawStops = getRawLoadStopPlan(load);
    const addressCache = new Map();
    const routeStops = rawStops.map((rawStop, stopIndex) => {
        const city = getStopLocationLabel(rawStop);
        const market = getStopMarketLabel(rawStop);
        const codeSeed = seed + (stopIndex * 17);
        const code = rawStop.code || rawStop.facilityCode || facilityCode(city || market, codeSeed);
        const addressKey = `${code}|${city || market}`;
        const cachedAddress = addressCache.get(addressKey);
        const address = rawStop.address
            ? { ...rawStop.address }
            : (cachedAddress || buildDetailFacilityAddress(code, city || market, seed + (stopIndex * 29)));

        if (!cachedAddress) {
            addressCache.set(addressKey, { ...address });
        }

        return {
            number: stopIndex + 1,
            code,
            city,
            market,
            role: stopIndex === 0
                ? 'pickup'
                : (stopIndex === rawStops.length - 1 ? 'delivery' : 'transfer'),
            address
        };
    });

    if (isBlockLoad(load) || isShuffleLoad(load)) {
        const firstStop = routeStops[0];
        const lastStop = routeStops[routeStops.length - 1];
        const durationMinutes = isBlockLoad(load)
            ? Math.max(60, Number(load.blockDurationMinutes) || (37 * 60))
            : Math.max(60, Number(load.shuffleDurationMinutes) || (12 * 60));
        const segmentMiles = isBlockLoad(load)
            ? 0
            : Math.max(1, Number(Array.isArray(load.segmentMiles) ? load.segmentMiles[0] : load.trip) || 1);

        firstStop.arrival = new Date(pickupDateTime.getTime());
        firstStop.departure = new Date(pickupDateTime.getTime());
        lastStop.arrival = addMinutes(firstStop.arrival, durationMinutes);
        lastStop.departure = new Date(lastStop.arrival.getTime());

        return {
            routeStops,
            routeSegments: [{
                index: 1,
                fromNumber: firstStop.number,
                toNumber: lastStop.number,
                fromCode: firstStop.code,
                toCode: lastStop.code,
                miles: segmentMiles,
                durationMinutes
            }],
            totalMiles: segmentMiles,
            totalDurationMinutes: durationMinutes,
            pickupDepartureDateTime: firstStop.departure,
            deliveryDateTime: lastStop.arrival,
            deliveryDepartureDateTime: lastStop.departure
        };
    }

    const routeSegments = [];
    let currentArrival = new Date(pickupDateTime.getTime());

    routeStops.forEach((stop, stopIndex) => {
        stop.arrival = new Date(currentArrival.getTime());
        stop.departure = addMinutes(stop.arrival, LOAD_STOP_DWELL_MINUTES);

        if (stopIndex >= routeStops.length - 1) {
            return;
        }

        const nextStop = routeStops[stopIndex + 1];
        const segmentMiles = getRouteSegmentMiles(
            rawStops[stopIndex],
            rawStops[stopIndex + 1],
            Array.isArray(load.segmentMiles) ? Number(load.segmentMiles[stopIndex]) : null,
            seed + (stopIndex * 23)
        );
        const durationMinutes = buildSegmentDurationMinutes(segmentMiles, driverType, seed, stopIndex);

        routeSegments.push({
            index: stopIndex + 1,
            fromNumber: stop.number,
            toNumber: nextStop.number,
            fromCode: stop.code,
            toCode: nextStop.code,
            miles: segmentMiles,
            durationMinutes
        });

        currentArrival = addMinutes(stop.departure, durationMinutes);
    });

    const totalMiles = routeSegments.reduce((sum, segment) => sum + segment.miles, 0);
    const firstStop = routeStops[0];
    const lastStop = routeStops[routeStops.length - 1];
    const totalDurationMinutes = Math.max(
        120,
        Math.round((lastStop.arrival.getTime() - firstStop.arrival.getTime()) / 60000)
    );

    return {
        routeStops,
        routeSegments,
        totalMiles,
        totalDurationMinutes,
        pickupDepartureDateTime: firstStop.departure,
        deliveryDateTime: lastStop.arrival,
        deliveryDepartureDateTime: lastStop.departure
    };
}

function buildAmazonLoad(load, index) {
    const seed = index + 1;
    const workType = load.workType || 'One-Way/Round Trip';
    const isBlock = isBlockLoad(load) || workType === 'Block';
    const isShuffle = isShuffleLoad(load) || workType === 'Shuffle';
    const pickupDateTime = buildPickupDateTime(load.pickupDate, seed, Number.isFinite(load.pickupOffsetSlots) ? load.pickupOffsetSlots : null);
    const rawMiles = isBlock
        ? 0
        : (isShuffle ? Math.max(1, parseNumber(load.trip) || 1) : (parseNumber(load.trip) || seededValue(seed, 900, 250)));
    const stopPlan = getRawLoadStopPlan(load);
    const previewOriginMarket = getStopMarketLabel(stopPlan[0]);
    const previewDestinationMarket = getStopMarketLabel(stopPlan[stopPlan.length - 1]);
    const driverType = load.driverType || ((isBlock || isShuffle) ? 'Solo' : (rawMiles >= 950 && seed % 3 === 0 ? 'Team' : 'Solo'));

    let equipment = load.equipment || "53' Trailer";
    if (isBlock || isShuffle) {
        equipment = "53' Trailer";
    } else if (!load.equipment && String(load.length).includes('48')) {
        equipment = "48' Trailer";
    } else if (!load.equipment && load.truck === 'VA' && seed % 2 === 0) {
        equipment = "53' Container";
    }

    const routeData = buildAmazonRouteData(load, seed, pickupDateTime, driverType);
    const routeStops = routeData.routeStops;
    const routeSegments = routeData.routeSegments;
    const firstStop = routeStops[0];
    const lastStop = routeStops[routeStops.length - 1];
    const miles = routeData.totalMiles || rawMiles;
    const durationTotalMinutes = routeData.totalDurationMinutes;
    const deliveryDateTime = routeData.deliveryDateTime;
    const pickupDepartureDateTime = routeData.pickupDepartureDateTime;
    const deliveryDepartureDateTime = routeData.deliveryDepartureDateTime;
    const isPickupAdjustable = (isBlock || isShuffle)
        ? false
        : (Boolean(load.isPickupAdjustable) || seed % 4 === 0 || (miles >= 1400 && seed % 3 === 0));
    const pickupAdjustmentMinutes = isPickupAdjustable
        ? (typeof load.pickupAdjustmentMinutes === 'number'
            ? load.pickupAdjustmentMinutes
            : (seededValue(seed * 13, 20, 1) * 30))
        : 0;
    const pickupWindowStartDateTime = firstStop.arrival;
    const pickupWindowEndDateTime = isPickupAdjustable
        ? addMinutes(firstStop.arrival, pickupAdjustmentMinutes)
        : firstStop.arrival;
    const priceValue = parseNumber(load.rate) || seededValue(seed, 1400, 650);
    const pricePerMileValue = (isBlock || isShuffle) ? 0 : (priceValue / Math.max(miles, 1));
    const originCode = firstStop.code;
    const destinationCode = lastStop.code;
    const loadType = load.loadType || (isBlock ? 'Block' : (isShuffle ? 'Shuffle' : (seed % 2 === 0 ? 'Drop and hook' : 'Live')));
    const segmentEquipmentStatuses = buildSegmentEquipmentStatuses({
        ...load,
        equipment,
        loadType,
        isBlockLoad: isBlock,
        isShuffleLoad: isShuffle,
        originCode,
        destinationCode
    }, routeSegments.length || 1, seed);
    const hiddenRouteData = isBlock && Array.isArray(load.futureStopPlan) && load.futureStopPlan.length >= 3
        ? buildAmazonRouteData({
            stopPlan: load.futureStopPlan,
            segmentMiles: Array.isArray(load.futureSegmentMiles) ? load.futureSegmentMiles : null,
            isRoundTrip: true
        }, seed + 5000, pickupDateTime, driverType)
        : null;

    return {
        id: seed,
        boardSource: load.boardSource || 'base',
        stopPlan: Array.isArray(load.stopPlan) ? load.stopPlan : null,
        segmentMiles: Array.isArray(load.segmentMiles) ? load.segmentMiles : null,
        isBlockLoad: isBlock,
        isShuffleLoad: isShuffle,
        isRoundTrip: Boolean(load.isRoundTrip),
        originCode,
        destinationCode,
        origin: `${originCode} ${firstStop.city}`,
        destination: `${destinationCode} ${lastStop.city}`,
        originCity: firstStop.city,
        destinationCity: lastStop.city,
        originMarket: previewOriginMarket,
        destinationMarket: previewDestinationMarket,
        pickupDateTime: firstStop.arrival,
        pickupDepartureDateTime,
        deliveryDateTime,
        deliveryDepartureDateTime,
        pickupWindow: formatDateTimeLabel(firstStop.arrival),
        deliveryWindow: formatDateTimeLabel(deliveryDateTime),
        originalPickupDateTime: new Date(firstStop.arrival.getTime()),
        originalPickupDepartureDateTime: new Date(pickupDepartureDateTime.getTime()),
        originalDeliveryDateTime: new Date(deliveryDateTime.getTime()),
        originalDeliveryDepartureDateTime: new Date(deliveryDepartureDateTime.getTime()),
        originalRouteStops: null,
        routeStops,
        routeSegments,
        segmentEquipmentStatuses,
        pickupWindowStartDateTime,
        pickupWindowEndDateTime,
        isPickupAdjustable,
        pickupAdjustmentMinutes,
        pickupEditorOpen: false,
        miles,
        equipment,
        loadType,
        price: formatMoney(priceValue),
        pricePerMile: isBlock
            ? '+ Accessories'
            : (isShuffle ? '' : `${formatMoney(pricePerMileValue)}/mi`),
        priceValue,
        pricePerMileValue,
        stops: isBlock ? 0 : routeStops.length,
        duration: formatDuration(durationTotalMinutes),
        durationTotalMinutes,
        durationHours: durationTotalMinutes / 60,
        workType,
        driverType,
        blockRevealAt: isBlock ? addMinutes(pickupDateTime, -900) : null,
        hiddenRouteStops: hiddenRouteData?.routeStops || null,
        hiddenRouteSegments: hiddenRouteData?.routeSegments || null,
        intermodalCarrier: load.intermodalCarrier || '',
        baseDeadhead: seededValue(seed, 65, 8),
        displayDeadhead: seededValue(seed, 65, 8)
    };
}

function computeDeadhead(load, originCity) {
    if (!originCity) {
        return load.baseDeadhead;
    }

    const comparisonOrigin = load.originMarket || load.originCity;

    if (originCity === load.originCity || originCity === comparisonOrigin) {
        return 0;
    }

    if (typeof distanceLookup !== 'undefined') {
        const direct = distanceLookup[originCity]?.[comparisonOrigin];
        const reverse = distanceLookup[comparisonOrigin]?.[originCity];
        const distance = direct || reverse;
        if (distance) {
            return distance;
        }
    }

    const seed = hashString(`${originCity}-${comparisonOrigin}`);
    return (seed % 900) + 120;
}

function renderDriverTypeIcons(driverType, className = 'driver-type-icons') {
    const isTeam = driverType === 'Team';
    const label = isTeam ? 'Team driver load' : 'Solo driver load';
    return `
        <span class="${className}" role="img" aria-label="${label}" title="${label}">
            <span class="driver-type-person"></span>
            ${isTeam ? '<span class="driver-type-person is-secondary"></span>' : ''}
        </span>
    `;
}

function isContainerLoad(load) {
    return String(load?.equipment || '').includes('Container');
}

function isTrailerRequiredEquipment(equipment) {
    const label = String(equipment || '').trim();
    return label === REQUIRED_TRAILER_EQUIPMENT_LABEL || label === LEGACY_REQUIRED_TRAILER_EQUIPMENT_LABEL;
}

function normalizeEquipmentForMatch(equipment) {
    const label = String(equipment || '').trim();
    return isTrailerRequiredEquipment(label) ? REQUIRED_TRAILER_EQUIPMENT_LABEL : label;
}

function getEquipmentStatusKind(load) {
    return isContainerLoad(load) ? 'container' : 'trailer';
}

function normalizeEquipmentStatusState(state) {
    return String(state || '').toLowerCase() === 'empty' ? 'empty' : 'loaded';
}

function getEquipmentStatusLabel(status) {
    const state = normalizeEquipmentStatusState(status?.state);
    const kind = status?.kind === 'container' ? 'container' : 'trailer';
    return `${state === 'loaded' ? 'Loaded' : 'Empty'} ${kind}`;
}

function renderEquipmentStatusIndicator(status) {
    if (!status) {
        return '';
    }

    const state = normalizeEquipmentStatusState(status.state);
    const kind = status.kind === 'container' ? 'container' : 'trailer';
    const label = getEquipmentStatusLabel({ state, kind });

    return `<span class="equipment-load-state-indicator is-${state}" data-tooltip="${label}" aria-label="${label}"></span>`;
}

function buildSegmentEquipmentStatuses(load, segmentCount, seed) {
    if (isBlockLoad(load)) {
        return [];
    }

    const kind = getEquipmentStatusKind(load);
    const normalizedLoadType = String(load?.loadType || '').toLowerCase();
    const shouldForceLoaded = isShuffleLoad(load) || normalizedLoadType.includes('live');
    const count = Math.max(1, Number(segmentCount) || 1);

    return Array.from({ length: count }, (_, segmentIndex) => {
        const state = shouldForceLoaded
            ? 'loaded'
            : (hashString(`${seed}:equipment-state:${load.originCode}:${load.destinationCode}:${segmentIndex}`) % 3 === 0 ? 'empty' : 'loaded');
        return { state, kind };
    });
}

function getSegmentEquipmentStatus(load, segmentIndex = 0) {
    if (isBlockLoad(load)) {
        return null;
    }

    if (Array.isArray(load?.segmentEquipmentStatuses) && load.segmentEquipmentStatuses.length) {
        const status = load.segmentEquipmentStatuses[Math.min(Math.max(0, segmentIndex), load.segmentEquipmentStatuses.length - 1)];
        return status ? {
            state: normalizeEquipmentStatusState(status.state),
            kind: status.kind === 'container' ? 'container' : 'trailer'
        } : null;
    }

    return buildSegmentEquipmentStatuses(load, Math.max(1, (load?.routeSegments || []).length || 1), load?.id || 1)[0] || null;
}

function getStopEquipmentStatus(load, stopIndex, stopCount) {
    if (isBlockLoad(load)) {
        return null;
    }

    const finalStopIndex = Math.max(0, stopCount - 1);
    const segmentIndex = stopIndex >= finalStopIndex
        ? finalStopIndex - 1
        : stopIndex;
    return getSegmentEquipmentStatus(load, Math.max(0, segmentIndex));
}

function getIntermodalFacilityLabel(load) {
    const routeCodes = [load?.originCode, load?.destinationCode]
        .map((code) => String(code || '').toUpperCase());

    if (load?.intermodalCarrier) return `UIIA (${load.intermodalCarrier})`;
    if (routeCodes.some((code) => code.startsWith('CSX'))) return 'UIIA (CSX)';
    if (routeCodes.some((code) => code.startsWith('BNSF'))) return 'UIIA (BNSF)';
    if (routeCodes.some((code) => code.startsWith('UPRR'))) return 'UIIA (UPRR)';
    if (routeCodes.some((code) => code.startsWith('NS'))) return 'UIIA (NS)';
    return '';
}

function getLoadEquipmentDisplay(load) {
    if (isTrailerRequiredEquipment(load?.equipment)) {
        return REQUIRED_TRAILER_EQUIPMENT_LABEL;
    }

    return isContainerLoad(load) ? "53' Container and Chassis" : load.equipment;
}

function renderEquipmentDisplay(load, equipmentStatus = null, options = {}) {
    const isTrailerRequired = isTrailerRequiredEquipment(getLoadEquipmentDisplay(load));
    const showEquipmentStatus = Boolean(options.showEquipmentStatus && equipmentStatus);
    return `
        <span class="amazon-equipment-label">
            ${showEquipmentStatus ? renderEquipmentStatusIndicator(equipmentStatus) : ''}
            <strong>${getLoadEquipmentDisplay(load)}</strong>
            <span class="amazon-equipment-pill${isTrailerRequired ? ' is-required' : ''}">${isTrailerRequired ? 'R' : 'P'}</span>
        </span>
    `;
}

function renderLoadTypeDisplay(load) {
    if (isBlockLoad(load)) {
        return '';
    }

    if (isShuffleLoad(load)) {
        return `<span class="amazon-type">Shuffle</span>`;
    }

    const typeLabel = isContainerLoad(load) ? 'Drop' : load.loadType;
    const intermodalLabel = isContainerLoad(load) ? getIntermodalFacilityLabel(load) : '';
    const subLabel = intermodalLabel || (!isContainerLoad(load) ? load.workType : '');
    return `
        <span class="amazon-type">${typeLabel}</span>
        ${subLabel ? `<span class="muted">${subLabel}</span>` : ''}
    `;
}

function renderEmptyState(container, message) {
    container.innerHTML = `<div class="amazon-empty-state">${message}</div>`;
}

const RESULTS_PER_PAGE = 50;
const SIMILAR_RESULTS_PREVIEW_COUNT = 10;
const DEFAULT_SPOTLIGHT_LOAD_COUNT = 500;
const RESERVED_BOARD_LOAD_COUNT = 1000;
const TRAILER_REQUIRED_LOAD_COUNT = 500;
const SYNTHETIC_TRAILER_REQUIRED_START_INDEX = 100000;
const SYNTHETIC_RESERVED_START_INDEX = SYNTHETIC_TRAILER_REQUIRED_START_INDEX + TRAILER_REQUIRED_LOAD_COUNT;
const SYNTHETIC_FULL_BOARD_START_INDEX = SYNTHETIC_RESERVED_START_INDEX + RESERVED_BOARD_LOAD_COUNT;
const FULL_BOARD_HYDRATION_BATCH_SIZE = 220;
const NEW_BOARD_LOAD_HIGHLIGHT_MS = 5 * 60000;
const RESERVED_RELEASE_STORAGE_KEY = 'amazonDemoReleasedReservedLoadKeys';
const PAT_RESERVED_SEARCH_DELAY_MS = 60000;
const PAT_AUTO_BOOK_DELAY_MS = 60000;
const BOOKED_TRIPS_STORAGE_KEY = 'amazonDemoBookedTrips';
const LOADBOARD_STATE_STORAGE_KEY = 'amazonDemoLoadboardState';
const DEFAULT_ORIGIN_MATCH_RADIUS = 250;

function getNavigationType() {
    const entries = typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function'
        ? performance.getEntriesByType('navigation')
        : [];

    if (entries && entries.length) {
        return entries[0].type;
    }

    if (typeof performance !== 'undefined' && performance.navigation) {
        if (performance.navigation.type === 1) {
            return 'reload';
        }
        if (performance.navigation.type === 2) {
            return 'back_forward';
        }
    }

    return 'navigate';
}

function resetBookedTripsOnReload() {
    if (getNavigationType() === 'reload') {
        sessionStorage.removeItem(BOOKED_TRIPS_STORAGE_KEY);
    }
}

function resetPatOrdersOnReload() {
    if (getNavigationType() === 'reload') {
        sessionStorage.removeItem(PAT_ORDER_STORAGE_KEY);
    }
}

function getDisplayPriceState(load) {
    const change = loadboardPriceChangeMap.get(getLoadKey(load));
    if (!change) {
        return {
            priceValue: load.priceValue,
            pricePerMileValue: load.pricePerMileValue,
            price: load.price,
            pricePerMile: load.pricePerMile,
            direction: '',
            version: 0
        };
    }

    return {
        priceValue: load.priceValue,
        pricePerMileValue: load.pricePerMileValue,
        price: load.price,
        pricePerMile: load.pricePerMile,
        direction: change.direction,
        version: change.version
    };
}

function applyPriceChangeToLoad(load, change) {
    if (!load || !change) {
        return;
    }

    load.priceValue = change.nextPriceValue;
    load.pricePerMileValue = change.nextPricePerMileValue;
    load.price = formatMoney(load.priceValue);
    load.pricePerMile = load.pricePerMileValue > 0 ? `${formatMoney(load.pricePerMileValue)}/mi` : load.pricePerMile;
    load.marketPriceVersion = change.version;
}

function expireOldPriceChanges(now = Date.now()) {
    loadboardPriceChangeMap.forEach((change, loadKey) => {
        if (change.expiresAt <= now) {
            loadboardPriceChangeMap.delete(loadKey);
        }
    });
}

function createLoadPriceChange(load, now = Date.now()) {
    if (!load || isBlockLoad(load) || isShuffleLoad(load)) {
        return null;
    }

    const seed = hashString(`${loadboardRefreshGeneration}:${load.id}:${load.originCode}:${load.destinationCode}`);
    const direction = seed % 2 === 0 ? 'up' : 'down';
    const percent = 0.001 + ((seed % 490) / 10000);
    const signedPercent = direction === 'up' ? percent : -percent;
    const nextPriceValue = Math.max(25, Math.round(load.priceValue * (1 + signedPercent) * 100) / 100);
    const nextPricePerMileValue = load.miles > 0 ? nextPriceValue / load.miles : load.pricePerMileValue;
    const ttlMinutes = 1 + (seed % 5);

    return {
        direction,
        percent,
        previousPriceValue: load.priceValue,
        nextPriceValue,
        previousPricePerMileValue: load.pricePerMileValue,
        nextPricePerMileValue,
        version: ++loadboardPriceChangeVersion,
        createdAt: now,
        expiresAt: now + (ttlMinutes * 60000)
    };
}

function getLoadPriceChangeInterval(load) {
    const seed = hashString(`rate-window:${load?.id || 0}:${load?.originCode || ''}:${load?.destinationCode || ''}`);
    return (1 + (seed % 5)) * 60000;
}

function getPendingPriceChange(load) {
    const loadKey = getLoadKey(load);
    if (!load || isBlockLoad(load) || isShuffleLoad(load) || loadboardPriceChangeMap.has(loadKey)) {
        return null;
    }

    const existingChange = pendingLoadboardPriceChangeMap.get(loadKey);
    if (existingChange) {
        return existingChange;
    }

    const elapsedSinceRefresh = Date.now() - loadboardLastRefreshedAt.getTime();
    const isEligibleForChange = hashString(`stale-rate:${load.id}:${load.originCode}:${load.destinationCode}`) % 8 === 0;
    if (!isEligibleForChange || elapsedSinceRefresh < getLoadPriceChangeInterval(load)) {
        return null;
    }

    const nextChange = createLoadPriceChange(load);
    if (nextChange) {
        pendingLoadboardPriceChangeMap.set(loadKey, nextChange);
    }

    return nextChange;
}

function markVisiblePriceChanges(visibleLoads) {
    const now = Date.now();
    expireOldPriceChanges(now);

    visibleLoads.forEach((load) => {
        const loadKey = getLoadKey(load);
        const pendingChange = pendingLoadboardPriceChangeMap.get(loadKey);
        if (pendingChange) {
            applyPriceChangeToLoad(load, pendingChange);
            loadboardPriceChangeMap.set(loadKey, {
                ...pendingChange,
                expiresAt: now + (getLoadPriceChangeInterval(load))
            });
            pendingLoadboardPriceChangeMap.delete(loadKey);
        }
    });

    const existingVisibleChangeCount = visibleLoads
        .filter((load) => loadboardPriceChangeMap.has(getLoadKey(load)))
        .length;
    const maxVisibleChanges = 5;
    const remainingChangeSlots = Math.max(0, maxVisibleChanges - existingVisibleChangeCount);
    if (!remainingChangeSlots) {
        return;
    }

    const candidates = visibleLoads
        .filter((load) => (
            !isBlockLoad(load)
            && !isShuffleLoad(load)
            && !loadboardPriceChangeMap.has(getLoadKey(load))
            && !pendingLoadboardPriceChangeMap.has(getLoadKey(load))
        ));
    if (!candidates.length) {
        return;
    }

    const targetCount = Math.min(remainingChangeSlots, Math.max(1, Math.floor(candidates.length * 0.08)));
    const ranked = candidates
        .map((load) => ({
            load,
            rank: hashString(`${loadboardRefreshGeneration}:price:${load.id}:${load.originCode}:${load.destinationCode}`)
        }))
        .sort((left, right) => left.rank - right.rank)
        .slice(0, targetCount);

    ranked.forEach(({ load }) => {
        const change = createLoadPriceChange(load, now);
        if (change) {
            applyPriceChangeToLoad(load, change);
            loadboardPriceChangeMap.set(getLoadKey(load), change);
        }
    });
}

function showBookingStatusChangedError() {
    if (!detailPanel) return;

    let alertBox = detailPanel.querySelector('.detail-booking-alert');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.className = 'detail-booking-alert';
        const priceBlock = detailPanel.querySelector('.detail-panel-price');
        priceBlock?.insertAdjacentElement('afterend', alertBox);
    }

    alertBox.textContent = 'Trip status has changed. Refresh the Load Board to see the updated rate before booking.';
}

function renderAmazonRows(list, container, highlight, emptyMessage = 'No loads match the current criteria.') {
    container.innerHTML = '';

    if (!list.length) {
        renderEmptyState(container, emptyMessage);
        return;
    }

    list.forEach((load) => {
        const originStopNumber = load.routeStops?.[0]?.number || 1;
        const finalStopNumber = load.routeStops?.[load.routeStops.length - 1]?.number || load.stops || 2;
        const blockLoad = isBlockLoad(load);
        const shuffleLoad = isShuffleLoad(load);
        const usesDotBadge = blockLoad || shuffleLoad;
        const priceState = getDisplayPriceState(load);
        const rowIsNew = isNewBoardLoad(load);
        const row = document.createElement('div');
        row.className = `amazon-load-row${highlight ? ' recent' : ''}${rowIsNew ? ' is-new-board-load' : ''}${priceState.direction ? ` is-rate-${priceState.direction}` : ''}${activeDetailId === load.id ? ' is-active' : ''}`;
        row.dataset.id = String(load.id);
        row.dataset.driverType = load.driverType || '';
        row.innerHTML = `
            <div class="amazon-col">
                <div class="amazon-deadhead">${load.displayDeadhead.toFixed(0)} mi</div>
                <div class="muted">Deadhead</div>
            </div>
            <div class="amazon-col">
                <div class="amazon-stop-line">
                    <span class="amazon-stop-badge${usesDotBadge ? ' is-block' : ''}">${usesDotBadge ? '' : originStopNumber}</span>
                    <strong>${load.origin}</strong>
                </div>
                ${buildPickupTimeLineMarkup(load)}
            </div>
            <div class="amazon-col">
                <div class="amazon-stop-line">
                    <span class="amazon-stop-badge${usesDotBadge ? ' is-block' : ''}">${usesDotBadge ? '' : finalStopNumber}</span>
                    <strong>${load.destination}</strong>
                </div>
                <span class="muted">${load.deliveryWindow}</span>
            </div>
            <div class="amazon-col">
                <strong>${blockLoad ? 'Block' : `${load.miles.toFixed(0)} mi`}</strong>
                <span class="muted">${load.duration}</span>
            </div>
            <div class="amazon-col amazon-driver-type-cell">
                ${renderDriverTypeIcons(load.driverType)}
            </div>
            <div class="amazon-col">
                <span class="amazon-equipment">${renderEquipmentDisplay(load)}</span>
            </div>
            <div class="amazon-col">
                ${renderLoadTypeDisplay(load)}
            </div>
            <div class="price${priceState.direction ? ` is-rate-${priceState.direction}` : ''}">
                <strong>${priceState.price}</strong>
                <span>${priceState.pricePerMile}</span>
                <span class="amazon-row-arrow">&rsaquo;</span>
            </div>
        `;
        row.addEventListener('click', () => openDetailPanel(load));
        container.appendChild(row);
    });
}

function syncActiveLoadRowSelection() {
    document.querySelectorAll('.amazon-load-row.is-active').forEach((row) => {
        row.classList.remove('is-active');
    });

    if (!activeDetailId) {
        return;
    }

    const activeRow = document.querySelector(`.amazon-load-row[data-id="${activeDetailId}"]`);
    activeRow?.classList.add('is-active');
}

function getCityKeyByIndex(index) {
    const city = cities[Math.abs(index) % cities.length];
    return `${city.name}, ${city.state}`;
}

function getSyntheticDistance(origin, destination, seed) {
    if (origin === destination) {
        return 42 + (seed % 180);
    }

    const direct = typeof distanceLookup !== 'undefined' ? distanceLookup[origin]?.[destination] : null;
    const reverse = typeof distanceLookup !== 'undefined' ? distanceLookup[destination]?.[origin] : null;
    return direct || reverse || (240 + (seed % 2100));
}

function buildSyntheticRoutePlan(index, seed, options = {}) {
    const stopCount = Math.max(3, Math.min(5, options.stopCount || (3 + (seed % 3))));
    const origin = options.origin || getCityKeyByIndex(seed + index);
    const routeMarkets = [origin];

    for (let stopIndex = 1; stopIndex < stopCount; stopIndex += 1) {
        const isFinalRoundTripStop = options.isRoundTrip && stopIndex === stopCount - 1;
        let market = isFinalRoundTripStop
            ? origin
            : getCityKeyByIndex(seed + index + (stopIndex * 11) + 3);

        while (!isFinalRoundTripStop && routeMarkets.includes(market)) {
            market = getCityKeyByIndex(hashString(`${market}:${stopIndex}:${seed}`) + stopIndex);
        }

        routeMarkets.push(market);
    }

    const originStop = pickLoadboardFacilityStop(origin, seed);
    const stopPlan = routeMarkets.map((market, stopIndex) => {
        const facilityStop = options.isRoundTrip && stopIndex === routeMarkets.length - 1
            ? originStop
            : pickLoadboardFacilityStop(market, seed + (stopIndex * 17));

        return {
            market,
            location: facilityStop.location,
            facilityCode: facilityStop.facilityCode,
            address: facilityStop.address
        };
    });

    const segmentMiles = routeMarkets.slice(0, -1).map((market, segmentIndex) => (
        getSyntheticDistance(market, routeMarkets[segmentIndex + 1], seed + (segmentIndex * 23))
    ));

    return {
        stopPlan,
        segmentMiles,
        totalMiles: segmentMiles.reduce((sum, miles) => sum + miles, 0)
    };
}

function buildSyntheticLoadRecord(index, options = {}) {
    const seed = hashString(`${options.kind || 'synthetic'}:${index}:loadboard-demo`);
    const origin = getCityKeyByIndex(seed + index);
    let destination = getCityKeyByIndex(Math.floor(seed / 7) + index + 3);
    if (destination === origin) {
        destination = getCityKeyByIndex(seed + index + 9);
    }

    const isFullBoardLoad = options.kind === 'full-board';
    const shouldBuildRoutePlan = isFullBoardLoad && seed % 4 === 0;
    const shouldBuildRoundTripPlan = isFullBoardLoad && !shouldBuildRoutePlan && seed % 13 === 0;
    const fullBoardWorkType = seed % 31 === 0
        ? 'Block'
        : (seed % 17 === 0 ? 'Shuffle' : 'One-Way/Round Trip');
    const workType = options.workType || (isFullBoardLoad ? fullBoardWorkType : 'One-Way/Round Trip');
    const routePlan = workType === 'One-Way/Round Trip' && (shouldBuildRoutePlan || shouldBuildRoundTripPlan)
        ? buildSyntheticRoutePlan(index, seed, {
            origin,
            isRoundTrip: shouldBuildRoundTripPlan,
            stopCount: shouldBuildRoundTripPlan ? 4 + (seed % 2) : 3 + (seed % 3)
        })
        : null;
    const trip = routePlan
        ? routePlan.totalMiles
        : workType === 'Block'
        ? 0
        : (workType === 'Shuffle' ? 5 + (seed % 46) : getSyntheticDistance(origin, destination, seed));
    const ratePerMile = 1.72 + ((seed % 92) / 100);
    const pickupOffsetSlots = 2 + (seed % 320);
    const driverType = seed % 5 === 0 ? 'Team' : 'Solo';
    const loadType = options.loadType || (workType === 'Block'
        ? 'Block'
        : (workType === 'Shuffle' ? 'Shuffle' : (seed % 3 === 0 ? 'Live' : 'Drop and hook')));
    const equipment = options.equipment || (isFullBoardLoad && workType === 'One-Way/Round Trip'
        ? (seed % 11 === 0 ? "53' Container" : (seed % 7 === 0 ? "48' Trailer" : "53' Trailer"))
        : "53' Trailer");
    const today = new Date().toISOString().split('T')[0];
    const company = options.kind === 'reserved'
        ? `Reserved Board Load ${index + 1}`
        : (options.kind === 'full-board'
            ? (routePlan ? `Relay Multi-stop ${String(index + 1).padStart(4, '0')}` : `Board Load ${index + 1}`)
            : `53' Required Load ${index + 1}`);
    const pickupStop = routePlan?.stopPlan?.[0];
    const destinationStop = routePlan?.stopPlan?.[routePlan.stopPlan.length - 1];
    const startsAtVendor = isTrailerRequiredEquipment(equipment) && seed % 4 === 0;
    const basePickupStop = pickupStop || pickLoadboardFacilityStop(origin, seed, { vendor: startsAtVendor });
    const baseDestinationStop = destinationStop || ((workType === 'Block' || workType === 'Shuffle')
        ? basePickupStop
        : pickLoadboardFacilityStop(destination, seed + 701));

    return {
        pickupDate: today,
        pickupOffsetSlots,
        truck: isTrailerRequiredEquipment(equipment) ? 'TR' : 'V',
        f_p: 'F',
        pickup: basePickupStop.location,
        pickupMarket: basePickupStop.market || origin,
        pickupFacilityCode: basePickupStop.facilityCode,
        pickupAddress: basePickupStop.address,
        trip,
        destination: baseDestinationStop.location,
        destinationMarket: baseDestinationStop.market || ((workType === 'Block' || workType === 'Shuffle') ? origin : destination),
        destinationFacilityCode: baseDestinationStop.facilityCode,
        destinationAddress: baseDestinationStop.address,
        company,
        contact: `555-${String(5000 + (seed % 4000)).padStart(4, '0')}`,
        length: "53 ft",
        weight: `${18000 + (seed % 26000)} lbs`,
        rate: formatMoney(trip * ratePerMile),
        equipment,
        loadType,
        workType,
        driverType,
        stops: routePlan?.stopPlan?.length || (workType === 'Block' ? 0 : 2),
        stopPlan: routePlan?.stopPlan,
        segmentMiles: routePlan?.segmentMiles,
        isRoundTrip: Boolean(shouldBuildRoundTripPlan),
        boardSource: options.kind || 'synthetic'
    };
}

function buildSyntheticAmazonLoads(count, options = {}, startIndex = 0) {
    return Array.from({ length: count }, (_, index) => {
        const load = buildAmazonLoad(buildSyntheticLoadRecord(index, options), startIndex + index);
        load.boardSource = options.kind || 'synthetic';
        if (options.kind === 'reserved') {
            load.isReservedBoardLoad = true;
        }
        return load;
    });
}

function readReleasedReservedLoadRecords() {
    try {
        const parsed = JSON.parse(sessionStorage.getItem(RESERVED_RELEASE_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
        console.warn('Unable to read released reserved loads.', error);
        return {};
    }
}

function saveReleasedReservedLoadRecords(records) {
    try {
        sessionStorage.setItem(RESERVED_RELEASE_STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.warn('Unable to save released reserved loads.', error);
    }
}

let baseAmazonLoads = loadResults.map(buildAmazonLoad);
const trailerRequiredAmazonLoads = buildSyntheticAmazonLoads(
    TRAILER_REQUIRED_LOAD_COUNT,
    { kind: 'trailer-required', equipment: REQUIRED_TRAILER_EQUIPMENT_LABEL },
    SYNTHETIC_TRAILER_REQUIRED_START_INDEX
);
const releasedReservedLoadRecords = readReleasedReservedLoadRecords();
let reservedAmazonLoads = [];
let reservedAmazonLoadKeyMap = new Map();
let amazonLoads = baseAmazonLoads.concat(trailerRequiredAmazonLoads);
const expectedRawLoadCount = typeof getExpectedLoadResultsCount === 'function' ? getExpectedLoadResultsCount() : loadResults.length;
const loadboardDemoInventoryCount = expectedRawLoadCount + TRAILER_REQUIRED_LOAD_COUNT;
let fullAmazonLoadsHydrated = loadResults.length >= expectedRawLoadCount;
let fullAmazonLoadsHydrating = false;
let fullAmazonHydrationTimer = null;
let fullAmazonSyntheticGeneratedCount = 0;
let fullAmazonHydrationCallbacks = [];
let amazonLoadKeyMap = new Map(amazonLoads.map((load) => [getLoadKey(load), load]));
let amazonLoadsByPickupTime = [...amazonLoads].sort((left, right) => left.pickupDateTime.getTime() - right.pickupDateTime.getTime());

function ensureReservedAmazonLoads() {
    if (reservedAmazonLoads.length) {
        return;
    }

    reservedAmazonLoads = buildSyntheticAmazonLoads(
        RESERVED_BOARD_LOAD_COUNT,
        { kind: 'reserved' },
        SYNTHETIC_RESERVED_START_INDEX
    );
    reservedAmazonLoadKeyMap = new Map(reservedAmazonLoads.map((load) => [getLoadKey(load), load]));
}

function getFullAmazonBaseLoadTargetCount() {
    return Math.max(baseAmazonLoads.length, expectedRawLoadCount);
}

function isFullAmazonHydrationNeeded() {
    return baseAmazonLoads.length < getFullAmazonBaseLoadTargetCount();
}

function rebuildAmazonLoadIndexes() {
    amazonLoads = baseAmazonLoads.concat(trailerRequiredAmazonLoads);
    amazonLoadKeyMap = new Map(amazonLoads.map((load) => [getLoadKey(load), load]));
    amazonLoadsByPickupTime = [...amazonLoads].sort((left, right) => left.pickupDateTime.getTime() - right.pickupDateTime.getTime());
}

function buildFullBoardAmazonLoad(index) {
    const load = buildAmazonLoad(
        buildSyntheticLoadRecord(index, { kind: 'full-board' }),
        SYNTHETIC_FULL_BOARD_START_INDEX + index
    );
    load.boardSource = 'full-board';
    return load;
}

function finishFullAmazonHydration() {
    if (fullAmazonHydrationTimer) {
        window.clearTimeout(fullAmazonHydrationTimer);
        fullAmazonHydrationTimer = null;
    }

    fullAmazonLoadsHydrating = false;
    fullAmazonLoadsHydrated = true;
    rebuildAmazonLoadIndexes();
    hydrateReleasedReservedLoads();

    const callbacks = fullAmazonHydrationCallbacks;
    fullAmazonHydrationCallbacks = [];
    callbacks.forEach((callback) => {
        if (typeof callback === 'function') {
            callback();
        }
    });
}

function runFullAmazonHydrationChunk() {
    const remaining = getFullAmazonBaseLoadTargetCount() - baseAmazonLoads.length;
    if (remaining <= 0) {
        finishFullAmazonHydration();
        return;
    }

    const batchSize = Math.min(FULL_BOARD_HYDRATION_BATCH_SIZE, remaining);
    const additions = [];
    for (let offset = 0; offset < batchSize; offset += 1) {
        const load = buildFullBoardAmazonLoad(fullAmazonSyntheticGeneratedCount);
        fullAmazonSyntheticGeneratedCount += 1;
        additions.push(load);
    }

    additions.forEach((load) => {
        baseAmazonLoads.push(load);
        amazonLoads.push(load);
        amazonLoadKeyMap.set(getLoadKey(load), load);
    });
    refreshFullBoardHydrationProgressText();

    if (isFullAmazonHydrationNeeded()) {
        fullAmazonHydrationTimer = window.setTimeout(runFullAmazonHydrationChunk, 0);
        return;
    }

    finishFullAmazonHydration();
}

function ensureFullAmazonLoadsAsync(callback) {
    if (!isFullAmazonHydrationNeeded()) {
        fullAmazonLoadsHydrated = true;
        if (typeof callback === 'function') {
            callback();
        }
        return false;
    }

    fullAmazonLoadsHydrated = false;
    if (typeof callback === 'function') {
        fullAmazonHydrationCallbacks.push(callback);
    }

    if (!fullAmazonLoadsHydrating) {
        fullAmazonLoadsHydrating = true;
        fullAmazonHydrationTimer = window.setTimeout(runFullAmazonHydrationChunk, 0);
    }

    return true;
}

function isLoadOnBoard(load) {
    return Boolean(load && amazonLoadKeyMap.has(getLoadKey(load)));
}

function sortLoadsByPickupTime() {
    amazonLoadsByPickupTime.sort((left, right) => left.pickupDateTime.getTime() - right.pickupDateTime.getTime());
}

function isNewBoardLoad(load, now = Date.now()) {
    return Boolean(load?.newBoardLoadPostedAt)
        && now - load.newBoardLoadPostedAt < NEW_BOARD_LOAD_HIGHLIGHT_MS;
}

function getRecentLoadChange(load, now = Date.now()) {
    const change = loadboardPriceChangeMap.get(getLoadKey(load));
    if (!change || (change.expiresAt && change.expiresAt <= now)) {
        return null;
    }

    return change;
}

function isRecentlyChangedBoardLoad(load, now = Date.now()) {
    return Boolean(getRecentLoadChange(load, now));
}

function getLoadRelevanceActivity(load, now = Date.now()) {
    const isNewLoad = isNewBoardLoad(load, now);
    const recentChange = getRecentLoadChange(load, now);
    const activityAt = Math.max(
        isNewLoad ? Number(load.newBoardLoadPostedAt) || 0 : 0,
        recentChange ? Number(recentChange.createdAt) || 0 : 0
    );

    return {
        isActive: Boolean(activityAt),
        activityAt
    };
}

function releaseReservedLoad(load, postedAt = Date.now()) {
    if (!load) {
        return false;
    }

    const loadKey = getLoadKey(load);
    if (amazonLoadKeyMap.has(loadKey)) {
        return false;
    }

    load.isReservedBoardLoad = false;
    load.isNewBoardLoad = true;
    load.newBoardLoadPostedAt = postedAt;
    amazonLoads.push(load);
    amazonLoadKeyMap.set(loadKey, load);
    amazonLoadsByPickupTime.push(load);
    sortLoadsByPickupTime();

    releasedReservedLoadRecords[loadKey] = postedAt;
    saveReleasedReservedLoadRecords(releasedReservedLoadRecords);
    return true;
}

function hydrateReleasedReservedLoads() {
    ensureReservedAmazonLoads();
    Object.entries(releasedReservedLoadRecords).forEach(([loadKey, postedAt]) => {
        const load = reservedAmazonLoadKeyMap.get(loadKey);
        if (load) {
            releaseReservedLoad(load, Number(postedAt) || Date.now());
        }
    });
}

function getHiddenReservedLoads() {
    ensureReservedAmazonLoads();
    return reservedAmazonLoads.filter((load) => !isLoadOnBoard(load) && !bookedLoadKeys.has(getLoadKey(load)));
}

function releaseRandomReservedLoads() {
    const hiddenLoads = getHiddenReservedLoads();
    if (!hiddenLoads.length) {
        return [];
    }

    const seed = hashString(`${loadboardRefreshGeneration}:${Date.now()}:reserved-release`);
    const releaseCount = Math.min(hiddenLoads.length, 1 + (seed % 8));
    const releasedLoads = hiddenLoads
        .map((load) => ({
            load,
            rank: hashString(`${seed}:${load.id}:${load.originCode}:${load.destinationCode}`)
        }))
        .sort((left, right) => left.rank - right.rank)
        .slice(0, releaseCount)
        .map(({ load }) => load);

    releasedLoads.forEach((load) => releaseReservedLoad(load));
    return releasedLoads;
}

if (Object.keys(releasedReservedLoadRecords).length) {
    hydrateReleasedReservedLoads();
}

const recentContainer = document.getElementById('amazon-recent-list');
const similarContainer = document.getElementById('amazon-similar-list');
const resultsCount = document.getElementById('amazon-results-count');
const recentTitle = document.getElementById('amazon-recent-title');
const recentCount = document.getElementById('amazon-recent-count');
const similarCount = document.getElementById('amazon-similar-count');
const chipRow = document.getElementById('amazon-chip-row');
const criteriaHeadline = document.getElementById('amazon-criteria-headline');
const criteriaSubtext = document.getElementById('amazon-criteria-subtext');
const paginationContainer = document.getElementById('amazon-pagination');
const detailPanel = document.getElementById('amazon-detail-panel');
const resultsPanel = document.querySelector('.amazon-results');
const resultsShell = document.querySelector('.amazon-results-shell');
const searchRail = document.getElementById('amazon-search-rail');
const newSearchButton = document.getElementById('amazon-new-search-button');
const sortControl = document.getElementById('amazon-sort-control');
const sortTrigger = document.getElementById('amazon-sort-trigger');
const sortLabel = document.getElementById('amazon-sort-label');
const sortMenu = document.getElementById('amazon-sort-menu');
const loadboardViewTabs = document.querySelectorAll('[data-loadboard-view-target]');
const loadboardViews = document.querySelectorAll('[data-loadboard-view]');
const createOrderButtons = document.querySelectorAll('[data-open-create-order]');
const postATruckReturnButtons = document.querySelectorAll('[data-open-post-a-truck]');
const createOrderSections = document.querySelectorAll('[data-pat-section]');
const createOrderSectionToggles = document.querySelectorAll('[data-pat-section-toggle]');
const orderTypeCards = document.querySelectorAll('[data-pat-order-type]');
const orderTypeDetails = document.getElementById('pat-order-type-details');
const createOrderOriginSelect = document.getElementById('pat-location-origin');
const createOrderOriginRadiusSelect = document.getElementById('pat-location-origin-radius');
const createOrderDestinationSelect = document.getElementById('pat-location-destination');
const createOrderDestinationRadiusSelect = document.getElementById('pat-location-destination-radius');
const createOrderExcludedSelect = document.getElementById('pat-location-excluded');
const createOrderOrderTypeSection = document.getElementById('pat-create-order-type-section');
const createOrderLocationSection = document.getElementById('pat-create-location-section');
const createOrderScheduleSection = document.getElementById('pat-create-schedule-section');
const createOrderPayoutSection = document.getElementById('pat-create-payout-section');
const scheduleStartDateInput = document.getElementById('pat-schedule-start-date');
const scheduleStartTimeInput = document.getElementById('pat-schedule-start-time');
const scheduleStartWindowSelect = document.getElementById('pat-schedule-start-window');
const scheduleEndDateInput = document.getElementById('pat-schedule-end-date');
const scheduleEndTimeInput = document.getElementById('pat-schedule-end-time');
const scheduleStemTimeSelect = document.getElementById('pat-schedule-stem-time');
const scheduleTripLengthSelect = document.getElementById('pat-schedule-trip-length');
const scheduleMinRangeInput = document.getElementById('pat-schedule-min-range');
const scheduleMaxRangeInput = document.getElementById('pat-schedule-max-range');
const scheduleMinLabel = document.getElementById('pat-schedule-min-label');
const scheduleMaxLabel = document.getElementById('pat-schedule-max-label');
const scheduleMaxStopsSelect = document.getElementById('pat-schedule-max-stops');
const scheduleDriversSelect = document.getElementById('pat-schedule-drivers');
const payoutPricePerMileInput = document.getElementById('pat-payout-price-per-mile');
const payoutMinPayoutInput = document.getElementById('pat-payout-min-payout');
const orderTypeSummary = document.getElementById('pat-summary-order-type');
const locationSummary = document.getElementById('pat-summary-location');
const scheduleSummary = document.getElementById('pat-summary-schedule');
const payoutSummary = document.getElementById('pat-summary-payout');
let createOrderSubmitButton = document.getElementById('pat-create-submit');
const confirmOverlay = document.getElementById('pat-confirm-overlay');
const confirmCloseButton = document.getElementById('pat-confirm-close');
const confirmCancelButton = document.getElementById('pat-confirm-cancel');
const confirmSubmitButton = document.getElementById('pat-confirm-submit');
const confirmRoute = document.getElementById('pat-confirm-route');
const confirmMeta = document.getElementById('pat-confirm-meta');
const confirmPayout = document.getElementById('pat-confirm-payout');
const cancelOverlay = document.getElementById('pat-cancel-overlay');
const cancelCloseButton = document.getElementById('pat-cancel-close');
const cancelCancelButton = document.getElementById('pat-cancel-cancel');
const cancelConfirmButton = document.getElementById('pat-cancel-confirm');
const cancelCopy = document.getElementById('pat-cancel-copy');
const createToast = document.getElementById('pat-create-toast');
const createToastMessage = document.getElementById('pat-create-toast-message');
const createToastCloseButton = document.getElementById('pat-create-toast-close');
const patOrderStatusTabs = document.querySelectorAll('[data-pat-order-status]');
const patOrdersList = document.getElementById('pat-orders-list');
const patOrdersEmpty = document.getElementById('pat-orders-empty');
const patRecommendationsList = document.getElementById('pat-recommendations-list');
const patRecommendationsToggle = document.getElementById('pat-recommendations-toggle');
let pendingPatCancelOrderId = '';
let activePatEditOrderId = '';
let patRecommendationsExpanded = false;
const patRecommendationCache = new Map();

const originSelect = document.getElementById('amazon-origin-select');
const radiusSelect = document.getElementById('amazon-radius-select');
const equipmentSelect = document.getElementById('amazon-equipment-select');
const clearFiltersButton = document.getElementById('amazon-clear-filters');
const footerGoTopButton = document.getElementById('loadboard-go-top');
const footerClearFiltersButton = document.getElementById('loadboard-clear-filters');
const footerRefreshButton = document.getElementById('loadboard-refresh-button');
const footerRefreshLabel = document.getElementById('loadboard-refresh-label');
const footerLastUpdated = document.getElementById('loadboard-last-updated');
const footerAutoRefreshToggle = document.getElementById('loadboard-auto-refresh-toggle');
const footerRefreshInterval = document.getElementById('loadboard-refresh-interval');
const footerChatButton = document.getElementById('loadboard-chat-button');

const filterDestination = document.getElementById('filter-destination');
const filterRadius = document.getElementById('filter-radius');
const filterStartDate = document.getElementById('filter-start-date');
const filterStartTime = document.getElementById('filter-start-time');
const filterEndDate = document.getElementById('filter-end-date');
const filterEndTime = document.getElementById('filter-end-time');
const workBlock = document.getElementById('work-block');
const workHostler = document.getElementById('work-hostler');
const workOneway = document.getElementById('work-oneway');
const driverSolo = document.getElementById('driver-solo');
const driverTeam = document.getElementById('driver-team');
const loadLive = document.getElementById('load-live');
const loadDrop = document.getElementById('load-drop');
const filterPrice = document.getElementById('filter-price');
const filterPayout = document.getElementById('filter-payout');
const filterDurationMin = document.getElementById('filter-duration-min');
const filterDurationMax = document.getElementById('filter-duration-max');
const filterDistanceMin = document.getElementById('filter-distance-min');
const filterDistanceMax = document.getElementById('filter-distance-max');
const filterStops = document.getElementById('filter-stops');
const filterExcluded = document.getElementById('filter-excluded');
const LOADBOARD_STATE_VERSION = 2;

let activeDetailId = null;
let amazonCurrentPage = 1;
const bookedLoadKeys = new Set();
let activePanelLoad = null;
const MAX_AMAZON_SEARCHES = 20;
let amazonSearchSeed = 1;
let amazonSearches = [];
let activeSearchId = null;
let activeLoadboardView = 'search';
let loadboardRefreshGeneration = 0;
let loadboardLastRefreshedAt = new Date();
let loadboardAutoRefreshEnabled = false;
let loadboardAutoRefreshSeconds = 30;
let loadboardNextRefreshAt = null;
let loadboardAutoRefreshTimer = null;
let loadboardFooterTicker = null;
let loadboardRefreshVisualTimer = null;
let loadboardPriceChangeVersion = 0;
let loadboardFullHydrationRerenderQueued = false;
const loadboardPriceChangeMap = new Map();
const pendingLoadboardPriceChangeMap = new Map();
let lastVisibleLoadboardLoads = [];
let relayAssistantState = null;
let relayAssistantAlertTimer = null;
let relayAssistantLastCandidateKey = '';
let relayAssistantCloseConfirmOpen = false;
const relayAssistantDismissedKeys = new Set();
let patCreateToastTimer = null;
const PAT_ORDER_STORAGE_KEY = 'amazonDemoPatOrders';
let activePatOrderStatus = 'open';
resetPatOrdersOnReload();
let patOrders = loadPatOrders();
const patOrderAutoBookTimers = new Map();
const patOrderReservedSearchTimers = new Map();
const LOAD_SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance', recentTitle: 'New and recently changed' },
    { value: 'start-nearest', label: 'Start date Nearest', recentTitle: 'Start date nearest' },
    { value: 'start-farthest', label: 'Start date Farthest', recentTitle: 'Start date farthest' },
    { value: 'age-oldest', label: 'Age Oldest', recentTitle: 'Oldest loads first' },
    { value: 'age-newest', label: 'Age Newest', recentTitle: 'Newest loads first' },
    { value: 'distance-shortest', label: 'Distance Shortest', recentTitle: 'Shortest distance first' },
    { value: 'distance-longest', label: 'Distance Longest', recentTitle: 'Longest distance first' },
    { value: 'deadhead-shortest', label: 'Deadhead Shortest', recentTitle: 'Shortest deadhead first' },
    { value: 'deadhead-longest', label: 'Deadhead Longest', recentTitle: 'Longest deadhead first' },
    { value: 'payout-lowest', label: 'Payout Lowest', recentTitle: 'Lowest payout first' },
    { value: 'payout-highest', label: 'Payout Highest', recentTitle: 'Highest payout first' },
    { value: 'price-per-distance-lowest', label: 'Price per distance Lowest', recentTitle: 'Lowest price per distance first' },
    { value: 'price-per-distance-highest', label: 'Price per distance Highest', recentTitle: 'Highest price per distance first' }
];

function getLoadSortOption(sortValue = 'relevance') {
    return LOAD_SORT_OPTIONS.find((option) => option.value === sortValue) || LOAD_SORT_OPTIONS[0];
}

function getLoadboardRefreshRank(load) {
    return hashString(`${loadboardRefreshGeneration}:${load?.id || 0}:${load?.originCode || ''}:${load?.destinationCode || ''}`);
}

function compareLoadsByRelevance(left, right, originValue = '') {
    const leftActivity = getLoadRelevanceActivity(left);
    const rightActivity = getLoadRelevanceActivity(right);

    if (leftActivity.isActive !== rightActivity.isActive) {
        return leftActivity.isActive ? -1 : 1;
    }
    if (leftActivity.activityAt !== rightActivity.activityAt) {
        return rightActivity.activityAt - leftActivity.activityAt;
    }
    if (originValue && left.displayDeadhead !== right.displayDeadhead) {
        return left.displayDeadhead - right.displayDeadhead;
    }
    if (left.pickupDateTime.getTime() !== right.pickupDateTime.getTime()) {
        return left.pickupDateTime - right.pickupDateTime;
    }
    return right.priceValue - left.priceValue;
}

function compareLoadsBySort(left, right, sortValue, originValue = '') {
    const fallback = () => compareLoadsByRelevance(left, right, originValue);

    switch (sortValue) {
    case 'start-nearest':
        return (left.pickupDateTime - right.pickupDateTime) || fallback();
    case 'start-farthest':
        return (right.pickupDateTime - left.pickupDateTime) || fallback();
    case 'age-oldest':
        return ((left.id || 0) - (right.id || 0)) || fallback();
    case 'age-newest':
        return ((right.id || 0) - (left.id || 0)) || fallback();
    case 'distance-shortest':
        return (left.miles - right.miles) || fallback();
    case 'distance-longest':
        return (right.miles - left.miles) || fallback();
    case 'deadhead-shortest':
        return (left.displayDeadhead - right.displayDeadhead) || fallback();
    case 'deadhead-longest':
        return (right.displayDeadhead - left.displayDeadhead) || fallback();
    case 'payout-lowest':
        return (left.priceValue - right.priceValue) || fallback();
    case 'payout-highest':
        return (right.priceValue - left.priceValue) || fallback();
    case 'price-per-distance-lowest':
        return (left.pricePerMileValue - right.pricePerMileValue) || fallback();
    case 'price-per-distance-highest':
        return (right.pricePerMileValue - left.pricePerMileValue) || fallback();
    case 'relevance':
    default:
        return fallback();
    }
}

function setLoadboardView(viewName) {
    activeLoadboardView = viewName;
    const activeTabTarget = viewName === 'create-order' ? 'post-a-truck' : viewName;

    loadboardViewTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.loadboardViewTarget === activeTabTarget);
    });

    loadboardViews.forEach((view) => {
        view.classList.toggle('is-active', view.dataset.loadboardView === viewName);
    });

    if (viewName === 'post-a-truck') {
        refreshPatOrderMatches();
        renderPatRecommendations();
        renderPatOrders();
    }

    updateRelayAssistantButtonState();
    saveLoadboardSessionState();
}

function setExpandedCreateSection(targetSection) {
    if (!targetSection || targetSection.classList.contains('is-locked')) {
        return;
    }

    createOrderSections.forEach((section) => {
        if (section.classList.contains('is-locked')) {
            section.classList.remove('is-expanded');
            return;
        }

        section.classList.toggle('is-expanded', section === targetSection);
    });
}

function getActiveOrderType() {
    return Array.from(orderTypeCards).find((item) => item.classList.contains('is-selected'))?.dataset.patOrderType || '';
}

function setCreateOrderSectionsLocked(isLocked) {
    [createOrderLocationSection, createOrderScheduleSection, createOrderPayoutSection].forEach((section) => {
        if (!section) return;
        section.classList.toggle('is-locked', isLocked);
        if (isLocked) {
            section.classList.remove('is-expanded');
        }
    });

    if (isLocked && createOrderOrderTypeSection) {
        createOrderOrderTypeSection.classList.add('is-expanded');
    }
}

function getChoiceLabelFromInput(input) {
    if (!input) return '';
    const label = input.closest('label');
    if (!label) return input.value || '';
    const spans = label.querySelectorAll('span');
    return spans.length ? spans[spans.length - 1].textContent.trim() : input.value || '';
}

function getCheckedChoiceLabel(name) {
    return getChoiceLabelFromInput(orderTypeDetails?.querySelector(`input[name="${name}"]:checked`));
}

function setSelectValue(selectElement, value) {
    if (!selectElement) return;
    const normalizedValue = String(value ?? '');
    const hasMatch = Array.from(selectElement.options).some((option) => option.value === normalizedValue);
    selectElement.value = hasMatch ? normalizedValue : '';
}

function setChoiceByLabel(name, desiredLabel, normalize = (value) => String(value || '').trim()) {
    if (!orderTypeDetails) return;
    const desired = normalize(desiredLabel);
    const inputs = Array.from(orderTypeDetails.querySelectorAll(`input[name="${name}"]`));
    let matched = false;

    inputs.forEach((input) => {
        const label = normalize(getChoiceLabelFromInput(input));
        const shouldCheck = !matched && desired && label === desired;
        input.checked = shouldCheck;
        if (shouldCheck) {
            matched = true;
        }
    });
}

function getSelectDisplayValue(selectElement) {
    if (!selectElement || !selectElement.value) return '';
    return selectElement.options[selectElement.selectedIndex]?.textContent.trim() || selectElement.value;
}

function formatPatPowerEquipmentSummary(equipment) {
    if (!equipment) return '';
    return isTrailerRequiredEquipment(equipment) ? REQUIRED_TRAILER_EQUIPMENT_LABEL : `${equipment} Provided`;
}

function getOptionalRadiusSummary(cityValue, radiusValue) {
    if (!cityValue) return '';
    if (!radiusValue) return cityValue;
    return `${cityValue} • ${radiusValue} mi. Radius`;
}

function getSelectLabelFromValue(selectElement, value) {
    if (!selectElement || !value) return '';
    const matchingOption = Array.from(selectElement.options).find((option) => option.value === value);
    return matchingOption?.textContent?.trim() || value;
}

function formatPatRecommendationStamp(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '';
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return `${month}/${day} ${time} ${getTimeZoneAbbreviation()}`;
}

function roundPatRecommendationRadius(distanceMiles) {
    const options = [25, 50, 100, 150, 250];
    const safeDistance = Math.max(0, Math.ceil(parseNumber(distanceMiles)));
    return String(options.find((value) => safeDistance <= value) || options[options.length - 1]);
}

function getPatRecommendationStemValue(deadheadMiles) {
    const deadheadHours = parseNumber(deadheadMiles) / 50;
    if (deadheadHours <= 0.5) return '30-min';
    if (deadheadHours <= 1) return '1-hr';
    if (deadheadHours <= 1.5) return '1-30';
    if (deadheadHours <= 2) return '2-hr';
    if (deadheadHours <= 2.5) return '2-30';
    return '3-hr';
}

function getPatRecommendationDurationBounds(load) {
    const durationHours = load?.durationHours || 0;
    const minHours = Math.max(1, Math.floor(durationHours / 2));
    const maxHours = Math.max(minHours, Math.ceil(durationHours * 2.5));
    return {
        min: String(minHours),
        max: String(maxHours)
    };
}

function getPatRecommendationPriceFloor(load) {
    return Math.max(0.5, Math.floor((load?.pricePerMileValue || 0) * 4) / 4);
}

function getPatRecommendationPayoutFloor(load) {
    return Math.max(500, Math.floor((load?.priceValue || 0) / 500) * 500);
}

function getTimeZoneAbbreviation() {
    return new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();
}

function formatScheduleStamp(dateValue, timeValue) {
    if (!dateValue || !timeValue) return '';
    const [year, month, day] = dateValue.split('-');
    return `${month}/${day} ${timeValue} ${getTimeZoneAbbreviation()}`;
}

function buildOrderTypeSummaryText() {
    const orderType = getActiveOrderType();
    if (!orderType) return '';

    if (orderType === 'box-truck') {
        const equipment = getCheckedChoiceLabel('pat-box-equipment');
        const driver = getCheckedChoiceLabel('pat-box-driver');
        return ['Box truck', equipment, driver].filter(Boolean).join(' • ');
    }

    if (orderType === 'tractor-trailer') {
        const equipment = getCheckedChoiceLabel('pat-tractor-equipment');
        const driver = getCheckedChoiceLabel('pat-tractor-driver');
        const specialService = orderTypeDetails?.querySelector('input[name="pat-special-swing-door"]')?.checked ? 'Swing Door Trailer' : '';
        return ['Tractor & Trailer', equipment, driver, specialService].filter(Boolean).join(' • ');
    }

    const work = getCheckedChoiceLabel('pat-power-work');
    const load = getCheckedChoiceLabel('pat-power-load');
    const equipment = getSelectDisplayValue(document.getElementById('pat-power-equipment'));
    const driver = getCheckedChoiceLabel('pat-power-driver');
    return ['Power only', work, load, equipment, driver].filter(Boolean).join(' • ');
}

function buildLocationSummaryText() {
    const origin = getOptionalRadiusSummary(createOrderOriginSelect?.value || '', createOrderOriginRadiusSelect?.value || '');
    const destination = getOptionalRadiusSummary(createOrderDestinationSelect?.value || '', createOrderDestinationRadiusSelect?.value || '');
    return [origin, destination].filter(Boolean).join(' • ');
}

function buildScheduleSummaryText() {
    const startStamp = formatScheduleStamp(scheduleStartDateInput?.value || '', scheduleStartTimeInput?.value || '');
    const endStamp = formatScheduleStamp(scheduleEndDateInput?.value || '', scheduleEndTimeInput?.value || '');
    const startWindow = getSelectDisplayValue(scheduleStartWindowSelect);
    const stem = getSelectDisplayValue(scheduleStemTimeSelect);
    const tripMode = getSelectDisplayValue(scheduleTripLengthSelect);
    const minRange = scheduleMinRangeInput?.value?.trim() || '';
    const maxRange = scheduleMaxRangeInput?.value?.trim() || '';
    let rangeSummary = '';

    if (tripMode && minRange && maxRange) {
        const suffix = tripMode === 'Duration' ? 'Hours' : 'mi.';
        rangeSummary = `${minRange}-${maxRange} ${suffix}`;
    }

    return [
        startStamp,
        startWindow ? `Start window: ${startWindow}` : '',
        endStamp,
        stem ? `Stem: ${stem}` : '',
        rangeSummary
    ].filter(Boolean).join(' • ');
}

function buildPayoutSummaryText() {
    const pricePerMile = payoutPricePerMileInput?.value?.trim() || '';
    const minPayout = payoutMinPayoutInput?.value?.trim() || '';

    if (!pricePerMile && !minPayout) return '';
    if (pricePerMile && minPayout) {
        return `${formatMoney(parseNumber(minPayout))} (${formatMoney(parseNumber(pricePerMile))}/mi)`;
    }

    if (minPayout) return formatMoney(parseNumber(minPayout));
    return `${formatMoney(parseNumber(pricePerMile))}/mi`;
}

function joinCreateOrderParts(parts) {
    return parts.filter(Boolean).join(' • ');
}

function getOptionalRadiusSummaryClean(cityValue, radiusValue) {
    if (!cityValue) return '';
    if (!radiusValue) return cityValue;
    return `${cityValue} • ${radiusValue} mi. Radius`;
}

function buildOrderTypeSummaryTextClean() {
    const orderType = getActiveOrderType();
    if (!orderType) return '';

    if (orderType === 'box-truck') {
        return joinCreateOrderPartsSafe([
            'Box truck',
            getCheckedChoiceLabel('pat-box-equipment'),
            getCheckedChoiceLabel('pat-box-driver')
        ]);
    }

    if (orderType === 'tractor-trailer') {
        return joinCreateOrderPartsSafe([
            'Tractor & Trailer',
            getCheckedChoiceLabel('pat-tractor-equipment'),
            getCheckedChoiceLabel('pat-tractor-driver'),
            orderTypeDetails?.querySelector('input[name="pat-special-swing-door"]')?.checked ? 'Swing Door Trailer' : ''
        ]);
    }

    return joinCreateOrderPartsSafe([
        'Power only',
        getCheckedChoiceLabel('pat-power-work'),
        getCheckedChoiceLabel('pat-power-load'),
        getSelectDisplayValue(document.getElementById('pat-power-equipment')),
        getCheckedChoiceLabel('pat-power-driver')
    ]);
}

function buildLocationSummaryTextClean() {
    return joinCreateOrderPartsSafe([
        getOptionalRadiusSummarySafe(createOrderOriginSelect?.value || '', createOrderOriginRadiusSelect?.value || ''),
        getOptionalRadiusSummarySafe(createOrderDestinationSelect?.value || '', createOrderDestinationRadiusSelect?.value || '')
    ]);
}

function buildScheduleSummaryTextClean() {
    const startStamp = formatScheduleStamp(scheduleStartDateInput?.value || '', scheduleStartTimeInput?.value || '');
    const endStamp = formatScheduleStamp(scheduleEndDateInput?.value || '', scheduleEndTimeInput?.value || '');
    const startWindow = getSelectDisplayValue(scheduleStartWindowSelect);
    const stem = getSelectDisplayValue(scheduleStemTimeSelect);
    const tripMode = getSelectDisplayValue(scheduleTripLengthSelect);
    const minRange = scheduleMinRangeInput?.value?.trim() || '';
    const maxRange = scheduleMaxRangeInput?.value?.trim() || '';
    const rangeSummary = tripMode && minRange && maxRange
        ? `${minRange}-${maxRange} ${tripMode === 'Duration' ? 'Hours' : 'mi.'}`
        : '';

    return joinCreateOrderPartsSafe([
        startStamp,
        startWindow ? `Start window: ${startWindow}` : '',
        endStamp,
        stem ? `Stem: ${stem}` : '',
        rangeSummary
    ]);
}

function getCreateOrderEquipmentSummary() {
    const orderType = getActiveOrderType();

    if (orderType === 'box-truck') {
        return getCheckedChoiceLabel('pat-box-equipment');
    }

    if (orderType === 'tractor-trailer') {
        return getCheckedChoiceLabel('pat-tractor-equipment');
    }

    const equipment = getSelectDisplayValue(document.getElementById('pat-power-equipment'));
    return formatPatPowerEquipmentSummary(equipment);
}

function getCreateOrderDriverSummary() {
    const orderType = getActiveOrderType();

    if (orderType === 'box-truck') return getCheckedChoiceLabel('pat-box-driver');
    if (orderType === 'tractor-trailer') return getCheckedChoiceLabel('pat-tractor-driver');
    return getCheckedChoiceLabel('pat-power-driver');
}

function getCreateOrderWorkSummary() {
    const orderType = getActiveOrderType();

    if (orderType === 'box-truck') return 'Box truck';
    if (orderType === 'tractor-trailer') return 'Tractor & Trailer';
    return getCheckedChoiceLabel('pat-power-work') || 'Power only';
}

function getCreateOrderLoadSummary() {
    return getActiveOrderType() === 'power-only' ? getCheckedChoiceLabel('pat-power-load') : '';
}

function getCreateOrderRangeSummary() {
    const tripMode = getSelectDisplayValue(scheduleTripLengthSelect);
    const minRange = scheduleMinRangeInput?.value?.trim() || '';
    const maxRange = scheduleMaxRangeInput?.value?.trim() || '';

    if (!tripMode || !minRange || !maxRange) return '';
    return tripMode === 'Duration'
        ? `${minRange}-${maxRange} Hours`
        : `${minRange}-${maxRange} mi.`;
}

function buildConfirmationMetaMarkup() {
    const stem = getSelectDisplayValue(scheduleStemTimeSelect);
    const startWindow = getSelectDisplayValue(scheduleStartWindowSelect);
    const topLine = [stem ? `Stem: ${stem}` : '', startWindow ? `Start window: ${startWindow}` : '']
        .filter(Boolean)
        .join('   ');
    const bottomLine = joinCreateOrderParts([
        getCreateOrderWorkSummary(),
        getCreateOrderLoadSummary(),
        getCreateOrderEquipmentSummary(),
        getCreateOrderRangeSummary(),
        getCreateOrderDriverSummary()
    ]);

    return `
        ${topLine ? `<div class="pat-confirm-meta-line">${topLine}</div>` : ''}
        ${bottomLine ? `<div class="pat-confirm-meta-line">${bottomLine}</div>` : ''}
    `;
}

function joinCreateOrderParts(parts) {
    return parts.filter(Boolean).join(' • ');
}

function getOptionalRadiusSummaryClean(cityValue, radiusValue) {
    if (!cityValue) return '';
    if (!radiusValue) return cityValue;
    return `${cityValue} • ${radiusValue} mi. Radius`;
}

function buildConfirmationRouteMarkupLegacy() {
    const origin = createOrderOriginSelect?.value || 'Origin';
    const destination = createOrderDestinationSelect?.value || 'Destination';
    const originRadius = createOrderOriginRadiusSelect?.value || '';
    const destinationRadius = createOrderDestinationRadiusSelect?.value || '';
    const startStamp = formatScheduleStamp(scheduleStartDateInput?.value || '', scheduleStartTimeInput?.value || '');
    const endStamp = formatScheduleStamp(scheduleEndDateInput?.value || '', scheduleEndTimeInput?.value || '');

    return `
        <div class="pat-confirm-stop">
            <strong>${origin.toUpperCase()}</strong>
            ${originRadius ? `<div class="pat-confirm-radius">(${originRadius} mi)</div>` : ''}
            <span>${startStamp}</span>
        </div>
        <div class="pat-confirm-dash" aria-hidden="true">&ndash;</div>
        <div class="pat-confirm-stop">
            <strong>${destination.toUpperCase()}</strong>
            ${destinationRadius ? `<div class="pat-confirm-radius">(${destinationRadius} mi)</div>` : ''}
            <span>${endStamp}</span>
        </div>
    `;
}

function openCreateOrderConfirmationLegacy() {
    if (!confirmOverlay) return;

    updateCreateOrderSummaries();
    if (confirmRoute) {
        confirmRoute.innerHTML = buildConfirmationRouteMarkupLegacy();
    }

    if (confirmMeta) {
        confirmMeta.innerHTML = buildConfirmationMetaMarkup();
    }

    if (confirmPayout) {
        const minPayout = formatMoney(parseNumber(payoutMinPayoutInput?.value || 0));
        const pricePerMile = formatMoney(parseNumber(payoutPricePerMileInput?.value || 0));
        confirmPayout.innerHTML = `${minPayout} <span>(${pricePerMile}/mi)</span>`;
    }

    confirmOverlay.hidden = false;
}

function applySectionSummary(element, text) {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle('has-content', Boolean(text));
}

function updateCreateOrderSummaries() {
    applySectionSummary(orderTypeSummary, buildOrderTypeSummaryTextClean());
    applySectionSummary(locationSummary, buildLocationSummaryTextClean());
    applySectionSummary(scheduleSummary, buildScheduleSummaryTextClean());
    applySectionSummary(payoutSummary, buildPayoutSummaryText());
}

function clearCreateOrderFieldError(field) {
    if (!field) return;
    field.classList.remove('is-invalid');
    if (typeof field.setCustomValidity === 'function') {
        field.setCustomValidity('');
    }
}

function setCreateOrderFieldError(field, message = '') {
    if (!field) return;
    field.classList.add('is-invalid');
    if (message && typeof field.setCustomValidity === 'function') {
        field.setCustomValidity(message);
    }
}

function validateCreateOrderField(field, message, section, invalidCollection) {
    if (!field) return;
    const value = field.value?.trim?.() ?? field.value;
    clearCreateOrderFieldError(field);
    if (!value) {
        setCreateOrderFieldError(field, message);
        invalidCollection.push({ field, section });
        return;
    }

    if (typeof field.checkValidity === 'function' && !field.checkValidity()) {
        field.classList.add('is-invalid');
        invalidCollection.push({ field, section });
    }
}

function validateCreateOrderForm() {
    syncScheduleDateTimeConstraints();

    const invalidFields = [];
    const activeOrderType = getActiveOrderType();

    if (!activeOrderType) {
        invalidFields.push({ field: null, section: createOrderOrderTypeSection });
    }

    validateCreateOrderField(createOrderOriginSelect, 'Choose an origin.', createOrderLocationSection, invalidFields);
    validateCreateOrderField(createOrderDestinationSelect, 'Choose a destination.', createOrderLocationSection, invalidFields);

    [
        [scheduleStartDateInput, 'Choose a start date.'],
        [scheduleStartTimeInput, 'Choose a start time.'],
        [scheduleEndDateInput, 'Choose an end date.'],
        [scheduleEndTimeInput, 'Choose an end time.'],
        [scheduleStemTimeSelect, 'Choose a minimum stem time.'],
        [scheduleTripLengthSelect, 'Choose a trip length.'],
        [scheduleMinRangeInput, 'Enter a minimum range.'],
        [scheduleMaxRangeInput, 'Enter a maximum range.']
    ].forEach(([field, message]) => {
        validateCreateOrderField(field, message, createOrderScheduleSection, invalidFields);
    });

    if (
        scheduleMinRangeInput?.value
        && scheduleMaxRangeInput?.value
        && parseFloat(scheduleMaxRangeInput.value) < parseFloat(scheduleMinRangeInput.value)
    ) {
        setCreateOrderFieldError(scheduleMaxRangeInput, 'Maximum must be greater than or equal to minimum.');
        invalidFields.push({ field: scheduleMaxRangeInput, section: createOrderScheduleSection });
    }

    validateCreateOrderField(payoutPricePerMileInput, 'Enter a minimum price per mile.', createOrderPayoutSection, invalidFields);
    validateCreateOrderField(payoutMinPayoutInput, 'Enter a minimum payout.', createOrderPayoutSection, invalidFields);

    if (!invalidFields.length) {
        return true;
    }

    const firstInvalid = invalidFields[0];
    if (firstInvalid.section === createOrderOrderTypeSection) {
        setExpandedCreateSection(createOrderOrderTypeSection);
    } else if (firstInvalid.section?.classList.contains('is-locked')) {
        setExpandedCreateSection(createOrderOrderTypeSection);
    } else {
        setExpandedCreateSection(firstInvalid.section);
    }

    firstInvalid.field?.focus?.();
    return false;
}

function buildConfirmationRouteMarkup() {
    const origin = createOrderOriginSelect?.value || 'Origin';
    const destination = createOrderDestinationSelect?.value || 'Destination';
    const originRadius = createOrderOriginRadiusSelect?.value || '';
    const destinationRadius = createOrderDestinationRadiusSelect?.value || '';
    const startStamp = formatScheduleStamp(scheduleStartDateInput?.value || '', scheduleStartTimeInput?.value || '');
    const endStamp = formatScheduleStamp(scheduleEndDateInput?.value || '', scheduleEndTimeInput?.value || '');

    return `
        <div class="pat-confirm-stop">
            <strong>${origin}</strong>
            ${originRadius ? `<div class="pat-confirm-radius">(${originRadius} mi)</div>` : ''}
            <span>${startStamp}</span>
        </div>
        <div class="pat-confirm-dash" aria-hidden="true">&ndash;</div>
        <div class="pat-confirm-stop">
            <strong>${destination}</strong>
            ${destinationRadius ? `<div class="pat-confirm-radius">(${destinationRadius} mi)</div>` : ''}
            <span>${endStamp}</span>
        </div>
    `;
}

function openCreateOrderConfirmation() {
    if (!confirmOverlay) return;

    updateCreateOrderSummaries();
    if (confirmRoute) {
        confirmRoute.innerHTML = buildConfirmationRouteMarkup();
    }

    if (confirmMeta) {
        const stem = getSelectDisplayValue(scheduleStemTimeSelect);
        const startWindow = getSelectDisplayValue(scheduleStartWindowSelect);
        const orderTypeText = buildOrderTypeSummaryText();
        confirmMeta.textContent = [
            stem ? `Stem: ${stem}` : '',
            startWindow ? `Start window: ${startWindow}` : '',
            orderTypeText
        ].filter(Boolean).join(' • ');
    }

    if (confirmPayout) {
        const minPayout = formatMoney(parseNumber(payoutMinPayoutInput?.value || 0));
        const pricePerMile = formatMoney(parseNumber(payoutPricePerMileInput?.value || 0));
        confirmPayout.innerHTML = `${minPayout} <span>(${pricePerMile}/mi)</span>`;
    }

    confirmOverlay.hidden = false;
}

function joinCreateOrderParts(parts) {
    return parts.filter(Boolean).join(' • ');
}

function getOptionalRadiusSummaryClean(cityValue, radiusValue) {
    if (!cityValue) return '';
    if (!radiusValue) return cityValue;
    return `${cityValue} • ${radiusValue} mi. Radius`;
}

function closeCreateOrderConfirmation() {
    if (!confirmOverlay) return;
    confirmOverlay.hidden = true;
}

function joinCreateOrderPartsSafe(parts) {
    return parts.filter(Boolean).join(' • ');
}

function getOptionalRadiusSummarySafe(cityValue, radiusValue) {
    if (!cityValue) return '';
    if (!radiusValue) return cityValue;
    return `${cityValue} • ${radiusValue} mi. Radius`;
}

function buildCreateOrderDraft() {
    const orderType = getActiveOrderType();
    const origin = createOrderOriginSelect?.value || '';
    const destination = createOrderDestinationSelect?.value || '';
    const originRadius = createOrderOriginRadiusSelect?.value || '';
    const destinationRadius = createOrderDestinationRadiusSelect?.value || '';
    const startDate = scheduleStartDateInput?.value || '';
    const startTime = scheduleStartTimeInput?.value || '';
    const endDate = scheduleEndDateInput?.value || '';
    const endTime = scheduleEndTimeInput?.value || '';
    const startWindow = getSelectDisplayValue(scheduleStartWindowSelect);
    const stem = getSelectDisplayValue(scheduleStemTimeSelect);
    const tripLength = getSelectDisplayValue(scheduleTripLengthSelect);
    const minRange = scheduleMinRangeInput?.value?.trim() || '';
    const maxRange = scheduleMaxRangeInput?.value?.trim() || '';
    const pricePerMile = payoutPricePerMileInput?.value?.trim() || '';
    const minPayout = payoutMinPayoutInput?.value?.trim() || '';

    let work = '';
    let load = '';
    let equipment = '';
    let driver = '';

    if (orderType === 'box-truck') {
        work = 'Box truck';
        equipment = getCheckedChoiceLabel('pat-box-equipment');
        driver = getCheckedChoiceLabel('pat-box-driver');
    } else if (orderType === 'tractor-trailer') {
        work = 'Tractor & Trailer';
        equipment = getCheckedChoiceLabel('pat-tractor-equipment');
        driver = getCheckedChoiceLabel('pat-tractor-driver');
    } else if (orderType === 'power-only') {
        work = getCheckedChoiceLabel('pat-power-work') || 'Power only';
        load = getCheckedChoiceLabel('pat-power-load');
        const selectedEquipment = getSelectDisplayValue(document.getElementById('pat-power-equipment'));
        equipment = formatPatPowerEquipmentSummary(selectedEquipment);
        driver = getCheckedChoiceLabel('pat-power-driver');
    }

    const rangeSummary = tripLength && minRange && maxRange
        ? `${minRange}-${maxRange} ${tripLength === 'Duration' ? 'Hours' : 'mi.'}`
        : '';

    return {
        orderType,
        origin,
        destination,
        originRadius,
        destinationRadius,
        startDate,
        startTime,
        endDate,
        endTime,
        startWindow,
        stem,
        tripLength,
        minRange,
        maxRange,
        rangeSummary,
        work,
        load,
        equipment,
        driver,
        pricePerMile,
        minPayout
    };
}

function markCreateOrderInvalid(field, section, invalids, message) {
    if (field) {
        setCreateOrderFieldError(field, message);
    }
    invalids.push({ field, section });
}

function validateCreateOrderDraft() {
    syncScheduleDateTimeConstraints();

    const draft = buildCreateOrderDraft();
    const invalids = [];

    if (!draft.orderType) {
        invalids.push({ field: null, section: createOrderOrderTypeSection });
    }

    [
        [createOrderOriginSelect, draft.origin, createOrderLocationSection, 'Choose an origin.'],
        [createOrderDestinationSelect, draft.destination, createOrderLocationSection, 'Choose a destination.'],
        [scheduleStartDateInput, draft.startDate, createOrderScheduleSection, 'Choose a start date.'],
        [scheduleStartTimeInput, draft.startTime, createOrderScheduleSection, 'Choose a start time.'],
        [scheduleEndDateInput, draft.endDate, createOrderScheduleSection, 'Choose an end date.'],
        [scheduleEndTimeInput, draft.endTime, createOrderScheduleSection, 'Choose an end time.'],
        [scheduleStemTimeSelect, draft.stem, createOrderScheduleSection, 'Choose a minimum stem time.'],
        [scheduleTripLengthSelect, draft.tripLength, createOrderScheduleSection, 'Choose a trip length.'],
        [scheduleMinRangeInput, draft.minRange, createOrderScheduleSection, 'Enter a minimum range.'],
        [scheduleMaxRangeInput, draft.maxRange, createOrderScheduleSection, 'Enter a maximum range.'],
        [payoutPricePerMileInput, draft.pricePerMile, createOrderPayoutSection, 'Enter a minimum price per mile.'],
        [payoutMinPayoutInput, draft.minPayout, createOrderPayoutSection, 'Enter a minimum payout.']
    ].forEach(([field, value, section, message]) => {
        clearCreateOrderFieldError(field);
        if (!value) {
            markCreateOrderInvalid(field, section, invalids, message);
        }
    });

    const now = roundUpToTimeSlot(new Date(), 15);
    const startDateTime = draft.startDate && draft.startTime
        ? combineDateAndTime(draft.startDate, draft.startTime, false)
        : null;
    const endDateTime = draft.endDate && draft.endTime
        ? combineDateAndTime(draft.endDate, draft.endTime, false)
        : null;

    if (startDateTime && startDateTime.getTime() < now.getTime()) {
        markCreateOrderInvalid(scheduleStartTimeInput, createOrderScheduleSection, invalids, 'Choose a future start time.');
    }

    if (endDateTime && endDateTime.getTime() < now.getTime()) {
        markCreateOrderInvalid(scheduleEndTimeInput, createOrderScheduleSection, invalids, 'Choose a future end time.');
    }

    if (startDateTime && endDateTime && endDateTime.getTime() < startDateTime.getTime()) {
        markCreateOrderInvalid(scheduleEndTimeInput, createOrderScheduleSection, invalids, 'End time must be after start time.');
    }

    if (draft.minRange && draft.maxRange && parseFloat(draft.maxRange) < parseFloat(draft.minRange)) {
        markCreateOrderInvalid(scheduleMaxRangeInput, createOrderScheduleSection, invalids, 'Maximum must be greater than or equal to minimum.');
    }

    if (invalids.length) {
        const firstInvalid = invalids[0];
        if (firstInvalid.section === createOrderOrderTypeSection || firstInvalid.section?.classList.contains('is-locked')) {
            setExpandedCreateSection(createOrderOrderTypeSection);
        } else {
            setExpandedCreateSection(firstInvalid.section);
        }
        firstInvalid.field?.focus?.();
        return null;
    }

    return draft;
}

function renderCreateOrderConfirmation(draft) {
    if (confirmRoute) {
        const startStamp = formatScheduleStamp(draft.startDate, draft.startTime);
        const endStamp = formatScheduleStamp(draft.endDate, draft.endTime);
        confirmRoute.innerHTML = `
            <div class="pat-confirm-stop">
                <strong>${draft.origin.toUpperCase()}</strong>
                ${draft.originRadius ? `<div class="pat-confirm-radius">(${draft.originRadius} mi)</div>` : ''}
                <span>${startStamp}</span>
            </div>
            <div class="pat-confirm-dash" aria-hidden="true">&ndash;</div>
            <div class="pat-confirm-stop">
                <strong>${draft.destination.toUpperCase()}</strong>
                ${draft.destinationRadius ? `<div class="pat-confirm-radius">(${draft.destinationRadius} mi)</div>` : ''}
                <span>${endStamp}</span>
            </div>
        `;
    }

    if (confirmMeta) {
        const topLine = [draft.stem ? `Stem: ${draft.stem}` : '', draft.startWindow ? `Start window: ${draft.startWindow}` : '']
            .filter(Boolean)
            .join('   ');
        const bottomLine = joinCreateOrderPartsSafe([
            draft.work,
            draft.load,
            draft.equipment,
            draft.rangeSummary,
            draft.driver
        ]);

        confirmMeta.innerHTML = `
            ${topLine ? `<div class="pat-confirm-meta-line">${topLine}</div>` : ''}
            ${bottomLine ? `<div class="pat-confirm-meta-line">${bottomLine}</div>` : ''}
        `;
    }

    if (confirmPayout) {
        confirmPayout.innerHTML = `${formatMoney(parseNumber(draft.minPayout))} <span>(${formatMoney(parseNumber(draft.pricePerMile))}/mi)</span>`;
    }
}

function handleCreateOrderSubmit(event) {
    event.preventDefault();

    const draft = validateCreateOrderDraft();
    if (!draft) {
        return;
    }

    renderCreateOrderConfirmation(draft);
    if (confirmOverlay) {
        confirmOverlay.hidden = false;
    }
}

function handleCreateOrderConfirmationClose(event) {
    event?.preventDefault?.();
    closeCreateOrderConfirmation();
}

let activePatConfirmDraft = null;

function validatePatFieldFresh(field, section, invalids, message) {
    clearCreateOrderFieldError(field);
    const rawValue = field?.value;
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    if (!value) {
        if (field) {
            setCreateOrderFieldError(field, message);
        }
        invalids.push({ field, section });
        return;
    }
}

function buildPatSubmitDraftFresh() {
    const orderType = getActiveOrderType();
    const startDate = scheduleStartDateInput?.value || '';
    const startTime = scheduleStartTimeInput?.value || '';
    const endDate = scheduleEndDateInput?.value || '';
    const endTime = scheduleEndTimeInput?.value || '';
    const tripLength = getSelectDisplayValue(scheduleTripLengthSelect);
    const minRange = scheduleMinRangeInput?.value?.trim() || '';
    const maxRange = scheduleMaxRangeInput?.value?.trim() || '';
    const orderKind = orderType === 'power-only'
        ? (getCheckedChoiceLabel('pat-power-work') || 'Power only')
        : orderType === 'box-truck'
            ? 'Box truck'
            : orderType === 'tractor-trailer'
                ? 'Tractor & Trailer'
                : '';
    const loadMode = orderType === 'power-only' ? getCheckedChoiceLabel('pat-power-load') : '';
    const equipment = orderType === 'box-truck'
        ? getCheckedChoiceLabel('pat-box-equipment')
        : orderType === 'tractor-trailer'
            ? getCheckedChoiceLabel('pat-tractor-equipment')
            : (() => {
                const chosen = getSelectDisplayValue(document.getElementById('pat-power-equipment'));
                return formatPatPowerEquipmentSummary(chosen);
            })();
    const driver = orderType === 'box-truck'
        ? getCheckedChoiceLabel('pat-box-driver')
        : orderType === 'tractor-trailer'
            ? getCheckedChoiceLabel('pat-tractor-driver')
            : getCheckedChoiceLabel('pat-power-driver');

    return {
        orderType,
        origin: createOrderOriginSelect?.value || '',
        originRadius: createOrderOriginRadiusSelect?.value || '',
        destination: createOrderDestinationSelect?.value || '',
        destinationRadius: createOrderDestinationRadiusSelect?.value || '',
        startDate,
        startTime,
        endDate,
        endTime,
        startWindow: getSelectDisplayValue(scheduleStartWindowSelect),
        stem: getSelectDisplayValue(scheduleStemTimeSelect),
        tripLength,
        minRange,
        maxRange,
        rangeSummary: tripLength && minRange && maxRange
            ? `${minRange}-${maxRange} ${tripLength === 'Duration' ? 'Hours' : 'mi.'}`
            : '',
        orderKind,
        loadMode,
        equipment,
        driver,
        minPricePerMile: payoutPricePerMileInput?.value?.trim() || '',
        minPayout: payoutMinPayoutInput?.value?.trim() || ''
    };
}

function validatePatSubmitDraftFresh() {
    syncScheduleDateTimeConstraints();
    const draft = buildPatSubmitDraftFresh();
    const invalids = [];

    if (!draft.orderType) {
        invalids.push({ field: null, section: createOrderOrderTypeSection });
    }

    [
        [createOrderOriginSelect, createOrderLocationSection, 'Choose an origin.'],
        [createOrderDestinationSelect, createOrderLocationSection, 'Choose a destination.'],
        [scheduleStartDateInput, createOrderScheduleSection, 'Choose a start date.'],
        [scheduleStartTimeInput, createOrderScheduleSection, 'Choose a start time.'],
        [scheduleEndDateInput, createOrderScheduleSection, 'Choose an end date.'],
        [scheduleEndTimeInput, createOrderScheduleSection, 'Choose an end time.'],
        [scheduleStemTimeSelect, createOrderScheduleSection, 'Choose a minimum stem time.'],
        [scheduleTripLengthSelect, createOrderScheduleSection, 'Choose a trip length.'],
        [scheduleMinRangeInput, createOrderScheduleSection, 'Enter a minimum range.'],
        [scheduleMaxRangeInput, createOrderScheduleSection, 'Enter a maximum range.'],
        [payoutPricePerMileInput, createOrderPayoutSection, 'Enter a minimum price per mile.'],
        [payoutMinPayoutInput, createOrderPayoutSection, 'Enter a minimum payout.']
    ].forEach(([field, section, message]) => {
        validatePatFieldFresh(field, section, invalids, message);
    });

    const now = roundUpToTimeSlot(new Date(), 15);
    const startDateTime = draft.startDate && draft.startTime ? combineDateAndTime(draft.startDate, draft.startTime, false) : null;
    const endDateTime = draft.endDate && draft.endTime ? combineDateAndTime(draft.endDate, draft.endTime, false) : null;

    if (startDateTime && startDateTime.getTime() < now.getTime()) {
        setCreateOrderFieldError(scheduleStartTimeInput, 'Choose a future start time.');
        invalids.push({ field: scheduleStartTimeInput, section: createOrderScheduleSection });
    }

    if (endDateTime && endDateTime.getTime() < now.getTime()) {
        setCreateOrderFieldError(scheduleEndTimeInput, 'Choose a future end time.');
        invalids.push({ field: scheduleEndTimeInput, section: createOrderScheduleSection });
    }

    if (startDateTime && endDateTime && endDateTime.getTime() < startDateTime.getTime()) {
        setCreateOrderFieldError(scheduleEndTimeInput, 'End time must be after start time.');
        invalids.push({ field: scheduleEndTimeInput, section: createOrderScheduleSection });
    }

    if (draft.minRange && draft.maxRange && parseFloat(draft.maxRange) < parseFloat(draft.minRange)) {
        setCreateOrderFieldError(scheduleMaxRangeInput, 'Maximum must be greater than or equal to minimum.');
        invalids.push({ field: scheduleMaxRangeInput, section: createOrderScheduleSection });
    }

    if (invalids.length) {
        const firstInvalid = invalids[0];
        if (firstInvalid.section === createOrderOrderTypeSection || firstInvalid.section?.classList.contains('is-locked')) {
            setExpandedCreateSection(createOrderOrderTypeSection);
        } else {
            setExpandedCreateSection(firstInvalid.section);
        }
        firstInvalid.field?.focus?.();
        return null;
    }

    return draft;
}

function renderPatConfirmFreshLegacy(draft) {
    if (confirmRoute) {
        confirmRoute.innerHTML = `
            <div class="pat-confirm-stop">
                <strong>${draft.origin.toUpperCase()}</strong>
                ${draft.originRadius ? `<div class="pat-confirm-radius">(${draft.originRadius} mi)</div>` : ''}
                <span>${formatScheduleStamp(draft.startDate, draft.startTime)}</span>
            </div>
            <div class="pat-confirm-dash" aria-hidden="true">&ndash;</div>
            <div class="pat-confirm-stop">
                <strong>${draft.destination.toUpperCase()}</strong>
                ${draft.destinationRadius ? `<div class="pat-confirm-radius">(${draft.destinationRadius} mi)</div>` : ''}
                <span>${formatScheduleStamp(draft.endDate, draft.endTime)}</span>
            </div>
        `;
    }

    if (confirmMeta) {
        const topLine = [
            draft.stem ? `Stem: ${draft.stem}` : '',
            draft.startWindow ? `Start window: ${draft.startWindow}` : ''
        ].filter(Boolean).join('   ');
        const bottomLine = joinCreateOrderPartsSafe([
            draft.orderKind,
            draft.loadMode,
            draft.equipment,
            draft.rangeSummary,
            draft.driver
        ]);
        confirmMeta.innerHTML = `
            ${topLine ? `<div class="pat-confirm-meta-line">${topLine}</div>` : ''}
            ${bottomLine ? `<div class="pat-confirm-meta-line">${bottomLine}</div>` : ''}
        `;
    }

    if (confirmPayout) {
        confirmPayout.innerHTML = `${formatMoney(parseNumber(draft.minPayout))} <span>(${formatMoney(parseNumber(draft.minPricePerMile))}/mi)</span>`;
    }
}

function renderPatConfirmOriginDestinationOnly() {
    if (confirmRoute) {
        const origin = (createOrderOriginSelect?.value || 'Origin').toUpperCase();
        const destination = (createOrderDestinationSelect?.value || 'Destination').toUpperCase();
        const originRadius = createOrderOriginRadiusSelect?.value || '';
        const destinationRadius = createOrderDestinationRadiusSelect?.value || '';
        const startStamp = formatScheduleStamp(scheduleStartDateInput?.value || '', scheduleStartTimeInput?.value || '');
        const endStamp = formatScheduleStamp(scheduleEndDateInput?.value || '', scheduleEndTimeInput?.value || '');

        confirmRoute.innerHTML = `
            <div class="pat-confirm-stop">
                <strong>${origin}</strong>
                ${originRadius ? `<div class="pat-confirm-radius">(${originRadius} mi)</div>` : ''}
                ${startStamp ? `<span>${startStamp}</span>` : ''}
            </div>
            <div class="pat-confirm-dash" aria-hidden="true">&ndash;</div>
            <div class="pat-confirm-stop">
                <strong>${destination}</strong>
                ${destinationRadius ? `<div class="pat-confirm-radius">(${destinationRadius} mi)</div>` : ''}
                ${endStamp ? `<span>${endStamp}</span>` : ''}
            </div>
        `;
    }

    if (confirmMeta) {
        const stem = getSelectDisplayValue(scheduleStemTimeSelect);
        const startWindow = getSelectDisplayValue(scheduleStartWindowSelect);
        const scheduleLine = [
            stem ? `Stem: ${stem}` : '',
            startWindow ? `Start window: ${startWindow}` : ''
        ].filter(Boolean).join('   ');
        const orderType = getActiveOrderType();
        const orderKind = orderType === 'power-only'
            ? (getCheckedChoiceLabel('pat-power-work') || 'Power only')
            : orderType === 'box-truck'
                ? 'Box truck'
                : orderType === 'tractor-trailer'
                    ? 'Tractor & Trailer'
                    : '';
        const equipment = orderType === 'box-truck'
            ? getCheckedChoiceLabel('pat-box-equipment')
            : orderType === 'tractor-trailer'
                ? getCheckedChoiceLabel('pat-tractor-equipment')
                : (() => {
                    const chosen = getSelectDisplayValue(document.getElementById('pat-power-equipment'));
                    return formatPatPowerEquipmentSummary(chosen);
                })();
        const driver = orderType === 'box-truck'
            ? getCheckedChoiceLabel('pat-box-driver')
            : orderType === 'tractor-trailer'
                ? getCheckedChoiceLabel('pat-tractor-driver')
                : getCheckedChoiceLabel('pat-power-driver');
        const tripLength = getSelectDisplayValue(scheduleTripLengthSelect);
        const minRange = scheduleMinRangeInput?.value?.trim() || '';
        const maxRange = scheduleMaxRangeInput?.value?.trim() || '';
        const rangeSummary = tripLength && minRange && maxRange
            ? `${minRange}-${maxRange} ${tripLength === 'Duration' ? 'Hours' : 'mi.'}`
            : '';
        const orderLine = [
            orderKind,
            equipment,
            rangeSummary,
            driver
        ].filter(Boolean).join(' • ');

        confirmMeta.innerHTML = `
            ${scheduleLine ? `<div class="pat-confirm-meta-line">${scheduleLine}</div>` : ''}
            ${orderLine ? `<div class="pat-confirm-meta-line">${orderLine}</div>` : ''}
        `;
    }

    if (confirmPayout) {
        const minPayout = payoutMinPayoutInput?.value?.trim() || '';
        const minPricePerMile = payoutPricePerMileInput?.value?.trim() || '';
        if (minPayout || minPricePerMile) {
            const payoutText = minPayout ? formatMoney(parseNumber(minPayout)) : '';
            const rateText = minPricePerMile ? `${formatMoney(parseNumber(minPricePerMile))}/mi` : '';
            confirmPayout.innerHTML = `
                ${payoutText}
                ${rateText ? `<span>(${rateText})</span>` : ''}
            `;
        } else {
            confirmPayout.innerHTML = '';
        }
    }
}

function joinPatConfirmPartsFresh(parts) {
    return parts.filter(Boolean).join(' &bull; ');
}

function buildPatConfirmPayloadFresh() {
    const orderType = getActiveOrderType();
    const tripLength = getSelectDisplayValue(scheduleTripLengthSelect);
    const minRange = scheduleMinRangeInput?.value?.trim() || '';
    const maxRange = scheduleMaxRangeInput?.value?.trim() || '';

    let orderKind = '';
    let equipment = '';
    let driver = '';
    let specialService = '';

    if (orderType === 'power-only') {
        orderKind = getCheckedChoiceLabel('pat-power-work') || 'Power only';
        const chosenEquipment = getSelectDisplayValue(document.getElementById('pat-power-equipment'));
        equipment = formatPatPowerEquipmentSummary(chosenEquipment);
        driver = getCheckedChoiceLabel('pat-power-driver');
    } else if (orderType === 'box-truck') {
        orderKind = 'Box truck';
        equipment = getCheckedChoiceLabel('pat-box-equipment');
        driver = getCheckedChoiceLabel('pat-box-driver');
    } else if (orderType === 'tractor-trailer') {
        orderKind = 'Tractor & Trailer';
        equipment = getCheckedChoiceLabel('pat-tractor-equipment');
        driver = getCheckedChoiceLabel('pat-tractor-driver');
        specialService = orderTypeDetails?.querySelector('input[name="pat-special-swing-door"]')?.checked
            ? 'Swing Door Trailer'
            : '';
    }

    return {
        origin: (createOrderOriginSelect?.value || 'Origin').toUpperCase(),
        destination: (createOrderDestinationSelect?.value || 'Destination').toUpperCase(),
        originRadius: createOrderOriginRadiusSelect?.value?.trim() || '',
        destinationRadius: createOrderDestinationRadiusSelect?.value?.trim() || '',
        startStamp: formatScheduleStamp(scheduleStartDateInput?.value || '', scheduleStartTimeInput?.value || ''),
        endStamp: formatScheduleStamp(scheduleEndDateInput?.value || '', scheduleEndTimeInput?.value || ''),
        scheduleLine: [
            getSelectDisplayValue(scheduleStemTimeSelect) ? `Stem: ${getSelectDisplayValue(scheduleStemTimeSelect)}` : '',
            getSelectDisplayValue(scheduleStartWindowSelect) ? `Start window: ${getSelectDisplayValue(scheduleStartWindowSelect)}` : ''
        ].filter(Boolean).join('   '),
        orderLine: joinPatConfirmPartsFresh([
            orderKind,
            equipment,
            tripLength && minRange && maxRange
                ? `${minRange}-${maxRange} ${tripLength === 'Duration' ? 'Hours' : 'mi.'}`
                : '',
            driver,
            specialService
        ]),
        payoutText: payoutMinPayoutInput?.value?.trim() ? formatMoney(parseNumber(payoutMinPayoutInput.value.trim())) : '',
        rateText: payoutPricePerMileInput?.value?.trim()
            ? `${formatMoney(parseNumber(payoutPricePerMileInput.value.trim()))}/mi`
            : ''
    };
}

function renderPatConfirmSnapshot() {
    const payload = buildPatConfirmPayloadFresh();

    if (confirmRoute) {
        confirmRoute.innerHTML = `
            <div class="pat-confirm-stop">
                <strong>${payload.origin}</strong>
                ${payload.originRadius ? `<div class="pat-confirm-radius">(${payload.originRadius} mi)</div>` : ''}
                ${payload.startStamp ? `<span>${payload.startStamp}</span>` : ''}
            </div>
            <div class="pat-confirm-dash" aria-hidden="true">&ndash;</div>
            <div class="pat-confirm-stop">
                <strong>${payload.destination}</strong>
                ${payload.destinationRadius ? `<div class="pat-confirm-radius">(${payload.destinationRadius} mi)</div>` : ''}
                ${payload.endStamp ? `<span>${payload.endStamp}</span>` : ''}
            </div>
        `;
    }

    if (confirmMeta) {
        confirmMeta.innerHTML = `
            ${payload.scheduleLine ? `<div class="pat-confirm-meta-line">${payload.scheduleLine}</div>` : ''}
            ${payload.orderLine ? `<div class="pat-confirm-meta-line">${payload.orderLine}</div>` : ''}
        `;
    }

    if (confirmPayout) {
        confirmPayout.innerHTML = payload.payoutText || payload.rateText
            ? `${payload.payoutText}${payload.rateText ? ` <span>(${payload.rateText})</span>` : ''}`
            : '';
    }
}

function showPatConfirmFresh() {
    if (confirmOverlay) {
        confirmOverlay.hidden = false;
    }

    try {
        renderPatConfirmSnapshot();
    } catch (error) {
        console.error('PAT confirmation render failed:', error);
        if (confirmRoute) confirmRoute.innerHTML = '';
        if (confirmMeta) confirmMeta.innerHTML = '<div class="pat-confirm-meta-line">Unable to load confirmation details.</div>';
        if (confirmPayout) confirmPayout.innerHTML = '';
    }
}

function openPatCreateSubmitConfirmation(event) {
    event.preventDefault();
    event.stopPropagation();
    showPatConfirmFresh();
}

function buildPatCreatedOrderId() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let index = 0; index < 9; index += 1) {
        suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return `P-${suffix}`;
}

function hidePatCreateToast() {
    if (patCreateToastTimer) {
        clearTimeout(patCreateToastTimer);
        patCreateToastTimer = null;
    }

    if (createToast) {
        createToast.hidden = true;
    }
}

function showPatCreateToast(message) {
    if (!createToast || !createToastMessage) return;

    hidePatCreateToast();
    createToastMessage.textContent = message;
    createToast.hidden = false;
    patCreateToastTimer = setTimeout(() => {
        hidePatCreateToast();
    }, 4500);
}

function loadPatOrders() {
    try {
        const raw = sessionStorage.getItem(PAT_ORDER_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to load Post A Truck orders:', error);
        return [];
    }
}

function savePatOrders() {
    try {
        sessionStorage.setItem(PAT_ORDER_STORAGE_KEY, JSON.stringify(patOrders));
    } catch (error) {
        console.error('Failed to save Post A Truck orders:', error);
    }
}

function reconcilePatOrdersWithBookedTrips() {
    const isRejectedHistoryTrip = (trip) => (trip?.status || 'upcoming') === 'history'
        && (((trip?.historyStatus || '').toLowerCase() === 'rejected') || Boolean(trip?.rejection?.reason));
    const bookedTripsByOrderId = new Map(
        loadBookedTrips()
            .filter((trip) => trip?.patOrderId)
            .map((trip) => [trip.patOrderId, trip])
    );

    let didChange = false;

    patOrders.forEach((order) => {
        const linkedTrip = bookedTripsByOrderId.get(order.id);
        if (!linkedTrip) {
            return;
        }

        const nextStatus = linkedTrip.status === 'history' ? 'history' : 'matched';
        if (order.status !== nextStatus) {
            order.status = nextStatus;
            didChange = true;
        }

        if (order.autoStatus !== 'booked') {
            order.autoStatus = 'booked';
            didChange = true;
        }

        if (order.autoBookAt) {
            order.autoBookAt = '';
            didChange = true;
        }

        if (order.autoSearchReadyAt || order.pendingReservedLoadKey) {
            order.autoSearchReadyAt = '';
            order.pendingReservedLoadKey = '';
            clearPatOrderReservedSearchTimer(order.id);
            didChange = true;
        }

        const historyMessage = isRejectedHistoryTrip(linkedTrip)
            ? 'This load was rejected and moved to History'
            : 'This load was completed and moved to History';
        const historyTone = isRejectedHistoryTrip(linkedTrip) ? 'warning' : 'success';

        if (nextStatus === 'history' && order.autoMessage !== historyMessage) {
            order.autoMessage = historyMessage;
            order.autoTone = historyTone;
            didChange = true;
        }
    });

    if (didChange) {
        savePatOrders();
    }
}

function clearPatOrderAutoBookTimer(orderId) {
    const timerId = patOrderAutoBookTimers.get(orderId);
    if (timerId) {
        clearTimeout(timerId);
        patOrderAutoBookTimers.delete(orderId);
    }
}

function clearPatOrderReservedSearchTimer(orderId) {
    const timerId = patOrderReservedSearchTimers.get(orderId);
    if (timerId) {
        clearTimeout(timerId);
        patOrderReservedSearchTimers.delete(orderId);
    }
}

function findPatReservedLoadMatch(order) {
    const reservedKeys = getPatReservedLoadKeys(order.id);
    return getHiddenReservedLoads().find((load) => {
        const loadKey = getLoadKey(load);
        return !reservedKeys.has(loadKey) && loadMatchesPatOrder(order, load);
    }) || null;
}

function normalizePatWorkType(label) {
    if (!label) return '';
    if (label === 'Blocks') return 'Block';
    return label;
}

function normalizePatLoadType(label) {
    if (!label) return '';
    if (label === 'Drop & Hook') return 'Drop and hook';
    if (label === 'Live or Drop & Hook') return 'Either';
    return label;
}

function getCityDistance(referenceCity, targetCity) {
    if (!referenceCity || !targetCity) return 0;
    if (referenceCity === targetCity) return 0;

    if (typeof distanceLookup !== 'undefined') {
        const direct = distanceLookup[referenceCity]?.[targetCity];
        const reverse = distanceLookup[targetCity]?.[referenceCity];
        if (typeof direct === 'number') return direct;
        if (typeof reverse === 'number') return reverse;
    }

    return Number.POSITIVE_INFINITY;
}

function parseSelectNumber(value) {
    const parsed = parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function parsePatDurationHours(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return 0;

    if (text === '30-min' || text === '30 min') return 0.5;

    const hourMatch = text.match(/^(\d+)-hr$/);
    if (hourMatch) return Number(hourMatch[1]);

    const halfHourMatch = text.match(/^(\d+)-30$/);
    if (halfHourMatch) return Number(halfHourMatch[1]) + 0.5;

    const displayHourMatch = text.match(/^(\d+)\s*hr$/);
    if (displayHourMatch) return Number(displayHourMatch[1]);

    const displayHalfHourMatch = text.match(/^(\d+)\s*hr\s*30\s*min$/);
    if (displayHalfHourMatch) return Number(displayHalfHourMatch[1]) + 0.5;

    return parseSelectNumber(text);
}

function getPatReservedLoadKeys(excludedOrderId = '') {
    return new Set(
        patOrders
            .filter((order) => order.id !== excludedOrderId && (order.pendingLoadKey || order.pendingReservedLoadKey))
            .flatMap((order) => [order.pendingLoadKey, order.pendingReservedLoadKey].filter(Boolean))
    );
}

function loadMatchesPatOrder(order, load) {
    if (!order || !load) return false;

    const loadOriginMarket = load.originMarket || load.originCity;
    const loadDestinationMarket = load.destinationMarket || load.destinationCity;

    if (order.excludedCity && (
        load.originCity === order.excludedCity
        || load.destinationCity === order.excludedCity
        || loadOriginMarket === order.excludedCity
        || loadDestinationMarket === order.excludedCity
    )) {
        return false;
    }

    if (order.originCity) {
        const originRadius = parseSelectNumber(order.originRadius);
        const originDistance = getCityDistance(order.originCity, loadOriginMarket);
        if (originRadius && originDistance > originRadius) return false;
        if (!originRadius && originDistance > 0) return false;
    }

    if (order.destinationCity) {
        const destinationRadius = parseSelectNumber(order.destinationRadius);
        const destinationDistance = getCityDistance(order.destinationCity, loadDestinationMarket);
        if (destinationRadius && destinationDistance > destinationRadius) return false;
        if (!destinationRadius && destinationDistance > 0) return false;
    }

    const startDateTimeRaw = order.startDate && order.startTime
        ? combineDateAndTime(order.startDate, order.startTime, false)
        : null;
    const startDateTime = startDateTimeRaw
        ? roundUpToTimeSlot(startDateTimeRaw, LOAD_TIME_SLOT_MINUTES)
        : null;
    const endDateTime = order.endDate && order.endTime
        ? combineDateAndTime(order.endDate, order.endTime, false)
        : null;
    const startWindowHours = parsePatDurationHours(order.startWindowValue);
    const startWindowEnd = startDateTime && startWindowHours
        ? addMinutes(startDateTime, startWindowHours * 60)
        : null;

    if (startDateTime && load.pickupDateTime.getTime() < startDateTime.getTime()) return false;
    if (startWindowEnd && load.pickupDateTime.getTime() > startWindowEnd.getTime()) return false;
    if (endDateTime && load.deliveryDateTime.getTime() > endDateTime.getTime()) return false;

    if (order.tripLengthMode === 'distance') {
        if (order.minRangeValue && load.miles < order.minRangeValue) return false;
        if (order.maxRangeValue && load.miles > order.maxRangeValue) return false;
    }

    if (order.tripLengthMode === 'duration') {
        if (order.minRangeValue && load.durationHours < order.minRangeValue) return false;
        if (order.maxRangeValue && load.durationHours > order.maxRangeValue) return false;
    }

    if (order.maxStopsValue && load.stops > order.maxStopsValue) return false;
    if (order.minPricePerMileValue && load.pricePerMileValue < order.minPricePerMileValue) return false;
    if (order.minPayoutValue && load.priceValue < order.minPayoutValue) return false;
    if (order.driverType && load.driverType !== order.driverType) return false;

    if (order.orderType === 'power-only') {
        if (order.workType && load.workType !== order.workType) return false;
        if (order.equipment && normalizeEquipmentForMatch(load.equipment) !== normalizeEquipmentForMatch(order.equipment)) return false;
    } else if (order.orderType === 'box-truck') {
        return false;
    } else if (order.orderType === 'tractor-trailer') {
        if (order.equipment && normalizeEquipmentForMatch(load.equipment) !== normalizeEquipmentForMatch(order.equipment)) return false;
        if (order.specialService) return false;
    }

    return true;
}

function findPatOrderMatch(order) {
    const reservedKeys = getPatReservedLoadKeys(order.id);
    return amazonLoadsByPickupTime.find((load) => {
        const loadKey = getLoadKey(load);
        return !bookedLoadKeys.has(loadKey)
            && !reservedKeys.has(loadKey)
            && loadMatchesPatOrder(order, load);
    }) || null;
}

function evaluatePatOrderAvailability(order, options = {}) {
    const preserveTimer = options.preserveTimer !== false;
    clearPatOrderAutoBookTimer(order.id);

    const matchedLoad = findPatOrderMatch(order);
    if (matchedLoad) {
        const nextLoadKey = getLoadKey(matchedLoad);
        const existingAutoBookAt = order.autoBookAt ? new Date(order.autoBookAt).getTime() : 0;
        const keepExistingTimer = preserveTimer
            && order.autoStatus === 'available'
            && order.pendingLoadKey === nextLoadKey
            && existingAutoBookAt > Date.now();

        clearPatOrderReservedSearchTimer(order.id);
        order.pendingLoadKey = nextLoadKey;
        order.pendingReservedLoadKey = '';
        order.autoSearchReadyAt = '';
        order.autoBookAt = keepExistingTimer
            ? order.autoBookAt
            : new Date(Date.now() + PAT_AUTO_BOOK_DELAY_MS).toISOString();
        order.autoStatus = 'available';
        order.autoMessage = 'This load will be booked automatically because it is available on the board';
        order.autoTone = 'success';
        return;
    }

    const reservedLoad = findPatReservedLoadMatch(order);
    if (reservedLoad) {
        const nextReservedLoadKey = getLoadKey(reservedLoad);
        const existingSearchReadyAt = order.autoSearchReadyAt ? new Date(order.autoSearchReadyAt).getTime() : 0;
        const keepExistingSearch = preserveTimer
            && order.autoStatus === 'searching'
            && order.pendingReservedLoadKey === nextReservedLoadKey
            && existingSearchReadyAt > Date.now();

        order.pendingLoadKey = '';
        order.pendingReservedLoadKey = nextReservedLoadKey;
        order.autoBookAt = '';
        order.autoSearchReadyAt = keepExistingSearch
            ? order.autoSearchReadyAt
            : new Date(Date.now() + PAT_RESERVED_SEARCH_DELAY_MS).toISOString();
        order.autoStatus = 'searching';
        order.autoMessage = 'Searching...';
        order.autoTone = 'neutral';
        return;
    }

    clearPatOrderReservedSearchTimer(order.id);
    order.pendingLoadKey = '';
    order.pendingReservedLoadKey = '';
    order.autoBookAt = '';
    order.autoSearchReadyAt = '';
    order.autoStatus = 'waiting';
    order.autoMessage = 'There is no load for this criteria in the board. In real life you will have to wait for Amazon to post matching load';
    order.autoTone = 'warning';
}

function refreshPatOrderMatches() {
    let didChange = false;

    patOrders.forEach((order) => {
        if (order.autoStatus === 'booked' || order.status !== 'open') {
            return;
        }

        const before = JSON.stringify({
            pendingLoadKey: order.pendingLoadKey,
            pendingReservedLoadKey: order.pendingReservedLoadKey,
            autoBookAt: order.autoBookAt,
            autoSearchReadyAt: order.autoSearchReadyAt,
            autoStatus: order.autoStatus,
            autoMessage: order.autoMessage,
            autoTone: order.autoTone
        });

        evaluatePatOrderAvailability(order, { preserveTimer: true });
        schedulePatOrderReservedSearch(order);
        schedulePatOrderAutoBook(order);

        const after = JSON.stringify({
            pendingLoadKey: order.pendingLoadKey,
            pendingReservedLoadKey: order.pendingReservedLoadKey,
            autoBookAt: order.autoBookAt,
            autoSearchReadyAt: order.autoSearchReadyAt,
            autoStatus: order.autoStatus,
            autoMessage: order.autoMessage,
            autoTone: order.autoTone
        });

        if (before !== after) {
            didChange = true;
        }
    });

    if (didChange) {
        savePatOrders();
    }
}

function runPatOrderReservedSearch(orderId) {
    clearPatOrderReservedSearchTimer(orderId);

    const order = patOrders.find((item) => item.id === orderId);
    if (!order || !order.pendingReservedLoadKey || order.status !== 'open') return;

    const reservedLoad = reservedAmazonLoadKeyMap.get(order.pendingReservedLoadKey);
    if (!reservedLoad || bookedLoadKeys.has(order.pendingReservedLoadKey)) {
        evaluatePatOrderAvailability(order);
        savePatOrders();
        renderPatOrders();
        return;
    }

    releaseReservedLoad(reservedLoad);
    order.pendingReservedLoadKey = '';
    order.autoSearchReadyAt = '';
    evaluatePatOrderAvailability(order, { preserveTimer: false });
    savePatOrders();
    renderPatRecommendations();
    renderPatOrders();
    applyFilters({ resetPage: false });
}

function schedulePatOrderReservedSearch(order) {
    clearPatOrderReservedSearchTimer(order.id);
    if (!order.pendingReservedLoadKey || !order.autoSearchReadyAt) return;

    const delayMs = new Date(order.autoSearchReadyAt).getTime() - Date.now();
    if (delayMs <= 0) {
        runPatOrderReservedSearch(order.id);
        return;
    }

    const timerId = setTimeout(() => {
        runPatOrderReservedSearch(order.id);
    }, delayMs);
    patOrderReservedSearchTimers.set(order.id, timerId);
}

function runPatOrderAutoBook(orderId) {
    clearPatOrderAutoBookTimer(orderId);
    clearPatOrderReservedSearchTimer(orderId);

    const order = patOrders.find((item) => item.id === orderId);
    if (!order || !order.pendingLoadKey) return;

    const matchedLoad = amazonLoadKeyMap.get(order.pendingLoadKey) || null;
    if (!matchedLoad || bookedLoadKeys.has(order.pendingLoadKey)) {
        evaluatePatOrderAvailability(order);
        savePatOrders();
        renderPatOrders();
        return;
    }

    bookedLoadKeys.add(order.pendingLoadKey);
    saveBookedTrip(matchedLoad, { patOrderId: order.id });
    order.status = 'matched';
    order.matchedAt = new Date().toISOString();
    order.autoStatus = 'booked';
    order.autoBookAt = '';
    order.autoSearchReadyAt = '';
    order.pendingReservedLoadKey = '';
    order.autoMessage = 'This load was booked automatically and moved to Upcoming Trips';
    order.autoTone = 'success';
    savePatOrders();
    refreshPatOrderMatches();
    renderPatRecommendations();
    renderPatOrders();
    applyFilters();
    showPatCreateToast(`Order ${order.id} booked to Upcoming Trips`);
}

function schedulePatOrderAutoBook(order) {
    clearPatOrderAutoBookTimer(order.id);
    if (!order.pendingLoadKey || !order.autoBookAt) return;

    const delayMs = new Date(order.autoBookAt).getTime() - Date.now();
    if (delayMs <= 0) {
        runPatOrderAutoBook(order.id);
        return;
    }

    const timerId = setTimeout(() => {
        runPatOrderAutoBook(order.id);
    }, delayMs);
    patOrderAutoBookTimers.set(order.id, timerId);
}

function initializePatOrderAutoBook() {
    reconcilePatOrdersWithBookedTrips();
    patOrders.forEach((order) => {
        if (order.status !== 'open') {
            clearPatOrderAutoBookTimer(order.id);
            return;
        }

        if (order.autoStatus === 'booked') {
            if (order.pendingLoadKey && !bookedLoadKeys.has(order.pendingLoadKey)) {
                runPatOrderAutoBook(order.id);
            }
        } else if (order.pendingReservedLoadKey && order.autoSearchReadyAt) {
            schedulePatOrderReservedSearch(order);
        } else if (order.pendingLoadKey && order.autoBookAt) {
            schedulePatOrderAutoBook(order);
        } else {
            evaluatePatOrderAvailability(order);
        }
    });
    refreshPatOrderMatches();
    savePatOrders();
}

function renderPatOrders() {
    if (!patOrdersList || !patOrdersEmpty) return;

    const visibleOrders = patOrders
        .filter((order) => order.status === activePatOrderStatus)
        .sort((left, right) => String(left.startDate || '').localeCompare(String(right.startDate || '')) || String(left.startTime || '').localeCompare(String(right.startTime || '')));

    patOrdersList.innerHTML = visibleOrders.map((order) => `
        <div class="pat-created-order-card" data-pat-order-id="${order.id}">
            <div class="pat-created-order-row">
                <div class="pat-created-order-toggle" aria-hidden="true">&#8250;</div>
                <label class="pat-created-order-check" aria-label="Select ${order.id}">
                    <input type="checkbox">
                </label>
                <div class="pat-created-order-id">
                    <span>${order.id}</span>
                    <span class="pat-created-order-id-link" aria-hidden="true">&#8599;</span>
                </div>
                <div class="pat-route-block">
                    <div class="pat-location">
                        <strong>${order.origin} ${order.originRadius ? `<span>(${order.originRadius} mi)</span>` : ''}</strong>
                        ${order.startStamp ? `<span>${order.startStamp}</span>` : ''}
                        ${order.scheduleLine ? `<span>${order.scheduleLine}</span>` : ''}
                    </div>
                    <div class="pat-route-arrow">&mdash;</div>
                    <div class="pat-location">
                        <strong>${order.destination} ${order.destinationRadius ? `<span>(${order.destinationRadius} mi)</span>` : ''}</strong>
                        ${order.endStamp ? `<span>${order.endStamp}</span>` : ''}
                    </div>
                </div>
                <div class="pat-created-order-meta">
                    ${order.orderLine ? `<div>${order.orderLine}</div>` : ''}
                    ${(order.payoutText || order.rateText) ? `<strong>${order.payoutText || ''}${order.rateText ? ` <span>(${order.rateText})</span>` : ''}</strong>` : ''}
                </div>
                <div class="pat-created-order-actions">
                    <span>&#128203;</span>
                    ${order.status === 'open'
                        ? `<button type="button" class="pat-order-action-button" data-pat-order-edit="${order.id}" aria-label="Edit order ${order.id}">&#9998;</button>`
                        : `<span aria-hidden="true">&#9998;</span>`}
                    <button type="button" class="pat-order-action-button" data-pat-order-cancel="${order.id}" aria-label="Cancel order ${order.id}">&times;</button>
                </div>
            </div>
            ${order.autoMessage ? `<div class="pat-created-order-message is-${order.autoTone || 'warning'}">${order.autoMessage}</div>` : ''}
        </div>
    `).join('');

    patOrdersList.hidden = visibleOrders.length === 0;
    patOrdersEmpty.hidden = visibleOrders.length !== 0;
    patOrdersEmpty.textContent = activePatOrderStatus === 'open'
        ? 'There are no existing orders'
        : `There are no ${activePatOrderStatus} orders`;
}

function buildPatOrderRecord() {
    const payload = buildPatConfirmPayloadFresh();
    const orderType = getActiveOrderType();
    const tripLengthMode = scheduleTripLengthSelect?.value || '';
    const maxStopsRaw = scheduleMaxStopsSelect?.value || '';
    const scheduleDriverValue = scheduleDriversSelect?.value || '';
    const repostValue = orderType === 'box-truck'
        ? getCheckedChoiceLabel('pat-box-repost')
        : orderType === 'tractor-trailer'
            ? getCheckedChoiceLabel('pat-tractor-repost')
            : getCheckedChoiceLabel('pat-power-repost');
    return {
        id: buildPatCreatedOrderId(),
        status: 'open',
        createdAt: new Date().toISOString(),
        origin: payload.origin,
        destination: payload.destination,
        originRadius: payload.originRadius,
        destinationRadius: payload.destinationRadius,
        startStamp: payload.startStamp,
        endStamp: payload.endStamp,
        scheduleLine: payload.scheduleLine,
        orderLine: payload.orderLine,
        payoutText: payload.payoutText,
        rateText: payload.rateText,
        startDate: scheduleStartDateInput?.value || '',
        startTime: scheduleStartTimeInput?.value || '',
        endDate: scheduleEndDateInput?.value || '',
        endTime: scheduleEndTimeInput?.value || '',
        startWindowValue: scheduleStartWindowSelect?.value || '',
        stemValue: scheduleStemTimeSelect?.value || '',
        tripLengthMode,
        minRangeValue: parseNumber(scheduleMinRangeInput?.value || ''),
        maxRangeValue: parseNumber(scheduleMaxRangeInput?.value || ''),
        maxStopsValue: maxStopsRaw === 'any' ? 0 : parseSelectNumber(maxStopsRaw),
        maxStopsRaw,
        scheduleDriverValue,
        minPricePerMileValue: parseNumber(payoutPricePerMileInput?.value || ''),
        minPayoutValue: parseNumber(payoutMinPayoutInput?.value || ''),
        originCity: createOrderOriginSelect?.value || '',
        destinationCity: createOrderDestinationSelect?.value || '',
        excludedCity: createOrderExcludedSelect?.value || '',
        workType: normalizePatWorkType(getCheckedChoiceLabel('pat-power-work')),
        loadMode: normalizePatLoadType(getCheckedChoiceLabel('pat-power-load')),
        equipment: orderType === 'power-only'
            ? getSelectDisplayValue(document.getElementById('pat-power-equipment'))
            : orderType === 'box-truck'
                ? getCheckedChoiceLabel('pat-box-equipment')
                : getCheckedChoiceLabel('pat-tractor-equipment'),
        driverType: orderType === 'box-truck'
            ? getCheckedChoiceLabel('pat-box-driver')
            : orderType === 'tractor-trailer'
                ? getCheckedChoiceLabel('pat-tractor-driver')
                : getCheckedChoiceLabel('pat-power-driver'),
        specialService: orderTypeDetails?.querySelector('input[name="pat-special-swing-door"]')?.checked
            ? 'Swing Door Trailer'
            : '',
        repostValue,
        orderType,
        pendingLoadKey: '',
        pendingReservedLoadKey: '',
        autoBookAt: '',
        autoSearchReadyAt: '',
        autoStatus: '',
        autoMessage: '',
        autoTone: ''
    };
}

function hidePatConfirmFresh() {
    if (confirmOverlay) {
        confirmOverlay.hidden = true;
    }
}

function populatePatCreateFormFromOrder(order) {
    if (!order) return;

    setActiveOrderType(order.orderType || 'power-only');

    setSelectValue(createOrderOriginSelect, order.originCity || '');
    setSelectValue(createOrderOriginRadiusSelect, order.originRadius || '');
    setSelectValue(createOrderDestinationSelect, order.destinationCity || '');
    setSelectValue(createOrderDestinationRadiusSelect, order.destinationRadius || '');
    setSelectValue(createOrderExcludedSelect, order.excludedCity || '');

    if (scheduleStartDateInput) scheduleStartDateInput.value = order.startDate || '';
    if (scheduleStartTimeInput) scheduleStartTimeInput.value = order.startTime || '';
    if (scheduleEndDateInput) scheduleEndDateInput.value = order.endDate || '';
    if (scheduleEndTimeInput) scheduleEndTimeInput.value = order.endTime || '';
    setSelectValue(scheduleStartWindowSelect, order.startWindowValue || '');
    setSelectValue(scheduleStemTimeSelect, order.stemValue || '');
    setSelectValue(scheduleTripLengthSelect, order.tripLengthMode || '');
    if (scheduleMinRangeInput) scheduleMinRangeInput.value = order.minRangeValue || '';
    if (scheduleMaxRangeInput) scheduleMaxRangeInput.value = order.maxRangeValue || '';
    setSelectValue(scheduleMaxStopsSelect, order.maxStopsRaw || (order.maxStopsValue === 0 ? 'any' : String(order.maxStopsValue || '')));
    setSelectValue(scheduleDriversSelect, order.scheduleDriverValue || '');

    if (payoutPricePerMileInput) payoutPricePerMileInput.value = order.minPricePerMileValue || '';
    if (payoutMinPayoutInput) payoutMinPayoutInput.value = order.minPayoutValue || '';

    if (order.orderType === 'power-only') {
        setChoiceByLabel('pat-power-work', order.workType, normalizePatWorkType);
        setChoiceByLabel('pat-power-load', order.loadMode, normalizePatLoadType);
        setSelectValue(document.getElementById('pat-power-equipment'), order.equipment || '');
        setChoiceByLabel('pat-power-driver', order.driverType);
        setChoiceByLabel('pat-power-repost', order.repostValue);
    } else if (order.orderType === 'box-truck') {
        setChoiceByLabel('pat-box-equipment', order.equipment);
        setChoiceByLabel('pat-box-driver', order.driverType);
        setChoiceByLabel('pat-box-repost', order.repostValue);
    } else if (order.orderType === 'tractor-trailer') {
        setChoiceByLabel('pat-tractor-equipment', order.equipment);
        setChoiceByLabel('pat-tractor-driver', order.driverType);
        const swingDoorInput = orderTypeDetails?.querySelector('input[name="pat-special-swing-door"]');
        if (swingDoorInput) {
            swingDoorInput.checked = Boolean(order.specialService);
        }
        setChoiceByLabel('pat-tractor-repost', order.repostValue);
    }

    syncScheduleRangeLabels();
    syncScheduleDateTimeConstraints();
    updateCreateOrderSummaries();
    setExpandedCreateSection(createOrderOrderTypeSection);
}

function beginPatOrderEdit(orderId) {
    const order = patOrders.find((item) => item.id === orderId && item.status === 'open');
    if (!order) {
        return;
    }

    activePatEditOrderId = orderId;
    populatePatCreateFormFromOrder(order);
    setLoadboardView('create-order');
}

function beginPatRecommendationCreate(recommendationKey) {
    const recommendation = patRecommendationCache.get(recommendationKey);
    if (!recommendation) {
        return;
    }

    activePatEditOrderId = '';
    populatePatCreateFormFromOrder(recommendation);
    setLoadboardView('create-order');
}

function openPatCancelConfirmation(orderId) {
    const order = patOrders.find((item) => item.id === orderId);
    if (!order || !cancelOverlay) {
        return;
    }

    pendingPatCancelOrderId = orderId;
    if (cancelCopy) {
        cancelCopy.textContent = order.status === 'open'
            ? `This will stop order ${orderId} and remove it from the active orders list.`
            : `This will remove order ${orderId} from Post A Truck Orders only. It will not remove the trip from Trips.`;
    }
    cancelOverlay.hidden = false;
}

function hidePatCancelConfirmation() {
    pendingPatCancelOrderId = '';
    if (cancelOverlay) {
        cancelOverlay.hidden = true;
    }
}

function confirmPatOrderCancellation() {
    if (!pendingPatCancelOrderId) {
        hidePatCancelConfirmation();
        return;
    }

    const orderId = pendingPatCancelOrderId;
    const order = patOrders.find((item) => item.id === orderId);
    if (order?.status === 'open') {
        clearPatOrderAutoBookTimer(orderId);
        clearPatOrderReservedSearchTimer(orderId);
    }
    patOrders = patOrders.filter((order) => order.id !== orderId);
    savePatOrders();
    if (order?.status === 'open') {
        refreshPatOrderMatches();
    }
    renderPatRecommendations();
    renderPatOrders();
    hidePatCancelConfirmation();
    showPatCreateToast('Order cancelled.');
}

function routePatCreateOrderClicks(event) {
    const recommendationCreateButton = event.target.closest('[data-pat-recommendation-create]');
    if (recommendationCreateButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        beginPatRecommendationCreate(recommendationCreateButton.dataset.patRecommendationCreate || '');
        return;
    }

    const recommendationsToggleButton = event.target.closest('#pat-recommendations-toggle');
    if (recommendationsToggleButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        patRecommendationsExpanded = !patRecommendationsExpanded;
        renderPatRecommendations();
        return;
    }

    const editOrderButton = event.target.closest('[data-pat-order-edit]');
    if (editOrderButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        beginPatOrderEdit(editOrderButton.dataset.patOrderEdit || '');
        return;
    }

    const cancelOrderButton = event.target.closest('[data-pat-order-cancel]');
    if (cancelOrderButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openPatCancelConfirmation(cancelOrderButton.dataset.patOrderCancel || '');
        return;
    }

    const closeButton = event.target.closest('#pat-confirm-close, #pat-confirm-cancel');
    if (closeButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        hidePatConfirmFresh();
        return;
    }

    const confirmButton = event.target.closest('#pat-confirm-submit');
    if (confirmButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (activePatEditOrderId) {
            const existingOrder = patOrders.find((item) => item.id === activePatEditOrderId && item.status === 'open');
            if (existingOrder) {
                clearPatOrderAutoBookTimer(existingOrder.id);
                clearPatOrderReservedSearchTimer(existingOrder.id);
                const updatedDraft = buildPatOrderRecord();
                const updatedOrder = {
                    ...existingOrder,
                    ...updatedDraft,
                    id: existingOrder.id,
                    status: 'open',
                    createdAt: existingOrder.createdAt,
                    updatedAt: new Date().toISOString(),
                    pendingLoadKey: '',
                    pendingReservedLoadKey: '',
                    autoBookAt: '',
                    autoSearchReadyAt: '',
                    autoStatus: '',
                    autoMessage: '',
                    autoTone: '',
                    matchedAt: ''
                };
                patOrders = patOrders.map((item) => item.id === existingOrder.id ? updatedOrder : item);
                savePatOrders();
                refreshPatOrderMatches();
                renderPatOrders();
                hidePatConfirmFresh();
                activePatEditOrderId = '';
                setLoadboardView('post-a-truck');
                showPatCreateToast(`Order ${updatedOrder.id} updated`);
                return;
            }
        }

        const createdOrder = buildPatOrderRecord();
        evaluatePatOrderAvailability(createdOrder);
        patOrders.unshift(createdOrder);
        savePatOrders();
        schedulePatOrderAutoBook(createdOrder);
        activePatOrderStatus = 'open';
        patOrderStatusTabs.forEach((tab) => {
            tab.classList.toggle('is-active', tab.dataset.patOrderStatus === 'open');
        });
        renderPatOrders();
        hidePatConfirmFresh();
        activePatEditOrderId = '';
        setLoadboardView('post-a-truck');
        showPatCreateToast(`Order ${createdOrder.id} created`);
        return;
    }

    const cancelClose = event.target.closest('#pat-cancel-close, #pat-cancel-cancel');
    if (cancelClose) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        hidePatCancelConfirmation();
        return;
    }

    const cancelConfirm = event.target.closest('#pat-cancel-confirm');
    if (cancelConfirm) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        confirmPatOrderCancellation();
        return;
    }

    const toastCloseButton = event.target.closest('#pat-create-toast-close');
    if (toastCloseButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        hidePatCreateToast();
        return;
    }
}

function renderInlineChoices(name, options, selectedValue = '', type = 'radio') {
    return `
        <div class="pat-inline-choice-row">
            ${options.map((option) => `
                <label class="pat-inline-choice">
                    <input type="${type}" name="${name}" value="${option.value}"${option.value === selectedValue ? ' checked' : ''}>
                    <span class="pat-inline-choice-indicator" aria-hidden="true"></span>
                    <span>${option.label}</span>
                </label>
            `).join('')}
        </div>
    `;
}

function buildOrderTypeDetailsMarkup(orderType) {
    if (orderType === 'box-truck') {
        return `
            <div class="pat-order-type-group">
                <h4>Equipment</h4>
                ${renderInlineChoices('pat-box-equipment', [
                    { value: '26', label: "26'" },
                    { value: '16-cube', label: "16' Cube Truck" }
                ], '26')}
            </div>
            <div class="pat-order-type-group">
                <h4>Driver</h4>
                ${renderInlineChoices('pat-box-driver', [
                    { value: 'solo', label: 'Solo' },
                    { value: 'team', label: 'Team' }
                ], 'solo')}
            </div>
            <div class="pat-order-type-group">
                <h4>Repost Automatically if Amazon Cancels Load</h4>
                ${renderInlineChoices('pat-box-repost', [
                    { value: 'enabled', label: 'Enabled' },
                    { value: 'disabled', label: 'Disabled' }
                ], 'enabled')}
            </div>
        `;
    }

    if (orderType === 'tractor-trailer') {
        return `
            <div class="pat-order-type-group">
                <h4>Equipment</h4>
                ${renderInlineChoices('pat-tractor-equipment', [
                    { value: '53-trailer', label: "53' Trailer" },
                    { value: '53-container', label: "53' Container" },
                    { value: 'trailer-required', label: REQUIRED_TRAILER_EQUIPMENT_LABEL }
                ], '53-trailer')}
            </div>
            <div class="pat-order-type-group">
                <h4>Driver</h4>
                ${renderInlineChoices('pat-tractor-driver', [
                    { value: 'solo', label: 'Solo' },
                    { value: 'team', label: 'Team' }
                ], 'solo')}
            </div>
            <div class="pat-order-type-group">
                <h4>Special services</h4>
                <label class="pat-inline-choice pat-inline-choice-checkbox">
                    <input type="checkbox" name="pat-special-swing-door">
                    <span class="pat-inline-choice-indicator" aria-hidden="true"></span>
                    <span>Swing Door Trailer</span>
                </label>
            </div>
            <div class="pat-order-type-group">
                <h4>Repost Automatically if Amazon Cancels Load</h4>
                ${renderInlineChoices('pat-tractor-repost', [
                    { value: 'enabled', label: 'Enabled' },
                    { value: 'disabled', label: 'Disabled' }
                ], 'enabled')}
            </div>
        `;
    }

    return `
        <div class="pat-order-type-group">
            <h4>Work</h4>
            ${renderInlineChoices('pat-power-work', [
                { value: 'blocks', label: 'Blocks' },
                { value: 'one-way', label: 'One-Way/Round Trip' }
            ], '')}
        </div>
        <div class="pat-order-type-group">
            <h4>Load</h4>
            ${renderInlineChoices('pat-power-load', [
                { value: 'drop-hook', label: 'Drop & Hook' },
                { value: 'live-or-drop', label: 'Live or Drop & Hook' }
            ], 'drop-hook')}
        </div>
        <div class="pat-order-type-group">
            <h4>Equipment</h4>
            <div class="pat-order-type-select-wrap">
                <label class="pat-order-type-select-label" for="pat-power-equipment">Equipment</label>
                <select id="pat-power-equipment" class="pat-order-type-select">
                    <option>53' Trailer</option>
                    <option>${REQUIRED_TRAILER_EQUIPMENT_LABEL}</option>
                </select>
            </div>
        </div>
        <div class="pat-order-type-group">
            <h4>Driver</h4>
            ${renderInlineChoices('pat-power-driver', [
                { value: 'solo', label: 'Solo' },
                { value: 'team', label: 'Team' }
            ], 'solo')}
        </div>
        <div class="pat-order-type-group">
            <h4>Repost Automatically if Amazon Cancels Load</h4>
            ${renderInlineChoices('pat-power-repost', [
                { value: 'enabled', label: 'Enabled' },
                { value: 'disabled', label: 'Disabled' }
            ], 'enabled')}
        </div>
    `;
}

function setActiveOrderType(orderType) {
    const sectionsWereLocked = createOrderLocationSection?.classList.contains('is-locked');

    orderTypeCards.forEach((item) => {
        item.classList.toggle('is-selected', item.dataset.patOrderType === orderType);
    });

    if (orderTypeDetails) {
        orderTypeDetails.innerHTML = buildOrderTypeDetailsMarkup(orderType);
    }

    setCreateOrderSectionsLocked(false);
    updateCreateOrderSummaries();

    if (sectionsWereLocked && createOrderLocationSection) {
        setExpandedCreateSection(createOrderLocationSection);
    }
}

function populateCreateOrderLocationFilters() {
    const cityOptions = cities.map((city) => `${city.name}, ${city.state}`);
    const radiusOptions = ['', '25', '50', '100', '150', '250'];

    [
        createOrderOriginSelect,
        createOrderDestinationSelect,
        createOrderExcludedSelect
    ].forEach((selectElement) => {
        if (!selectElement) return;
        selectElement.innerHTML = '<option value=""></option>';
        cityOptions.forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
    });

    [
        createOrderOriginRadiusSelect,
        createOrderDestinationRadiusSelect
    ].forEach((selectElement) => {
        if (!selectElement) return;
        selectElement.innerHTML = '<option value=""></option>';
        radiusOptions.slice(1).forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
    });
}

function formatDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTimeInputValue(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function populateSelectWithValues(selectElement, values) {
    if (!selectElement) return;
    selectElement.innerHTML = '';
    values.forEach((item) => {
        const option = document.createElement('option');
        if (typeof item === 'string') {
            option.value = item;
            option.textContent = item;
        } else {
            option.value = item.value;
            option.textContent = item.label;
        }
        selectElement.appendChild(option);
    });
}

function syncScheduleRangeLabels() {
    if (!scheduleTripLengthSelect || !scheduleMinLabel || !scheduleMaxLabel) return;
    const tripLengthMode = scheduleTripLengthSelect.value;

    if (tripLengthMode === 'duration') {
        scheduleMinLabel.textContent = 'Min hrs*';
        scheduleMaxLabel.textContent = 'Max hrs*';
        if (scheduleMinRangeInput) scheduleMinRangeInput.placeholder = '0';
        if (scheduleMaxRangeInput) scheduleMaxRangeInput.placeholder = '0';
        return;
    }

    if (tripLengthMode === 'distance') {
        scheduleMinLabel.textContent = 'Min miles*';
        scheduleMaxLabel.textContent = 'Max miles*';
        if (scheduleMinRangeInput) scheduleMinRangeInput.placeholder = '0';
        if (scheduleMaxRangeInput) scheduleMaxRangeInput.placeholder = '0';
        return;
    }

    scheduleMinLabel.textContent = 'Min*';
    scheduleMaxLabel.textContent = 'Max*';
    if (scheduleMinRangeInput) scheduleMinRangeInput.placeholder = '';
    if (scheduleMaxRangeInput) scheduleMaxRangeInput.placeholder = '';
}

function populateCreateOrderScheduleDefaults() {
    const assignableDrivers = getAssignableDrivers();

    populateSelectWithValues(scheduleStartWindowSelect, [
        { value: '', label: '' },
        { value: '1-hr', label: '1 hr' },
        { value: '2-hr', label: '2 hr' },
        { value: '3-hr', label: '3 hr' },
        { value: '4-hr', label: '4 hr' }
    ]);

    populateSelectWithValues(scheduleStemTimeSelect, [
        { value: '', label: '' },
        { value: '30-min', label: '30 min' },
        { value: '1-hr', label: '1 hr' },
        { value: '1-30', label: '1 hr 30 min' },
        { value: '2-hr', label: '2 hr' },
        { value: '2-30', label: '2 hr 30 min' },
        { value: '3-hr', label: '3 hr' }
    ]);

    populateSelectWithValues(scheduleMaxStopsSelect, [
        { value: '', label: '' },
        { value: 'any', label: 'Any' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' }
    ]);

    populateSelectWithValues(scheduleDriversSelect, [
        { value: '', label: '' },
        ...assignableDrivers
    ]);

    [
        scheduleStartDateInput,
        scheduleStartTimeInput,
        scheduleEndDateInput,
        scheduleEndTimeInput,
        scheduleMinRangeInput,
        scheduleMaxRangeInput
    ].forEach((field) => {
        if (field) field.value = '';
    });

    [
        scheduleStartWindowSelect,
        scheduleStemTimeSelect,
        scheduleTripLengthSelect,
        scheduleMaxStopsSelect,
        scheduleDriversSelect
    ].forEach((field) => {
        if (field) field.value = '';
    });

    syncScheduleRangeLabels();
    syncScheduleDateTimeConstraints();
}

function clearScheduleFieldValidity() {
    [
        scheduleStartDateInput,
        scheduleStartTimeInput,
        scheduleEndDateInput,
        scheduleEndTimeInput
    ].forEach((field) => {
        if (field) {
            field.setCustomValidity('');
        }
    });
}

function syncScheduleDateTimeConstraints() {
    const now = roundUpToTimeSlot(new Date(), 15);
    const todayValue = formatDateInputValue(now);
    const nowTimeValue = formatTimeInputValue(now);
    const startDateValue = scheduleStartDateInput?.value || '';
    const startTimeValue = scheduleStartTimeInput?.value || '';
    const endDateValue = scheduleEndDateInput?.value || '';

    clearScheduleFieldValidity();

    if (scheduleStartDateInput) {
        scheduleStartDateInput.min = todayValue;
    }

    if (scheduleEndDateInput) {
        scheduleEndDateInput.min = startDateValue || todayValue;
    }

    if (scheduleStartTimeInput) {
        scheduleStartTimeInput.min = startDateValue === todayValue ? nowTimeValue : '';
    }

    if (scheduleEndTimeInput) {
        if (endDateValue) {
            if (startDateValue && endDateValue === startDateValue) {
                scheduleEndTimeInput.min = startTimeValue || (startDateValue === todayValue ? nowTimeValue : '');
            } else if (endDateValue === todayValue) {
                scheduleEndTimeInput.min = nowTimeValue;
            } else {
                scheduleEndTimeInput.min = '';
            }
        } else {
            scheduleEndTimeInput.min = '';
        }
    }

    const startIsInPast = startDateValue && startTimeValue
        && combineDateAndTime(startDateValue, startTimeValue, false)?.getTime() < now.getTime();
    const endDateTime = endDateValue && (scheduleEndTimeInput?.value || '')
        ? combineDateAndTime(endDateValue, scheduleEndTimeInput.value, false)
        : null;
    const startDateTime = startDateValue && startTimeValue
        ? combineDateAndTime(startDateValue, startTimeValue, false)
        : null;

    if (startIsInPast && scheduleStartTimeInput) {
        scheduleStartTimeInput.setCustomValidity('Choose a future start time.');
    }

    if (endDateTime && endDateTime.getTime() < now.getTime() && scheduleEndTimeInput) {
        scheduleEndTimeInput.setCustomValidity('Choose a future end time.');
    }

    if (startDateTime && endDateTime && endDateTime.getTime() < startDateTime.getTime() && scheduleEndTimeInput) {
        scheduleEndTimeInput.setCustomValidity('End time must be after start time.');
    }
}

function createEmptyFilterState() {
    return {
        origin: '',
        radius: '',
        equipment: '',
        sort: 'relevance',
        destination: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        workBlock: false,
        workHostler: false,
        workOneway: false,
        driverSolo: false,
        driverTeam: false,
        loadLive: false,
        loadDrop: false,
        price: '',
        payout: '',
        durationMin: '',
        durationMax: '',
        distanceMin: '',
        distanceMax: '',
        stops: '',
        excluded: ''
    };
}

function cloneFilterState(filters = {}) {
    return {
        ...createEmptyFilterState(),
        ...filters
    };
}

function createSearchState(filters = {}) {
    return {
        id: `amazon-search-${amazonSearchSeed++}`,
        filters: cloneFilterState(filters)
    };
}

function getNextSearchSeed(searches = []) {
    const maxSeed = searches.reduce((currentMax, search) => {
        const match = String(search?.id || '').match(/amazon-search-(\d+)/);
        const nextValue = match ? Number.parseInt(match[1], 10) : 0;
        return Number.isFinite(nextValue) ? Math.max(currentMax, nextValue) : currentMax;
    }, 0);

    return maxSeed + 1;
}

function getActiveSearch() {
    return amazonSearches.find((search) => search.id === activeSearchId) || null;
}

function getSearchLabel(search) {
    const { origin, destination } = search.filters;
    if (origin) return origin;
    if (destination) return destination;
    return 'New Search';
}

function getCurrentSortValue() {
    return getLoadSortOption(getActiveSearch()?.filters?.sort).value;
}

function toggleSortMenu(shouldOpen) {
    if (!sortTrigger || !sortMenu) return;
    sortTrigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    sortMenu.hidden = !shouldOpen;
}

function renderSortMenu() {
    if (!sortMenu) return;

    const activeOption = getLoadSortOption(getCurrentSortValue());
    sortMenu.innerHTML = `
        <div class="amazon-search-sort-heading">${activeOption.label}</div>
        ${LOAD_SORT_OPTIONS
            .filter((option) => option.value !== activeOption.value)
            .map((option) => `
                <button type="button" class="amazon-search-sort-option" data-sort-value="${option.value}">
                    ${option.label}
                </button>
            `)
            .join('')}
    `;
}

function updateSortUI() {
    const activeOption = getLoadSortOption(getCurrentSortValue());

    if (sortLabel) {
        sortLabel.textContent = activeOption.label;
    }

    if (recentTitle) {
        recentTitle.textContent = activeOption.recentTitle;
    }

    renderSortMenu();
}

function setActiveSort(sortValue, options = {}) {
    const { resetPage = true } = options;
    const activeSearch = getActiveSearch();
    if (!activeSearch) return;

    activeSearch.filters.sort = getLoadSortOption(sortValue).value;
    updateSortUI();
    toggleSortMenu(false);
    applyFilters({ resetPage });
}

function formatFooterElapsedTime(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return 'just now';
    }

    const totalSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (totalSeconds < 5) {
        return 'just now';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes <= 0) {
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}

function updateLoadboardFooterStatus() {
    if (footerLastUpdated) {
        footerLastUpdated.textContent = `Last updated ${formatFooterElapsedTime(loadboardLastRefreshedAt)}`;
        footerLastUpdated.hidden = loadboardAutoRefreshEnabled;
    }

    if (footerRefreshInterval) {
        footerRefreshInterval.hidden = !loadboardAutoRefreshEnabled;
    }

    if (!footerRefreshLabel) {
        return;
    }

    if (!loadboardAutoRefreshEnabled) {
        footerRefreshLabel.textContent = 'Turn on auto refresh';
        return;
    }

    const remainingSeconds = loadboardNextRefreshAt instanceof Date
        ? Math.max(0, Math.ceil((loadboardNextRefreshAt.getTime() - Date.now()) / 1000))
        : loadboardAutoRefreshSeconds;
    footerRefreshLabel.textContent = `Next Refresh ${remainingSeconds}s`;
}

function clearAutoRefreshTimer() {
    if (loadboardAutoRefreshTimer) {
        window.clearTimeout(loadboardAutoRefreshTimer);
        loadboardAutoRefreshTimer = null;
    }
}

function beginLoadboardRefreshVisual() {
    if (loadboardRefreshVisualTimer) {
        window.clearTimeout(loadboardRefreshVisualTimer);
        loadboardRefreshVisualTimer = null;
    }

    resultsPanel?.classList.remove('is-refresh-settling');
    footerRefreshButton?.classList.add('is-refreshing');
    if (resultsPanel) {
        resultsPanel.classList.remove('is-refreshing');
        void resultsPanel.offsetWidth;
        resultsPanel.classList.add('is-refreshing');
    }
}

function finishLoadboardRefreshVisual() {
    resultsPanel?.classList.remove('is-refreshing');
    resultsPanel?.classList.add('is-refresh-settling');
    footerRefreshButton?.classList.remove('is-refreshing');

    loadboardRefreshVisualTimer = window.setTimeout(() => {
        resultsPanel?.classList.remove('is-refresh-settling');
        loadboardRefreshVisualTimer = null;
    }, 520);
}

function refreshLoadboardResults(options = {}) {
    const { fromAuto = false } = options;
    beginLoadboardRefreshVisual();
    loadboardRefreshGeneration += 1;
    loadboardLastRefreshedAt = new Date();
    closeDetailPanel();
    relayAssistantDismissedKeys.clear();
    relayAssistantState = null;
    document.getElementById('relay-assistant-overlay')?.remove();
    document.body.classList.remove('relay-assistant-open');
    releaseRandomReservedLoads();

    if (activeLoadboardView === 'post-a-truck') {
        refreshPatOrderMatches();
        renderPatRecommendations();
        renderPatOrders();
    } else {
        applyFilters({ resetPage: false, updatePriceChanges: true });
    }

    if (loadboardAutoRefreshEnabled) {
        scheduleLoadboardAutoRefresh();
    } else if (!fromAuto) {
        updateLoadboardFooterStatus();
    }

    window.setTimeout(finishLoadboardRefreshVisual, 180);
}

function scheduleLoadboardAutoRefresh() {
    clearAutoRefreshTimer();

    if (!loadboardAutoRefreshEnabled) {
        loadboardNextRefreshAt = null;
        updateLoadboardFooterStatus();
        return;
    }

    loadboardNextRefreshAt = new Date(Date.now() + (loadboardAutoRefreshSeconds * 1000));
    loadboardAutoRefreshTimer = window.setTimeout(() => {
        refreshLoadboardResults({ fromAuto: true });
    }, loadboardAutoRefreshSeconds * 1000);
    updateLoadboardFooterStatus();
}

function setLoadboardAutoRefreshEnabled(shouldEnable) {
    loadboardAutoRefreshEnabled = Boolean(shouldEnable);
    if (footerAutoRefreshToggle) {
        footerAutoRefreshToggle.checked = loadboardAutoRefreshEnabled;
    }
    scheduleLoadboardAutoRefresh();
}

function clearLoadboardFilters() {
    resetActiveSearchToEmpty();
    clearActiveLoadSelection();
    applyFilters({ resetPage: true });
}

function getRelayAssistantCandidateLoad() {
    if (activeLoadboardView !== 'search') {
        return null;
    }

    if (activePanelLoad && isRelayAssistantEligibleLoad(activePanelLoad)) {
        return activePanelLoad;
    }

    return lastVisibleLoadboardLoads.find((load) => isRelayAssistantEligibleLoad(load)) || null;
}

function isRelayAssistantEligibleLoad(load) {
    if (!load || isBlockLoad(load) || isShuffleLoad(load)) {
        return false;
    }

    const loadKey = getLoadKey(load);
    if (bookedLoadKeys.has(loadKey) || relayAssistantDismissedKeys.has(loadKey)) {
        return false;
    }

    return true;
}

function updateRelayAssistantButtonState() {
    if (!footerChatButton) {
        return;
    }

    const candidate = getRelayAssistantCandidateLoad();
    const candidateKey = candidate ? getLoadKey(candidate) : '';
    const hasNegotiation = Boolean(candidate);
    footerChatButton.classList.toggle('has-negotiation', hasNegotiation);

    if (hasNegotiation && candidateKey !== relayAssistantLastCandidateKey) {
        footerChatButton.classList.remove('is-alerting');
        void footerChatButton.offsetWidth;
        footerChatButton.classList.add('is-alerting');
        if (relayAssistantAlertTimer) {
            window.clearTimeout(relayAssistantAlertTimer);
        }
        relayAssistantAlertTimer = window.setTimeout(() => {
            footerChatButton.classList.remove('is-alerting');
            relayAssistantAlertTimer = null;
        }, 3600);
    }

    if (!hasNegotiation) {
        footerChatButton.classList.remove('is-alerting');
        if (relayAssistantAlertTimer) {
            window.clearTimeout(relayAssistantAlertTimer);
            relayAssistantAlertTimer = null;
        }
    }

    relayAssistantLastCandidateKey = candidateKey;
}

function cloneRelayAssistantLoad(load) {
    const dateFields = [
        'pickupDateTime',
        'pickupDepartureDateTime',
        'deliveryDateTime',
        'deliveryDepartureDateTime',
        'originalPickupDateTime',
        'originalPickupDepartureDateTime',
        'originalDeliveryDateTime',
        'originalDeliveryDepartureDateTime',
        'pickupWindowStartDateTime',
        'pickupWindowEndDateTime',
        'blockRevealAt'
    ];
    const clone = {
        ...load,
        routeStops: cloneRouteStopData(load.routeStops),
        routeSegments: cloneRouteSegmentData(load.routeSegments),
        segmentEquipmentStatuses: cloneSegmentEquipmentStatuses(load.segmentEquipmentStatuses),
        hiddenRouteStops: cloneRouteStopData(load.hiddenRouteStops),
        hiddenRouteSegments: cloneRouteSegmentData(load.hiddenRouteSegments),
        originalRouteStops: cloneRouteStopData(load.originalRouteStops),
        pickupEditorOpen: false
    };

    dateFields.forEach((field) => {
        if (load[field] instanceof Date) {
            clone[field] = new Date(load[field].getTime());
        }
    });

    return clone;
}

function copyRelayAssistantLoadToSource(sourceLoad, assistantLoad) {
    if (!sourceLoad || !assistantLoad) {
        return;
    }

    const copyFields = [
        'pickupDateTime',
        'pickupDepartureDateTime',
        'deliveryDateTime',
        'deliveryDepartureDateTime',
        'originalPickupDateTime',
        'originalPickupDepartureDateTime',
        'originalDeliveryDateTime',
        'originalDeliveryDepartureDateTime',
        'pickupWindowStartDateTime',
        'pickupWindowEndDateTime',
        'pickupWindow',
        'deliveryWindow',
        'price',
        'pricePerMile',
        'priceValue',
        'pricePerMileValue',
        'duration',
        'durationTotalMinutes',
        'durationHours',
        'displayDeadhead'
    ];

    copyFields.forEach((field) => {
        const value = assistantLoad[field];
        sourceLoad[field] = value instanceof Date ? new Date(value.getTime()) : value;
    });

    sourceLoad.routeStops = cloneRouteStopData(assistantLoad.routeStops);
    sourceLoad.routeSegments = cloneRouteSegmentData(assistantLoad.routeSegments);
    sourceLoad.segmentEquipmentStatuses = cloneSegmentEquipmentStatuses(assistantLoad.segmentEquipmentStatuses);
    sourceLoad.originalRouteStops = cloneRouteStopData(assistantLoad.originalRouteStops);
    sourceLoad.pickupEditorOpen = false;
}

function getRelayAssistantSourceLoad(state) {
    if (!state?.load) {
        return null;
    }

    return amazonLoadKeyMap.get(state.sourceKey)
        || amazonLoads.find((load) => load.id === state.load.id)
        || null;
}

function setRelayAssistantLoadPrice(load, nextPriceValue) {
    if (!load || !Number.isFinite(nextPriceValue)) {
        return;
    }

    load.priceValue = Math.round(nextPriceValue * 100) / 100;
    load.pricePerMileValue = load.miles > 0 ? load.priceValue / load.miles : load.pricePerMileValue;
    load.price = formatMoney(load.priceValue);
    load.pricePerMile = load.pricePerMileValue > 0 ? `${formatMoney(load.pricePerMileValue)}/mi` : load.pricePerMile;
}

function getRelayAssistantOfferPercent(load, offerNumber) {
    const ranges = [
        [0.02, 0.03],
        [0.04, 0.05],
        [0.07, 0.08]
    ];
    const [minPercent, maxPercent] = ranges[Math.max(0, Math.min(offerNumber - 1, ranges.length - 1))];
    const seed = hashString(`${getLoadKey(load)}:relay-offer:${offerNumber}`);
    const spread = (seed % 1000) / 1000;
    return minPercent + ((maxPercent - minPercent) * spread);
}

function getRelayAssistantMessageTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function addRelayAssistantMessage(role, text) {
    if (!relayAssistantState) {
        return;
    }

    relayAssistantState.messages.push({
        role,
        text,
        time: getRelayAssistantMessageTime()
    });
}

function formatRelayAssistantMessage(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function buildRelayAssistantIntroMessage(load) {
    const pickupStop = load.routeStops?.[0];
    const deliveryStop = load.routeStops?.[load.routeStops.length - 1];
    const pickupLocation = pickupStop ? `${pickupStop.code} (${pickupStop.city})` : `${load.originCode} (${load.originCity})`;
    const dropLocation = deliveryStop ? `${deliveryStop.code} (${deliveryStop.city})` : `${load.destinationCode} (${load.destinationCity})`;

    return [
        'Hi, we have an urgent load matching your search. Do you have a truck available?',
        `Pickup location: ${pickupLocation}`,
        `Pickup time: ${formatDetailStopDateTime(load.pickupDateTime, load.originCity)}`,
        `Drop-off location: ${dropLocation}`,
        `Total distance: ${Math.round(load.miles)} miles`,
        'Please see the load details section for full information.'
    ].join('\n');
}

function createRelayAssistantState(load) {
    const sourceKey = getLoadKey(load);
    const assistantLoad = cloneRelayAssistantLoad(load);
    relayAssistantState = {
        sourceKey,
        load: assistantLoad,
        basePriceValue: assistantLoad.priceValue,
        requestedAmount: 0,
        offerCount: 0,
        stage: 'awaiting-amount',
        booked: false,
        noTrip: false,
        messages: []
    };
    addRelayAssistantMessage('assistant', buildRelayAssistantIntroMessage(assistantLoad));
}

function createRelayAssistantNoTripState() {
    relayAssistantState = {
        noTrip: true,
        booked: false,
        messages: []
    };
}

function openRelayAssistantModal() {
    const candidate = getRelayAssistantCandidateLoad();
    const stateStillRelevant = Boolean(relayAssistantState?.sourceKey)
        && lastVisibleLoadboardLoads.some((load) => getLoadKey(load) === relayAssistantState.sourceKey)
        && !relayAssistantDismissedKeys.has(relayAssistantState.sourceKey)
        && !bookedLoadKeys.has(relayAssistantState.sourceKey);

    if (!relayAssistantState || relayAssistantState.noTrip || !stateStillRelevant) {
        if (candidate) {
            createRelayAssistantState(candidate);
        } else {
            createRelayAssistantNoTripState();
        }
    }

    renderRelayAssistantModal();
}

function shouldConfirmRelayAssistantClose() {
    return Boolean(relayAssistantState?.sourceKey && !relayAssistantState.booked && !relayAssistantState.noTrip);
}

function requestRelayAssistantClose() {
    if (!shouldConfirmRelayAssistantClose()) {
        closeRelayAssistantModal({ dismiss: true });
        return;
    }

    relayAssistantCloseConfirmOpen = true;
    renderRelayAssistantModal();
}

function closeRelayAssistantModal(options = {}) {
    const { dismiss = true, preserveState = false } = options;
    const overlay = document.getElementById('relay-assistant-overlay');
    overlay?.remove();
    document.body.classList.remove('relay-assistant-open');
    relayAssistantCloseConfirmOpen = false;

    if (dismiss && relayAssistantState?.sourceKey && !relayAssistantState.booked) {
        relayAssistantDismissedKeys.add(relayAssistantState.sourceKey);
    }

    if (!preserveState) {
        relayAssistantState = null;
    }

    updateRelayAssistantButtonState();
}

function buildRelayAssistantNoTripMarkup() {
    return `
        <div class="relay-assistant-no-trip-shell">
            <div class="relay-assistant-no-trip">
                <div class="relay-assistant-warning-icon" aria-hidden="true">!</div>
                <h3>No trip available</h3>
                <p>There are no trips available for support based on your current search. Please modify the search to continue using Relay Assistant.</p>
            </div>
            <div class="relay-assistant-powered">
                This chat is powered by Amazon Bedrock. Please verify details next to the Book button before proceeding
            </div>
            <form class="relay-assistant-input-row">
                <input type="text" placeholder="Type your message here" disabled>
                <button type="button" aria-label="Send message" disabled>
                    <span aria-hidden="true">&#10148;</span>
                </button>
            </form>
        </div>
    `;
}

function buildRelayAssistantMessagesMarkup() {
    const messages = relayAssistantState?.messages || [];
    return messages.map((message) => `
        <div class="relay-assistant-message-row is-${message.role}">
            ${message.role === 'assistant' ? '<div class="relay-assistant-avatar" aria-hidden="true"></div>' : ''}
            <div class="relay-assistant-message-wrap">
                <div class="relay-assistant-message-meta">
                    <span>${message.role === 'assistant' ? 'Relay Assistant' : 'You'}</span>
                    <span>${message.time}</span>
                </div>
                <div class="relay-assistant-message-bubble">${formatRelayAssistantMessage(message.text)}</div>
            </div>
            ${message.role === 'user' ? '<div class="relay-assistant-user-avatar" aria-hidden="true"></div>' : ''}
        </div>
    `).join('');
}

function buildRelayAssistantCloseConfirmMarkup() {
    return `
        <div class="relay-assistant-close-confirm" role="alertdialog" aria-modal="true" aria-label="Leave negotiation">
            <div class="relay-assistant-close-confirm-card">
                <strong>Leave this negotiation?</strong>
                <p>If you leave now, this load negotiation will be dismissed and you can move to the next available load.</p>
                <div class="relay-assistant-close-confirm-actions">
                    <button type="button" class="btn btn-ghost" data-relay-assistant-stay>Back to negotiation</button>
                    <button type="button" class="btn btn-primary" data-relay-assistant-confirm-close>Leave negotiation</button>
                </div>
            </div>
        </div>
    `;
}

function renderRelayAssistantModal() {
    let overlay = document.getElementById('relay-assistant-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'relay-assistant-overlay';
        overlay.className = 'relay-assistant-overlay';
        document.body.appendChild(overlay);
    }

    const isNoTrip = Boolean(relayAssistantState?.noTrip);
    overlay.innerHTML = `
        <section class="relay-assistant-modal${isNoTrip ? ' is-no-trip' : ''}" role="dialog" aria-modal="true" aria-label="Relay Assistant">
            <header class="relay-assistant-header">
                <strong>Relay Assistant | Load Board</strong>
                <div class="relay-assistant-header-actions">
                    <button type="button" class="relay-assistant-title-button" data-relay-assistant-minimize aria-label="Minimize Relay Assistant">&minus;</button>
                    <button type="button" class="relay-assistant-title-button" data-relay-assistant-close aria-label="Close Relay Assistant">&times;</button>
                </div>
            </header>
            ${isNoTrip ? buildRelayAssistantNoTripMarkup() : `
                <div class="relay-assistant-body">
                    <div class="relay-assistant-chat-pane">
                        <div class="relay-assistant-messages" data-relay-assistant-messages>
                            ${buildRelayAssistantMessagesMarkup()}
                        </div>
                        <div class="relay-assistant-powered">
                            This chat is powered by Amazon Bedrock. Please verify details next to the Book button before proceeding
                        </div>
                        <form class="relay-assistant-input-row" data-relay-assistant-form>
                            <input type="text" data-relay-assistant-input placeholder="Type your message here" autocomplete="off">
                            <button type="submit" aria-label="Send message">
                                <span aria-hidden="true">&#10148;</span>
                            </button>
                        </form>
                    </div>
                    <aside class="relay-assistant-book-pane" data-relay-assistant-load-panel></aside>
                </div>
            `}
            ${relayAssistantCloseConfirmOpen ? buildRelayAssistantCloseConfirmMarkup() : ''}
        </section>
    `;

    document.body.classList.add('relay-assistant-open');

    overlay.querySelector('[data-relay-assistant-close]')?.addEventListener('click', () => {
        requestRelayAssistantClose();
    });

    overlay.querySelector('[data-relay-assistant-minimize]')?.addEventListener('click', () => {
        relayAssistantCloseConfirmOpen = false;
        closeRelayAssistantModal({ dismiss: false, preserveState: true });
    });

    overlay.querySelector('[data-relay-assistant-stay]')?.addEventListener('click', () => {
        relayAssistantCloseConfirmOpen = false;
        renderRelayAssistantModal();
    });

    overlay.querySelector('[data-relay-assistant-confirm-close]')?.addEventListener('click', () => {
        closeRelayAssistantModal({ dismiss: true });
    });

    if (!isNoTrip && !relayAssistantCloseConfirmOpen) {
        const form = overlay.querySelector('[data-relay-assistant-form]');
        form?.addEventListener('submit', handleRelayAssistantMessageSubmit);
        renderRelayAssistantLoadPanel();
        const messages = overlay.querySelector('[data-relay-assistant-messages]');
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
        overlay.querySelector('[data-relay-assistant-input]')?.focus();
    } else if (relayAssistantCloseConfirmOpen) {
        overlay.querySelector('[data-relay-assistant-stay]')?.focus();
    }
}

function renderRelayAssistantLoadPanel() {
    const panel = document.querySelector('[data-relay-assistant-load-panel]');
    const load = relayAssistantState?.load;
    if (!panel || !load) {
        return;
    }

    panel.innerHTML = `<div class="amazon-detail-panel active relay-assistant-detail-panel">${buildDetailPanelMarkup(load)}</div>`;
    const detailRoot = panel.querySelector('.relay-assistant-detail-panel');
    if (!detailRoot) {
        return;
    }

    detailRoot.querySelectorAll('[data-detail-stop-card]').forEach((card) => {
        setDetailStopCardOpen(card, true);
    });
    syncDetailCollapseAll(detailRoot);

    detailRoot.querySelector('.detail-close')?.addEventListener('click', () => {
        requestRelayAssistantClose();
    });

    detailRoot.querySelector('.detail-book-button')?.addEventListener('click', () => {
        bookRelayAssistantLoad();
    });

    detailRoot.querySelectorAll('[data-detail-stop-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('[data-detail-stop-card]');
            if (!card) return;
            setDetailStopCardOpen(card, !card.classList.contains('is-open'));
            syncDetailCollapseAll(detailRoot);
        });
    });

    detailRoot.querySelectorAll('[data-detail-instruction-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const body = button.parentElement?.querySelector('[data-detail-instruction-body]');
            const caret = button.querySelector('.detail-instruction-caret');
            const shouldOpen = Boolean(body?.hidden);

            if (body) {
                body.hidden = !shouldOpen;
            }
            if (caret) {
                caret.innerHTML = shouldOpen ? '&#8964;' : '&#8250;';
            }
            button.classList.toggle('is-open', shouldOpen);
        });
    });

    detailRoot.querySelectorAll('[data-detail-edit-arrival]').forEach((button) => {
        button.addEventListener('click', () => {
            if (!load.isPickupAdjustable) return;
            load.pickupEditorOpen = !load.pickupEditorOpen;
            renderRelayAssistantLoadPanel();
        });
    });

    detailRoot.querySelectorAll('[data-detail-arrival-editor]').forEach((editor) => {
        const dateInput = editor.querySelector('[data-detail-arrival-date]');
        const timeSelect = editor.querySelector('[data-detail-arrival-time]');

        if (!dateInput || !timeSelect || !load.isPickupAdjustable) return;

        const syncTimeOptions = () => {
            const selectedTime = timeSelect.dataset.selectedTime || timeSelect.value || formatTimeInputValue(load.pickupDateTime);
            const nextTime = populateArrivalTimeSelect(
                timeSelect,
                dateInput.value,
                selectedTime,
                load.pickupWindowStartDateTime,
                load.pickupWindowEndDateTime
            );
            timeSelect.dataset.selectedTime = nextTime;
            return nextTime;
        };

        const commitArrivalChange = () => {
            const parsedDate = parseDateAndTimeInputValue(dateInput.value, timeSelect.value);
            if (!parsedDate) return;

            if (applyPickupAdjustment(load, parsedDate)) {
                renderRelayAssistantLoadPanel();
            }
        };

        syncTimeOptions();

        dateInput.addEventListener('change', () => {
            const nextTime = syncTimeOptions();
            if (!nextTime) return;
            commitArrivalChange();
        });

        timeSelect.addEventListener('change', () => {
            timeSelect.dataset.selectedTime = timeSelect.value;
            commitArrivalChange();
        });
    });

    detailRoot.querySelector('[data-detail-collapse-all]')?.addEventListener('click', () => {
        const cards = Array.from(detailRoot.querySelectorAll('[data-detail-stop-card]'));
        const hasOpenCard = cards.some((card) => card.classList.contains('is-open'));
        cards.forEach((card) => setDetailStopCardOpen(card, !hasOpenCard));
        syncDetailCollapseAll(detailRoot);
    });
}

function handleRelayAssistantMessageSubmit(event) {
    event.preventDefault();
    const input = event.currentTarget.querySelector('[data-relay-assistant-input]');
    const message = input?.value.trim() || '';
    if (!message || !relayAssistantState?.load) {
        return;
    }

    input.value = '';
    addRelayAssistantMessage('user', message);
    respondToRelayAssistantMessage(message);
    renderRelayAssistantModal();
}

function respondToRelayAssistantMessage(message) {
    const state = relayAssistantState;
    if (!state?.load) {
        return;
    }

    const requestedAmount = parseNumber(message);
    if (requestedAmount > 0) {
        if (requestedAmount <= state.basePriceValue) {
            addRelayAssistantMessage('assistant', `The posted payout is ${formatMoney(state.basePriceValue)}. Please book this load at the posted rate from the Book button.`);
            return;
        }

        state.requestedAmount = requestedAmount;
        const maxAcceptableRequest = state.basePriceValue * (1 + getRelayAssistantOfferPercent(state.load, 3));
        if (requestedAmount <= maxAcceptableRequest) {
            setRelayAssistantLoadPrice(state.load, requestedAmount);
            state.stage = 'accepted-rate';
            addRelayAssistantMessage('assistant', `We can do your requested rate of ${state.load.price} USD. Please book it from the Book button.`);
            return;
        }

        if (state.offerCount === 0 && state.stage === 'awaiting-amount') {
            state.stage = 'awaiting-justification';
            addRelayAssistantMessage('assistant', `Thank you for your interest in this shipment. Could you please provide some justification for requesting ${formatMoney(requestedAmount)}? The current payout for this shipment is ${formatMoney(state.basePriceValue)} USD. Understanding your reasoning will help us better evaluate your request.`);
            return;
        }

        offerRelayAssistantRate();
        return;
    }

    if (state.stage === 'awaiting-justification') {
        offerRelayAssistantRate(message);
        return;
    }

    if (state.offerCount >= 3) {
        addRelayAssistantMessage('assistant', `The best rate we can provide at this moment is ${formatMoney(state.load.priceValue)} USD. Please review the load details and book it if this works for your truck.`);
        return;
    }

    addRelayAssistantMessage('assistant', 'Please send the total payout amount you would like us to review for this load.');
}

function offerRelayAssistantRate() {
    const state = relayAssistantState;
    if (!state?.load) {
        return;
    }

    if (state.offerCount >= 3) {
        addRelayAssistantMessage('assistant', `The best rate we can provide at this moment is ${formatMoney(state.load.priceValue)} USD. Please review the load details and book it if this works for your truck.`);
        return;
    }

    state.offerCount += 1;
    state.stage = 'awaiting-counter';
    const offerPercent = getRelayAssistantOfferPercent(state.load, state.offerCount);
    const nextPriceValue = state.basePriceValue * (1 + offerPercent);
    setRelayAssistantLoadPrice(state.load, nextPriceValue);

    const message = state.offerCount === 1
        ? `I understand your concerns. We've reviewed your request and can offer a revised payout of ${state.load.price} USD for this load. Does that work for you?`
        : `I appreciate you working with us on this. While we can't reach ${formatMoney(state.requestedAmount || 0)}, we reviewed the costs and can offer ${state.load.price} USD as our ${state.offerCount === 3 ? 'best rate' : 'revised rate'} for this shipment. Does this work for you?`;
    addRelayAssistantMessage('assistant', message);
}

function bookRelayAssistantLoad() {
    const state = relayAssistantState;
    if (!state?.load) {
        return;
    }

    const sourceLoad = getRelayAssistantSourceLoad(state);
    const bookingLoad = sourceLoad || state.load;

    if (sourceLoad) {
        copyRelayAssistantLoadToSource(sourceLoad, state.load);
    }

    const didSaveTrip = saveBookedTrip(bookingLoad);
    if (!didSaveTrip) {
        return;
    }

    state.booked = true;
    bookedLoadKeys.add(state.sourceKey);
    bookedLoadKeys.add(getLoadKey(bookingLoad));
    loadboardPriceChangeMap.delete(state.sourceKey);
    pendingLoadboardPriceChangeMap.delete(state.sourceKey);
    relayAssistantDismissedKeys.delete(state.sourceKey);
    refreshPatOrderMatches();
    renderPatRecommendations();
    renderPatOrders();
    closeRelayAssistantModal({ dismiss: false });
    applyFilters({ resetPage: false });
}

function initializeLoadboardFooterControls() {
    updateLoadboardFooterStatus();
    if (!loadboardFooterTicker) {
        loadboardFooterTicker = window.setInterval(updateLoadboardFooterStatus, 1000);
    }
}

function saveLoadboardSessionState() {
    try {
        const searches = amazonSearches.map((search) => ({
            id: search.id,
            filters: cloneFilterState(search.filters)
        }));
        const nextActiveSearchId = searches.some((search) => search.id === activeSearchId)
            ? activeSearchId
            : (searches[0]?.id || null);
        const nextSeed = Math.max(amazonSearchSeed, getNextSearchSeed(searches));

        sessionStorage.setItem(LOADBOARD_STATE_STORAGE_KEY, JSON.stringify({
            version: LOADBOARD_STATE_VERSION,
            amazonCurrentPage,
            amazonSearchSeed: nextSeed,
            amazonSearches: searches,
            activeSearchId: nextActiveSearchId,
            activeLoadboardView
        }));
    } catch (error) {
        console.warn('Unable to save load board state.', error);
    }
}

function restoreLoadboardSessionState() {
    try {
        const raw = sessionStorage.getItem(LOADBOARD_STATE_STORAGE_KEY);
        if (!raw) {
            return false;
        }

        const parsed = JSON.parse(raw);
        if (parsed?.version !== LOADBOARD_STATE_VERSION) {
            sessionStorage.removeItem(LOADBOARD_STATE_STORAGE_KEY);
            return false;
        }
        if (!Array.isArray(parsed?.amazonSearches) || !parsed.amazonSearches.length) {
            return false;
        }

        amazonSearches = parsed.amazonSearches.map((search) => ({
            id: search.id,
            filters: cloneFilterState(search.filters)
        }));
        amazonCurrentPage = Number.isFinite(parsed.amazonCurrentPage) && parsed.amazonCurrentPage > 0
            ? parsed.amazonCurrentPage
            : 1;
        activeSearchId = amazonSearches.some((search) => search.id === parsed.activeSearchId)
            ? parsed.activeSearchId
            : amazonSearches[0].id;
        activeLoadboardView = typeof parsed.activeLoadboardView === 'string' && parsed.activeLoadboardView
            ? parsed.activeLoadboardView
            : 'search';
        amazonSearchSeed = Math.max(
            Number.isFinite(parsed.amazonSearchSeed) ? parsed.amazonSearchSeed : 1,
            getNextSearchSeed(amazonSearches)
        );

        return true;
    } catch (error) {
        console.warn('Unable to restore load board state.', error);
        return false;
    }
}

function syncBookedLoadKeys() {
    bookedLoadKeys.clear();

    loadBookedTrips().forEach((trip) => {
        if (trip?.loadKey) {
            bookedLoadKeys.add(trip.loadKey);
        }
    });
}

resetBookedTripsOnReload();
syncBookedLoadKeys();

function getLoadKey(load) {
    return [load.id, load.originCode, load.destinationCode, load.pickupWindow].join('|');
}

function buildPatRecommendationRecord(load) {
    const range = getPatRecommendationDurationBounds(load);
    const payoutFloor = getPatRecommendationPayoutFloor(load);
    const rateFloor = getPatRecommendationPriceFloor(load);
    const stemValue = getPatRecommendationStemValue(load.displayDeadhead);

    return {
        key: getLoadKey(load),
        loadId: load.id,
        orderType: 'power-only',
        origin: load.originCity.toUpperCase(),
        destination: load.destinationCity.toUpperCase(),
        originCity: load.originCity,
        destinationCity: load.destinationCity,
        originRadius: roundPatRecommendationRadius(load.displayDeadhead),
        destinationRadius: '100',
        startDate: formatDateInputValue(load.pickupDateTime),
        startTime: formatTimeInputValue(load.pickupDateTime),
        endDate: formatDateInputValue(load.deliveryDateTime),
        endTime: formatTimeInputValue(load.deliveryDateTime),
        startWindowValue: '1-hr',
        stemValue,
        tripLengthMode: 'duration',
        minRangeValue: range.min,
        maxRangeValue: range.max,
        maxStopsValue: load.stops,
        maxStopsRaw: String(load.stops),
        scheduleDriverValue: '',
        minPricePerMileValue: rateFloor.toFixed(2),
        minPayoutValue: String(payoutFloor),
        excludedCity: '',
        workType: load.workType,
        loadMode: load.loadType === 'Drop and hook' ? 'Drop & Hook' : 'Live or Drop & Hook',
        equipment: "53' Trailer",
        driverType: load.driverType,
        specialService: '',
        repostValue: 'Enabled',
        startStamp: formatPatRecommendationStamp(load.pickupDateTime),
        endStamp: formatPatRecommendationStamp(load.deliveryDateTime),
        scheduleLine: [
            `Stem: ${getSelectLabelFromValue(scheduleStemTimeSelect, stemValue)}`,
            'Start window: 1 hr'
        ].join('   '),
        orderLine: joinCreateOrderPartsSafe([
            load.workType,
            "53' Trailer Provided",
            `${range.min}-${range.max} Hours`,
            load.driverType
        ]),
        payoutText: formatMoney(payoutFloor),
        rateText: `${formatMoney(rateFloor)}/mi`
    };
}

function getPatRecommendationRecords(limit = Infinity) {
    const reservedKeys = getPatReservedLoadKeys('');
    const recommendations = [];

    for (let index = 0; index < amazonLoadsByPickupTime.length; index += 1) {
        const load = amazonLoadsByPickupTime[index];
        const loadKey = getLoadKey(load);
        if (bookedLoadKeys.has(loadKey) || reservedKeys.has(loadKey)) {
            continue;
        }
        if (load.equipment !== "53' Trailer" || load.workType !== 'One-Way/Round Trip') {
            continue;
        }

        recommendations.push(buildPatRecommendationRecord(load));
        if (recommendations.length >= limit) {
            break;
        }
    }

    return recommendations;
}

function renderPatRecommendations() {
    if (!patRecommendationsList) {
        return;
    }

    const recommendationLimit = patRecommendationsExpanded ? 8 : 4;
    const recommendations = getPatRecommendationRecords(recommendationLimit);
    const visibleRecommendations = patRecommendationsExpanded ? recommendations.slice(0, 8) : recommendations.slice(0, 3);

    patRecommendationCache.clear();
    visibleRecommendations.forEach((recommendation) => {
        patRecommendationCache.set(recommendation.key, recommendation);
    });

    if (!visibleRecommendations.length) {
        patRecommendationsList.innerHTML = '<div class="amazon-empty-state">No recommendation is available from the current board right now.</div>';
    } else {
        patRecommendationsList.innerHTML = visibleRecommendations.map((recommendation) => `
            <div class="pat-order-row">
                <div class="pat-route-block">
                    <div class="pat-location">
                        <strong>${recommendation.origin} <span>(${recommendation.originRadius} mi)</span></strong>
                        <span>${recommendation.startStamp}</span>
                    </div>
                    <div class="pat-route-arrow">&mdash;</div>
                    <div class="pat-location">
                        <strong>${recommendation.destination} <span>(${recommendation.destinationRadius} mi)</span></strong>
                        <span>${recommendation.endStamp}</span>
                    </div>
                </div>
                <div class="pat-order-meta">${recommendation.orderLine}</div>
                <button class="btn btn-ghost" type="button" data-pat-recommendation-create="${recommendation.key}">Create Order</button>
            </div>
        `).join('');
    }

    if (patRecommendationsToggle) {
        const canExpand = recommendations.length > 3;
        patRecommendationsToggle.hidden = !canExpand;
        if (canExpand) {
            patRecommendationsToggle.innerHTML = patRecommendationsExpanded
                ? 'Show fewer recommended orders <span>&#9652;</span>'
                : 'View all recommended orders <span>&#9662;</span>';
        }
    }
}

function getMasterLoadRecord(load) {
    if (!load) return null;
    const loadKey = getLoadKey(load);
    return amazonLoadKeyMap.get(loadKey) || null;
}

function applyPickupAdjustment(masterLoad, nextPickupDateTime) {
    if (!masterLoad?.isPickupAdjustable || !(nextPickupDateTime instanceof Date) || Number.isNaN(nextPickupDateTime.getTime())) {
        return false;
    }

    const minDate = masterLoad.pickupWindowStartDateTime instanceof Date
        ? masterLoad.pickupWindowStartDateTime
        : masterLoad.originalPickupDateTime;
    const maxDate = masterLoad.pickupWindowEndDateTime instanceof Date
        ? masterLoad.pickupWindowEndDateTime
        : masterLoad.originalPickupDateTime;

    if (!(minDate instanceof Date) || !(maxDate instanceof Date)) {
        return false;
    }

    const clampedTime = Math.min(maxDate.getTime(), Math.max(minDate.getTime(), nextPickupDateTime.getTime()));
    const adjustedPickupDateTime = new Date(clampedTime);
    const deltaMinutes = Math.round((adjustedPickupDateTime.getTime() - masterLoad.originalPickupDateTime.getTime()) / 60000);

    if (!Array.isArray(masterLoad.originalRouteStops) || !masterLoad.originalRouteStops.length) {
        masterLoad.originalRouteStops = cloneRouteStopData(masterLoad.routeStops);
    }

    masterLoad.pickupDateTime = adjustedPickupDateTime;
    masterLoad.pickupDepartureDateTime = addMinutes(masterLoad.originalPickupDepartureDateTime, deltaMinutes);
    masterLoad.deliveryDateTime = addMinutes(masterLoad.originalDeliveryDateTime, deltaMinutes);
    masterLoad.deliveryDepartureDateTime = addMinutes(masterLoad.originalDeliveryDepartureDateTime, deltaMinutes);
    if (Array.isArray(masterLoad.originalRouteStops) && masterLoad.originalRouteStops.length) {
        masterLoad.routeStops = cloneRouteStopData(masterLoad.originalRouteStops).map((stop) => ({
            ...stop,
            arrival: addMinutes(stop.arrival, deltaMinutes),
            departure: addMinutes(stop.departure, deltaMinutes)
        }));
    }
    masterLoad.pickupWindow = formatDateTimeLabel(masterLoad.pickupDateTime);
    masterLoad.deliveryWindow = formatDateTimeLabel(masterLoad.deliveryDateTime);
    masterLoad.pickupEditorOpen = false;
    return true;
}

function populateArrivalTimeSelect(selectElement, dateValue, selectedTimeValue, minDate, maxDate) {
    if (!selectElement) return '';

    const previousValue = selectedTimeValue || selectElement.value || '';
    const availableValues = [];

    selectElement.innerHTML = HALF_HOUR_TIME_OPTIONS.map((timeValue) => {
        const combinedDate = parseDateAndTimeInputValue(dateValue, timeValue);
        const isAllowed = combinedDate
            && combinedDate.getTime() >= minDate.getTime()
            && combinedDate.getTime() <= maxDate.getTime();

        if (isAllowed) {
            availableValues.push(timeValue);
        }

        return `<option value="${timeValue}"${isAllowed ? '' : ' disabled'}>${timeValue}</option>`;
    }).join('');

    const nextValue = availableValues.includes(previousValue)
        ? previousValue
        : (availableValues[0] || '');

    selectElement.value = nextValue;
    return nextValue;
}

function buildBookedTripRecord(load, options = {}) {
    return {
        loadKey: getLoadKey(load),
        loadId: load.id,
        status: 'upcoming',
        bookedAt: new Date().toISOString(),
        deadhead: load.displayDeadhead,
        originCode: load.originCode,
        destinationCode: load.destinationCode,
        originCity: load.originCity,
        destinationCity: load.destinationCity,
        pickupDateTimeIso: load.pickupDateTime instanceof Date ? load.pickupDateTime.toISOString() : null,
        pickupDepartureDateTimeIso: load.pickupDepartureDateTime instanceof Date ? load.pickupDepartureDateTime.toISOString() : null,
        deliveryDateTimeIso: load.deliveryDateTime instanceof Date ? load.deliveryDateTime.toISOString() : null,
        deliveryDepartureDateTimeIso: load.deliveryDepartureDateTime instanceof Date ? load.deliveryDepartureDateTime.toISOString() : null,
        pickupWindow: load.pickupWindow,
        deliveryWindow: load.deliveryWindow,
        miles: load.miles,
        duration: load.duration,
        equipment: load.equipment,
        loadType: load.loadType,
        driverType: load.driverType,
        workType: load.workType,
        program: load.program || load.boardProgram || 'Load Board',
        source: options.source || load.source || 'loadboard',
        tripSource: options.tripSource || load.tripSource || 'loadboard',
        isBlockLoad: Boolean(load.isBlockLoad),
        isShuffleLoad: Boolean(load.isShuffleLoad),
        isRoundTrip: Boolean(load.isRoundTrip),
        blockRevealAtIso: load.blockRevealAt instanceof Date ? load.blockRevealAt.toISOString() : null,
        stops: load.stops,
        routeStops: Array.isArray(load.routeStops) ? load.routeStops.map((stop) => ({
            number: stop.number,
            code: stop.code,
            city: stop.city,
            market: stop.market,
            role: stop.role,
            address: stop.address ? { ...stop.address } : null,
            arrivalIso: stop.arrival instanceof Date ? stop.arrival.toISOString() : null,
            departureIso: stop.departure instanceof Date ? stop.departure.toISOString() : null
        })) : [],
        routeSegments: Array.isArray(load.routeSegments) ? load.routeSegments.map((segment) => ({
            index: segment.index,
            fromNumber: segment.fromNumber,
            toNumber: segment.toNumber,
            fromCode: segment.fromCode,
            toCode: segment.toCode,
            miles: segment.miles,
            durationMinutes: segment.durationMinutes
        })) : [],
        segmentEquipmentStatuses: Array.isArray(load.segmentEquipmentStatuses) ? load.segmentEquipmentStatuses.map((status) => ({
            state: normalizeEquipmentStatusState(status.state),
            kind: status.kind === 'container' ? 'container' : 'trailer'
        })) : [],
        hiddenRouteStops: Array.isArray(load.hiddenRouteStops) ? load.hiddenRouteStops.map((stop) => ({
            number: stop.number,
            code: stop.code,
            city: stop.city,
            market: stop.market,
            role: stop.role,
            address: stop.address ? { ...stop.address } : null,
            arrivalIso: stop.arrival instanceof Date ? stop.arrival.toISOString() : null,
            departureIso: stop.departure instanceof Date ? stop.departure.toISOString() : null
        })) : [],
        hiddenRouteSegments: Array.isArray(load.hiddenRouteSegments) ? load.hiddenRouteSegments.map((segment) => ({
            index: segment.index,
            fromNumber: segment.fromNumber,
            toNumber: segment.toNumber,
            fromCode: segment.fromCode,
            toCode: segment.toCode,
            miles: segment.miles,
            durationMinutes: segment.durationMinutes
        })) : [],
        price: load.price,
        pricePerMile: load.pricePerMile,
        priceValue: load.priceValue,
        pricePerMileValue: load.pricePerMileValue,
        patOrderId: options.patOrderId || ''
    };
}

function loadBookedTrips() {
    try {
        return JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || '[]');
    } catch (error) {
        console.warn('Unable to read booked trip demo state.', error);
        return [];
    }
}

function saveBookedTrip(load, options = {}) {
    try {
        const existingTrips = loadBookedTrips();
        const nextTrips = existingTrips.filter((trip) => trip.loadKey !== getLoadKey(load));
        nextTrips.unshift(buildBookedTripRecord(load, options));
        sessionStorage.setItem(BOOKED_TRIPS_STORAGE_KEY, JSON.stringify(nextTrips));
        return true;
    } catch (error) {
        console.warn('Unable to save booked trip demo state.', error);
        return false;
    }
}

function getPrimaryLoadTypeLabel(load) {
    if (isBlockLoad(load)) {
        return 'Block';
    }

    if (isShuffleLoad(load)) {
        return 'Shuffle';
    }

    if (isContainerLoad(load) || load.loadType === 'Drop and hook') {
        return 'Drop';
    }

    return load.loadType || 'Drop';
}

function getSecondaryLoadTypeLabel(load) {
    if (isBlockLoad(load)) {
        return '';
    }

    if (isShuffleLoad(load)) {
        return '';
    }

    return isContainerLoad(load) ? getIntermodalFacilityLabel(load) : (load.workType || '');
}

function buildLoadDetailStops(load) {
    const seed = hashString(getLoadKey(load));
    const routeStops = Array.isArray(load.routeStops) && load.routeStops.length
        ? load.routeStops
        : [{
            number: 1,
            code: load.originCode,
            city: load.originCity,
            address: buildDetailFacilityAddress(load.originCode, load.originCity, seed),
            arrival: load.pickupDateTime,
            departure: load.pickupDepartureDateTime,
            role: 'pickup'
        }, {
            number: 2,
            code: load.destinationCode,
            city: load.destinationCity,
            address: buildDetailFacilityAddress(load.destinationCode, load.destinationCity, seed + 13),
            arrival: load.deliveryDateTime,
            departure: load.deliveryDepartureDateTime,
            role: 'delivery'
        }];
    const stops = routeStops.map((stop, stopIndex) => {
        const isFirstStop = stopIndex === 0;
        const isLastStop = stopIndex === routeStops.length - 1;
        const equipmentStatus = getStopEquipmentStatus(load, stopIndex, routeStops.length);
        const instructionLabel = isFirstStop
            ? 'Pick-up instructions'
            : (isLastStop ? 'Drop-off instructions' : 'Stop instructions');
        const instructionText = isFirstStop
            ? 'Check in with the guard shack, confirm the trailer assignment, and stage at the preload door listed by dispatch.'
            : (isLastStop
                ? (isContainerLoad(load)
                    ? 'Check in at the intermodal lane, close out the chassis move with the facility clerk, and drop in the designated UIIA area before departing.'
                    : 'Check in at the delivery office, confirm unload door assignment, and capture departure paperwork before leaving the site.')
                : 'Confirm the relay handoff instructions, swap paperwork if required, and move to the next scheduled leg once dispatch clears the transfer.');

        return {
            key: `stop-${stop.number}`,
            number: stop.number,
            code: stop.code,
            city: stop.city,
            address: stop.address,
            arrival: stop.arrival,
            departure: stop.departure,
            arrivalLabel: formatDetailStopDateTime(stop.arrival, stop.city),
            departureLabel: formatDetailStopDateTime(stop.departure, stop.city),
            windowLabel: isFirstStop && load.isPickupAdjustable
                ? formatDetailWindowRange(load.pickupWindowStartDateTime, load.pickupWindowEndDateTime, stop.city)
                : '',
            equipmentStatus,
            equipmentNote: isLastStop ? getPrimaryLoadTypeLabel(load) : 'Preloaded',
            equipmentSubLabel: isLastStop
                ? getSecondaryLoadTypeLabel(load)
                : (isFirstStop ? '' : 'Relay transfer'),
            instructionLabel,
            instructionText,
            showBookingWarning: isFirstStop && Boolean(load.isPickupAdjustable),
            canEditArrival: isFirstStop && Boolean(load.isPickupAdjustable),
            isPickup: isFirstStop
        };
    });
    const segments = Array.isArray(load.routeSegments) && load.routeSegments.length
        ? load.routeSegments.map((segment) => ({
            miles: segment.miles,
            durationMinutes: segment.durationMinutes,
            fromNumber: segment.fromNumber,
            toNumber: segment.toNumber
        }))
        : [{
            miles: Math.max(1, Math.round(Number(load.miles) || 0)),
            durationMinutes: Math.max(120, Number(load.durationTotalMinutes) || 120),
            fromNumber: 1,
            toNumber: 2
        }];

    return {
        seed,
        stops,
        segments
    };
}

function buildDetailMapPreview(load, stops) {
    const stopMarkers = stops.map((stop, index) => {
        const left = stops.length === 1
            ? 50
            : 12 + ((index * 76) / (stops.length - 1));
        const top = 28 + (((index * 37) + (index % 2 === 0 ? 16 : 0)) % 72);

        return `
            <div
                class="detail-map-point${index === 0 ? ' is-origin' : ''}${index === stops.length - 1 ? ' is-destination' : ''}${index > 0 && index < stops.length - 1 ? ' is-middle' : ''}"
                style="--detail-map-point-left:${left}%; --detail-map-point-top:${top}px;"
            >
                <span class="detail-map-point-badge">${stop.number}</span>
                <span class="detail-map-point-label">${stop.code}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="detail-map-preview">
            <div class="detail-map-route-line"></div>
            ${stopMarkers}
        </div>
        <div class="stops-row"><span>${stops.length} Stop${stops.length === 1 ? '' : 's'}</span><span>${load.miles.toFixed(1)} mi</span></div>
    `;
}

function buildDetailStopCard(stop, segmentAfter, load) {
    const showArrivalEditor = stop.canEditArrival && load.pickupEditorOpen;
    const isAdjustedArrival = stop.canEditArrival && isPickupTimeAdjusted(load);

    return `
        <article class="detail-stop-card is-open" data-detail-stop-card>
            <button type="button" class="detail-stop-toggle" data-detail-stop-toggle>
                <span class="detail-stop-toggle-left">
                    <span class="detail-stop-badge">${stop.number}</span>
                    <span class="detail-stop-toggle-title">${stop.code}</span>
                </span>
                <span class="detail-stop-toggle-right">
                    ${segmentAfter ? `<span class="detail-stop-toggle-distance">${segmentAfter.miles.toFixed(1)} mi</span>` : ''}
                    <span class="detail-stop-chevron">&#8963;</span>
                </span>
            </button>
            <div class="detail-stop-body" data-detail-stop-body>
                <div class="detail-stop-name">${stop.code}</div>
                <div class="detail-stop-address">${stop.address.line1}</div>
                <div class="detail-stop-address">${stop.address.line2}</div>

                <div class="detail-stop-info-group">
                    <div class="detail-stop-label">Equipment/ID</div>
                    <div class="detail-stop-value">
                        ${renderEquipmentDisplay(load, stop.equipmentStatus, { showEquipmentStatus: true })}
                        <div class="detail-stop-subvalue">${stop.equipmentNote}</div>
                        ${stop.equipmentSubLabel ? `<div class="detail-stop-subvalue is-muted">${stop.equipmentSubLabel}</div>` : ''}
                    </div>
                </div>

                <div class="detail-stop-info-group">
                    <div class="detail-stop-label">Arrival</div>
                    <div class="detail-stop-value">
                        <div class="detail-arrival-line">
                            <span class="detail-arrival-label${isAdjustedArrival ? ' is-adjusted' : ''}">${stop.arrivalLabel}</span>
                        </div>
                        ${stop.canEditArrival ? `
                            <button type="button" class="detail-edit-arrival-link" data-detail-edit-arrival>
                                Edit arrival time
                            </button>
                            ${showArrivalEditor ? `
                                <div class="detail-arrival-editor" data-detail-arrival-editor>
                                    <input
                                        class="detail-arrival-date-input"
                                        type="date"
                                        data-detail-arrival-date
                                        value="${formatDateInputValue(load.pickupDateTime)}"
                                        min="${formatDateInputValue(load.pickupWindowStartDateTime)}"
                                        max="${formatDateInputValue(load.pickupWindowEndDateTime)}"
                                    >
                                    <select
                                        class="detail-arrival-time-select"
                                        data-detail-arrival-time
                                        data-selected-time="${formatTimeInputValue(load.pickupDateTime)}"
                                    ></select>
                                </div>
                            ` : ''}
                        ` : ''}
                    </div>
                </div>

                ${stop.windowLabel ? `
                    <div class="detail-stop-info-group">
                        <div class="detail-stop-label">Pickup window</div>
                        <div class="detail-stop-value">${stop.windowLabel}</div>
                    </div>
                ` : ''}

                ${stop.showBookingWarning ? `
                    <div class="detail-panel-warning detail-panel-warning-inline">
                        Before booking, confirm arrival within the pickup window.
                    </div>
                ` : ''}

                <div class="detail-stop-info-group">
                    <div class="detail-stop-label">Departure</div>
                    <div class="detail-stop-value">${stop.departureLabel}</div>
                </div>

                <button type="button" class="detail-instruction-toggle" data-detail-instruction-toggle>
                    <span class="detail-instruction-caret">&#8250;</span>
                    <span>${stop.instructionLabel}</span>
                </button>
                <div class="detail-instruction-body" data-detail-instruction-body hidden>${stop.instructionText}</div>
            </div>
        </article>
        ${segmentAfter ? `
            <div class="detail-segment-summary">
                <span>${segmentAfter.miles.toFixed(1)} mi</span>
                <span>&bull;</span>
                <span>${formatDuration(segmentAfter.durationMinutes)}</span>
            </div>
        ` : ''}
    `;
}

function buildDetailFeatureGrid(load, stopCount) {
    const blockLoad = isBlockLoad(load);
    const shuffleLoad = isShuffleLoad(load);
    const detailItems = [{
        icon: (blockLoad || shuffleLoad) ? '&#9475;' : '&#8593;',
        label: 'Type',
        value: blockLoad
            ? 'Block'
            : (shuffleLoad ? 'Shuffle' : (isRoundTripLoad(load) ? 'Round trip' : 'One-way'))
    }, {
        icon: '&#9716;',
        label: 'Stops',
        value: blockLoad ? '-- Stops' : `${stopCount} Stops`
    }, {
        icon: '&#8635;',
        label: 'Distance',
        value: blockLoad ? '--' : `${load.miles.toFixed(1)} mi`
    }, {
        icon: '&#9716;',
        label: 'Duration',
        value: load.duration
    }, {
        icon: '&#10003;',
        label: 'Equipment',
        value: isTrailerRequiredEquipment(getLoadEquipmentDisplay(load)) ? 'Required' : 'Provided'
    }, {
        icon: load.driverType === 'Team' ? '&#128101;' : '&#128100;',
        label: 'Driver type',
        value: load.driverType
    }, {
        icon: '&#128666;',
        label: 'Trailer',
        value: getLoadEquipmentDisplay(load)
    }];

    return detailItems.map((item) => `
        <div class="detail-feature-item">
            <span class="detail-feature-icon" aria-hidden="true">${item.icon}</span>
            <div class="detail-feature-copy">
                <span class="detail-feature-value">${item.value}</span>
            </div>
        </div>
    `).join('');
}

function buildDetailPayoutMarkup(load, seed) {
    const totalCents = Math.round((Number(load.priceValue) || parseNumber(load.price)) * 100);
    const tollRate = seed % 4 === 0 ? 0 : 0.018 + ((seed % 5) * 0.006);
    const fuelRate = 0.18 + ((seed % 7) * 0.018);
    const tollCents = Math.round(totalCents * tollRate);
    const fuelCents = Math.round(totalCents * fuelRate);
    const baseCents = Math.max(0, totalCents - fuelCents - tollCents);
    const tourId = `Tour...${(seed + 426).toString(16).slice(-8)}`;
    const loadId = `Load...${(seed + 1198).toString(16).slice(-8)}`;

    return `
        <div class="detail-panel-section">
            <div class="detail-section-header">
                <strong>Estimated Payout</strong>
                <strong>${load.price}</strong>
            </div>
            <div class="detail-reference-row">
                <div class="detail-reference-id">${tourId}</div>
                <div class="detail-reference-rate">${load.pricePerMile}</div>
                <div class="detail-reference-note">Base rate per mile</div>
            </div>
            <div class="detail-reference-row">
                <div class="detail-reference-id">${loadId}</div>
                <div class="detail-reference-rate">${formatMoney(baseCents / 100)}</div>
                <div class="detail-reference-note">Linehaul portion</div>
            </div>
            <div class="detail-breakdown-grid">
                <div><strong>${formatMoney(baseCents / 100)}</strong><span>Base Rate</span></div>
                <div><strong>${formatMoney(fuelCents / 100)}</strong><span>Fuel Surcharge</span></div>
                <div><strong>${formatMoney(tollCents / 100)}</strong><span>Toll Charge</span></div>
                <div><strong>${formatMoney(totalCents / 100)}</strong><span>Total</span></div>
            </div>
        </div>
    `;
}

function buildBlockDetailPanelMarkup(load) {
    return `
        <div class="detail-panel-header">
            <div>
                <div class="tiny muted">${load.displayDeadhead.toFixed(1)} mi deadhead</div>
                <div class="detail-panel-route-stops">
                    <div class="detail-panel-route-stop">
                        <span class="detail-stop-badge is-block" aria-hidden="true"></span>
                        <div>
                            <strong>${load.origin}</strong>
                            <div class="tiny muted">${load.pickupWindow}</div>
                        </div>
                    </div>
                    <div class="detail-panel-route-arrow">&#8597;</div>
                    <div class="detail-panel-route-stop">
                        <span class="detail-stop-badge is-block" aria-hidden="true"></span>
                        <div>
                            <strong>${load.destination}</strong>
                            <div class="tiny muted">${load.deliveryWindow}</div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="detail-close" type="button" aria-label="Close booking panel">&times;</button>
        </div>
        <div class="detail-panel-price">
            <strong>${load.price}</strong>
            <span>${load.pricePerMile}</span>
            <button class="btn btn-primary detail-book-button" type="button">Book</button>
        </div>
        <div class="detail-panel-warning">
            Tour details become available 15 hours before the start of the block; however, in some cases, details may change or get assigned to a block after the block start time.
        </div>
        <div class="detail-panel-section">
            <div class="detail-section-header">
                <strong>Details</strong>
            </div>
            <div class="detail-feature-grid">
                ${buildDetailFeatureGrid(load, 0)}
            </div>
        </div>
    `;
}

function buildShuffleDetailPanelMarkup(load) {
    return `
        <div class="detail-panel-header">
            <div>
                <div class="tiny muted">${load.displayDeadhead.toFixed(1)} mi deadhead</div>
                <div class="detail-panel-route-stops">
                    <div class="detail-panel-route-stop">
                        <span class="detail-stop-badge is-block" aria-hidden="true"></span>
                        <div>
                            <strong>${load.origin}</strong>
                            <div class="tiny muted">${load.pickupWindow}</div>
                        </div>
                    </div>
                    <div class="detail-panel-route-arrow">&#8597;</div>
                    <div class="detail-panel-route-stop">
                        <span class="detail-stop-badge is-block" aria-hidden="true"></span>
                        <div>
                            <strong>${load.destination}</strong>
                            <div class="tiny muted">${load.deliveryWindow}</div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="detail-close" type="button" aria-label="Close booking panel">&times;</button>
        </div>
        <div class="detail-panel-price">
            <strong>${load.price}</strong>
            <span></span>
            <button class="btn btn-primary detail-book-button" type="button">Book</button>
        </div>
        <div class="detail-panel-section">
            <div class="detail-section-header">
                <strong>Details</strong>
            </div>
            <div class="detail-feature-grid">
                ${buildDetailFeatureGrid(load, 2)}
            </div>
        </div>
    `;
}

function buildDetailPanelMarkup(load) {
    const isBooked = bookedLoadKeys.has(getLoadKey(load));

    if (isBooked) {
        const finalStopNumber = load.routeStops?.[load.routeStops.length - 1]?.number || load.stops || 2;
        return `
            <div class="detail-panel-header detail-panel-header-booked">
                <div class="tiny muted">${load.displayDeadhead.toFixed(2)} mi deadhead</div>
                <button class="detail-close" type="button" aria-label="Close booking panel">&times;</button>
            </div>
            <div class="booking-success-stops">
                <div class="booking-success-stop">
                    <span class="booking-success-stop-index">1</span>
                    <div>
                        <strong>${load.originCode} ${load.originCity}</strong>
                        <div class="tiny muted">${load.pickupWindow}</div>
                    </div>
                </div>
                <div class="booking-success-arrow">&#8595;</div>
                <div class="booking-success-stop">
                    <span class="booking-success-stop-index">${finalStopNumber}</span>
                    <div>
                        <strong>${load.destinationCode} ${load.destinationCity}</strong>
                        <div class="tiny muted">${load.deliveryWindow}</div>
                    </div>
                </div>
            </div>
            <div class="booking-success-card">
                <div class="booking-success-top">
                    <div class="booking-success-title">Your trip is booked!</div>
                    <div class="booking-success-price">
                        <strong>${load.price}</strong>
                        <span>${load.pricePerMile}</span>
                    </div>
                </div>
                <div class="booking-success-divider"></div>
                <div class="booking-success-hero" aria-hidden="true">
                    <div class="booking-success-road"></div>
                    <div class="booking-success-truck">
                        <span class="booking-success-truck-box"></span>
                        <span class="booking-success-truck-cab"></span>
                        <span class="booking-success-truck-wheel booking-success-truck-wheel-left"></span>
                        <span class="booking-success-truck-wheel booking-success-truck-wheel-right"></span>
                    </div>
                    <div class="booking-success-badge">
                        <span>&#10003;</span>
                    </div>
                </div>
                <div class="booking-success-next">Next steps</div>
                <button class="booking-success-action detail-go-trips" type="button">
                    <span class="booking-success-action-icon" aria-hidden="true"></span>
                    <span>Assign a driver</span>
                </button>
                <button class="btn btn-primary detail-booked-close" type="button">Close</button>
            </div>
        `;
    }

    if (isBlockLoad(load)) {
        return buildBlockDetailPanelMarkup(load);
    }

    if (isShuffleLoad(load)) {
        return buildShuffleDetailPanelMarkup(load);
    }

    const detailData = buildLoadDetailStops(load);
    const { seed, stops, segments } = detailData;

    return `
        <div class="detail-panel-header">
            <div>
                <div class="tiny muted">${load.displayDeadhead.toFixed(1)} mi deadhead</div>
                <div class="detail-panel-route-stops">
                    <div class="detail-panel-route-stop">
                        <span class="detail-stop-badge">1</span>
                        <div>
                            <strong>${load.originCode} ${load.originCity}</strong>
                            <div class="tiny muted detail-panel-route-time${isPickupTimeAdjusted(load) ? ' is-adjusted' : ''}">${formatDetailStopDateTime(load.pickupDateTime, load.originCity)}</div>
                        </div>
                    </div>
                    <div class="detail-panel-route-arrow">&#8595;</div>
                    <div class="detail-panel-route-stop">
                        <span class="detail-stop-badge">${stops[stops.length - 1].number}</span>
                        <div>
                            <strong>${load.destinationCode} ${load.destinationCity}</strong>
                            <div class="tiny muted">${formatDetailStopDateTime(load.deliveryDateTime, load.destinationCity)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="detail-close" type="button" aria-label="Close booking panel">&times;</button>
        </div>
        <div class="detail-panel-price">
            <strong>${load.price}</strong>
            <span>${load.pricePerMile}</span>
            <button class="btn btn-primary detail-book-button" type="button">Book</button>
        </div>
        ${load.isPickupAdjustable ? `
            <div class="detail-panel-warning">
                This load has flexible pick up time. To change your arrival time, select and confirm new arrival time before booking.
            </div>
        ` : ''}
        <div class="detail-panel-map">
            ${buildDetailMapPreview(load, stops)}
        </div>
        <div class="detail-panel-section">
            <button type="button" class="detail-collapse-all" data-detail-collapse-all>
                <span>Collapse All</span>
                <span class="detail-collapse-all-icon">&#8963;</span>
            </button>
            <div class="detail-stop-stack">
                ${stops.map((stop, index) => buildDetailStopCard(stop, segments[index], load)).join('')}
            </div>
        </div>
        <div class="detail-panel-section">
            <div class="detail-section-header">
                <strong>Details</strong>
            </div>
            <div class="detail-feature-grid">
                ${buildDetailFeatureGrid(load, stops.length)}
            </div>
        </div>
        ${buildDetailPayoutMarkup(load, seed)}
    `;
}

function setDetailStopCardOpen(card, shouldOpen) {
    if (!card) return;
    const body = card.querySelector('[data-detail-stop-body]');
    const chevron = card.querySelector('.detail-stop-chevron');

    card.classList.toggle('is-open', shouldOpen);
    if (body) {
        body.hidden = !shouldOpen;
    }
    if (chevron) {
        chevron.innerHTML = shouldOpen ? '&#8963;' : '&#8964;';
    }
}

function syncDetailCollapseAll(detailRoot) {
    if (!detailRoot) return;
    const collapseButton = detailRoot.querySelector('[data-detail-collapse-all]');
    if (!collapseButton) return;

    const cards = Array.from(detailRoot.querySelectorAll('[data-detail-stop-card]'));
    const hasOpenCard = cards.some((card) => card.classList.contains('is-open'));
    const label = collapseButton.querySelector('span');
    const icon = collapseButton.querySelector('.detail-collapse-all-icon');

    if (label) {
        label.textContent = hasOpenCard ? 'Collapse All' : 'Expand All';
    }

    if (icon) {
        icon.innerHTML = hasOpenCard ? '&#8963;' : '&#8964;';
    }
}

function renderDetailPanel(load) {
    if (!detailPanel) return;

    detailPanel.innerHTML = buildDetailPanelMarkup(load);

    detailPanel.querySelectorAll('[data-detail-stop-card]').forEach((card) => {
        setDetailStopCardOpen(card, true);
    });
    syncDetailCollapseAll(detailPanel);

    const closeButton = detailPanel.querySelector('.detail-close');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            closeDetailPanel();
        });
    }

    const bookButton = detailPanel.querySelector('.detail-book-button');
    if (bookButton) {
        bookButton.addEventListener('click', () => {
            const pendingPriceChange = getPendingPriceChange(load);
            if (pendingPriceChange) {
                showBookingStatusChangedError();
                return;
            }

            const didSaveTrip = saveBookedTrip(load);
            if (!didSaveTrip) {
                return;
            }

            bookedLoadKeys.add(getLoadKey(load));
            refreshPatOrderMatches();
            renderPatRecommendations();
            renderPatOrders();
            activePanelLoad = load;
            applyFilters();
        });
    }

    const bookedCloseButton = detailPanel.querySelector('.detail-booked-close');
    if (bookedCloseButton) {
        bookedCloseButton.addEventListener('click', (event) => {
            event.preventDefault();
            closeDetailPanel();
        });
    }

    const goTripsButton = detailPanel.querySelector('.detail-go-trips');
    if (goTripsButton) {
        goTripsButton.addEventListener('click', () => {
            window.location.href = 'trips.html';
        });
    }

    detailPanel.querySelectorAll('[data-detail-stop-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('[data-detail-stop-card]');
            if (!card) return;
            setDetailStopCardOpen(card, !card.classList.contains('is-open'));
            syncDetailCollapseAll(detailPanel);
        });
    });

    detailPanel.querySelectorAll('[data-detail-instruction-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const body = button.parentElement?.querySelector('[data-detail-instruction-body]');
            const caret = button.querySelector('.detail-instruction-caret');
            const shouldOpen = Boolean(body?.hidden);

            if (body) {
                body.hidden = !shouldOpen;
            }
            if (caret) {
                caret.innerHTML = shouldOpen ? '&#8964;' : '&#8250;';
            }
            button.classList.toggle('is-open', shouldOpen);
        });
    });

    detailPanel.querySelectorAll('[data-detail-edit-arrival]').forEach((button) => {
        button.addEventListener('click', () => {
            const masterLoad = getMasterLoadRecord(load);
            if (!masterLoad?.isPickupAdjustable) return;
            masterLoad.pickupEditorOpen = !masterLoad.pickupEditorOpen;
            activePanelLoad = masterLoad;
            renderDetailPanel(masterLoad);
        });
    });

    detailPanel.querySelectorAll('[data-detail-arrival-editor]').forEach((editor) => {
        const dateInput = editor.querySelector('[data-detail-arrival-date]');
        const timeSelect = editor.querySelector('[data-detail-arrival-time]');
        const masterLoad = getMasterLoadRecord(load);

        if (!dateInput || !timeSelect || !masterLoad?.isPickupAdjustable) return;

        const syncTimeOptions = () => {
            const selectedTime = timeSelect.dataset.selectedTime || timeSelect.value || formatTimeInputValue(masterLoad.pickupDateTime);
            const nextTime = populateArrivalTimeSelect(
                timeSelect,
                dateInput.value,
                selectedTime,
                masterLoad.pickupWindowStartDateTime,
                masterLoad.pickupWindowEndDateTime
            );
            timeSelect.dataset.selectedTime = nextTime;
            return nextTime;
        };

        const commitArrivalChange = () => {
            const parsedDate = parseDateAndTimeInputValue(dateInput.value, timeSelect.value);
            if (!parsedDate) return;

            if (applyPickupAdjustment(masterLoad, parsedDate)) {
                activePanelLoad = masterLoad;
                applyFilters({ resetPage: false });
            }
        };

        syncTimeOptions();

        dateInput.addEventListener('change', () => {
            const nextTime = syncTimeOptions();
            if (!nextTime) return;
            commitArrivalChange();
        });

        timeSelect.addEventListener('change', () => {
            timeSelect.dataset.selectedTime = timeSelect.value;
            commitArrivalChange();
        });
    });

    const collapseAllButton = detailPanel.querySelector('[data-detail-collapse-all]');
    if (collapseAllButton) {
        collapseAllButton.addEventListener('click', () => {
            const cards = Array.from(detailPanel.querySelectorAll('[data-detail-stop-card]'));
            const hasOpenCard = cards.some((card) => card.classList.contains('is-open'));
            cards.forEach((card) => setDetailStopCardOpen(card, !hasOpenCard));
            syncDetailCollapseAll(detailPanel);
        });
    }

    detailPanel.classList.add('active');
    if (resultsShell) {
        resultsShell.classList.add('has-panel');
    }
}

function hideDetailPanel() {
    if (!detailPanel) return;
    detailPanel.classList.remove('active');
    if (resultsShell) {
        resultsShell.classList.remove('has-panel');
    }
}

function openDetailPanel(load) {
    activeDetailId = load.id;
    activePanelLoad = load;
    syncActiveLoadRowSelection();
    renderDetailPanel(load);
    saveLoadboardSessionState();
}

function closeDetailPanel() {
    const masterLoad = getMasterLoadRecord(activePanelLoad);
    if (masterLoad) {
        masterLoad.pickupEditorOpen = false;
    }
    activeDetailId = null;
    activePanelLoad = null;
    syncActiveLoadRowSelection();
    hideDetailPanel();
    saveLoadboardSessionState();
}

function updateChips(active) {
    chipRow.innerHTML = '';

    active.forEach((text) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = text;
        chipRow.appendChild(chip);
    });

    chipRow.style.display = active.length ? 'flex' : 'none';
}

function updateCriteriaSummary(totalMatches, similarCount, activeChips, hasRadiusSearch, effectiveRadiusValue, usesImplicitOriginRadius = false, options = {}) {
    if (!criteriaHeadline || !criteriaSubtext) return;

    if (!activeChips.length) {
        const boardInventoryCount = options.boardInventoryCount || totalMatches;
        criteriaHeadline.textContent = 'Showing all available loads';
        criteriaSubtext.textContent = `${boardInventoryCount} generated demo loads are available. Showing a ${totalMatches}-load spotlight from different origins and categories. Use criteria to search the full board.`;
        return;
    }

    criteriaHeadline.textContent = `${activeChips.length} active criteria applied`;
    if (hasRadiusSearch) {
        const radiusSummary = usesImplicitOriginRadius
            ? `within ${effectiveRadiusValue} mi of the origin center`
            : 'inside the active radius';
        criteriaSubtext.textContent = `${totalMatches} load${totalMatches === 1 ? '' : 's'} are ${radiusSummary} and match the current rules. ${similarCount} more ${similarCount === 1 ? 'load sits' : 'loads sit'} outside the radius and appear in Similar matches.`;
        return;
    }

    criteriaSubtext.textContent = `${totalMatches} load${totalMatches === 1 ? '' : 's'} match the current rules.`;
}

function buildCountLabel(totalMatches) {
    if (!totalMatches) {
        return 'Showing 0 - 0 of 0 results';
    }

    const start = ((amazonCurrentPage - 1) * RESULTS_PER_PAGE) + 1;
    const end = Math.min(totalMatches, amazonCurrentPage * RESULTS_PER_PAGE);
    return `Showing ${start} - ${end} of ${totalMatches} results`;
}

function hasActiveLoadCriteria(filterState) {
    const state = cloneFilterState(filterState);
    return Boolean(
        state.origin
        || state.equipment
        || state.destination.trim()
        || state.startDate
        || state.startTime
        || state.endDate
        || state.endTime
        || state.workBlock
        || state.workHostler
        || state.workOneway
        || state.driverSolo
        || state.driverTeam
        || state.loadLive
        || state.loadDrop
        || state.price
        || state.payout
        || state.durationMin
        || state.durationMax
        || state.distanceMin
        || state.distanceMax
        || state.stops
        || state.excluded.trim()
    );
}

function getLoadSpotlightBucketKey(load) {
    return [
        load.originMarket || load.originCity || load.originCode,
        normalizeEquipmentForMatch(load.equipment),
        load.workType,
        load.driverType,
        load.loadType
    ].join('|');
}

function buildDefaultSpotlightLoads(sourceLoads, sortValue, originValue = '') {
    const selected = [];
    const selectedKeys = new Set();
    const addLoad = (load) => {
        if (!load || selected.length >= DEFAULT_SPOTLIGHT_LOAD_COUNT) {
            return;
        }

        const loadKey = getLoadKey(load);
        if (selectedKeys.has(loadKey)) {
            return;
        }
        selected.push(load);
        selectedKeys.add(loadKey);
    };

    sourceLoads.forEach((load) => {
        if (isNewBoardLoad(load)) {
            addLoad(load);
        }
    });

    sourceLoads.forEach((load) => {
        if (isRecentlyChangedBoardLoad(load)) {
            addLoad(load);
        }
    });

    [2, 5, 10].forEach((bucketLimit) => {
        if (selected.length >= DEFAULT_SPOTLIGHT_LOAD_COUNT) {
            return;
        }

        const bucketCounts = new Map();
        sourceLoads.forEach((load) => {
            if (selected.length >= DEFAULT_SPOTLIGHT_LOAD_COUNT || selectedKeys.has(getLoadKey(load))) {
                return;
            }

            const bucketKey = getLoadSpotlightBucketKey(load);
            const bucketCount = bucketCounts.get(bucketKey) || 0;
            if (bucketCount >= bucketLimit) {
                return;
            }

            bucketCounts.set(bucketKey, bucketCount + 1);
            addLoad(load);
        });
    });

    if (selected.length < DEFAULT_SPOTLIGHT_LOAD_COUNT) {
        sourceLoads
            .filter((load) => !selectedKeys.has(getLoadKey(load)))
            .forEach(addLoad);
    }

    return selected.sort((left, right) => compareLoadsBySort(left, right, sortValue, originValue));
}

function buildFilterStateFromControls() {
    return {
        origin: originSelect.value,
        radius: String(parseNumber(filterRadius.value || radiusSelect.value) || ''),
        equipment: equipmentSelect.value,
        sort: getCurrentSortValue(),
        destination: filterDestination.value.trim(),
        startDate: filterStartDate.value,
        startTime: filterStartTime.value,
        endDate: filterEndDate.value,
        endTime: filterEndTime.value,
        workBlock: workBlock.checked,
        workHostler: workHostler.checked,
        workOneway: workOneway.checked,
        driverSolo: driverSolo.checked,
        driverTeam: driverTeam.checked,
        loadLive: loadLive.checked,
        loadDrop: loadDrop.checked,
        price: filterPrice.value,
        payout: filterPayout.value,
        durationMin: filterDurationMin.value,
        durationMax: filterDurationMax.value,
        distanceMin: filterDistanceMin.value,
        distanceMax: filterDistanceMax.value,
        stops: filterStops.value,
        excluded: filterExcluded.value
    };
}

function applyFilterStateToControls(filterState) {
    const state = cloneFilterState(filterState);
    const radiusValue = String(parseNumber(state.radius) || '');

    originSelect.value = state.origin;
    radiusSelect.value = Array.from(radiusSelect.options).some((option) => option.value === radiusValue)
        ? radiusValue
        : '';
    equipmentSelect.value = state.equipment;
    filterDestination.value = state.destination;
    filterRadius.value = radiusValue;
    filterStartDate.value = state.startDate;
    filterStartTime.value = state.startTime;
    filterEndDate.value = state.endDate;
    filterEndTime.value = state.endTime;
    workBlock.checked = state.workBlock;
    workHostler.checked = state.workHostler;
    workOneway.checked = state.workOneway;
    driverSolo.checked = state.driverSolo;
    driverTeam.checked = state.driverTeam;
    loadLive.checked = state.loadLive;
    loadDrop.checked = state.loadDrop;
    filterPrice.value = state.price;
    filterPayout.value = state.payout;
    filterDurationMin.value = state.durationMin;
    filterDurationMax.value = state.durationMax;
    filterDistanceMin.value = state.distanceMin;
    filterDistanceMax.value = state.distanceMax;
    filterStops.value = state.stops;
    filterExcluded.value = state.excluded;
    updateSortUI();
}

function clearActiveLoadSelection() {
    activeDetailId = null;
    activePanelLoad = null;
    hideDetailPanel();
}

function syncActiveSearchFromControls() {
    const activeSearch = getActiveSearch();
    if (!activeSearch) return;
    activeSearch.filters = buildFilterStateFromControls();
}

function updateNewSearchButtonState() {
    if (!newSearchButton) return;
    const isMaxedOut = amazonSearches.length >= MAX_AMAZON_SEARCHES;
    newSearchButton.disabled = isMaxedOut;
    newSearchButton.title = isMaxedOut
        ? `You can keep up to ${MAX_AMAZON_SEARCHES} searches open at the same time.`
        : 'Create another search workspace.';
}

function buildVisiblePageNumbers(totalPages) {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let start = Math.max(1, amazonCurrentPage - 2);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
        end = totalPages;
        start = end - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function goToPage(page) {
    amazonCurrentPage = page;
    applyFilters();
}

function setActiveSearch(searchId, options = {}) {
    const nextSearch = amazonSearches.find((search) => search.id === searchId);
    if (!nextSearch) return;

    activeSearchId = searchId;
    applyFilterStateToControls(nextSearch.filters);
    toggleSortMenu(false);
    clearActiveLoadSelection();
    applyFilters({ resetPage: options.resetPage !== false });
}

function addSearch() {
    if (amazonSearches.length >= MAX_AMAZON_SEARCHES) return;

    const newSearch = createSearchState();
    amazonSearches.push(newSearch);
    setActiveSearch(newSearch.id);
}

function removeSearch(searchId) {
    if (amazonSearches.length <= 1) {
        const onlySearch = getActiveSearch();
        if (onlySearch) {
            onlySearch.filters = createEmptyFilterState();
            applyFilterStateToControls(onlySearch.filters);
            clearActiveLoadSelection();
            applyFilters({ resetPage: true });
        }
        return;
    }

    const closingIndex = amazonSearches.findIndex((search) => search.id === searchId);
    if (closingIndex === -1) return;

    const wasActive = activeSearchId === searchId;
    amazonSearches = amazonSearches.filter((search) => search.id !== searchId);

    if (!wasActive) {
        renderSearchRail();
        updateNewSearchButtonState();
        saveLoadboardSessionState();
        return;
    }

    const nextActiveSearch = amazonSearches[Math.max(0, closingIndex - 1)] || amazonSearches[0];
    setActiveSearch(nextActiveSearch.id);
}

function getSearchResults(filterState) {
    const state = cloneFilterState(filterState);
    const activeChips = [];
    const originValue = state.origin;
    const sortValue = getLoadSortOption(state.sort).value;
    const hasStudentCriteria = hasActiveLoadCriteria(state);
    const hasOriginCenter = Boolean(originValue);
    const selectedRadiusValue = parseNumber(state.radius);
    const effectiveRadiusValue = hasOriginCenter
        ? (selectedRadiusValue > 0 ? selectedRadiusValue : DEFAULT_ORIGIN_MATCH_RADIUS)
        : 0;
    const hasRadiusSearch = hasOriginCenter && effectiveRadiusValue > 0;
    const usesImplicitOriginRadius = hasOriginCenter && selectedRadiusValue <= 0;

    if (!hasStudentCriteria) {
        const availableLoads = amazonLoads.filter((load) => !bookedLoadKeys.has(getLoadKey(load)));
        const strictResults = buildDefaultSpotlightLoads(availableLoads, sortValue, originValue);

        return {
            strictResults,
            similarResults: [],
            activeChips,
            hasRadiusSearch: false,
            effectiveRadiusValue: 0,
            usesImplicitOriginRadius: false,
            sortValue,
            totalMatches: strictResults.length,
            boardInventoryCount: loadboardDemoInventoryCount,
            isDefaultSpotlight: true
        };
    }

    const availableLoads = amazonLoads.filter((load) => !bookedLoadKeys.has(getLoadKey(load)));

    let strictResults = availableLoads
        .map((load) => ({
            ...load,
            displayDeadhead: computeDeadhead(load, originValue)
        }));

    if (originValue) {
        activeChips.push(`Origin center: ${originValue}`);
    }

    const destinationValue = state.destination.trim();
    if (destinationValue) {
        const destinationQuery = destinationValue.toLowerCase();
        strictResults = strictResults.filter((load) =>
            load.destinationCity.toLowerCase().includes(destinationQuery)
            || (load.destinationMarket || '').toLowerCase().includes(destinationQuery)
        );
        activeChips.push(`Destination contains: ${destinationValue.toUpperCase()}`);
    }

    if (hasOriginCenter && selectedRadiusValue > 0) {
        activeChips.push(`Deadhead radius: ${selectedRadiusValue} mi max`);
    }

    const startDateTime = combineDateAndTime(state.startDate, state.startTime, false);
    if (startDateTime) {
        strictResults = strictResults.filter((load) => load.pickupDateTime >= startDateTime);
        activeChips.push(`Pickup after: ${formatDateTimeLabel(startDateTime)}`);
    }

    const endDateTime = combineDateAndTime(state.endDate, state.endTime, true);
    if (endDateTime) {
        strictResults = strictResults.filter((load) => load.pickupDateTime <= endDateTime);
        activeChips.push(`Pickup before: ${formatDateTimeLabel(endDateTime)}`);
    }

    const workTypes = [];
    if (state.workBlock) workTypes.push('Block');
    if (state.workHostler) workTypes.push('Shuffle');
    if (state.workOneway) workTypes.push('One-Way/Round Trip');
    if (workTypes.length) {
        strictResults = strictResults.filter((load) => workTypes.includes(load.workType));
        activeChips.push(`Work type: ${workTypes.join(', ')}`);
    }

    const driverTypes = [];
    if (state.driverSolo) driverTypes.push('Solo');
    if (state.driverTeam) driverTypes.push('Team');
    if (driverTypes.length) {
        strictResults = strictResults.filter((load) => driverTypes.includes(load.driverType));
        activeChips.push(`Driver type: ${driverTypes.join(', ')}`);
    }

    const loadTypes = [];
    if (state.loadLive) loadTypes.push('Live');
    if (state.loadDrop) loadTypes.push('Drop and hook');
    if (loadTypes.length) {
        strictResults = strictResults.filter((load) => loadTypes.includes(load.loadType));
        activeChips.push(`Load type: ${loadTypes.join(', ')}`);
    }

    const priceMin = parseNumber(state.price);
    if (priceMin) {
        strictResults = strictResults.filter((load) => load.pricePerMileValue >= priceMin);
        activeChips.push(`Price per mile: ${formatMoney(priceMin)}+`);
    }

    const payoutMin = parseNumber(state.payout);
    if (payoutMin) {
        strictResults = strictResults.filter((load) => load.priceValue >= payoutMin);
        activeChips.push(`Payout: ${formatMoney(payoutMin)}+`);
    }

    const durationMinHours = parseNumber(state.durationMin);
    if (durationMinHours) {
        strictResults = strictResults.filter((load) => load.durationTotalMinutes >= Math.round(durationMinHours * 60));
        activeChips.push(`Duration min: ${durationMinHours}h`);
    }

    const durationMaxHours = parseNumber(state.durationMax);
    if (durationMaxHours) {
        strictResults = strictResults.filter((load) => load.durationTotalMinutes <= Math.round(durationMaxHours * 60));
        activeChips.push(`Duration max: ${durationMaxHours}h`);
    }

    const distanceMin = parseNumber(state.distanceMin);
    if (distanceMin) {
        strictResults = strictResults.filter((load) => load.miles >= distanceMin);
        activeChips.push(`Distance min: ${distanceMin} mi`);
    }

    const distanceMax = parseNumber(state.distanceMax);
    if (distanceMax) {
        strictResults = strictResults.filter((load) => load.miles <= distanceMax);
        activeChips.push(`Distance max: ${distanceMax} mi`);
    }

    const stopsMax = parseNumber(state.stops);
    if (stopsMax) {
        strictResults = strictResults.filter((load) => load.stops <= stopsMax);
        activeChips.push(`Stops: ${stopsMax} max`);
    }

    const excludedCities = state.excluded
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 3);

    if (excludedCities.length) {
        strictResults = strictResults.filter((load) => !excludedCities.some((city) =>
            load.originCity.toLowerCase().includes(city) ||
            load.destinationCity.toLowerCase().includes(city) ||
            (load.originMarket || '').toLowerCase().includes(city) ||
            (load.destinationMarket || '').toLowerCase().includes(city)
        ));
        activeChips.push(`Excluded: ${excludedCities.join(', ')}`);
    }

    if (state.equipment) {
        strictResults = strictResults.filter((load) => normalizeEquipmentForMatch(load.equipment) === normalizeEquipmentForMatch(state.equipment));
        activeChips.push(`Equipment: ${state.equipment}`);
    }

    const baseResults = [...strictResults];
    let similarResults = [];

    if (hasRadiusSearch) {
        similarResults = baseResults.filter((load) => load.displayDeadhead > effectiveRadiusValue);
        strictResults = baseResults.filter((load) => load.displayDeadhead <= effectiveRadiusValue);
    }

    strictResults.sort((left, right) => compareLoadsBySort(left, right, sortValue, originValue));
    similarResults.sort((left, right) => compareLoadsBySort(left, right, sortValue, originValue));

    return {
        strictResults,
        similarResults,
        activeChips,
        hasRadiusSearch,
        effectiveRadiusValue,
        usesImplicitOriginRadius,
        sortValue,
        totalMatches: strictResults.length,
        boardInventoryCount: loadboardDemoInventoryCount,
        isDefaultSpotlight: false
    };
}

function renderSearchRail(activeSummary = null) {
    if (!searchRail) return;

    searchRail.innerHTML = '';

    amazonSearches.forEach((search) => {
        const summary = search.id === activeSearchId && activeSummary
            ? activeSummary
            : getSearchResults(search.filters);
        const chip = document.createElement('div');
        chip.className = `amazon-search-chip${search.id === activeSearchId ? ' is-active' : ''}`;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'amazon-search-chip-trigger';
        trigger.innerHTML = `
            <span class="amazon-search-chip-icon" aria-hidden="true"></span>
            <span class="amazon-search-chip-text">(${summary.totalMatches}) ${getSearchLabel(search)}</span>
        `;
        trigger.addEventListener('click', () => {
            if (search.id !== activeSearchId) {
                setActiveSearch(search.id);
            }
        });
        chip.appendChild(trigger);

        if (amazonSearches.length > 1) {
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'amazon-search-chip-close';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', `Close ${getSearchLabel(search)} search`);
            closeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                removeSearch(search.id);
            });
            chip.appendChild(closeButton);
        }

        searchRail.appendChild(chip);
    });

    updateNewSearchButtonState();
}

function renderPagination(totalMatches) {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    const totalPages = Math.max(1, Math.ceil(totalMatches / RESULTS_PER_PAGE));
    if (totalMatches <= RESULTS_PER_PAGE) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.className = 'amazon-page-arrow';
    previousButton.innerHTML = '&lsaquo;';
    previousButton.disabled = amazonCurrentPage === 1;
    previousButton.addEventListener('click', () => {
        if (amazonCurrentPage > 1) {
            goToPage(amazonCurrentPage - 1);
        }
    });
    paginationContainer.appendChild(previousButton);

    buildVisiblePageNumbers(totalPages).forEach((pageNumber) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `amazon-page-number${pageNumber === amazonCurrentPage ? ' is-active' : ''}`;
        button.textContent = String(pageNumber);
        button.addEventListener('click', () => goToPage(pageNumber));
        paginationContainer.appendChild(button);
    });

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'amazon-page-arrow';
    nextButton.innerHTML = '&rsaquo;';
    nextButton.disabled = amazonCurrentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (amazonCurrentPage < totalPages) {
            goToPage(amazonCurrentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function shouldHydrateFullBoardForFilters(filterState) {
    return hasActiveLoadCriteria(filterState) && isFullAmazonHydrationNeeded();
}

function getFullBoardHydrationProgressLabel() {
    const warmedCount = Math.min(loadboardDemoInventoryCount, amazonLoads.length);
    return `Searching full board... ${warmedCount} of ${loadboardDemoInventoryCount} loads ready`;
}

function refreshFullBoardHydrationProgressText() {
    if (!resultsCount || !resultsPanel?.classList.contains('is-hydrating')) {
        return;
    }

    const baseText = (resultsCount.textContent || '').split(' - Searching full board...')[0] || buildCountLabel(0);
    resultsCount.textContent = `${baseText} - ${getFullBoardHydrationProgressLabel()}`;
}

function queueFullBoardHydrationRerender() {
    if (loadboardFullHydrationRerenderQueued) {
        return;
    }

    loadboardFullHydrationRerenderQueued = true;
    ensureFullAmazonLoadsAsync(() => {
        loadboardFullHydrationRerenderQueued = false;
        resultsPanel?.classList.remove('is-hydrating');

        if (activeLoadboardView === 'post-a-truck') {
            refreshPatOrderMatches();
            renderPatRecommendations();
            renderPatOrders();
            return;
        }

        applyFilters({ resetPage: false, updatePriceChanges: true });
    });
}

function applyFilters(options = {}) {
    const { resetPage = false, updatePriceChanges = false } = options;
    const activeSearch = getActiveSearch();

    if (!activeSearch) {
        return;
    }

    const originValue = activeSearch.filters.origin || '';

    if (resetPage) {
        amazonCurrentPage = 1;
    }

    syncBookedLoadKeys();
    const isHydratingFullBoard = shouldHydrateFullBoardForFilters(activeSearch.filters);
    if (isHydratingFullBoard) {
        resultsPanel?.classList.add('is-hydrating');
        queueFullBoardHydrationRerender();
    } else if (!fullAmazonLoadsHydrating) {
        resultsPanel?.classList.remove('is-hydrating');
    }

    const {
        strictResults,
        similarResults,
        activeChips,
        hasRadiusSearch,
        effectiveRadiusValue,
        usesImplicitOriginRadius,
        sortValue,
        totalMatches,
        boardInventoryCount
    } = getSearchResults(activeSearch.filters);
    const totalPages = Math.max(1, Math.ceil(totalMatches / RESULTS_PER_PAGE));
    if (amazonCurrentPage > totalPages) {
        amazonCurrentPage = totalPages;
    }

    let pageStart = (amazonCurrentPage - 1) * RESULTS_PER_PAGE;
    if (updatePriceChanges) {
        const relevanceCandidateCount = sortValue === 'relevance'
            ? Math.min(strictResults.length, RESULTS_PER_PAGE * 6)
            : RESULTS_PER_PAGE;
        const priceChangeCandidates = sortValue === 'relevance'
            ? strictResults.slice(0, relevanceCandidateCount)
            : strictResults.slice(pageStart, pageStart + RESULTS_PER_PAGE);
        markVisiblePriceChanges(priceChangeCandidates.concat(similarResults.slice(0, SIMILAR_RESULTS_PREVIEW_COUNT)));

        if (sortValue === 'relevance') {
            strictResults.sort((left, right) => compareLoadsBySort(left, right, sortValue, originValue));
            similarResults.sort((left, right) => compareLoadsBySort(left, right, sortValue, originValue));
            pageStart = (amazonCurrentPage - 1) * RESULTS_PER_PAGE;
        }
    }

    const pagedStrictResults = strictResults.slice(pageStart, pageStart + RESULTS_PER_PAGE);
    const visibleSimilarResults = similarResults.slice(0, SIMILAR_RESULTS_PREVIEW_COUNT);
    const visibleLoads = pagedStrictResults.concat(visibleSimilarResults);
    lastVisibleLoadboardLoads = visibleLoads;

    renderAmazonRows(pagedStrictResults, recentContainer, true, 'No loads match the current criteria.');
    renderAmazonRows(
        visibleSimilarResults,
        similarContainer,
        false,
        hasRadiusSearch
            ? 'No loads sit just outside the current match radius.'
            : 'Set an origin and deadhead radius to generate similar matches.'
    );

    resultsCount.textContent = isHydratingFullBoard
        ? `${buildCountLabel(totalMatches)} - ${getFullBoardHydrationProgressLabel()}`
        : buildCountLabel(totalMatches);
    recentCount.textContent = strictResults.length > pagedStrictResults.length
        ? `(${pagedStrictResults.length} of ${strictResults.length})`
        : `(${strictResults.length})`;
    similarCount.textContent = similarResults.length > visibleSimilarResults.length
        ? `(${visibleSimilarResults.length} of ${similarResults.length})`
        : `(${similarResults.length})`;
    renderPagination(totalMatches);

    updateChips(activeChips);
    updateCriteriaSummary(totalMatches, similarResults.length, activeChips, hasRadiusSearch, effectiveRadiusValue, usesImplicitOriginRadius, {
        boardInventoryCount
    });
    if (isHydratingFullBoard) {
        const warmedCount = Math.min(loadboardDemoInventoryCount, amazonLoads.length);
        criteriaSubtext.textContent = `${totalMatches} matches from ${warmedCount} warmed loads are showing now. Searching the rest of the ${loadboardDemoInventoryCount} load board in the background.`;
    }
    activeSearch.filters.sort = sortValue;
    updateSortUI();
    renderSearchRail({
        totalMatches
    });

    const selectedLoad = activeDetailId
        ? strictResults.concat(similarResults).find((load) => load.id === activeDetailId)
        : null;

    if (selectedLoad) {
        activePanelLoad = selectedLoad;
        renderDetailPanel(selectedLoad);
    } else if (activePanelLoad && bookedLoadKeys.has(getLoadKey(activePanelLoad))) {
        renderDetailPanel(activePanelLoad);
    } else {
        activeDetailId = null;
        activePanelLoad = null;
        hideDetailPanel();
    }

    saveLoadboardSessionState();
    updateRelayAssistantButtonState();

}

function populateTopFilters() {
    originSelect.innerHTML = '';
    radiusSelect.innerHTML = '';
    equipmentSelect.innerHTML = '';

    const originPlaceholder = document.createElement('option');
    originPlaceholder.value = '';
    originPlaceholder.textContent = 'Origin';
    originSelect.appendChild(originPlaceholder);

    cities.forEach((city) => {
        const value = `${city.name}, ${city.state}`;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        originSelect.appendChild(option);
    });

    const radiusPlaceholder = document.createElement('option');
    radiusPlaceholder.value = '';
    radiusPlaceholder.textContent = 'Deadhead radius';
    radiusSelect.appendChild(radiusPlaceholder);

    [25, 50, 100, 150, 250].forEach((value) => {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = `${value} mi`;
        radiusSelect.appendChild(option);
    });

    const equipmentPlaceholder = document.createElement('option');
    equipmentPlaceholder.value = '';
    equipmentPlaceholder.textContent = 'Equipment';
    equipmentSelect.appendChild(equipmentPlaceholder);

    ["53' Trailer", "53' Container", "48' Trailer", REQUIRED_TRAILER_EQUIPMENT_LABEL].forEach((label) => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        equipmentSelect.appendChild(option);
    });
}

function resetActiveSearchToEmpty() {
    const activeSearch = getActiveSearch();
    if (!activeSearch) return;
    activeSearch.filters = createEmptyFilterState();
    applyFilterStateToControls(activeSearch.filters);
}

function syncRadiusFromSelect() {
    filterRadius.value = radiusSelect.value;
}

function syncRadiusFromInput() {
    const value = String(parseNumber(filterRadius.value) || '');
    radiusSelect.value = Array.from(radiusSelect.options).some((option) => option.value === value)
        ? value
        : '';
}

if (sortTrigger) {
    sortTrigger.addEventListener('click', () => {
        const shouldOpen = sortMenu?.hidden;
        renderSortMenu();
        toggleSortMenu(Boolean(shouldOpen));
    });
}

sortMenu?.addEventListener('click', (event) => {
    const optionButton = event.target.closest('[data-sort-value]');
    if (!optionButton) return;
    setActiveSort(optionButton.dataset.sortValue || 'relevance');
});

if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => {
        clearLoadboardFilters();
    });
}

if (footerClearFiltersButton) {
    footerClearFiltersButton.addEventListener('click', () => {
        clearLoadboardFilters();
    });
}

if (footerGoTopButton) {
    footerGoTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

if (footerRefreshButton) {
    footerRefreshButton.addEventListener('click', () => {
        refreshLoadboardResults();
    });
}

if (footerAutoRefreshToggle) {
    footerAutoRefreshToggle.addEventListener('change', () => {
        setLoadboardAutoRefreshEnabled(footerAutoRefreshToggle.checked);
    });
}

if (footerRefreshInterval) {
    footerRefreshInterval.addEventListener('change', () => {
        loadboardAutoRefreshSeconds = parseNumber(footerRefreshInterval.value) || 30;
        if (loadboardAutoRefreshEnabled) {
            scheduleLoadboardAutoRefresh();
        } else {
            updateLoadboardFooterStatus();
        }
    });
}

if (footerChatButton) {
    footerChatButton.addEventListener('click', (event) => {
        event.preventDefault();
        openRelayAssistantModal();
    });
}

if (radiusSelect) {
    radiusSelect.addEventListener('change', () => {
        syncRadiusFromSelect();
        syncActiveSearchFromControls();
        applyFilters({ resetPage: true });
    });
}

if (filterRadius) {
    filterRadius.addEventListener('input', () => {
        syncRadiusFromInput();
        syncActiveSearchFromControls();
        applyFilters({ resetPage: true });
    });
}

[
    originSelect,
    equipmentSelect,
    filterDestination,
    filterStartDate,
    filterStartTime,
    filterEndDate,
    filterEndTime,
    workBlock,
    workHostler,
    workOneway,
    driverSolo,
    driverTeam,
    loadLive,
    loadDrop,
    filterPrice,
    filterPayout,
    filterDurationMin,
    filterDurationMax,
    filterDistanceMin,
    filterDistanceMax,
    filterStops,
    filterExcluded
].forEach((element) => {
    if (!element) return;
    const isSelect = element.tagName === 'SELECT';
    const eventName = element.type === 'checkbox' || isSelect ? 'change' : 'input';
    element.addEventListener(eventName, () => {
        syncActiveSearchFromControls();
        applyFilters({ resetPage: true });
    });
});

if (newSearchButton) {
    newSearchButton.addEventListener('click', () => {
        addSearch();
    });
}

loadboardViewTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        setLoadboardView(tab.dataset.loadboardViewTarget || 'search');
    });
});

createOrderButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activePatEditOrderId = '';
        setLoadboardView('create-order');
    });
});

postATruckReturnButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activePatEditOrderId = '';
        setLoadboardView('post-a-truck');
    });
});

patOrderStatusTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        activePatOrderStatus = tab.dataset.patOrderStatus || 'open';
        patOrderStatusTabs.forEach((button) => {
            button.classList.toggle('is-active', button === tab);
        });
        renderPatOrders();
    });
});

if (scheduleTripLengthSelect) {
    scheduleTripLengthSelect.addEventListener('change', () => {
        syncScheduleRangeLabels();
    });
}

[
    scheduleStartDateInput,
    scheduleStartTimeInput,
    scheduleEndDateInput,
    scheduleEndTimeInput
].forEach((field) => {
    if (!field) return;
    field.addEventListener('change', () => {
        syncScheduleDateTimeConstraints();
    });
    field.addEventListener('input', () => {
        syncScheduleDateTimeConstraints();
    });
});

createOrderSectionToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
        const parentSection = toggle.closest('[data-pat-section]');
        if (parentSection) {
            setExpandedCreateSection(parentSection);
        }
    });
});

orderTypeCards.forEach((card) => {
    card.addEventListener('click', () => {
        setActiveOrderType(card.dataset.patOrderType || 'power-only');
    });
});

orderTypeDetails?.addEventListener('change', () => {
    updateCreateOrderSummaries();
});

[
    createOrderOriginSelect,
    createOrderOriginRadiusSelect,
    createOrderDestinationSelect,
    createOrderDestinationRadiusSelect,
    createOrderExcludedSelect,
    scheduleStartDateInput,
    scheduleStartTimeInput,
    scheduleStartWindowSelect,
    scheduleEndDateInput,
    scheduleEndTimeInput,
    scheduleStemTimeSelect,
    scheduleTripLengthSelect,
    scheduleMinRangeInput,
    scheduleMaxRangeInput,
    scheduleMaxStopsSelect,
    scheduleDriversSelect,
    payoutPricePerMileInput,
    payoutMinPayoutInput
].forEach((field) => {
    if (!field) return;
    field.addEventListener('change', () => {
        clearCreateOrderFieldError(field);
        updateCreateOrderSummaries();
    });
    field.addEventListener('input', () => {
        clearCreateOrderFieldError(field);
        updateCreateOrderSummaries();
    });
});

if (createOrderSubmitButton) {
    const freshCreateOrderSubmitButton = createOrderSubmitButton.cloneNode(true);
    createOrderSubmitButton.replaceWith(freshCreateOrderSubmitButton);
    createOrderSubmitButton = freshCreateOrderSubmitButton;
    createOrderSubmitButton.addEventListener('click', openPatCreateSubmitConfirmation);
}

document.addEventListener('click', routePatCreateOrderClicks, true);

document.addEventListener('click', (event) => {
    if (!sortControl || sortMenu?.hidden) return;
    if (!sortControl.contains(event.target)) {
        toggleSortMenu(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        toggleSortMenu(false);
    }
});

confirmOverlay?.addEventListener('click', (event) => {
    if (event.target === confirmOverlay) {
        hidePatConfirmFresh();
    }
});

populateTopFilters();
populateCreateOrderLocationFilters();
populateCreateOrderScheduleDefaults();
if (!restoreLoadboardSessionState()) {
    amazonSearches = [createSearchState()];
    activeSearchId = amazonSearches[0].id;
    activeLoadboardView = 'search';
}
applyFilterStateToControls(getActiveSearch()?.filters || createEmptyFilterState());
initializePatOrderAutoBook();
setCreateOrderSectionsLocked(true);
updateCreateOrderSummaries();
renderPatOrders();
if (createOrderOrderTypeSection) {
    setExpandedCreateSection(createOrderOrderTypeSection);
}
setLoadboardView(activeLoadboardView);
applyFilters();
loadboardAutoRefreshSeconds = parseNumber(footerRefreshInterval?.value) || 30;
initializeLoadboardFooterControls();

window.addEventListener('pageshow', (event) => {
    if (!event.persisted) {
        return;
    }

    syncBookedLoadKeys();
    applyFilters();
    renderPatRecommendations();
    renderPatOrders();
});
