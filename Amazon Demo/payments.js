document.addEventListener("DOMContentLoaded", () => {
    const BOOKED_TRIPS_STORAGE_KEY = "amazonDemoBookedTrips";
    const paymentSchedule = window.AmazonDemoPaymentSchedule;

    const tabButtons = Array.from(document.querySelectorAll(".payments-page .tabs .tab[data-target]"));
    const panes = Array.from(document.querySelectorAll(".payments-page .payments-pane"));
    const ytdLabel = document.getElementById("payments-ytd-label");
    const ytdTotal = document.getElementById("payments-ytd-total");
    const yearLabel = document.getElementById("payments-year-label");
    const yearTotal = document.getElementById("payments-year-total");
    const previewText = document.getElementById("payments-preview-text");
    const previewToggleButton = document.getElementById("payments-preview-toggle");
    const searchInput = document.getElementById("payments-search-input");
    const statusFilter = document.getElementById("payments-status-filter");
    const paymentsTableBody = document.getElementById("payments-table-body");

    let previewNextWeek = false;
    let searchTerm = "";
    let statusValue = "Status";

    function activatePane(targetId) {
        panes.forEach((pane) => pane.classList.toggle("is-hidden", pane.id !== targetId));
        tabButtons.forEach((button) => {
            const isActive = button.dataset.target === targetId;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    }

    function startOfDay(date) {
        const nextDate = new Date(date);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate;
    }

    function addDays(date, days) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate;
    }

    function getWeekStartSunday(date) {
        const safeDate = startOfDay(date);
        return addDays(safeDate, -safeDate.getDay());
    }

    function formatMoney(value) {
        const amount = Number(value) || 0;
        return amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatSummaryMoney(value) {
        return `+${formatMoney(value)}`;
    }

    function parseMoney(value) {
        const parsed = parseFloat(String(value || "").replace(/[^0-9.-]/g, ""));
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    function formatDateLabel(date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatWorkPeriod(startDate, endDate) {
        return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
    }

    function loadBookedTrips() {
        try {
            return JSON.parse(sessionStorage.getItem(BOOKED_TRIPS_STORAGE_KEY) || "[]");
        } catch (error) {
            console.warn("Unable to read payments trip data.", error);
            return [];
        }
    }

    function isRejectedHistoryTrip(trip) {
        return (trip?.status || "upcoming") === "history"
            && (((trip?.historyStatus || "").toLowerCase() === "rejected") || Boolean(trip?.rejection?.reason));
    }

    function isCanceledHistoryTrip(trip) {
        const status = String(trip?.historyStatus || "").toLowerCase();
        return (trip?.status || "upcoming") === "history"
            && (status === "canceled" || status === "cancelled" || Boolean(trip?.canceledAt));
    }

    function getCompletedHistoryTrips() {
        return loadBookedTrips().filter((trip) => (
            (trip.status || "upcoming") === "history"
            && !isRejectedHistoryTrip(trip)
            && !isCanceledHistoryTrip(trip)
        ));
    }

    function getTripPaymentSegments(trip) {
        const routeSegments = Array.isArray(trip?.routeSegments) ? trip.routeSegments : [];
        const totalPriceCents = Math.round((Number(trip?.priceValue) || parseMoney(trip?.price)) * 100);
        const totalMiles = Math.max(1, routeSegments.reduce((sum, segment) => sum + (Number(segment.miles) || 0), 0));

        if (!routeSegments.length) {
            return [{
                id: trip?.loadKey || trip?.loadId || "load",
                amountValue: totalPriceCents / 100,
                miles: Number(trip?.miles) || 0
            }];
        }

        let allocatedCents = 0;
        return routeSegments.map((segment, segmentIndex) => {
            const segmentMiles = Math.max(0, Number(segment.miles) || 0);
            const segmentCents = segmentIndex === routeSegments.length - 1
                ? Math.max(0, totalPriceCents - allocatedCents)
                : Math.round(totalPriceCents * (segmentMiles / totalMiles));
            allocatedCents += segmentCents;

            return {
                id: `${trip?.loadKey || trip?.loadId || "load"}:${segmentIndex + 1}`,
                amountValue: segmentCents / 100,
                miles: segmentMiles
            };
        });
    }

    function getCompletedHistoryPaymentSegments() {
        return getCompletedHistoryTrips().flatMap((trip) => getTripPaymentSegments(trip));
    }

    function getNextWeekEstimate() {
        return getCompletedHistoryPaymentSegments().reduce((sum, segment) => sum + segment.amountValue, 0);
    }

    function decoratePaymentRow(row) {
        return {
            ...row,
            workPeriod: formatWorkPeriod(row.workStartDate, row.workEndDate),
            invoiceDate: formatDateLabel(row.invoiceDateValue),
            paymentDate: formatDateLabel(row.paymentDateValue),
            amountLabel: formatMoney(row.amountValue)
        };
    }

    function getLastSixMonthsFinishedPaymentRows(today) {
        if (!paymentSchedule?.getLastSixMonthsFinishedPaymentRows) {
            return [];
        }

        return paymentSchedule.getLastSixMonthsFinishedPaymentRows(today)
            .map(decoratePaymentRow);
    }

    function getPaymentSummaryTotals(today) {
        if (paymentSchedule?.getPaymentSummaryTotals) {
            return paymentSchedule.getPaymentSummaryTotals(today);
        }

        return {
            currentYear: today.getFullYear(),
            previousYear: today.getFullYear() - 1,
            ytdPayments: 0,
            previousYearPayments: 0
        };
    }

    function buildEstimatedPaymentRow(today, amountValue, loadCount) {
        const nextWeekStart = addDays(getWeekStartSunday(today), 7);
        const nextWeekEnd = addDays(nextWeekStart, 6);
        const invoiceDate = addDays(nextWeekEnd, 3);
        const paymentDate = addDays(nextWeekEnd, 4);

        return {
            id: "EST-NEXT",
            workType: loadCount > 1 ? `Spot (${loadCount} loads)` : "Spot",
            workPeriod: formatWorkPeriod(nextWeekStart, nextWeekEnd),
            invoiceDate: formatDateLabel(invoiceDate),
            paymentDate: formatDateLabel(paymentDate),
            status: "Estimated",
            amountValue,
            amountLabel: formatMoney(amountValue),
            ctaLabel: "Preview"
        };
    }

    function getRenderedPaymentRows() {
        const today = new Date();
        const paidRows = getLastSixMonthsFinishedPaymentRows(today);
        if (!previewNextWeek) {
            return paidRows;
        }

        const nextWeekEstimate = getNextWeekEstimate();
        const previewSegmentCount = getCompletedHistoryPaymentSegments().length;
        return [
            buildEstimatedPaymentRow(today, nextWeekEstimate, previewSegmentCount),
            ...paidRows
        ];
    }

    function renderPaymentRows() {
        if (!paymentsTableBody) return;

        const rows = getRenderedPaymentRows().filter((row) => {
            if (statusValue !== "Status" && row.status !== statusValue) {
                return false;
            }

            if (!searchTerm) {
                return true;
            }

            const haystack = [
                row.id,
                row.workType,
                row.workPeriod,
                row.invoiceDate,
                row.paymentDate,
                row.status,
                row.amountLabel
            ].join(" ").toLowerCase();

            return haystack.includes(searchTerm);
        });

        if (!rows.length) {
            paymentsTableBody.innerHTML = `
                <tr class="payments-empty-row">
                    <td colspan="8">No payments match the current filters.</td>
                </tr>
            `;
            return;
        }

        paymentsTableBody.innerHTML = rows.map((row) => `
            <tr${row.status === "Estimated" ? ' class="payments-estimated-row"' : ""}>
                <td>${row.id}</td>
                <td>${row.workType}</td>
                <td>${row.workPeriod}</td>
                <td>${row.invoiceDate}</td>
                <td>${row.paymentDate}</td>
                <td>
                    <span class="status-pill${row.status === "Estimated" ? " payments-estimated-pill" : ""}">
                        <span class="status-dot"></span>${row.status}
                    </span>
                </td>
                <td>${row.amountLabel}</td>
                <td><button class="btn btn-primary">${row.ctaLabel}</button></td>
            </tr>
        `).join("");
    }

    function renderPaymentSummary() {
        const today = new Date();
        const summaryTotals = getPaymentSummaryTotals(today);
        const nextWeekEstimate = previewNextWeek ? getNextWeekEstimate() : 0;

        if (ytdLabel) {
            ytdLabel.textContent = previewNextWeek
                ? `${summaryTotals.currentYear} YTD payments + preview`
                : `${summaryTotals.currentYear} YTD payments`;
        }

        if (ytdTotal) {
            ytdTotal.textContent = formatSummaryMoney(summaryTotals.ytdPayments + nextWeekEstimate);
        }

        if (yearLabel) {
            yearLabel.textContent = `${summaryTotals.previousYear} payments`;
        }

        if (yearTotal) {
            yearTotal.textContent = formatSummaryMoney(summaryTotals.previousYearPayments);
        }

        if (previewText) {
            if (!previewNextWeek) {
                previewText.innerHTML = "<strong>No preview.</strong> You're viewing finished payment weeks from the last 6 months.";
            } else {
                const previewSegmentCount = getCompletedHistoryPaymentSegments().length;
                previewText.innerHTML = `<strong>Next week estimate.</strong> Based on ${previewSegmentCount} finished load leg${previewSegmentCount === 1 ? "" : "s"} in History, next week's estimated payment is ${formatMoney(nextWeekEstimate)}. Finished payment weeks from the last 6 months are shown below.`;
            }
        }

        if (previewToggleButton) {
            previewToggleButton.textContent = previewNextWeek ? "Hide next week preview" : "Preview next week estimate";
        }
    }

    function renderPaymentsPage() {
        renderPaymentSummary();
        renderPaymentRows();
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => activatePane(button.dataset.target));
    });

    previewToggleButton?.addEventListener("click", () => {
        previewNextWeek = !previewNextWeek;
        renderPaymentsPage();
    });

    searchInput?.addEventListener("input", (event) => {
        searchTerm = event.target.value.trim().toLowerCase();
        renderPaymentRows();
    });

    statusFilter?.addEventListener("change", (event) => {
        statusValue = event.target.value;
        renderPaymentRows();
    });

    window.addEventListener("focus", renderPaymentsPage);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            renderPaymentsPage();
        }
    });

    activatePane("payments-pane-main");
    renderPaymentsPage();
});
