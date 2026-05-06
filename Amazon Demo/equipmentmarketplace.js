function closeNotification(notificationId) {
    const notificationBox = document.getElementById(notificationId);
    if (notificationBox) {
        notificationBox.classList.add("is-hidden");
    }
}

window.closeNotification = closeNotification;

document.addEventListener("DOMContentLoaded", () => {
    const startDate = document.getElementById("equipment-start-date");
    const endDate = document.getElementById("equipment-end-date");
    const showBidsToggle = document.getElementById("equipment-show-bids");
    const clearFiltersButton = document.getElementById("equipment-clear-filters");
    const refreshNowButton = document.getElementById("equipment-refresh-now");
    const refreshToggleButton = document.getElementById("equipment-refresh-toggle");
    const refreshSettingsButton = document.getElementById("equipment-refresh-settings");
    const refreshLabel = document.getElementById("equipment-refresh-label");

    const state = {
        lastUpdatedSeconds: 4,
        refreshReminderOn: false,
    };

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

    [startDate, endDate].forEach((input) => {
        if (!input) {
            return;
        }

        const field = input.closest(".equipment-marketplace-date-field");
        const syncDateField = () => {
            if (!field) {
                return;
            }

            field.classList.toggle("has-value", Boolean(input.value));
        };

        input.addEventListener("change", syncDateField);
        input.addEventListener("input", syncDateField);
        syncDateField();
    });

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", () => {
            if (startDate) {
                startDate.value = "";
                startDate.dispatchEvent(new Event("input"));
            }

            if (endDate) {
                endDate.value = "";
                endDate.dispatchEvent(new Event("input"));
            }

            if (showBidsToggle) {
                showBidsToggle.checked = false;
            }
        });
    }

    if (refreshNowButton) {
        refreshNowButton.addEventListener("click", () => {
            state.lastUpdatedSeconds = 0;
            updateRefreshLabel();
        });
    }

    if (refreshToggleButton) {
        refreshToggleButton.addEventListener("click", () => {
            state.refreshReminderOn = !state.refreshReminderOn;
            updateRefreshLabel();
        });
    }

    if (refreshSettingsButton) {
        refreshSettingsButton.addEventListener("click", () => {
            state.lastUpdatedSeconds = 0;
            updateRefreshLabel();
        });
    }

    function updateRefreshLabel() {
        if (refreshLabel) {
            const prefix = state.refreshReminderOn ? "Refresh reminder on" : "Turn on refresh reminder";
            refreshLabel.textContent = `${prefix}: last updated ${state.lastUpdatedSeconds}s`;
        }

        if (refreshToggleButton) {
            refreshToggleButton.innerHTML = state.refreshReminderOn ? "&#10074;&#10074;" : "&#9654;";
            refreshToggleButton.setAttribute(
                "aria-label",
                state.refreshReminderOn ? "Pause refresh reminder" : "Turn on refresh reminder"
            );
        }
    }

    updateRefreshLabel();

    window.setInterval(() => {
        state.lastUpdatedSeconds += 1;
        updateRefreshLabel();
    }, 1000);
});
