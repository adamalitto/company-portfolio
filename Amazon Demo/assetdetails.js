document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.getAmazonDemoAssetByUnit !== "function") {
        return;
    }

    const detailContent = document.getElementById("asset-detail-content");
    const emptyState = document.getElementById("asset-detail-empty");
    const actionsWrap = document.getElementById("asset-detail-actions");
    const actionsTrigger = document.getElementById("asset-detail-actions-trigger");
    const menuToggle = document.getElementById("asset-detail-actions-menu-toggle");
    const actionMenu = document.getElementById("asset-detail-action-menu");
    const addTemporaryButton = document.getElementById("asset-detail-add-temporary");
    const deleteButton = document.getElementById("asset-detail-delete");
    const temporaryModal = typeof window.createAmazonDemoTemporaryAssetModal === "function"
        ? window.createAmazonDemoTemporaryAssetModal()
        : null;

    let activeAsset = null;

    function getUnitFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("unit") || "";
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function closeActionMenu() {
        if (!actionMenu || !menuToggle) {
            return;
        }

        actionMenu.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
    }

    function toggleActionMenu() {
        if (!actionMenu || !menuToggle || !activeAsset) {
            return;
        }

        const isOpen = !actionMenu.hidden;
        actionMenu.hidden = isOpen;
        menuToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    }

    function openTemporaryAssetModal() {
        if (!activeAsset || !temporaryModal) {
            return;
        }

        temporaryModal.openForAsset(activeAsset);
        closeActionMenu();
    }

    function renderNotFoundState() {
        if (detailContent) {
            detailContent.hidden = true;
        }

        if (emptyState) {
            emptyState.hidden = false;
        }

        if (actionsWrap) {
            actionsWrap.hidden = true;
        }
    }

    function renderAssetDetails(asset) {
        activeAsset = asset;

        if (detailContent) {
            detailContent.hidden = false;
        }

        if (emptyState) {
            emptyState.hidden = true;
        }

        if (actionsWrap) {
            actionsWrap.hidden = false;
        }

        document.title = `Asset ${asset.unitNumber}`;
        setText("asset-detail-unit", asset.unitNumber);
        setText("asset-detail-eligibility", asset.eligibilityStatus);
        setText("asset-detail-compliance", asset.californiaCompliance);
        setText("asset-detail-license-plate", asset.fullLicensePlate);
        setText("asset-detail-type", asset.type);
        setText("asset-detail-manufacturer", asset.manufacturer);
        setText("asset-detail-vin", asset.vin);
        setText("asset-detail-ownership", asset.ownership);
        setText("asset-detail-model", asset.model);
        setText("asset-detail-fuel", asset.fuelLabel);
        setText("asset-detail-year", asset.modelYear);
        setText("asset-detail-verification-status", asset.verificationStatus);
        setText("asset-detail-verification-copy", asset.verificationDescription);
        setText("asset-detail-clean-status", asset.cleanTruckStatus);
        setText("asset-detail-certificate-type", asset.cleanTruckCertificateType);
    }

    const requestedUnit = getUnitFromUrl();
    const asset = requestedUnit ? window.getAmazonDemoAssetByUnit(requestedUnit) : null;
    if (!asset) {
        renderNotFoundState();
    } else {
        renderAssetDetails(asset);
    }

    if (actionsTrigger) {
        actionsTrigger.addEventListener("click", toggleActionMenu);
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", toggleActionMenu);
    }

    if (addTemporaryButton) {
        addTemporaryButton.addEventListener("click", openTemporaryAssetModal);
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            if (!activeAsset || typeof window.deleteAmazonDemoAsset !== "function") {
                return;
            }

            window.deleteAmazonDemoAsset(activeAsset.unitNumber);
            window.location.href = "assets.html";
        });
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest("#asset-detail-actions")) {
            closeActionMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeActionMenu();
        }
    });
});
