function closeNotification(notificationId) {
    const notificationBox = document.getElementById(notificationId);
    if (notificationBox) {
        notificationBox.classList.add("is-hidden");
    }
}

window.closeNotification = closeNotification;

document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        typeFilter: document.getElementById("auction-type-filter"),
        equipmentFilter: document.getElementById("auction-equipment-filter"),
        originFilter: document.getElementById("auction-origin-filter"),
        originRadiusFilter: document.getElementById("auction-origin-radius-filter"),
        destinationFilter: document.getElementById("auction-destination-filter"),
        destinationRadiusFilter: document.getElementById("auction-destination-radius-filter"),
        bidStatusFilter: document.getElementById("auction-bid-status-filter"),
        accessFilter: document.getElementById("auction-access-filter"),
        termFilter: document.getElementById("auction-term-filter"),
        volumeFilter: document.getElementById("auction-volume-filter"),
        showBidsToggle: document.getElementById("auction-show-bids"),
        sortFilter: document.getElementById("auction-sort-filter"),
        resultsCount: document.getElementById("auction-results-count"),
        resultsList: document.getElementById("auction-results-list"),
        emptyState: document.getElementById("auction-empty-state"),
        moreToggle: document.getElementById("auction-more-toggle"),
        moreFilters: document.getElementById("auction-more-filters"),
        clearFilters: document.getElementById("auction-clear-filters"),
        refreshNow: document.getElementById("auction-refresh-now"),
        refreshToggle: document.getElementById("auction-refresh-toggle"),
        refreshLabel: document.getElementById("auction-refresh-label"),
        refreshSettings: document.getElementById("auction-refresh-settings"),
        bulkBid: document.getElementById("auction-bulk-bid"),
        flashMessage: document.getElementById("auction-flash-message"),
        bidModal: document.getElementById("auction-bid-modal"),
    };

    const siteCatalog = [
        { code: "ORF2", summaryCity: "CHESAPEAKE, VA", displayCity: "Chesapeake, VA", detailCity: "CHESAPEAKE, VA", address: "5045 PORTSMOUTH BLVD" },
        { code: "BDL3", summaryCity: "North Haven, CT", displayCity: "North Haven, CT", detailCity: "North Haven, CT", address: "409 Washington Ave" },
        { code: "DGI1", summaryCity: "New Castle, DE", displayCity: "New Castle, DE", detailCity: "New Castle, DE", address: "780 Centerpoint Blvd" },
        { code: "MKY1_OSY2", summaryCity: "Louisville, KY", displayCity: "Louisville, KY", detailCity: "Louisville, KY", address: "1234 Commerce Way" },
        { code: "EIK2", summaryCity: "AURORA, Colorado", displayCity: "Aurora, CO", detailCity: "AURORA, Colorado", address: "19701 E 22nd Ave" },
        { code: "SUT1", summaryCity: "Salt Lake City, UT", displayCity: "Salt Lake City, UT", detailCity: "Salt Lake City, UT", address: "777 Industrial Rd" },
        { code: "MC05", summaryCity: "DAVENPORT, FL", displayCity: "Davenport, FL", detailCity: "DAVENPORT, FL", address: "305 Deen Still Rd" },
        { code: "MCI9", summaryCity: "LIBERTY, MO", displayCity: "Liberty, MO", detailCity: "LIBERTY, MO", address: "3401 N Corrington Ave" },
        { code: "HOU5", summaryCity: "Katy, TX", displayCity: "Katy, TX", detailCity: "Katy, TX", address: "22525 Clay Rd" },
        { code: "SBD3", summaryCity: "San Bernardino, CA", displayCity: "San Bernardino, CA", detailCity: "San Bernardino, CA", address: "1895 S Tippecanoe Ave" },
        { code: "AMA1", summaryCity: "Amarillo, TX", displayCity: "Amarillo, TX", detailCity: "Amarillo, TX", address: "8400 E Interstate 40" },
        { code: "MGE5", summaryCity: "JEFFERSON, GA", displayCity: "Jefferson, GA", detailCity: "JEFFERSON, GA", address: "3560 New Cut Rd" },
        { code: "OAK5", summaryCity: "Newark, CA", displayCity: "Newark, CA", detailCity: "Newark, CA", address: "5990 Stevenson Blvd" },
        { code: "HLA9", summaryCity: "Perris, California", displayCity: "Perris, CA", detailCity: "Perris, California", address: "301 Webster Ave" },
        { code: "HBF9", summaryCity: "Sumner, WA", displayCity: "Sumner, WA", detailCity: "Sumner, WA", address: "1401 Fryar Ave" },
        { code: "LBE1", summaryCity: "NEW STANTON, PA", displayCity: "New Stanton, PA", detailCity: "NEW STANTON, PA", address: "537 Wecare Dr" },
        { code: "RDU2", summaryCity: "SMITHFIELD, NC", displayCity: "Smithfield, NC", detailCity: "SMITHFIELD, NC", address: "3333 US Hwy 70 Business W" },
        { code: "CDW5", summaryCity: "Carteret, NJ", displayCity: "Carteret, NJ", detailCity: "Carteret, NJ", address: "800 Middlesex Ave" },
        { code: "CVG9", summaryCity: "Hebron, KY", displayCity: "Hebron, KY", detailCity: "Hebron, KY", address: "2285 Litton Ln" },
        { code: "MCI5", summaryCity: "LENEXA, KS", displayCity: "Lenexa, KS", detailCity: "LENEXA, KS", address: "17201 W 112th St" },
        { code: "WBW2", summaryCity: "Olyphant, PA", displayCity: "Olyphant, PA", detailCity: "Olyphant, PA", address: "32 Valley View Dr" },
        { code: "MDW5", summaryCity: "CREST HILL, IL", displayCity: "Crest Hill, IL", detailCity: "CREST HILL, IL", address: "1420 North Broadway St" },
        { code: "ONT1", summaryCity: "Jurupa Valley, CA", displayCity: "Jurupa Valley, CA", detailCity: "Jurupa Valley, CA", address: "11263 Oleander Ave" },
        { code: "LAS6", summaryCity: "LAS VEGAS, NV", displayCity: "Las Vegas, NV", detailCity: "LAS VEGAS, NV", address: "4550 Nexus Way" },
        { code: "GYR2", summaryCity: "Goodyear, AZ", displayCity: "Goodyear, AZ", detailCity: "Goodyear, AZ", address: "500 S 99th Ave" },
        { code: "AUS2", summaryCity: "Pflugerville, TX", displayCity: "Pflugerville, TX", detailCity: "Pflugerville, TX", address: "2300 Impact Way" },
        { code: "MDW", summaryCity: "Chicago, IL", displayCity: "Chicago, IL", detailCity: "Chicago, IL", address: "7550 S Cicero Ave" },
        { code: "BTR", summaryCity: "Baton Rouge, LA", displayCity: "Baton Rouge, LA", detailCity: "Baton Rouge, LA", address: "8194 Tom Dr" },
        { code: "FTW1", summaryCity: "DALLAS, TX", displayCity: "Dallas, TX", detailCity: "DALLAS, TX", address: "700 Westport Pkwy" },
        { code: "SLC1", summaryCity: "SALT LAKE CITY, UT", displayCity: "Salt Lake City, UT", detailCity: "SALT LAKE CITY, UT", address: "777 South 5600 West" },
        { code: "DFW", summaryCity: "Dallas/Ft Worth, TX", displayCity: "Dallas/Ft Worth, TX", detailCity: "Dallas/Ft Worth, TX", address: "2400 Alliance Gateway Fwy" },
        { code: "BFI4", summaryCity: "Kent, WA", displayCity: "Kent, WA", detailCity: "Kent, WA", address: "20526 59th Pl S" },
        { code: "ATL9", summaryCity: "East Point, GA", displayCity: "East Point, GA", detailCity: "East Point, GA", address: "4200 North Commerce Dr" },
        { code: "MEM1", summaryCity: "Memphis, TN", displayCity: "Memphis, TN", detailCity: "Memphis, TN", address: "3292 E Holmes Rd" },
        { code: "PHX7", summaryCity: "Phoenix, AZ", displayCity: "Phoenix, AZ", detailCity: "Phoenix, AZ", address: "6835 W Buckeye Rd" },
        { code: "CLT5", summaryCity: "Charlotte, NC", displayCity: "Charlotte, NC", detailCity: "Charlotte, NC", address: "11201 Nations Ford Rd" },
        { code: "RNO4", summaryCity: "Reno, NV", displayCity: "Reno, NV", detailCity: "Reno, NV", address: "8000 N Virginia St" },
        { code: "DEN4", summaryCity: "Denver, CO", displayCity: "Denver, CO", detailCity: "Denver, CO", address: "2225 E 58th Ave" },
        { code: "SAV1", summaryCity: "Savannah, GA", displayCity: "Savannah, GA", detailCity: "Savannah, GA", address: "1 Zephyr Rd" },
        { code: "BNA3", summaryCity: "Nashville, TN", displayCity: "Nashville, TN", detailCity: "Nashville, TN", address: "1000 Logistics Way" },
        { code: "IND3", summaryCity: "Indianapolis, IN", displayCity: "Indianapolis, IN", detailCity: "Indianapolis, IN", address: "715 Airtech Pkwy" },
        { code: "EWR8", summaryCity: "Teterboro, NJ", displayCity: "Teterboro, NJ", detailCity: "Teterboro, NJ", address: "698 Route 46" },
    ];

    const equipmentCatalog = [
        { key: "53-trailer-p", label: "53' Trailer", badge: "P", serviceLabel: "PRELOADED/DROP", driverIconCount: 1, bidUnit: "per load", type: "trailer-required" },
        { key: "53-trailer-r", label: "53' Trailer", badge: "R", serviceLabel: "DROP/DROP", driverIconCount: 2, bidUnit: "per load", type: "power-only" },
        { key: "53-reefer-r", label: "53' Reefer Truck", badge: "R", serviceLabel: "LIVE/LIVE", driverIconCount: 2, bidUnit: "per mile", type: "reefer" },
    ];

    const siteLookup = new Map(siteCatalog.map((site) => [site.code, site]));
    const equipmentLookup = new Map(equipmentCatalog.map((equipment) => [equipment.key, equipment]));

    const state = {
        auctions: [],
        lastUpdatedSeconds: 19,
        refreshReminderOn: false,
        flashTimeoutId: null,
    };

    const baseAuctions = [
        createAuction({
            id: "auction-orf2-bdl3",
            contractId: "fececeb5-6a22-8f36-61fd-3f0d4d3abb09",
            origin: buildStop("ORF2", "1"),
            destination: buildStop("BDL3", "2"),
            distanceLabel: "467 miles",
            distanceSortMiles: 467,
            durationLabel: "12h 3m",
            durationSortMinutes: 723,
            weeklyLoadCount: 6,
            closeSortMinutes: 1715,
        }),
        createAuction({
            id: "auction-dgi1-mky1",
            contractId: "fceceb5-6d74-ca88-37a2-59208b33cb64",
            origin: buildStop("DGI1", "1"),
            destination: buildStop("MKY1_OSY2", "2"),
            distanceLabel: "681 miles",
            distanceSortMiles: 681,
            durationLabel: "14h 42m",
            durationSortMinutes: 882,
            weeklyLoadCount: 3,
            closeSortMinutes: 1718,
            hasBid: true,
        }),
        createAuction({
            id: "auction-eik2-sut1",
            origin: buildStop("EIK2", "1"),
            destination: buildStop("SUT1", "2"),
            distanceLabel: "550 miles",
            distanceSortMiles: 550,
            durationLabel: "10h 43m",
            durationSortMinutes: 643,
            weeklyLoadCount: 3,
            closeSortMinutes: 1720,
        }),
        createAuction({
            id: "auction-mc05-mci9",
            origin: buildStop("MC05", "1"),
            destination: buildStop("MCI9", "2"),
            distanceLabel: "1,252 miles",
            distanceSortMiles: 1252,
            durationLabel: "1d 1h 23m",
            durationSortMinutes: 1523,
            weeklyLoadCount: 8,
            closeSortMinutes: 1722,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-mc05-hou5",
            origin: buildStop("MC05", "1"),
            destination: buildStop("HOU5", "2"),
            distanceLabel: "997 miles",
            distanceSortMiles: 997,
            durationLabel: "20h 15m",
            durationSortMinutes: 1215,
            weeklyLoadCount: 11,
            closeSortMinutes: 1724,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-sbd3-ama1",
            origin: buildStop("SBD3", "1"),
            destination: buildStop("AMA1", "2"),
            distanceLabel: "1,027 miles",
            distanceSortMiles: 1027,
            durationLabel: "21h 5m",
            durationSortMinutes: 1265,
            weeklyLoadCount: 6,
            closeSortMinutes: 1725,
        }),
        createAuction({
            id: "auction-mge5-oak5-denied",
            origin: buildStop("MGE5", "1"),
            destination: buildStop("OAK5", "2"),
            distanceLabel: "2,505 miles",
            distanceSortMiles: 2505,
            durationLabel: "2d 3h 53m",
            durationSortMinutes: 3113,
            weeklyLoadCount: 15,
            closeSortMinutes: 1727,
            driverIconCount: 2,
            disabledReason: "Your company is denied to place bid on this location.",
        }),
        createAuction({
            id: "auction-hla9-hbf9",
            origin: buildStop("HLA9", "1"),
            destination: buildStop("HBF9", "2"),
            distanceLabel: "1,177 miles",
            distanceSortMiles: 1177,
            durationLabel: "1d 1h 8m",
            durationSortMinutes: 1508,
            weeklyLoadCount: 3,
            closeSortMinutes: 1729,
            driverIconCount: 2,
            hasBid: true,
        }),
        createAuction({
            id: "auction-mge5-oak5-open",
            origin: buildStop("MGE5", "1"),
            destination: buildStop("OAK5", "2"),
            distanceLabel: "2,505 miles",
            distanceSortMiles: 2505,
            durationLabel: "2d 3h 53m",
            durationSortMinutes: 3113,
            weeklyLoadCount: 15,
            closeSortMinutes: 1731,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-lbe1-rdu2",
            origin: buildStop("LBE1", "1"),
            destination: buildStop("RDU2", "2"),
            distanceLabel: "477 miles",
            distanceSortMiles: 477,
            durationLabel: "11h 9m",
            durationSortMinutes: 669,
            weeklyLoadCount: 4,
            closeSortMinutes: 1733,
        }),
        createAuction({
            id: "auction-cdw5-oak5",
            origin: buildStop("CDW5", "1"),
            destination: buildStop("OAK5", "2"),
            distanceLabel: "2,936 miles",
            distanceSortMiles: 2936,
            durationLabel: "2d 13h 17m",
            durationSortMinutes: 3677,
            weeklyLoadCount: 12,
            closeSortMinutes: 1735,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-cvg9-mci5",
            origin: buildStop("CVG9", "1"),
            destination: buildStop("MCI5", "2"),
            distanceLabel: "607 miles",
            distanceSortMiles: 607,
            durationLabel: "12h 11m",
            durationSortMinutes: 731,
            weeklyLoadCount: 12,
            closeSortMinutes: 1737,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-wbw2-rdu2",
            origin: buildStop("WBW2", "1"),
            destination: buildStop("RDU2", "2"),
            distanceLabel: "526 miles",
            distanceSortMiles: 526,
            durationLabel: "12h 6m",
            durationSortMinutes: 726,
            weeklyLoadCount: 8,
            closeSortMinutes: 1739,
        }),
        createAuction({
            id: "auction-mdw5-ont1",
            origin: buildStop("MDW5", "1"),
            destination: buildStop("ONT1", "2"),
            distanceLabel: "1,957 miles",
            distanceSortMiles: 1957,
            durationLabel: "1d 16h 21m",
            durationSortMinutes: 2411,
            weeklyLoadCount: 7,
            closeSortMinutes: 1741,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-las6-oak5",
            origin: buildStop("LAS6", "1"),
            destination: buildStop("OAK5", "2"),
            distanceLabel: "551 miles",
            distanceSortMiles: 551,
            durationLabel: "11h 36m",
            durationSortMinutes: 696,
            weeklyLoadCount: 8,
            closeSortMinutes: 1743,
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-gyr2-aus2",
            origin: buildStop("GYR2", "1"),
            destination: buildStop("AUS2", "2"),
            distanceLabel: "1,050 miles",
            distanceSortMiles: 1050,
            durationLabel: "21h 36m",
            durationSortMinutes: 1296,
            weeklyLoadCount: 7,
            closeSortMinutes: 1745,
            equipmentKey: "53-trailer-r",
            hasBid: true,
        }),
        createAuction({
            id: "auction-mdw-btr",
            origin: buildStop("MDW", "D"),
            destination: buildStop("BTR", "2"),
            distanceLabel: "751-1000 miles",
            distanceSortMiles: 875,
            durationLabel: "15h 32m",
            durationSortMinutes: 932,
            weeklyLoadCount: 5,
            closeSortMinutes: 1750,
            equipmentKey: "53-reefer-r",
            bidUnit: "per mile",
            term: "short-term",
            dateRange: "Apr 26 - Jun 28, 2026",
            scheduleLabel: "Tue, Thu, Sat-Sun",
            arrivalLabel: "Tue, Thu, Sat-Sun",
            departureLabel: "Tue, Thu, Sat-Sun",
            warningLabel: "Max: 1 loads/day",
            disabledReason: "You are unable to participate in this auction based on your available equipment or current tenure",
        }),
        createAuction({
            id: "auction-ftw1-slc1",
            origin: buildStop("FTW1", "1"),
            destination: buildStop("SLC1", "2"),
            distanceLabel: "1,283 miles",
            distanceSortMiles: 1283,
            durationLabel: "1d 1h 52m",
            durationSortMinutes: 1552,
            weeklyLoadCount: 15,
            closeSortMinutes: 1753,
            equipmentKey: "53-trailer-r",
            driverIconCount: 2,
        }),
        createAuction({
            id: "auction-dfw-bfi4",
            origin: buildStop("DFW", "D"),
            destination: buildStop("BFI4", "2"),
            distanceLabel: "2,128 miles",
            distanceSortMiles: 2128,
            durationLabel: "1d 20h 18m",
            durationSortMinutes: 2658,
            weeklyLoadCount: 1,
            closeSortMinutes: 1756,
            equipmentKey: "53-trailer-p",
            warningLabel: "Max: 1 loads/day",
        }),
    ];

    state.auctions = baseAuctions.map((auction, index) => ({
        ...auction,
        orderIndex: index,
    }));

    populateFilterOptions();
    updateRadiusSelectState();
    attachEvents();
    renderResults();
    updateRefreshLabel();

    window.setInterval(() => {
        state.lastUpdatedSeconds += 1;
        updateRefreshLabel();
    }, 1000);

    function attachEvents() {
        [
            elements.typeFilter,
            elements.equipmentFilter,
            elements.originFilter,
            elements.originRadiusFilter,
            elements.destinationFilter,
            elements.destinationRadiusFilter,
            elements.bidStatusFilter,
            elements.accessFilter,
            elements.termFilter,
            elements.volumeFilter,
            elements.showBidsToggle,
            elements.sortFilter,
        ].forEach((input) => {
            if (!input) {
                return;
            }

            input.addEventListener("change", () => {
                updateRadiusSelectState();
                renderResults();
            });
        });

        if (elements.moreToggle && elements.moreFilters) {
            elements.moreToggle.addEventListener("click", () => {
                const isHidden = elements.moreFilters.classList.toggle("is-hidden");
                elements.moreToggle.classList.toggle("is-open", !isHidden);
                elements.moreToggle.setAttribute("aria-expanded", String(!isHidden));
            });
        }

        if (elements.clearFilters) {
            elements.clearFilters.addEventListener("click", () => {
                resetFilters();
                showFlashMessage("Auction filters cleared.");
            });
        }

        if (elements.refreshNow) {
            elements.refreshNow.addEventListener("click", () => {
                state.lastUpdatedSeconds = 0;
                updateRefreshLabel();
                showFlashMessage("Auction results refreshed just now.");
            });
        }

        if (elements.refreshToggle) {
            elements.refreshToggle.addEventListener("click", () => {
                state.refreshReminderOn = !state.refreshReminderOn;
                updateRefreshLabel();
                showFlashMessage(
                    state.refreshReminderOn
                        ? "Refresh reminder turned on."
                        : "Refresh reminder turned off."
                );
            });
        }

        if (elements.refreshSettings) {
            elements.refreshSettings.addEventListener("click", () => {
                showFlashMessage("Refresh reminder settings will be available here.");
            });
        }

        if (elements.bulkBid) {
            elements.bulkBid.addEventListener("click", () => {
                const eligible = getVisibleAuctions()
                    .filter((auction) => !auction.disabledReason && !auction.hasBid)
                    .slice(0, 5);

                if (!eligible.length) {
                    showFlashMessage("No eligible contracts are available for bulk bid right now.");
                    return;
                }

                eligible.forEach((auction) => {
                    auction.hasBid = true;
                });

                renderResults();
                showFlashMessage(`Added ${eligible.length} contracts to your bid list.`);
            });
        }

        document.querySelectorAll("[data-dismiss]").forEach((button) => {
            button.addEventListener("click", () => {
                const targetId = button.getAttribute("data-dismiss");
                if (!targetId) {
                    return;
                }

                const target = document.getElementById(targetId);
                if (target) {
                    target.classList.add("is-hidden");
                }
            });
        });

        document.querySelectorAll("[data-auction-modal-close]").forEach((button) => {
            button.addEventListener("click", closeBidModal);
        });

        if (elements.bidModal) {
            elements.bidModal.addEventListener("click", (event) => {
                if (event.target === elements.bidModal) {
                    closeBidModal();
                }
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && elements.bidModal && !elements.bidModal.classList.contains("is-hidden")) {
                closeBidModal();
            }
        });

        if (elements.resultsList) {
            elements.resultsList.addEventListener("click", async (event) => {
                const bidButton = event.target.closest("[data-bid-contract]");
                if (bidButton) {
                    openBidModal();
                    return;
                }

                const copyButton = event.target.closest("[data-copy-id]");
                if (copyButton) {
                    const copyId = copyButton.getAttribute("data-copy-id");
                    if (copyId) {
                        const copied = await copyText(copyId);
                        showFlashMessage(
                            copied
                                ? `Copied contract ID ${copyId}.`
                                : `Couldn't copy automatically. Contract ID: ${copyId}`
                        );
                    }
                    return;
                }

                const toggleTarget = event.target.closest("[data-auction-toggle]");
                if (toggleTarget) {
                    const targetId = toggleTarget.getAttribute("data-auction-toggle");
                    const auction = state.auctions.find((item) => item.id === targetId);
                    if (auction) {
                        auction.expanded = !auction.expanded;
                        renderResults();
                    }
                }
            });
        }
    }

    function populateFilterOptions() {
        populateSelect(elements.typeFilter, [
            { value: "any", label: "Type" },
            { value: "trailer-required", label: "Trailer required" },
            { value: "power-only", label: "Power only" },
            { value: "reefer", label: "Reefer" },
        ]);

        populateSelect(elements.equipmentFilter, [
            { value: "any", label: "Equipment" },
            ...equipmentCatalog.map((equipment) => ({
                value: equipment.key,
                label: equipment.label,
            })),
        ]);

        const locationOptions = Array.from(
            new Map(
                siteCatalog.map((site) => [
                    slugify(site.displayCity),
                    { value: slugify(site.displayCity), label: site.displayCity },
                ])
            ).values()
        ).sort((left, right) => left.label.localeCompare(right.label));

        populateSelect(elements.originFilter, [
            { value: "any", label: "Anywhere" },
            ...locationOptions,
        ]);
        populateSelect(elements.destinationFilter, [
            { value: "any", label: "Anywhere" },
            ...locationOptions,
        ]);

        const radiusOptions = [
            { value: "any", label: "Radius" },
            { value: "50", label: "50 mi" },
            { value: "100", label: "100 mi" },
            { value: "150", label: "150 mi" },
            { value: "250", label: "250 mi" },
            { value: "500", label: "500 mi" },
        ];
        populateSelect(elements.originRadiusFilter, radiusOptions);
        populateSelect(elements.destinationRadiusFilter, radiusOptions);

        populateSelect(elements.bidStatusFilter, [
            { value: "any", label: "Any bid status" },
            { value: "bid", label: "Bid placed" },
            { value: "not-bid", label: "No bid placed" },
        ]);

        populateSelect(elements.accessFilter, [
            { value: "any", label: "All bid access" },
            { value: "open", label: "Open to your company" },
            { value: "restricted", label: "Restricted contracts" },
        ]);

        populateSelect(elements.termFilter, [
            { value: "any", label: "Any contract term" },
            { value: "six-month", label: "Up to 6 months" },
            { value: "short-term", label: "Short term" },
        ]);

        populateSelect(elements.volumeFilter, [
            { value: "any", label: "Any volume" },
            { value: "8plus", label: "8+ loads/week" },
            { value: "12plus", label: "12+ loads/week" },
        ]);
    }

    function resetFilters() {
        [
            elements.typeFilter,
            elements.equipmentFilter,
            elements.originFilter,
            elements.originRadiusFilter,
            elements.destinationFilter,
            elements.destinationRadiusFilter,
            elements.bidStatusFilter,
            elements.accessFilter,
            elements.termFilter,
            elements.volumeFilter,
            elements.sortFilter,
        ].forEach((select) => {
            if (select) {
                select.selectedIndex = 0;
            }
        });

        if (elements.showBidsToggle) {
            elements.showBidsToggle.checked = false;
        }

        updateRadiusSelectState();
        renderResults();
    }

    function updateRadiusSelectState() {
        const originActive = elements.originFilter && elements.originFilter.value !== "any";
        const destinationActive = elements.destinationFilter && elements.destinationFilter.value !== "any";

        if (elements.originRadiusFilter) {
            elements.originRadiusFilter.disabled = !originActive;
            if (!originActive) {
                elements.originRadiusFilter.value = "any";
            }
        }

        if (elements.destinationRadiusFilter) {
            elements.destinationRadiusFilter.disabled = !destinationActive;
            if (!destinationActive) {
                elements.destinationRadiusFilter.value = "any";
            }
        }
    }

    function getVisibleAuctions() {
        const filters = {
            type: elements.typeFilter ? elements.typeFilter.value : "any",
            equipment: elements.equipmentFilter ? elements.equipmentFilter.value : "any",
            origin: elements.originFilter ? elements.originFilter.value : "any",
            destination: elements.destinationFilter ? elements.destinationFilter.value : "any",
            bidStatus: elements.bidStatusFilter ? elements.bidStatusFilter.value : "any",
            access: elements.accessFilter ? elements.accessFilter.value : "any",
            term: elements.termFilter ? elements.termFilter.value : "any",
            volume: elements.volumeFilter ? elements.volumeFilter.value : "any",
            showBidsOnly: elements.showBidsToggle ? elements.showBidsToggle.checked : false,
            sort: elements.sortFilter ? elements.sortFilter.value : "ending-soon",
        };

        const filtered = state.auctions.filter((auction) => {
            if (filters.type !== "any" && auction.type !== filters.type) {
                return false;
            }

            if (filters.equipment !== "any" && auction.equipmentKey !== filters.equipment) {
                return false;
            }

            if (filters.origin !== "any" && auction.origin.locationValue !== filters.origin) {
                return false;
            }

            if (filters.destination !== "any" && auction.destination.locationValue !== filters.destination) {
                return false;
            }

            if (filters.bidStatus === "bid" && !auction.hasBid) {
                return false;
            }

            if (filters.bidStatus === "not-bid" && auction.hasBid) {
                return false;
            }

            if (filters.showBidsOnly && !auction.hasBid) {
                return false;
            }

            if (filters.access === "open" && auction.disabledReason) {
                return false;
            }

            if (filters.access === "restricted" && !auction.disabledReason) {
                return false;
            }

            if (filters.term !== "any" && auction.term !== filters.term) {
                return false;
            }

            if (filters.volume === "8plus" && auction.weeklyLoadCount < 8) {
                return false;
            }

            if (filters.volume === "12plus" && auction.weeklyLoadCount < 12) {
                return false;
            }

            return true;
        });

        return filtered.sort((left, right) => compareAuctions(left, right, filters.sort));
    }

    function renderResults() {
        const visibleAuctions = getVisibleAuctions();

        if (elements.emptyState) {
            elements.emptyState.classList.toggle("is-hidden", visibleAuctions.length !== 0);
        }

        if (!elements.resultsList) {
            updateRenderedResultsCount(visibleAuctions.length);
            return;
        }

        elements.resultsList.innerHTML = visibleAuctions.map(renderAuctionCard).join("");
        updateRenderedResultsCount(elements.resultsList.querySelectorAll(".auction-card").length);
    }

    function renderAuctionCard(auction) {
        const equipment = equipmentLookup.get(auction.equipmentKey) || equipmentCatalog[0];
        const serviceParts = auction.serviceLabel.split("/");
        const pickupService = serviceParts[0] || auction.serviceLabel;
        const dropService = serviceParts[1] || serviceParts[0] || auction.serviceLabel;
        const expandSymbol = auction.expanded ? "&#9662;" : "&#9656;";
        const warningMarkup = auction.warningLabel
            ? `<p class="auction-volume-warning"><span class="auction-volume-warning-icon">&#9888;</span><span>${escapeHtml(auction.warningLabel)}</span></p>`
            : "";
        const bidFlag = auction.hasBid
            ? `<p class="auction-summary-bid-flag">Bid on contract</p>`
            : "";

        const buttonMarkup = auction.disabledReason
            ? `<div class="auction-bid-slot has-tooltip" tabindex="0" data-tooltip="${escapeAttribute(auction.disabledReason)}">
                    <button class="auction-bid-button" type="button" disabled>Place a bid<small>${escapeHtml(auction.bidUnit)}</small></button>
               </div>`
            : `<div class="auction-bid-slot">
                    <button class="auction-bid-button" type="button" data-bid-contract="${escapeAttribute(auction.id)}">Place a bid<small>${escapeHtml(auction.bidUnit)}</small></button>
               </div>`;

        return `
            <article class="auction-card${auction.expanded ? " is-expanded" : ""}" data-auction-toggle="${escapeAttribute(auction.id)}">
                <div class="auction-summary">
                    <button class="auction-expand-button" type="button" data-auction-toggle="${escapeAttribute(auction.id)}" aria-expanded="${auction.expanded ? "true" : "false"}">${expandSymbol}</button>

                    <div class="auction-route-column">
                        <div class="auction-route-stop">
                            <span class="auction-stop-badge">${escapeHtml(auction.origin.badge)}</span>
                            <div>
                                <p class="auction-route-label">${escapeHtml(auction.origin.code)} ${escapeHtml(auction.origin.summaryCity)}</p>
                            </div>
                        </div>
                        <div class="auction-stop-arrow">&#8595;</div>
                        <div class="auction-route-stop">
                            <span class="auction-stop-badge">${escapeHtml(auction.destination.badge)}</span>
                            <div>
                                <p class="auction-route-label">${escapeHtml(auction.destination.code)} ${escapeHtml(auction.destination.summaryCity)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="auction-distance-column">
                        <p class="auction-distance-value">${escapeHtml(auction.distanceLabel)}</p>
                        <p class="auction-summary-meta">${escapeHtml(auction.durationLabel)}</p>
                    </div>

                    <div class="auction-equipment-column">
                        <div class="auction-equipment-top">
                            <span class="auction-person-icon people-${auction.driverIconCount}" aria-hidden="true"></span>
                            <strong>${escapeHtml(equipment.label)}</strong>
                            <span class="auction-badge">${escapeHtml(equipment.badge)}</span>
                        </div>
                        <p class="auction-equipment-service">${escapeHtml(auction.serviceLabel)}</p>
                    </div>

                    <div class="auction-volume-column">
                        <p class="auction-volume-value">${escapeHtml(formatWeeklyLoadLabel(auction.weeklyLoadCount))}</p>
                        <p class="auction-summary-meta">${escapeHtml(auction.scheduleLabel)}</p>
                        <p class="auction-summary-meta">${escapeHtml(auction.dateRange)}</p>
                        ${warningMarkup}
                    </div>

                    <div class="auction-bid-column">
                        ${buttonMarkup}
                        <p class="auction-close-label">${escapeHtml(`Closes: ${formatRemainingTime(auction.closeSortMinutes)}`)}</p>
                        ${bidFlag}
                    </div>
                </div>

                <div class="auction-details">
                    <div class="auction-details-head">
                        <span>Stop</span>
                        <span>Equipment</span>
                        <span>Arrival</span>
                        <span>Departure</span>
                    </div>

                    <div class="auction-details-row">
                        <div class="auction-stop-cell">
                            <div class="auction-stop-track">
                                <span class="auction-stop-node" aria-hidden="true"></span>
                                <span class="auction-stop-line" aria-hidden="true"></span>
                            </div>
                            <div class="auction-stop-info">
                                <p class="auction-stop-code">${escapeHtml(auction.origin.code)}</p>
                                <p>${escapeHtml(auction.origin.address)}</p>
                                <p>${escapeHtml(auction.origin.detailCity)}</p>
                            </div>
                        </div>

                        <div>
                            <div class="auction-detail-equipment-top">
                                <strong>${escapeHtml(equipment.label)}</strong>
                                <span class="auction-badge">${escapeHtml(equipment.badge)}</span>
                            </div>
                            <p class="auction-equipment-service">${escapeHtml(pickupService)}</p>
                        </div>

                        <div class="auction-detail-time">
                            <p>${escapeHtml(auction.arrivalLabel)}</p>
                        </div>

                        <div class="auction-detail-time">
                            <p>${escapeHtml(auction.departureLabel)}</p>
                        </div>
                    </div>

                    <div class="auction-details-row">
                        <div class="auction-stop-cell">
                            <div class="auction-stop-track">
                                <span class="auction-stop-node" aria-hidden="true"></span>
                            </div>
                            <div class="auction-stop-info">
                                <p class="auction-stop-code">${escapeHtml(auction.destination.code)}</p>
                                <p>${escapeHtml(auction.destination.address)}</p>
                                <p>${escapeHtml(auction.destination.detailCity)}</p>
                            </div>
                        </div>

                        <div>
                            <div class="auction-detail-equipment-top">
                                <strong>${escapeHtml(equipment.label)}</strong>
                                <span class="auction-badge">${escapeHtml(equipment.badge)}</span>
                            </div>
                            <p class="auction-equipment-service">${escapeHtml(dropService)}</p>
                        </div>

                        <div class="auction-detail-time">
                            <p>${escapeHtml(auction.arrivalLabel)}</p>
                        </div>

                        <div class="auction-detail-time">
                            <p>${escapeHtml(auction.departureLabel)}</p>
                        </div>
                    </div>

                    <div class="auction-details-footer">
                        <span>ID ${escapeHtml(auction.contractId)}</span>
                        <button class="auction-copy-button" type="button" data-copy-id="${escapeAttribute(auction.contractId)}" aria-label="Copy contract ID">
                            <span class="auction-copy-icon" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
            </article>
        `;
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

    function updateRenderedResultsCount(count) {
        if (!elements.resultsCount) {
            return;
        }

        const label = count === 1 ? "result" : "results";
        elements.resultsCount.textContent = `${count.toLocaleString()} ${label}`;
    }

    function openBidModal() {
        if (!elements.bidModal) {
            return;
        }

        elements.bidModal.classList.remove("is-hidden");
        document.body.classList.add("auction-modal-open");
    }

    function closeBidModal() {
        if (!elements.bidModal) {
            return;
        }

        elements.bidModal.classList.add("is-hidden");
        document.body.classList.remove("auction-modal-open");
    }

    function updateRefreshLabel() {
        if (elements.refreshLabel) {
            const prefix = state.refreshReminderOn ? "Refresh reminder on" : "Turn on refresh reminder";
            elements.refreshLabel.textContent = `${prefix}: last updated ${state.lastUpdatedSeconds}s`;
        }

        if (elements.refreshToggle) {
            elements.refreshToggle.innerHTML = state.refreshReminderOn ? "&#10074;&#10074;" : "&#9654;";
            elements.refreshToggle.setAttribute(
                "aria-label",
                state.refreshReminderOn ? "Pause refresh reminder" : "Turn on refresh reminder"
            );
        }
    }

    function buildStop(code, badge) {
        const site = siteLookup.get(code);
        if (!site) {
            return {
                code,
                badge,
                summaryCity: "Unknown location",
                detailCity: "Unknown location",
                address: "Address unavailable",
                locationValue: "unknown",
            };
        }

        return {
            code: site.code,
            badge,
            summaryCity: site.summaryCity,
            detailCity: site.detailCity,
            address: site.address,
            locationValue: slugify(site.displayCity),
        };
    }

    function createAuction(config) {
        const equipment = equipmentLookup.get(config.equipmentKey || "53-trailer-p") || equipmentCatalog[0];

        return {
            type: config.type || equipment.type,
            equipmentKey: config.equipmentKey || equipment.key,
            equipmentLabel: equipment.label,
            equipmentBadge: equipment.badge,
            serviceLabel: config.serviceLabel || equipment.serviceLabel,
            driverIconCount: config.driverIconCount || equipment.driverIconCount,
            bidUnit: config.bidUnit || equipment.bidUnit,
            term: config.term || "six-month",
            dateRange: config.dateRange || "Apr 26 - Jul 12, 2026",
            scheduleLabel: config.scheduleLabel || "Mon-Sun",
            arrivalLabel: config.arrivalLabel || config.scheduleLabel || "Mon-Sun",
            departureLabel: config.departureLabel || config.scheduleLabel || "Mon-Sun",
            weeklyLoadCount: config.weeklyLoadCount || 6,
            warningLabel: config.warningLabel || "",
            hasBid: Boolean(config.hasBid),
            disabledReason: config.disabledReason || "",
            expanded: Boolean(config.expanded),
            closeSortMinutes: config.closeSortMinutes || 1715,
            id: config.id,
            contractId: config.contractId || createContractId(hashString(config.id)),
            origin: config.origin,
            destination: config.destination,
            distanceLabel: config.distanceLabel,
            distanceSortMiles: config.distanceSortMiles || 0,
            durationLabel: config.durationLabel || "",
            durationSortMinutes: config.durationSortMinutes || 0,
        };
    }

    function compareAuctions(left, right, sortKey) {
        switch (sortKey) {
            case "highest-volume":
                return (
                    right.weeklyLoadCount - left.weeklyLoadCount ||
                    left.closeSortMinutes - right.closeSortMinutes ||
                    left.orderIndex - right.orderIndex
                );
            case "longest-lane":
                return (
                    right.distanceSortMiles - left.distanceSortMiles ||
                    left.closeSortMinutes - right.closeSortMinutes ||
                    left.orderIndex - right.orderIndex
                );
            case "shortest-lane":
                return (
                    left.distanceSortMiles - right.distanceSortMiles ||
                    left.closeSortMinutes - right.closeSortMinutes ||
                    left.orderIndex - right.orderIndex
                );
            case "ending-soon":
            default:
                return (
                    left.closeSortMinutes - right.closeSortMinutes ||
                    right.weeklyLoadCount - left.weeklyLoadCount ||
                    left.orderIndex - right.orderIndex
                );
        }
    }

    function populateSelect(select, options) {
        if (!select) {
            return;
        }

        select.innerHTML = options
            .map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`)
            .join("");
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            // Fall through to the legacy copy approach below.
        }

        try {
            const input = document.createElement("textarea");
            input.value = text;
            input.setAttribute("readonly", "readonly");
            input.style.position = "absolute";
            input.style.left = "-9999px";
            document.body.appendChild(input);
            input.select();
            const copied = document.execCommand("copy");
            document.body.removeChild(input);
            return copied;
        } catch (error) {
            return false;
        }
    }

    function formatWeeklyLoadLabel(count) {
        return count === 1 ? "1 load/week" : `${count} loads/week`;
    }

    function formatDuration(totalMinutes) {
        if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
            return "";
        }

        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }

        return `${hours}h ${minutes}m`;
    }

    function formatRemainingTime(totalMinutes) {
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;
        return `${days}d ${hours}h ${minutes}m`;
    }

    function createContractId(index) {
        const part1 = (((0xfececeb5 + index * 977) >>> 0).toString(16)).padStart(8, "0");
        const part2 = (((0x6a22 + index * 17) & 0xffff).toString(16)).padStart(4, "0");
        const part3 = (((0x8f36 + index * 31) & 0xffff).toString(16)).padStart(4, "0");
        const part4 = (((0x61fd + index * 43) & 0xffff).toString(16)).padStart(4, "0");
        const part5 = (0x3f0d4d3abb09n + BigInt(index) * 4099n).toString(16).slice(-12).padStart(12, "0");
        return `${part1}-${part2}-${part3}-${part4}-${part5}`;
    }

    function hashString(value) {
        let hash = 0;

        for (let index = 0; index < value.length; index += 1) {
            hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
        }

        return hash % 50000;
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

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
});
