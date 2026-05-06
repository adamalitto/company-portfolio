(() => {
    const LOAD_RESULTS_WINDOW_NAME_PREFIX = "__amazonDemoLoadResults__:";
    const navigationEntries = typeof performance !== "undefined" && typeof performance.getEntriesByType === "function"
        ? performance.getEntriesByType("navigation")
        : [];

    const isReload = navigationEntries.length
        ? navigationEntries[0].type === "reload"
        : Boolean(typeof performance !== "undefined" && performance.navigation && performance.navigation.type === 1);

    if (!isReload) {
        return;
    }

    try {
        const keysToClear = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
            const key = sessionStorage.key(index);
            if (key && key.startsWith("amazonDemo")) {
                keysToClear.push(key);
            }
        }

        keysToClear.forEach((key) => {
            sessionStorage.removeItem(key);
        });

        if (typeof window.name === "string" && window.name.startsWith(LOAD_RESULTS_WINDOW_NAME_PREFIX)) {
            window.name = "";
        }
    } catch (error) {
        console.warn("Unable to reset Amazon Demo session state on reload.", error);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");
    const hamburger = document.getElementById("hamburger-icon");
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();

    if (hamburger && sidebar && mainContent) {
        hamburger.addEventListener("click", () => {
            sidebar.classList.toggle("hidden");
            mainContent.classList.toggle("full-width");
        });
    }

    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    dropdownToggles.forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const dropdown = toggle.closest(".dropdown");
            if (!dropdown) {
                return;
            }

            dropdown.classList.toggle("active");
            const arrow = toggle.querySelector(".arrow");
            if (arrow) {
                arrow.classList.toggle("open");
            }
        });
    });

    const sidebarLinks = document.querySelectorAll("#sidebar .nav a[href]");

    sidebarLinks.forEach((link) => {
        const linkPage = link.getAttribute("href").split(/[?#]/)[0].toLowerCase();
        if (linkPage === currentPage) {
            link.classList.add("active-page");
            const parentDropdown = link.closest(".dropdown");
            if (parentDropdown) {
                parentDropdown.classList.add("active");
                const arrow = parentDropdown.querySelector(".dropdown-toggle .arrow");
                if (arrow) {
                    arrow.classList.add("open");
                }
            }
        }
    });

    const notificationLinks = document.querySelectorAll(".top-icons [title='Notifications']");
    const openNotificationsPage = () => {
        if (currentPage === "notification.html") {
            if (window.location.hash.toLowerCase() !== "#notifications") {
                window.location.hash = "notifications";
            }

            return;
        }

        window.location.href = "notification.html#notifications";
    };

    notificationLinks.forEach((icon) => {
        if (!icon.hasAttribute("aria-label")) {
            icon.setAttribute("aria-label", "Open notifications");
        }

        if (!icon.hasAttribute("tabindex")) {
            icon.tabIndex = 0;
        }

        icon.setAttribute("role", "link");
        icon.addEventListener("click", openNotificationsPage);
        icon.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            openNotificationsPage();
        });
    });
});
