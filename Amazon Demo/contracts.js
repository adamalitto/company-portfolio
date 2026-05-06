function closeNotification(notificationId) {
    const notificationBox = document.getElementById(notificationId);
    if (notificationBox) {
        notificationBox.classList.add("is-hidden");
    }
}

window.closeNotification = closeNotification;

document.addEventListener("DOMContentLoaded", () => {
    const PAGE_SIZE = 10;
    const PROMOTIONS = [
        {
            title: "Relay Rewards Contract Promotions",
            body: "Earn extra cash when you enroll and book eligible contracts at select domiciles. Check out <a href=\"rewards.html\">promotions</a> to see if you're eligible for current offers."
        },
        {
            title: "Plan recurring work before the weekly booking window opens.",
            body: "Preview future blocks earlier and compare similar weekly routes before you commit tractors and drivers for the next booking cycle."
        },
        {
            title: "Use Contracts to stabilize the freight mix around your core domiciles.",
            body: "Pair recurring contracts with your regular Load Board searches so you can protect weekly revenue and still chase strong spot opportunities."
        }
    ];

    const EQUIPMENT_OPTIONS = [
        { value: "all", label: "Equipment" },
        { value: "53-trailer", label: "53' Trailer" },
        { value: "26-box-truck", label: "26' Box Truck" }
    ];

    const DRIVER_OPTIONS = [
        { value: "all", label: "Driver type" },
        { value: "109h-solo", label: "109h Solo" },
        { value: "37h-team", label: "37h Team" }
    ];

    const SORT_OPTIONS = [
        { value: "start-asc", label: "Schedule start date" },
        { value: "block-rate-desc", label: "Highest block rate" },
        { value: "total-payout-desc", label: "Highest total payout" }
    ];

    const BOOKED_EQUIPMENT_OPTIONS = [
        { value: "all", label: "All" },
        { value: "53-trailer", label: "53' Trailer" },
        { value: "26-box-truck", label: "26' Box Truck" }
    ];

    const BOOKED_DRIVER_OPTIONS = [
        { value: "all", label: "All" },
        { value: "109h-solo", label: "109h Solo" },
        { value: "37h-team", label: "37h Team" }
    ];

    const BOOKED_DAY_OPTIONS = [
        { value: "any", label: "Any" },
        { value: "mon-sun", label: "Mon-Sun" }
    ];

    const BOOKED_SHIFT_OPTIONS = [
        { value: "any", label: "Any" },
        { value: "day", label: "Day" }
    ];

    const BOOKED_CONTRACT_TYPE_OPTIONS = [
        { value: "all", label: "All" },
        { value: "full-week", label: "Full-week" }
    ];

    const DEMO_CONTRACT_DATE = parseDate("2026-04-20");
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const BOOKED_CONTRACTS_STORAGE_KEY = "amazonDemoBookedContractIds";
    const CONTRACT_TRIP_DESTINATIONS = [
        { code: "OAK5", city: "Newark, CA" },
        { code: "BWI5", city: "Baltimore, MD" },
        { code: "FTW6", city: "Fort Worth, TX" },
        { code: "CLT2", city: "Charlotte, NC" },
        { code: "DEN4", city: "Denver, CO" },
        { code: "SLC1", city: "Salt Lake City, UT" },
        { code: "PHX6", city: "Phoenix, AZ" },
        { code: "IND8", city: "Indianapolis, IN" }
    ];

    const elements = {
        tabButtons: Array.from(document.querySelectorAll("[data-contract-tab]")),
        availableShell: document.getElementById("contracts-available-shell"),
        bookedShell: document.getElementById("contracts-booked-shell"),
        layout: document.getElementById("contracts-layout"),
        promoCard: document.getElementById("contracts-promo-card"),
        promoTitle: document.getElementById("contracts-promo-title"),
        promoBody: document.getElementById("contracts-promo-body"),
        promoDots: document.getElementById("contracts-promo-dots"),
        promoClose: document.getElementById("contracts-promo-close"),
        earlyBanner: document.getElementById("contracts-early-banner"),
        earlyBannerClose: document.getElementById("contracts-early-close"),
        domicileFilter: document.getElementById("contracts-domicile-filter"),
        equipmentFilter: document.getElementById("contracts-equipment-filter"),
        driverFilter: document.getElementById("contracts-driver-filter"),
        startDate: document.getElementById("contracts-start-date"),
        endDate: document.getElementById("contracts-end-date"),
        bookedSearch: document.getElementById("contracts-booked-search"),
        bookedStartDate: document.getElementById("contracts-booked-start-date"),
        bookedEndDate: document.getElementById("contracts-booked-end-date"),
        bookedEquipmentFilter: document.getElementById("contracts-booked-equipment-filter"),
        bookedDayFilter: document.getElementById("contracts-booked-day-filter"),
        bookedShiftFilter: document.getElementById("contracts-booked-shift-filter"),
        bookedContractTypeFilter: document.getElementById("contracts-booked-contract-type-filter"),
        bookedDriverFilter: document.getElementById("contracts-booked-driver-filter"),
        bookedClearFilters: document.getElementById("contracts-booked-clear-filters"),
        bookedStatusTabs: Array.from(document.querySelectorAll("[data-booked-contract-tab]")),
        bookedUpcomingCount: document.getElementById("contracts-booked-count-upcoming"),
        bookedActiveCount: document.getElementById("contracts-booked-count-active"),
        bookedHistoryCount: document.getElementById("contracts-booked-count-history"),
        bookedList: document.getElementById("contracts-booked-list"),
        bookedEmpty: document.getElementById("contracts-booked-empty"),
        chipRow: document.getElementById("contracts-chip-row"),
        resultsSummary: document.getElementById("contracts-results-summary"),
        clearFilters: document.getElementById("contracts-clear-filters"),
        refreshButton: document.getElementById("contracts-refresh-button"),
        nextUpdateLabel: document.getElementById("contracts-next-update-label"),
        sortFilter: document.getElementById("contracts-sort-filter"),
        flashMessage: document.getElementById("contracts-flash-message"),
        resultsList: document.getElementById("contracts-results-list"),
        emptyState: document.getElementById("contracts-empty-state"),
        pagination: document.getElementById("contracts-pagination"),
        detailPanel: document.getElementById("contracts-detail-panel")
    };

    const state = {
        contracts: applySavedContractState(buildContracts()),
        activeTab: "available",
        bookedContractsTab: "upcoming",
        filters: {
            domicile: "all",
            equipment: "53-trailer",
            driverType: "109h-solo",
            startDate: "",
            endDate: "",
            sort: "start-asc"
        },
        bookedFilters: {
            search: "",
            startDate: "",
            endDate: "",
            equipment: "all",
            dayOfWeek: "any",
            shiftTime: "any",
            contractType: "all",
            driverType: "all"
        },
        currentPage: 1,
        selectedId: null,
        promoIndex: 0,
        promoHidden: false,
        nextUpdateSeconds: 113,
        flashTimeoutId: null
    };

    syncBookedContractTripRecords();
    populateFilters();
    attachEvents();
    renderAll();
    window.setInterval(tickNextUpdateCountdown, 1000);

    function attachEvents() {
        elements.tabButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetTab = button.getAttribute("data-contract-tab");
                if (!targetTab || targetTab === state.activeTab) {
                    return;
                }

                state.activeTab = targetTab;
                state.currentPage = 1;
                state.selectedId = null;
                renderAll();
            });
        });

        if (elements.promoClose) {
            elements.promoClose.addEventListener("click", () => {
                state.promoHidden = true;
                renderPromo();
            });
        }

        if (elements.earlyBannerClose && elements.earlyBanner) {
            elements.earlyBannerClose.addEventListener("click", () => {
                elements.earlyBanner.classList.add("is-hidden");
            });
        }

        if (elements.promoDots) {
            elements.promoDots.addEventListener("click", (event) => {
                const dotButton = event.target.closest("[data-promo-index]");
                if (!dotButton) {
                    return;
                }

                const promoIndex = Number(dotButton.getAttribute("data-promo-index"));
                if (!Number.isInteger(promoIndex)) {
                    return;
                }

                state.promoIndex = promoIndex;
                renderPromo();
            });
        }

        [elements.domicileFilter, elements.equipmentFilter, elements.driverFilter, elements.sortFilter].forEach((select) => {
            if (!select) {
                return;
            }

            select.addEventListener("change", () => {
                syncFilterStateFromInputs();
                state.currentPage = 1;
                renderAll();
            });
        });

        [
            elements.bookedEquipmentFilter,
            elements.bookedDayFilter,
            elements.bookedShiftFilter,
            elements.bookedContractTypeFilter,
            elements.bookedDriverFilter
        ].forEach((select) => {
            if (!select) {
                return;
            }

            select.addEventListener("change", () => {
                syncBookedFilterStateFromInputs();
                renderAll();
            });
        });

        if (elements.bookedSearch) {
            elements.bookedSearch.addEventListener("input", () => {
                syncBookedFilterStateFromInputs();
                renderAll();
            });
        }

        [elements.startDate, elements.endDate, elements.bookedStartDate, elements.bookedEndDate].forEach((input) => {
            if (!input) {
                return;
            }

            const parentField = input.closest(".contracts-date-field");
            const syncVisualState = () => {
                if (parentField) {
                    parentField.classList.toggle("has-value", Boolean(input.value));
                }
            };

            const placeholder = getDatePlaceholder(input.id);

            input.addEventListener("focus", () => {
                if (!input.value && input.type !== "date") {
                    input.type = "date";
                }
            });

            input.addEventListener("change", () => {
                if (input.id.startsWith("contracts-booked-")) {
                    syncBookedFilterStateFromInputs();
                } else {
                    syncFilterStateFromInputs();
                    state.currentPage = 1;
                }
                syncVisualState();
                renderAll();
            });

            input.addEventListener("input", syncVisualState);
            input.addEventListener("blur", () => {
                if (!input.value) {
                    input.type = "text";
                    input.placeholder = placeholder;
                }
                syncVisualState();
            });
            input.placeholder = placeholder;
            syncVisualState();
        });

        if (elements.clearFilters) {
            elements.clearFilters.addEventListener("click", () => {
                resetFilters();
                renderAll();
            });
        }

        if (elements.bookedClearFilters) {
            elements.bookedClearFilters.addEventListener("click", () => {
                resetBookedFilters();
                renderAll();
            });
        }

        if (elements.refreshButton) {
            elements.refreshButton.addEventListener("click", () => {
                state.nextUpdateSeconds = 113;
                updateNextUpdateLabel();
            });
        }

        if (elements.chipRow) {
            elements.chipRow.addEventListener("click", (event) => {
                const clearButton = event.target.closest("[data-clear-chip]");
                if (!clearButton) {
                    return;
                }

                const filterKey = clearButton.getAttribute("data-clear-chip");
                clearSingleFilter(filterKey);
                renderAll();
            });
        }

        if (elements.resultsList) {
            elements.resultsList.addEventListener("click", (event) => {
                const favoriteButton = event.target.closest("[data-contract-favorite]");
                if (favoriteButton) {
                    const contractId = favoriteButton.getAttribute("data-contract-favorite");
                    toggleFavorite(contractId);
                    renderAll();
                    return;
                }

                const bookButton = event.target.closest("[data-contract-book]");
                if (bookButton) {
                    const contractId = bookButton.getAttribute("data-contract-book");
                    state.selectedId = contractId;
                    renderAll();
                    maybeScrollDetailPanelIntoView();
                    return;
                }

                const row = event.target.closest("[data-contract-row]");
                if (row) {
                    const contractId = row.getAttribute("data-contract-row");
                    state.selectedId = contractId;
                    renderAll();
                }
            });
        }

        if (elements.detailPanel) {
            elements.detailPanel.addEventListener("click", (event) => {
                const favoriteButton = event.target.closest("[data-panel-favorite]");
                if (favoriteButton) {
                    const contractId = favoriteButton.getAttribute("data-panel-favorite");
                    toggleFavorite(contractId);
                    renderAll();
                    return;
                }

                if (event.target.closest("[data-contract-panel-close]")) {
                    state.selectedId = null;
                    renderAll();
                    return;
                }

                if (event.target.closest("[data-contract-cancel]")) {
                    state.selectedId = null;
                    showFlashMessage("Booking review canceled.");
                    renderAll();
                    return;
                }

                if (event.target.closest("[data-contract-confirm]")) {
                    confirmSelectedContract();
                }
            });
        }

        if (elements.pagination) {
            elements.pagination.addEventListener("click", (event) => {
                const pageButton = event.target.closest("[data-page]");
                if (!pageButton) {
                    return;
                }

                const nextPage = Number(pageButton.getAttribute("data-page"));
                if (!Number.isInteger(nextPage) || nextPage < 1) {
                    return;
                }

                state.currentPage = nextPage;
                renderAll();
            });
        }

        elements.bookedStatusTabs.forEach((button) => {
            button.addEventListener("click", () => {
                const tabName = button.getAttribute("data-booked-contract-tab");
                if (!tabName || tabName === state.bookedContractsTab) {
                    return;
                }

                state.bookedContractsTab = tabName;
                renderAll();
            });
        });
    }

    function populateFilters() {
        populateSelect(
            elements.domicileFilter,
            [{ value: "all", label: "Domicile" }].concat(
                uniqueByValue(
                    state.contracts.map((contract) => ({
                        value: contract.domicileValue,
                        label: contract.domicile
                    }))
                ).sort((left, right) => left.label.localeCompare(right.label))
            )
        );

        populateSelect(elements.equipmentFilter, EQUIPMENT_OPTIONS);
        populateSelect(elements.driverFilter, DRIVER_OPTIONS);
        populateSelect(elements.sortFilter, SORT_OPTIONS);
        populateSelect(elements.bookedEquipmentFilter, BOOKED_EQUIPMENT_OPTIONS);
        populateSelect(elements.bookedDayFilter, BOOKED_DAY_OPTIONS);
        populateSelect(elements.bookedShiftFilter, BOOKED_SHIFT_OPTIONS);
        populateSelect(elements.bookedContractTypeFilter, BOOKED_CONTRACT_TYPE_OPTIONS);
        populateSelect(elements.bookedDriverFilter, BOOKED_DRIVER_OPTIONS);
        syncInputsFromState();
        syncBookedInputsFromState();
    }

    function renderAll() {
        renderPromo();
        syncTabButtons();
        toggleActiveShell();
        updateNextUpdateLabel();

        if (state.activeTab === "booked") {
            syncBookedInputsFromState();
            clearDetailPanel();
            renderBookedContractsView();
            return;
        }

        syncInputsFromState();

        const filteredContracts = getFilteredContracts();
        ensureSelectedContract(filteredContracts);

        const paginatedContracts = paginateContracts(filteredContracts);
        renderChipRow();
        renderResultsSummary(filteredContracts, paginatedContracts);
        renderContractsList(paginatedContracts);
        renderPagination(filteredContracts.length);
        renderDetailPanel(filteredContracts);
        renderEmptyState(filteredContracts);
    }

    function renderPromo() {
        if (!elements.promoCard || !elements.promoTitle || !elements.promoBody || !elements.promoDots) {
            return;
        }

        elements.promoCard.classList.toggle("is-hidden", state.promoHidden);
        if (state.promoHidden) {
            return;
        }

        const promo = PROMOTIONS[state.promoIndex] || PROMOTIONS[0];
        elements.promoTitle.textContent = promo.title;
        elements.promoBody.innerHTML = promo.body;
        elements.promoDots.innerHTML = PROMOTIONS.map((_, index) => (
            `<button class="contracts-promo-dot${index === state.promoIndex ? " is-active" : ""}" type="button" data-promo-index="${index}" aria-label="Promotion ${index + 1}"></button>`
        )).join("");
    }

    function syncTabButtons() {
        elements.tabButtons.forEach((button) => {
            const tabKey = button.getAttribute("data-contract-tab");
            const isActive = tabKey === state.activeTab;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
    }

    function syncFilterStateFromInputs() {
        state.filters.domicile = elements.domicileFilter ? elements.domicileFilter.value : "all";
        state.filters.equipment = elements.equipmentFilter ? elements.equipmentFilter.value : "all";
        state.filters.driverType = elements.driverFilter ? elements.driverFilter.value : "all";
        state.filters.startDate = elements.startDate ? elements.startDate.value : "";
        state.filters.endDate = elements.endDate ? elements.endDate.value : "";
        state.filters.sort = elements.sortFilter ? elements.sortFilter.value : "start-asc";
    }

    function syncBookedFilterStateFromInputs() {
        state.bookedFilters.search = elements.bookedSearch ? elements.bookedSearch.value.trim() : "";
        state.bookedFilters.startDate = elements.bookedStartDate ? elements.bookedStartDate.value : "";
        state.bookedFilters.endDate = elements.bookedEndDate ? elements.bookedEndDate.value : "";
        state.bookedFilters.equipment = elements.bookedEquipmentFilter ? elements.bookedEquipmentFilter.value : "all";
        state.bookedFilters.dayOfWeek = elements.bookedDayFilter ? elements.bookedDayFilter.value : "any";
        state.bookedFilters.shiftTime = elements.bookedShiftFilter ? elements.bookedShiftFilter.value : "any";
        state.bookedFilters.contractType = elements.bookedContractTypeFilter ? elements.bookedContractTypeFilter.value : "all";
        state.bookedFilters.driverType = elements.bookedDriverFilter ? elements.bookedDriverFilter.value : "all";
    }

    function syncInputsFromState() {
        if (elements.domicileFilter) {
            elements.domicileFilter.value = state.filters.domicile;
        }
        if (elements.equipmentFilter) {
            elements.equipmentFilter.value = state.filters.equipment;
        }
        if (elements.driverFilter) {
            elements.driverFilter.value = state.filters.driverType;
        }
        if (elements.startDate) {
            syncDateInputDisplay(elements.startDate, state.filters.startDate, "Start date");
        }
        if (elements.endDate) {
            syncDateInputDisplay(elements.endDate, state.filters.endDate, "End date");
        }
        if (elements.sortFilter) {
            elements.sortFilter.value = state.filters.sort;
        }
    }

    function syncBookedInputsFromState() {
        if (elements.bookedSearch) {
            elements.bookedSearch.value = state.bookedFilters.search;
        }
        if (elements.bookedEquipmentFilter) {
            elements.bookedEquipmentFilter.value = state.bookedFilters.equipment;
        }
        if (elements.bookedDayFilter) {
            elements.bookedDayFilter.value = state.bookedFilters.dayOfWeek;
        }
        if (elements.bookedShiftFilter) {
            elements.bookedShiftFilter.value = state.bookedFilters.shiftTime;
        }
        if (elements.bookedContractTypeFilter) {
            elements.bookedContractTypeFilter.value = state.bookedFilters.contractType;
        }
        if (elements.bookedDriverFilter) {
            elements.bookedDriverFilter.value = state.bookedFilters.driverType;
        }
        if (elements.bookedStartDate) {
            syncDateInputDisplay(elements.bookedStartDate, state.bookedFilters.startDate, "Start Date");
        }
        if (elements.bookedEndDate) {
            syncDateInputDisplay(elements.bookedEndDate, state.bookedFilters.endDate, "End Date");
        }
    }

    function getDatePlaceholder(inputId) {
        switch (inputId) {
            case "contracts-booked-start-date":
                return "Start Date";
            case "contracts-booked-end-date":
                return "End Date";
            case "contracts-end-date":
                return "End date";
            case "contracts-start-date":
            default:
                return "Start date";
        }
    }

    function syncDateInputDisplay(input, value, placeholder) {
        if (!input) {
            return;
        }

        input.placeholder = placeholder;
        input.type = value ? "date" : "text";
        input.value = value || "";

        const field = input.closest(".contracts-date-field");
        if (field) {
            field.classList.toggle("has-value", Boolean(value));
        }
    }

    function toggleActiveShell() {
        if (elements.availableShell) {
            elements.availableShell.classList.toggle("is-hidden", state.activeTab !== "available");
        }
        if (elements.bookedShell) {
            elements.bookedShell.classList.toggle("is-hidden", state.activeTab !== "booked");
        }
    }

    function clearDetailPanel() {
        if (elements.layout) {
            elements.layout.classList.remove("has-detail-panel");
        }
        if (elements.detailPanel) {
            elements.detailPanel.classList.remove("is-visible");
            elements.detailPanel.innerHTML = "";
        }
    }

    function renderChipRow() {
        if (!elements.chipRow) {
            return;
        }

        const chips = [];

        if (state.filters.domicile !== "all") {
            const option = elements.domicileFilter ? elements.domicileFilter.selectedOptions[0] : null;
            chips.push({ key: "domicile", label: `Domicile: ${option ? option.textContent : state.filters.domicile}` });
        }
        if (state.filters.equipment !== "all") {
            const option = elements.equipmentFilter ? elements.equipmentFilter.selectedOptions[0] : null;
            chips.push({ key: "equipment", label: `Equipment: ${option ? option.textContent : state.filters.equipment}` });
        }
        if (state.filters.driverType !== "all") {
            const option = elements.driverFilter ? elements.driverFilter.selectedOptions[0] : null;
            chips.push({ key: "driverType", label: `Driver type: ${option ? option.textContent : state.filters.driverType}` });
        }
        if (state.filters.startDate) {
            chips.push({ key: "startDate", label: `Start: ${formatDateCompact(parseDate(state.filters.startDate))}` });
        }
        if (state.filters.endDate) {
            chips.push({ key: "endDate", label: `End: ${formatDateCompact(parseDate(state.filters.endDate))}` });
        }

        elements.chipRow.innerHTML = chips.map((chip) => (
            `<span class="contracts-chip">${escapeHtml(chip.label)} <button type="button" data-clear-chip="${chip.key}" aria-label="Remove ${escapeHtml(chip.label)}">&times;</button></span>`
        )).join("");
    }

    function getFilteredContracts() {
        const activeContracts = state.contracts.filter((contract) => (
            state.activeTab === "available" ? contract.status === "available" : contract.status === "booked"
        ));

        const startDate = state.filters.startDate ? parseDate(state.filters.startDate) : null;
        const endDate = state.filters.endDate ? parseDate(state.filters.endDate) : null;

        return activeContracts
            .filter((contract) => {
                if (state.filters.domicile !== "all" && contract.domicileValue !== state.filters.domicile) {
                    return false;
                }
                if (state.filters.equipment !== "all" && contract.equipmentValue !== state.filters.equipment) {
                    return false;
                }
                if (state.filters.driverType !== "all" && contract.driverTypeValue !== state.filters.driverType) {
                    return false;
                }
                if (startDate && contract.endDate < startDate) {
                    return false;
                }
                if (endDate && contract.startDate > endDate) {
                    return false;
                }
                return true;
            })
            .sort(compareContracts);
    }

    function renderBookedContractsView() {
        const bookedContracts = getBookedContracts();
        renderBookedStatusCounts(bookedContracts);
        syncBookedStatusTabs();

        const filteredContracts = getFilteredBookedContracts(bookedContracts);
        renderBookedContractsList(filteredContracts);
        renderBookedEmptyState(filteredContracts);
    }

    function getBookedContracts() {
        return state.contracts.filter((contract) => contract.status === "booked");
    }

    function getBookedContractStatus(contract) {
        if (contract.endDate < DEMO_CONTRACT_DATE) {
            return "history";
        }
        if (contract.startDate <= DEMO_CONTRACT_DATE && contract.endDate >= DEMO_CONTRACT_DATE) {
            return "active";
        }
        return "upcoming";
    }

    function renderBookedStatusCounts(bookedContracts) {
        const counts = {
            upcoming: 0,
            active: 0,
            history: 0
        };

        bookedContracts.forEach((contract) => {
            counts[getBookedContractStatus(contract)] += 1;
        });

        if (elements.bookedUpcomingCount) {
            elements.bookedUpcomingCount.textContent = String(counts.upcoming);
        }
        if (elements.bookedActiveCount) {
            elements.bookedActiveCount.textContent = String(counts.active);
        }
        if (elements.bookedHistoryCount) {
            elements.bookedHistoryCount.textContent = String(counts.history);
        }
    }

    function syncBookedStatusTabs() {
        elements.bookedStatusTabs.forEach((button) => {
            const tabKey = button.getAttribute("data-booked-contract-tab");
            const isActive = tabKey === state.bookedContractsTab;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
    }

    function getFilteredBookedContracts(bookedContracts) {
        const searchValue = state.bookedFilters.search.toLowerCase();
        const startDate = state.bookedFilters.startDate ? parseDate(state.bookedFilters.startDate) : null;
        const endDate = state.bookedFilters.endDate ? parseDate(state.bookedFilters.endDate) : null;

        return bookedContracts
            .filter((contract) => getBookedContractStatus(contract) === state.bookedContractsTab)
            .filter((contract) => {
                if (searchValue) {
                    const haystack = `${contract.id} ${contract.domicile}`.toLowerCase();
                    if (!haystack.includes(searchValue)) {
                        return false;
                    }
                }
                if (state.bookedFilters.equipment !== "all" && contract.equipmentValue !== state.bookedFilters.equipment) {
                    return false;
                }
                if (state.bookedFilters.dayOfWeek !== "any" && contract.dayOfWeekValue !== state.bookedFilters.dayOfWeek) {
                    return false;
                }
                if (state.bookedFilters.shiftTime !== "any" && contract.shiftTimeValue !== state.bookedFilters.shiftTime) {
                    return false;
                }
                if (state.bookedFilters.contractType !== "all" && contract.contractTypeValue !== state.bookedFilters.contractType) {
                    return false;
                }
                if (state.bookedFilters.driverType !== "all" && contract.driverTypeValue !== state.bookedFilters.driverType) {
                    return false;
                }
                if (startDate && contract.endDate < startDate) {
                    return false;
                }
                if (endDate && contract.startDate > endDate) {
                    return false;
                }
                return true;
            })
            .sort(compareBookedContracts);
    }

    function compareBookedContracts(left, right) {
        if (state.bookedContractsTab === "history") {
            return (
                right.endDate - left.endDate ||
                left.orderIndex - right.orderIndex
            );
        }

        return (
            left.startDate - right.startDate ||
            left.orderIndex - right.orderIndex
        );
    }

    function renderBookedContractsList(contracts) {
        if (!elements.bookedList) {
            return;
        }

        elements.bookedList.innerHTML = contracts.map((contract) => renderBookedContractCard(contract)).join("");
        elements.bookedList.classList.toggle("is-hidden", contracts.length === 0);
    }

    function renderBookedContractCard(contract) {
        const contractStatus = getBookedContractStatus(contract);
        const tripsNote = contractStatus === "upcoming"
            ? `
                <div class="contracts-booked-note">
                    Trips from this contract will appear in <strong>Trips &gt; Upcoming</strong> every week from the contract start through the end date.
                </div>
            `
            : "";

        return `
            <article class="contracts-booked-card">
                <div class="contracts-booked-card-top">
                    <div>
                        <small>ID ${escapeHtml(contract.id)}</small>
                        <h3>${escapeHtml(contract.domicile)}</h3>
                        <p>${escapeHtml(contract.longSchedule)}</p>
                        <small>${escapeHtml(contract.weekLabel)}</small>
                    </div>
                    <span class="contracts-booked-pill is-${escapeHtml(contractStatus)}">${escapeHtml(formatBookedStatusLabel(contractStatus))}</span>
                </div>

                <div class="contracts-booked-card-grid">
                    <div>
                        <span>Equipment</span>
                        <strong>${escapeHtml(contract.equipmentLabel)}</strong>
                    </div>
                    <div>
                        <span>Driver type</span>
                        <strong>${escapeHtml(contract.driverTypeLabel)}</strong>
                    </div>
                    <div>
                        <span>Shift-time</span>
                        <strong>${escapeHtml(contract.shiftTimeLabel)}</strong>
                    </div>
                    <div>
                        <span>Day of week</span>
                        <strong>${escapeHtml(contract.dayOfWeekLabel)}</strong>
                    </div>
                    <div>
                        <span>Estimated payout</span>
                        <strong>${escapeHtml(formatCurrency(contract.totalPayout))}</strong>
                    </div>
                </div>

                ${tripsNote}
            </article>
        `;
    }

    function renderBookedEmptyState(contracts) {
        if (!elements.bookedEmpty) {
            return;
        }

        const emptyMessages = {
            upcoming: "No upcoming contracts present.",
            active: "No active contracts present.",
            history: "No contract history present."
        };

        if (contracts.length) {
            elements.bookedEmpty.classList.add("is-hidden");
            elements.bookedEmpty.textContent = "";
            return;
        }

        elements.bookedEmpty.classList.remove("is-hidden");
        elements.bookedEmpty.textContent = emptyMessages[state.bookedContractsTab] || "No contracts present.";
    }

    function formatBookedStatusLabel(status) {
        switch (status) {
            case "active":
                return "Active";
            case "history":
                return "History";
            case "upcoming":
            default:
                return "Upcoming";
        }
    }

    function paginateContracts(contracts) {
        const totalPages = Math.max(1, Math.ceil(contracts.length / PAGE_SIZE));
        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }

        const startIndex = (state.currentPage - 1) * PAGE_SIZE;
        return contracts.slice(startIndex, startIndex + PAGE_SIZE);
    }

    function ensureSelectedContract(visibleContracts) {
        if (!visibleContracts.length) {
            state.selectedId = null;
            return;
        }

        if (state.selectedId && !visibleContracts.some((contract) => contract.id === state.selectedId)) {
            state.selectedId = null;
        }
    }

    function renderResultsSummary(filteredContracts, paginatedContracts) {
        if (!elements.resultsSummary) {
            return;
        }

        if (!filteredContracts.length) {
            elements.resultsSummary.textContent = "Showing 0-0 of 0 results";
            return;
        }

        const start = ((state.currentPage - 1) * PAGE_SIZE) + 1;
        const end = start + paginatedContracts.length - 1;
        elements.resultsSummary.textContent = `Showing ${start}-${end} of ${filteredContracts.length} results`;
    }

    function renderContractsList(contracts) {
        if (!elements.resultsList) {
            return;
        }

        elements.resultsList.innerHTML = contracts.map((contract) => renderContractRow(contract)).join("");
    }

    function renderContractRow(contract) {
        const isSelected = contract.id === state.selectedId;
        const actionLabel = state.activeTab === "available" ? "Book" : "View";
        const favoriteIcon = contract.favorite ? "&#9733;" : "&#9734;";
        const equipmentBadge = contract.equipmentBadge
            ? `<span class="contracts-equipment-badge">${escapeHtml(contract.equipmentBadge)}</span>`
            : "";

        return `
            <article class="contracts-row${isSelected ? " is-selected" : ""}" data-contract-row="${escapeHtml(contract.id)}">
                <div class="contracts-row-main">
                    <h3>${escapeHtml(contract.domicile)}</h3>
                    <p>${escapeHtml(contract.shortSchedule)}</p>
                    <small>${escapeHtml(contract.weekLabel)}</small>
                </div>

                <div class="contracts-row-meta">
                    <strong>${escapeHtml(contract.driverLabel)}</strong>
                    <small>${escapeHtml(contract.driverTypeLabel)}</small>
                </div>

                <div class="contracts-row-meta">
                    <strong>${escapeHtml(contract.blockLabel)}</strong>
                    <small>Per driver</small>
                </div>

                <div class="contracts-row-equipment">
                    <strong>${escapeHtml(contract.tractorLabel)}</strong>
                    <small>${escapeHtml(contract.equipmentLabel)}${equipmentBadge}</small>
                </div>

                <div class="contracts-row-type">
                    <strong>${escapeHtml(contract.contractType)}</strong>
                </div>

                <div class="contracts-price-cell">
                    <strong>${escapeHtml(formatCurrency(contract.blockRate))}</strong><span>/block</span>
                    <small>${escapeHtml(formatCurrency(contract.totalPayout))} Total</small>
                    <small>+ Fuel and accessories</small>
                </div>

                <div class="contracts-row-actions">
                    <button class="contracts-favorite-button${contract.favorite ? " is-favorite" : ""}" type="button" data-contract-favorite="${escapeHtml(contract.id)}" aria-label="${contract.favorite ? "Remove favorite" : "Add favorite"}">${favoriteIcon}</button>
                    <button class="contracts-row-book-button" type="button" data-contract-book="${escapeHtml(contract.id)}">${actionLabel}</button>
                    <button class="contracts-chevron-button" type="button" data-contract-book="${escapeHtml(contract.id)}" aria-label="View ${escapeHtml(contract.domicile)}">&#8250;</button>
                </div>
            </article>
        `;
    }

    function renderPagination(totalResults) {
        if (!elements.pagination) {
            return;
        }

        const totalPages = Math.ceil(totalResults / PAGE_SIZE);
        if (totalPages <= 1) {
            elements.pagination.innerHTML = "";
            return;
        }

        const buttons = [];
        buttons.push(`<button type="button" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? "disabled" : ""}>&#8249;</button>`);

        for (let page = 1; page <= totalPages; page += 1) {
            buttons.push(`<button type="button" data-page="${page}" class="${page === state.currentPage ? "is-active" : ""}">${page}</button>`);
        }

        buttons.push(`<button type="button" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? "disabled" : ""}>&#8250;</button>`);
        elements.pagination.innerHTML = buttons.join("");
    }

    function renderDetailPanel(filteredContracts) {
        if (!elements.detailPanel) {
            return;
        }

        const selectedContract = filteredContracts.find((contract) => contract.id === state.selectedId) || null;
        if (!selectedContract) {
            if (elements.layout) {
                elements.layout.classList.remove("has-detail-panel");
            }
            elements.detailPanel.classList.remove("is-visible");
            elements.detailPanel.innerHTML = "";
            return;
        }

        if (elements.layout) {
            elements.layout.classList.add("has-detail-panel");
        }
        elements.detailPanel.classList.add("is-visible");

        const favoriteIcon = selectedContract.favorite ? "&#9733;" : "&#9734;";
        const actionSection = selectedContract.status === "available"
            ? `
                <div class="contracts-panel-section">
                    <h3>Confirm booking</h3>
                    <p>Are you sure you want to book this contract?</p>
                    <div class="contracts-warning-line">
                        <span class="contracts-warning-icon">!</span>
                        <p>Rejecting this work after you book will impact your performance score.</p>
                    </div>
                    <div class="contracts-confirm-actions">
                        <button class="contracts-secondary-button" type="button" data-contract-cancel>No</button>
                        <button class="contracts-primary-button" type="button" data-contract-confirm>Yes, confirm booking</button>
                    </div>
                    <div class="contracts-note-box">
                        <p>Block details confirmed on Friday before each execution week.</p>
                        <p>Fuel surcharge and accessories are additional.</p>
                        <p>This contract is subject to our <a href="carrierterms.html">Program Policies</a>.</p>
                    </div>
                </div>
            `
            : `
                <div class="contracts-panel-section">
                    <span class="contracts-status-pill">Booked contract</span>
                    <p style="margin-top:8px;">This contract now lives on your Contracts tab and is ready for weekly execution planning.</p>
                </div>
            `;

        elements.detailPanel.innerHTML = `
            <div class="contracts-panel-head">
                <button class="contracts-panel-close" type="button" data-contract-panel-close aria-label="Close details">&times;</button>
                <div class="contracts-panel-title-row">
                    <div>
                        <h2>${escapeHtml(selectedContract.domicile)}</h2>
                        <p>${escapeHtml(selectedContract.longSchedule)}</p>
                        <small>${escapeHtml(selectedContract.weekLabel)}</small>
                    </div>
                    <button class="contracts-favorite-button${selectedContract.favorite ? " is-favorite" : ""}" type="button" data-panel-favorite="${escapeHtml(selectedContract.id)}" aria-label="${selectedContract.favorite ? "Remove favorite" : "Add favorite"}">${favoriteIcon}</button>
                </div>
                <div class="contracts-panel-summary">
                    <strong>${escapeHtml(formatCurrency(selectedContract.totalPayout))}</strong>
                    <span>${escapeHtml(formatCurrency(selectedContract.blockRate))}/block</span>
                    <span>+ Fuel and accessories</span>
                </div>
            </div>

            ${actionSection}

            <div class="contracts-panel-section">
                <h3>Resources per week</h3>
                <div class="contracts-resources-grid">
                    <div class="contracts-resource-card">
                        <strong>${escapeHtml(selectedContract.driverLabel)}</strong>
                        <small>${escapeHtml(selectedContract.driverTypeLabel)}</small>
                    </div>
                    <div class="contracts-resource-card">
                        <strong>${escapeHtml(selectedContract.tractorLabel)}</strong>
                        <small>${escapeHtml(selectedContract.equipmentLabel)}</small>
                    </div>
                    <div class="contracts-resource-card">
                        <strong>Provided</strong>
                        <small>Trailer and weekly execution support</small>
                    </div>
                </div>
            </div>

            <div class="contracts-panel-section">
                <h3>Blocks per week</h3>
                <div class="contracts-resource-card">
                    <strong>Maximum</strong>
                    <small>${escapeHtml(`${selectedContract.blocksPerDriver} x ${selectedContract.driverTypeLabel} block per driver`)}</small>
                </div>
            </div>

            <div class="contracts-panel-section">
                <h3>Contract type</h3>
                <div class="contracts-resource-card">
                    <strong>${escapeHtml(selectedContract.contractType)}</strong>
                    <small>Block details will be confirmed on the Friday before each execution week.</small>
                </div>
            </div>

            <div class="contracts-panel-section">
                <div class="contracts-payout-head">
                    <strong>Estimated Payout</strong>
                    <span>${escapeHtml(formatCurrency(selectedContract.totalPayout))}</span>
                </div>
                <div class="contracts-payout-line">
                    <div>
                        <strong>Block rate</strong>
                    </div>
                    <div>
                        <strong>${escapeHtml(formatCurrency(selectedContract.blockRate))}</strong>
                        <small>per block</small>
                    </div>
                </div>
                <p style="margin-top:10px;">Fuel surcharge and accessories are additional.</p>
            </div>
        `;
    }

    function renderEmptyState(filteredContracts) {
        if (!elements.emptyState) {
            return;
        }

        if (filteredContracts.length) {
            elements.emptyState.classList.add("is-hidden");
            return;
        }

        const message = state.activeTab === "available"
            ? {
                title: "No offers match these filters",
                body: "Try clearing the filters or widening the schedule window to see more contract opportunities."
            }
            : {
                title: "No booked contracts yet",
                body: "Confirm a booking from Available offers and it will move here automatically."
            };

        elements.emptyState.classList.remove("is-hidden");
        elements.emptyState.innerHTML = `<h3>${escapeHtml(message.title)}</h3><p>${escapeHtml(message.body)}</p>`;
    }

    function confirmSelectedContract() {
        const contract = state.contracts.find((item) => item.id === state.selectedId);
        if (!contract || contract.status !== "available") {
            return;
        }

        contract.status = "booked";
        saveBookedContractId(contract.id);
        syncContractTripRecords(contract);
        state.activeTab = "booked";
        state.bookedContractsTab = getBookedContractStatus(contract);
        state.currentPage = 1;
        state.selectedId = contract.id;
        showFlashMessage(`${contract.domicile} moved to your Contracts tab.`);
        renderAll();
    }

    function clearSingleFilter(filterKey) {
        switch (filterKey) {
            case "domicile":
                state.filters.domicile = "all";
                break;
            case "equipment":
                state.filters.equipment = "all";
                break;
            case "driverType":
                state.filters.driverType = "all";
                break;
            case "startDate":
                state.filters.startDate = "";
                break;
            case "endDate":
                state.filters.endDate = "";
                break;
            default:
                return;
        }

        state.currentPage = 1;
    }

    function resetFilters() {
        state.filters = {
            domicile: "all",
            equipment: "all",
            driverType: "all",
            startDate: "",
            endDate: "",
            sort: "start-asc"
        };
        state.currentPage = 1;
    }

    function resetBookedFilters() {
        state.bookedFilters = {
            search: "",
            startDate: "",
            endDate: "",
            equipment: "all",
            dayOfWeek: "any",
            shiftTime: "any",
            contractType: "all",
            driverType: "all"
        };
    }

    function maybeScrollDetailPanelIntoView() {
        if (window.innerWidth <= 1380 && elements.detailPanel) {
            elements.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function toggleFavorite(contractId) {
        const contract = state.contracts.find((item) => item.id === contractId);
        if (contract) {
            contract.favorite = !contract.favorite;
        }
    }

    function compareContracts(left, right) {
        switch (state.filters.sort) {
            case "block-rate-desc":
                return (
                    right.blockRate - left.blockRate ||
                    left.startDate - right.startDate ||
                    left.orderIndex - right.orderIndex
                );
            case "total-payout-desc":
                return (
                    right.totalPayout - left.totalPayout ||
                    left.startDate - right.startDate ||
                    left.orderIndex - right.orderIndex
                );
            case "start-asc":
            default:
                return (
                    left.startDate - right.startDate ||
                    left.orderIndex - right.orderIndex
                );
        }
    }

    function tickNextUpdateCountdown() {
        state.nextUpdateSeconds = state.nextUpdateSeconds > 0 ? state.nextUpdateSeconds - 1 : 113;
        updateNextUpdateLabel();
    }

    function updateNextUpdateLabel() {
        if (elements.nextUpdateLabel) {
            elements.nextUpdateLabel.textContent = `Next update ${state.nextUpdateSeconds}s`;
        }
    }

    function showFlashMessage(message) {
        if (!elements.flashMessage) {
            return;
        }

        elements.flashMessage.textContent = message;
        elements.flashMessage.classList.remove("is-hidden");

        if (state.flashTimeoutId) {
            window.clearTimeout(state.flashTimeoutId);
        }

        state.flashTimeoutId = window.setTimeout(() => {
            if (elements.flashMessage) {
                elements.flashMessage.classList.add("is-hidden");
            }
        }, 2800);
    }

    function loadBookedContractIds() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(BOOKED_CONTRACTS_STORAGE_KEY) || "[]");
            return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
        } catch (error) {
            console.warn("Unable to read booked contract state.", error);
            return new Set();
        }
    }

    function saveBookedContractId(contractId) {
        const bookedIds = loadBookedContractIds();
        bookedIds.add(contractId);

        try {
            sessionStorage.setItem(BOOKED_CONTRACTS_STORAGE_KEY, JSON.stringify(Array.from(bookedIds)));
        } catch (error) {
            console.warn("Unable to save booked contract state.", error);
        }
    }

    function applySavedContractState(contracts) {
        const bookedIds = loadBookedContractIds();
        return contracts.map((contract) => (
            bookedIds.has(contract.id)
                ? { ...contract, status: "booked" }
                : contract
        ));
    }

    function loadBookedTrips() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn("Unable to read booked trip state.", error);
            return [];
        }
    }

    function saveBookedTrips(trips) {
        try {
            sessionStorage.setItem(BOOKED_TRIPS_STORAGE_KEY, JSON.stringify(trips));
        } catch (error) {
            console.warn("Unable to save booked trip state.", error);
        }
    }

    function syncBookedContractTripRecords() {
        state.contracts
            .filter((contract) => contract.status === "booked")
            .forEach((contract) => syncContractTripRecords(contract));
    }

    function syncContractTripRecords(contract) {
        const nextRecords = buildContractTripRecords(contract);
        const nextKeys = new Set(nextRecords.map((record) => record.loadKey));
        const existingTrips = loadBookedTrips();
        const existingByKey = new Map(existingTrips.map((trip) => [trip.loadKey, trip]));
        const mergedRecords = nextRecords.map((record) => mergeContractTripRecord(record, existingByKey.get(record.loadKey)));
        const otherTrips = existingTrips.filter((trip) => !nextKeys.has(trip.loadKey));
        saveBookedTrips([...mergedRecords, ...otherTrips]);
    }

    function mergeContractTripRecord(record, existingRecord) {
        if (!existingRecord) {
            return record;
        }

        return {
            ...existingRecord,
            ...record,
            status: existingRecord.status || record.status,
            bookedAt: existingRecord.bookedAt || record.bookedAt,
            actualTimes: existingRecord.actualTimes || record.actualTimes,
            lateEvents: existingRecord.lateEvents || record.lateEvents,
            delayEvents: existingRecord.delayEvents || record.delayEvents,
            driverOption: existingRecord.driverOption || record.driverOption,
            tractorOption: existingRecord.tractorOption || record.tractorOption,
            trailerId: existingRecord.trailerId || record.trailerId,
            segmentAssignments: existingRecord.segmentAssignments || record.segmentAssignments,
            rejection: existingRecord.rejection || record.rejection,
            historyStatus: existingRecord.historyStatus || record.historyStatus
        };
    }

    function buildContractTripRecords(contract) {
        const blockCount = Math.max(1, contract.drivers * contract.blocksPerDriver);
        return Array.from({ length: blockCount }, (_, blockIndex) => buildContractTripRecord(contract, blockIndex));
    }

    function buildContractTripRecord(contract, blockIndex) {
        const origin = parseContractDomicile(contract.domicile);
        const destination = getContractTripDestination(contract, blockIndex);
        const seed = hashString(`${contract.id}:${blockIndex}`);
        const pickupDate = new Date(
            contract.startDate.getFullYear(),
            contract.startDate.getMonth(),
            contract.startDate.getDate(),
            8 + ((blockIndex % 3) * 2),
            blockIndex % 2 === 0 ? 0 : 30
        );
        const pickupDeparture = addMinutes(pickupDate, 30);
        const miles = 420 + (seed % 780);
        const travelMinutes = Math.max(180, Math.round((miles / 52) * 60));
        const deliveryDate = addMinutes(pickupDeparture, travelMinutes);
        const deliveryDeparture = addMinutes(deliveryDate, 30);
        const priceValue = contract.blockRate;
        const pricePerMileValue = priceValue / miles;
        const loadKey = `contract:${contract.id}:${blockIndex + 1}`;

        return {
            loadKey,
            loadId: `C-${String(seed).slice(0, 9)}`,
            status: "upcoming",
            bookedAt: new Date().toISOString(),
            source: "contracts",
            tripSource: "contracts",
            program: "Contracts",
            contractProgram: "Contracts",
            contractId: contract.id,
            contractDomicile: contract.domicile,
            deadhead: "0 mi",
            originCode: origin.code,
            destinationCode: destination.code,
            originCity: origin.city,
            destinationCity: destination.city,
            pickupDateTimeIso: pickupDate.toISOString(),
            pickupDepartureDateTimeIso: pickupDeparture.toISOString(),
            deliveryDateTimeIso: deliveryDate.toISOString(),
            deliveryDepartureDateTimeIso: deliveryDeparture.toISOString(),
            pickupWindow: formatContractTripDateTime(pickupDate),
            deliveryWindow: formatContractTripDateTime(deliveryDate),
            miles,
            duration: formatDuration(travelMinutes + 60),
            equipment: contract.equipmentLabel,
            loadType: "Live",
            driverType: contract.driverTypeLabel.includes("Team") ? "Team" : "Solo",
            workType: "Contract",
            programType: "Contracts",
            isRoundTrip: false,
            stops: 2,
            routeStops: [
                buildContractRouteStop(1, origin, "pickup", pickupDate, pickupDeparture),
                buildContractRouteStop(2, destination, "delivery", deliveryDate, deliveryDeparture)
            ],
            routeSegments: [{
                index: 1,
                fromNumber: 1,
                toNumber: 2,
                fromCode: origin.code,
                toCode: destination.code,
                miles,
                durationMinutes: travelMinutes
            }],
            price: formatCurrency(priceValue),
            pricePerMile: `$${pricePerMileValue.toFixed(2)}/mi`,
            priceValue,
            pricePerMileValue
        };
    }

    function parseContractDomicile(domicile) {
        const match = String(domicile || "").match(/^([A-Z0-9-]+)\s+(.+)$/);
        return {
            code: match ? match[1] : "CON",
            city: match ? match[2] : String(domicile || "Contract Domicile")
        };
    }

    function getContractTripDestination(contract, blockIndex) {
        const seed = hashString(`${contract.id}:destination:${blockIndex}`);
        return CONTRACT_TRIP_DESTINATIONS[seed % CONTRACT_TRIP_DESTINATIONS.length];
    }

    function buildContractRouteStop(number, location, role, arrival, departure) {
        return {
            number,
            code: location.code,
            city: location.city,
            market: location.city,
            role,
            address: null,
            arrivalIso: arrival.toISOString(),
            departureIso: departure.toISOString()
        };
    }

    function addMinutes(date, minutes) {
        return new Date(date.getTime() + (minutes * 60000));
    }

    function formatContractTripDateTime(date) {
        return `${formatDateCompact(date)} ${date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        })}`;
    }

    function formatDuration(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
        }

        return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }

    function hashString(text) {
        let hash = 0;
        for (let index = 0; index < String(text).length; index += 1) {
            hash = ((hash << 5) - hash) + String(text).charCodeAt(index);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function buildContracts() {
        const rawContracts = [
            { id: "contract-grr-grand-rapids-mi-2026-04-26", domicile: "GRR Grand Rapids, MI", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 4877 },
            { id: "contract-elp-el-paso-tx-2026-04-26", domicile: "ELP El Paso, TX", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 5036 },
            { id: "contract-ind-indianapolis-in-2026-04-26", domicile: "IND Indianapolis, IN", start: "2026-04-26", end: "2026-05-23", weeks: 4, drivers: 2, blockRate: 3376 },
            { id: "contract-dfw-dallas-ft-worth-tx-2026-04-26-long", domicile: "DFW Dallas/Ft Worth, TX", start: "2026-04-26", end: "2026-05-23", weeks: 4, drivers: 2, blockRate: 2831 },
            { id: "contract-cle-twinsburg-ohio-2026-04-26-long", domicile: "CLE Twinsburg, Ohio", start: "2026-04-26", end: "2026-05-23", weeks: 4, drivers: 2, blockRate: 3312 },
            { id: "contract-ont-ontario-ca-2026-04-26-long", domicile: "ONT Ontario, CA", start: "2026-04-26", end: "2026-05-23", weeks: 4, drivers: 2, blockRate: 2884 },
            { id: "contract-hou-houston-texas-2026-04-26-long", domicile: "HOU Houston, Texas", start: "2026-04-26", end: "2026-05-23", weeks: 4, drivers: 2, blockRate: 2863 },
            { id: "contract-msp-minneapolis-mn-2026-04-26", domicile: "MSP Minneapolis, MN", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 4333 },
            { id: "contract-lit-little-rock-ar-2026-04-26", domicile: "LIT Little Rock, AR", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 5090 },
            { id: "contract-bfi-seattle-wa-2026-04-26", domicile: "BFI Seattle, WA", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 4199 },
            { id: "contract-mkc-kansas-city-ks-2026-04-26", domicile: "MKC Kansas City, KS", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 4102 },
            { id: "contract-boi-boise-id-2026-04-26", domicile: "BOI Boise, ID", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 4697 },
            { id: "contract-lex-lexington-ky-2026-04-26", domicile: "LEX Lexington, KY", start: "2026-04-26", end: "2026-05-23", weeks: 4, drivers: 2, blockRate: 3509 },
            { id: "contract-cle-twinsburg-ohio-2026-04-26", domicile: "CLE Twinsburg, Ohio", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 4718 },
            { id: "contract-ont-ontario-ca-2026-04-26", domicile: "ONT Ontario, CA", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 4111 },
            { id: "contract-phl-s-dover-de-2026-04-26", domicile: "PHL-S Dover, DE", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 4265 },
            { id: "contract-ind-indianapolis-in-2026-04-26-short", domicile: "IND Indianapolis, IN", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 4245 },
            { id: "contract-tpa-tampa-fl-2026-04-26", domicile: "TPA Tampa, FL", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 3170 },
            { id: "contract-bhm-birmingham-al-2026-04-26", domicile: "BHM Birmingham, AL", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 5293 },
            { id: "contract-fat-fresno-ca-2026-04-26", domicile: "FAT Fresno, CA", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 4887 },
            { id: "contract-mke-milwaukee-wi-2026-04-26", domicile: "MKE Milwaukee, WI", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 4432 },
            { id: "contract-cvg-cincinnati-oh-2026-04-26", domicile: "CVG Cincinnati, OH", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 4957 },
            { id: "contract-slc-salt-lake-city-ut-2026-05-03", domicile: "SLC Salt Lake City, UT", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2500 },
            { id: "contract-cle-twinsburg-ohio-2026-05-03", domicile: "CLE Twinsburg, Ohio", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 2, blockRate: 2795 },
            { id: "contract-ont-ontario-ca-2026-05-03", domicile: "ONT Ontario, CA", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2500 },
            { id: "contract-phx-phoenix-az-2026-05-03", domicile: "PHX Phoenix, AZ", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2500 },
            { id: "contract-bna-nashville-tn-2026-05-03", domicile: "BNA Nashville, TN", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 2, blockRate: 2475 },
            { id: "contract-sav-macon-ga-2026-05-03", domicile: "SAV Macon, GA", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2771 },
            { id: "contract-phl-n-carlisle-harrisburg-pa-2026-05-03", domicile: "PHL-N Carlisle/Harrisburg, PA", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2500 },
            { id: "contract-abe-allentown-pa-2026-05-03", domicile: "ABE Allentown, PA", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2500 },
            { id: "contract-lit-little-rock-ar-2026-05-03", domicile: "LIT Little Rock, AR", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2806 },
            { id: "contract-den-denver-colorado-2026-05-03", domicile: "DEN Denver, Colorado", start: "2026-05-03", end: "2026-05-30", weeks: 4, drivers: 2, blockRate: 2519 },
            { id: "contract-smf-sacramento-ca-2026-05-03", domicile: "SMF Sacramento, CA", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2701 },
            { id: "contract-phl-s-dover-de-2026-05-03", domicile: "PHL-S Dover, DE", start: "2026-05-03", end: "2026-05-30", weeks: 4, drivers: 2, blockRate: 2475 },
            { id: "contract-cle-twinsburg-ohio-2026-05-03-long", domicile: "CLE Twinsburg, Ohio", start: "2026-05-03", end: "2026-05-30", weeks: 4, drivers: 2, blockRate: 2868 },
            { id: "contract-rno-reno-nv-2026-04-26", domicile: "RNO Reno, NV", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 2800, equipment: "26' Box Truck", equipmentValue: "26-box-truck" },
            { id: "contract-atl-atlanta-ga-2026-04-26", domicile: "ATL Atlanta, GA", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 2, blockRate: 3050, equipment: "26' Box Truck", equipmentValue: "26-box-truck" },
            { id: "contract-mem-memphis-tn-2026-05-03", domicile: "MEM Memphis, TN", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 2, blockRate: 3300, driverType: "37h Team", driverTypeValue: "37h-team" },
            { id: "contract-clt-charlotte-nc-2026-05-03", domicile: "CLT Charlotte, NC", start: "2026-05-03", end: "2026-05-09", weeks: 1, drivers: 1, blockRate: 2900, equipment: "26' Box Truck", equipmentValue: "26-box-truck", driverType: "37h Team", driverTypeValue: "37h-team" },
            { id: "contract-abq-albuquerque-nm-2026-04-26", domicile: "ABQ Albuquerque, NM", start: "2026-04-26", end: "2026-05-02", weeks: 1, drivers: 1, blockRate: 3150, driverType: "37h Team", driverTypeValue: "37h-team" }
        ];

        return rawContracts.map((contract, index) => createContract(contract, index));
    }

    function createContract(contract, index) {
        const startDate = parseDate(contract.start);
        const endDate = parseDate(contract.end);
        const drivers = contract.drivers || 1;
        const blocksPerDriver = contract.blocksPerDriver || 1;
        const weeks = contract.weeks || 1;
        const blockRate = contract.blockRate || 2500;
        const totalPayout = blockRate * drivers * blocksPerDriver * weeks;
        const driverTypeLabel = contract.driverType || "109h Solo";
        const driverTypeValue = contract.driverTypeValue || "109h-solo";
        const equipmentLabel = contract.equipment || "53' Trailer";
        const equipmentValue = contract.equipmentValue || "53-trailer";
        const contractTypeLabel = contract.contractType || "Full-week";
        const contractTypeValue = contract.contractTypeValue || "full-week";
        const dayOfWeekLabel = contract.dayOfWeek || "Mon-Sun";
        const dayOfWeekValue = contract.dayOfWeekValue || "mon-sun";
        const shiftTimeLabel = contract.shiftTime || "Day";
        const shiftTimeValue = contract.shiftTimeValue || "day";
        const tractors = contract.tractors || drivers;

        return {
            id: contract.id,
            orderIndex: index,
            domicile: contract.domicile,
            domicileValue: slugify(contract.domicile),
            startDate,
            endDate,
            weeks,
            weekLabel: weeks === 1 ? "1 Week" : `${weeks} Weeks`,
            shortSchedule: `${formatDateCompact(startDate)} - ${formatDateCompact(endDate)}`,
            longSchedule: `${formatDateLong(startDate)} - ${formatDateLong(endDate)}`,
            drivers,
            driverLabel: drivers === 1 ? "1 Driver" : `${drivers} Drivers`,
            driverTypeLabel,
            driverTypeValue,
            blocksPerDriver,
            blockLabel: blocksPerDriver === 1 ? "1 Block" : `${blocksPerDriver} Blocks`,
            tractors,
            tractorLabel: tractors === 1 ? "1 Tractor" : `${tractors} Tractors`,
            equipmentLabel,
            equipmentValue,
            equipmentBadge: equipmentLabel === "53' Trailer" ? "P" : "",
            contractType: contractTypeLabel,
            contractTypeValue,
            dayOfWeekLabel,
            dayOfWeekValue,
            shiftTimeLabel,
            shiftTimeValue,
            blockRate,
            totalPayout,
            favorite: false,
            status: contract.status || "available"
        };
    }

    function populateSelect(select, options) {
        if (!select) {
            return;
        }

        select.innerHTML = options.map((option) => (
            `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
        )).join("");
    }

    function uniqueByValue(items) {
        const seen = new Set();
        return items.filter((item) => {
            if (seen.has(item.value)) {
                return false;
            }
            seen.add(item.value);
            return true;
        });
    }

    function parseDate(value) {
        const [year, month, day] = String(value).split("-").map(Number);
        return new Date(year, (month || 1) - 1, day || 1);
    }

    function formatDateCompact(date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    }

    function formatDateLong(date) {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
    }

    function formatCurrency(value) {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        });
    }

    function slugify(value) {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
});
