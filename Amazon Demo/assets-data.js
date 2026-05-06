(function attachAmazonDemoAssets(globalScope) {
    const ASSET_SESSION_KEY = "amazonDemoAssetRosterState";
    const ASSET_MODEL_BY_MAKE = {
        Freightliner: "Cascadia",
        "Volvo truck": "VNL 760",
        Kenworth: "T680",
        Peterbilt: "579"
    };

    const baseAssets = [
        { unitNumber: "504", type: "Tractor", make: "Freightliner", fuel: "DIESEL", modelYear: "2026", licensePlate: "AH54219", vin: "3AKJ******T4816", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "512", type: "Tractor", make: "Freightliner", fuel: "DIESEL", modelYear: "2018", licensePlate: "AG68452", vin: "3AKJ******J3204", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "565", type: "Tractor", make: "Peterbilt", fuel: "DIESEL", modelYear: "2017", licensePlate: "AK43168", vin: "1XPB******H2745", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "568", type: "Tractor", make: "Volvo truck", fuel: "DIESEL", modelYear: "2024", licensePlate: "AH18264", vin: "4V4N******R1638", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "569", type: "Tractor", make: "Volvo truck", fuel: "DIESEL", modelYear: "2023", licensePlate: "AJ07491", vin: "4V4N******P8506", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "550", type: "Tractor", make: "Kenworth", fuel: "DIESEL", modelYear: "2016", licensePlate: "AG95814", vin: "1XKY******G6302", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "552", type: "Tractor", make: "Peterbilt", fuel: "DIESEL", modelYear: "2020", licensePlate: "AK93725", vin: "1XPB******L5087", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "553", type: "Tractor", make: "Freightliner", fuel: "DIESEL", modelYear: "2015", licensePlate: "AH70544", vin: "3AKJ******F2768", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "554", type: "Tractor", make: "Kenworth", fuel: "DIESEL", modelYear: "2021", licensePlate: "AG84763", vin: "1XKY******M4106", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "556", type: "Tractor", make: "Peterbilt", fuel: "DIESEL", modelYear: "2019", licensePlate: "AK81492", vin: "1XPB******K0917", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "555", type: "Tractor", make: "Freightliner", fuel: "DIESEL", modelYear: "2022", licensePlate: "AH66231", vin: "3AKJ******N0260", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "559A", type: "Tractor", make: "Kenworth", fuel: "DIESEL", modelYear: "2025", licensePlate: "AG89817", vin: "1XKY******S7758", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "580", type: "Tractor", make: "Peterbilt", fuel: "DIESEL", modelYear: "2024", licensePlate: "AH65348", vin: "1XPB******R6541", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "582", type: "Tractor", make: "Freightliner", fuel: "DIESEL", modelYear: "2018", licensePlate: "AJ50326", vin: "3AKJ******J1102", verificationStatus: "Verified", californiaCompliance: "CTC compliant" },
        { unitNumber: "584", type: "Tractor", make: "Kenworth", fuel: "DIESEL", modelYear: "2017", licensePlate: "AK79642", vin: "1XKY******H5963", verificationStatus: "Verified", californiaCompliance: "CTC compliant" }
    ];

    function toTitleCase(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\b\w/g, (match) => match.toUpperCase());
    }

    function normalizeUnitNumber(unitNumber) {
        return String(unitNumber || "").trim().toUpperCase();
    }

    function decorateAsset(asset) {
        const cleanTruckStatus = asset.californiaCompliance === "CTC compliant" ? "Compliant" : "Not compliant";

        return {
            ...asset,
            manufacturer: asset.make,
            ownership: "Carrier owned",
            model: ASSET_MODEL_BY_MAKE[asset.make] || "Fleet Tractor",
            eligibilityStatus: asset.verificationStatus === "Verified" ? "Eligible" : "Pending",
            fuelLabel: toTitleCase(asset.fuel),
            plateCountry: "US",
            plateState: "PA",
            fullLicensePlate: `US PA ${asset.licensePlate}`,
            verificationDescription: "This asset has been verified to be operating under your company's authority.",
            cleanTruckStatus,
            cleanTruckCertificateType: "Vehicle Certificate of Compliance (VCC)"
        };
    }

    function cloneBaseAssets() {
        return baseAssets.map((asset) => decorateAsset({ ...asset }));
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

    function refreshExports() {
        globalScope.AMAZON_DEMO_ASSETS = getAmazonDemoAssetData();
    }

    function clearAssetStateOnReload() {
        if (!isReloadNavigation()) {
            return;
        }

        try {
            sessionStorage.removeItem(ASSET_SESSION_KEY);
        } catch (error) {
            console.warn("Unable to clear asset roster session state.", error);
        }
    }

    function loadAssetState() {
        try {
            const raw = sessionStorage.getItem(ASSET_SESSION_KEY);
            if (!raw) {
                return cloneBaseAssets();
            }

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return cloneBaseAssets();
            }

            return parsed.map((asset) => decorateAsset({ ...asset }));
        } catch (error) {
            console.warn("Unable to load asset roster session state.", error);
            return cloneBaseAssets();
        }
    }

    function saveAssetState(assets) {
        try {
            sessionStorage.setItem(ASSET_SESSION_KEY, JSON.stringify(assets));
        } catch (error) {
            console.warn("Unable to save asset roster session state.", error);
        }

        refreshExports();
    }

    function getAmazonDemoAssetData() {
        return loadAssetState();
    }

    function getAmazonDemoAssetByUnit(unitNumber) {
        const normalizedUnitNumber = normalizeUnitNumber(unitNumber);
        return getAmazonDemoAssetData()
            .find((asset) => normalizeUnitNumber(asset.unitNumber) === normalizedUnitNumber) || null;
    }

    function getAmazonDemoTractorLicenseOptions() {
        return getAmazonDemoAssetData()
            .filter((asset) => asset.type === "Tractor" && typeof asset.licensePlate === "string")
            .map((asset) => asset.licensePlate);
    }

    function deleteAmazonDemoAsset(unitNumber) {
        const normalizedUnitNumber = normalizeUnitNumber(unitNumber);
        const nextAssets = getAmazonDemoAssetData()
            .filter((asset) => normalizeUnitNumber(asset.unitNumber) !== normalizedUnitNumber)
            .map((asset) => ({
                unitNumber: asset.unitNumber,
                type: asset.type,
                make: asset.make,
                fuel: asset.fuel,
                modelYear: asset.modelYear,
                licensePlate: asset.licensePlate,
                vin: asset.vin,
                verificationStatus: asset.verificationStatus,
                californiaCompliance: asset.californiaCompliance
            }));

        saveAssetState(nextAssets);
        return getAmazonDemoAssetData();
    }

    clearAssetStateOnReload();
    refreshExports();

    globalScope.getAmazonDemoAssetData = getAmazonDemoAssetData;
    globalScope.getAmazonDemoAssetByUnit = getAmazonDemoAssetByUnit;
    globalScope.getAmazonDemoTractorLicenseOptions = getAmazonDemoTractorLicenseOptions;
    globalScope.deleteAmazonDemoAsset = deleteAmazonDemoAsset;
})(window);
