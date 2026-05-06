document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("feedbackOverlay");
    const openLink = document.getElementById("openFeedback");
    const closeButton = document.getElementById("closeFeedback");
    const cancelButton = document.getElementById("cancelFeedback");

    if (!overlay) {
        return;
    }

    const openOverlay = () => {
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
    };

    const closeOverlay = () => {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
    };

    if (openLink) {
        openLink.addEventListener("click", (event) => {
            event.preventDefault();
            openOverlay();
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeOverlay);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeOverlay);
    }

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeOverlay();
        }
    });

    if (window.location.hash === "#feedback") {
        openOverlay();
    }
});
