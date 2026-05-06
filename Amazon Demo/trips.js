const DRIVER_ROSTER_SESSION_KEY = "amazonDemoDriverRosterState";
const DEFAULT_DRIVER_OPTIONS = [
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
const DEFAULT_TRACTOR_OPTIONS = [
    "AH54219",
    "AG68452",
    "AK43168",
    "AH18264",
    "AJ07491",
    "AG95814",
    "AK93725",
    "AH70544",
    "AG84763",
    "AK81492",
    "AH66231",
    "AG89817",
    "AH65348",
    "AJ50326",
    "AK79642"
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

function getAssignableDriverOptions() {
    try {
        const raw = sessionStorage.getItem(DRIVER_ROSTER_SESSION_KEY);
        if (!raw) {
            return DEFAULT_DRIVER_OPTIONS.slice();
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return DEFAULT_DRIVER_OPTIONS.slice();
        }

        return parsed
            .filter((driver) => driver && driver.eligibility === "eligible" && typeof driver.name === "string")
            .map((driver) => driver.name);
    } catch (error) {
        console.warn("Unable to read driver roster state.", error);
        return DEFAULT_DRIVER_OPTIONS.slice();
    }
}

function getAssignableTractorOptions() {
    try {
        if (typeof window.getAmazonDemoTractorLicenseOptions === "function") {
            const tractorOptions = window.getAmazonDemoTractorLicenseOptions();
            if (Array.isArray(tractorOptions) && tractorOptions.length) {
                return tractorOptions.filter((option) => typeof option === "string" && option.trim());
            }
        }
    } catch (error) {
        console.warn("Unable to read asset roster state.", error);
    }

    return DEFAULT_TRACTOR_OPTIONS.slice();
}

clearDriverRosterSessionOnReload();

document.addEventListener("DOMContentLoaded", () => {
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const PAT_ORDER_STORAGE_KEY = "amazonDemoPatOrders";
    const SUPPORT_CASES_STORAGE_KEY = "amazonDemoSupportCases";
    const TRIP_NOTES_STORAGE_KEY = "amazonDemoTripNotes";
    const tripHistorySchedule = window.AmazonDemoTripHistorySchedule;
    const UPCOMING_PAGE_SIZE = 20;
    const NOTE_AUTHOR = "FUTURE LOGISTICS ACADEMY";
    const RELAY_ASSISTANT_AUTHOR = "Relay-Assistant";
    const DRIVER_OPTIONS = getAssignableDriverOptions();
    const TRACTOR_OPTIONS = getAssignableTractorOptions();
    const TRAILER_OPTIONS = [
        "DZNG HV203151",
        "DZNG HV203157",
        "DZNG HV203209",
        "DZNG HV209511"
    ];
    const TRAILER_REQUIRED_EQUIPMENT_LABEL = "53' Required";
    const LEGACY_TRAILER_REQUIRED_EQUIPMENT_LABEL = "Trailer Required";
    const CARRIER_TRAILER_NUMBER_MAX_LENGTH = 8;
    const TRIP_TIME_SEQUENCE = ["pickupArrival", "pickupDeparture", "deliveryArrival", "deliveryDeparture"];
    const DELAY_REASON_OPTIONS = {
        pickupArrival: [
            "Carrier accident",
            "Border delay",
            "DOT inspection",
            "Traffic",
            "Dispatch error",
            "Mechanical tractor",
            "Mechanical trailer",
            "Guard shack delay",
            "Vendor delay pickup scheduling",
            "Driver error",
            "Medical",
            "Site Closure",
            "Loaded overweight",
            "Weather",
            "Hours of Service",
            "Scheduling Error",
            "Yard Congestion",
            "Driver legal break",
            "Rail delay",
            "Usps delay",
            "Relay app malfunction",
            "Relay navigation unsafe route",
            "Pallet quality issue",
            "Site badging access issue",
            "Cell service issue",
            "Driver turned away",
            "Refueling",
            "Live lift ramp"
        ],
        pickupDeparture: [
            "DOT inspection",
            "Dispatch error",
            "Mechanical tractor",
            "Mechanical trailer",
            "Guard shack delay",
            "Driver error",
            "Site Closure",
            "Delayed Loading",
            "Scheduling Error",
            "Yard Congestion",
            "Rail delay",
            "Usps delay",
            "Relay app malfunction",
            "Pallet quality issue",
            "Site badging access issue",
            "Driver turned away"
        ],
        deliveryArrival: [
            "Carrier accident",
            "Border delay",
            "DOT inspection",
            "Traffic",
            "Dispatch error",
            "Mechanical tractor",
            "Mechanical trailer",
            "Guard shack delay",
            "Vendor delay pickup scheduling",
            "Driver error",
            "Medical",
            "Site Closure",
            "Loaded overweight",
            "Weather",
            "Hours of Service",
            "Scheduling Error",
            "Yard Congestion",
            "Driver legal break",
            "Rail delay",
            "Usps delay",
            "Relay app malfunction",
            "Relay navigation unsafe route",
            "Pallet quality issue",
            "Site badging access issue",
            "Cell service issue",
            "Driver turned away",
            "Refueling",
            "Live lift ramp"
        ],
        deliveryDeparture: [
            "Unloading delay",
            "POD paperwork delay",
            "Receiver release delay",
            "Dock congestion",
            "Trailer inspection delay"
        ]
    };
    const REJECTION_REASON_OPTIONS = [
        "DOT inspection",
        "Driver Attrition",
        "Driver fatigue",
        "Driver Personal Conflict",
        "Driver type mismatch",
        "Driving ban",
        "Hours of Service",
        "Incorrect equipment type",
        "Low payment rates",
        "Mechanical Tractor Issue",
        "Mechanical Trailer",
        "Medical Issues",
        "Overbooked",
        "Weather",
        "Wrong domicile allocation"
    ];
    const SUPPORT_CASE_REASON = "In Transit Trip Issue (Request a Callback)";
    const SUPPORT_CASE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const STREETS = [
        "Cherry St",
        "Valley View St",
        "Brookshire Hwy",
        "Commerce Dr",
        "Industrial Rd",
        "Logistics Pkwy"
    ];

    const tabs = document.querySelectorAll(".trip-tab");
    const states = document.querySelectorAll(".trip-state");
    const STOP_DWELL_MINUTES = 30;
    const TRIP_TAB_LEAVE_MS = 220;
    const TRIP_TAB_ENTER_MS = 420;
    const ADVANCED_STAGE_TO_TAB = {
        upcoming: "upcoming",
        "in-transit": "in-transit",
        completed: "history",
        rejected: "history"
    };

    const advancedSearchToggle = document.getElementById("trip-advanced-search-toggle");
    const advancedSearchPanel = document.getElementById("trip-advanced-search-panel");
    const advancedSearchForm = document.getElementById("trip-advanced-search-form");
    const advancedSearchReset = document.getElementById("trip-advanced-reset");
    const advancedSearchAgainButtons = Array.from(document.querySelectorAll("[data-trip-search-again]"));
    const upcomingSection = document.querySelector('[data-trip-state="upcoming"]');
    const upcomingResultsCount = document.getElementById("upcoming-trip-results-count");
    const upcomingClearFilters = document.getElementById("upcoming-clear-filters");
    const upcomingList = document.getElementById("upcoming-trip-list");
    const upcomingEmptyCard = document.getElementById("upcoming-empty-card");
    const upcomingPagination = document.getElementById("upcoming-trip-pagination");
    const upcomingBulkAssignButton = document.getElementById("upcoming-bulk-assign");
    const upcomingSortTrigger = document.getElementById("upcoming-sort-trigger");
    const upcomingSortLabel = document.getElementById("upcoming-sort-label");
    const upcomingSortMenu = document.getElementById("upcoming-sort-menu");
    const inTransitResultsCount = document.getElementById("in-transit-trip-results-count");
    const inTransitList = document.getElementById("in-transit-trip-list");
    const inTransitEmptyCard = document.getElementById("in-transit-empty-card");
    const historyResultsCount = document.getElementById("history-trip-results-count");
    const historyList = document.getElementById("history-trip-list");
    const historyEmptyCard = document.getElementById("history-empty-card");
    const historyWeekPrevButton = document.getElementById("history-week-prev");
    const historyWeekNextButton = document.getElementById("history-week-next");
    const historyWeekLabel = document.getElementById("history-week-label");

    let upcomingCurrentPage = 1;
    const upcomingExpandedKeys = new Set();
    const assignmentSelections = new Map();
    const tripNotes = new Map();
    const visibleTripsByKey = new Map();
    let activeNotesTrip = null;
    let relayAssistantState = null;
    let activeTripTab = "";
    let tripTabLeaveTimer = null;
    let tripTabEnterTimer = null;
    let tripTabTransitionToken = 0;
    let pendingTripNavigation = null;
    let upcomingSortValue = "start-nearest";
    let advancedSearchCriteria = createEmptyAdvancedSearchCriteria();
    let selectedHistoryWeekStart = getWeekStartSunday(new Date());
    const UPCOMING_SORT_OPTIONS = [
        { value: "expiration-nearest", label: "Expiration", direction: "Nearest" },
        { value: "expiration-farthest", label: "Expiration", direction: "Farthest" },
        { value: "start-nearest", label: "Start date", direction: "Nearest" },
        { value: "start-farthest", label: "Start date", direction: "Farthest" },
        { value: "payout-lowest", label: "Payout", direction: "Lowest" },
        { value: "payout-highest", label: "Payout", direction: "Highest" },
        { value: "driver-asc", label: "Driver ID", direction: "Asc" },
        { value: "driver-desc", label: "Driver ID", direction: "Desc" },
        { value: "stops-fewest", label: "Stops", direction: "Fewest" },
        { value: "stops-most", label: "Stops", direction: "Most" }
    ];

    function createEmptyAdvancedSearchCriteria() {
        return {
            active: false,
            keyword: "",
            stages: [],
            workType: "",
            maxDistance: "",
            stops: "",
            startDateTime: null,
            endDateTime: null,
            locationType: "starting",
            facility: "",
            driverAssignment: "any"
        };
    }

    function getNavigationType() {
        const entries = typeof performance !== "undefined" && typeof performance.getEntriesByType === "function"
            ? performance.getEntriesByType("navigation")
            : [];

        if (entries && entries.length) {
            return entries[0].type;
        }

        if (typeof performance !== "undefined" && performance.navigation) {
            if (performance.navigation.type === 1) {
                return "reload";
            }
            if (performance.navigation.type === 2) {
                return "back_forward";
            }
        }

        return "navigate";
    }

    function resetBookedTripsOnReload() {
        if (getNavigationType() === "reload") {
            const contractTrips = loadBookedTrips().filter((trip) => isContractPanelTrip(trip));
            if (contractTrips.length) {
                saveBookedTrips(contractTrips);
            } else {
                sessionStorage.removeItem(BOOKED_TRIPS_STORAGE_KEY);
            }
        }
    }

    function clearTripTabTransitionTimers() {
        window.clearTimeout(tripTabLeaveTimer);
        window.clearTimeout(tripTabEnterTimer);
        tripTabLeaveTimer = null;
        tripTabEnterTimer = null;
    }

    function setTripTabButtons(tabName) {
        tabs.forEach((tab) => {
            const isActive = tab.dataset.tripTab === tabName;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    }

    function showTripStateImmediately(tabName) {
        states.forEach((state) => {
            const isActive = state.dataset.tripState === tabName;
            state.classList.toggle("active", isActive);
            state.classList.remove("is-entering", "is-leaving");
            state.hidden = !isActive;
            state.setAttribute("aria-hidden", isActive ? "false" : "true");
        });
        activeTripTab = tabName;
    }

    function activateTab(tabName, options = {}) {
        const { immediate = false } = options;
        const stateList = Array.from(states);
        const nextState = stateList.find((state) => state.dataset.tripState === tabName);
        if (!nextState) {
            return;
        }

        clearTripTabTransitionTimers();
        setTripTabButtons(tabName);

        const currentState = stateList.find((state) => state.classList.contains("active") && !state.hidden);
        if (immediate || !currentState || currentState === nextState) {
            showTripStateImmediately(tabName);
            return;
        }

        const transitionToken = ++tripTabTransitionToken;
        currentState.classList.remove("is-entering");
        currentState.classList.add("is-leaving");
        currentState.setAttribute("aria-hidden", "true");

        tripTabLeaveTimer = window.setTimeout(() => {
            if (transitionToken !== tripTabTransitionToken) {
                return;
            }

            currentState.hidden = true;
            currentState.classList.remove("active", "is-leaving");

            nextState.hidden = false;
            nextState.classList.add("is-entering");
            nextState.setAttribute("aria-hidden", "false");

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    if (transitionToken !== tripTabTransitionToken) {
                        return;
                    }

                    nextState.classList.add("active");
                    nextState.classList.remove("is-entering");
                });
            });

            tripTabEnterTimer = window.setTimeout(() => {
                if (transitionToken !== tripTabTransitionToken) {
                    return;
                }

                activeTripTab = tabName;
            }, TRIP_TAB_ENTER_MS);
        }, TRIP_TAB_LEAVE_MS);
    }

    function readTripNavigationTarget() {
        const params = new URLSearchParams(window.location.search);
        const tabName = params.get("tripTab");
        const loadKey = params.get("loadKey");
        const allowedTabs = new Set(["upcoming", "in-transit", "history"]);

        if (!allowedTabs.has(tabName) || !loadKey) {
            return null;
        }

        return { tabName, loadKey };
    }

    function clearTripNavigationTarget() {
        if (!window.history || typeof window.history.replaceState !== "function") {
            return;
        }

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete("tripTab");
        nextUrl.searchParams.delete("loadKey");
        const nextSearch = nextUrl.search || "";
        const nextHash = nextUrl.hash || "";
        window.history.replaceState({}, document.title, `${nextUrl.pathname}${nextSearch}${nextHash}`);
    }

    function hashString(text) {
        let hash = 0;
        for (let index = 0; index < text.length; index += 1) {
            hash = ((hash << 5) - hash) + text.charCodeAt(index);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function loadBookedTrips() {
        try {
            return JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || "[]");
        } catch (error) {
            console.warn("Unable to read booked trips.", error);
            return [];
        }
    }

    function saveBookedTrips(trips) {
        try {
            sessionStorage.setItem(BOOKED_TRIPS_STORAGE_KEY, JSON.stringify(trips));
        } catch (error) {
            console.warn("Unable to save booked trips.", error);
        }
    }

    function loadPatOrders() {
        try {
            return JSON.parse(sessionStorage.getItem(PAT_ORDER_STORAGE_KEY) || "[]");
        } catch (error) {
            console.warn("Unable to read Post A Truck orders.", error);
            return [];
        }
    }

    function savePatOrders(orders) {
        try {
            sessionStorage.setItem(PAT_ORDER_STORAGE_KEY, JSON.stringify(orders));
        } catch (error) {
            console.warn("Unable to save Post A Truck orders.", error);
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

    function syncPatOrderStatusFromTripRecord(tripRecord) {
        if (!tripRecord?.patOrderId) {
            return;
        }

        const nextStatus = tripRecord.status === "history" ? "history" : "matched";
        const historyMessage = isRejectedHistoryTrip(tripRecord)
            ? "This load was rejected and moved to History"
            : "This load was completed and moved to History";
        const historyTone = isRejectedHistoryTrip(tripRecord) ? "warning" : "success";
        let didChange = false;
        const nextOrders = loadPatOrders().map((order) => {
            if (order.id !== tripRecord.patOrderId) {
                return order;
            }

            const nextOrder = { ...order };
            if (nextOrder.status !== nextStatus) {
                nextOrder.status = nextStatus;
                didChange = true;
            }

            if (nextStatus === "history" && nextOrder.autoMessage !== historyMessage) {
                nextOrder.autoMessage = historyMessage;
                nextOrder.autoTone = historyTone;
                didChange = true;
            }

            return nextOrder;
        });

        if (didChange) {
            savePatOrders(nextOrders);
        }
    }

    function syncPatOrdersFromBookedTrips() {
        loadBookedTrips().forEach((trip) => {
            syncPatOrderStatusFromTripRecord(trip);
        });
    }

    function updateBookedTrip(loadKey, updater) {
        const trips = loadBookedTrips();
        let updatedRecord = null;
        const updatedTrips = trips.map((trip) => {
            if (trip.loadKey !== loadKey) {
                return trip;
            }
            updatedRecord = updater({ ...trip });
            return updatedRecord;
        });
        saveBookedTrips(updatedTrips);
        return updatedRecord;
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

        const parsedFallback = new Date(fallbackLabel);
        return Number.isNaN(parsedFallback.getTime()) ? null : parsedFallback;
    }

    function formatTripDateTime(date, fallbackLabel) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return fallbackLabel || "--";
        }

        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZoneName: "short"
        }).replace(/,/g, "");
    }

    function addMinutes(date, minutes) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return null;
        }
        return new Date(date.getTime() + (minutes * 60000));
    }

    function addDays(date, days) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return null;
        }

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate;
    }

    function startOfDay(date) {
        const nextDate = new Date(date);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate;
    }

    function getWeekStartSunday(date) {
        const safeDate = startOfDay(date);
        return addDays(safeDate, -safeDate.getDay());
    }

    function formatShortMonthDay(date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    }

    function formatHistoryWeekRange(weekStartDate) {
        const weekStart = getWeekStartSunday(weekStartDate);
        const weekEnd = addDays(weekStart, 6);
        return `${formatShortMonthDay(weekStart)} - ${formatShortMonthDay(weekEnd)}`;
    }

    function updateHistoryWeekLabel() {
        if (historyWeekLabel) {
            historyWeekLabel.textContent = formatHistoryWeekRange(selectedHistoryWeekStart);
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatNoteDate(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZoneName: "short"
        }).replace(",", "");
    }

    function readStoredTripNotes() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(TRIP_NOTES_STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch (error) {
            console.warn("Unable to read trip notes.", error);
            return {};
        }
    }

    function hydrateTripNotesFromStorage() {
        Object.entries(readStoredTripNotes()).forEach(([loadKey, notes]) => {
            if (Array.isArray(notes)) {
                tripNotes.set(loadKey, notes);
            }
        });
    }

    function persistTripNotes() {
        const serializableNotes = {};
        tripNotes.forEach((notes, loadKey) => {
            serializableNotes[loadKey] = notes;
        });

        try {
            sessionStorage.setItem(TRIP_NOTES_STORAGE_KEY, JSON.stringify(serializableNotes));
        } catch (error) {
            console.warn("Unable to save trip notes.", error);
        }
    }

    function addTripNote(trip, text, author = NOTE_AUTHOR) {
        if (!trip?.loadKey || !String(text || "").trim()) {
            return;
        }

        const nextNotes = [
            {
                text: String(text).trim(),
                author,
                createdAt: new Date().toISOString()
            },
            ...(tripNotes.get(trip.loadKey) || [])
        ];
        tripNotes.set(trip.loadKey, nextNotes);
        persistTripNotes();
    }

    function normalizeIssueText(text) {
        return String(text || "").replace(/\s+/g, " ").trim();
    }

    function summarizeIssueText(text, trip) {
        const cleanText = normalizeIssueText(text);
        const loadLabel = getTripDisplayCode(trip);
        if (!cleanText) {
            return `The user requested help with load ${loadLabel}, but did not provide issue details.`;
        }

        const words = cleanText.split(" ");
        const firstSentenceMatch = cleanText.match(/^(.{24,220}?[.!?])(?:\s|$)/);
        const briefText = firstSentenceMatch
            ? firstSentenceMatch[1]
            : words.slice(0, 30).join(" ");
        const needsEllipsis = !firstSentenceMatch && words.length > 30;

        return `The user is reporting an issue for load ${loadLabel}: ${briefText}${needsEllipsis ? "..." : ""}`;
    }

    function readSupportCases() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(SUPPORT_CASES_STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn("Unable to read support cases.", error);
            return [];
        }
    }

    function saveSupportCases(cases) {
        try {
            sessionStorage.setItem(SUPPORT_CASES_STORAGE_KEY, JSON.stringify(cases));
        } catch (error) {
            console.warn("Unable to save support cases.", error);
        }
    }

    function generateSupportCaseId(existingCases = readSupportCases()) {
        const usedIds = new Set(existingCases.map((supportCase) => supportCase.id));
        let caseId = "";

        do {
            let suffix = "";
            const seed = `${Date.now()}-${Math.random()}-${usedIds.size}`;
            let hashed = hashString(seed);
            for (let index = 0; index < 9; index += 1) {
                hashed = hashString(`${hashed}:${seed}:${index}`);
                suffix += SUPPORT_CASE_ALPHABET[hashed % SUPPORT_CASE_ALPHABET.length];
            }
            caseId = `S-${suffix}`;
        } while (usedIds.has(caseId));

        return caseId;
    }

    function formatSupportAttachmentSize(size) {
        const numericSize = Number(size) || 0;
        if (numericSize >= 1048576) {
            return `${(numericSize / 1048576).toFixed(1)} MB`;
        }
        if (numericSize >= 1024) {
            return `${Math.round(numericSize / 1024)} KB`;
        }
        return `${numericSize} B`;
    }

    function readAttachmentFile(file) {
        return new Promise((resolve) => {
            const baseAttachment = {
                name: file?.name || "Attachment",
                type: file?.type || "Unknown file",
                size: file?.size || 0,
                sizeLabel: formatSupportAttachmentSize(file?.size || 0)
            };

            if (!file || file.size > 262144 || typeof FileReader === "undefined") {
                resolve(baseAttachment);
                return;
            }

            try {
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    resolve({
                        ...baseAttachment,
                        dataUrl: typeof reader.result === "string" ? reader.result : ""
                    });
                });
                reader.addEventListener("error", () => resolve(baseAttachment));
                reader.addEventListener("abort", () => resolve(baseAttachment));
                reader.readAsDataURL(file);
            } catch (error) {
                console.warn("Unable to read support attachment.", error);
                resolve(baseAttachment);
            }
        });
    }

    function readSupportAttachments(fileList) {
        const files = Array.from(fileList || []);
        return Promise.all(files.map(readAttachmentFile));
    }

    function createSupportCaseFromTrip(trip, details) {
        const existingCases = readSupportCases();
        const createdAt = new Date().toISOString();
        const summary = summarizeIssueText(details.issueDescription, trip);
        const supportCase = {
            id: generateSupportCaseId(existingCases),
            status: "open",
            reason: details.reason || SUPPORT_CASE_REASON,
            subject: summary,
            issueDescription: normalizeIssueText(details.issueDescription),
            phone: details.phone,
            attachments: Array.isArray(details.attachments) ? details.attachments : [],
            source: "Relay Assistant",
            loadKey: trip.loadKey,
            loadCode: getTripDisplayCode(trip),
            tripCode: trip.tripCode,
            shipmentCode: trip.shipmentCode,
            createdAt,
            updatedAt: createdAt
        };

        saveSupportCases([supportCase, ...existingCases]);
        return supportCase;
    }

    function isValidSupportPhone(value) {
        return /^\d{3}-\d{3}-\d{4}$/.test(String(value || ""));
    }

    function formatSupportPhoneInput(value) {
        const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
        if (digits.length <= 3) {
            return digits;
        }
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    function parseMoney(value) {
        const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ""));
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    function getUpcomingSortOption(value = upcomingSortValue) {
        return UPCOMING_SORT_OPTIONS.find((option) => option.value === value) || UPCOMING_SORT_OPTIONS[2];
    }

    function getTripSortDateValue(date) {
        return date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : Number.POSITIVE_INFINITY;
    }

    function getTripExpirationSortValue(trip) {
        const expirationDate = parseTripDate(
            trip?.acceptanceExpiresAtIso
            || trip?.expirationDateTimeIso
            || trip?.acceptByIso
            || trip?.acceptByDateTimeIso,
            null
        );

        return getTripSortDateValue(expirationDate || trip?.pickupDate);
    }

    function getTripStartSortValue(trip) {
        return getTripSortDateValue(trip?.pickupDate);
    }

    function getTripPayoutSortValue(trip) {
        return Number(trip?.priceValue) || parseMoney(trip?.price);
    }

    function getTripDriverSortValue(trip) {
        return normalizeTripFilterText(
            trip?.driverOption
            || trip?.driverId
            || trip?.assignedDriverId
            || ""
        );
    }

    function getTripStopSortValue(trip) {
        return Number(trip?.stops)
            || (Array.isArray(trip?.routeStops) ? trip.routeStops.length : 0)
            || ((Number(trip?.segmentCount) || 1) + 1);
    }

    function compareTripTextValues(leftValue, rightValue, direction = "asc") {
        const leftBlank = !leftValue;
        const rightBlank = !rightValue;
        if (leftBlank && rightBlank) return 0;
        if (leftBlank) return 1;
        if (rightBlank) return -1;

        const result = leftValue.localeCompare(rightValue, undefined, {
            numeric: true,
            sensitivity: "base"
        });

        return direction === "desc" ? -result : result;
    }

    function compareUpcomingTrips(left, right) {
        let result = 0;

        switch (upcomingSortValue) {
            case "expiration-nearest":
                result = getTripExpirationSortValue(left) - getTripExpirationSortValue(right);
                break;
            case "expiration-farthest":
                result = getTripExpirationSortValue(right) - getTripExpirationSortValue(left);
                break;
            case "start-farthest":
                result = getTripStartSortValue(right) - getTripStartSortValue(left);
                break;
            case "payout-lowest":
                result = getTripPayoutSortValue(left) - getTripPayoutSortValue(right);
                break;
            case "payout-highest":
                result = getTripPayoutSortValue(right) - getTripPayoutSortValue(left);
                break;
            case "driver-asc":
                result = compareTripTextValues(getTripDriverSortValue(left), getTripDriverSortValue(right), "asc");
                break;
            case "driver-desc":
                result = compareTripTextValues(getTripDriverSortValue(left), getTripDriverSortValue(right), "desc");
                break;
            case "stops-fewest":
                result = getTripStopSortValue(left) - getTripStopSortValue(right);
                break;
            case "stops-most":
                result = getTripStopSortValue(right) - getTripStopSortValue(left);
                break;
            case "start-nearest":
            default:
                result = getTripStartSortValue(left) - getTripStartSortValue(right);
                break;
        }

        return result || (getTripStartSortValue(left) - getTripStartSortValue(right));
    }

    function renderUpcomingSortControl() {
        const activeOption = getUpcomingSortOption();

        if (upcomingSortLabel) {
            upcomingSortLabel.textContent = activeOption.label;
        }

        if (upcomingSortMenu) {
            upcomingSortMenu.querySelectorAll("[data-upcoming-sort]").forEach((button) => {
                button.classList.toggle("is-active", button.dataset.upcomingSort === activeOption.value);
            });
        }
    }

    function toggleUpcomingSortMenu(forceOpen = null) {
        if (!upcomingSortMenu || !upcomingSortTrigger) {
            return;
        }

        const shouldOpen = forceOpen === null ? upcomingSortMenu.hidden : Boolean(forceOpen);
        upcomingSortMenu.hidden = !shouldOpen;
        upcomingSortTrigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }

    function formatMoney(value) {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatDuration(totalMinutes) {
        const safeMinutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
        const totalHours = Math.floor(safeMinutes / 60);
        const remainingMinutes = safeMinutes % 60;
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;

        if (days > 0) {
            return remainingMinutes
                ? `${days}d ${hours}h ${remainingMinutes}m`
                : `${days}d ${hours}h`;
        }

        if (hours > 0) {
            return remainingMinutes
                ? `${hours}h ${remainingMinutes}m`
                : `${hours}h`;
        }

        return `${remainingMinutes}m`;
    }

    function formatDateInputValue(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function formatTimeInputValue(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "";
        }

        return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }

    function parseInputDateTime(dateValue, timeValue) {
        if (!dateValue || !timeValue) {
            return null;
        }

        const [year, month, day] = dateValue.split("-").map(Number);
        const [hours, minutes] = timeValue.split(":").map(Number);
        const parsed = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function roundUpToMinutes(date, minutes) {
        const intervalMs = minutes * 60000;
        return new Date(Math.ceil(date.getTime() / intervalMs) * intervalMs);
    }

    function formatStartsIn(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "--";
        }

        const diffMs = date.getTime() - Date.now();
        if (diffMs <= 0) {
            return "Starting";
        }

        const totalMinutes = Math.max(1, Math.ceil(diffMs / 60000));
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) {
            return `${days}d ${hours}h`;
        }

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    }

    function buildFacilityAddress(code, city, seed) {
        const zip = String(10000 + (seed % 89999)).padStart(5, "0");
        return {
            line1: `${100 + (seed % 9800)} ${STREETS[seed % STREETS.length]}`,
            line2: `${city} ${zip}`,
            shortCode: code
        };
    }

    function normalizeEquipmentLabel(label) {
        if (String(label || "").includes("Container")) {
            return "53' Container and Chassis";
        }

        return label || "53' Trailer";
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

    function tripHasRequiredTrailerNumber(trip, assignment = null) {
        if (!isTrailerRequiredTrip(trip)) {
            return true;
        }

        return Boolean(normalizeCarrierTrailerNumber(assignment?.trailerId || trip?.trailerId));
    }

    function getTripEquipmentStatusKind(trip) {
        return String(trip?.equipment || trip?.displayEquipment || "").includes("Container") ? "container" : "trailer";
    }

    function normalizeTripEquipmentStatusState(state) {
        return String(state || "").toLowerCase() === "empty" ? "empty" : "loaded";
    }

    function getTripEquipmentStatusLabel(status) {
        const state = normalizeTripEquipmentStatusState(status?.state);
        const kind = status?.kind === "container" ? "container" : "trailer";
        return `${state === "loaded" ? "Loaded" : "Empty"} ${kind}`;
    }

    function normalizeTripEquipmentStatus(status, trip) {
        if (!status) {
            return null;
        }

        return {
            state: normalizeTripEquipmentStatusState(status.state),
            kind: status.kind === "container" ? "container" : getTripEquipmentStatusKind(trip)
        };
    }

    function buildTripSegmentEquipmentStatuses(trip, segmentCount, seed, isBlockLoad, isShuffleLoad) {
        if (isBlockLoad) {
            return [];
        }

        const storedStatuses = Array.isArray(trip.segmentEquipmentStatuses) ? trip.segmentEquipmentStatuses : [];
        const count = Math.max(1, Number(segmentCount) || 1);
        const kind = getTripEquipmentStatusKind(trip);
        const isLiveLoad = String(trip.loadType || "").toLowerCase().includes("live");
        const shouldForceLoaded = isShuffleLoad || isLiveLoad;

        return Array.from({ length: count }, (_, segmentIndex) => {
            if (shouldForceLoaded) {
                return { state: "loaded", kind };
            }

            const storedStatus = normalizeTripEquipmentStatus(storedStatuses[segmentIndex], trip);
            if (storedStatus) {
                return storedStatus;
            }

            const state = hashString(`${seed}:trip-equipment-state:${trip.originCode}:${trip.destinationCode}:${segmentIndex}`) % 3 === 0 ? "empty" : "loaded";
            return { state, kind };
        });
    }

    function getTripSegmentEquipmentStatus(trip, segmentIndex = 0) {
        if (trip?.isBlockLoad) {
            return null;
        }

        if (Array.isArray(trip?.segmentEquipmentStatuses) && trip.segmentEquipmentStatuses.length) {
            return normalizeTripEquipmentStatus(
                trip.segmentEquipmentStatuses[Math.min(Math.max(0, segmentIndex), trip.segmentEquipmentStatuses.length - 1)],
                trip
            );
        }

        return normalizeTripEquipmentStatus({ state: "loaded", kind: getTripEquipmentStatusKind(trip) }, trip);
    }

    function renderTripEquipmentStatusIndicator(status) {
        if (!status) {
            return "";
        }

        const normalizedStatus = normalizeTripEquipmentStatus(status, { equipment: status.kind === "container" ? "53' Container" : "53' Trailer" });
        const label = getTripEquipmentStatusLabel(normalizedStatus);
        const state = normalizeTripEquipmentStatusState(normalizedStatus.state);

        return `<span class="trip-equipment-load-indicator is-${state}" data-tooltip="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"></span>`;
    }

    function renderTripEquipmentLabel(trip, status = null) {
        return `
            <span class="trip-equipment-label">
                ${renderTripEquipmentStatusIndicator(status)}
                <strong>${escapeHtml(trip.displayEquipment)}</strong>
            </span>
        `;
    }

    function normalizeLoadType(label) {
        if (String(label || "").includes("UIIA")) {
            return "Drop";
        }

        if (label === "Drop and hook") {
            return "Drop";
        }
        return label || "Drop";
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

    function getTripDisplayCode(trip) {
        return trip?.segmentCount > 1 ? trip.tripCode : trip.shipmentCode;
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
            phase: match[2],
            stopIndex: Number(match[1]) - 1
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

    function normalizeTripEventMap(record, stopCount) {
        const normalized = { ...(record || {}) };

        getStopCountTimeSequence(stopCount).forEach((eventKey) => {
            const legacyKey = getLegacyTripEventKey(eventKey, stopCount);
            if (!legacyKey || normalized[eventKey] !== undefined || record?.[legacyKey] === undefined) {
                return;
            }

            normalized[eventKey] = record[legacyKey];
        });

        return normalized;
    }

    function buildLegacyRouteStops(trip, seed, pickupDate, pickupDeparture, deliveryDate, deliveryDeparture) {
        return [{
            number: 1,
            code: trip.originCode,
            city: trip.originCity,
            market: trip.originCity,
            role: "pickup",
            address: buildFacilityAddress(trip.originCode, trip.originCity, seed),
            arrivalDate: pickupDate,
            departureDate: pickupDeparture
        }, {
            number: 2,
            code: trip.destinationCode,
            city: trip.destinationCity,
            market: trip.destinationCity,
            role: "delivery",
            address: buildFacilityAddress(trip.destinationCode, trip.destinationCity, seed + 13),
            arrivalDate: deliveryDate,
            departureDate: deliveryDeparture
        }];
    }

    function buildFallbackRouteSegments(routeStops, trip) {
        const totalMiles = Math.max(1, Number(trip.miles) || 0);
        const totalDurationMinutes = Math.max(
            120,
            Math.round(((routeStops[routeStops.length - 1]?.arrivalDate?.getTime?.() || 0) - (routeStops[0]?.departureDate?.getTime?.() || 0)) / 60000)
        );

        return routeStops.slice(0, -1).map((stop, segmentIndex) => ({
            index: segmentIndex + 1,
            fromNumber: stop.number,
            toNumber: routeStops[segmentIndex + 1].number,
            fromCode: stop.code,
            toCode: routeStops[segmentIndex + 1].code,
            miles: segmentIndex === routeStops.length - 2
                ? totalMiles
                : Math.max(30, Math.round(totalMiles / (routeStops.length - 1))),
            durationMinutes: totalDurationMinutes
        }));
    }

    function normalizeTripRouteData(trip, seed, pickupDate, pickupDeparture, deliveryDate, deliveryDeparture) {
        const storedStops = Array.isArray(trip.routeStops) && trip.routeStops.length >= 2
            ? trip.routeStops
            : [];
        const routeStops = storedStops.length
            ? storedStops.map((stop, stopIndex) => {
                const arrivalDate = parseTripDate(stop.arrivalIso, null) || (stopIndex === 0 ? pickupDate : deliveryDate);
                const departureDate = parseTripDate(stop.departureIso, null) || addMinutes(arrivalDate, STOP_DWELL_MINUTES);

                return {
                    number: stop.number || stopIndex + 1,
                    code: stop.code || buildFacilityAddress(`${stopIndex + 1}`, stop.city || stop.market || "", seed + (stopIndex * 7)).shortCode,
                    city: stop.city || stop.market || "",
                    market: stop.market || stop.city || "",
                    role: stop.role || (stopIndex === 0 ? "pickup" : (stopIndex === storedStops.length - 1 ? "delivery" : "transfer")),
                    address: stop.address || buildFacilityAddress(stop.code || `STP${stopIndex + 1}`, stop.city || stop.market || "", seed + (stopIndex * 17)),
                    arrivalDate,
                    departureDate
                };
            })
            : buildLegacyRouteStops(trip, seed, pickupDate, pickupDeparture, deliveryDate, deliveryDeparture);

        const storedSegments = Array.isArray(trip.routeSegments) && trip.routeSegments.length === routeStops.length - 1
            ? trip.routeSegments
            : buildFallbackRouteSegments(routeStops, trip);
        const routeSegments = storedSegments.map((segment, segmentIndex) => ({
            index: segment.index || segmentIndex + 1,
            fromNumber: segment.fromNumber || routeStops[segmentIndex].number,
            toNumber: segment.toNumber || routeStops[segmentIndex + 1].number,
            fromCode: segment.fromCode || routeStops[segmentIndex].code,
            toCode: segment.toCode || routeStops[segmentIndex + 1].code,
            miles: Math.max(1, Number(segment.miles) || 0),
            durationMinutes: Math.max(
                90,
                Number(segment.durationMinutes)
                || Math.round(((routeStops[segmentIndex + 1].arrivalDate?.getTime?.() || 0) - (routeStops[segmentIndex].departureDate?.getTime?.() || 0)) / 60000)
            )
        }));

        return {
            routeStops,
            routeSegments
        };
    }

    function buildTripSegmentLoads(trip, routeStops, routeSegments, seed, segmentEquipmentStatuses = []) {
        const totalMiles = Math.max(1, routeSegments.reduce((sum, segment) => sum + segment.miles, 0));
        const totalCents = Math.round((Number(trip.priceValue) || parseMoney(trip.price)) * 100);
        let allocatedCents = 0;

        return routeSegments.map((segment, segmentIndex) => {
            const fromStop = routeStops[segmentIndex];
            const toStop = routeStops[segmentIndex + 1];
            const segmentCents = segmentIndex === routeSegments.length - 1
                ? Math.max(0, totalCents - allocatedCents)
                : Math.round(totalCents * (segment.miles / totalMiles));
            allocatedCents += segmentCents;

            return {
                index: segmentIndex + 1,
                shipmentCode: buildShipmentCode(
                    seed + 97 + (segmentIndex * 47),
                    `${trip.loadKey || trip.originCode || "trip"}:segment:${segmentIndex + 1}:${fromStop?.code || "from"}:${toStop?.code || "to"}`
                ),
                fromStop,
                toStop,
                miles: segment.miles,
                durationMinutes: segment.durationMinutes,
                durationLabel: formatDuration(segment.durationMinutes),
                priceValue: segmentCents / 100,
                price: formatMoney(segmentCents / 100),
                pricePerMileValue: (segmentCents / 100) / Math.max(segment.miles, 1),
                pricePerMile: `${formatMoney((segmentCents / 100) / Math.max(segment.miles, 1))}/mi`,
                equipmentStatus: normalizeTripEquipmentStatus(segmentEquipmentStatuses[segmentIndex], trip)
            };
        });
    }

    function renderSelectOptions(options, selectedValue, placeholderLabel = "") {
        const normalizedValue = selectedValue ?? "";
        const placeholderOption = placeholderLabel
            ? `<option value=""${normalizedValue ? "" : " selected"}>${escapeHtml(placeholderLabel)}</option>`
            : "";

        return placeholderOption + options
            .map((option) => `<option value="${escapeHtml(option)}"${option === normalizedValue ? " selected" : ""}>${escapeHtml(option)}</option>`)
            .join("");
    }

    function renderTripDriverTypeIcons(driverType) {
        const isTeam = driverType === "Team";
        const label = isTeam ? "Team driver load" : "Solo driver load";
        return `
            <span class="trip-driver-type-icons" role="img" aria-label="${label}" title="${label}">
                <span class="trip-driver-type-person"></span>
                ${isTeam ? '<span class="trip-driver-type-person is-secondary"></span>' : ""}
            </span>
        `;
    }

    function buildTrailerOptions(defaultTrailerId, selectedTrailerId) {
        return Array.from(new Set([selectedTrailerId, defaultTrailerId, ...TRAILER_OPTIONS].filter(Boolean)));
    }

    function buildSegmentDefaultTrailerId(seed, segmentIndex) {
        return `DZNG HV${2203000 + ((seed + (segmentIndex * 137)) % 9000)}`;
    }

    function normalizeTripSegmentAssignments(trip, segmentCount, seed) {
        const savedAssignment = assignmentSelections.get(trip.loadKey) || {};
        const storedAssignments = Array.isArray(trip.segmentAssignments) ? trip.segmentAssignments : [];
        const sessionAssignments = Array.isArray(savedAssignment.segmentAssignments) ? savedAssignment.segmentAssignments : [];
        const requiresCarrierTrailerNumber = isTrailerRequiredTrip(trip);

        return Array.from({ length: Math.max(0, segmentCount) }, (_, segmentIndex) => {
            const rawAssignment = {
                ...(storedAssignments[segmentIndex] || {}),
                ...(sessionAssignments[segmentIndex] || {})
            };
            const requestedDriverOption = rawAssignment.driverOption || "";
            const requestedTractorOption = rawAssignment.tractorOption || rawAssignment.tractorId || "";
            const driverOption = DRIVER_OPTIONS.includes(requestedDriverOption) ? requestedDriverOption : "";
            const tractorOption = TRACTOR_OPTIONS.includes(requestedTractorOption) ? requestedTractorOption : "";
            const defaultTrailerId = requiresCarrierTrailerNumber ? "" : buildSegmentDefaultTrailerId(seed, segmentIndex);
            const trailerId = requiresCarrierTrailerNumber
                ? normalizeCarrierTrailerNumber(rawAssignment.trailerId)
                : (rawAssignment.trailerId || "");

            return {
                driverOption,
                tractorOption,
                tractorId: tractorOption,
                trailerId,
                defaultTrailerId,
                trailerOptions: requiresCarrierTrailerNumber ? [] : buildTrailerOptions(defaultTrailerId, trailerId)
            };
        });
    }

    function getTripHistoryStatus(trip) {
        if ((trip?.status || "upcoming") !== "history") {
            return "";
        }

        if (isRejectedHistoryTrip(trip)) {
            return "rejected";
        }

        if (isCanceledHistoryTrip(trip)) {
            return "canceled";
        }

        return trip?.historyStatus || "completed";
    }

    function isLockedHistoryTrip(trip) {
        return (trip?.status || "upcoming") === "history" && !isRejectedHistoryTrip(trip);
    }

    function isHiddenUpcomingBlockTrip(trip) {
        return Boolean(trip?.isBlockLoad) && !trip?.blockDetailsAvailable && (trip?.status || "upcoming") === "upcoming";
    }

    function renderTripFinalAssignmentValue(value, fallback = "Not assigned") {
        return escapeHtml(value || fallback);
    }

    function normalizeBookedTrip(trip, index) {
        const seed = hashString(trip.loadKey || `${trip.originCode}-${trip.destinationCode}-${index}`);
        const pickupDate = parseTripDate(trip.pickupDateTimeIso, trip.pickupWindow);
        const deliveryDate = parseTripDate(trip.deliveryDateTimeIso, trip.deliveryWindow);
        const pickupDeparture = parseTripDate(trip.pickupDepartureDateTimeIso, null) || addMinutes(pickupDate, STOP_DWELL_MINUTES);
        const deliveryDeparture = parseTripDate(trip.deliveryDepartureDateTimeIso, null) || addMinutes(deliveryDate, STOP_DWELL_MINUTES);
        const isBlockLoad = Boolean(trip.isBlockLoad) || String(trip.workType || "") === "Block";
        const isShuffleLoad = Boolean(trip.isShuffleLoad) || String(trip.workType || "") === "Shuffle";
        const blockRevealAt = parseTripDate(trip.blockRevealAtIso, null) || (isBlockLoad ? addMinutes(pickupDate, -900) : null);
        const blockDetailsAvailable = !isBlockLoad
            || !(blockRevealAt instanceof Date)
            || Number.isNaN(blockRevealAt.getTime())
            || Date.now() >= blockRevealAt.getTime();
        const routeSourceTrip = isBlockLoad && blockDetailsAvailable && Array.isArray(trip.hiddenRouteStops) && trip.hiddenRouteStops.length >= 3
            ? {
                ...trip,
                routeStops: trip.hiddenRouteStops,
                routeSegments: Array.isArray(trip.hiddenRouteSegments) ? trip.hiddenRouteSegments : trip.routeSegments
            }
            : trip;
        const { routeStops, routeSegments } = normalizeTripRouteData(routeSourceTrip, seed, pickupDate, pickupDeparture, deliveryDate, deliveryDeparture);
        const actualTimes = normalizeTripEventMap(trip.actualTimes || {}, routeStops.length);
        const lateEvents = normalizeTripEventMap(trip.lateEvents || {}, routeStops.length);
        const delayEvents = normalizeTripEventMap(trip.delayEvents || {}, routeStops.length);
        const savedAssignment = assignmentSelections.get(trip.loadKey) || {};
        const requiresCarrierTrailerNumber = isTrailerRequiredTrip(trip);
        const defaultTrailerId = requiresCarrierTrailerNumber ? "" : `DZNG HV${2203000 + (seed % 9000)}`;
        const savedTrailerId = savedAssignment.trailerId ?? trip.trailerId ?? "";
        const trailerId = requiresCarrierTrailerNumber
            ? normalizeCarrierTrailerNumber(savedTrailerId)
            : (savedTrailerId || defaultTrailerId);
        const trailerOptions = requiresCarrierTrailerNumber ? [] : buildTrailerOptions(defaultTrailerId, trailerId);
        const requestedDriverOption = savedAssignment.driverOption ?? trip.driverOption ?? "";
        const driverOption = DRIVER_OPTIONS.includes(requestedDriverOption) ? requestedDriverOption : "";
        const requestedTractorOption = savedAssignment.tractorOption ?? trip.tractorOption ?? "";
        const tractorOption = TRACTOR_OPTIONS.includes(requestedTractorOption) ? requestedTractorOption : "";
        const tractorId = tractorOption;
        const isMultiStopTrip = routeSegments.length > 1;
        const tripCode = buildTripCode(seed, trip.loadKey || `${trip.originCode}-${trip.destinationCode}`);
        const shipmentCode = buildShipmentCode(seed + 97, `${trip.loadKey || trip.originCode || "trip"}:primary`);
        const segmentEquipmentStatuses = buildTripSegmentEquipmentStatuses(trip, routeSegments.length, seed, isBlockLoad, isShuffleLoad);
        const segmentLoads = buildTripSegmentLoads(trip, routeStops, routeSegments, seed, segmentEquipmentStatuses);
        const segmentAssignments = normalizeTripSegmentAssignments(trip, routeSegments.length, seed);
        const originAddress = routeStops[0]?.address || buildFacilityAddress(trip.originCode, trip.originCity, seed);
        const destinationAddress = routeStops[routeStops.length - 1]?.address || buildFacilityAddress(trip.destinationCode, trip.destinationCity, seed + 13);
        const rejection = trip.rejection || null;
        const historyStatus = getTripHistoryStatus(trip);
        const normalizedMiles = routeSegments.reduce((sum, segment) => sum + segment.miles, 0) || trip.miles || 0;
        const overallPickupDate = routeStops[0]?.arrivalDate || pickupDate;
        const overallDeliveryDate = routeStops[routeStops.length - 1]?.arrivalDate || deliveryDate;

        return {
            ...trip,
            seed,
            tripCode,
            shipmentCode,
            driverOption,
            tractorOption,
            tractorId,
            trailerId,
            trailerOptions,
            pickupDate: overallPickupDate,
            deliveryDate: overallDeliveryDate,
            pickupDeparture: routeStops[0]?.departureDate || pickupDeparture,
            deliveryDeparture: routeStops[routeStops.length - 1]?.departureDate || deliveryDeparture,
            actualTimes,
            lateEvents,
            delayEvents,
            historyStatus,
            rejection,
            isBlockLoad,
            isShuffleLoad,
            blockRevealAt,
            blockDetailsAvailable,
            originAddress,
            destinationAddress,
            routeStops,
            routeSegments,
            segmentAssignments,
            segmentEquipmentStatuses,
            segmentLoads,
            segmentCount: routeSegments.length,
            loadCountLabel: `${routeSegments.length}/${routeSegments.length} Loads`,
            displayCode: isMultiStopTrip ? tripCode : shipmentCode,
            displayEquipment: normalizeEquipmentLabel(trip.equipment),
            displayLoadType: normalizeLoadType(trip.loadType),
            startsIn: formatStartsIn(overallPickupDate),
            pickupLabel: formatTripDateTime(overallPickupDate, trip.pickupWindow),
            deliveryLabel: formatTripDateTime(overallDeliveryDate, trip.deliveryWindow),
            pickupDepartureLabel: formatTripDateTime(routeStops[0]?.departureDate || pickupDeparture, trip.pickupWindow),
            deliveryDepartureLabel: formatTripDateTime(routeStops[routeStops.length - 1]?.departureDate || deliveryDeparture, trip.deliveryWindow),
            milesLabel: isBlockLoad && !blockDetailsAvailable ? "Block" : `${Math.round(normalizedMiles || 0)} mi`
        };
    }

    function renderTripStopCell(stopNumber, code, address) {
        return `
            <div class="trip-upcoming-stop-title">
                <span class="trip-upcoming-stop-badge">${stopNumber}</span>
                <strong>${code}</strong>
            </div>
            <div>${address.line1}</div>
            <div>${address.line2}</div>
        `;
    }

    function getTripSegmentIndex(segment = null) {
        return Math.max(0, (Number(segment?.index) || 1) - 1);
    }

    function getTripSegmentAssignment(trip, segment = null) {
        const segmentIndex = getTripSegmentIndex(segment);
        const rawAssignment = Array.isArray(trip?.segmentAssignments)
            ? trip.segmentAssignments[segmentIndex]
            : null;
        const requiresCarrierTrailerNumber = isTrailerRequiredTrip(trip);
        const fallbackTrailerId = requiresCarrierTrailerNumber
            ? normalizeCarrierTrailerNumber(trip?.trailerId)
            : (trip?.trailerId || rawAssignment?.defaultTrailerId || "");
        const trailerId = requiresCarrierTrailerNumber
            ? normalizeCarrierTrailerNumber(rawAssignment?.trailerId || fallbackTrailerId)
            : (rawAssignment?.trailerId || fallbackTrailerId);
        const trailerOptions = requiresCarrierTrailerNumber
            ? []
            : Array.from(new Set([
                trailerId,
                fallbackTrailerId,
                rawAssignment?.defaultTrailerId,
                ...(Array.isArray(rawAssignment?.trailerOptions) ? rawAssignment.trailerOptions : []),
                ...(Array.isArray(trip?.trailerOptions) ? trip.trailerOptions : [])
            ].filter(Boolean)));

        return {
            driverOption: rawAssignment?.driverOption || trip?.driverOption || "",
            tractorOption: rawAssignment?.tractorOption || trip?.tractorOption || "",
            tractorId: rawAssignment?.tractorOption || trip?.tractorOption || "",
            trailerId,
            trailerOptions
        };
    }

    function renderTripSegmentAssignmentAttributes(trip, segment, field) {
        if (segment && trip.segmentCount > 1) {
            return `data-trip-segment-assignment="${trip.loadKey}" data-segment-index="${getTripSegmentIndex(segment)}" data-assignment-field="${field}"`;
        }

        return `data-trip-assignment="${trip.loadKey}" data-assignment-field="${field}"`;
    }

    function renderTripEquipmentCell(trip, isPickup, segment = null) {
        const equipmentStatus = segment?.equipmentStatus || getTripSegmentEquipmentStatus(trip, 0);
        const segmentAssignment = getTripSegmentAssignment(trip, segment);

        if (isRejectedHistoryTrip(trip)) {
            return `
                <div class="trip-equipment-static-note">
                    <strong>Rejected before dispatch</strong>
                    <span>No driver or tractor assignment needed</span>
                </div>
                <div>${renderTripEquipmentLabel(trip, equipmentStatus)}</div>
                <div>${isPickup ? "Preloaded" : trip.displayLoadType}</div>
            `;
        }

        if (isCanceledHistoryTrip(trip)) {
            return `
                <div>${renderTripEquipmentLabel(trip, equipmentStatus)}</div>
                <div>${isPickup ? "Preloaded" : trip.displayLoadType}</div>
            `;
        }

        if (isLockedHistoryTrip(trip)) {
            return `
                <div class="trip-equipment-locked-row">
                    <span>Tractor ID</span>
                    <strong>${renderTripFinalAssignmentValue(segmentAssignment.tractorOption)}</strong>
                </div>
                <div>${renderTripEquipmentLabel(trip, equipmentStatus)}</div>
                <div class="trip-equipment-locked-row">
                    <span>Trailer ID</span>
                    <strong>${renderTripFinalAssignmentValue(segmentAssignment.trailerId)}</strong>
                </div>
                <div>${isPickup ? "Preloaded" : trip.displayLoadType}</div>
            `;
        }

        const showInlineTractorSelect = !(segment && trip.segmentCount > 1);
        const carrierTrailerInput = `
            <input
                class="${tripHasRequiredTrailerNumber(trip, segmentAssignment) ? "" : "is-invalid"}"
                type="text"
                inputmode="text"
                pattern="[A-Za-z0-9]{1,8}"
                maxlength="${CARRIER_TRAILER_NUMBER_MAX_LENGTH}"
                placeholder="Trailer #"
                value="${escapeHtml(segmentAssignment.trailerId)}"
                data-trip-trailer-required="true"
                ${renderTripSegmentAssignmentAttributes(trip, segment, "trailerId")}
            >
        `;

        return `
            ${showInlineTractorSelect ? `
                <label class="trip-equipment-select-row">
                    <span>Tractor ID</span>
                    <select ${renderTripSegmentAssignmentAttributes(trip, segment, "tractorOption")}>
                        ${renderSelectOptions(TRACTOR_OPTIONS, segmentAssignment.tractorOption, "Select tractor")}
                    </select>
                </label>
            ` : ""}
            <div>${renderTripEquipmentLabel(trip, equipmentStatus)}</div>
            <label class="trip-equipment-select-row">
                <span>Trailer ID</span>
                ${isTrailerRequiredTrip(trip) ? carrierTrailerInput : `
                    <select ${renderTripSegmentAssignmentAttributes(trip, segment, "trailerId")}>
                        ${renderSelectOptions(segmentAssignment.trailerOptions, segmentAssignment.trailerId)}
                    </select>
                `}
            </label>
            <div>${isPickup ? "Preloaded" : trip.displayLoadType}</div>
        `;
    }

    function renderTripAssignmentSummaryCell(trip) {
        if (isHiddenUpcomingBlockTrip(trip)) {
            return `
                <div class="trip-assignment-locked trip-assignment-pending">
                    <strong>Assignment locked</strong>
                    <span>Available later</span>
                </div>
            `;
        }

        if (isRejectedHistoryTrip(trip)) {
            return `
                <div class="trip-assignment-static">
                    <strong>Rejected load</strong>
                    <span>No driver or tractor assignment needed</span>
                </div>
            `;
        }

        if (isCanceledHistoryTrip(trip)) {
            return `
                <div class="trip-assignment-canceled">
                    <span class="trip-cancel-icon" aria-hidden="true">×</span>
                    <strong>Canceled</strong>
                </div>
            `;
        }

        if (isLockedHistoryTrip(trip)) {
            return `
                <div class="trip-assignment-locked">
                    <strong>${renderTripFinalAssignmentValue(trip.driverOption)}</strong>
                    <span>${renderTripFinalAssignmentValue(trip.tractorOption)}</span>
                </div>
            `;
        }

        return `
            <select class="${trip.driverOption ? "" : "is-invalid"}" data-trip-assignment="${trip.loadKey}" data-assignment-field="driverOption">
                ${renderSelectOptions(DRIVER_OPTIONS, trip.driverOption, "Select driver")}
            </select>
            <select data-trip-assignment="${trip.loadKey}" data-assignment-field="tractorOption">
                ${renderSelectOptions(TRACTOR_OPTIONS, trip.tractorOption, "Select tractor")}
            </select>
        `;
    }

    function getTripEventConfig(trip, eventKey) {
        const parsedEvent = parseTripEventKey(eventKey);
        const routeStops = Array.isArray(trip?.routeStops) && trip.routeStops.length
            ? trip.routeStops
            : [];

        if (!parsedEvent || !routeStops.length) {
            return {
                eventKey: "stop1Arrival",
                label: `${trip.originCode} arrival`,
                scheduleDate: trip.pickupDate,
                statusAfterSave: "in-transit",
                stopNumber: 1,
                phase: "Arrival"
            };
        }

        const stop = routeStops[Math.min(parsedEvent.stopIndex, routeStops.length - 1)];
        const isFinalDeparture = parsedEvent.phase === "Departure" && parsedEvent.stopNumber === routeStops.length;

        return {
            eventKey,
            label: `${stop.code} ${parsedEvent.phase.toLowerCase()}`,
            scheduleDate: parsedEvent.phase === "Arrival" ? stop.arrivalDate : stop.departureDate,
            statusAfterSave: isFinalDeparture ? "history" : "in-transit",
            stopNumber: parsedEvent.stopNumber,
            phase: parsedEvent.phase
        };
    }

    function getTripEventOptions(trip) {
        return getStopCountTimeSequence((trip?.routeStops || []).length || 2).map((eventKey) => ({
            eventKey,
            ...getTripEventConfig(trip, eventKey)
        }));
    }

    function getDelayEventOptions(trip) {
        return getStopCountTimeSequence((trip?.routeStops || []).length || 2).map((eventKey) => ({
            eventKey,
            ...getTripEventConfig(trip, eventKey)
        }));
    }

    function getDelayReasons(trip, eventKey) {
        const config = getTripEventConfig(trip, eventKey);
        const stopCount = (trip?.routeStops || []).length || 2;

        if (config.phase === "Arrival") {
            return config.stopNumber === 1
                ? DELAY_REASON_OPTIONS.pickupArrival
                : DELAY_REASON_OPTIONS.deliveryArrival;
        }

        return config.stopNumber === stopCount
            ? DELAY_REASON_OPTIONS.deliveryDeparture
            : DELAY_REASON_OPTIONS.pickupDeparture;
    }

    function hasTripCheckInAssignments(trip) {
        if (!trip || trip.segmentCount <= 1) {
            return Boolean(trip?.driverOption && trip?.tractorOption && tripHasRequiredTrailerNumber(trip));
        }

        return (trip.segmentLoads || []).every((segment) => {
            const assignment = getTripSegmentAssignment(trip, segment);
            return Boolean(assignment.driverOption && assignment.tractorOption && tripHasRequiredTrailerNumber(trip, assignment));
        });
    }

    function getNextTripTimeEventKey(trip) {
        return getStopCountTimeSequence((trip?.routeStops || []).length || 2)
            .find((eventKey) => !trip?.actualTimes?.[eventKey]) || "";
    }

    function getPreviousTripTimeEventKey(trip, eventKey) {
        const sequence = getStopCountTimeSequence((trip?.routeStops || []).length || 2);
        const eventIndex = sequence.indexOf(eventKey);
        return eventIndex > 0 ? sequence[eventIndex - 1] : "";
    }

    function getTripChronologyValidationMessage(trip, eventKey, estimatedDate) {
        if (!(estimatedDate instanceof Date) || Number.isNaN(estimatedDate.getTime())) {
            return "";
        }

        const previousEventKey = getPreviousTripTimeEventKey(trip, eventKey);
        if (!previousEventKey) {
            return "";
        }

        const previousActualDate = parseTripDate(trip?.actualTimes?.[previousEventKey], null);
        if (!(previousActualDate instanceof Date) || Number.isNaN(previousActualDate.getTime())) {
            return "";
        }

        if (estimatedDate.getTime() >= previousActualDate.getTime()) {
            return "";
        }

        const currentLabel = getTripEventConfig(trip, eventKey).label;
        const previousLabel = getTripEventConfig(trip, previousEventKey).label;
        return `${currentLabel} cannot be before ${previousLabel}. Enter a time after ${formatTripDateTime(previousActualDate, "--")}.`;
    }

    function getTripTimeEditDisabledReason(trip, eventKey) {
        if (isRejectedHistoryTrip(trip)) {
            return "Rejected loads cannot be edited";
        }

        if (!hasTripCheckInAssignments(trip)) {
            return "Assign driver and tractor before editing scheduled time";
        }

        const nextEventKey = getNextTripTimeEventKey(trip);
        if (!nextEventKey) {
            return "All trip times are already completed";
        }

        if (eventKey !== nextEventKey) {
            return "Complete the previous trip time first";
        }

        return "";
    }

    function isTripEventOverdueWithoutResponse(trip, eventKey, now = new Date()) {
        const tripStatus = trip?.status || "upcoming";
        if (tripStatus === "history" || isRejectedHistoryTrip(trip)) {
            return false;
        }

        const scheduledDate = getTripEventConfig(trip, eventKey).scheduleDate;
        const actualDate = parseTripDate(trip?.actualTimes?.[eventKey], null);
        const delay = trip?.delayEvents?.[eventKey];

        return scheduledDate instanceof Date
            && !Number.isNaN(scheduledDate.getTime())
            && scheduledDate.getTime() < now.getTime()
            && !actualDate
            && !delay;
    }

    function tripHasTimingAttention(trip) {
        return getStopCountTimeSequence((trip?.routeStops || []).length || 2)
            .some((eventKey) => isTripEventOverdueWithoutResponse(trip, eventKey));
    }

    function normalizeTripFilterText(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    function parseAdvancedDateTime(dateValue, timeValue, endOfDay = false) {
        if (!dateValue) {
            return null;
        }

        const safeTime = timeValue || (endOfDay ? "23:59" : "00:00");
        const parsed = new Date(`${dateValue}T${safeTime}`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function readAdvancedSearchCriteria() {
        const stages = Array.from(document.querySelectorAll("[data-advanced-stage]:checked"))
            .map((input) => input.value)
            .filter(Boolean);
        const driverAssignment = document.querySelector("[data-advanced-driver]:checked")?.value || "any";

        return {
            active: true,
            keyword: document.querySelector("[data-advanced-keyword]")?.value.trim() || "",
            stages,
            workType: document.querySelector("[data-advanced-work-type]")?.value || "",
            maxDistance: document.querySelector("[data-advanced-max-distance]")?.value || "",
            stops: document.querySelector("[data-advanced-stops]")?.value || "",
            startDateTime: parseAdvancedDateTime(
                document.querySelector("[data-advanced-start-date]")?.value || "",
                document.querySelector("[data-advanced-start-time]")?.value || "",
                false
            ),
            endDateTime: parseAdvancedDateTime(
                document.querySelector("[data-advanced-end-date]")?.value || "",
                document.querySelector("[data-advanced-end-time]")?.value || "",
                true
            ),
            locationType: document.querySelector("[data-advanced-location-type]")?.value || "starting",
            facility: document.querySelector("[data-advanced-facility]")?.value.trim() || "",
            driverAssignment
        };
    }

    function resetAdvancedSearchForm() {
        if (!advancedSearchForm) {
            return;
        }

        advancedSearchForm.reset();
        const startDate = advancedSearchForm.querySelector("[data-advanced-start-date]");
        const startTime = advancedSearchForm.querySelector("[data-advanced-start-time]");
        const endDate = advancedSearchForm.querySelector("[data-advanced-end-date]");
        const endTime = advancedSearchForm.querySelector("[data-advanced-end-time]");
        if (startDate) startDate.value = "2026-01-26";
        if (startTime) startTime.value = "04:00";
        if (endDate) endDate.value = "2026-07-26";
        if (endTime) endTime.value = "04:00";
    }

    function clearAdvancedSearchCriteria() {
        advancedSearchCriteria = createEmptyAdvancedSearchCriteria();
    }

    function getTripAdvancedStage(trip) {
        const status = trip?.status || "upcoming";
        if (status === "history") {
            return isRejectedHistoryTrip(trip) ? "rejected" : "completed";
        }

        return status;
    }

    function tripMatchesAdvancedStages(trip) {
        if (!advancedSearchCriteria.stages.length) {
            return true;
        }

        return advancedSearchCriteria.stages.includes(getTripAdvancedStage(trip));
    }

    function tripMatchesAdvancedDistance(trip) {
        const distanceValue = advancedSearchCriteria.maxDistance;
        if (!distanceValue) {
            return true;
        }

        const tripMiles = Number(trip?.miles) || 0;
        if (distanceValue === "500-plus") {
            return tripMiles >= 500;
        }

        return tripMiles <= Number(distanceValue);
    }

    function tripMatchesAdvancedStops(trip) {
        const stopsValue = advancedSearchCriteria.stops;
        if (!stopsValue) {
            return true;
        }

        const tripStops = Number(trip?.stops)
            || (Array.isArray(trip?.routeStops) ? trip.routeStops.length : 0)
            || ((Number(trip?.segmentCount) || 1) + 1);

        if (stopsValue === "5-plus") {
            return tripStops >= 5;
        }

        return tripStops === Number(stopsValue);
    }

    function tripMatchesAdvancedDateRange(trip) {
        const startTime = advancedSearchCriteria.startDateTime?.getTime?.();
        const endTime = advancedSearchCriteria.endDateTime?.getTime?.();
        const pickupTime = trip?.pickupDate?.getTime?.();

        if (!pickupTime) {
            return true;
        }

        if (Number.isFinite(startTime) && pickupTime < startTime) {
            return false;
        }

        if (Number.isFinite(endTime) && pickupTime > endTime) {
            return false;
        }

        return true;
    }

    function tripMatchesAdvancedLocation(trip) {
        const facility = normalizeTripFilterText(advancedSearchCriteria.facility);
        if (!facility) {
            return true;
        }

        if (advancedSearchCriteria.locationType === "starting") {
            return [
                trip?.originCode,
                trip?.originCity,
                trip?.originAddress?.line1,
                trip?.originAddress?.line2
            ].some((value) => normalizeTripFilterText(value).includes(facility));
        }

        if (advancedSearchCriteria.locationType === "ending") {
            return [
                trip?.destinationCode,
                trip?.destinationCity,
                trip?.destinationAddress?.line1,
                trip?.destinationAddress?.line2
            ].some((value) => normalizeTripFilterText(value).includes(facility));
        }

        return getTripRouteSearchValues(trip)
            .some((value) => normalizeTripFilterText(value).includes(facility));
    }

    function tripMatchesAdvancedDriverAssignment(trip) {
        switch (advancedSearchCriteria.driverAssignment) {
            case "assigned":
                return hasTripCheckInAssignments(trip);
            case "unassigned":
                return !hasTripCheckInAssignments(trip);
            default:
                return true;
        }
    }

    function tripMatchesAdvancedSearch(trip) {
        if (!advancedSearchCriteria.active) {
            return true;
        }

        return tripMatchesAdvancedStages(trip)
            && tripMatchesSearch(trip, advancedSearchCriteria.keyword)
            && tripMatchesWorkType(trip, advancedSearchCriteria.workType)
            && tripMatchesAdvancedDistance(trip)
            && tripMatchesAdvancedStops(trip)
            && tripMatchesAdvancedDateRange(trip)
            && tripMatchesAdvancedLocation(trip)
            && tripMatchesAdvancedDriverAssignment(trip);
    }

    function getTripHistoryWeekDate(trip) {
        return parseTripDate(trip?.pickupDateTimeIso, trip?.pickupWindow)
            || trip?.pickupDate
            || parseTripDate(trip?.completedAt, null);
    }

    function tripMatchesSelectedHistoryWeek(trip) {
        const tripDate = getTripHistoryWeekDate(trip);
        if (!(tripDate instanceof Date) || Number.isNaN(tripDate.getTime())) {
            return true;
        }

        const weekStart = getWeekStartSunday(selectedHistoryWeekStart);
        const weekEndExclusive = addDays(weekStart, 7);
        return tripDate.getTime() >= weekStart.getTime()
            && tripDate.getTime() < weekEndExclusive.getTime();
    }

    function getAdvancedSearchTargetTab(allTrips = getNormalizedBookedTrips()) {
        const firstMatchingTrip = allTrips.find((trip) => tripMatchesAdvancedSearch(trip));
        if (firstMatchingTrip) {
            return ADVANCED_STAGE_TO_TAB[getTripAdvancedStage(firstMatchingTrip)] || "upcoming";
        }

        const firstStage = advancedSearchCriteria.stages[0];
        return ADVANCED_STAGE_TO_TAB[firstStage] || "upcoming";
    }

    function syncAdvancedSearchResultChrome() {
        const isAdvancedResult = Boolean(advancedSearchCriteria.active) && (!advancedSearchPanel || advancedSearchPanel.hidden);

        states.forEach((state) => {
            state.classList.toggle("is-advanced-result", isAdvancedResult);
        });

        advancedSearchAgainButtons.forEach((button) => {
            button.hidden = !isAdvancedResult;
        });
    }

    function showAdvancedSearchPanel() {
        clearTripTabTransitionTimers();
        if (advancedSearchPanel) {
            advancedSearchPanel.hidden = false;
        }
        if (advancedSearchToggle) {
            advancedSearchToggle.classList.add("is-active");
            advancedSearchToggle.setAttribute("aria-expanded", "true");
        }
        tabs.forEach((tab) => {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        });
        states.forEach((state) => {
            state.hidden = true;
            state.classList.remove("active", "is-entering", "is-leaving");
            state.setAttribute("aria-hidden", "true");
        });
        syncAdvancedSearchResultChrome();
    }

    function hideAdvancedSearchPanel(targetTab = activeTripTab || "upcoming") {
        if (advancedSearchPanel) {
            advancedSearchPanel.hidden = true;
        }
        if (advancedSearchToggle) {
            advancedSearchToggle.classList.remove("is-active");
            advancedSearchToggle.setAttribute("aria-expanded", "false");
        }
        activateTab(targetTab, { immediate: true });
        syncAdvancedSearchResultChrome();
    }

    function getTripFilterState(status) {
        const section = document.querySelector(`[data-trip-state="${status}"]`);

        return {
            search: section?.querySelector(`[data-trip-search="${status}"]`)?.value.trim() || "",
            domicile: section?.querySelector(`[data-trip-filter-state="${status}"][data-trip-filter="domicile"]`)?.value || "",
            disruption: section?.querySelector(`[data-trip-filter-state="${status}"][data-trip-filter="disruption"]`)?.value || "",
            workType: section?.querySelector(`[data-trip-filter-state="${status}"][data-trip-filter="workType"]`)?.value || "",
            program: section?.querySelector(`[data-trip-filter-state="${status}"][data-trip-filter="program"]`)?.value || "",
            needsAttention: Boolean(section?.querySelector(`[data-trip-needs-attention="${status}"]`)?.checked)
        };
    }

    function resetTripFilters(status) {
        const section = document.querySelector(`[data-trip-state="${status}"]`);
        if (!section) return;

        const searchInput = section.querySelector(`[data-trip-search="${status}"]`);
        if (searchInput) {
            searchInput.value = "";
        }

        section.querySelectorAll(`[data-trip-filter-state="${status}"]`).forEach((control) => {
            control.value = "";
        });

        const attentionToggle = section.querySelector(`[data-trip-needs-attention="${status}"]`);
        if (attentionToggle) {
            attentionToggle.checked = false;
        }
    }

    function getTripRouteSearchValues(trip) {
        const values = [
            trip?.originCode,
            trip?.destinationCode,
            trip?.originCity,
            trip?.destinationCity,
            trip?.originAddress?.line1,
            trip?.originAddress?.line2,
            trip?.destinationAddress?.line1,
            trip?.destinationAddress?.line2
        ];

        (trip?.routeStops || []).forEach((stop) => {
            values.push(
                stop?.code,
                stop?.city,
                stop?.market,
                stop?.address?.line1,
                stop?.address?.line2
            );
        });

        (trip?.routeSegments || []).forEach((segment) => {
            values.push(segment?.fromCode, segment?.toCode);
        });

        (trip?.segmentLoads || []).forEach((segmentLoad) => {
            values.push(
                segmentLoad?.shipmentCode,
                segmentLoad?.fromStop?.code,
                segmentLoad?.fromStop?.city,
                segmentLoad?.fromStop?.market,
                segmentLoad?.toStop?.code,
                segmentLoad?.toStop?.city,
                segmentLoad?.toStop?.market
            );
        });

        return values.filter((value) => value !== undefined && value !== null && value !== "");
    }

    function getTripSearchValues(trip) {
        const values = [
            trip?.loadKey,
            trip?.loadId,
            trip?.tripCode,
            trip?.shipmentCode,
            trip?.displayCode,
            getTripDisplayCode(trip),
            trip?.driverOption,
            trip?.tractorOption,
            trip?.tractorId,
            trip?.trailerId,
            trip?.equipment,
            trip?.displayEquipment,
            trip?.loadType,
            trip?.displayLoadType,
            trip?.workType,
            trip?.driverType,
            trip?.program,
            trip?.programName,
            trip?.boardProgram
        ];

        (trip?.segmentAssignments || []).forEach((assignment) => {
            values.push(
                assignment?.driverOption,
                assignment?.tractorOption,
                assignment?.tractorId,
                assignment?.trailerId,
                assignment?.defaultTrailerId
            );
        });

        return values.concat(getTripRouteSearchValues(trip));
    }

    function tripMatchesSearch(trip, searchText) {
        const tokens = normalizeTripFilterText(searchText).split(/\s+/).filter(Boolean);
        if (!tokens.length) {
            return true;
        }

        const haystack = getTripSearchValues(trip)
            .map((value) => normalizeTripFilterText(value))
            .join(" ");

        return tokens.every((token) => haystack.includes(token));
    }

    function tripMatchesDomicile(trip, domicile) {
        if (!domicile) {
            return true;
        }

        const normalizedDomicile = normalizeTripFilterText(domicile);
        const explicitDomicile = normalizeTripFilterText(trip?.domicile || trip?.domicileCode || trip?.homeDomicile);
        if (explicitDomicile) {
            return explicitDomicile === normalizedDomicile;
        }

        if (normalizedDomicile !== "bwi") {
            return true;
        }

        const bwiTerms = [
            "bwi",
            "baltimore",
            "maryland",
            "sparrows point",
            "hagerstown",
            "frederick",
            "jessup",
            "hanover"
        ];
        const routeText = getTripRouteSearchValues(trip)
            .map((value) => normalizeTripFilterText(value))
            .join(" ");

        return bwiTerms.some((term) => routeText.includes(term))
            || /,\s*md\b/.test(routeText);
    }

    function tripHasReportedDelay(trip) {
        return Object.values(trip?.delayEvents || {}).some(Boolean);
    }

    function tripHasUnreportedDelay(trip) {
        return getStopCountTimeSequence((trip?.routeStops || []).length || 2).some((eventKey) => {
            const hasDelayReport = Boolean(trip?.delayEvents?.[eventKey]);
            const hasActualTime = Boolean(parseTripDate(trip?.actualTimes?.[eventKey], null));
            const isMarkedLate = Boolean(trip?.lateEvents?.[eventKey]);
            if (hasDelayReport) {
                return false;
            }

            if (isMarkedLate) {
                return true;
            }

            return !hasActualTime && isTripEventOverdueWithoutResponse(trip, eventKey);
        });
    }

    function tripNeedsAssignmentAttention(trip) {
        return !isRejectedHistoryTrip(trip)
            && !isHiddenUpcomingBlockTrip(trip)
            && !hasTripCheckInAssignments(trip);
    }

    function tripNeedsAttentionForFilter(trip) {
        return tripNeedsAssignmentAttention(trip) || tripHasUnreportedDelay(trip);
    }

    function tripMatchesDisruption(trip, disruption) {
        switch (disruption) {
            case "unassigned":
                return tripNeedsAssignmentAttention(trip);
            case "delayed":
                return tripHasUnreportedDelay(trip);
            case "delay-reported":
                return tripHasReportedDelay(trip);
            default:
                return true;
        }
    }

    function getTripStopFacilityKey(stop, fallbackCode, fallbackCity) {
        const code = normalizeTripFilterText(stop?.code || fallbackCode);
        const city = normalizeTripFilterText(stop?.city || stop?.market || fallbackCity);
        if (code && city) {
            return `${code}|${city}`;
        }

        return code || city;
    }

    function isTripRoundTrip(trip) {
        if (trip?.isRoundTrip === true) {
            return true;
        }

        const routeStops = Array.isArray(trip?.routeStops) && trip.routeStops.length
            ? trip.routeStops
            : [];
        const firstStop = routeStops[0];
        const lastStop = routeStops[routeStops.length - 1];
        const firstKey = getTripStopFacilityKey(firstStop, trip?.originCode, trip?.originCity);
        const lastKey = getTripStopFacilityKey(lastStop, trip?.destinationCode, trip?.destinationCity);

        return Boolean(firstKey && lastKey && firstKey === lastKey);
    }

    function tripMatchesWorkType(trip, workType) {
        switch (workType) {
            case "round-trip":
                return isTripRoundTrip(trip);
            case "one-way":
                return !isTripRoundTrip(trip);
            default:
                return true;
        }
    }

    function tripMatchesProgram(trip, program) {
        if (!program) {
            return true;
        }

        if (program !== "contracts") {
            return true;
        }

        return isContractPanelTrip(trip);
    }

    function isContractPanelTrip(trip) {
        const source = normalizeTripFilterText(
            trip?.source
            || trip?.tripSource
            || trip?.bookingSource
            || ""
        );

        return source === "contracts"
            || source === "contract"
            || source === "contract-panel"
            || Boolean(trip?.contractDomicile);
    }

    function tripMatchesFilters(trip, status) {
        const filters = getTripFilterState(status);
        return tripMatchesSearch(trip, filters.search)
            && tripMatchesDomicile(trip, filters.domicile)
            && tripMatchesDisruption(trip, filters.disruption)
            && tripMatchesWorkType(trip, filters.workType)
            && tripMatchesProgram(trip, filters.program)
            && (!filters.needsAttention || tripNeedsAttentionForFilter(trip))
            && tripMatchesAdvancedSearch(trip);
    }

    function filterTripsForState(trips, status) {
        return trips.filter((trip) => tripMatchesFilters(trip, status));
    }

    function applyTripTimeEditAvailability(loadKey) {
        if (!loadKey) return;

        const trip = getNormalizedBookedTrips().find((candidate) => candidate.loadKey === loadKey);

        document.querySelectorAll(`[data-trip-key="${loadKey}"]`).forEach((card) => {
            card.querySelectorAll("[data-trip-time-edit]").forEach((button) => {
                const eventKey = button.dataset.timeEvent || buildTripEventKey(1, "Arrival");
                const disabledLabel = trip
                    ? getTripTimeEditDisabledReason(trip, eventKey)
                    : "Trip not found";
                const isReady = Boolean(trip) && !disabledLabel;

                button.disabled = !isReady;
                button.classList.toggle("is-disabled", !isReady);
                button.setAttribute("aria-label", isReady ? "Edit scheduled time" : disabledLabel);

                if (isReady) {
                    button.removeAttribute("title");
                } else {
                    button.setAttribute("title", disabledLabel);
                }
            });
        });
    }

    function applyTripDriverRequirementState(loadKey) {
        if (!loadKey) return;

        const trip = getNormalizedBookedTrips().find((candidate) => candidate.loadKey === loadKey);
        document.querySelectorAll(`[data-trip-key="${loadKey}"]`).forEach((card) => {
            card.classList.toggle("is-driver-required", card.dataset.tripStatus === "upcoming" && !hasTripCheckInAssignments(trip));
        });
    }

    function returnToLoadBoard() {
        const referrer = document.referrer || "";
        const cameFromLoadBoard = /loadboard\.html(?:[?#].*)?$/i.test(referrer);

        if (cameFromLoadBoard && window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = "loadboard.html";
    }

    function renderTripTimeCell(trip, eventKey) {
        const config = getTripEventConfig(trip, eventKey);
        const scheduledLabel = formatTripDateTime(config.scheduleDate, "--");
        if (isCanceledHistoryTrip(trip)) {
            return `
                <div class="trip-time-edit-line">
                    <span>${scheduledLabel}</span>
                </div>
            `;
        }

        const actualDate = parseTripDate(trip.actualTimes?.[eventKey], null);
        const isLate = Boolean(trip.lateEvents?.[eventKey]);
        const delay = trip.delayEvents?.[eventKey];
        const canReportDelay = !isRejectedHistoryTrip(trip);
        const disabledTimeLabel = getTripTimeEditDisabledReason(trip, eventKey);
        const canEditTime = !disabledTimeLabel;
        const delayDate = parseTripDate(delay?.estimatedTimeIso, null);
        const displayDate = actualDate || delayDate;
        const displayLabel = displayDate ? formatTripDateTime(displayDate, "--") : "";
        const displayValue = displayDate ? `<span>${displayLabel}+</span>` : "<span>--</span>";
        const showOverdueClock = isTripEventOverdueWithoutResponse(trip, eventKey);

        return `
            <div class="trip-time-edit-line${displayDate ? " has-student-time" : ""}">
                <button class="trip-time-edit-button${canEditTime ? "" : " is-disabled"}" type="button" data-trip-time-edit="${trip.loadKey}" data-time-event="${eventKey}" aria-label="${canEditTime ? "Edit scheduled time" : disabledTimeLabel}"${canEditTime ? "" : ` disabled title="${disabledTimeLabel}"`}>
                    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path d="M3 11.8 3.4 9.4 10.8 2 13.1 4.3 5.7 11.7 3 11.8Z"></path>
                        <path d="M9.8 3 12 5.2"></path>
                    </svg>
                </button>
                ${showOverdueClock ? `<span class="trip-overdue-clock" aria-label="Scheduled time passed without check-in or delay report" title="Scheduled time passed without check-in or delay report"></span>` : ""}
                ${delay ? `<span class="trip-delay-clock" data-delay-tooltip="${escapeHtml(delay.reason)}" aria-label="${escapeHtml(delay.reason)}"></span>` : ""}
                ${actualDate ? `<span class="trip-student-check">S</span>${displayValue}` : displayValue}
            </div>
            <div class="tiny muted">${displayDate ? `Sch ${scheduledLabel}` : scheduledLabel}</div>
            ${isLate ? `<div class="trip-time-late-flag">Late to appointment</div>` : ""}
            ${canReportDelay ? `<button type="button" data-trip-delay="${trip.loadKey}" data-time-event="${eventKey}">Report delay</button>` : ""}
        `;
    }

    function renderTripRefMeta(trip) {
        const tripStatus = trip.status || "upcoming";

        if (tripStatus === "history" && trip.historyStatus === "rejected") {
            return `
                <div class="trip-history-status-pill is-rejected">
                    <span class="trip-reject-icon" aria-hidden="true"></span>
                    <span>Rejected</span>
                </div>
                <div class="tiny trip-history-status-note">${escapeHtml(trip.rejection?.reason || "Reason not provided")}</div>
            `;
        }

        if (isCanceledHistoryTrip(trip)) {
            return `
                <div class="trip-history-status-pill is-canceled">
                    <span class="trip-cancel-icon" aria-hidden="true">×</span>
                    <span>Canceled</span>
                </div>
            `;
        }

        if (tripStatus === "in-transit") {
            return `
                <div class="trip-history-status-pill is-in-transit">
                    <span class="trip-history-status-dot" aria-hidden="true"></span>
                    <span>In transit</span>
                </div>
            `;
        }

        return `<div class="tiny muted">Spot</div>`;
    }

    function buildTripRejectionBanner(trip) {
        if (trip.historyStatus !== "rejected") {
            return "";
        }

        const rejectedAt = parseTripDate(trip.rejection?.rejectedAt, null);
        const rejectedAtLabel = rejectedAt ? formatTripDateTime(rejectedAt, "") : "";

        return `
            <div class="trip-rejection-banner">
                <span class="trip-reject-icon trip-reject-icon-banner" aria-hidden="true"></span>
                <div>
                    <strong>Rejected load</strong>
                    <div>Reason: ${escapeHtml(trip.rejection?.reason || "Reason not provided")}${rejectedAtLabel ? ` | ${escapeHtml(rejectedAtLabel)}` : ""}</div>
                </div>
            </div>
        `;
    }

    function buildTripCancellationBanner(trip) {
        if (!isCanceledHistoryTrip(trip)) {
            return "";
        }

        return `
            <div class="trip-cancellation-watermark" aria-hidden="true">Canceled</div>
        `;
    }

    function renderTripSegmentStatusMarkup(trip, segment) {
        const segmentComplete = Boolean(trip.actualTimes?.[buildTripEventKey(segment.toStop.number, "Departure")]);
        const segmentActive = !segmentComplete && (
            Boolean(trip.actualTimes?.[buildTripEventKey(segment.fromStop.number, "Departure")])
            || Boolean(trip.actualTimes?.[buildTripEventKey(segment.toStop.number, "Arrival")])
        );
        const label = segmentComplete
            ? "Segment completed"
            : (segmentActive ? "Segment in progress" : "Segment pending");

        return `
            <span class="trip-joined-segment-status${segmentComplete ? " is-complete" : ""}${segmentActive ? " is-active" : ""}" title="${label}" aria-label="${label}">
                ${segmentComplete ? "&#10003;" : "&#9711;"}
            </span>
        `;
    }

    function renderTripSegmentDriverCell(trip, segment) {
        const segmentAssignment = getTripSegmentAssignment(trip, segment);

        if (isRejectedHistoryTrip(trip) || isLockedHistoryTrip(trip)) {
            return `<div class="trip-joined-segment-assignment"><span>Driver</span><strong>${escapeHtml(segmentAssignment.driverOption || "Unassigned")}</strong></div>`;
        }

        return `
            <label class="trip-joined-segment-assignment trip-joined-segment-assignment-select">
                <span>Driver</span>
                <select class="${segmentAssignment.driverOption ? "" : "is-invalid"}" data-trip-segment-assignment="${trip.loadKey}" data-segment-index="${getTripSegmentIndex(segment)}" data-assignment-field="driverOption">
                    ${renderSelectOptions(DRIVER_OPTIONS, segmentAssignment.driverOption, "Select driver")}
                </select>
            </label>
        `;
    }

    function renderTripSegmentTractorCell(trip, segment) {
        const segmentAssignment = getTripSegmentAssignment(trip, segment);

        if (isRejectedHistoryTrip(trip) || isLockedHistoryTrip(trip)) {
            return `<div class="trip-joined-segment-assignment"><span>Tractor</span><strong>${escapeHtml(segmentAssignment.tractorOption || "Unassigned")}</strong></div>`;
        }

        return `
            <label class="trip-joined-segment-assignment trip-joined-segment-assignment-select">
                <span>Tractor</span>
                <select class="${segmentAssignment.tractorOption ? "" : "is-invalid"}" data-trip-segment-assignment="${trip.loadKey}" data-segment-index="${getTripSegmentIndex(segment)}" data-assignment-field="tractorOption">
                    ${renderSelectOptions(TRACTOR_OPTIONS, segmentAssignment.tractorOption, "Select tractor")}
                </select>
            </label>
        `;
    }

    function buildTripMultiStopDetailsMarkup(trip) {
        const finalStopNumber = trip.routeStops?.[trip.routeStops.length - 1]?.number || trip.stops || 2;

        return `
            <div class="trip-upcoming-details-toolbar">
                <div class="trip-upcoming-detail-code">${trip.tripCode}</div>
                <div class="trip-upcoming-toolbar-route">
                    <span><span class="trip-upcoming-stop-badge">1</span> ${trip.originCode}</span>
                    <span class="trip-arrow">&#8594;</span>
                    <span><span class="trip-upcoming-stop-badge">${finalStopNumber}</span> ${trip.destinationCode}</span>
                    <span class="trip-upcoming-toolbar-distance">${trip.milesLabel}</span>
                </div>
                <div class="trip-upcoming-toolbar-load-count">${trip.loadCountLabel}</div>
            </div>
            ${buildTripRejectionBanner(trip)}
            ${buildTripCancellationBanner(trip)}
            <div class="trip-joined-segment-stack">
                ${trip.segmentLoads.map((segment) => `
                    <section class="trip-joined-segment">
                        <div class="trip-joined-segment-toolbar">
                            <div class="trip-upcoming-detail-code">${segment.shipmentCode}</div>
                            <div class="trip-upcoming-toolbar-route">
                                <span><span class="trip-upcoming-stop-badge">${segment.fromStop.number}</span> ${segment.fromStop.code}</span>
                                <span class="trip-arrow">&#8594;</span>
                                <span><span class="trip-upcoming-stop-badge">${segment.toStop.number}</span> ${segment.toStop.code}</span>
                                <span class="trip-upcoming-toolbar-distance">${Math.round(segment.miles)} mi</span>
                                <span class="tiny muted">${segment.durationLabel}</span>
                            </div>
                            <div class="trip-joined-segment-price">
                                <strong>${segment.price}</strong>
                                <span>${segment.pricePerMile}</span>
                            </div>
                            ${renderTripSegmentDriverCell(trip, segment)}
                            ${renderTripSegmentTractorCell(trip, segment)}
                            <div class="trip-joined-segment-status-wrap">${renderTripSegmentStatusMarkup(trip, segment)}</div>
                        </div>
                        <div class="trip-upcoming-detail-grid trip-upcoming-detail-grid-segment">
                            <div class="trip-upcoming-detail-head">
                                <span>Stop</span>
                                <span>Equipment</span>
                                <span>Arrival</span>
                                <span>Departure</span>
                            </div>
                            <div class="trip-upcoming-detail-row">
                                <div class="trip-upcoming-stop-cell">${renderTripStopCell(segment.fromStop.number, segment.fromStop.code, segment.fromStop.address)}</div>
                                <div class="trip-upcoming-equipment-cell">${renderTripEquipmentCell(trip, true, segment)}</div>
                                <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(segment.fromStop.number, "Arrival"))}</div>
                                <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(segment.fromStop.number, "Departure"))}</div>
                            </div>
                            <button class="trip-upcoming-instruction" type="button">&#8250; Pickup instructions</button>
                            <div class="trip-upcoming-detail-row">
                                <div class="trip-upcoming-stop-cell">${renderTripStopCell(segment.toStop.number, segment.toStop.code, segment.toStop.address)}</div>
                                <div class="trip-upcoming-equipment-cell">${renderTripEquipmentCell(trip, false, segment)}</div>
                                <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(segment.toStop.number, "Arrival"))}</div>
                                <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(segment.toStop.number, "Departure"))}</div>
                            </div>
                            <button class="trip-upcoming-instruction" type="button">&#8250; Drop-off instructions</button>
                        </div>
                    </section>
                `).join("")}
            </div>
        `;
    }

    function buildTripFooterActions(trip) {
        const tripStatus = trip.status || "upcoming";

        if (tripStatus === "history" && trip.historyStatus === "rejected") {
            const historyLabel = `Rejected: ${escapeHtml(trip.rejection?.reason || "Reason not provided")}`;
            return `
                <div class="trip-upcoming-footer-actions">
                    <div class="trip-footer-status-note is-rejected">
                        <span class="trip-reject-icon" aria-hidden="true"></span>
                        <span>${historyLabel}</span>
                    </div>
                </div>
            `;
        }

        if (isCanceledHistoryTrip(trip)) {
            return `
                <div class="trip-upcoming-footer-actions">
                    <button type="button" data-trip-assistant="${trip.loadKey}">Ask a question</button>
                </div>
            `;
        }

        const actionButtons = [];
        if (tripStatus === "upcoming") {
            actionButtons.push(`
                <button class="trip-reject-trigger" type="button" data-trip-reject="${trip.loadKey}">
                    <span class="trip-reject-icon" aria-hidden="true"></span>
                    <span>Reject</span>
                </button>
            `);
        }

        actionButtons.push(`<button type="button" data-trip-assistant="${trip.loadKey}">Ask a question</button>`);
        actionButtons.push(`<button type="button" data-trip-delay="${trip.loadKey}" data-time-event="${getNextTripTimeEventKey(trip) || buildTripEventKey(1, "Arrival")}">Report delay</button>`);

        if (tripStatus === "upcoming") {
            actionButtons.push(`<button type="button" data-trip-reloads="${trip.loadKey}">Search for reloads &#8594;</button>`);
        }

        return `
            <div class="trip-upcoming-footer-actions">
                ${actionButtons.join("")}
            </div>
        `;
    }

    function renderTripTimingBlock(trip) {
        const tripStatus = trip.status || "upcoming";

        if (tripStatus === "upcoming") {
            return `
                <span>Starts in</span>
                <strong data-trip-starts-at="${trip.pickupDate instanceof Date ? trip.pickupDate.toISOString() : ""}">${trip.startsIn}</strong>
            `;
        }

        if (tripStatus === "in-transit") {
            return `
                <span>Status</span>
                <strong>In transit</strong>
            `;
        }

        if (trip.historyStatus === "rejected") {
            const historyDate = parseTripDate(trip.rejection?.rejectedAt, null);

            return `
                <span>Rejected</span>
                <strong>${historyDate ? formatTripDateTime(historyDate, "Rejected") : "Rejected"}</strong>
            `;
        }

        if (isCanceledHistoryTrip(trip)) {
            return `
                <span>Status</span>
                <strong>Canceled</strong>
            `;
        }

        return `
            <span>Status</span>
            <strong>Completed</strong>
        `;
    }

    function ensureTripNotesModal() {
        let modal = document.getElementById("trip-notes-modal");
        if (modal) {
            return modal;
        }

        modal = document.createElement("div");
        modal.id = "trip-notes-modal";
        modal.className = "trip-notes-overlay";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        document.body.appendChild(modal);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeTripNotesModal();
            }
        });

        return modal;
    }

    function closeTripNotesModal() {
        const modal = document.getElementById("trip-notes-modal");
        if (modal) {
            modal.classList.remove("is-open");
            modal.innerHTML = "";
        }
        activeNotesTrip = null;
    }

    function ensureTripBulkAssignModal() {
        let modal = document.getElementById("trip-bulk-assign-modal");
        if (modal) {
            return modal;
        }

        modal = document.createElement("div");
        modal.id = "trip-bulk-assign-modal";
        modal.className = "trip-bulk-assign-overlay";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        document.body.appendChild(modal);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeTripBulkAssignModal();
            }
        });

        return modal;
    }

    function closeTripBulkAssignModal() {
        const modal = document.getElementById("trip-bulk-assign-modal");
        if (modal) {
            modal.classList.remove("is-open");
            modal.innerHTML = "";
        }
    }

    function getBulkAssignableTrips() {
        return filterTripsForState(
            getNormalizedBookedTrips().filter((trip) => (trip.status || "upcoming") === "upcoming"),
            "upcoming"
        )
            .filter((trip) => !isHiddenUpcomingBlockTrip(trip) && !isRejectedHistoryTrip(trip))
            .sort(compareUpcomingTrips);
    }

    function buildBulkAssignTripOption(trip, inputsDisabled) {
        const assignmentReady = Boolean(trip.driverOption && trip.tractorOption);
        const routeLabel = `${trip.originCode} ${trip.originCity} to ${trip.destinationCode} ${trip.destinationCity}`;
        const assignmentLabel = assignmentReady
            ? `${trip.driverOption} / ${trip.tractorOption}`
            : "Unassigned";

        return `
            <label class="trip-bulk-load-option">
                <input type="checkbox" data-bulk-load="${escapeHtml(trip.loadKey)}"${inputsDisabled ? " disabled" : ""}>
                <span>
                    <strong>${escapeHtml(getTripDisplayCode(trip))}</strong>
                    <small>${escapeHtml(routeLabel)}</small>
                </span>
                <span>
                    <strong>${escapeHtml(trip.pickupLabel)}</strong>
                    <small>${escapeHtml(`${trip.milesLabel} - ${trip.price || "No payout"}`)}</small>
                </span>
                <span>
                    <strong>${escapeHtml(assignmentLabel)}</strong>
                    <small>${escapeHtml(trip.segmentCount > 1 ? `${trip.segmentCount} legs` : "1 leg")}</small>
                </span>
            </label>
        `;
    }

    function updateTripBulkAssignState(modal) {
        const driverSelect = modal.querySelector("[data-bulk-driver]");
        const tractorSelect = modal.querySelector("[data-bulk-tractor]");
        const loadCheckboxes = Array.from(modal.querySelectorAll("[data-bulk-load]"));
        const selectAll = modal.querySelector("[data-bulk-select-all]");
        const assignButton = modal.querySelector(".trip-bulk-assign-confirm");
        const alertBox = modal.querySelector(".trip-bulk-assign-alert");
        const selectionsReady = Boolean(driverSelect?.value && tractorSelect?.value);

        loadCheckboxes.forEach((checkbox) => {
            checkbox.disabled = !selectionsReady;
            if (!selectionsReady) {
                checkbox.checked = false;
            }
        });

        if (selectAll) {
            selectAll.disabled = !selectionsReady || loadCheckboxes.length === 0;
            if (!selectionsReady) {
                selectAll.checked = false;
                selectAll.indeterminate = false;
            } else {
                const checkedCount = loadCheckboxes.filter((checkbox) => checkbox.checked).length;
                selectAll.checked = checkedCount > 0 && checkedCount === loadCheckboxes.length;
                selectAll.indeterminate = checkedCount > 0 && checkedCount < loadCheckboxes.length;
            }
        }

        const selectedCount = loadCheckboxes.filter((checkbox) => checkbox.checked).length;
        if (assignButton) {
            assignButton.disabled = !selectionsReady || selectedCount === 0;
        }

        if (alertBox) {
            if (!selectionsReady) {
                alertBox.textContent = "Choose a driver and tractor before selecting loads.";
                alertBox.className = "trip-bulk-assign-alert is-warning";
            } else if (!selectedCount) {
                alertBox.textContent = "Select at least one load to assign.";
                alertBox.className = "trip-bulk-assign-alert is-warning";
            } else {
                alertBox.textContent = `${selectedCount} load${selectedCount === 1 ? "" : "s"} selected for bulk assignment.`;
                alertBox.className = "trip-bulk-assign-alert";
            }
        }
    }

    function applyBulkAssignmentToTrip(trip, driverOption, tractorOption) {
        const nextSegmentAssignments = Array.from({ length: Math.max(1, trip.segmentCount || 1) }, (_, segmentIndex) => ({
            ...(trip.segmentAssignments?.[segmentIndex] || {}),
            driverOption,
            tractorOption,
            tractorId: tractorOption
        }));

        assignmentSelections.set(trip.loadKey, {
            ...(assignmentSelections.get(trip.loadKey) || {}),
            driverOption,
            tractorOption,
            tractorId: tractorOption,
            segmentAssignments: nextSegmentAssignments
        });

        updateBookedTrip(trip.loadKey, (record) => ({
            ...record,
            driverOption,
            tractorOption,
            tractorId: tractorOption,
            segmentAssignments: nextSegmentAssignments,
            updatedAt: new Date().toISOString()
        }));
    }

    function renderTripBulkAssignModal() {
        const modal = ensureTripBulkAssignModal();
        const assignableTrips = getBulkAssignableTrips();
        const inputsDisabled = true;

        modal.classList.add("is-open");
        modal.innerHTML = `
            <div class="trip-bulk-assign-dialog">
                <div class="trip-bulk-assign-head">
                    <strong>Bulk assign</strong>
                    <button class="trip-bulk-assign-close" type="button" aria-label="Close bulk assignment modal">&times;</button>
                </div>
                <form class="trip-bulk-assign-form">
                    <div class="trip-bulk-assign-fields">
                        <label>
                            <span>Driver</span>
                            <select data-bulk-driver>
                                ${renderSelectOptions(DRIVER_OPTIONS, "", "Select driver")}
                            </select>
                        </label>
                        <label>
                            <span>Tractor</span>
                            <select data-bulk-tractor>
                                ${renderSelectOptions(TRACTOR_OPTIONS, "", "Select tractor")}
                            </select>
                        </label>
                    </div>
                    <div class="trip-bulk-assign-load-head">
                        <label>
                            <input type="checkbox" data-bulk-select-all disabled>
                            <span>Select available loads</span>
                        </label>
                        <small>${assignableTrips.length} available</small>
                    </div>
                    <div class="trip-bulk-assign-loads">
                        ${assignableTrips.length
                            ? assignableTrips.map((trip) => buildBulkAssignTripOption(trip, inputsDisabled)).join("")
                            : `<div class="trip-bulk-assign-empty">No available upcoming loads match the current filters.</div>`}
                    </div>
                    <div class="trip-bulk-assign-alert is-warning">Choose a driver and tractor before selecting loads.</div>
                    <div class="trip-bulk-assign-actions">
                        <button class="trip-bulk-assign-cancel" type="button">Cancel</button>
                        <button class="trip-bulk-assign-confirm" type="submit" disabled>Assign selected loads</button>
                    </div>
                </form>
            </div>
        `;

        const closeButton = modal.querySelector(".trip-bulk-assign-close");
        const cancelButton = modal.querySelector(".trip-bulk-assign-cancel");
        const form = modal.querySelector(".trip-bulk-assign-form");
        const driverSelect = modal.querySelector("[data-bulk-driver]");
        const tractorSelect = modal.querySelector("[data-bulk-tractor]");
        const selectAll = modal.querySelector("[data-bulk-select-all]");
        const loadCheckboxes = Array.from(modal.querySelectorAll("[data-bulk-load]"));

        closeButton?.addEventListener("click", closeTripBulkAssignModal);
        cancelButton?.addEventListener("click", closeTripBulkAssignModal);
        driverSelect?.addEventListener("change", () => updateTripBulkAssignState(modal));
        tractorSelect?.addEventListener("change", () => updateTripBulkAssignState(modal));
        selectAll?.addEventListener("change", () => {
            loadCheckboxes.forEach((checkbox) => {
                if (!checkbox.disabled) {
                    checkbox.checked = Boolean(selectAll.checked);
                }
            });
            updateTripBulkAssignState(modal);
        });
        loadCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", () => updateTripBulkAssignState(modal));
        });
        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            const driverOption = driverSelect?.value || "";
            const tractorOption = tractorSelect?.value || "";
            const selectedKeys = new Set(loadCheckboxes
                .filter((checkbox) => checkbox.checked && !checkbox.disabled)
                .map((checkbox) => checkbox.dataset.bulkLoad));

            if (!driverOption || !tractorOption || selectedKeys.size === 0) {
                updateTripBulkAssignState(modal);
                return;
            }

            assignableTrips
                .filter((trip) => selectedKeys.has(trip.loadKey))
                .forEach((trip) => applyBulkAssignmentToTrip(trip, driverOption, tractorOption));

            closeTripBulkAssignModal();
            renderAllTripStates();
        });

        updateTripBulkAssignState(modal);
    }

    function buildTripNotesList(trip) {
        const notes = tripNotes.get(trip.loadKey) || [];
        if (!notes.length) {
            return `<p class="trip-notes-empty">There are no notes for this trip</p>`;
        }

        return `
            <div class="trip-notes-list">
                ${notes.map((note) => `
                    <article class="trip-note-entry">
                        <div class="trip-note-meta">${escapeHtml(note.author || NOTE_AUTHOR)} ${formatNoteDate(new Date(note.createdAt))}</div>
                        <div class="trip-note-text"><strong>${getTripDisplayCode(trip)}</strong> ${escapeHtml(note.text)}</div>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function buildPayoutRows(trip) {
        const segments = Array.isArray(trip.segmentLoads) && trip.segmentLoads.length
            ? trip.segmentLoads
            : [{
                shipmentCode: trip.shipmentCode,
                priceValue: Number(trip.priceValue) || parseMoney(trip.price),
                miles: Math.max(1, Number(trip.miles) || 1)
            }];

        return segments.map((segment, segmentIndex) => {
            const totalCents = Math.round((Number(segment.priceValue) || 0) * 100);
            const tollRate = (trip.seed + segmentIndex) % 4 === 0 ? 0 : 0.018 + (((trip.seed + segmentIndex) % 5) * 0.006);
            const fuelRate = 0.18 + (((trip.seed + segmentIndex) % 7) * 0.018);
            const tollCents = Math.round(totalCents * tollRate);
            const fuelCents = Math.round(totalCents * fuelRate);
            const baseCents = Math.max(0, totalCents - fuelCents - tollCents);

            return {
                id: segment.shipmentCode,
                base: baseCents / 100,
                fuel: fuelCents / 100,
                toll: tollCents / 100,
                total: totalCents / 100
            };
        });
    }

    function buildPayoutTable(trip) {
        const rows = buildPayoutRows(trip);
        const estimatedTotal = rows.reduce((sum, row) => sum + row.total, 0);

        return `
            <div class="trip-payout-table-wrap">
                <table class="trip-payout-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Base Rate</th>
                            <th>Fuel Surcharge</th>
                            <th>Toll Charge</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row) => `
                            <tr>
                                <td>${row.id}</td>
                                <td>${formatMoney(row.base)}</td>
                                <td>${row.fuel ? formatMoney(row.fuel) : "--"}</td>
                                <td>${row.toll ? formatMoney(row.toll) : "$0"}</td>
                                <td>${formatMoney(row.total)}</td>
                            </tr>
                        `).join("")}
                        <tr class="trip-payout-total-row">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Estimated payout</td>
                            <td>${formatMoney(estimatedTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    function buildReferenceLine(label, value) {
        return `<div><strong>${label}</strong> ${value}</div>`;
    }

    function buildShipmentReferenceRows(trip) {
        const loadCount = Math.max(1, trip.segmentCount || ((trip.routeStops?.length || 2) - 1));
        const masterArn = 160000000 + (trip.seed % 9000000);
        const masterAppointment = 1400000000 + (trip.seed % 80000000);
        const rows = trip.segmentCount > 1
            ? [{
                id: trip.tripCode,
                references: [
                    buildReferenceLine("ARN #", masterArn),
                    trip.seed % 2 === 0 ? buildReferenceLine("Appointment Id", masterAppointment) : ""
                ].filter(Boolean).join("")
            }]
            : [];

        for (let index = 0; index < loadCount; index += 1) {
            rows.push({
                id: trip.segmentLoads?.[index]?.shipmentCode || (
                    index === 0
                        ? trip.shipmentCode
                        : buildShipmentCode(
                            trip.seed + 157 + (index * 47),
                            `${trip.loadKey || trip.originCode || "trip"}:fallback-segment:${index + 1}`
                        )
                ),
                references: [
                    buildReferenceLine("ARN #", masterArn + index + 17),
                    index === 0 && trip.seed % 3 === 0 ? buildReferenceLine("Appointment Id", masterAppointment + index + 911) : ""
                ].filter(Boolean).join("")
            });
        }

        return rows;
    }

    function buildShipmentDetailsPanel(trip) {
        const rows = buildShipmentReferenceRows(trip);
        const masterRow = trip.segmentCount > 1 ? rows[0] : null;
        const loadRows = trip.segmentCount > 1 ? rows.slice(1) : rows;

        return `
            <div class="trip-shipment-details-panel">
                <table class="trip-shipment-details-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Reference #'s</th>
                            <th>Special services</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${masterRow ? `
                            <tr>
                                <td>${masterRow.id}</td>
                                <td>${masterRow.references}</td>
                                <td></td>
                            </tr>
                            <tr class="trip-shipment-view-row">
                                <td colspan="3"><span>&#8964;</span> View by load</td>
                            </tr>
                        ` : ""}
                        ${loadRows.map((row) => `
                            <tr>
                                <td>${row.id}</td>
                                <td>${row.references}</td>
                                <td></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function buildTripModalBody(trip, activeTab) {
        if (activeTab === "payout") {
            return buildPayoutTable(trip);
        }

        if (activeTab === "shipment") {
            return buildShipmentDetailsPanel(trip);
        }

        return buildTripNotesList(trip);
    }

    function renderTripNotesModal(trip, activeTab = "comments", showComposer = false) {
        if (!trip) return;

        activeNotesTrip = trip;
        const modal = ensureTripNotesModal();
        const isCommentsTab = activeTab === "comments";
        modal.classList.add("is-open");
        modal.innerHTML = `
            <section class="trip-notes-dialog">
                <header class="trip-notes-head">
                    <strong>Trip ${getTripDisplayCode(trip)} details</strong>
                    <button class="trip-notes-close" type="button" aria-label="Close trip details">&times;</button>
                </header>
                <div class="trip-notes-tabs" role="tablist" aria-label="Trip details sections">
                    <button class="${activeTab === "payout" ? "is-active" : ""}" type="button" data-trip-modal-tab="payout">Estimated payout</button>
                    <button class="${activeTab === "comments" ? "is-active" : ""}" type="button" data-trip-modal-tab="comments">Comments</button>
                    <button class="${activeTab === "shipment" ? "is-active" : ""}" type="button" data-trip-modal-tab="shipment">Shipment details</button>
                </div>
                <div class="trip-notes-toolbar${isCommentsTab ? "" : " is-hidden"}">
                    <button class="trip-add-note-button" type="button">
                        <span aria-hidden="true">+</span>
                        <span>Add a note</span>
                    </button>
                </div>
                ${isCommentsTab && showComposer ? `
                    <form class="trip-note-form">
                        <label>
                            <span class="sr-only">Write a trip note</span>
                            <textarea rows="4" placeholder="Write a note for this trip"></textarea>
                        </label>
                        <div class="trip-note-form-actions">
                            <button class="trip-note-save" type="submit">Save note</button>
                            <button class="trip-note-cancel" type="button">Cancel</button>
                        </div>
                    </form>
                ` : ""}
                <div class="trip-notes-body">
                    ${buildTripModalBody(trip, activeTab)}
                </div>
            </section>
        `;

        const closeButton = modal.querySelector(".trip-notes-close");
        if (closeButton) {
            closeButton.addEventListener("click", closeTripNotesModal);
        }

        const addButton = modal.querySelector(".trip-add-note-button");
        if (addButton) {
            addButton.addEventListener("click", () => renderTripNotesModal(trip, "comments", true));
        }

        modal.querySelectorAll("[data-trip-modal-tab]").forEach((button) => {
            button.addEventListener("click", () => {
                renderTripNotesModal(trip, button.dataset.tripModalTab || "comments", false);
            });
        });

        const cancelButton = modal.querySelector(".trip-note-cancel");
        if (cancelButton) {
            cancelButton.addEventListener("click", () => renderTripNotesModal(trip, "comments", false));
        }

        const form = modal.querySelector(".trip-note-form");
        if (form) {
            const textarea = form.querySelector("textarea");
            if (textarea) {
                textarea.focus();
            }

            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const text = textarea?.value.trim();
                if (!text) return;

                addTripNote(trip, text);
                renderTripNotesModal(trip, "comments", false);
            });
        }
    }

    function getRelayAssistantTimeLabel(date = new Date()) {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }

    function formatRelayAssistantText(text) {
        return escapeHtml(text)
            .replace(/\b(S-[A-Z0-9]{9})\b/g, '<a href="supportcenter.html?pane=open&amp;caseId=$1">$1</a>')
            .replace(/\n/g, "<br>");
    }

    function ensureRelayAssistantPanel() {
        let panel = document.getElementById("trip-relay-assistant-panel");
        if (panel) {
            return panel;
        }

        panel = document.createElement("aside");
        panel.id = "trip-relay-assistant-panel";
        panel.className = "trip-relay-assistant-panel";
        panel.setAttribute("aria-label", "Relay Assistant");
        document.body.appendChild(panel);
        return panel;
    }

    function closeRelayAssistantPanel() {
        document.getElementById("trip-relay-assistant-panel")?.remove();
        relayAssistantState = null;
    }

    function addRelayAssistantMessage(role, text, options = {}) {
        if (!relayAssistantState) {
            return;
        }

        relayAssistantState.messages.push({
            id: `relay-message-${Date.now()}-${relayAssistantState.messages.length}`,
            role,
            text,
            createdAt: new Date().toISOString(),
            actions: Array.isArray(options.actions) ? options.actions : [],
            tone: options.tone || ""
        });
    }

    function buildRelayAssistantActions(message) {
        if (!message.actions?.length) {
            return "";
        }

        return `
            <div class="trip-relay-assistant-actions">
                ${message.actions.map((action) => `
                    <button type="button" data-relay-assistant-action="${escapeHtml(action.value)}">${escapeHtml(action.label)}</button>
                `).join("")}
            </div>
        `;
    }

    function buildRelayAssistantMessage(message) {
        const isUser = message.role === "user";
        const timeLabel = getRelayAssistantTimeLabel(new Date(message.createdAt));
        return `
            <article class="trip-relay-assistant-message ${isUser ? "is-user" : "is-assistant"}${message.tone ? ` is-${message.tone}` : ""}">
                ${isUser ? "" : '<span class="trip-relay-assistant-avatar" aria-hidden="true">RA</span>'}
                <div class="trip-relay-assistant-message-main">
                    <div class="trip-relay-assistant-message-meta">
                        <strong>${isUser ? "You" : "Relay Assistant"}</strong>
                        <span>${timeLabel}</span>
                    </div>
                    <div class="trip-relay-assistant-bubble">${formatRelayAssistantText(message.text)}</div>
                    ${buildRelayAssistantActions(message)}
                </div>
                ${isUser ? '<span class="trip-relay-assistant-user-avatar" aria-hidden="true"></span>' : ""}
            </article>
        `;
    }

    function buildRelayAssistantCaseForm() {
        const issueText = relayAssistantState?.pendingIssueText
            || relayAssistantState?.issueDrafts?.[relayAssistantState.issueDrafts.length - 1]
            || "";

        return `
            <form class="trip-relay-case-form" data-relay-assistant-case-form novalidate>
                <label>
                    <span>Describe the issue</span>
                    <textarea name="issueDescription" rows="5" required>${escapeHtml(issueText)}</textarea>
                </label>
                <label>
                    <span>Phone number</span>
                    <input name="phone" type="tel" inputmode="numeric" maxlength="12" placeholder="000-000-0000" required>
                </label>
                <label>
                    <span>Attachments <small>(optional)</small></span>
                    <input name="attachments" type="file" multiple>
                </label>
                <div class="trip-relay-case-attachments" data-relay-case-attachments>No attachments selected</div>
                <div class="trip-relay-case-alert" data-relay-case-alert></div>
                <button type="submit" class="trip-relay-case-submit" disabled>Submit</button>
            </form>
        `;
    }

    function validateRelayAssistantCaseForm(form, showErrors = false) {
        const description = form.elements.issueDescription;
        const phone = form.elements.phone;
        const alert = form.querySelector("[data-relay-case-alert]");
        const submitButton = form.querySelector(".trip-relay-case-submit");
        const hasDescription = Boolean(description.value.trim());
        const hasPhone = isValidSupportPhone(phone.value.trim());
        const isValid = hasDescription && hasPhone;

        description.classList.toggle("is-invalid", showErrors && !hasDescription);
        phone.classList.toggle("is-invalid", showErrors && !hasPhone);

        if (alert) {
            if (!showErrors || isValid) {
                alert.textContent = "";
            } else if (!hasDescription && !hasPhone) {
                alert.textContent = "Describe the issue and enter a phone number as 000-000-0000.";
            } else if (!hasDescription) {
                alert.textContent = "Describe the issue before submitting.";
            } else {
                alert.textContent = "Enter the phone number as 000-000-0000.";
            }
        }

        if (submitButton) {
            submitButton.disabled = !isValid;
        }

        return isValid;
    }

    function updateRelayAssistantAttachmentList(form) {
        const attachmentBox = form.querySelector("[data-relay-case-attachments]");
        if (!attachmentBox) {
            return;
        }

        const files = Array.from(form.elements.attachments?.files || []);
        attachmentBox.textContent = files.length
            ? files.map((file) => `${file.name} (${formatSupportAttachmentSize(file.size)})`).join(", ")
            : "No attachments selected";
    }

    async function submitRelayAssistantCaseForm(form) {
        if (form.dataset.submitting === "true" || !relayAssistantState || !validateRelayAssistantCaseForm(form, true)) {
            return;
        }

        const submitButton = form.querySelector(".trip-relay-case-submit");
        const alert = form.querySelector("[data-relay-case-alert]");
        form.dataset.submitting = "true";
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            const issueDescription = form.elements.issueDescription.value.trim();
            const phone = form.elements.phone.value.trim();
            const attachments = await readSupportAttachments(form.elements.attachments?.files);
            const summary = summarizeIssueText(issueDescription, relayAssistantState.trip);
            addTripNote(relayAssistantState.trip, summary || issueDescription, RELAY_ASSISTANT_AUTHOR);
            const supportCase = createSupportCaseFromTrip(relayAssistantState.trip, {
                issueDescription,
                phone,
                attachments,
                reason: SUPPORT_CASE_REASON
            });

            relayAssistantState.stage = "complete";
            relayAssistantState.pendingSummary = summary;
            addRelayAssistantMessage("user", "Form Submitted");
            addRelayAssistantMessage(
                "assistant",
                `Support request created\nReference number: ${supportCase.id}\nThank you for submitting the case. Please track updates in Support Center.`,
                { tone: "success" }
            );
            renderRelayAssistantPanel();
        } catch (error) {
            console.warn("Unable to submit Relay Assistant support case.", error);
            form.dataset.submitting = "false";
            if (alert) {
                alert.textContent = "The case could not be submitted. Please try again.";
            }
            if (submitButton) {
                submitButton.textContent = "Submit";
                validateRelayAssistantCaseForm(form, true);
            }
        }
    }

    function attachRelayAssistantCaseFormEvents(panel) {
        const form = panel.querySelector("[data-relay-assistant-case-form]");
        if (!form) {
            return;
        }

        const phone = form.elements.phone;
        phone.addEventListener("input", () => {
            phone.value = formatSupportPhoneInput(phone.value);
            validateRelayAssistantCaseForm(form);
        });

        form.elements.issueDescription.addEventListener("input", () => validateRelayAssistantCaseForm(form));
        form.elements.attachments.addEventListener("change", () => {
            updateRelayAssistantAttachmentList(form);
            validateRelayAssistantCaseForm(form);
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitRelayAssistantCaseForm(form);
        });

        validateRelayAssistantCaseForm(form);
        updateRelayAssistantAttachmentList(form);
    }

    function handleRelayAssistantSummaryChoice(choice) {
        if (!relayAssistantState || relayAssistantState.stage !== "confirming") {
            return;
        }

        relayAssistantState.messages.forEach((message) => {
            message.actions = [];
        });

        if (choice === "yes") {
            const summary = relayAssistantState.pendingSummary || summarizeIssueText(relayAssistantState.pendingIssueText, relayAssistantState.trip);
            addTripNote(relayAssistantState.trip, summary, RELAY_ASSISTANT_AUTHOR);
            relayAssistantState.stage = "collecting-issue";
            relayAssistantState.pendingIssueText = "";
            relayAssistantState.pendingSummary = "";
            addRelayAssistantMessage("user", "Yes");
            addRelayAssistantMessage("assistant", "Accepted. I added the confirmed summary to this trip's notes. You can type another issue if you need help with something else.");
            renderRelayAssistantPanel();
            return;
        }

        addRelayAssistantMessage("user", "No");
        relayAssistantState.pendingSummary = "";

        if (relayAssistantState.attempts < 2) {
            relayAssistantState.stage = "collecting-issue";
            addRelayAssistantMessage("assistant", "Thanks for correcting me. Please describe the issue one more time and I will try to summarize it again.");
        } else {
            relayAssistantState.stage = "case-form";
            addRelayAssistantMessage("assistant", "I could not confirm the issue after two tries. Please complete the support request below so the support team has the full details.");
        }

        renderRelayAssistantPanel();
    }

    function handleRelayAssistantChatSubmit(event) {
        event.preventDefault();
        if (!relayAssistantState || relayAssistantState.stage !== "collecting-issue") {
            return;
        }

        const input = event.currentTarget.querySelector("[data-relay-assistant-input]");
        const issueText = input?.value.trim();
        if (!issueText) {
            return;
        }

        input.value = "";
        relayAssistantState.attempts += 1;
        relayAssistantState.issueDrafts.push(issueText);
        relayAssistantState.pendingIssueText = issueText;
        relayAssistantState.pendingSummary = summarizeIssueText(issueText, relayAssistantState.trip);
        relayAssistantState.stage = "confirming";
        addRelayAssistantMessage("user", issueText);
        addRelayAssistantMessage(
            "assistant",
            `I understood your question as:\n${relayAssistantState.pendingSummary}\n\nDid I get that right?`,
            {
                actions: [
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" }
                ]
            }
        );
        renderRelayAssistantPanel();
    }

    function renderRelayAssistantPanel() {
        if (!relayAssistantState) {
            return;
        }

        const panel = ensureRelayAssistantPanel();
        const inputDisabled = relayAssistantState.stage !== "collecting-issue";
        const inputPlaceholder = relayAssistantState.stage === "collecting-issue"
            ? "Type your message here"
            : "Use the options above";

        panel.innerHTML = `
            <header class="trip-relay-assistant-header">
                <strong>Relay Assistant</strong>
                <div>
                    <button type="button" data-relay-assistant-close aria-label="Close Relay Assistant">&times;</button>
                </div>
            </header>
            <div class="trip-relay-assistant-messages" data-relay-assistant-messages>
                ${relayAssistantState.messages.map(buildRelayAssistantMessage).join("")}
                ${relayAssistantState.stage === "case-form" ? buildRelayAssistantCaseForm() : ""}
            </div>
            <form class="trip-relay-assistant-input-row" data-relay-assistant-chat-form>
                <input type="text" data-relay-assistant-input placeholder="${inputPlaceholder}" autocomplete="off"${inputDisabled ? " disabled" : ""}>
                <button type="submit"${inputDisabled ? " disabled" : ""} aria-label="Send message">&#10148;</button>
            </form>
        `;

        panel.querySelector("[data-relay-assistant-close]")?.addEventListener("click", closeRelayAssistantPanel);
        panel.querySelector("[data-relay-assistant-chat-form]")?.addEventListener("submit", handleRelayAssistantChatSubmit);
        panel.querySelectorAll("[data-relay-assistant-action]").forEach((button) => {
            button.addEventListener("click", () => handleRelayAssistantSummaryChoice(button.dataset.relayAssistantAction));
        });

        attachRelayAssistantCaseFormEvents(panel);

        const messages = panel.querySelector("[data-relay-assistant-messages]");
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }

        if (!inputDisabled) {
            panel.querySelector("[data-relay-assistant-input]")?.focus();
        }
    }

    function openRelayAssistant(trip) {
        if (!trip) {
            return;
        }

        relayAssistantState = {
            trip,
            stage: "collecting-issue",
            attempts: 0,
            issueDrafts: [],
            pendingIssueText: "",
            pendingSummary: "",
            messages: []
        };

        addRelayAssistantMessage(
            "assistant",
            "When you chat with Relay Assistant, you choose to interact with a generative AI chatbot to help us respond to your question."
        );
        addRelayAssistantMessage("assistant", `How can I assist you with load ${getTripDisplayCode(trip)}?`);
        renderRelayAssistantPanel();
    }

    function getGeneratedHistoryTripRecordsForSelectedWeek() {
        if (!tripHistorySchedule?.getHistoryTripsForWeek) {
            return [];
        }

        return tripHistorySchedule.getHistoryTripsForWeek(selectedHistoryWeekStart);
    }

    function getTripRecordsForCurrentView() {
        return [
            ...loadBookedTrips(),
            ...getGeneratedHistoryTripRecordsForSelectedWeek()
        ];
    }

    function getNormalizedBookedTrips() {
        return getTripRecordsForCurrentView()
            .sort((left, right) => {
                const leftDate = parseTripDate(left.pickupDateTimeIso, left.pickupWindow);
                const rightDate = parseTripDate(right.pickupDateTimeIso, right.pickupWindow);
                return (leftDate?.getTime() || 0) - (rightDate?.getTime() || 0);
            })
            .map((trip, index) => normalizeBookedTrip(trip, index));
    }

    function preparePendingTripNavigation() {
        if (!pendingTripNavigation?.loadKey) {
            return;
        }

        upcomingExpandedKeys.add(pendingTripNavigation.loadKey);

        if (pendingTripNavigation.tabName !== "upcoming") {
            return;
        }

        const upcomingTrips = getNormalizedBookedTrips()
            .filter((trip) => (trip.status || "upcoming") === "upcoming");
        const targetIndex = upcomingTrips.findIndex((trip) => trip.loadKey === pendingTripNavigation.loadKey);

        if (targetIndex >= 0) {
            upcomingCurrentPage = Math.floor(targetIndex / UPCOMING_PAGE_SIZE) + 1;
        }
    }

    function focusPendingTripNavigation() {
        if (!pendingTripNavigation?.loadKey) {
            return;
        }

        const target = pendingTripNavigation;
        window.requestAnimationFrame(() => {
            const targetCard = document.querySelector(`[data-trip-key="${target.loadKey}"]`);
            if (targetCard) {
                targetCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            pendingTripNavigation = null;
            clearTripNavigationTarget();
        });
    }

    function ensureTripTimeModal() {
        let modal = document.getElementById("trip-time-modal");
        if (modal) {
            return modal;
        }

        modal = document.createElement("div");
        modal.id = "trip-time-modal";
        modal.className = "trip-time-overlay";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        document.body.appendChild(modal);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeTripTimeModal();
            }
        });

        return modal;
    }

    function closeTripTimeModal() {
        const modal = document.getElementById("trip-time-modal");
        if (modal) {
            modal.classList.remove("is-open");
            modal.innerHTML = "";
        }
    }

    function updateTripTimeAlert(modal, trip, eventKey, scheduledDate) {
        const alertBox = modal.querySelector(".trip-time-alert");
        const dateInput = modal.querySelector("[data-time-date]");
        const timeInput = modal.querySelector("[data-time-clock]");
        const saveButton = modal.querySelector(".trip-time-save");
        if (!alertBox || !dateInput || !timeInput || !saveButton) return;

        const disabledReason = getTripTimeEditDisabledReason(trip, eventKey);
        const canEditTime = !disabledReason;
        dateInput.disabled = !canEditTime;
        timeInput.disabled = !canEditTime;
        saveButton.disabled = !canEditTime;

        const estimatedDate = parseInputDateTime(dateInput.value, timeInput.value);
        alertBox.className = "trip-time-alert";
        alertBox.textContent = "";

        if (!canEditTime) {
            alertBox.classList.add("is-warning");
            alertBox.textContent = disabledReason;
            return;
        }

        if (!estimatedDate || estimatedDate.getTime() < Date.now()) {
            alertBox.classList.add("is-warning");
            alertBox.textContent = "Only future device time can be submitted.";
            saveButton.disabled = true;
            return;
        }

        const chronologyMessage = getTripChronologyValidationMessage(trip, eventKey, estimatedDate);
        if (chronologyMessage) {
            alertBox.classList.add("is-warning");
            alertBox.textContent = chronologyMessage;
            saveButton.disabled = true;
            return;
        }

        saveButton.disabled = false;

        if (scheduledDate instanceof Date && estimatedDate.getTime() > scheduledDate.getTime()) {
            alertBox.classList.add("is-late");
            alertBox.textContent = "Late to appointment. This entry is after the scheduled time.";
        }
    }

    function commitTripTimeEdit(trip, eventKey, estimatedDate) {
        const disabledReason = getTripTimeEditDisabledReason(trip, eventKey);
        if (disabledReason) {
            return;
        }

        const chronologyMessage = getTripChronologyValidationMessage(trip, eventKey, estimatedDate);
        if (chronologyMessage) {
            return;
        }

        const config = getTripEventConfig(trip, eventKey);
        const isLate = config.scheduleDate instanceof Date && estimatedDate.getTime() > config.scheduleDate.getTime();
        const nextStatus = config.statusAfterSave;
        const estimatedIso = estimatedDate.toISOString();

        const updatedRecord = updateBookedTrip(trip.loadKey, (record) => ({
            ...record,
            status: nextStatus,
            historyStatus: nextStatus === "history" ? (record.historyStatus || "completed") : record.historyStatus,
            actualTimes: {
                ...(record.actualTimes || {}),
                [eventKey]: estimatedIso
            },
            lateEvents: {
                ...(record.lateEvents || {}),
                [eventKey]: isLate
            },
            updatedAt: new Date().toISOString(),
            completedAt: nextStatus === "history" ? estimatedIso : record.completedAt
        }));
        syncPatOrderStatusFromTripRecord(updatedRecord);

        closeTripTimeModal();
        renderAllTripStates();
        activateTab(nextStatus === "history" ? "history" : "in-transit");
    }

    function renderTripTimeModal(selectedLoadKey, selectedEventKey = buildTripEventKey(1, "Arrival")) {
        const trips = getNormalizedBookedTrips();
        if (!trips.length) return;

        const selectedTrip = trips.find((trip) => trip.loadKey === selectedLoadKey) || trips[0];
        const allEventOptions = getTripEventOptions(selectedTrip);
        const nextEventKey = getNextTripTimeEventKey(selectedTrip);
        const allowedEventKey = nextEventKey || selectedEventKey;
        const selectedEvent = allEventOptions.find((event) => event.eventKey === allowedEventKey) || allEventOptions[0];
        const existingActual = parseTripDate(selectedTrip.actualTimes?.[selectedEvent.eventKey], null);
        const defaultEstimate = existingActual || roundUpToMinutes(addMinutes(new Date(), 5), 5);
        const disabledReason = getTripTimeEditDisabledReason(selectedTrip, selectedEvent.eventKey);
        const assignmentReady = !disabledReason;
        const modal = ensureTripTimeModal();

        modal.classList.add("is-open");
        modal.innerHTML = `
            <section class="trip-time-dialog">
                <header class="trip-time-head">
                    <strong>Edit trip time</strong>
                    <button class="trip-time-close" type="button" aria-label="Close time editor">&times;</button>
                </header>
                <form class="trip-time-form">
                    <div class="trip-time-selector-row">
                        <label>
                            <span class="sr-only">Trip</span>
                            <select data-time-trip>
                                ${trips.map((trip) => `<option value="${trip.loadKey}"${trip.loadKey === selectedTrip.loadKey ? " selected" : ""}>${getTripDisplayCode(trip)}</option>`).join("")}
                            </select>
                        </label>
                        <label>
                            <span class="sr-only">Stop event</span>
                            <select data-time-event disabled>
                                <option value="${selectedEvent.eventKey}" selected>${selectedEvent.label}</option>
                            </select>
                        </label>
                    </div>
                    <div class="trip-time-schedule-line">
                        <strong>Scheduled:</strong>
                        <span>${formatTripDateTime(selectedEvent.scheduleDate, "--")}</span>
                    </div>
                    <div class="trip-time-estimated-label">Estimated:</div>
                    <div class="trip-time-input-row">
                        <label>
                            <span class="sr-only">Estimated date</span>
                            <input type="date" data-time-date min="${formatDateInputValue(new Date())}" value="${formatDateInputValue(defaultEstimate)}"${assignmentReady ? "" : " disabled"}>
                        </label>
                        <label>
                            <span class="sr-only">Estimated time</span>
                            <input type="time" data-time-clock value="${formatTimeInputValue(defaultEstimate)}"${assignmentReady ? "" : " disabled"}>
                        </label>
                    </div>
                    <div class="trip-time-alert" aria-live="polite"></div>
                    <div class="trip-time-actions">
                        <button class="trip-time-save" type="submit"${assignmentReady ? "" : " disabled"}>Save time</button>
                        <button class="trip-time-cancel" type="button">Cancel</button>
                    </div>
                </form>
            </section>
        `;

        const closeButton = modal.querySelector(".trip-time-close");
        const cancelButton = modal.querySelector(".trip-time-cancel");
        const tripSelect = modal.querySelector("[data-time-trip]");
        const dateInput = modal.querySelector("[data-time-date]");
        const timeInput = modal.querySelector("[data-time-clock]");
        const form = modal.querySelector(".trip-time-form");

        closeButton?.addEventListener("click", closeTripTimeModal);
        cancelButton?.addEventListener("click", closeTripTimeModal);
        tripSelect?.addEventListener("change", () => {
            const nextTrip = trips.find((trip) => trip.loadKey === tripSelect.value) || trips[0];
            renderTripTimeModal(tripSelect.value, getNextTripTimeEventKey(nextTrip) || buildTripEventKey(1, "Arrival"));
        });
        dateInput?.addEventListener("input", () => updateTripTimeAlert(modal, selectedTrip, selectedEvent.eventKey, selectedEvent.scheduleDate));
        timeInput?.addEventListener("input", () => updateTripTimeAlert(modal, selectedTrip, selectedEvent.eventKey, selectedEvent.scheduleDate));

        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            const estimatedDate = parseInputDateTime(dateInput?.value, timeInput?.value);
            updateTripTimeAlert(modal, selectedTrip, selectedEvent.eventKey, selectedEvent.scheduleDate);

            if (disabledReason || !estimatedDate || estimatedDate.getTime() < Date.now()) {
                return;
            }

            commitTripTimeEdit(selectedTrip, selectedEvent.eventKey, estimatedDate);
        });

        updateTripTimeAlert(modal, selectedTrip, selectedEvent.eventKey, selectedEvent.scheduleDate);
    }

    function ensureTripDelayModal() {
        let modal = document.getElementById("trip-delay-modal");
        if (modal) {
            return modal;
        }

        modal = document.createElement("div");
        modal.id = "trip-delay-modal";
        modal.className = "trip-delay-overlay";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        document.body.appendChild(modal);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeTripDelayModal();
            }
        });

        return modal;
    }

    function closeTripDelayModal() {
        const modal = document.getElementById("trip-delay-modal");
        if (modal) {
            modal.classList.remove("is-open");
            modal.innerHTML = "";
        }
    }

    function ensureTripRejectModal() {
        let modal = document.getElementById("trip-reject-modal");
        if (modal) {
            return modal;
        }

        modal = document.createElement("div");
        modal.id = "trip-reject-modal";
        modal.className = "trip-reject-overlay";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        document.body.appendChild(modal);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeTripRejectModal();
            }
        });

        return modal;
    }

    function closeTripRejectModal() {
        const modal = document.getElementById("trip-reject-modal");
        if (modal) {
            modal.classList.remove("is-open");
            modal.innerHTML = "";
        }
    }

    function updateTripRejectConfirm(modal) {
        const reasonSelect = modal.querySelector("[data-reject-reason]");
        const confirmButton = modal.querySelector(".trip-reject-confirm");
        const alertBox = modal.querySelector(".trip-reject-alert");
        if (!reasonSelect || !confirmButton || !alertBox) return;

        const hasReason = Boolean(reasonSelect.value);
        reasonSelect.classList.toggle("is-invalid", !hasReason);
        confirmButton.disabled = !hasReason;
        alertBox.textContent = hasReason ? "" : "Reject reason is required.";
        alertBox.className = `trip-reject-alert${hasReason ? "" : " is-warning"}`;
    }

    function commitTripReject(trip, reason) {
        const rejectedAt = new Date().toISOString();
        const updatedRecord = updateBookedTrip(trip.loadKey, (record) => ({
            ...record,
            status: "history",
            historyStatus: "rejected",
            rejection: {
                reason,
                rejectedAt
            },
            updatedAt: rejectedAt,
            completedAt: rejectedAt
        }));

        syncPatOrderStatusFromTripRecord(updatedRecord);
        closeTripRejectModal();
        renderAllTripStates();
        activateTab("history");
    }

    function renderTripRejectModal(selectedLoadKey) {
        const trip = getNormalizedBookedTrips().find((entry) => entry.loadKey === selectedLoadKey);
        if (!trip || (trip.status || "upcoming") !== "upcoming") {
            return;
        }

        const modal = ensureTripRejectModal();
        const selectedReason = trip.rejection?.reason || "";
        modal.classList.add("is-open");
        modal.innerHTML = `
            <section class="trip-reject-dialog">
                <header class="trip-reject-head">
                    <strong>Reject ${getTripDisplayCode(trip)}</strong>
                    <button class="trip-reject-close" type="button" aria-label="Close rejection modal">&times;</button>
                </header>
                <form class="trip-reject-form">
                    <h2>What is the reason for the rejection?</h2>
                    <p class="trip-reject-required">* indicates required field</p>
                    <label class="trip-reject-field">
                        <span>Reject reason *</span>
                        <select data-reject-reason>
                            <option value="">Choose a reason</option>
                            ${REJECTION_REASON_OPTIONS.map((reason) => `<option value="${escapeHtml(reason)}"${reason === selectedReason ? " selected" : ""}>${escapeHtml(reason)}</option>`).join("")}
                        </select>
                    </label>
                    <div class="trip-reject-alert" aria-live="polite"></div>
                    <div class="trip-reject-actions">
                        <button class="trip-reject-cancel" type="button">Cancel</button>
                        <button class="trip-reject-confirm" type="submit" disabled>Reject</button>
                    </div>
                </form>
            </section>
        `;

        const closeButton = modal.querySelector(".trip-reject-close");
        const cancelButton = modal.querySelector(".trip-reject-cancel");
        const reasonSelect = modal.querySelector("[data-reject-reason]");
        const form = modal.querySelector(".trip-reject-form");

        closeButton?.addEventListener("click", closeTripRejectModal);
        cancelButton?.addEventListener("click", closeTripRejectModal);
        reasonSelect?.addEventListener("change", () => updateTripRejectConfirm(modal));
        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            updateTripRejectConfirm(modal);
            if (!reasonSelect?.value) {
                return;
            }

            commitTripReject(trip, reasonSelect.value);
        });

        updateTripRejectConfirm(modal);
    }

    function getDefaultDelayEstimate(trip, eventKey) {
        const existingDelay = trip.delayEvents?.[eventKey];
        const existingDate = parseTripDate(existingDelay?.estimatedTimeIso, null);
        if (existingDate) {
            return existingDate;
        }

        const scheduledDate = getTripEventConfig(trip, eventKey).scheduleDate;
        const minimumFuture = addMinutes(new Date(), 5);
        const scheduledPlusBuffer = addMinutes(scheduledDate, 15);
        const bestDate = scheduledPlusBuffer && scheduledPlusBuffer.getTime() > minimumFuture.getTime()
            ? scheduledPlusBuffer
            : minimumFuture;
        return roundUpToMinutes(bestDate, 5);
    }

    function updateTripDelayConfirm(modal) {
        const reasonSelect = modal.querySelector("[data-delay-reason]");
        const dateInput = modal.querySelector("[data-delay-date]");
        const timeInput = modal.querySelector("[data-delay-clock]");
        const confirmButton = modal.querySelector(".trip-delay-confirm");
        const alertBox = modal.querySelector(".trip-delay-alert");
        if (!reasonSelect || !dateInput || !timeInput || !confirmButton || !alertBox) return;

        const estimatedDate = parseInputDateTime(dateInput.value, timeInput.value);
        const hasReason = Boolean(reasonSelect.value);
        const isFuture = Boolean(estimatedDate && estimatedDate.getTime() >= Date.now());

        reasonSelect.classList.toggle("is-invalid", !hasReason);
        alertBox.textContent = "";
        alertBox.className = "trip-delay-alert";

        if (!isFuture) {
            alertBox.classList.add("is-warning");
            alertBox.textContent = "Estimated time must be in the future.";
        }

        confirmButton.disabled = !hasReason || !isFuture;
    }

    function commitTripDelay(trip, eventKey, reason, estimatedDate) {
        const config = getTripEventConfig(trip, eventKey);
        updateBookedTrip(trip.loadKey, (record) => ({
            ...record,
            delayEvents: {
                ...(record.delayEvents || {}),
                [eventKey]: {
                    reason,
                    estimatedTimeIso: estimatedDate.toISOString(),
                    scheduledTimeIso: config.scheduleDate instanceof Date ? config.scheduleDate.toISOString() : null,
                    reportedAt: new Date().toISOString()
                }
            },
            updatedAt: new Date().toISOString()
        }));

        closeTripDelayModal();
        renderAllTripStates();
    }

    function renderTripDelayModal(selectedLoadKey, selectedEventKey = buildTripEventKey(1, "Arrival")) {
        const trips = getNormalizedBookedTrips();
        if (!trips.length) return;

        const selectedTrip = trips.find((trip) => trip.loadKey === selectedLoadKey) || trips[0];
        const eventOptions = getDelayEventOptions(selectedTrip);
        const selectedEvent = eventOptions.find((event) => event.eventKey === selectedEventKey) || eventOptions[0];
        const delayReasons = getDelayReasons(selectedTrip, selectedEvent.eventKey);
        const existingDelay = selectedTrip.delayEvents?.[selectedEvent.eventKey] || {};
        const defaultEstimate = getDefaultDelayEstimate(selectedTrip, selectedEvent.eventKey);
        const modal = ensureTripDelayModal();

        modal.classList.add("is-open");
        modal.innerHTML = `
            <section class="trip-delay-dialog">
                <header class="trip-delay-head">
                    <strong>Report delay</strong>
                    <button class="trip-delay-close" type="button" aria-label="Close delay report">&times;</button>
                </header>
                <form class="trip-delay-form">
                    <div class="trip-delay-selector-row">
                        <label>
                            <span class="sr-only">Trip</span>
                            <select data-delay-trip>
                                ${trips.map((trip) => `<option value="${trip.loadKey}"${trip.loadKey === selectedTrip.loadKey ? " selected" : ""}>${getTripDisplayCode(trip)}</option>`).join("")}
                            </select>
                        </label>
                        <label>
                            <span class="sr-only">Stop event</span>
                            <select data-delay-event>
                                ${eventOptions.map((event) => `<option value="${event.eventKey}"${event.eventKey === selectedEvent.eventKey ? " selected" : ""}>${event.label}</option>`).join("")}
                            </select>
                        </label>
                        <label>
                            <span class="sr-only">Delay reason</span>
                            <select data-delay-reason>
                                <option value="">Select Delay Reason</option>
                                ${delayReasons.map((reason) => `<option value="${escapeHtml(reason)}"${reason === existingDelay.reason ? " selected" : ""}>${reason}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                    <div class="trip-delay-info">
                        <span aria-hidden="true">i</span>
                        <strong>Delay Reason codes are allowed up to 72 hours after load completion.</strong>
                        Please report the reason codes correctly so that we clearly understand the reasons for delayed arrival.
                    </div>
                    <div class="trip-delay-section-title">Estimated time change</div>
                    <div class="trip-delay-schedule-line">
                        <strong>Scheduled:</strong>
                        <span>${formatTripDateTime(selectedEvent.scheduleDate, "--")}</span>
                    </div>
                    <div class="trip-delay-estimated-label">Estimated:</div>
                    <div class="trip-delay-input-row">
                        <label>
                            <span class="sr-only">Estimated date</span>
                            <input type="date" data-delay-date min="${formatDateInputValue(new Date())}" value="${formatDateInputValue(defaultEstimate)}">
                        </label>
                        <label>
                            <span class="sr-only">Estimated time</span>
                            <input type="time" data-delay-clock value="${formatTimeInputValue(defaultEstimate)}">
                        </label>
                    </div>
                    <button class="trip-delay-audit" type="button">&#8250; Audit log</button>
                    <div class="trip-delay-alert" aria-live="polite"></div>
                    <div class="trip-delay-actions">
                        <button class="trip-delay-cancel" type="button">Cancel</button>
                        <button class="trip-delay-confirm" type="submit" disabled>Confirm</button>
                    </div>
                </form>
            </section>
        `;

        const closeButton = modal.querySelector(".trip-delay-close");
        const cancelButton = modal.querySelector(".trip-delay-cancel");
        const tripSelect = modal.querySelector("[data-delay-trip]");
        const eventSelect = modal.querySelector("[data-delay-event]");
        const reasonSelect = modal.querySelector("[data-delay-reason]");
        const dateInput = modal.querySelector("[data-delay-date]");
        const timeInput = modal.querySelector("[data-delay-clock]");
        const form = modal.querySelector(".trip-delay-form");

        closeButton?.addEventListener("click", closeTripDelayModal);
        cancelButton?.addEventListener("click", closeTripDelayModal);
        tripSelect?.addEventListener("change", () => renderTripDelayModal(tripSelect.value, buildTripEventKey(1, "Arrival")));
        eventSelect?.addEventListener("change", () => renderTripDelayModal(selectedTrip.loadKey, eventSelect.value));
        reasonSelect?.addEventListener("change", () => updateTripDelayConfirm(modal));
        dateInput?.addEventListener("input", () => updateTripDelayConfirm(modal));
        timeInput?.addEventListener("input", () => updateTripDelayConfirm(modal));

        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            const estimatedDate = parseInputDateTime(dateInput?.value, timeInput?.value);
            updateTripDelayConfirm(modal);
            if (!reasonSelect?.value || !estimatedDate || estimatedDate.getTime() < Date.now()) {
                return;
            }

            commitTripDelay(selectedTrip, selectedEvent.eventKey, reasonSelect.value, estimatedDate);
        });

        updateTripDelayConfirm(modal);
    }

    function buildUpcomingCardMarkup(trip) {
        const blockDetailsHidden = trip.isBlockLoad && !trip.blockDetailsAvailable;
        const canExpandDetails = !blockDetailsHidden;
        const isExpanded = canExpandDetails && upcomingExpandedKeys.has(trip.loadKey);
        const tripStatus = trip.status || "upcoming";
        const isUpcoming = tripStatus === "upcoming";
        const requiresDriver = isUpcoming && !isHiddenUpcomingBlockTrip(trip) && !hasTripCheckInAssignments(trip);
        const routeStops = trip.routeStops || [];
        const originStop = routeStops[0];
        const destinationStop = routeStops[routeStops.length - 1];
        const finalStopNumber = destinationStop?.number || trip.stops || 2;
        const primarySegment = trip.segmentLoads?.[0] || null;
        const detailMarkup = trip.segmentCount > 1
            ? buildTripMultiStopDetailsMarkup(trip)
            : `
                <div class="trip-upcoming-details-toolbar">
                <div class="trip-upcoming-detail-code">${trip.shipmentCode}</div>
                    <div class="trip-upcoming-toolbar-route">
                        <span><span class="trip-upcoming-stop-badge">1</span> ${trip.originCode}</span>
                        <span class="trip-arrow">&#8594;</span>
                        <span><span class="trip-upcoming-stop-badge">${finalStopNumber}</span> ${trip.destinationCode}</span>
                        <span class="trip-upcoming-toolbar-distance">${trip.milesLabel}</span>
                    </div>
                </div>
                ${buildTripRejectionBanner(trip)}
                ${buildTripCancellationBanner(trip)}
                <div class="trip-upcoming-detail-grid">
                    <div class="trip-upcoming-detail-head">
                        <span>Stop</span>
                        <span>Equipment</span>
                        <span>Arrival</span>
                        <span>Departure</span>
                    </div>
                    <div class="trip-upcoming-detail-row">
                        <div class="trip-upcoming-stop-cell">${renderTripStopCell(originStop?.number || 1, originStop?.code || trip.originCode, originStop?.address || trip.originAddress)}</div>
                        <div class="trip-upcoming-equipment-cell">${renderTripEquipmentCell(trip, true, primarySegment)}</div>
                        <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(originStop?.number || 1, "Arrival"))}</div>
                        <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(originStop?.number || 1, "Departure"))}</div>
                    </div>
                    <button class="trip-upcoming-instruction" type="button">&#8250; Pickup instructions</button>
                    <div class="trip-upcoming-detail-row">
                        <div class="trip-upcoming-stop-cell">${renderTripStopCell(destinationStop?.number || finalStopNumber, destinationStop?.code || trip.destinationCode, destinationStop?.address || trip.destinationAddress)}</div>
                        <div class="trip-upcoming-equipment-cell">${renderTripEquipmentCell(trip, false, primarySegment)}</div>
                        <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(destinationStop?.number || finalStopNumber, "Arrival"))}</div>
                        <div class="trip-upcoming-time-cell">${renderTripTimeCell(trip, buildTripEventKey(destinationStop?.number || finalStopNumber, "Departure"))}</div>
                    </div>
                    <button class="trip-upcoming-instruction" type="button">&#8250; Drop-off instructions</button>
                </div>
            `;

        return `
            <article class="trip-upcoming-card${canExpandDetails ? (isExpanded ? " is-expanded" : " is-collapsed") : ""}${requiresDriver ? " is-driver-required" : ""}${trip.historyStatus === "rejected" ? " is-rejected-history" : ""}${isCanceledHistoryTrip(trip) ? " is-canceled-history" : ""}" data-trip-key="${trip.loadKey}" data-trip-status="${tripStatus}" data-driver-type="${trip.driverType || ""}">
                <div class="trip-upcoming-summary" data-trip-summary="${trip.loadKey}" data-trip-expandable="${canExpandDetails ? "true" : "false"}">
                    <div class="trip-upcoming-ref">
                        <strong>${getTripDisplayCode(trip)}</strong>
                        ${renderTripRefMeta(trip)}
                    </div>
                    <div class="trip-upcoming-starts">
                        ${renderTripTimingBlock(trip)}
                        ${blockDetailsHidden ? `<div class="trip-upcoming-start-note">Details open 15h before start</div>` : ""}
                    </div>
                    <div class="trip-upcoming-summary-stop">
                        <span class="trip-upcoming-stop-badge">1</span>
                        <div>
                            <strong>${originStop?.code || trip.originCode} ${originStop?.city || trip.originCity}</strong>
                            <div class="tiny muted">${trip.pickupLabel}</div>
                        </div>
                    </div>
                    <div class="trip-arrow">&#8594;</div>
                    <div class="trip-upcoming-summary-stop">
                        <span class="trip-upcoming-stop-badge">${finalStopNumber}</span>
                        <div>
                            <strong>${destinationStop?.code || trip.destinationCode} ${destinationStop?.city || trip.destinationCity}</strong>
                            <div class="tiny muted">${trip.deliveryLabel}</div>
                        </div>
                    </div>
                    <div class="trip-upcoming-summary-metric">
                        <strong>${trip.milesLabel}</strong>
                        <div class="tiny muted">${trip.duration}</div>
                    </div>
                    <div class="trip-driver-type-cell">
                        ${renderTripDriverTypeIcons(trip.driverType)}
                    </div>
                    <div class="trip-upcoming-summary-equip">${trip.displayEquipment}</div>
                    <div class="trip-upcoming-summary-type">${trip.displayLoadType}</div>
                    <div class="trip-upcoming-summary-price">
                        <strong>${trip.price}</strong>
                        <div class="tiny muted">${trip.pricePerMile}</div>
                    </div>
                    <div class="trip-cell-actions trip-upcoming-assignments">
                        ${renderTripAssignmentSummaryCell(trip)}
                    </div>
                    <div class="trip-upcoming-load-slot">
                        ${trip.segmentCount > 1
                            ? `<div class="trip-upcoming-load-count">${trip.loadCountLabel}</div>`
                            : ""}
                    </div>
                    <div class="trip-upcoming-fold">
                        ${canExpandDetails ? `
                            <button class="trip-upcoming-fold-button" type="button" data-trip-toggle="${trip.loadKey}" aria-expanded="${isExpanded ? "true" : "false"}" aria-label="${isExpanded ? "Collapse trip details" : "Expand trip details"}">
                                <span class="trip-upcoming-fold-track"></span>
                                <span class="trip-upcoming-fold-dot trip-upcoming-fold-dot-top"></span>
                                <span class="trip-upcoming-fold-dot trip-upcoming-fold-dot-bottom"></span>
                                <span class="trip-upcoming-fold-caret">${isExpanded ? "&#9652;" : "&#9662;"}</span>
                            </button>
                        ` : ""}
                    </div>
                </div>
                ${canExpandDetails ? `
                    <div class="trip-upcoming-details${isExpanded ? " is-open" : ""}">
                        ${detailMarkup}
                    </div>
                    <div class="trip-upcoming-footer${isExpanded ? " is-open" : ""}">
                        <div class="trip-upcoming-footer-links">
                            <button class="trip-footer-icon-button" type="button" data-trip-payout="${trip.loadKey}" aria-label="Open estimated payout">$</button>
                            <span>&#128205;</span>
                            <button class="trip-footer-icon-button" type="button" data-trip-notes="${trip.loadKey}" aria-label="Open trip notes">&#128172;</button>
                            <button type="button" data-trip-shipment="${trip.loadKey}">View all shipment details</button>
                        </div>
                        ${buildTripFooterActions(trip)}
                    </div>
                ` : ""}
            </article>
        `;
    }

    function buildVisiblePageNumbers(totalPages) {
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, upcomingCurrentPage - 2);
        let end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = end - maxVisible + 1;
        }

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }

    function renderUpcomingPagination(totalResults) {
        if (!upcomingPagination) return;

        upcomingPagination.innerHTML = "";

        const totalPages = Math.max(1, Math.ceil(totalResults / UPCOMING_PAGE_SIZE));
        if (!totalResults) {
            upcomingPagination.style.display = "none";
            return;
        }

        upcomingPagination.style.display = "flex";

        const previousArrow = document.createElement("button");
        previousArrow.type = "button";
        previousArrow.innerHTML = "&#171;";
        previousArrow.disabled = upcomingCurrentPage === 1;
        previousArrow.addEventListener("click", () => {
            if (upcomingCurrentPage > 1) {
                upcomingCurrentPage -= 1;
                renderUpcomingTrips();
            }
        });
        upcomingPagination.appendChild(previousArrow);

        buildVisiblePageNumbers(totalPages).forEach((pageNumber) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = String(pageNumber);
            button.className = pageNumber === upcomingCurrentPage ? "trip-upcoming-page-active" : "";
            button.addEventListener("click", () => {
                upcomingCurrentPage = pageNumber;
                renderUpcomingTrips();
            });
            upcomingPagination.appendChild(button);
        });

        const nextArrow = document.createElement("button");
        nextArrow.type = "button";
        nextArrow.innerHTML = "&#8250;";
        nextArrow.disabled = upcomingCurrentPage === totalPages;
        nextArrow.addEventListener("click", () => {
            if (upcomingCurrentPage < totalPages) {
                upcomingCurrentPage += 1;
                renderUpcomingTrips();
            }
        });
        upcomingPagination.appendChild(nextArrow);
    }

    function attachUpcomingInteractions(list = upcomingList) {
        if (!list) return;

        const toggleUpcomingTrip = (loadKey) => {
            if (!loadKey) return;

            if (upcomingExpandedKeys.has(loadKey)) {
                upcomingExpandedKeys.delete(loadKey);
            } else {
                upcomingExpandedKeys.add(loadKey);
            }

            renderAllTripStates();
        };

        list.querySelectorAll("[data-trip-summary]").forEach((summary) => {
            summary.addEventListener("click", (event) => {
                if (event.target.closest("button, select, option, input, textarea, a, label")) {
                    return;
                }

                if (summary.dataset.tripExpandable !== "true") {
                    return;
                }

                toggleUpcomingTrip(summary.dataset.tripSummary);
            });
        });

        list.querySelectorAll("[data-trip-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                toggleUpcomingTrip(button.dataset.tripToggle);
            });
        });

        list.querySelectorAll("[data-trip-notes]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const trip = visibleTripsByKey.get(button.dataset.tripNotes);
                renderTripNotesModal(trip, "comments");
            });
        });

        list.querySelectorAll("[data-trip-assistant]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const trip = visibleTripsByKey.get(button.dataset.tripAssistant);
                openRelayAssistant(trip);
            });
        });

        list.querySelectorAll("[data-trip-payout]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const trip = visibleTripsByKey.get(button.dataset.tripPayout);
                renderTripNotesModal(trip, "payout");
            });
        });

        list.querySelectorAll("[data-trip-shipment]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const trip = visibleTripsByKey.get(button.dataset.tripShipment);
                renderTripNotesModal(trip, "shipment");
            });
        });

        list.querySelectorAll("[data-trip-time-edit]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                renderTripTimeModal(button.dataset.tripTimeEdit, button.dataset.timeEvent || buildTripEventKey(1, "Arrival"));
            });
        });

        list.querySelectorAll("[data-trip-delay]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                renderTripDelayModal(button.dataset.tripDelay, button.dataset.timeEvent || buildTripEventKey(1, "Arrival"));
            });
        });

        list.querySelectorAll("[data-trip-reloads]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                returnToLoadBoard();
            });
        });

        list.querySelectorAll("[data-trip-reject]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                renderTripRejectModal(button.dataset.tripReject);
            });
        });

        list.querySelectorAll("[data-trip-trailer-required]").forEach((input) => {
            input.addEventListener("input", () => {
                const nextValue = normalizeCarrierTrailerNumber(input.value);
                if (input.value !== nextValue) {
                    input.value = nextValue;
                }
                input.classList.toggle("is-invalid", !nextValue);
            });
        });

        list.querySelectorAll("[data-trip-assignment]").forEach((control) => {
            control.addEventListener("change", () => {
                const loadKey = control.dataset.tripAssignment;
                const field = control.dataset.assignmentField;
                if (!loadKey || !field) return;
                const nextValue = control.dataset.tripTrailerRequired === "true"
                    ? normalizeCarrierTrailerNumber(control.value)
                    : (control.value || "");
                if (control.dataset.tripTrailerRequired === "true" && control.value !== nextValue) {
                    control.value = nextValue;
                }

                const nextAssignment = {
                    ...(assignmentSelections.get(loadKey) || {}),
                    [field]: nextValue
                };
                assignmentSelections.set(loadKey, nextAssignment);

                updateBookedTrip(loadKey, (record) => ({
                    ...record,
                    [field]: nextValue,
                    ...(field === "tractorOption"
                        ? { tractorId: nextValue || "" }
                        : {}),
                    updatedAt: new Date().toISOString()
                }));

                list.querySelectorAll("[data-trip-assignment]").forEach((matchingControl) => {
                    if (
                        matchingControl.dataset.tripAssignment === loadKey &&
                        matchingControl.dataset.assignmentField === field
                    ) {
                        matchingControl.value = nextValue;
                        if (field === "driverOption" || matchingControl.dataset.tripTrailerRequired === "true") {
                            matchingControl.classList.toggle("is-invalid", !nextValue);
                        }
                    }
                });

                if (field === "driverOption" || field === "trailerId") {
                    applyTripDriverRequirementState(loadKey);
                }
                applyTripTimeEditAvailability(loadKey);
                renderAllTripStates();
            });
        });

        list.querySelectorAll("[data-trip-segment-assignment]").forEach((control) => {
            control.addEventListener("change", () => {
                const loadKey = control.dataset.tripSegmentAssignment;
                const field = control.dataset.assignmentField;
                const segmentIndex = Number(control.dataset.segmentIndex);
                if (!loadKey || !field || Number.isNaN(segmentIndex) || segmentIndex < 0) return;
                const nextValue = control.dataset.tripTrailerRequired === "true"
                    ? normalizeCarrierTrailerNumber(control.value)
                    : (control.value || "");
                if (control.dataset.tripTrailerRequired === "true" && control.value !== nextValue) {
                    control.value = nextValue;
                }

                const currentLocalAssignment = assignmentSelections.get(loadKey) || {};
                const nextLocalSegments = Array.isArray(currentLocalAssignment.segmentAssignments)
                    ? currentLocalAssignment.segmentAssignments.map((assignment) => ({ ...(assignment || {}) }))
                    : [];
                nextLocalSegments[segmentIndex] = {
                    ...(nextLocalSegments[segmentIndex] || {}),
                    [field]: nextValue,
                    ...(field === "tractorOption" ? { tractorId: nextValue || "" } : {})
                };
                assignmentSelections.set(loadKey, {
                    ...currentLocalAssignment,
                    segmentAssignments: nextLocalSegments
                });

                updateBookedTrip(loadKey, (record) => {
                    const nextSegmentAssignments = Array.isArray(record.segmentAssignments)
                        ? record.segmentAssignments.map((assignment) => ({ ...(assignment || {}) }))
                        : [];
                    nextSegmentAssignments[segmentIndex] = {
                        ...(nextSegmentAssignments[segmentIndex] || {}),
                        [field]: nextValue,
                        ...(field === "tractorOption" ? { tractorId: nextValue || "" } : {})
                    };

                    return {
                        ...record,
                        segmentAssignments: nextSegmentAssignments,
                        updatedAt: new Date().toISOString()
                    };
                });

                list.querySelectorAll("[data-trip-segment-assignment]").forEach((matchingControl) => {
                    if (
                        matchingControl.dataset.tripSegmentAssignment === loadKey &&
                        matchingControl.dataset.assignmentField === field &&
                        Number(matchingControl.dataset.segmentIndex) === segmentIndex
                    ) {
                        matchingControl.value = nextValue;
                        if (matchingControl.dataset.tripTrailerRequired === "true") {
                            matchingControl.classList.toggle("is-invalid", !nextValue);
                        }
                    }
                });

                renderAllTripStates();
            });
        });
    }

    function renderUpcomingTrips(allTrips = getNormalizedBookedTrips()) {
        if (!upcomingSection || !upcomingList || !upcomingEmptyCard || !upcomingResultsCount) {
            return;
        }

        const normalizedTrips = allTrips
            .filter((trip) => (trip.status || "upcoming") === "upcoming");
        const filteredTrips = filterTripsForState(normalizedTrips, "upcoming")
            .sort(compareUpcomingTrips);

        filteredTrips.forEach((trip) => {
            visibleTripsByKey.set(trip.loadKey, trip);
        });

        const totalResults = filteredTrips.length;
        const totalPages = Math.max(1, Math.ceil(totalResults / UPCOMING_PAGE_SIZE));
        if (upcomingCurrentPage > totalPages) {
            upcomingCurrentPage = totalPages;
        }

        const pageStart = (upcomingCurrentPage - 1) * UPCOMING_PAGE_SIZE;
        const pagedTrips = filteredTrips.slice(pageStart, pageStart + UPCOMING_PAGE_SIZE);
        const countStart = totalResults ? pageStart + 1 : 0;
        const countEnd = totalResults ? pageStart + pagedTrips.length : 0;

        upcomingResultsCount.textContent = `${countStart}-${countEnd} of ${totalResults} results`;

        if (!totalResults) {
            upcomingList.innerHTML = "";
            upcomingList.style.display = "none";
            upcomingEmptyCard.style.display = "flex";
            renderUpcomingPagination(0);
            return;
        }

        upcomingEmptyCard.style.display = "none";
        upcomingList.style.display = "grid";
        upcomingList.innerHTML = pagedTrips.map((trip) => buildUpcomingCardMarkup(trip)).join("");
        attachUpcomingInteractions();
        renderUpcomingPagination(totalResults);
    }

    function renderTripStatusList(status, list, emptyCard, countElement, allTrips = getNormalizedBookedTrips()) {
        if (!list || !emptyCard || !countElement) {
            return;
        }

        const statusTrips = allTrips.filter((trip) => (trip.status || "upcoming") === status);
        const weekScopedTrips = status === "history"
            ? statusTrips.filter(tripMatchesSelectedHistoryWeek)
            : statusTrips;
        const trips = filterTripsForState(weekScopedTrips, status);

        trips.forEach((trip) => {
            visibleTripsByKey.set(trip.loadKey, trip);
        });

        countElement.textContent = trips.length
            ? `1-${trips.length} of ${trips.length} results`
            : "0-0 of 0 results";

        if (!trips.length) {
            list.innerHTML = "";
            list.style.display = "none";
            emptyCard.style.display = "flex";
            return;
        }

        emptyCard.style.display = "none";
        list.style.display = "grid";
        list.innerHTML = trips.map((trip) => buildUpcomingCardMarkup(trip)).join("");
        attachUpcomingInteractions(list);
    }

    function renderAllTripStates(allTrips = getNormalizedBookedTrips()) {
        visibleTripsByKey.clear();
        updateHistoryWeekLabel();
        syncAdvancedSearchResultChrome();
        renderUpcomingTrips(allTrips);
        renderTripStatusList("in-transit", inTransitList, inTransitEmptyCard, inTransitResultsCount, allTrips);
        renderTripStatusList("history", historyList, historyEmptyCard, historyResultsCount, allTrips);
    }

    function refreshUpcomingStartTimes() {
        if (!upcomingList) return;

        upcomingList.querySelectorAll("[data-trip-starts-at]").forEach((element) => {
            const startsAt = new Date(element.dataset.tripStartsAt);
            element.textContent = formatStartsIn(startsAt);
        });

        [inTransitList, historyList].forEach((list) => {
            list?.querySelectorAll("[data-trip-starts-at]").forEach((element) => {
                const startsAt = new Date(element.dataset.tripStartsAt);
                element.textContent = formatStartsIn(startsAt);
            });
        });
    }

    historyWeekPrevButton?.addEventListener("click", () => {
        selectedHistoryWeekStart = addDays(selectedHistoryWeekStart, -7);
        renderAllTripStates();
    });

    historyWeekNextButton?.addEventListener("click", () => {
        selectedHistoryWeekStart = addDays(selectedHistoryWeekStart, 7);
        renderAllTripStates();
    });

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const targetTab = tab.dataset.tripTab || "upcoming";
            if (advancedSearchCriteria.active) {
                clearAdvancedSearchCriteria();
                if (targetTab === "upcoming") {
                    upcomingCurrentPage = 1;
                }
                hideAdvancedSearchPanel(targetTab);
                renderAllTripStates();
                return;
            }

            hideAdvancedSearchPanel(targetTab);
        });
    });

    document.querySelectorAll("[data-trip-search]").forEach((input) => {
        input.addEventListener("input", () => {
            clearAdvancedSearchCriteria();
            if (input.dataset.tripSearch === "upcoming") {
                upcomingCurrentPage = 1;
            }
            renderAllTripStates();
        });
    });

    document.querySelectorAll("[data-trip-filter-state]").forEach((control) => {
        control.addEventListener("change", () => {
            clearAdvancedSearchCriteria();
            if (control.dataset.tripFilterState === "upcoming") {
                upcomingCurrentPage = 1;
            }
            renderAllTripStates();
        });
    });

    document.querySelectorAll("[data-trip-needs-attention]").forEach((control) => {
        control.addEventListener("change", () => {
            clearAdvancedSearchCriteria();
            if (control.dataset.tripNeedsAttention === "upcoming") {
                upcomingCurrentPage = 1;
            }
            renderAllTripStates();
        });
    });

    if (upcomingSortTrigger) {
        upcomingSortTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            renderUpcomingSortControl();
            toggleUpcomingSortMenu();
        });
    }

    if (upcomingSortMenu) {
        upcomingSortMenu.addEventListener("click", (event) => {
            const button = event.target.closest("[data-upcoming-sort]");
            if (!button) {
                return;
            }

            upcomingSortValue = button.dataset.upcomingSort || "start-nearest";
            upcomingCurrentPage = 1;
            renderUpcomingSortControl();
            toggleUpcomingSortMenu(false);
            renderAllTripStates();
        });
    }

    document.addEventListener("click", (event) => {
        const sortControl = event.target.closest("[data-trip-sort-control]");
        if (!sortControl) {
            toggleUpcomingSortMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            toggleUpcomingSortMenu(false);
            closeTripBulkAssignModal();
        }
    });

    if (upcomingBulkAssignButton) {
        upcomingBulkAssignButton.addEventListener("click", () => {
            renderTripBulkAssignModal();
        });
    }

    if (advancedSearchToggle) {
        advancedSearchToggle.addEventListener("click", () => {
            if (advancedSearchPanel && !advancedSearchPanel.hidden) {
                hideAdvancedSearchPanel(activeTripTab || "upcoming");
                return;
            }

            showAdvancedSearchPanel();
        });
    }

    advancedSearchAgainButtons.forEach((button) => {
        button.addEventListener("click", () => {
            showAdvancedSearchPanel();
        });
    });

    if (advancedSearchForm) {
        advancedSearchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            ["upcoming", "in-transit", "history"].forEach((status) => resetTripFilters(status));
            advancedSearchCriteria = readAdvancedSearchCriteria();
            const allTrips = getNormalizedBookedTrips();
            upcomingCurrentPage = 1;
            hideAdvancedSearchPanel(getAdvancedSearchTargetTab(allTrips));
            renderAllTripStates(allTrips);
        });
    }

    if (advancedSearchReset) {
        advancedSearchReset.addEventListener("click", () => {
            resetAdvancedSearchForm();
            clearAdvancedSearchCriteria();
            upcomingCurrentPage = 1;
            renderAllTripStates();
        });
    }

    if (upcomingClearFilters) {
        upcomingClearFilters.addEventListener("click", () => {
            upcomingCurrentPage = 1;
            resetTripFilters("upcoming");
            clearAdvancedSearchCriteria();
            renderAllTripStates();
        });
    }

    resetBookedTripsOnReload();
    hydrateTripNotesFromStorage();
    syncPatOrdersFromBookedTrips();
    pendingTripNavigation = readTripNavigationTarget();
    preparePendingTripNavigation();
    activateTab(pendingTripNavigation?.tabName || "upcoming", { immediate: true });
    renderUpcomingSortControl();
    renderAllTripStates();
    focusPendingTripNavigation();
    window.setInterval(refreshUpcomingStartTimes, 60000);
});
