document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("assets-table-body");
    if (!tableBody || typeof window.getAmazonDemoAssetData !== "function") {
        return;
    }

    const resultsCount = document.querySelector(".assets-results-count");
    const temporaryCount = document.getElementById("assets-temporary-count");
    const importAssetsButton = document.getElementById("assets-import-button");
    const addAssetButton = document.getElementById("assets-add-button");
    const searchInput = document.getElementById("assets-search-input");
    const verificationFilter = document.getElementById("assets-verification-filter");
    const complianceFilter = document.getElementById("assets-compliance-filter");
    const temporaryModal = typeof window.createAmazonDemoTemporaryAssetModal === "function"
        ? window.createAmazonDemoTemporaryAssetModal()
        : null;
    const addAssetModal = typeof window.createAmazonDemoAddAssetModal === "function"
        ? window.createAmazonDemoAddAssetModal()
        : null;
    const importAssetModal = typeof window.createAmazonDemoImportAssetModal === "function"
        ? window.createAmazonDemoImportAssetModal()
        : null;

    let activeMenuUnit = null;

    function getFilteredAssets() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const verificationValue = verificationFilter ? verificationFilter.value : "Verification status";
        const complianceValue = complianceFilter ? complianceFilter.value : "California compliance";

        return window.getAmazonDemoAssetData().filter((asset) => {
            const matchesQuery = !query || [
                asset.unitNumber,
                asset.type,
                asset.make,
                asset.licensePlate,
                asset.vin
            ].some((value) => String(value).toLowerCase().includes(query));

            const matchesVerification = verificationValue === "Verification status"
                || asset.verificationStatus === verificationValue;

            const matchesCompliance = complianceValue === "California compliance"
                || asset.californiaCompliance === complianceValue;

            return matchesQuery && matchesVerification && matchesCompliance;
        });
    }

    function formatResultsLabel(count) {
        if (!count) {
            return "0 results";
        }

        return `1-${count} of ${count} results`;
    }

    function closeMenus() {
        if (!activeMenuUnit) {
            return;
        }

        activeMenuUnit = null;
        renderAssets();
    }

    function openTemporaryAssetModal(unitNumber) {
        const asset = typeof window.getAmazonDemoAssetByUnit === "function"
            ? window.getAmazonDemoAssetByUnit(unitNumber)
            : null;

        if (!asset || !temporaryModal) {
            return;
        }

        temporaryModal.openForAsset(asset);
        closeMenus();
    }

    function renderAssetRow(asset) {
        const isMenuOpen = activeMenuUnit === asset.unitNumber;
        const detailUrl = `assetdetails.html?unit=${encodeURIComponent(asset.unitNumber)}`;

        return `
            <tr data-asset-unit="${escapeAssetHtml(asset.unitNumber)}">
                <td><a class="assets-unit-link" href="${detailUrl}">${escapeAssetHtml(asset.unitNumber)}</a></td>
                <td>${escapeAssetHtml(asset.type)}</td>
                <td>${escapeAssetHtml(asset.make)}</td>
                <td>${escapeAssetHtml(asset.fuel)}</td>
                <td>${escapeAssetHtml(asset.modelYear)}</td>
                <td>${escapeAssetHtml(asset.licensePlate)}</td>
                <td>${escapeAssetHtml(asset.vin)}</td>
                <td><span class="status-pill"><span class="status-dot"></span>${escapeAssetHtml(asset.verificationStatus)}</span></td>
                <td><span class="status-pill assets-compliance-pill"><span class="status-dot"></span>${escapeAssetHtml(asset.californiaCompliance)}</span></td>
                <td class="assets-actions-cell">
                    <div class="assets-row-actions">
                        <button class="assets-row-menu" type="button" data-asset-menu-toggle="${escapeAssetHtml(asset.unitNumber)}" aria-expanded="${isMenuOpen ? "true" : "false"}" aria-label="Open asset actions">&#8230;</button>
                        <div class="assets-action-menu"${isMenuOpen ? "" : " hidden"}>
                            <a class="assets-action-menu-item is-link" href="${detailUrl}">
                                <span class="assets-action-icon" aria-hidden="true">&#8250;</span>
                                <span>View equipment details</span>
                            </a>
                            <button type="button" class="assets-action-menu-item" data-asset-action="temporary" data-asset-unit="${escapeAssetHtml(asset.unitNumber)}">
                                <span class="assets-action-icon" aria-hidden="true">&#8853;</span>
                                <span>Add temporary asset</span>
                            </button>
                            <button type="button" class="assets-action-menu-item is-danger" data-asset-action="delete" data-asset-unit="${escapeAssetHtml(asset.unitNumber)}">
                                <span class="assets-action-icon" aria-hidden="true">&#128465;</span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderAssets() {
        const filteredAssets = getFilteredAssets();

        if (activeMenuUnit && !filteredAssets.some((asset) => asset.unitNumber === activeMenuUnit)) {
            activeMenuUnit = null;
        }

        if (!filteredAssets.length) {
            tableBody.innerHTML = `
                <tr class="assets-empty-row">
                    <td colspan="10">No assets match your current search or filters.</td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredAssets.map((asset) => renderAssetRow(asset)).join("");
        }

        if (resultsCount) {
            resultsCount.textContent = formatResultsLabel(filteredAssets.length);
        }

        if (temporaryCount) {
            temporaryCount.textContent = "0/15";
        }
    }

    tableBody.addEventListener("click", (event) => {
        const menuToggle = event.target.closest("[data-asset-menu-toggle]");
        if (menuToggle) {
            const unitNumber = menuToggle.getAttribute("data-asset-menu-toggle");
            activeMenuUnit = activeMenuUnit === unitNumber ? null : unitNumber;
            renderAssets();
            return;
        }

        const actionButton = event.target.closest("[data-asset-action]");
        if (!actionButton) {
            return;
        }

        const action = actionButton.getAttribute("data-asset-action");
        const unitNumber = actionButton.getAttribute("data-asset-unit");
        if (!action || !unitNumber) {
            return;
        }

        if (action === "temporary") {
            openTemporaryAssetModal(unitNumber);
            return;
        }

        if (action === "delete" && typeof window.deleteAmazonDemoAsset === "function") {
            window.deleteAmazonDemoAsset(unitNumber);
            activeMenuUnit = null;
            renderAssets();
        }
    });

    [searchInput, verificationFilter, complianceFilter].forEach((field) => {
        if (!field) {
            return;
        }

        field.addEventListener("input", renderAssets);
        field.addEventListener("change", renderAssets);
    });

    if (addAssetButton && addAssetModal) {
        addAssetButton.addEventListener("click", () => {
            addAssetModal.open();
        });
    }

    if (importAssetsButton && importAssetModal) {
        importAssetsButton.addEventListener("click", () => {
            importAssetModal.open();
        });
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".assets-row-actions")) {
            closeMenus();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenus();
        }
    });

    renderAssets();
});

function escapeAssetHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
