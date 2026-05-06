document.addEventListener("DOMContentLoaded", () => {
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const tripHistorySchedule = window.AmazonDemoTripHistorySchedule;
    const PERFORMANCE_RANGE_DAYS = 41;
    const ON_TIME_ORIGIN_WEIGHT = 0.375;
    const ON_TIME_DESTINATION_WEIGHT = 0.625;
    const PERFECT_SCORE = 100;
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

    const tabButtons = Array.from(document.querySelectorAll(".scorecard-tabs .tab[data-target]"));
    const panes = Array.from(document.querySelectorAll(".scorecard-pane"));
    const performanceTitle = document.getElementById("scorecard-performance-title");
    const previewToggle = document.getElementById("scorecard-preview-toggle");
    const previewLabel = document.getElementById("scorecard-preview-label");
    const noticeText = document.getElementById("scorecard-notice-text");
    const weekLabel = document.getElementById("scorecard-week-label");
    const weekPrevButton = document.getElementById("scorecard-week-prev");
    const weekNextButton = document.getElementById("scorecard-week-next");
    const rangeLabels = Array.from(document.querySelectorAll("[data-scorecard-range]"));
    const driverSearchInput = document.getElementById("scorecard-driver-search-input");
    const driverTableBody = document.getElementById("scorecard-driver-table-body");

    const gradeLetter = document.getElementById("scorecard-grade-letter");
    const gradePercent = document.getElementById("scorecard-grade-percent");
    const summaryOnTime = document.getElementById("scorecard-summary-on-time");
    const summaryOnTimeDetail = document.getElementById("scorecard-summary-on-time-detail");
    const summaryAcceptance = document.getElementById("scorecard-summary-acceptance");
    const summaryAcceptanceDetail = document.getElementById("scorecard-summary-acceptance-detail");
    const summaryAppUsage = document.getElementById("scorecard-summary-app-usage");
    const summaryAppUsageDetail = document.getElementById("scorecard-summary-app-usage-detail");
    const summaryDisruptionFree = document.getElementById("scorecard-summary-disruption-free");
    const summaryDisruptionFreeDetail = document.getElementById("scorecard-summary-disruption-free-detail");

    const onTimeGauge = document.getElementById("scorecard-gauge-on-time");
    const acceptanceGauge = document.getElementById("scorecard-gauge-acceptance");
    const appUsageGauge = document.getElementById("scorecard-gauge-app-usage");
    const disruptionGauge = document.getElementById("scorecard-gauge-disruption-free");

    const onTimeTotal = document.getElementById("scorecard-on-time-total");
    const onTimeOrigin = document.getElementById("scorecard-on-time-origin");
    const onTimeDestination = document.getElementById("scorecard-on-time-destination");
    const acceptanceTotal = document.getElementById("scorecard-acceptance-total");
    const acceptanceRejectedBlocks = document.getElementById("scorecard-acceptance-rejected-blocks");
    const acceptanceRejectedLoads = document.getElementById("scorecard-acceptance-rejected-loads");
    const appUsageTotal = document.getElementById("scorecard-app-usage-total");
    const appStepsCompletion = document.getElementById("scorecard-app-steps-completion");
    const locationAvailability = document.getElementById("scorecard-location-availability");
    const disruptionTotal = document.getElementById("scorecard-disruption-free-total");
    const disruptionCount = document.getElementById("scorecard-disruption-count");
    const completedLoadsCount = document.getElementById("scorecard-completed-loads-count");

    let driverSearchTerm = "";
    let previewEnabled = Boolean(previewToggle?.checked);

    function activatePane(targetId) {
        panes.forEach((pane) => {
            pane.classList.toggle("is-hidden", pane.id !== targetId);
        });

        tabButtons.forEach((button) => {
            const isActive = button.dataset.target === targetId;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    }

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

    function formatRangeLabel(startDate, endDate) {
        return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function formatPercent(value) {
        return `${clamp(Number(value) || 0, 0, 100).toFixed(1)}%`;
    }

    function formatMiles(value) {
        return `${(Number(value) || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} mi`;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function parseTrips() {
        try {
            return JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || "[]");
        } catch (error) {
            console.warn("Unable to read scorecard trip state.", error);
            return [];
        }
    }

    function getTripPerformanceDate(trip) {
        return parseTripDate(trip?.completedAt, null)
            || parseTripDate(trip?.deliveryDepartureDateTimeIso, null)
            || parseTripDate(trip?.deliveryDateTimeIso, trip?.deliveryWindow)
            || parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow);
    }

    function isTripInLastSixWeeks(trip, today = new Date()) {
        const tripDate = getTripPerformanceDate(trip);
        if (!(tripDate instanceof Date) || Number.isNaN(tripDate.getTime())) {
            return false;
        }

        const range = getViewRange(today);
        const rangeEndExclusive = addDays(range.rangeEnd, 1);
        return tripDate.getTime() >= range.rangeStart.getTime()
            && tripDate.getTime() < rangeEndExclusive.getTime();
    }

    function getGeneratedHistoryTripsForScorecard(today = new Date()) {
        if (!tripHistorySchedule?.getLastSixWeeksHistoryTrips) {
            return [];
        }

        return tripHistorySchedule.getLastSixWeeksHistoryTrips(today);
    }

    function getScorecardHistoryTrips(today = new Date()) {
        const generatedTrips = getGeneratedHistoryTripsForScorecard(today);
        const generatedKeys = new Set(generatedTrips.map((trip) => trip.loadKey));
        const bookedTrips = parseTrips()
            .filter((trip) => (trip.status || "upcoming") === "history")
            .filter((trip) => !generatedKeys.has(trip.loadKey))
            .filter((trip) => isTripInLastSixWeeks(trip, today));

        return [
            ...generatedTrips,
            ...bookedTrips
        ];
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

    function getTripStopCount(trip) {
        if (Array.isArray(trip?.routeStops) && trip.routeStops.length >= 2) {
            return trip.routeStops.length;
        }

        if (Array.isArray(trip?.routeSegments) && trip.routeSegments.length) {
            return trip.routeSegments.length + 1;
        }

        return 2;
    }

    function buildTripEventKey(stopNumber, phase) {
        return `stop${stopNumber}${phase}`;
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

    function getSegmentDriverName(trip, segmentIndex) {
        const segmentAssignment = Array.isArray(trip?.segmentAssignments)
            ? trip.segmentAssignments[segmentIndex]
            : null;
        return normalizeDriverName(segmentAssignment?.driverOption)
            || normalizeDriverName(trip?.driverOption)
            || "Unassigned";
    }

    function getSegmentUnreportedLateDepartureEvents(trip, segment) {
        const stopCount = getTripStopCount(trip);
        const departureKeys = [
            buildTripEventKey(segment.fromNumber, "Departure")
        ];

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
                trip,
                segment,
                rejected,
                driverName: getSegmentDriverName(trip, segment.index),
                miles: segment.miles,
                originLate: !rejected && isTripLateEvent(trip, buildTripEventKey(segment.fromNumber, "Arrival")),
                destinationLate: !rejected && isTripLateEvent(trip, buildTripEventKey(segment.toNumber, "Arrival")),
                unreportedLateDepartureEvents: rejected ? [] : getSegmentUnreportedLateDepartureEvents(trip, segment)
            }));
        });
    }

    function getUnreportedLateDepartureEvents(trip) {
        const uniqueEvents = new Set();
        getTripPerformanceSegments(trip).forEach((segment) => {
            getSegmentUnreportedLateDepartureEvents(trip, segment).forEach((eventKey) => uniqueEvents.add(eventKey));
        });
        return Array.from(uniqueEvents);
    }

    function hasUnreportedLateDeparture(trip) {
        return getUnreportedLateDepartureEvents(trip).length > 0;
    }

    function normalizeDriverName(value) {
        return String(value || "").replace(/^\d+\.\s*/, "").trim();
    }

    function getHistoryTrips() {
        return getScorecardHistoryTrips();
    }

    function getCompletedHistoryTrips() {
        return getHistoryTrips().filter((trip) => !isRejectedHistoryTrip(trip) && !isCanceledHistoryTrip(trip));
    }

    function getGradeForScore(score) {
        const match = GRADE_THRESHOLDS.find((entry) => score >= entry.min);
        return match ? match.grade : "F";
    }

    function buildDriverRows(trips) {
        const groupedDrivers = new Map();

        buildPerformanceLegs(trips).filter((leg) => !leg.rejected).forEach((leg) => {
            const driverName = leg.driverName;
            const currentDriver = groupedDrivers.get(driverName) || {
                driverName,
                legs: 0,
                miles: 0,
                originOnTime: 0,
                destinationOnTime: 0
            };

            currentDriver.legs += 1;
            currentDriver.miles += leg.miles;
            currentDriver.originOnTime += leg.originLate ? 0 : 1;
            currentDriver.destinationOnTime += leg.destinationLate ? 0 : 1;
            groupedDrivers.set(driverName, currentDriver);
        });

        return Array.from(groupedDrivers.values())
            .map((row) => {
                const originRate = row.legs ? (row.originOnTime / row.legs) * 100 : PERFECT_SCORE;
                const destinationRate = row.legs ? (row.destinationOnTime / row.legs) * 100 : PERFECT_SCORE;
                const onTimeScore = (originRate * ON_TIME_ORIGIN_WEIGHT) + (destinationRate * ON_TIME_DESTINATION_WEIGHT);

                return {
                    ...row,
                    onTimeScore
                };
            })
            .sort((left, right) => left.driverName.localeCompare(right.driverName));
    }

    function computeScorecardMetrics(trips) {
        const performanceLegs = buildPerformanceLegs(trips);
        const completedLegs = performanceLegs.filter((leg) => !leg.rejected);
        const rejectedLoads = performanceLegs.filter((leg) => leg.rejected).length;
        const completedLoads = completedLegs.length;
        const lateOriginLoads = completedLegs.filter((leg) => leg.originLate).length;
        const lateDestinationLoads = completedLegs.filter((leg) => leg.destinationLate).length;
        const disruptedLoads = completedLegs.filter((leg) => leg.unreportedLateDepartureEvents.length).length;
        const unreportedLateDepartureEvents = completedLegs.reduce(
            (total, leg) => total + leg.unreportedLateDepartureEvents.length,
            0
        );
        const acceptanceDenominator = completedLoads + rejectedLoads;

        const originRate = completedLoads
            ? ((completedLoads - lateOriginLoads) / completedLoads) * 100
            : PERFECT_SCORE;
        const destinationRate = completedLoads
            ? ((completedLoads - lateDestinationLoads) / completedLoads) * 100
            : PERFECT_SCORE;
        const onTimeScore = (originRate * ON_TIME_ORIGIN_WEIGHT) + (destinationRate * ON_TIME_DESTINATION_WEIGHT);
        const acceptanceScore = acceptanceDenominator
            ? (completedLoads / acceptanceDenominator) * 100
            : PERFECT_SCORE;
        const appUsageScore = PERFECT_SCORE;
        const disruptionFreeScore = completedLoads
            ? ((completedLoads - disruptedLoads) / completedLoads) * 100
            : PERFECT_SCORE;
        const carrierScore = Math.min(onTimeScore, acceptanceScore, appUsageScore, disruptionFreeScore);

        return {
            completedLoads,
            rejectedLoads,
            lateOriginLoads,
            lateDestinationLoads,
            disruptedLoads,
            unreportedLateDepartureEvents,
            onTimeScore,
            originRate,
            destinationRate,
            acceptanceScore,
            appUsageScore,
            disruptionFreeScore,
            carrierScore,
            grade: getGradeForScore(carrierScore)
        };
    }

    function setGaugeState(element, labelElement, score) {
        if (!element || !labelElement) return;

        const safeScore = clamp(score, 0, 100);
        element.style.setProperty("--scorecard-gauge-progress", safeScore.toFixed(1));
        labelElement.textContent = formatPercent(safeScore);
    }

    function renderDriverTable(trips) {
        if (!driverTableBody) return;

        const rows = buildDriverRows(trips).filter((row) => row.driverName.toLowerCase().includes(driverSearchTerm));

        if (!rows.length) {
            driverTableBody.innerHTML = `
                <tr class="scorecard-driver-empty-row">
                    <td colspan="5">No driver performance data yet for this view.</td>
                </tr>
            `;
            return;
        }

        driverTableBody.innerHTML = rows.map((row) => `
            <tr>
                <td><a href="#">${escapeHtml(row.driverName)}</a></td>
                <td>${formatPercent(row.onTimeScore)}</td>
                <td>${formatPercent(PERFECT_SCORE)}</td>
                <td>${row.legs}</td>
                <td style="text-align:right;">${formatMiles(row.miles)}</td>
            </tr>
        `).join("");
    }

    function getViewRange(today) {
        const rangeEnd = startOfDay(today);
        const rangeStart = addDays(rangeEnd, -PERFORMANCE_RANGE_DAYS);
        return {
            rangeStart,
            rangeEnd
        };
    }

    function renderPerformanceScorecard() {
        const today = new Date();
        const currentWeek = getWeekSinceYearStart(today);
        const nextWeek = currentWeek + 1;
        const targetWeek = previewEnabled ? nextWeek : currentWeek;
        const historyTrips = getHistoryTrips();
        const relevantTrips = getCompletedHistoryTrips();
        const metrics = computeScorecardMetrics(historyTrips);
        const range = getViewRange(today);

        if (performanceTitle) {
            performanceTitle.textContent = previewEnabled
                ? `Performance grade preview for week ${targetWeek}`
                : `Performance grade for week ${targetWeek}`;
        }

        if (previewLabel) {
            previewLabel.textContent = `Preview score for week ${nextWeek}`;
        }

        if (weekLabel) {
            weekLabel.textContent = `Week ${targetWeek}`;
        }

        if (weekPrevButton) {
            weekPrevButton.disabled = !previewEnabled;
        }

        if (weekNextButton) {
            weekNextButton.disabled = previewEnabled;
        }

        rangeLabels.forEach((element) => {
            element.textContent = formatRangeLabel(range.rangeStart, range.rangeEnd);
        });

        if (noticeText) {
            if (!previewEnabled) {
                noticeText.innerHTML = `<strong>Current week.</strong> You're viewing the live scorecard for week ${currentWeek}.`;
            } else if (historyTrips.length === 0 || metrics.carrierScore === PERFECT_SCORE) {
                noticeText.innerHTML = "<strong>No change.</strong> So far, your performance score for next week hasn't changed.";
            } else {
                const impactMessages = [];
                const lateEvents = metrics.lateOriginLoads + metrics.lateDestinationLoads;

                if (lateEvents) {
                    impactMessages.push(`${lateEvents} late arrival event${lateEvents === 1 ? "" : "s"} in History`);
                }

                if (metrics.rejectedLoads) {
                    impactMessages.push(`${metrics.rejectedLoads} rejected load leg${metrics.rejectedLoads === 1 ? "" : "s"} in History`);
                }

                if (metrics.unreportedLateDepartureEvents) {
                    impactMessages.push(`${metrics.unreportedLateDepartureEvents} unreported late departure event${metrics.unreportedLateDepartureEvents === 1 ? "" : "s"} in History`);
                }

                noticeText.innerHTML = `<strong>Preview updated.</strong> ${impactMessages.join(" and ")} ${impactMessages.length === 1 ? "is" : "are"} lowering next week's performance preview.`;
            }
        }

        if (gradeLetter) {
            gradeLetter.textContent = metrics.grade;
        }

        if (gradePercent) {
            gradePercent.textContent = formatPercent(metrics.carrierScore);
        }

        if (summaryOnTime) {
            summaryOnTime.textContent = formatPercent(metrics.onTimeScore);
        }

        if (summaryOnTimeDetail) {
            summaryOnTimeDetail.textContent = "37.5% origin / 62.5% destination";
        }

        if (summaryAcceptance) {
            summaryAcceptance.textContent = formatPercent(metrics.acceptanceScore);
        }

        if (summaryAcceptanceDetail) {
            summaryAcceptanceDetail.textContent = metrics.rejectedLoads
                ? `${metrics.rejectedLoads} rejected load leg${metrics.rejectedLoads === 1 ? "" : "s"} in preview`
                : "No rejected work";
        }

        if (summaryAppUsage) {
            summaryAppUsage.textContent = formatPercent(metrics.appUsageScore);
        }

        if (summaryAppUsageDetail) {
            summaryAppUsageDetail.textContent = "App compliance baseline";
        }

        if (summaryDisruptionFree) {
            summaryDisruptionFree.textContent = formatPercent(metrics.disruptionFreeScore);
        }

        if (summaryDisruptionFreeDetail) {
            summaryDisruptionFreeDetail.textContent = metrics.disruptedLoads
                ? `${metrics.disruptedLoads} load${metrics.disruptedLoads === 1 ? "" : "s"} had unreported late departures`
                : `${metrics.completedLoads} completed load leg${metrics.completedLoads === 1 ? "" : "s"} tracked`;
        }

        setGaugeState(onTimeGauge, onTimeTotal, metrics.onTimeScore);
        setGaugeState(acceptanceGauge, acceptanceTotal, metrics.acceptanceScore);
        setGaugeState(appUsageGauge, appUsageTotal, metrics.appUsageScore);
        setGaugeState(disruptionGauge, disruptionTotal, metrics.disruptionFreeScore);

        if (onTimeOrigin) {
            onTimeOrigin.textContent = formatPercent(metrics.originRate);
        }

        if (onTimeDestination) {
            onTimeDestination.textContent = formatPercent(metrics.destinationRate);
        }

        if (acceptanceRejectedBlocks) {
            acceptanceRejectedBlocks.textContent = "--";
        }

        if (acceptanceRejectedLoads) {
            acceptanceRejectedLoads.textContent = String(metrics.rejectedLoads);
        }

        if (appStepsCompletion) {
            appStepsCompletion.textContent = formatPercent(PERFECT_SCORE);
        }

        if (locationAvailability) {
            locationAvailability.textContent = formatPercent(PERFECT_SCORE);
        }

        if (disruptionCount) {
            disruptionCount.textContent = String(metrics.disruptedLoads);
        }

        if (completedLoadsCount) {
            completedLoadsCount.textContent = String(metrics.completedLoads);
        }

        renderDriverTable(relevantTrips);
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => activatePane(button.dataset.target));
    });

    previewToggle?.addEventListener("change", () => {
        previewEnabled = Boolean(previewToggle.checked);
        renderPerformanceScorecard();
    });

    weekPrevButton?.addEventListener("click", () => {
        previewEnabled = false;
        if (previewToggle) {
            previewToggle.checked = false;
        }
        renderPerformanceScorecard();
    });

    weekNextButton?.addEventListener("click", () => {
        previewEnabled = true;
        if (previewToggle) {
            previewToggle.checked = true;
        }
        renderPerformanceScorecard();
    });

    driverSearchInput?.addEventListener("input", (event) => {
        driverSearchTerm = event.target.value.trim().toLowerCase();
        renderPerformanceScorecard();
    });

    window.addEventListener("focus", renderPerformanceScorecard);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            renderPerformanceScorecard();
        }
    });

    activatePane("scorecard-performance-pane");
    renderPerformanceScorecard();
});
