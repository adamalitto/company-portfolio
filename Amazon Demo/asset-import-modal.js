(function attachAmazonDemoImportAssetModal(globalScope) {
    function createAmazonDemoImportAssetModal() {
        const overlay = document.getElementById("assets-import-overlay");
        if (!overlay) {
            return null;
        }

        if (overlay.__amazonDemoImportAssetModal) {
            return overlay.__amazonDemoImportAssetModal;
        }

        const closeButton = document.getElementById("assets-import-close");
        const cancelButton = document.getElementById("assets-import-cancel");
        const submitButton = document.getElementById("assets-import-submit");
        const typeSelect = document.getElementById("assets-import-type");
        const downloadButton = document.getElementById("assets-import-download");
        const attachButton = document.getElementById("assets-import-attach");
        const reviewBanner = document.getElementById("assets-review-banner");
        const reviewMessage = document.getElementById("assets-review-message");
        const reviewClose = document.getElementById("assets-review-close");

        function syncDownloadState() {
            if (!typeSelect || !downloadButton) {
                return;
            }

            downloadButton.disabled = !typeSelect.value;
        }

        function close() {
            overlay.classList.remove("open");
            overlay.setAttribute("aria-hidden", "true");

            if (typeSelect) {
                typeSelect.value = "";
            }

            syncDownloadState();
        }

        function showReviewBanner() {
            if (!reviewBanner || !reviewMessage) {
                return;
            }

            reviewMessage.textContent = "Imported Assets are under review.";
            reviewBanner.classList.remove("is-hidden");
        }

        function hideReviewBanner() {
            if (reviewBanner) {
                reviewBanner.classList.add("is-hidden");
            }
        }

        function open() {
            overlay.classList.add("open");
            overlay.setAttribute("aria-hidden", "false");
            syncDownloadState();

            if (typeSelect) {
                typeSelect.focus();
            }
        }

        if (closeButton) {
            closeButton.addEventListener("click", close);
        }

        if (cancelButton) {
            cancelButton.addEventListener("click", close);
        }

        if (reviewClose) {
            reviewClose.addEventListener("click", hideReviewBanner);
        }

        if (typeSelect) {
            typeSelect.addEventListener("change", syncDownloadState);
        }

        if (downloadButton) {
            downloadButton.addEventListener("click", () => {
                if (!typeSelect || !typeSelect.value) {
                    return;
                }
            });
        }

        if (attachButton) {
            attachButton.addEventListener("click", () => {});
        }

        if (submitButton) {
            submitButton.addEventListener("click", () => {
                if (!typeSelect || !typeSelect.value) {
                    if (typeSelect) {
                        typeSelect.focus();
                    }
                    return;
                }

                close();
                showReviewBanner();
            });
        }

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                close();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && overlay.classList.contains("open")) {
                close();
            }
        });

        syncDownloadState();

        const controller = {
            open,
            close
        };

        overlay.__amazonDemoImportAssetModal = controller;
        return controller;
    }

    globalScope.createAmazonDemoImportAssetModal = createAmazonDemoImportAssetModal;
})(window);
