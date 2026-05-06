document.addEventListener("DOMContentLoaded", () => {
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const NOTIFICATION_TASK_READ_STORAGE_KEY = "amazonDemoNotificationReadTasks";
    const NOTIFICATION_READ_STORAGE_KEY = "amazonDemoNotificationReadItems";
    const TASKS_HASH = "#tasks";
    const NOTIFICATIONS_HASH = "#notifications";
    const STOP_DWELL_MINUTES = 30;
    const TRAILER_REQUIRED_EQUIPMENT_LABEL = "53' Required";
    const LEGACY_TRAILER_REQUIRED_EQUIPMENT_LABEL = "Trailer Required";
    const CARRIER_TRAILER_NUMBER_MAX_LENGTH = 8;
    const TRIP_TIME_SEQUENCE = ["pickupArrival", "pickupDeparture", "deliveryArrival", "deliveryDeparture"];
    const NOTIFICATION_FEED = [
        {
            id: "background-checks",
            title: "Coming soon: Background checks for all drivers",
            summary: "Amazon Relay will begin collecting annual background-check attestations for every active driver profile.",
            detail: "Starting May 15, 2026, carriers will need to keep background-check records current for each driver assigned to Relay loads.",
            nextStep: "Review every active driver file and prepare renewal documents before the enforcement date.",
            severity: "high",
            severityLabel: "High",
            category: "Safety Policy Compliance",
            categoryValue: "safety",
            receivedAt: "2026-04-06T13:21:00-04:00",
            actionHref: "supportcenter.html",
            actionLabel: "Open support center",
            isUnreadDefault: true
        },
        {
            id: "spring-weather",
            title: "Spring weather preparedness",
            summary: "Regional storms may affect appointment accuracy and yard congestion throughout the next two weeks.",
            detail: "Monitor route plans closely, confirm facility access before departure, and communicate revised ETAs early when conditions change.",
            nextStep: "Share your weather escalation plan with dispatchers and drivers before the next severe-weather lane.",
            severity: "low",
            severityLabel: "Low",
            category: "General Notification",
            categoryValue: "general",
            receivedAt: "2026-03-27T14:10:00-04:00",
            actionHref: "supportcenter.html",
            actionLabel: "Review guidance",
            isUnreadDefault: false
        },
        {
            id: "daylight-saving",
            title: "Spring forward: remember to change your clocks for Daylight Saving Time",
            summary: "Appointments can drift by an hour if dispatch tools and mobile devices are not updated before weekend departures.",
            detail: "Relay timestamps use local facility time, so a missed clock update can create false late arrivals or incorrect check-in expectations.",
            nextStep: "Confirm device time settings and brief drivers running overnight lanes through time-zone changes.",
            severity: "low",
            severityLabel: "Low",
            category: "General Notification",
            categoryValue: "general",
            receivedAt: "2026-03-06T14:52:00-05:00",
            actionHref: "learningcenter.html",
            actionLabel: "Open learning center",
            isUnreadDefault: false
        },
        {
            id: "identity-verification",
            title: "Unsuccessful identity verification",
            summary: "A recent verification attempt for one site user failed and access remains limited until the profile is resubmitted.",
            detail: "The user will not be able to complete permission-sensitive actions until the account details and supporting identity fields are verified again.",
            nextStep: "Review the affected site user record and resubmit the requested verification details today.",
            severity: "high",
            severityLabel: "High",
            category: "Safety, Policy, and Compliance",
            categoryValue: "safety",
            receivedAt: "2026-03-03T09:28:00-05:00",
            actionHref: "siteusers.html",
            actionLabel: "Review site users",
            isUnreadDefault: true
        },
        {
            id: "non-domiciled-cdl",
            title: "Important: states are making changes to non-domiciled CDLs",
            summary: "Several states updated documentation expectations for non-domiciled CDL renewals that affect carrier onboarding records.",
            detail: "Drivers with expiring credentials may need refreshed state-issued proof sooner than usual to remain eligible for assigned work.",
            nextStep: "Audit all non-domiciled CDL expirations and collect updated paperwork before the next credential review.",
            severity: "high",
            severityLabel: "High",
            category: "Safety Policy Compliance",
            categoryValue: "safety",
            receivedAt: "2026-01-27T13:19:00-05:00",
            actionHref: "documents.html",
            actionLabel: "Open documents",
            isUnreadDefault: false
        },
        {
            id: "name-your-price",
            title: "Don't miss a chance to name your own price",
            summary: "Auction-enabled lanes matching your recent searches are closing soon and still accept carrier pricing.",
            detail: "Spot opportunities are active for selected origin markets, and last-minute bidding windows are shorter than normal for same-day freight.",
            nextStep: "Review active auction lanes and submit pricing for the loads you can cover today.",
            severity: "critical",
            severityLabel: "Critical",
            category: "Work",
            categoryValue: "work",
            receivedAt: "2026-01-26T11:56:00-05:00",
            actionHref: "auctions.html",
            actionLabel: "Open auctions",
            isUnreadDefault: true
        },
        {
            id: "auctions-open",
            title: "Auctions are now open",
            summary: "New same-day and next-day auction loads are now available in several preferred lanes for your carrier profile.",
            detail: "Priority loads are entering the marketplace faster today, and bid response time will affect whether the best-priced options remain available.",
            nextStep: "Open the auctions page and review live lanes before the earliest bid windows expire.",
            severity: "critical",
            severityLabel: "Critical",
            category: "Work",
            categoryValue: "work",
            receivedAt: "2026-01-09T18:53:00-05:00",
            actionHref: "auctions.html",
            actionLabel: "View auction loads",
            isUnreadDefault: true
        },
        {
            id: "mobile-app-upgrade",
            title: "Mandatory Relay mobile application version upgrade",
            summary: "Drivers will need Relay mobile app version 7.4 or later to continue checking in and out without interruption.",
            detail: "Older app versions may stop syncing event timestamps correctly, which can create missed updates or unsupported workflow steps.",
            nextStep: "Confirm every driver device is upgraded before the next dispatch cycle begins.",
            severity: "medium",
            severityLabel: "Medium",
            category: "General Notification",
            categoryValue: "general",
            receivedAt: "2026-01-06T13:25:00-05:00",
            actionHref: "supportcenter.html",
            actionLabel: "View upgrade steps",
            isUnreadDefault: false
        },
        {
            id: "delivering-smiles",
            title: "Happy New Year: thank you for delivering smiles",
            summary: "Relay shared a seasonal thank-you note and a preview of upcoming carrier reward opportunities.",
            detail: "New recognition campaigns and engagement opportunities will continue rolling out across the year for participating carriers.",
            nextStep: "Check the rewards section for current recognition programs and upcoming milestones.",
            severity: "low",
            severityLabel: "Low",
            category: "General Notification",
            categoryValue: "general",
            receivedAt: "2026-01-02T11:33:00-05:00",
            actionHref: "rewards.html",
            actionLabel: "Open rewards",
            isUnreadDefault: false
        },
        {
            id: "holiday-message",
            title: "Happy holidays from Relay",
            summary: "Holiday operating reminders and support availability updates are posted for upcoming network closures.",
            detail: "Several facilities will run adjusted schedules during holiday periods, so support turnaround and appointment timing may differ from standard expectations.",
            nextStep: "Review closure guidance and confirm dispatch coverage for holiday freight.",
            severity: "low",
            severityLabel: "Low",
            category: "General Notification",
            categoryValue: "general",
            receivedAt: "2025-12-24T10:22:00-05:00",
            actionHref: "supportcenter.html",
            actionLabel: "Check holiday guidance",
            isUnreadDefault: false
        },
        {
            id: "remittance-advice",
            title: "Updated remittance advice is now available",
            summary: "A new remittance statement has been posted for recently completed loads and short-pay review activity.",
            detail: "Payment detail pages now include refreshed breakdowns for recent settlements, adjustments, and any open invoice review items.",
            nextStep: "Open Payments and download the latest remittance advice for reconciliation.",
            severity: "medium",
            severityLabel: "Medium",
            category: "Payments",
            categoryValue: "payments",
            receivedAt: "2026-04-15T09:05:00-04:00",
            actionHref: "payments.html",
            actionLabel: "Open payments",
            isUnreadDefault: true
        },
        {
            id: "contract-acknowledgement",
            title: "New contract packet requires acknowledgement",
            summary: "Carrier terms were refreshed and require acknowledgement before the next contract renewal window closes.",
            detail: "Updated service language and program policy references are now available in the contracts workspace for all active carrier accounts.",
            nextStep: "Open Contracts, review the refreshed packet, and confirm acknowledgement with your admin team.",
            severity: "high",
            severityLabel: "High",
            category: "Contracts",
            categoryValue: "contracts",
            receivedAt: "2026-04-11T16:40:00-04:00",
            actionHref: "contracts.html",
            actionLabel: "Open contracts",
            isUnreadDefault: true
        },
        {
            id: "performance-coaching",
            title: "Performance coaching module is available",
            summary: "A new coaching module is ready because recent on-time check-in performance fell below the target benchmark.",
            detail: "The training focuses on arrival event timing, delay reporting cadence, and common causes of preventable late check-ins.",
            nextStep: "Review the performance dashboard and assign the coaching module to dispatch leadership this week.",
            severity: "medium",
            severityLabel: "Medium",
            category: "Performance",
            categoryValue: "performance",
            receivedAt: "2026-02-18T08:30:00-05:00",
            actionHref: "performance.html",
            actionLabel: "Open performance",
            isUnreadDefault: false
        },
        {
            id: "insurance-expiring",
            title: "Insurance certificate expires within 48 hours",
            summary: "The certificate of insurance on file is about to expire and booking access may be restricted if coverage lapses.",
            detail: "Amazon requires uninterrupted active coverage for the policies on file. An expired COI can pause new bookings until renewed documents are approved.",
            nextStep: "Upload the renewed COI now and confirm the updated effective dates with your admin team.",
            severity: "critical",
            severityLabel: "Critical",
            category: "Safety Policy Compliance",
            categoryValue: "safety",
            receivedAt: "2026-04-20T07:45:00-04:00",
            actionHref: "documents.html",
            actionLabel: "Upload updated COI",
            isUnreadDefault: true
        }
    ];

    const notificationBox = document.querySelector(".notification-box");
    const closeButton = document.getElementById("close-notification");
    const tasksTab = document.getElementById("tasks-tab");
    const notificationsTab = document.getElementById("notifications-tab");
    const tasksSection = document.getElementById("tasks-section");
    const notificationsSection = document.getElementById("notifications-section");
    const tasksBadge = document.getElementById("tasks-badge");
    const notificationBadge = document.getElementById("notifications-badge");
    const tasksSearchInput = document.getElementById("tasks-search-input");
    const tasksSearchButton = document.getElementById("tasks-search-button");
    const severityDropdown = document.getElementById("severity-dropdown");
    const showUnreadTasks = document.getElementById("show-unread-tasks");
    const tasksResultsHeader = document.getElementById("tasks-results-header");
    const tasksResults = document.getElementById("tasks-results");
    const notificationsSearchInput = document.getElementById("notifications-search-input");
    const notificationsSearchButton = document.getElementById("notifications-search-button");
    const categoryDropdown = document.getElementById("category-dropdown");
    const notificationsSeverityDropdown = document.getElementById("severity-dropdown-notifications");
    const showUnreadNotifications = document.getElementById("show-unread-notifications");
    const notificationsResultsHeader = document.getElementById("notifications-results-header");
    const notificationsResults = document.getElementById("notifications-results");
    const notificationSeverityBoxes = Array.from(document.querySelectorAll("[data-notification-severity]"));

    let allTasks = [];
    let allNotifications = [];
    let expandedNotificationId = null;

    if (closeButton && notificationBox) {
        closeButton.addEventListener("click", () => {
            notificationBox.style.display = "none";
        });
    }

    if (!tasksTab || !notificationsTab || !tasksSection || !notificationsSection) {
        return;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function hashString(text) {
        let hash = 0;
        for (let index = 0; index < text.length; index += 1) {
            hash = ((hash << 5) - hash) + text.charCodeAt(index);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    const RELAY_LOAD_CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function encodeRelayLoadValue(value, length) {
        const safeLength = Math.max(1, Number(length) || 1);
        const base = BigInt(RELAY_LOAD_CODE_ALPHABET.length);
        let remaining = BigInt(value);
        let encoded = "";

        while (encoded.length < safeLength) {
            encoded = RELAY_LOAD_CODE_ALPHABET[Number(remaining % base)] + encoded;
            remaining /= base;
        }

        return encoded;
    }

    function buildRelayLoadCode(seed, namespace = "") {
        const normalizedSeed = Math.abs(Number(seed) || 0);
        const primaryHash = BigInt(hashString(`${namespace}:${normalizedSeed}`));
        const secondaryHash = BigInt(hashString(`${normalizedSeed}:${namespace}:amazon-relay-demo`));
        const combined = (primaryHash << 31n) ^ secondaryHash ^ BigInt(normalizedSeed);
        const suffixCapacity = BigInt(RELAY_LOAD_CODE_ALPHABET.length) ** 6n;
        const prefixDigit = Number(combined % 8n) + 1;
        const suffixValue = (combined / 8n) % suffixCapacity;

        return `11${prefixDigit}${encodeRelayLoadValue(suffixValue, 6)}`;
    }

    function buildTripCode(seed, namespace = "trip") {
        return `T-${buildRelayLoadCode(seed, `${namespace}:master`)}`;
    }

    function buildShipmentCode(seed, namespace = "shipment") {
        return buildRelayLoadCode(seed, `${namespace}:load`);
    }

    function getTripDisplayCode(trip, index = 0) {
        const seed = hashString(trip?.loadKey || `${trip?.originCode || "UNK"}-${trip?.destinationCode || "UNK"}-${index}`);
        const routeSegments = Array.isArray(trip?.routeSegments) ? trip.routeSegments : [];
        const isMultiStopTrip = routeSegments.length > 1;

        return isMultiStopTrip
            ? buildTripCode(seed, trip?.loadKey || `${trip?.originCode || "trip"}-${trip?.destinationCode || "trip"}`)
            : buildShipmentCode(seed + 97, `${trip?.loadKey || trip?.originCode || "trip"}:primary`);
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

    function addMinutes(date, minutes) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return null;
        }

        const nextDate = new Date(date);
        nextDate.setMinutes(nextDate.getMinutes() + minutes);
        return nextDate;
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

    function formatReceivedDate(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "--";
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function formatNotificationReceivedDate(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "--";
        }

        const formatter = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZoneName: "short"
        });
        const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
            if (part.type !== "literal") {
                accumulator[part.type] = (accumulator[part.type] || "") + part.value;
            }
            return accumulator;
        }, {});

        return `${parts.month || ""} ${parts.day || ""} ${parts.year || ""} ${parts.hour || ""}:${parts.minute || ""} ${parts.timeZoneName || ""}`
            .replace(/\s+/g, " ")
            .trim();
    }

    function loadBookedTrips() {
        try {
            return JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || "[]");
        } catch (error) {
            console.warn("Unable to read booked trips for notifications.", error);
            return [];
        }
    }

    function loadReadTaskIds() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(NOTIFICATION_TASK_READ_STORAGE_KEY) || "[]");
            return new Set(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            console.warn("Unable to read notification task state.", error);
            return new Set();
        }
    }

    function saveReadTaskIds(taskIds) {
        try {
            sessionStorage.setItem(NOTIFICATION_TASK_READ_STORAGE_KEY, JSON.stringify(Array.from(taskIds)));
        } catch (error) {
            console.warn("Unable to save notification task state.", error);
        }
    }

    function loadReadNotificationIds() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(NOTIFICATION_READ_STORAGE_KEY) || "[]");
            return new Set(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            console.warn("Unable to read notification feed state.", error);
            return new Set();
        }
    }

    function saveReadNotificationIds(notificationIds) {
        try {
            sessionStorage.setItem(NOTIFICATION_READ_STORAGE_KEY, JSON.stringify(Array.from(notificationIds)));
        } catch (error) {
            console.warn("Unable to save notification feed state.", error);
        }
    }

    function markNotificationAsRead(notificationId) {
        const readNotificationIds = loadReadNotificationIds();
        readNotificationIds.add(notificationId);
        saveReadNotificationIds(readNotificationIds);
    }

    function isRejectedHistoryTrip(trip) {
        return (trip?.status || "upcoming") === "history"
            && (((trip?.historyStatus || "").toLowerCase() === "rejected") || Boolean(trip?.rejection?.reason));
    }

    function normalizeTaskCategory(status) {
        return status === "in-transit" ? "In transit trips" : "Upcoming trips";
    }

    function normalizeTaskSeverityLabel(severity) {
        const labelMap = {
            critical: "Critical",
            high: "High",
            medium: "Medium",
            low: "Low"
        };

        return labelMap[severity] || "High";
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

    function hasRequiredCarrierTrailerNumber(trip) {
        if (!isTrailerRequiredTrip(trip)) {
            return true;
        }

        const segmentAssignments = Array.isArray(trip?.segmentAssignments) ? trip.segmentAssignments : [];
        if (segmentAssignments.length > 1) {
            return segmentAssignments.every((assignment) => (
                Boolean(normalizeCarrierTrailerNumber(assignment?.trailerId || trip?.trailerId))
            ));
        }

        return Boolean(normalizeCarrierTrailerNumber(trip?.trailerId));
    }

    function getTripScheduledDate(trip, eventKey) {
        const pickupDate = parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow);
        const deliveryDate = parseTripDate(trip?.deliveryDateTimeIso, trip?.deliveryWindow);

        const scheduleMap = {
            pickupArrival: pickupDate,
            pickupDeparture: parseTripDate(trip?.pickupDepartureDateTimeIso, null) || addMinutes(pickupDate, STOP_DWELL_MINUTES),
            deliveryArrival: deliveryDate,
            deliveryDeparture: parseTripDate(trip?.deliveryDepartureDateTimeIso, null) || addMinutes(deliveryDate, STOP_DWELL_MINUTES)
        };

        return scheduleMap[eventKey] || pickupDate;
    }

    function isTripEventOverdueWithoutResponse(trip, eventKey, now = new Date()) {
        if (isHiddenUpcomingBlockTrip(trip, now)) {
            return false;
        }

        const tripStatus = trip?.status || "upcoming";
        if (tripStatus === "history" || isRejectedHistoryTrip(trip)) {
            return false;
        }

        const scheduledDate = getTripScheduledDate(trip, eventKey);
        const actualDate = parseTripDate(trip?.actualTimes?.[eventKey], null);
        const delay = trip?.delayEvents?.[eventKey];

        return scheduledDate instanceof Date
            && !Number.isNaN(scheduledDate.getTime())
            && scheduledDate.getTime() < now.getTime()
            && !actualDate
            && !delay;
    }

    function buildRouteLabel(trip) {
        const originCity = trip?.originCity ? ` ${trip.originCity}` : "";
        const destinationCity = trip?.destinationCity ? ` ${trip.destinationCity}` : "";
        return `${trip.originCode || "--"}${originCity} -> ${trip.destinationCode || "--"}${destinationCity}`;
    }

    function getTaskSeverityRank(severity) {
        if (severity === "critical") {
            return 0;
        }

        if (severity === "high") {
            return 1;
        }

        return 2;
    }

    function getNotificationSeverityRank(severity) {
        if (severity === "critical") {
            return 0;
        }

        if (severity === "high") {
            return 1;
        }

        if (severity === "medium") {
            return 2;
        }

        if (severity === "low") {
            return 3;
        }

        return 4;
    }

    function getTimingIssueLabel(eventKey) {
        const issueMap = {
            pickupArrival: "Pickup arrival check-in is overdue and no delay was reported",
            pickupDeparture: "Pickup departure check-out is overdue and no delay was reported",
            deliveryArrival: "Delivery arrival check-in is overdue and no delay was reported",
            deliveryDeparture: "Delivery departure check-out is overdue and no delay was reported"
        };

        return issueMap[eventKey] || "Trip event is overdue and no delay was reported";
    }

    function buildTripAttentionTasks(now = new Date()) {
        const readTaskIds = loadReadTaskIds();

        return loadBookedTrips()
            .filter((trip) => {
                const tripStatus = trip?.status || "upcoming";
                return (tripStatus === "upcoming" || tripStatus === "in-transit")
                    && !isHiddenUpcomingBlockTrip(trip, now);
            })
            .flatMap((trip, index) => {
                const tripStatus = trip?.status || "upcoming";
                const tripCode = getTripDisplayCode(trip, index);
                const category = normalizeTaskCategory(tripStatus);
                const routeLabel = buildRouteLabel(trip);
                const defaultReceivedAt = parseTripDate(trip?.updatedAt, null)
                    || parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow)
                    || new Date();
                const tasks = [];

                if (!trip?.driverOption) {
                    tasks.push({
                        id: `${trip.loadKey}-driver`,
                        loadKey: trip.loadKey,
                        tripTab: tripStatus,
                        tripCode,
                        issueText: "Driver assignment is missing",
                        severity: "high",
                        severityLabel: normalizeTaskSeverityLabel("high"),
                        category,
                        routeLabel,
                        receivedAt: defaultReceivedAt,
                        receivedLabel: formatReceivedDate(defaultReceivedAt),
                        isUnread: !readTaskIds.has(`${trip.loadKey}-driver`)
                    });
                }

                if (!trip?.tractorOption) {
                    tasks.push({
                        id: `${trip.loadKey}-tractor`,
                        loadKey: trip.loadKey,
                        tripTab: tripStatus,
                        tripCode,
                        issueText: "Tractor assignment is missing",
                        severity: "high",
                        severityLabel: normalizeTaskSeverityLabel("high"),
                        category,
                        routeLabel,
                        receivedAt: defaultReceivedAt,
                        receivedLabel: formatReceivedDate(defaultReceivedAt),
                        isUnread: !readTaskIds.has(`${trip.loadKey}-tractor`)
                    });
                }

                if (!hasRequiredCarrierTrailerNumber(trip)) {
                    const taskId = `${trip.loadKey}-trailer`;
                    tasks.push({
                        id: taskId,
                        loadKey: trip.loadKey,
                        tripTab: tripStatus,
                        tripCode,
                        issueText: "Carrier trailer number is missing",
                        severity: "high",
                        severityLabel: normalizeTaskSeverityLabel("high"),
                        category,
                        routeLabel,
                        receivedAt: defaultReceivedAt,
                        receivedLabel: formatReceivedDate(defaultReceivedAt),
                        isUnread: !readTaskIds.has(taskId)
                    });
                }

                TRIP_TIME_SEQUENCE.forEach((eventKey) => {
                    if (!isTripEventOverdueWithoutResponse(trip, eventKey, now)) {
                        return;
                    }

                    const receivedAt = getTripScheduledDate(trip, eventKey) || defaultReceivedAt;
                    const taskId = `${trip.loadKey}-${eventKey}`;
                    tasks.push({
                        id: taskId,
                        loadKey: trip.loadKey,
                        tripTab: tripStatus,
                        tripCode,
                        issueText: getTimingIssueLabel(eventKey),
                        severity: "critical",
                        severityLabel: normalizeTaskSeverityLabel("critical"),
                        category,
                        routeLabel,
                        receivedAt,
                        receivedLabel: formatReceivedDate(receivedAt),
                        isUnread: !readTaskIds.has(taskId)
                    });
                });

                return tasks;
            })
            .sort((left, right) => {
                const severityDelta = getTaskSeverityRank(left.severity) - getTaskSeverityRank(right.severity);
                if (severityDelta !== 0) {
                    return severityDelta;
                }

                return (right.receivedAt?.getTime?.() || 0) - (left.receivedAt?.getTime?.() || 0);
            });
    }

    function buildNotificationFeed() {
        const readNotificationIds = loadReadNotificationIds();

        return NOTIFICATION_FEED
            .map((notification) => {
                const receivedAt = parseTripDate(notification.receivedAt, null);
                return {
                    ...notification,
                    receivedAtDate: receivedAt,
                    receivedLabel: formatNotificationReceivedDate(receivedAt),
                    isUnread: notification.isUnreadDefault && !readNotificationIds.has(notification.id)
                };
            })
            .sort((left, right) => {
                const severityDelta = getNotificationSeverityRank(left.severity) - getNotificationSeverityRank(right.severity);
                if (severityDelta !== 0) {
                    return severityDelta;
                }

                return (right.receivedAtDate?.getTime?.() || 0) - (left.receivedAtDate?.getTime?.() || 0);
            });
    }

    function renderTaskEmptyState(title, description) {
        if (!tasksResults) {
            return;
        }

        if (tasksResultsHeader) {
            tasksResultsHeader.hidden = true;
        }

        tasksResults.innerHTML = `
            <div class="task-empty-state">
                <p class="no-tasks">${escapeHtml(title)}</p>
                <p>${escapeHtml(description)}</p>
                <img src="https://dfz3xbn3chdu5.cloudfront.net/OptimusWebPlatform/icon/welcomebadge.png" alt="No Tasks" class="no-tasks-image">
            </div>
        `;
    }

    function renderNotificationEmptyState(title, description) {
        if (!notificationsResults) {
            return;
        }

        if (notificationsResultsHeader) {
            notificationsResultsHeader.hidden = true;
        }

        notificationsResults.innerHTML = `
            <div class="notification-empty-state">
                <p class="no-notifications">${escapeHtml(title)}</p>
                <p>${escapeHtml(description)}</p>
                <img src="https://dfz3xbn3chdu5.cloudfront.net/OptimusWebPlatform/icon/welcomebadge.png" alt="No Notifications" class="no-notifications-image">
            </div>
        `;
    }

    function renderTasks() {
        if (!tasksResults) {
            return;
        }

        const searchTerm = (tasksSearchInput?.value || "").trim().toLowerCase();
        const severityValue = severityDropdown?.value || "all";
        const unreadOnly = Boolean(showUnreadTasks?.checked);

        allTasks = buildTripAttentionTasks();

        if (tasksBadge) {
            tasksBadge.textContent = String(allTasks.length);
        }

        const filteredTasks = allTasks.filter((task) => {
            const matchesSearch = !searchTerm || [
                task.tripCode,
                task.issueText,
                task.routeLabel,
                task.category
            ].some((value) => String(value).toLowerCase().includes(searchTerm));
            const matchesSeverity = severityValue === "all" || task.severity === severityValue;
            const matchesUnread = !unreadOnly || task.isUnread;

            return matchesSearch && matchesSeverity && matchesUnread;
        });

        if (!allTasks.length) {
            renderTaskEmptyState("No tasks", "Tasks regarding your trips will show up here.");
            return;
        }

        if (!filteredTasks.length) {
            renderTaskEmptyState("No tasks match your filters", "Try clearing the search or severity filter to see active trip tasks.");
            return;
        }

        if (tasksResultsHeader) {
            tasksResultsHeader.hidden = false;
        }

        tasksResults.innerHTML = `
            <div class="task-results-list">
                ${filteredTasks.map((task) => `
                    <div class="task-result-row">
                        <div class="task-result-description">
                            <div class="task-load-number">${escapeHtml(task.tripCode)}</div>
                            <div class="task-issue-text">${escapeHtml(task.issueText)}</div>
                            <div class="task-route-text">${escapeHtml(task.routeLabel)}</div>
                        </div>
                        <div class="task-severity">
                            <span class="task-severity-pill is-${escapeHtml(task.severity)}">${escapeHtml(task.severityLabel)}</span>
                        </div>
                        <div class="task-category">${escapeHtml(task.category)}</div>
                        <div class="task-received">${escapeHtml(task.receivedLabel)}</div>
                        <div class="task-action-cell">
                            <a
                                class="task-action-link"
                                href="trips.html?tripTab=${encodeURIComponent(task.tripTab)}&loadKey=${encodeURIComponent(task.loadKey)}"
                                data-task-id="${escapeHtml(task.id)}"
                            >
                                Open trip
                            </a>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function renderNotificationSeverityCounts(notifications) {
        const severityCounts = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        notifications.forEach((notification) => {
            if (Object.prototype.hasOwnProperty.call(severityCounts, notification.severity)) {
                severityCounts[notification.severity] += 1;
            }
        });

        notificationSeverityBoxes.forEach((box) => {
            const severity = box.dataset.notificationSeverity;
            const countElement = box.querySelector(".notification-count");
            const isActive = (notificationsSeverityDropdown?.value || "all") === severity;

            box.dataset.active = isActive ? "true" : "false";
            if (countElement) {
                countElement.textContent = String(severityCounts[severity] || 0);
            }
        });
    }

    function buildNotificationCardMarkup(notification) {
        const isExpanded = expandedNotificationId === notification.id;
        const unreadDotClass = notification.isUnread ? "notification-unread-dot" : "notification-unread-dot is-hidden";

        return `
            <div class="notification-card${notification.isUnread ? " is-unread" : ""}">
                <div class="notification-row">
                    <div class="notification-description">
                        <div class="notification-title-row">
                            <span class="${unreadDotClass}" aria-hidden="true"></span>
                            <div class="notification-title">${escapeHtml(notification.title)}</div>
                        </div>
                        <div class="notification-summary">${escapeHtml(notification.summary)}</div>
                    </div>
                    <div class="notification-severity">
                        <span class="notification-severity-pill is-${escapeHtml(notification.severity)}">${escapeHtml(notification.severityLabel)}</span>
                    </div>
                    <div class="notification-category">${escapeHtml(notification.category)}</div>
                    <div class="notification-received">${escapeHtml(notification.receivedLabel)}</div>
                    <div class="notification-action-cell">
                        <button
                            class="notification-action-button"
                            type="button"
                            data-notification-action="toggle"
                            data-notification-id="${escapeHtml(notification.id)}"
                        >
                            ${isExpanded ? "Hide" : "View"}
                        </button>
                    </div>
                </div>
                ${isExpanded ? `
                    <div class="notification-detail-panel">
                        <div class="notification-detail-eyebrow">${escapeHtml(notification.category)} | ${escapeHtml(notification.severityLabel)} priority</div>
                        <p class="notification-detail-text">${escapeHtml(notification.detail)}</p>
                        <p class="notification-next-step"><strong>Next step:</strong> ${escapeHtml(notification.nextStep)}</p>
                        <div class="notification-detail-actions">
                            <a
                                class="notification-detail-link"
                                href="${escapeHtml(notification.actionHref)}"
                                data-notification-action="open-link"
                                data-notification-id="${escapeHtml(notification.id)}"
                            >
                                ${escapeHtml(notification.actionLabel)}
                            </a>
                            ${notification.isUnread ? `
                                <button
                                    class="notification-mark-read"
                                    type="button"
                                    data-notification-action="mark-read"
                                    data-notification-id="${escapeHtml(notification.id)}"
                                >
                                    Mark as read
                                </button>
                            ` : ""}
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    function renderNotifications() {
        if (!notificationsResults) {
            return;
        }

        const searchTerm = (notificationsSearchInput?.value || "").trim().toLowerCase();
        const categoryValue = categoryDropdown?.value || "all";
        const severityValue = notificationsSeverityDropdown?.value || "all";
        const unreadOnly = Boolean(showUnreadNotifications?.checked);

        allNotifications = buildNotificationFeed();

        if (notificationBadge) {
            notificationBadge.textContent = String(allNotifications.length);
        }

        const filteredNotifications = allNotifications.filter((notification) => {
            const matchesSearch = !searchTerm || [
                notification.title,
                notification.summary,
                notification.detail,
                notification.category,
                notification.severityLabel
            ].some((value) => String(value).toLowerCase().includes(searchTerm));
            const matchesCategory = categoryValue === "all" || notification.categoryValue === categoryValue;
            const matchesSeverity = severityValue === "all" || notification.severity === severityValue;
            const matchesUnread = !unreadOnly || notification.isUnread;

            return matchesSearch && matchesCategory && matchesSeverity && matchesUnread;
        });

        renderNotificationSeverityCounts(filteredNotifications);

        if (expandedNotificationId && !filteredNotifications.some((notification) => notification.id === expandedNotificationId)) {
            expandedNotificationId = null;
        }

        if (!allNotifications.length) {
            renderNotificationEmptyState("No notifications", "Notifications regarding your activities will show up here.");
            return;
        }

        if (!filteredNotifications.length) {
            renderNotificationEmptyState("No notifications match your filters", "Try clearing the search, category, or severity filter to see available notifications.");
            return;
        }

        if (notificationsResultsHeader) {
            notificationsResultsHeader.hidden = false;
        }

        notificationsResults.innerHTML = `
            <div class="notification-results-list">
                ${filteredNotifications.map((notification) => buildNotificationCardMarkup(notification)).join("")}
            </div>
        `;
    }

    const setActiveTab = (tabToActivate) => {
        tasksTab.classList.remove("active");
        notificationsTab.classList.remove("active");
        tabToActivate.classList.add("active");
    };

    function syncViewHash(nextHash) {
        if (window.location.hash.toLowerCase() === nextHash) {
            return;
        }

        if (window.history && typeof window.history.replaceState === "function") {
            window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
            return;
        }

        window.location.hash = nextHash.slice(1);
    }

    const showTasks = (syncHash = true) => {
        tasksSection.style.display = "block";
        notificationsSection.style.display = "none";
        setActiveTab(tasksTab);
        renderTasks();

        if (syncHash) {
            syncViewHash(TASKS_HASH);
        }
    };

    const showNotifications = (syncHash = true) => {
        tasksSection.style.display = "none";
        notificationsSection.style.display = "block";
        setActiveTab(notificationsTab);
        renderNotifications();

        if (syncHash) {
            syncViewHash(NOTIFICATIONS_HASH);
        }
    };

    const showViewFromLocation = () => {
        if (window.location.hash.toLowerCase() === NOTIFICATIONS_HASH) {
            showNotifications(false);
            return;
        }

        showTasks(false);
    };

    tasksTab.addEventListener("click", (event) => {
        event.preventDefault();
        showTasks();
    });

    notificationsTab.addEventListener("click", (event) => {
        event.preventDefault();
        showNotifications();
    });

    tasksSearchInput?.addEventListener("input", renderTasks);
    tasksSearchButton?.addEventListener("click", renderTasks);
    severityDropdown?.addEventListener("change", renderTasks);
    showUnreadTasks?.addEventListener("change", renderTasks);

    notificationsSearchInput?.addEventListener("input", renderNotifications);
    notificationsSearchButton?.addEventListener("click", renderNotifications);
    categoryDropdown?.addEventListener("change", renderNotifications);
    notificationsSeverityDropdown?.addEventListener("change", renderNotifications);
    showUnreadNotifications?.addEventListener("change", renderNotifications);

    notificationSeverityBoxes.forEach((box) => {
        const applySeverityFilter = () => {
            if (!notificationsSeverityDropdown) {
                return;
            }

            const severity = box.dataset.notificationSeverity || "all";
            notificationsSeverityDropdown.value = notificationsSeverityDropdown.value === severity ? "all" : severity;
            renderNotifications();
        };

        box.addEventListener("click", applySeverityFilter);
        box.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            applySeverityFilter();
        });
    });

    tasksResults?.addEventListener("click", (event) => {
        const actionLink = event.target.closest("[data-task-id]");
        if (!actionLink) {
            return;
        }

        const readTaskIds = loadReadTaskIds();
        readTaskIds.add(actionLink.dataset.taskId);
        saveReadTaskIds(readTaskIds);
    });

    notificationsResults?.addEventListener("click", (event) => {
        const actionTrigger = event.target.closest("[data-notification-action]");
        if (!actionTrigger) {
            return;
        }

        const notificationId = actionTrigger.dataset.notificationId;
        const action = actionTrigger.dataset.notificationAction;

        if (!notificationId) {
            return;
        }

        if (action === "toggle") {
            expandedNotificationId = expandedNotificationId === notificationId ? null : notificationId;
            renderNotifications();
            return;
        }

        if (action === "mark-read" || action === "open-link") {
            markNotificationAsRead(notificationId);
        }

        if (action === "mark-read") {
            renderNotifications();
        }
    });

    window.addEventListener("focus", () => {
        renderTasks();
        renderNotifications();
    });

    window.addEventListener("pageshow", () => {
        renderTasks();
        renderNotifications();
    });

    window.addEventListener("hashchange", showViewFromLocation);

    renderNotifications();
    showViewFromLocation();
});
