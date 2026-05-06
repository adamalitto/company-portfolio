(function () {
    const paymentSchedule = window.AmazonDemoPaymentSchedule;
    const HISTORY_WEEKS_PER_YEAR = 53;
    const RELAY_LOAD_CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const DRIVER_OPTIONS = [
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
    const TRACTOR_OPTIONS = [
        "AH54219",
        "AG68452",
        "AK43168",
        "AH18264",
        "AJ07491",
        "AG95814",
        "AK93725",
        "AH70544",
        "AG84763",
        "AK81492"
    ];
    const TRAILER_OPTIONS = [
        "DZNG HV203151",
        "DZNG HV203157",
        "DZNG HV203209",
        "DZNG HV209511",
        "DZNG HV232458",
        "DZNG HV250693"
    ];
    const MAX_HISTORY_PRICE_PER_MILE = 5;
    const annualHistoryTripCache = new Map();

    const FACILITIES = {
        MTN1: { code: "MTN1", city: "Wilmington, DE", line1: "1025 Boxwood Rd", line2: "Wilmington, DE 19804" },
        ABE4: { code: "ABE4", city: "Easton, PA", line1: "1610 Van Buren Rd", line2: "Easton, PA 18045" },
        HAT9: { code: "HAT9", city: "Austell, GA", line1: "7520 Factory Shoals Rd", line2: "Austell, GA 30168" },
        BDL4: { code: "BDL4", city: "Windsor, CT", line1: "1200 Kennedy Rd", line2: "Windsor, CT 06095" },
        BHM1: { code: "BHM1", city: "Bessemer, AL", line1: "975 Powder Plant Rd", line2: "Bessemer, AL 35022" },
        DEN4: { code: "DEN4", city: "Thornton, CO", line1: "14601 Grant St", line2: "Thornton, CO 80023" },
        DET3: { code: "DET3", city: "Pontiac, MI", line1: "1200 Featherstone Rd", line2: "Pontiac, MI 48342" },
        HGR6: { code: "HGR6", city: "Hagerstown, MD", line1: "55 W Oak Ridge Dr", line2: "Hagerstown, MD 21740" },
        HOU6: { code: "HOU6", city: "Katy, TX", line1: "22525 Clay Rd", line2: "Katy, TX 77449" },
        IND9: { code: "IND9", city: "Greenwood, IN", line1: "1151 S Graham Rd", line2: "Greenwood, IN 46143" },
        KBWI: { code: "KBWI", city: "Baltimore, MD", line1: "5501 Holabird Ave", line2: "Baltimore, MD 21224" },
        LAS6: { code: "LAS6", city: "Las Vegas, NV", line1: "4550 Nexus Way", line2: "Las Vegas, NV 89115" },
        MCO5: { code: "MCO5", city: "Davenport, FL", line1: "305 Deen Still Rd", line2: "Davenport, FL 33897" },
        MGE5: { code: "MGE5", city: "Jefferson, GA", line1: "808 Hog Mountain Rd", line2: "Jefferson, GA 30549" },
        OAK5: { code: "OAK5", city: "Newark, CA", line1: "38811 Cherry St", line2: "Newark, CA 94560" },
        ONT6: { code: "ONT6", city: "Moreno Valley, CA", line1: "24208 San Michele Rd", line2: "Moreno Valley, CA 92551" },
        PDX9: { code: "PDX9", city: "Troutdale, OR", line1: "1250 NW Swigert Way", line2: "Troutdale, OR 97060" },
        RDU2: { code: "RDU2", city: "Smithfield, NC", line1: "6375 US-70 BUS", line2: "Smithfield, NC 27577" },
        RFD2: { code: "RFD2", city: "Huntley, IL", line1: "11500 Freeman Rd", line2: "Huntley, IL 60142" },
        SCK4: { code: "SCK4", city: "Stockton, CA", line1: "6001 S Austin Rd", line2: "Stockton, CA 95215" },
        SLC1: { code: "SLC1", city: "Salt Lake City, UT", line1: "777 N 5600 W", line2: "Salt Lake City, UT 84116" },
        TPA1: { code: "TPA1", city: "Ruskin, FL", line1: "3350 Laurel Ridge Ave", line2: "Ruskin, FL 33570" },
        "CSXT-NORTH KEARNY": { code: "CSXT-NORTH KEARNY", city: "Kearny, NJ", line1: "700 Old Fish House Rd", line2: "Kearny, NJ 07032" }
    };

    const ROUTE_TEMPLATES = [
        { stops: ["MTN1", "BDL4"], miles: [235], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["HGR6", "RFD2"], miles: [716], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["KBWI", "BHM1"], miles: [790], equipment: "53' Trailer", loadType: "Live/Drop", driverType: "Solo" },
        { stops: ["HAT9", "MCO5"], miles: [438], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["IND9", "DEN4"], miles: [1092], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["RDU2", "TPA1"], miles: [603], equipment: "53' Trailer", loadType: "Drop/Live", driverType: "Solo" },
        { stops: ["DET3", "BDL4"], miles: [675], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["MGE5", "HOU6"], miles: [811], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["SLC1", "LAS6"], miles: [421], equipment: "53' Trailer", loadType: "Live", driverType: "Solo" },
        { stops: ["SCK4", "PDX9"], miles: [651], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["OAK5", "ONT6"], miles: [394], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["LAS6", "MCO5"], miles: [2310], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["HOU6", "RDU2"], miles: [1194], equipment: "53' Trailer", loadType: "Drop/Live", driverType: "Team" },
        { stops: ["DEN4", "SLC1"], miles: [522], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["MTN1", "OAK5"], miles: [2895], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["KBWI", "LAS6"], miles: [2410], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["ABE4", "SCK4"], miles: [2790], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["HAT9", "PDX9"], miles: [2638], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["MCO5", "DEN4"], miles: [1875], equipment: "53' Trailer", loadType: "Drop/Live", driverType: "Team" },
        { stops: ["RDU2", "SLC1"], miles: [2115], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["BDL4", "HOU6"], miles: [1760], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["DET3", "ONT6"], miles: [2195], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["IND9", "PDX9"], miles: [2235], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["TPA1", "DEN4"], miles: [1848], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["RFD2", "DET3", "BDL4"], miles: [319, 641], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["KBWI", "MTN1", "RDU2"], miles: [75, 402], equipment: "53' Trailer", loadType: "Live/Drop", driverType: "Solo" },
        { stops: ["SCK4", "OAK5", "ONT6"], miles: [68, 394], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["MGE5", "BHM1", "HOU6"], miles: [238, 668], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["TPA1", "MCO5", "HAT9"], miles: [81, 438], equipment: "53' Trailer", loadType: "Drop", driverType: "Solo" },
        { stops: ["PDX9", "SLC1", "DEN4"], miles: [766, 522], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["ONT6", "LAS6", "HOU6"], miles: [235, 1460], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["OAK5", "SLC1", "IND9"], miles: [735, 1545], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["PDX9", "DEN4", "MGE5"], miles: [1288, 1390], equipment: "53' Trailer", loadType: "Drop", driverType: "Team" },
        { stops: ["HOU6", "MCO5", "MTN1"], miles: [965, 994], equipment: "53' Trailer", loadType: "Drop/Live", driverType: "Team" }
    ];
    const CANCELED_ROUTE_TEMPLATES = [
        { stops: ["CSXT-NORTH KEARNY", "ABE4"], miles: [77], equipment: "53' Container", loadType: "Drop", driverType: "Solo" }
    ];

    function startOfDay(date) {
        const nextDate = new Date(date);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate;
    }

    function addDays(date, days) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate;
    }

    function addMinutes(date, minutes) {
        const nextDate = new Date(date);
        nextDate.setMinutes(nextDate.getMinutes() + minutes);
        return nextDate;
    }

    function getWeekStartSunday(date) {
        const safeDate = startOfDay(date);
        return addDays(safeDate, -safeDate.getDay());
    }

    function hashString(value) {
        return String(value || "").split("").reduce((hash, character) => (
            ((hash * 33) + character.charCodeAt(0)) >>> 0
        ), 2166136261);
    }

    function encodeRelayLoadValue(value, length) {
        let remainingValue = BigInt(value);
        let encoded = "";
        const base = BigInt(RELAY_LOAD_CODE_ALPHABET.length);

        for (let index = 0; index < length; index += 1) {
            encoded = RELAY_LOAD_CODE_ALPHABET[Number(remainingValue % base)] + encoded;
            remainingValue /= base;
        }

        return encoded;
    }

    function buildRelayLoadCode(seed, namespace = "") {
        const normalizedSeed = Math.abs(Number(seed) || 0);
        const primaryHash = BigInt(hashString(`${namespace}:${normalizedSeed}`));
        const secondaryHash = BigInt(hashString(`${normalizedSeed}:${namespace}:history-schedule`));
        const combined = (primaryHash << 31n) ^ secondaryHash ^ BigInt(normalizedSeed);
        const suffixCapacity = BigInt(RELAY_LOAD_CODE_ALPHABET.length) ** 6n;
        const prefixDigit = Number(combined % 8n) + 1;
        const suffixValue = (combined / 8n) % suffixCapacity;

        return `11${prefixDigit}${encodeRelayLoadValue(suffixValue, 6)}`;
    }

    function roundMoney(value) {
        return Math.round((Number(value) || 0) * 100) / 100;
    }

    function formatMoney(value) {
        return (Number(value) || 0).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatDuration(totalMinutes) {
        const safeMinutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
        const days = Math.floor(safeMinutes / 1440);
        const hours = Math.floor((safeMinutes % 1440) / 60);
        const minutes = safeMinutes % 60;

        if (days) {
            return `${days}d ${hours}h`;
        }

        if (hours) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    }

    function getFacility(code) {
        return FACILITIES[code] || {
            code,
            city: code,
            line1: "100 Logistics Pkwy",
            line2: code
        };
    }

    function buildAddress(facility) {
        return {
            shortCode: facility.code,
            line1: facility.line1,
            line2: facility.line2
        };
    }

    function buildStop(facility, stopNumber, role, arrivalDate, departureDate) {
        return {
            number: stopNumber,
            code: facility.code,
            city: facility.city,
            market: facility.city,
            role,
            address: buildAddress(facility),
            arrivalIso: arrivalDate.toISOString(),
            departureIso: departureDate.toISOString()
        };
    }

    function calculateSegmentDurationMinutes(miles, driverType) {
        const driveMinutes = (Number(miles) / 55) * 60;
        const bufferMinutes = driverType === "Team" ? 75 : (Number(miles) > 700 ? 705 : 95);
        return Math.max(90, Math.round(driveMinutes + bufferMinutes));
    }

    function getAnnualRows(paymentYear) {
        if (paymentSchedule?.buildAnnualPaymentRows) {
            return paymentSchedule.buildAnnualPaymentRows(paymentYear);
        }

        return [];
    }

    function getRouteTemplateForLoad(weekSeed, loadIndex) {
        return ROUTE_TEMPLATES[(weekSeed + (loadIndex * 7)) % ROUTE_TEMPLATES.length];
    }

    function getRouteTemplateMiles(template) {
        return template.miles.reduce((sum, segmentMiles) => sum + segmentMiles, 0);
    }

    function getCompletedLoadCapacityCents(weekSeed, loadIndex) {
        const template = getRouteTemplateForLoad(weekSeed, loadIndex);
        return Math.floor(getRouteTemplateMiles(template) * MAX_HISTORY_PRICE_PER_MILE * 100);
    }

    function getCompletedLoadCapacityTotalCents(weekSeed, loadCount) {
        return Array.from({ length: loadCount }, (_, loadIndex) => (
            getCompletedLoadCapacityCents(weekSeed, loadIndex)
        )).reduce((sum, cents) => sum + cents, 0);
    }

    function getHistoryLoadCountForPayment(weekSeed, targetCents) {
        let loadCount = 6 + (weekSeed % 4);

        while (getCompletedLoadCapacityTotalCents(weekSeed, loadCount) < targetCents) {
            loadCount += 1;
        }

        return loadCount;
    }

    function splitPaymentCents(totalCents, weekSeed, loadCount) {
        const weights = Array.from({ length: loadCount }, (_, loadIndex) => (
            70 + (hashString(`${weekSeed}:weight:${loadIndex}`) % 95)
        ));
        const capacities = Array.from({ length: loadCount }, (_, loadIndex) => (
            getCompletedLoadCapacityCents(weekSeed, loadIndex)
        ));
        const allocations = Array.from({ length: loadCount }, () => 0);
        let remainingCents = Math.max(0, Math.round(Number(totalCents) || 0));
        let activeIndexes = capacities
            .map((capacity, index) => (capacity > 0 ? index : -1))
            .filter((index) => index >= 0);

        while (remainingCents > 0 && activeIndexes.length) {
            const activeWeightTotal = activeIndexes.reduce((sum, loadIndex) => sum + weights[loadIndex], 0);
            let allocatedThisPass = 0;

            activeIndexes.forEach((loadIndex, activeIndex) => {
                const availableRoom = capacities[loadIndex] - allocations[loadIndex];
                if (availableRoom <= 0 || remainingCents <= 0) {
                    return;
                }

                const weightedShare = Math.floor((remainingCents * weights[loadIndex]) / activeWeightTotal);
                const fallbackShare = activeIndex === activeIndexes.length - 1 && allocatedThisPass === 0 ? 1 : 0;
                const cents = Math.min(availableRoom, Math.max(weightedShare, fallbackShare));
                allocations[loadIndex] += cents;
                allocatedThisPass += cents;
            });

            remainingCents -= allocatedThisPass;
            activeIndexes = activeIndexes.filter((loadIndex) => allocations[loadIndex] < capacities[loadIndex]);

            if (allocatedThisPass === 0) {
                break;
            }
        }

        while (remainingCents > 0) {
            const nextLoadIndex = allocations.findIndex((cents, loadIndex) => cents < capacities[loadIndex]);
            if (nextLoadIndex < 0) {
                break;
            }

            const cents = Math.min(capacities[nextLoadIndex] - allocations[nextLoadIndex], remainingCents);
            allocations[nextLoadIndex] += cents;
            remainingCents -= cents;
        }

        return allocations;
    }

    function buildCompletedTrip(paymentRow, loadIndex, loadCount, priceCents, options = {}) {
        const weekSeed = hashString(`${paymentRow.paymentYear}:${paymentRow.weekNumber}:history`);
        const routeSeed = options.routeSeed || hashString(`${paymentRow.paymentYear}:${paymentRow.weekNumber}:history-count`);
        const loadSeed = hashString(`${weekSeed}:${loadIndex}:load`);
        const template = options.historyStatus === "canceled"
            ? CANCELED_ROUTE_TEMPLATES[(routeSeed + loadIndex) % CANCELED_ROUTE_TEMPLATES.length]
            : getRouteTemplateForLoad(routeSeed, loadIndex);
        const stopCodes = template.stops;
        const facilities = stopCodes.map(getFacility);
        const origin = facilities[0];
        const destination = facilities[facilities.length - 1];
        const dayOffset = loadIndex % 6;
        const startHour = 5 + ((loadIndex * 3 + paymentRow.weekNumber) % 14);
        const startMinute = ((loadIndex + paymentRow.weekNumber) % 2) * 30;
        const pickupArrival = addMinutes(addDays(startOfDay(paymentRow.workStartDate), dayOffset), (startHour * 60) + startMinute);
        let previousDeparture = addMinutes(pickupArrival, 30);
        const routeStops = [buildStop(origin, 1, "pickup", pickupArrival, previousDeparture)];
        const routeSegments = [];
        const actualTimes = {
            stop1Arrival: pickupArrival.toISOString(),
            stop1Departure: previousDeparture.toISOString()
        };
        const lateEvents = {
            stop1Arrival: false,
            stop1Departure: false
        };

        template.miles.forEach((segmentMiles, segmentIndex) => {
            const nextFacility = facilities[segmentIndex + 1];
            const segmentDuration = calculateSegmentDurationMinutes(segmentMiles, template.driverType);
            const arrivalDate = addMinutes(previousDeparture, segmentDuration);
            const departureDate = addMinutes(arrivalDate, 30);
            const stopNumber = segmentIndex + 2;
            const isFinalStop = stopNumber === facilities.length;

            routeSegments.push({
                index: segmentIndex + 1,
                fromNumber: segmentIndex + 1,
                toNumber: stopNumber,
                fromCode: facilities[segmentIndex].code,
                toCode: nextFacility.code,
                miles: segmentMiles,
                durationMinutes: segmentDuration
            });

            routeStops.push(buildStop(nextFacility, stopNumber, isFinalStop ? "delivery" : "transfer", arrivalDate, departureDate));
            actualTimes[`stop${stopNumber}Arrival`] = arrivalDate.toISOString();
            actualTimes[`stop${stopNumber}Departure`] = departureDate.toISOString();
            lateEvents[`stop${stopNumber}Arrival`] = false;
            lateEvents[`stop${stopNumber}Departure`] = false;
            previousDeparture = departureDate;
        });

        const miles = template.miles.reduce((sum, segmentMiles) => sum + segmentMiles, 0);
        const priceValue = roundMoney(priceCents / 100);
        const loadKey = `history-${paymentRow.paymentYear}-${String(paymentRow.weekNumber).padStart(2, "0")}-${String(loadIndex + 1).padStart(2, "0")}`;
        const displayLoadNumber = buildRelayLoadCode(loadSeed, `${loadKey}:load`);
        const completedAt = routeStops[routeStops.length - 1].departureIso;
        const isCanceled = options.historyStatus === "canceled";
        const segmentAssignments = isCanceled
            ? routeSegments.map(() => ({
                driverOption: "",
                tractorOption: "",
                tractorId: "",
                trailerId: ""
            }))
            : routeSegments.map((segment, segmentIndex) => ({
                driverOption: DRIVER_OPTIONS[(weekSeed + loadIndex + segmentIndex) % DRIVER_OPTIONS.length],
                tractorOption: TRACTOR_OPTIONS[(weekSeed + loadIndex + segmentIndex) % TRACTOR_OPTIONS.length],
                tractorId: TRACTOR_OPTIONS[(weekSeed + loadIndex + segmentIndex) % TRACTOR_OPTIONS.length],
                trailerId: TRAILER_OPTIONS[(weekSeed + loadIndex + segmentIndex) % TRAILER_OPTIONS.length]
            }));

        return {
            loadKey,
            loadId: displayLoadNumber,
            source: "history-schedule",
            status: "history",
            historyStatus: options.historyStatus || "completed",
            cancellationFee: isCanceled ? 175 : undefined,
            canceledAt: isCanceled ? pickupArrival.toISOString() : undefined,
            paymentYear: paymentRow.paymentYear,
            paymentWeekNumber: paymentRow.weekNumber,
            paymentWeekStartIso: paymentRow.workStartDate.toISOString(),
            paymentWeekEndIso: paymentRow.workEndDate.toISOString(),
            originCode: origin.code,
            originCity: origin.city,
            destinationCode: destination.code,
            destinationCity: destination.city,
            pickupDateTimeIso: routeStops[0].arrivalIso,
            pickupDepartureDateTimeIso: routeStops[0].departureIso,
            deliveryDateTimeIso: routeStops[routeStops.length - 1].arrivalIso,
            deliveryDepartureDateTimeIso: routeStops[routeStops.length - 1].departureIso,
            completedAt,
            domicile: "BWI",
            workType: facilities[0].code === facilities[facilities.length - 1].code ? "Round trip" : "One way",
            isRoundTrip: facilities[0].code === facilities[facilities.length - 1].code,
            program: "Spot",
            equipment: template.equipment,
            loadType: template.loadType,
            driverType: template.driverType,
            miles,
            duration: formatDuration(routeSegments.reduce((sum, segment) => sum + segment.durationMinutes, 0)),
            stops: routeStops.length,
            priceValue,
            price: formatMoney(priceValue),
            pricePerMile: `${formatMoney(priceValue / Math.max(miles, 1))}/mi`,
            routeStops,
            routeSegments,
            segmentAssignments,
            driverOption: isCanceled ? "" : DRIVER_OPTIONS[(weekSeed + loadIndex) % DRIVER_OPTIONS.length],
            tractorOption: isCanceled ? "" : TRACTOR_OPTIONS[(weekSeed + loadIndex) % TRACTOR_OPTIONS.length],
            tractorId: isCanceled ? "" : TRACTOR_OPTIONS[(weekSeed + loadIndex) % TRACTOR_OPTIONS.length],
            trailerId: isCanceled ? "" : TRAILER_OPTIONS[(weekSeed + loadIndex) % TRAILER_OPTIONS.length],
            actualTimes,
            lateEvents,
            delayEvents: {}
        };
    }

    function buildHistoryTripsForPaymentRow(paymentRow) {
        const weekSeed = hashString(`${paymentRow.paymentYear}:${paymentRow.weekNumber}:history-count`);
        const weeklyCents = Math.round((Number(paymentRow.amountValue) || 0) * 100);
        const cancellationCount = weeklyCents > 2500000 && weekSeed % 6 === 0 ? 1 : 0;
        const cancellationCents = cancellationCount * 17500;
        const completedPaymentCents = Math.max(0, weeklyCents - cancellationCents);
        const loadCount = getHistoryLoadCountForPayment(weekSeed, completedPaymentCents);
        const splitCents = splitPaymentCents(completedPaymentCents, weekSeed, loadCount);
        const completedTrips = splitCents.map((priceCents, loadIndex) => buildCompletedTrip(paymentRow, loadIndex, loadCount, priceCents));
        const canceledTrips = Array.from({ length: cancellationCount }, (_, cancelIndex) => (
            buildCompletedTrip(paymentRow, loadCount + cancelIndex, loadCount + cancellationCount, 17500, { historyStatus: "canceled" })
        ));

        return [
            ...completedTrips,
            ...canceledTrips
        ];
    }

    function buildAnnualHistoryTrips(paymentYear) {
        const yearKey = String(paymentYear);
        if (!annualHistoryTripCache.has(yearKey)) {
            annualHistoryTripCache.set(yearKey, getAnnualRows(paymentYear).flatMap(buildHistoryTripsForPaymentRow));
        }

        return annualHistoryTripCache.get(yearKey);
    }

    function getPreparedHistoryTripsAroundDate(date) {
        const year = startOfDay(date).getFullYear();
        return [year - 1, year, year + 1].flatMap(buildAnnualHistoryTrips);
    }

    function getDateDrivenPaymentYear(weekStartDate) {
        return getWeekStartSunday(weekStartDate).getFullYear();
    }

    function isFutureOrCurrentHistoryWeek(weekStartDate, today = new Date()) {
        return getWeekStartSunday(weekStartDate).getTime() >= getWeekStartSunday(today).getTime();
    }

    function getHistoryTripsForWeek(weekStartDate) {
        const weekStart = getWeekStartSunday(weekStartDate);
        if (isFutureOrCurrentHistoryWeek(weekStart)) {
            return [];
        }

        const weekEnd = addDays(weekStart, 6);
        const startTime = weekStart.getTime();
        const endTime = addDays(weekEnd, 1).getTime();
        const targetPaymentYear = getDateDrivenPaymentYear(weekStart);

        return getPreparedHistoryTripsAroundDate(weekStart)
            .filter((trip) => {
                const tripWeekStart = new Date(trip.paymentWeekStartIso).getTime();
                return trip.paymentYear === targetPaymentYear
                    && tripWeekStart >= startTime
                    && tripWeekStart < endTime;
            });
    }

    function getLastSixWeeksHistoryTrips(date) {
        const currentWeekStart = getWeekStartSunday(date);
        const rangeStart = addDays(currentWeekStart, -42);
        const rangeEnd = currentWeekStart;
        const startTime = rangeStart.getTime();
        const endTime = rangeEnd.getTime();

        return getPreparedHistoryTripsAroundDate(date)
            .filter((trip) => {
                const tripWeekStartDate = new Date(trip.paymentWeekStartIso);
                const tripWeekStart = tripWeekStartDate.getTime();
                return trip.paymentYear === getDateDrivenPaymentYear(tripWeekStartDate)
                    && tripWeekStart >= startTime
                    && tripWeekStart < endTime;
            });
    }

    function getWeekRangeForDate(date) {
        const weekStart = getWeekStartSunday(date);
        return {
            weekStart,
            weekEnd: addDays(weekStart, 6)
        };
    }

    window.AmazonDemoTripHistorySchedule = {
        HISTORY_WEEKS_PER_YEAR,
        buildAnnualHistoryTrips,
        getPreparedHistoryTripsAroundDate,
        getHistoryTripsForWeek,
        getLastSixWeeksHistoryTrips,
        getWeekRangeForDate,
        getDateDrivenPaymentYear,
        isFutureOrCurrentHistoryWeek
    };
}());
