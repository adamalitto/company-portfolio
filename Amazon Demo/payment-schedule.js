(function () {
    const PAYMENT_WEEKS_PER_YEAR = 53;
    const BASE_WEEKLY_PAYMENT_PATTERN = [
        28156.92,
        8797.26,
        20844.75,
        27347.95,
        40652.26,
        18443.14,
        22973.24,
        22689.87,
        36983.68,
        24588.52,
        19876.33,
        31244.06,
        17650.84,
        33720.45,
        29108.39,
        22405.18,
        38644.72,
        15892.66,
        26418.91,
        30176.33,
        21755.09,
        42106.58,
        19688.47,
        25542.70,
        34630.11,
        14325.62,
        28894.05,
        37618.22,
        23971.64,
        32509.88,
        19954.16,
        27483.35,
        35806.41,
        16642.93,
        29447.80,
        41185.24,
        23196.55,
        18736.49,
        31892.72,
        26951.08,
        35204.19,
        20583.67,
        24418.50,
        39960.34,
        17296.86,
        28416.27,
        33158.95,
        21903.42,
        30271.69,
        37246.15,
        19345.88,
        25709.31,
        34016.76
    ];

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

    function roundMoney(value) {
        return Math.round((Number(value) || 0) * 100) / 100;
    }

    function hashString(value) {
        return String(value || "").split("").reduce((hash, character) => (
            ((hash * 33) + character.charCodeAt(0)) >>> 0
        ), 2166136261);
    }

    function buildPaymentId(paymentYear, weekNumber) {
        const hash = hashString(`${paymentYear}:${weekNumber}:relay-payment`);
        return `...${(hash % 1679616).toString(36).toUpperCase().padStart(4, "0")}`;
    }

    function getAnnualPaymentAmount(paymentYear, weekIndex) {
        const baseAmount = BASE_WEEKLY_PAYMENT_PATTERN[weekIndex % BASE_WEEKLY_PAYMENT_PATTERN.length];
        const seasonalLift = 1 + (Math.sin(((weekIndex + 1) / PAYMENT_WEEKS_PER_YEAR) * Math.PI * 2) * 0.055);
        const yearlyJitter = (((hashString(`${paymentYear}:${weekIndex}:amount`) % 901) - 450) / 10000);
        return roundMoney(Math.max(6500, baseAmount * seasonalLift * (1 + yearlyJitter)));
    }

    function buildAnnualPaymentRows(paymentYear) {
        const firstWorkWeekStart = getWeekStartSunday(new Date(paymentYear, 0, 1));

        return Array.from({ length: PAYMENT_WEEKS_PER_YEAR }, (_, weekIndex) => {
            const weekNumber = weekIndex + 1;
            const workStartDate = addDays(firstWorkWeekStart, weekIndex * 7);
            const workEndDate = addDays(workStartDate, 6);
            const invoiceDateValue = addDays(workEndDate, 4);
            const paymentDateValue = addDays(workEndDate, 6);

            return {
                id: buildPaymentId(paymentYear, weekNumber),
                paymentYear,
                weekNumber,
                workType: "Spot",
                workStartDate,
                workEndDate,
                invoiceDateValue,
                paymentDateValue,
                status: "Paid",
                amountValue: getAnnualPaymentAmount(paymentYear, weekIndex),
                ctaLabel: "View"
            };
        });
    }

    function getPreparedPaymentRowsAroundDate(date) {
        const year = startOfDay(date).getFullYear();
        return [year - 1, year, year + 1]
            .flatMap((paymentYear) => buildAnnualPaymentRows(paymentYear))
            .sort((left, right) => right.paymentDateValue - left.paymentDateValue);
    }

    function getFinishedPaymentRows(date) {
        const today = startOfDay(date);
        return getPreparedPaymentRowsAroundDate(today)
            .filter((row) => row.paymentDateValue <= today);
    }

    function getLastSixMonthsFinishedPaymentRows(date) {
        const today = startOfDay(date);
        const firstMonthStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        return getFinishedPaymentRows(today)
            .filter((row) => row.paymentDateValue >= firstMonthStart);
    }

    function getPaymentSummaryTotals(date) {
        const today = startOfDay(date);
        const currentYear = today.getFullYear();
        const previousYear = currentYear - 1;
        const finishedRows = getFinishedPaymentRows(today);

        const ytdPayments = finishedRows
            .filter((row) => row.paymentYear === currentYear && row.paymentDateValue <= today)
            .reduce((sum, row) => sum + row.amountValue, 0);

        const previousYearPayments = buildAnnualPaymentRows(previousYear)
            .reduce((sum, row) => sum + row.amountValue, 0);

        return {
            currentYear,
            previousYear,
            ytdPayments: roundMoney(ytdPayments),
            previousYearPayments: roundMoney(previousYearPayments)
        };
    }

    function buildLastSixMonthsSeries(date, monthFormatter) {
        const today = startOfDay(date);
        const rows = getLastSixMonthsFinishedPaymentRows(today);
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const buckets = [];

        for (let offset = 5; offset >= 0; offset -= 1) {
            const bucketDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - offset, 1);
            const monthKey = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
            buckets.push({
                key: monthKey,
                label: typeof monthFormatter === "function"
                    ? monthFormatter(bucketDate)
                    : bucketDate.toLocaleDateString("en-US", { month: "short" }),
                total: 0
            });
        }

        const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
        rows.forEach((row) => {
            const paymentDate = row.paymentDateValue;
            const monthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;
            const bucket = bucketMap.get(monthKey);
            if (bucket) {
                bucket.total += row.amountValue;
            }
        });

        return buckets.map((bucket) => ({
            ...bucket,
            total: roundMoney(bucket.total)
        }));
    }

    window.AmazonDemoPaymentSchedule = {
        PAYMENT_WEEKS_PER_YEAR,
        buildAnnualPaymentRows,
        getPreparedPaymentRowsAroundDate,
        getFinishedPaymentRows,
        getLastSixMonthsFinishedPaymentRows,
        getPaymentSummaryTotals,
        buildLastSixMonthsSeries
    };
}());
