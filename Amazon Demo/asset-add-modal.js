(function attachAmazonDemoAddAssetModal(globalScope) {
    function createAmazonDemoAddAssetModal() {
        const overlay = document.getElementById("assets-add-overlay");
        const form = document.getElementById("assets-add-form");
        if (!overlay || !form) {
            return null;
        }

        if (overlay.__amazonDemoAddAssetModal) {
            return overlay.__amazonDemoAddAssetModal;
        }

        const closeButton = document.getElementById("assets-add-close");
        const cancelButton = document.getElementById("assets-add-cancel");
        const firstField = document.getElementById("assets-add-body-type");
        const reviewBanner = document.getElementById("assets-review-banner");
        const reviewMessage = document.getElementById("assets-review-message");
        const reviewClose = document.getElementById("assets-review-close");

        const fields = {
            bodyType: document.getElementById("assets-add-body-type"),
            ownership: document.getElementById("assets-add-ownership"),
            lpCountry: document.getElementById("assets-add-lp-country"),
            lpState: document.getElementById("assets-add-lp-state"),
            lpNumber: document.getElementById("assets-add-lp-number"),
            unitNumber: document.getElementById("assets-add-unit-input"),
            vin: document.getElementById("assets-add-vin")
        };

        const formatters = {
            lpState: (value) => value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2),
            lpNumber: (value) => value.replace(/\D/g, "").slice(0, 5),
            unitNumber: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
            vin: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17)
        };

        function getFieldWrap(fieldName) {
            return form.querySelector(`[data-assets-add-wrap="${fieldName}"]`);
        }

        function getFieldError(fieldName) {
            return form.querySelector(`[data-assets-add-error="${fieldName}"]`);
        }

        function normalizeField(fieldName) {
            const input = fields[fieldName];
            const formatter = formatters[fieldName];
            if (!input || !formatter) {
                return;
            }

            input.value = formatter(input.value);
        }

        function setFieldError(fieldName, message) {
            const input = fields[fieldName];
            const wrap = getFieldWrap(fieldName);
            const error = getFieldError(fieldName);
            const hasError = Boolean(message);

            if (wrap) {
                wrap.classList.toggle("is-invalid", hasError);
            }

            if (input) {
                input.setAttribute("aria-invalid", hasError ? "true" : "false");
            }

            if (error) {
                error.hidden = !hasError;
                if (hasError) {
                    error.textContent = message;
                }
            }
        }

        function clearValidation() {
            Object.keys(fields).forEach((fieldName) => {
                setFieldError(fieldName, "");
            });
        }

        function showReviewBanner(unitNumber) {
            if (!reviewBanner || !reviewMessage) {
                return;
            }

            reviewMessage.textContent = `The asset for Unit ${unitNumber} is under review.`;
            reviewBanner.classList.remove("is-hidden");
        }

        function hideReviewBanner() {
            if (reviewBanner) {
                reviewBanner.classList.add("is-hidden");
            }
        }

        function validateField(fieldName) {
            normalizeField(fieldName);

            const input = fields[fieldName];
            if (!input) {
                return true;
            }

            const value = input.value.trim();
            let errorMessage = "";

            switch (fieldName) {
                case "bodyType":
                    errorMessage = value ? "" : "Enter an asset body type";
                    break;
                case "ownership":
                    errorMessage = value ? "" : "Enter an ownership type";
                    break;
                case "lpCountry":
                    errorMessage = value ? "" : "Enter a license plate country";
                    break;
                case "lpState":
                    if (!value) {
                        errorMessage = "Enter a license plate state";
                    } else if (!/^[A-Z]{2}$/.test(value)) {
                        errorMessage = "Enter a 2-letter state abbreviation";
                    }
                    break;
                case "lpNumber":
                    if (!/^\d{5}$/.test(value)) {
                        errorMessage = "Invalid license plate number. Enter 5 digits.";
                    }
                    break;
                case "unitNumber":
                    if (!value) {
                        errorMessage = "Enter a unit number";
                    } else if (!/^[A-Z0-9]{2,6}$/.test(value)) {
                        errorMessage = "Enter a valid unit number";
                    }
                    break;
                case "vin":
                    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(value)) {
                        errorMessage = "Invalid VIN. Enter the 17-character alphanumeric vehicle identifier.";
                    }
                    break;
                default:
                    break;
            }

            setFieldError(fieldName, errorMessage);
            return !errorMessage;
        }

        function validateAllFields() {
            return Object.keys(fields).every((fieldName) => validateField(fieldName));
        }

        function close() {
            overlay.classList.remove("open");
            overlay.setAttribute("aria-hidden", "true");
            form.reset();
            clearValidation();
        }

        function open() {
            form.reset();
            clearValidation();
            overlay.classList.add("open");
            overlay.setAttribute("aria-hidden", "false");

            if (firstField) {
                firstField.focus();
            }
        }

        function handleFieldInteraction(event) {
            const input = event.target.closest("[data-assets-add-field]");
            if (!input) {
                return;
            }

            const fieldName = input.getAttribute("data-assets-add-field");
            if (!fieldName) {
                return;
            }

            normalizeField(fieldName);

            if (input.getAttribute("aria-invalid") === "true") {
                validateField(fieldName);
            }
        }

        function handleFieldBlur(event) {
            const input = event.target.closest("[data-assets-add-field]");
            if (!input) {
                return;
            }

            const fieldName = input.getAttribute("data-assets-add-field");
            if (!fieldName) {
                return;
            }

            validateField(fieldName);
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

        form.addEventListener("input", handleFieldInteraction);
        form.addEventListener("change", handleFieldInteraction);
        form.addEventListener("focusout", handleFieldBlur);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!validateAllFields()) {
                return;
            }

            const submittedUnitNumber = fields.unitNumber ? fields.unitNumber.value.trim() : "";
            close();
            showReviewBanner(submittedUnitNumber);
        });

        const controller = {
            open,
            close,
            validateAllFields
        };

        overlay.__amazonDemoAddAssetModal = controller;
        return controller;
    }

    globalScope.createAmazonDemoAddAssetModal = createAmazonDemoAddAssetModal;
})(window);
