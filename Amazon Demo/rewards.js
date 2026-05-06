document.addEventListener("DOMContentLoaded", () => {
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const DRIVER_ROSTER_SESSION_KEY = "amazonDemoDriverRosterState";
    const ON_TIME_ORIGIN_WEIGHT = 0.375;
    const ON_TIME_DESTINATION_WEIGHT = 0.625;
    const PERFECT_SCORE = 100;
    const DEFAULT_VERIFIED_DRIVERS = 16;
    const TIER_ORDER = ["basic", "bronze", "silver", "gold", "platinum"];
    const TIER_RULES = [
        { id: "platinum", label: "Platinum", icon: "P", minScore: 99.9, minGrade: "A+" },
        { id: "gold", label: "Gold", icon: "G", minScore: 98, minGrade: "A" },
        { id: "silver", label: "Silver", icon: "S", minScore: 90, minGrade: "B" },
        { id: "bronze", label: "Bronze", icon: "B", minScore: 80, minGrade: "C+" },
        { id: "basic", label: "Basic", icon: "B", minScore: 0, minGrade: "No score, D+" }
    ];
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

    const shell = document.querySelector(".rewards-shell");
    if (!shell) {
        return;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(Number(value) || 0, min), max);
    }

    function formatPercent(value) {
        return `${clamp(value, 0, 100).toFixed(1)}%`;
    }

    function formatWholeNumber(value) {
        return Math.round(Number(value) || 0).toLocaleString("en-US");
    }

    function readJsonSession(key, fallbackValue) {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(key) || "null");
            return parsed === null ? fallbackValue : parsed;
        } catch (error) {
            console.warn(`Unable to read ${key}.`, error);
            return fallbackValue;
        }
    }

    function parseTrips() {
        const trips = readJsonSession(BOOKED_TRIPS_STORAGE_KEY, []);
        return Array.isArray(trips) ? trips : [];
    }

    function getVerifiedDriverCount() {
        const drivers = readJsonSession(DRIVER_ROSTER_SESSION_KEY, null);
        if (!Array.isArray(drivers)) {
            return DEFAULT_VERIFIED_DRIVERS;
        }

        return drivers.filter((driver) => driver?.eligibility === "eligible").length;
    }

    function isRejectedHistoryTrip(trip) {
        return (trip?.status || "upcoming") === "history"
            && (((trip?.historyStatus || "").toLowerCase() === "rejected") || Boolean(trip?.rejection?.reason));
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
            const rejected = isRejectedHistoryTrip(trip);
            return getTripPerformanceSegments(trip).map((segment) => ({
                trip,
                segment,
                rejected,
                miles: segment.miles,
                originLate: !rejected && isTripLateEvent(trip, buildTripEventKey(segment.fromNumber, "Arrival")),
                destinationLate: !rejected && isTripLateEvent(trip, buildTripEventKey(segment.toNumber, "Arrival")),
                unreportedLateDepartureEvents: rejected ? [] : getSegmentUnreportedLateDepartureEvents(trip, segment)
            }));
        });
    }

    function getGradeForScore(score) {
        const match = GRADE_THRESHOLDS.find((entry) => score >= entry.min);
        return match ? match.grade : "F";
    }

    function computeRewardMetrics() {
        const historyTrips = parseTrips().filter((trip) => (trip.status || "upcoming") === "history");
        const performanceLegs = buildPerformanceLegs(historyTrips);
        const completedLegs = performanceLegs.filter((leg) => !leg.rejected);
        const rejectedLoads = performanceLegs.filter((leg) => leg.rejected).length;
        const completedLoads = completedLegs.length;
        const lateOriginLoads = completedLegs.filter((leg) => leg.originLate).length;
        const lateDestinationLoads = completedLegs.filter((leg) => leg.destinationLate).length;
        const disruptedLoads = completedLegs.filter((leg) => leg.unreportedLateDepartureEvents.length).length;
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
        const completedMiles = completedLegs.reduce((total, leg) => total + leg.miles, 0);

        return {
            completedLoads,
            completedMiles,
            onTimeScore,
            acceptanceScore,
            appUsageScore,
            disruptionFreeScore,
            carrierScore,
            grade: getGradeForScore(carrierScore)
        };
    }

    function getTierForScore(score) {
        return TIER_RULES.find((tier) => score >= tier.minScore) || TIER_RULES[TIER_RULES.length - 1];
    }

    function getNextTier(tier) {
        const ascendingTiers = [...TIER_RULES].reverse();
        const tierIndex = ascendingTiers.findIndex((candidate) => candidate.id === tier.id);
        return tierIndex >= 0 && tierIndex < ascendingTiers.length - 1
            ? ascendingTiers[tierIndex + 1]
            : tier;
    }

    function getMileageThresholds(driverCount) {
        if (driverCount <= 1) {
            return ["< 1,000", "1,000", "2,000", "4,000", "6,000"];
        }

        if (driverCount <= 3) {
            return ["< 4,000", "4,000", "6,000", "8,000", "10,000"];
        }

        if (driverCount <= 10) {
            return ["< 8,000", "8,000", "10,000", "16,000", "20,000"];
        }

        if (driverCount <= 15) {
            return ["< 12,000", "12,000", "18,000", "30,000", "50,000"];
        }

        return ["< 30,000", "30,000", "40,000", "50,000", "65,000"];
    }

    function getMileageTargetForTier(driverCount, tier) {
        const thresholds = getMileageThresholds(driverCount);
        const tierIndex = TIER_ORDER.indexOf(tier.id);
        const rawValue = thresholds[tierIndex] || thresholds[thresholds.length - 1] || "0";
        return Number(String(rawValue).replace(/[^0-9]/g, "")) || 0;
    }

    function setText(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    }

    function highlightCurrentTier(tier) {
        const tierIndex = TIER_ORDER.indexOf(tier.id);
        if (tierIndex < 0) {
            return;
        }

        shell.classList.remove(...TIER_ORDER.map((tierId) => `rewards-tier-${tierId}`));
        shell.classList.add(`rewards-tier-${tier.id}`);

        document.querySelectorAll(".rewards-table th, .rewards-table td").forEach((cell) => {
            cell.classList.remove("is-current-tier");
        });

        document.querySelectorAll(".rewards-table tr").forEach((row) => {
            const cell = row.children[tierIndex + 1];
            if (cell) {
                cell.classList.add("is-current-tier");
            }
        });
    }

    function updateCurrentDriverRow(driverCount) {
        const label = driverCount > 15
            ? "Your company currently has 15+ verified drivers"
            : `Your company currently has ${driverCount} verified driver${driverCount === 1 ? "" : "s"}`;
        const rowLabel = document.querySelector("[data-rewards-driver-row-label]");
        const row = rowLabel?.closest("tr");
        const thresholds = getMileageThresholds(driverCount);

        if (rowLabel) {
            rowLabel.textContent = label;
        }

        if (row) {
            thresholds.forEach((threshold, index) => {
                const cell = row.children[index + 1];
                if (cell) {
                    cell.textContent = threshold;
                }
            });
        }
    }

    function renderRewards() {
        const metrics = computeRewardMetrics();
        const verifiedDrivers = getVerifiedDriverCount();
        const tier = getTierForScore(metrics.carrierScore);
        const nextTier = getNextTier(tier);
        const targetTier = tier.id === "platinum" ? tier : nextTier;
        const displayedMiles = metrics.completedMiles || getMileageTargetForTier(verifiedDrivers, tier);
        const scoreGap = Math.max(0, targetTier.minScore - metrics.carrierScore);

        document.querySelector("[data-rewards-current-icon]")?.classList.remove(...TIER_ORDER.map((tierId) => `tier-${tierId}`));
        document.querySelector("[data-rewards-preview-ring]")?.classList.remove(...TIER_ORDER.map((tierId) => `tier-${tierId}`));
        document.querySelector("[data-rewards-current-icon]")?.classList.add(`tier-${tier.id}`);
        document.querySelector("[data-rewards-preview-ring]")?.classList.add(`tier-${tier.id}`);

        setText("[data-rewards-current-title]", "Your status for next week");
        setText("[data-rewards-current-subtitle]", `Based on ${metrics.grade} ${formatPercent(metrics.carrierScore)} performance preview`);
        setText("[data-rewards-current-icon]", tier.icon);
        setText("[data-rewards-current-tier]", tier.label);
        setText("[data-rewards-executed-miles]", formatWholeNumber(displayedMiles));
        setText("[data-rewards-performance-grade]", metrics.grade);
        setText("[data-rewards-performance-score]", formatPercent(metrics.carrierScore));
        setText("[data-rewards-verified-drivers]", verifiedDrivers > 15 ? "15+" : String(verifiedDrivers));

        setText("[data-rewards-preview-title]", "Next week preview");
        setText("[data-rewards-preview-subtitle]", `${tier.label} if the current score holds`);
        setText("[data-rewards-preview-icon]", tier.icon);
        setText("[data-rewards-preview-tier]", tier.label);
        setText("[data-rewards-on-time]", formatPercent(metrics.onTimeScore));
        setText("[data-rewards-acceptance]", formatPercent(metrics.acceptanceScore));
        setText("[data-rewards-disruption-free]", formatPercent(metrics.disruptionFreeScore));

        setText("[data-rewards-target-title]", tier.id === "platinum" ? "How do I keep Platinum?" : `How do I get to ${targetTier.label}?`);
        setText("[data-rewards-target-tier]", `${targetTier.label} requirements`);
        setText("[data-rewards-target-grade]", targetTier.minGrade);
        setText("[data-rewards-target-score]", `${targetTier.minScore.toFixed(targetTier.minScore % 1 ? 1 : 0)}%+`);
        setText("[data-rewards-target-gap]", scoreGap ? `${scoreGap.toFixed(1)} pts needed` : "On track");

        updateCurrentDriverRow(verifiedDrivers);
        highlightCurrentTier(tier);
    }

    renderRewards();
});
