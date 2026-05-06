document.addEventListener("DOMContentLoaded", () => {
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const DASHBOARD_BALTIMORE_ORIGIN = "Baltimore, MD";
    const DASHBOARD_BALTIMORE_BASE_LOADS = 100;
    const TRAILER_REQUIRED_EQUIPMENT_LABEL = "53' Required";
    const LEGACY_TRAILER_REQUIRED_EQUIPMENT_LABEL = "Trailer Required";
    const CARRIER_TRAILER_NUMBER_MAX_LENGTH = 8;
    const ON_TIME_ORIGIN_WEIGHT = 0.375;
    const ON_TIME_DESTINATION_WEIGHT = 0.625;
    const PERFECT_SCORE = 100;
    const paymentSchedule = window.AmazonDemoPaymentSchedule;
    const tripHistorySchedule = window.AmazonDemoTripHistorySchedule;
    const GRADE_THRESHOLDS = [
        { min: 99.9, grade: "A+" },
        { min: 98, grade: "A" },
        { min: 95, grade: "B+" },
        { min: 90, grade: "B" },
        { min: 80, grade: "C+" },
        { min: 70, grade: "C" },
        { min: 60, grade: "D+" },
        { min: 50, grade: "D" },
        { min: 0.0001, grade: "F" }
    ];

    const performanceWindow = document.getElementById("dashboard-performance-window");
    const overallScore = document.getElementById("dashboard-overall-score");
    const onTimeScore = document.getElementById("dashboard-on-time-score");
    const acceptanceScore = document.getElementById("dashboard-acceptance-score");
    const appUsageScore = document.getElementById("dashboard-app-usage-score");
    const disruptionFreeScore = document.getElementById("dashboard-disruption-free-score");
    const attentionUpcoming = document.getElementById("dashboard-attention-upcoming");
    const attentionInTransit = document.getElementById("dashboard-attention-in-transit");
    const attentionHistory = document.getElementById("dashboard-attention-history");
    const attentionViewUpcoming = document.getElementById("dashboard-view-upcoming");
    const attentionViewInTransit = document.getElementById("dashboard-view-in-transit");
    const attentionViewHistory = document.getElementById("dashboard-view-history");
    const addDriverButton = document.querySelector(".add-driver-btn");
    const addUserButton = document.querySelector(".add-user-btn");
    const releaseNotes = document.getElementById("dashboard-release-notes");
    const releaseNotesTitle = document.getElementById("dashboard-release-notes-title");
    const releaseNotesClose = document.getElementById("dashboard-release-notes-close");
    const paymentsWindow = document.getElementById("dashboard-payments-window");
    const paymentsYtd = document.getElementById("dashboard-payments-ytd");
    const paymentsNetBalance = document.getElementById("dashboard-payments-net-balance");
    const baltimoreLoadCount = document.getElementById("dashboard-baltimore-load-count");
    let paymentsChart = null;

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

    function getWeekSinceYearStart(date) {
        const safeDate = startOfDay(date);
        const yearStart = new Date(safeDate.getFullYear(), 0, 1);
        const diffDays = Math.floor((safeDate.getTime() - yearStart.getTime()) / 86400000);
        return Math.floor(diffDays / 7) + 1;
    }

    function formatDateLabel(date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatReleaseNotesLabel(date) {
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatPercent(value) {
        return `${Math.max(0, Math.min(100, Number(value) || 0)).toFixed(1)}%`;
    }

    function formatMoney(value) {
        const amount = Number(value) || 0;
        return amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function loadBookedTrips() {
        try {
            return JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || "[]");
        } catch (error) {
            console.warn("Unable to read dashboard trip performance.", error);
            return [];
        }
    }

    function isRejectedHistoryTrip(trip) {
        return (trip?.status || "upcoming") === "history"
            && (((trip?.historyStatus || "").toLowerCase() === "rejected") || Boolean(trip?.rejection?.reason));
    }

    function isCanceledHistoryTrip(trip) {
        const status = String(trip?.historyStatus || "").toLowerCase();
        return (trip?.status || "upcoming") === "history"
            && (status === "canceled" || status === "cancelled" || Boolean(trip?.canceledAt));
    }

    function getDashboardPerformanceRange(today = new Date()) {
        const rangeEnd = startOfDay(today);
        const rangeStart = addDays(rangeEnd, -41);
        return {
            rangeStart,
            rangeEnd
        };
    }

    function getTripPerformanceDate(trip) {
        return parseTripDate(trip?.completedAt, null)
            || parseTripDate(trip?.deliveryDepartureDateTimeIso, null)
            || parseTripDate(trip?.deliveryDateTimeIso, trip?.deliveryWindow)
            || parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow);
    }

    function isTripInDashboardPerformanceRange(trip, today = new Date()) {
        const tripDate = getTripPerformanceDate(trip);
        if (!(tripDate instanceof Date) || Number.isNaN(tripDate.getTime())) {
            return false;
        }

        const range = getDashboardPerformanceRange(today);
        const rangeEndExclusive = addDays(range.rangeEnd, 1);
        return tripDate.getTime() >= range.rangeStart.getTime()
            && tripDate.getTime() < rangeEndExclusive.getTime();
    }

    function getDashboardPerformanceTrips(today = new Date()) {
        const generatedTrips = tripHistorySchedule?.getLastSixWeeksHistoryTrips
            ? tripHistorySchedule.getLastSixWeeksHistoryTrips(today)
            : [];
        const generatedKeys = new Set(generatedTrips.map((trip) => trip.loadKey));
        const bookedHistoryTrips = loadBookedTrips()
            .filter((trip) => (trip.status || "upcoming") === "history")
            .filter((trip) => !generatedKeys.has(trip.loadKey))
            .filter((trip) => isTripInDashboardPerformanceRange(trip, today));

        return [
            ...generatedTrips,
            ...bookedHistoryTrips
        ];
    }

    function getTripStopCount(trip) {
        if (Array.isArray(trip?.routeStops) && trip.routeStops.length >= 2) {
            return trip.routeStops.length;
        }

        if (Array.isArray(trip?.routeSegments) && trip.routeSegments.length) {
            return trip.routeSegments.length + 1;
        }

        return 2;
    }

    function isTrailerRequiredTrip(trip) {
        const equipmentLabels = [
            trip?.equipment,
            trip?.displayEquipment
        ].map((label) => String(label || "").trim());

        return equipmentLabels.some((label) => (
            label === TRAILER_REQUIRED_EQUIPMENT_LABEL
            || label === LEGACY_TRAILER_REQUIRED_EQUIPMENT_LABEL
            || label.includes("Required")
        ));
    }

    function normalizeCarrierTrailerNumber(value) {
        return String(value || "")
            .replace(/[^a-z0-9]/gi, "")
            .toUpperCase()
            .slice(0, CARRIER_TRAILER_NUMBER_MAX_LENGTH);
    }

    function hasRequiredCarrierTrailerNumber(trip, assignment = null) {
        if (!isTrailerRequiredTrip(trip)) {
            return true;
        }

        return Boolean(normalizeCarrierTrailerNumber(assignment?.trailerId || trip?.trailerId));
    }

    function buildTripEventKey(stopNumber, phase) {
        return `stop${stopNumber}${phase}`;
    }

    function parseTripEventKey(eventKey) {
        const match = String(eventKey || "").match(/^stop(\d+)(Arrival|Departure)$/);
        if (!match) {
            return null;
        }

        return {
            stopNumber: Number(match[1]),
            stopIndex: Number(match[1]) - 1,
            phase: match[2]
        };
    }

    function getStopCountTimeSequence(stopCount) {
        const sequence = [];
        for (let stopNumber = 1; stopNumber <= stopCount; stopNumber += 1) {
            sequence.push(buildTripEventKey(stopNumber, "Arrival"));
            sequence.push(buildTripEventKey(stopNumber, "Departure"));
        }
        return sequence;
    }

    function getLegacyTripEventKey(eventKey, stopCount) {
        if (stopCount !== 2) {
            return "";
        }

        switch (eventKey) {
            case "stop1Arrival":
                return "pickupArrival";
            case "stop1Departure":
                return "pickupDeparture";
            case "stop2Arrival":
                return "deliveryArrival";
            case "stop2Departure":
                return "deliveryDeparture";
            default:
                return "";
        }
    }

    function getTripEventValue(trip, collectionName, eventKey) {
        const record = trip?.[collectionName] || {};
        if (record[eventKey] !== undefined) {
            return record[eventKey];
        }

        const legacyKey = getLegacyTripEventKey(eventKey, getTripStopCount(trip));
        return legacyKey ? record[legacyKey] : undefined;
    }

    function isTripLateEvent(trip, eventKey) {
        return getTripEventValue(trip, "lateEvents", eventKey) === true;
    }

    function hasTripDelayReport(trip, eventKey) {
        return Boolean(getTripEventValue(trip, "delayEvents", eventKey));
    }

    function getTripPerformanceSegments(trip) {
        const stopCount = getTripStopCount(trip);
        const routeSegments = Array.isArray(trip?.routeSegments) ? trip.routeSegments : [];
        const fallbackMiles = Math.max(0, Number(trip?.miles) || 0);

        if (routeSegments.length) {
            return routeSegments.map((segment, segmentIndex) => ({
                index: segmentIndex,
                fromNumber: Number(segment.fromNumber) || segmentIndex + 1,
                toNumber: Number(segment.toNumber) || segmentIndex + 2,
                miles: Math.max(0, Number(segment.miles) || (fallbackMiles / Math.max(1, routeSegments.length)))
            }));
        }

        return [{
            index: 0,
            fromNumber: 1,
            toNumber: stopCount,
            miles: fallbackMiles
        }];
    }

    function getSegmentUnreportedLateDepartureEvents(trip, segment) {
        const stopCount = getTripStopCount(trip);
        const departureKeys = [buildTripEventKey(segment.fromNumber, "Departure")];
        if (segment.toNumber === stopCount) {
            departureKeys.push(buildTripEventKey(segment.toNumber, "Departure"));
        }
        return departureKeys.filter((eventKey) => isTripLateEvent(trip, eventKey) && !hasTripDelayReport(trip, eventKey));
    }

    function buildPerformanceLegs(trips) {
        return trips.flatMap((trip) => {
            if (isCanceledHistoryTrip(trip)) {
                return [];
            }

            const rejected = isRejectedHistoryTrip(trip);
            return getTripPerformanceSegments(trip).map((segment) => ({
                rejected,
                originLate: !rejected && isTripLateEvent(trip, buildTripEventKey(segment.fromNumber, "Arrival")),
                destinationLate: !rejected && isTripLateEvent(trip, buildTripEventKey(segment.toNumber, "Arrival")),
                disrupted: !rejected && getSegmentUnreportedLateDepartureEvents(trip, segment).length > 0
            }));
        });
    }

    function hasUnreportedLateDeparture(trip) {
        return getTripPerformanceSegments(trip).some((segment) => getSegmentUnreportedLateDepartureEvents(trip, segment).length > 0);
    }

    function addMinutes(date, minutes) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return null;
        }

        const nextDate = new Date(date);
        nextDate.setMinutes(nextDate.getMinutes() + minutes);
        return nextDate;
    }

    function parseTripDate(isoValue, fallbackLabel) {
        if (isoValue) {
            const parsed = new Date(isoValue);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        if (!fallbackLabel) {
            return null;
        }

        const fallbackDate = new Date(fallbackLabel);
        return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
    }

    function isHiddenUpcomingBlockTrip(trip, now = new Date()) {
        const tripStatus = trip?.status || "upcoming";
        if (!trip?.isBlockLoad || tripStatus !== "upcoming") {
            return false;
        }

        const revealAt = parseTripDate(trip?.blockRevealAtIso, null)
            || addMinutes(parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow), -900);

        return revealAt instanceof Date
            && !Number.isNaN(revealAt.getTime())
            && now.getTime() < revealAt.getTime();
    }

    function getTripScheduledDate(trip, eventKey) {
        const parsedEvent = parseTripEventKey(eventKey);
        const routeStops = Array.isArray(trip?.routeStops) ? trip.routeStops : [];
        if (parsedEvent && routeStops.length) {
            const stop = routeStops[Math.min(parsedEvent.stopIndex, routeStops.length - 1)];
            const isoValue = parsedEvent.phase === "Arrival" ? stop?.arrivalIso : stop?.departureIso;
            const parsedDate = parseTripDate(isoValue, null);
            if (parsedDate) {
                return parsedDate;
            }
        }

        const pickupDate = parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow);
        const deliveryDate = parseTripDate(trip?.deliveryDateTimeIso, trip?.deliveryWindow);

        const scheduleMap = {
            pickupArrival: pickupDate,
            pickupDeparture: parseTripDate(trip?.pickupDepartureDateTimeIso, null) || addMinutes(pickupDate, 30),
            deliveryArrival: deliveryDate,
            deliveryDeparture: parseTripDate(trip?.deliveryDepartureDateTimeIso, null) || addMinutes(deliveryDate, 30)
        };

        const scheduleKey = getLegacyTripEventKey(eventKey, getTripStopCount(trip)) || eventKey;
        return scheduleMap[scheduleKey] || pickupDate;
    }

    function isTripEventOverdueWithoutResponse(trip, eventKey, now = new Date()) {
        const tripStatus = trip?.status || "upcoming";
        if (tripStatus === "history" || isRejectedHistoryTrip(trip)) {
            return false;
        }

        const scheduledDate = getTripScheduledDate(trip, eventKey);
        const actualDate = parseTripDate(getTripEventValue(trip, "actualTimes", eventKey), null);
        const delay = getTripEventValue(trip, "delayEvents", eventKey);

        return scheduledDate instanceof Date
            && !Number.isNaN(scheduledDate.getTime())
            && scheduledDate.getTime() < now.getTime()
            && !actualDate
            && !delay;
    }

    function tripHasTimingAttention(trip) {
        if (isHiddenUpcomingBlockTrip(trip)) {
            return false;
        }

        return getStopCountTimeSequence(getTripStopCount(trip))
            .some((eventKey) => isTripEventOverdueWithoutResponse(trip, eventKey));
    }

    function tripNeedsAssignmentAttention(trip) {
        if (isHiddenUpcomingBlockTrip(trip)) {
            return false;
        }

        if (!trip) {
            return false;
        }

        const segmentCount = getTripPerformanceSegments(trip).length;
        if (segmentCount <= 1) {
            return !trip.driverOption
                || !trip.tractorOption
                || !hasRequiredCarrierTrailerNumber(trip);
        }

        const segmentAssignments = Array.isArray(trip.segmentAssignments) ? trip.segmentAssignments : [];
        return Array.from({ length: segmentCount }).some((_, segmentIndex) => {
            const assignment = segmentAssignments[segmentIndex] || {};
            return !(assignment.driverOption || trip.driverOption)
                || !(assignment.tractorOption || trip.tractorOption)
                || !hasRequiredCarrierTrailerNumber(trip, assignment);
        });
    }

    function renderBaltimoreLoadCount() {
        if (!baltimoreLoadCount) {
            return;
        }

        const bookedBaltimoreKeys = new Set(
            loadBookedTrips()
                .filter((trip) => (trip?.originMarket || trip?.originCity) === DASHBOARD_BALTIMORE_ORIGIN)
                .map((trip) => trip.loadKey || trip.loadId)
                .filter(Boolean)
        );
        const remainingLoads = Math.max(0, DASHBOARD_BALTIMORE_BASE_LOADS - bookedBaltimoreKeys.size);
        baltimoreLoadCount.textContent = String(remainingLoads);
    }

    function getTripAttentionSeverityRank(trip) {
        return tripHasTimingAttention(trip) ? 0 : 1;
    }

    function getTripPickupSortTime(trip) {
        const pickupDate = parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow);
        return pickupDate?.getTime?.() || Number.MAX_SAFE_INTEGER;
    }

    function getAttentionTripsByStatus(status) {
        return loadBookedTrips()
            .filter((trip) => (
                (trip.status || "upcoming") === status
                && (tripNeedsAssignmentAttention(trip) || tripHasTimingAttention(trip))
            ))
            .sort((left, right) => {
                const severityDelta = getTripAttentionSeverityRank(left) - getTripAttentionSeverityRank(right);
                if (severityDelta !== 0) {
                    return severityDelta;
                }

                return getTripPickupSortTime(left) - getTripPickupSortTime(right);
            });
    }

    function openAttentionTrip(status) {
        const targetTrip = getAttentionTripsByStatus(status)[0];
        if (targetTrip?.loadKey) {
            window.location.href = `trips.html?tripTab=${encodeURIComponent(status)}&loadKey=${encodeURIComponent(targetTrip.loadKey)}`;
            return;
        }

        window.location.href = `trips.html?tripTab=${encodeURIComponent(status)}`;
    }

    function getGradeForScore(score) {
        const match = GRADE_THRESHOLDS.find((entry) => score >= entry.min);
        return match ? match.grade : "F";
    }

    function getPaymentSummaryTotals(today) {
        if (paymentSchedule?.getPaymentSummaryTotals) {
            return paymentSchedule.getPaymentSummaryTotals(today);
        }

        return {
            currentYear: today.getFullYear(),
            ytdPayments: 0
        };
    }

    function buildLastSixMonthsSeries(today) {
        if (paymentSchedule?.buildLastSixMonthsSeries) {
            return paymentSchedule.buildLastSixMonthsSeries(today, (date) => date.toLocaleDateString("en-US", { month: "short" }));
        }

        return [];
    }

    function computeDashboardPerformance() {
        const historyTrips = getDashboardPerformanceTrips(new Date());
        const performanceLegs = buildPerformanceLegs(historyTrips);
        const completedLegs = performanceLegs.filter((leg) => !leg.rejected);
        const rejectedLoads = performanceLegs.filter((leg) => leg.rejected).length;
        const completedLoads = completedLegs.length;
        const lateOriginLoads = completedLegs.filter((leg) => leg.originLate).length;
        const lateDestinationLoads = completedLegs.filter((leg) => leg.destinationLate).length;
        const disruptedLoads = completedLegs.filter((leg) => leg.disrupted).length;
        const acceptanceDenominator = completedLoads + rejectedLoads;

        const originRate = completedLoads
            ? ((completedLoads - lateOriginLoads) / completedLoads) * 100
            : PERFECT_SCORE;
        const destinationRate = completedLoads
            ? ((completedLoads - lateDestinationLoads) / completedLoads) * 100
            : PERFECT_SCORE;
        const totalOnTime = (originRate * ON_TIME_ORIGIN_WEIGHT) + (destinationRate * ON_TIME_DESTINATION_WEIGHT);
        const acceptance = acceptanceDenominator
            ? (completedLoads / acceptanceDenominator) * 100
            : PERFECT_SCORE;
        const appUsage = PERFECT_SCORE;
        const disruptionFree = completedLoads
            ? ((completedLoads - disruptedLoads) / completedLoads) * 100
            : PERFECT_SCORE;
        const carrierScore = Math.min(totalOnTime, acceptance, appUsage, disruptionFree);

        return {
            previewWeek: getWeekSinceYearStart(new Date()) + 1,
            totalOnTime,
            acceptance,
            appUsage,
            disruptionFree,
            carrierScore,
            grade: getGradeForScore(carrierScore)
        };
    }

    function renderTripsNeedingAttention() {
        const counts = {
            upcoming: getAttentionTripsByStatus("upcoming").length,
            inTransit: getAttentionTripsByStatus("in-transit").length,
            history: 0
        };

        [
            [attentionUpcoming, counts.upcoming],
            [attentionInTransit, counts.inTransit],
            [attentionHistory, counts.history]
        ].forEach(([element, value]) => {
            if (!element) {
                return;
            }

            element.textContent = String(value);
            element.classList.toggle("has-attention", value > 0);
        });

        if (attentionViewUpcoming) {
            attentionViewUpcoming.disabled = counts.upcoming === 0;
        }

        if (attentionViewInTransit) {
            attentionViewInTransit.disabled = counts.inTransit === 0;
        }
    }

    function renderDashboardPerformance() {
        const today = new Date();
        const rangeStart = addDays(startOfDay(today), -41);
        const rangeEnd = startOfDay(today);
        const performance = computeDashboardPerformance();

        if (releaseNotesTitle) {
            releaseNotesTitle.textContent = `Release Notes ${formatReleaseNotesLabel(today)}`;
        }

        if (performanceWindow) {
            performanceWindow.textContent = `Last 6 active weeks | Preview week ${performance.previewWeek} | ${formatDateLabel(rangeStart)} - ${formatDateLabel(rangeEnd)}`;
        }

        if (overallScore) {
            overallScore.textContent = `Overall Score: ${performance.grade} ${formatPercent(performance.carrierScore)}`;
        }

        if (onTimeScore) {
            onTimeScore.textContent = `On time: ${formatPercent(performance.totalOnTime)}`;
        }

        if (acceptanceScore) {
            acceptanceScore.textContent = `Acceptance: ${formatPercent(performance.acceptance)}`;
        }

        if (appUsageScore) {
            appUsageScore.textContent = `App Usage: ${formatPercent(performance.appUsage)}`;
        }

        if (disruptionFreeScore) {
            disruptionFreeScore.textContent = `Disruption-free: ${formatPercent(performance.disruptionFree)}`;
        }
    }

    function renderDashboardPayments() {
        const today = new Date();
        const paymentSummaryTotals = getPaymentSummaryTotals(today);
        const monthSeries = buildLastSixMonthsSeries(today);
        const firstMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        if (paymentsWindow) {
            paymentsWindow.textContent = `Last 6 months payments | ${formatDateLabel(firstMonth)} - ${formatDateLabel(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0))}`;
        }

        if (paymentsYtd) {
            paymentsYtd.innerHTML = `${formatMoney(paymentSummaryTotals.ytdPayments)} <span>(${paymentSummaryTotals.currentYear} YTD Gross)</span>`;
        }

        if (paymentsNetBalance) {
            paymentsNetBalance.textContent = "$0.00 (Net Balance)";
        }

        if (typeof Chart === "undefined") {
            return;
        }

        const chartElement = document.getElementById("paymentsChart");
        if (!chartElement) {
            return;
        }

        const ctx = chartElement.getContext("2d");
        const chartData = {
            labels: monthSeries.map((month) => month.label),
            datasets: [{
                label: "Payments",
                data: monthSeries.map((month) => Number(month.total.toFixed(2))),
                backgroundColor: "#757575"
            }]
        };

        if (paymentsChart) {
            paymentsChart.data = chartData;
            paymentsChart.update();
            return;
        }

        paymentsChart = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (releaseNotes && releaseNotesClose) {
        releaseNotesClose.addEventListener("click", () => {
            releaseNotes.style.display = "none";
        });
    }

    if (addDriverButton) {
        addDriverButton.addEventListener("click", () => {
            window.location.href = "driverroster.html";
        });
    }

    if (addUserButton) {
        addUserButton.addEventListener("click", () => {
            window.location.href = "siteusers.html";
        });
    }

    if (attentionViewUpcoming) {
        attentionViewUpcoming.addEventListener("click", () => {
            openAttentionTrip("upcoming");
        });
    }

    if (attentionViewInTransit) {
        attentionViewInTransit.addEventListener("click", () => {
            openAttentionTrip("in-transit");
        });
    }

    if (attentionViewHistory) {
        attentionViewHistory.addEventListener("click", () => {
            window.location.href = "trips.html?tripTab=history";
        });
    }

    renderDashboardPerformance();
    renderTripsNeedingAttention();
    renderBaltimoreLoadCount();
    renderDashboardPayments();
    window.addEventListener("focus", renderDashboardPerformance);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            renderDashboardPerformance();
            renderTripsNeedingAttention();
            renderBaltimoreLoadCount();
            renderDashboardPayments();
        }
    });
    window.addEventListener("focus", renderTripsNeedingAttention);
    window.addEventListener("focus", renderBaltimoreLoadCount);
    window.addEventListener("focus", renderDashboardPayments);
});
