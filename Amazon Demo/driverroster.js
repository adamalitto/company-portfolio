document.addEventListener("DOMContentLoaded", () => {
    const DRIVER_ROSTER_SESSION_KEY = "amazonDemoDriverRosterState";
    const rosterBody = document.getElementById("driver-roster-body");
    const searchInput = document.getElementById("driver-roster-search");
    const addDriverButton = document.getElementById("driver-roster-add-button");
    const addDriverOverlay = document.getElementById("driver-roster-add-overlay");
    const addDriverCloseButton = document.getElementById("driver-roster-add-close");
    const addDriverCancelButton = document.getElementById("driver-roster-add-cancel");
    const addDriverSendButton = document.getElementById("driver-roster-send-invite");
    const addDriverDomicilePicker = document.getElementById("driver-roster-domicile-picker");
    const addDriverDomicileTrigger = document.getElementById("driver-roster-domicile-trigger");
    const addDriverDomicileMenu = document.getElementById("driver-roster-domicile-menu");
    const addDriverDomicileLabel = document.getElementById("driver-roster-domicile-label");
    const addDriverDomicileOptions = Array.from(document.querySelectorAll("[data-domicile-option]"));
    const addDriverEmailInput = document.getElementById("driver-roster-email-input");
    const addDriverEmailCount = document.getElementById("driver-roster-email-count");
    const inviteBanner = document.getElementById("driver-roster-invite-banner");
    const inviteBannerMessage = document.getElementById("driver-roster-invite-message");
    const inviteBannerClose = document.getElementById("driver-roster-invite-close");

    if (!rosterBody) {
        return;
    }

    const INITIAL_DRIVERS = [
        {
            id: "utkir-safarov",
            name: "Utkir Safarov",
            email: "utkir.safarov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (929) 555-0146",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "temur-jurakulov",
            name: "Temur Jurakulov",
            email: "temur.jurakulov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (267) 555-0182",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "shavkat-nurmatov",
            name: "Shavkat Nurmatov",
            email: "shavkat.nurmatov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (267) 555-0137",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "balbek-kadirov",
            name: "Balbek Kadirov",
            email: "balbek.kadirov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (929) 555-0169",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "sadullo-rakhimov",
            name: "Sadullo Rakhimov",
            email: "sadullo.rakhimov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (610) 555-0124",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "javokhir-usmanov",
            name: "Javokhir Usmanov",
            email: "javokhir.usmanov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (445) 555-0191",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "navruzbek-tursunov",
            name: "Navruzbek Tursunov",
            email: "navruzbek.tursunov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (443) 555-0178",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "dilshod-karimov",
            name: "Dilshod Karimov",
            email: "dilshod.karimov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (717) 555-0115",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "rustam-mavlonov",
            name: "Rustam Mavlonov",
            email: "rustam.mavlonov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (410) 555-0158",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "azizbek-ruziev",
            name: "Azizbek Ruziev",
            email: "azizbek.ruziev@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (484) 555-0127",
            eligibility: "eligible",
            reason: "Profile verified"
        },
        {
            id: "murod-hamidov",
            name: "Murod Hamidov",
            email: "murod.hamidov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (240) 555-0186",
            eligibility: "ineligible",
            reason: "Reverification due"
        },
        {
            id: "bekzod-saliev",
            name: "Bekzod Saliev",
            email: "bekzod.saliev@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (443) 555-0199",
            eligibility: "ineligible",
            reason: "Reverification due"
        },
        {
            id: "otabek-ruzmetov",
            name: "Otabek Ruzmetov",
            email: "otabek.ruzmetov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (302) 555-0141",
            eligibility: "ineligible",
            reason: "Reverification due"
        },
        {
            id: "sardor-alimuhamedov",
            name: "Sardor Alimuhamedov",
            email: "sardor.alimuhamedov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (410) 555-0103",
            eligibility: "ineligible",
            reason: "License expired"
        },
        {
            id: "kamol-vahidov",
            name: "Kamol Vahidov",
            email: "kamol.vahidov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (267) 555-0166",
            eligibility: "ineligible",
            reason: "License expired"
        },
        {
            id: "farrukh-ismoilov",
            name: "Farrukh Ismoilov",
            email: "farrukh.ismoilov@futurelogisticsacademy.com",
            domicile: "BWI",
            phone: "+1 (717) 555-0194",
            eligibility: "ineligible",
            reason: "License expired"
        }
    ];

    clearRosterSessionOnReload();

    let drivers = loadDriverState();
    let activeMenuId = null;
    let isAddDriverModalOpen = false;
    let areAllDomicilesSelected = false;

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function isReloadNavigation() {
        const navigationEntries = typeof performance.getEntriesByType === "function"
            ? performance.getEntriesByType("navigation")
            : [];

        if (navigationEntries.length) {
            return navigationEntries[0].type === "reload";
        }

        return Boolean(performance.navigation && performance.navigation.type === 1);
    }

    function clearRosterSessionOnReload() {
        if (!isReloadNavigation()) {
            return;
        }

        try {
            sessionStorage.removeItem(DRIVER_ROSTER_SESSION_KEY);
        } catch (error) {
            console.warn("Unable to clear driver roster session state.", error);
        }
    }

    function cloneInitialDrivers() {
        return INITIAL_DRIVERS.map((driver) => ({ ...driver }));
    }

    function loadDriverState() {
        try {
            const raw = sessionStorage.getItem(DRIVER_ROSTER_SESSION_KEY);
            if (!raw) {
                return cloneInitialDrivers();
            }

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return cloneInitialDrivers();
            }

            return parsed.map((driver) => ({ ...driver }));
        } catch (error) {
            console.warn("Unable to load driver roster session state.", error);
            return cloneInitialDrivers();
        }
    }

    function saveDriverState() {
        try {
            sessionStorage.setItem(DRIVER_ROSTER_SESSION_KEY, JSON.stringify(drivers));
        } catch (error) {
            console.warn("Unable to save driver roster session state.", error);
        }
    }

    function getFilteredDrivers() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        if (!query) {
            return drivers;
        }

        return drivers.filter((driver) => (
            `${driver.name} ${driver.email} ${driver.phone}`.toLowerCase().includes(query)
        ));
    }

    function getInviteEntries() {
        if (!addDriverEmailInput) {
            return [];
        }

        return addDriverEmailInput.value
            .split(/[\n,;]+/g)
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    function isValidEmailAddress(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function syncInviteFormState() {
        const inviteEntries = getInviteEntries();
        const inviteCount = inviteEntries.length;
        const hasOnlyValidEmails = inviteCount > 0
            && inviteCount <= 100
            && inviteEntries.every((entry) => isValidEmailAddress(entry));

        if (addDriverEmailCount) {
            addDriverEmailCount.textContent = `${inviteCount}/100`;
        }

        if (addDriverSendButton) {
            addDriverSendButton.disabled = !hasOnlyValidEmails;
        }
    }

    function setAllDomicilesSelected(isSelected) {
        areAllDomicilesSelected = Boolean(isSelected);

        if (addDriverDomicileLabel) {
            addDriverDomicileLabel.textContent = areAllDomicilesSelected ? "All" : "None selected";
        }

        addDriverDomicileOptions.forEach((option) => {
            option.setAttribute("aria-selected", areAllDomicilesSelected ? "true" : "false");
        });
    }

    function openDomicileMenu() {
        if (!addDriverDomicileMenu || !addDriverDomicileTrigger) {
            return;
        }

        addDriverDomicileMenu.hidden = false;
        addDriverDomicileTrigger.setAttribute("aria-expanded", "true");
    }

    function closeDomicileMenu() {
        if (!addDriverDomicileMenu || !addDriverDomicileTrigger) {
            return;
        }

        addDriverDomicileMenu.hidden = true;
        addDriverDomicileTrigger.setAttribute("aria-expanded", "false");
    }

    function showInviteBanner(inviteEntries) {
        if (!inviteBanner || !inviteBannerMessage) {
            return;
        }

        inviteBannerMessage.textContent = inviteEntries.length === 1
            ? `An invitation has been sent to ${inviteEntries[0]}`
            : `Invitations have been sent to ${inviteEntries.length} email addresses.`;
        inviteBanner.classList.remove("is-hidden");
    }

    function hideInviteBanner() {
        if (inviteBanner) {
            inviteBanner.classList.add("is-hidden");
        }
    }

    function resetInviteForm() {
        if (addDriverEmailInput) {
            addDriverEmailInput.value = "";
        }

        setAllDomicilesSelected(false);
        syncInviteFormState();
    }

    function closeAddDriverModal() {
        if (!addDriverOverlay) {
            return;
        }

        isAddDriverModalOpen = false;
        closeDomicileMenu();
        addDriverOverlay.classList.remove("open");
        addDriverOverlay.setAttribute("aria-hidden", "true");
        resetInviteForm();
    }

    function openAddDriverModal() {
        if (!addDriverOverlay) {
            return;
        }

        isAddDriverModalOpen = true;
        addDriverOverlay.classList.add("open");
        addDriverOverlay.setAttribute("aria-hidden", "false");
        syncInviteFormState();

        if (addDriverDomicileTrigger) {
            addDriverDomicileTrigger.focus();
        }
    }

    function renderDriverRow(driver) {
        const isEligible = driver.eligibility === "eligible";
        const statusText = isEligible ? "Eligible" : "Ineligible";
        const isMenuOpen = activeMenuId === driver.id;
        const isDeactivated = driver.reason === "Deactivated";
        const primaryAction = isDeactivated ? "activate" : "deactivate";
        const primaryActionLabel = isDeactivated ? "Activate" : "Deactivate";

        return `
            <tr class="driver-roster-row ${isEligible ? "is-eligible" : "is-ineligible"}" data-driver-id="${escapeHtml(driver.id)}">
                <td>
                    <strong class="driver-roster-name">${escapeHtml(driver.name)}</strong><br>
                    <span class="tiny muted">${escapeHtml(driver.email)}</span><br>
                    <span class="tiny muted driver-roster-reason">
                        <span class="driver-roster-reason-icon" aria-hidden="true">${isEligible ? "&#10003;" : "&#10005;"}</span>
                        <span>${escapeHtml(driver.reason)}</span>
                    </span>
                </td>
                <td>${escapeHtml(driver.domicile)}</td>
                <td>${escapeHtml(driver.phone)}</td>
                <td>
                    <span class="status-pill driver-roster-status-pill ${isEligible ? "is-eligible" : "is-ineligible"}">
                        <span class="status-dot" aria-hidden="true"></span>${escapeHtml(statusText)}
                    </span><br>
                    <a class="tiny" href="#">Details</a>
                </td>
                <td class="driver-roster-actions-cell">
                    <div class="driver-roster-actions">
                        <button class="driver-roster-menu-button" type="button" data-driver-menu-toggle="${escapeHtml(driver.id)}" aria-expanded="${isMenuOpen ? "true" : "false"}" aria-label="Open driver actions">&#8226;&#8226;&#8226;</button>
                        <div class="driver-roster-action-menu"${isMenuOpen ? "" : " hidden"}>
                            <button type="button" data-driver-action="${escapeHtml(primaryAction)}" data-driver-id="${escapeHtml(driver.id)}">${escapeHtml(primaryActionLabel)}</button>
                            <button type="button" data-driver-action="delete" data-driver-id="${escapeHtml(driver.id)}">Delete</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderRoster() {
        const filteredDrivers = getFilteredDrivers();

        if (activeMenuId && !filteredDrivers.some((driver) => driver.id === activeMenuId)) {
            activeMenuId = null;
        }

        if (!filteredDrivers.length) {
            rosterBody.innerHTML = `
                <tr class="driver-roster-empty">
                    <td colspan="5">No drivers match your search.</td>
                </tr>
            `;
            return;
        }

        rosterBody.innerHTML = filteredDrivers.map((driver) => renderDriverRow(driver)).join("");
    }

    rosterBody.addEventListener("click", (event) => {
        const menuToggle = event.target.closest("[data-driver-menu-toggle]");
        if (menuToggle) {
            const driverId = menuToggle.getAttribute("data-driver-menu-toggle");
            activeMenuId = activeMenuId === driverId ? null : driverId;
            renderRoster();
            return;
        }

        const actionButton = event.target.closest("[data-driver-action]");
        if (!actionButton) {
            return;
        }

        const driverId = actionButton.getAttribute("data-driver-id");
        const action = actionButton.getAttribute("data-driver-action");
        activeMenuId = null;

        if (action === "deactivate") {
            const driver = drivers.find((item) => item.id === driverId);
            if (driver) {
                driver.eligibility = "ineligible";
                driver.reason = "Deactivated";
            }
        }

        if (action === "activate") {
            const driver = drivers.find((item) => item.id === driverId);
            if (driver) {
                driver.eligibility = "eligible";
                driver.reason = "Profile verified";
            }
        }

        if (action === "delete") {
            drivers = drivers.filter((item) => item.id !== driverId);
        }

        saveDriverState();
        renderRoster();
    });

    if (addDriverButton) {
        addDriverButton.addEventListener("click", () => {
            openAddDriverModal();
        });
    }

    if (addDriverCloseButton) {
        addDriverCloseButton.addEventListener("click", () => {
            closeAddDriverModal();
        });
    }

    if (addDriverCancelButton) {
        addDriverCancelButton.addEventListener("click", () => {
            closeAddDriverModal();
        });
    }

    if (addDriverDomicileTrigger) {
        addDriverDomicileTrigger.addEventListener("click", () => {
            if (addDriverDomicileMenu && !addDriverDomicileMenu.hidden) {
                closeDomicileMenu();
                return;
            }

            openDomicileMenu();
        });
    }

    addDriverDomicileOptions.forEach((option) => {
        option.addEventListener("click", () => {
            setAllDomicilesSelected(true);
            closeDomicileMenu();
        });
    });

    if (addDriverSendButton) {
        addDriverSendButton.addEventListener("click", () => {
            if (addDriverSendButton.disabled) {
                return;
            }

            showInviteBanner(getInviteEntries());
            closeAddDriverModal();
        });
    }

    if (inviteBannerClose) {
        inviteBannerClose.addEventListener("click", () => {
            hideInviteBanner();
        });
    }

    if (addDriverOverlay) {
        addDriverOverlay.addEventListener("click", (event) => {
            if (event.target === addDriverOverlay) {
                closeAddDriverModal();
            }
        });
    }

    if (addDriverEmailInput) {
        addDriverEmailInput.addEventListener("input", () => {
            syncInviteFormState();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderRoster();
        });
    }

    document.addEventListener("click", (event) => {
        if (addDriverDomicilePicker && !addDriverDomicilePicker.contains(event.target)) {
            closeDomicileMenu();
        }

        if (!activeMenuId || event.target.closest(".driver-roster-actions")) {
            return;
        }

        activeMenuId = null;
        renderRoster();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isAddDriverModalOpen) {
            closeAddDriverModal();
            return;
        }

        if (event.key === "Escape" && activeMenuId) {
            activeMenuId = null;
            renderRoster();
        }
    });

    setAllDomicilesSelected(false);
    syncInviteFormState();
    renderRoster();
});
