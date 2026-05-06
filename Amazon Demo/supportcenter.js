document.addEventListener("DOMContentLoaded", () => {
    const SUPPORT_CASES_STORAGE_KEY = "amazonDemoSupportCases";
    const SUPPORT_CASE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const ASSET_EDIT_TOPIC = "Asset Edit";
    const OTHER_TOPIC = "Other";
    const DDU_SUPPORT_TOPIC = "DDU Support";
    const RELAY_ACCOUNT_TOPIC = "Relay Account Support";
    const RELAY_APP_WEB_TOPIC = "Relay App & Web Portal Tech Support";
    const SHORT_TERM_CONTRACTS_TOPIC = "Short-Term Contracts";
    const INSURANCE_COMPLIANCE_TOPIC = "Insurance Compliance";
    const DEALS_DISCOUNT_TOPIC = "Deals & Discount Support";
    const RELAY_DRIVER_VERIFICATION_TOPIC = "Relay Driver Verification Dispute";
    const RELAY_TRIP_COMPLETION_TOPIC = "Relay Trip Completion Status Dispute";
    const RELAY_PAYMENT_TOPIC = "Relay Payment Support";
    const RELAY_DRIVER_ASSIGNMENT_TOPIC = "CC - Relay Driver Assignment Support";
    const BROKERAGE_DISPUTE_TOPIC = "Brokerage Dispute";
    const IN_TRANSIT_TRIP_TOPIC = "In Transit Trip Issue (Request a Callback)";
    const SITE_ESCALATIONS_TOPIC = "Site Escalations";
    const RELAY_SAFETY_REWARDS_TOPIC = "CC - Relay safety rewards";
    const RELAY_AUCTIONS_TOPIC = "CC - Relay Auctions Support";
    const ASSET_EDIT_TEMPLATE = `Requests to edit existing assets on your company's Assets page, such as License plate, Type or Ownership.

Please note: Your company can self-serve importing new assets and deleting existing assets on the Assets page.

Duplicate tickets will slow down case review. Please allow 5 business days for a response. See FAQs and training for more guidance.

If you wish to open a ticket, please fill in the information below
--
SCAC:
License plate number:
VIN:
Explain the issue here:`;
    const OTHER_TEMPLATE = `For issues or questions that are not addressed in the list, use this option. To ensure you receive the fastest support, please review the topics prior to using this option
-----------------------------------------------------------------
-
Topic (What's your issue about) :
SCAC:
VRID/Tour/Block/Contract ID:
Explain the issue here:`;
    const DDU_SUPPORT_TEMPLATE = `Issues on Sort Center to DDUs including DDU not open, load returning to SC, mis-labeled pallets, etc.
-----------------------------------------------------------------
-
Carrier:
Facility Sequence:
VRID:
Destination:
CPT:
Pallet No (99M label):
Explain the issue here:`;
    const RELAY_ACCOUNT_TEMPLATE = `Issues related to Relay carrier account, excluding Insurance suspension inquiries (use Insurance Compliance). Examples include: domicile updates, account ownership changes, Relay portal or Relay for Driver app questions, general account or training inquiries.
-----------------------------------------------------------------
-
SCAC:
Explain the issue here:`;
    const RELAY_APP_WEB_TEMPLATE = `For reporting and troubleshooting issues related to Relay mobile app and portal functionality
-----------------------------------------------------------------
Topic (What's your issue about) :
SCAC:
VRID/Tour/Block/Contract ID:
Explain the issue here:`;
    const SHORT_TERM_CONTRACTS_TEMPLATE = `Any issues or questions related to Relay's contracts, like access to book contracts, contract training, box truck contract rejections, or general contract questions.

Only box truck contract rejections require a new case. Your company can reject other contracts on the Contracts page. All rejections impact your performance score.
-----------------------------------------------------------------
-
SCAC:
Contract ID (if applicable):
Block ID (if applicable):
Explain the issue here:`;
    const INSURANCE_COMPLIANCE_TEMPLATE = `Relay Account has been suspended due to insurance compliance; requesting support to update account.
-----------------------------------------------------------------
SCAC:
Please provide a brief description of the compliance/insurance/suspension issue.`;
    const DEALS_DISCOUNT_TEMPLATE = `Inquiry regarding a current Deals & Discounts program
-----------------------------------------------------------------
Topic (What's your issue about) :
SCAC:
Service/Program:
Explain the issue here:`;
    const RELAY_DRIVER_VERIFICATION_TEMPLATE = `For questions regarding specific driver selfie mis-matches, please specify details

VRID(s) referred:
SCAC:
Driver email associated to Relay account:
Carrier justification for driver mis-match:
Explain the issue here:`;
    const RELAY_TRIP_COMPLETION_TEMPLATE = `To dispute when a trip doesn't close out
-----------------------------------------------------------------
-
Required Information for Trip Status Dispute
* SCAC:
* VRID(s):
* Trailer Numbers (if applicable):
* Tractor License Plate:
* Explanation for missing time stamps:

Please attach any supporting documents, including a Bill of Lading, and screenshots when submitting cases.`;
    const RELAY_PAYMENT_TEMPLATE = `Have you submitted a payment dispute and you still need assistance? We are here to help. Please submit your Case ID number and/or Invoice number for support.
NOTE: We will only accept payment inquiries from primary admins. Cases created by non-primary admins will be closed.
-----------------------------------------------------------------
-
Topic (What's your issue about) :
Invoice #:
Dispute Case #:
VRID:
Contract ID (if applicable):

Please attach any supporting documents and screenshots when submitting cases.`;
    const RELAY_DRIVER_ASSIGNMENT_TEMPLATE = `For questions regarding driver assignment support ineligibility on a trip due to their other assignments in Relay, first refer to Relay FAQs:
https://relay.amazon.com/cases/sc/help/search?query=JTIyUmVsYXklMjBEcmI2ZXIlMjBBc3NpZ25tZW50JTIwU3VwcG9ydCUyMg==

If you still wish to open a ticket, please fill in the information below
-----------------------------------------------------------------
-
Driver ID/ Email:
Carrier SCAC:
Impacted Load ID/s where you are unable to assign a driver:
Explain the issue here:`;
    const RELAY_SAFETY_REWARDS_TEMPLATE = `Before creating the ticket, please see the FAQs in support center for common program related questions. If you cannot find answer to your questions then open a ticket.

If you wish to open a ticket, please fill in the information below
Issue description:
SCAC:
Explain the issue here:`;
    const BROKERAGE_DISPUTE_TEMPLATE = `After an internal investigation of your account, it has come to our attention that your company has operated in violation of Section I.E.2.b (below) of the Amazon Relay Program Policies Overview, by assigning, selling, subcontracting or brokering, or double brokering, services, unless otherwise permitted in writing.
If you believe this decision has been made in error, you have 30-days to submit documentation to refute it. In the case of rental equipment, an example of appropriate supporting documentation would be a signed rental agreement for non-company tractors used, a copy of the FMCSA required receipt (49 CFR 376.11(b))https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-376#p-376.12(j), and proof that this specific rental equipment was insured by the carrier (49 CFR 376.12(j))https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-376#p-376.12(j). If the provided lease agreement does not include both VIN and License Plate number of the leased equipment, a copy of the Vehicle Registration Cab Card will be required. Please note that failure to timely resolve these matters may result in suspension or termination of your company's ability to participate in the Amazon Relay Program as well as being prohibited from booking any future work with Amazon.

Section I.E.2.b expressly states:
"UNLESS OTHERWISE PERMITTED IN WRITING, YOUR COMPANY IS NOT PERMITTED TO ASSIGN, SELL, SUBCONTRACT OR OTHERWISE BROKER OR DOUBLE BROKER SERVICES UNDER THIS AGREEMENT."
-----------------------------------------------------------------
SCAC:
Explain why this decision was made in error:
Supporting documentation summary:`;
    const SITE_ESCALATIONS_TEMPLATE = `For reporting experience issues at sites including safety concerns and site management behavior. For immediate support contact the ROC by requesting a callback. In-transit issues can be reported directly on the Trips page.
-----------------------------------------------------------------
-
Topic (What's your issue about) :
SCAC:
VRID:
Location (site name):
Explain the issue here:`;
    const SUPPORT_TOPIC_TEMPLATES = {
        [ASSET_EDIT_TOPIC]: ASSET_EDIT_TEMPLATE,
        [OTHER_TOPIC]: OTHER_TEMPLATE,
        [DDU_SUPPORT_TOPIC]: DDU_SUPPORT_TEMPLATE,
        [RELAY_ACCOUNT_TOPIC]: RELAY_ACCOUNT_TEMPLATE,
        [RELAY_APP_WEB_TOPIC]: RELAY_APP_WEB_TEMPLATE,
        [SHORT_TERM_CONTRACTS_TOPIC]: SHORT_TERM_CONTRACTS_TEMPLATE,
        [INSURANCE_COMPLIANCE_TOPIC]: INSURANCE_COMPLIANCE_TEMPLATE,
        [DEALS_DISCOUNT_TOPIC]: DEALS_DISCOUNT_TEMPLATE,
        [RELAY_DRIVER_VERIFICATION_TOPIC]: RELAY_DRIVER_VERIFICATION_TEMPLATE,
        [RELAY_TRIP_COMPLETION_TOPIC]: RELAY_TRIP_COMPLETION_TEMPLATE,
        [RELAY_PAYMENT_TOPIC]: RELAY_PAYMENT_TEMPLATE,
        [RELAY_DRIVER_ASSIGNMENT_TOPIC]: RELAY_DRIVER_ASSIGNMENT_TEMPLATE,
        [RELAY_SAFETY_REWARDS_TOPIC]: RELAY_SAFETY_REWARDS_TEMPLATE,
        [BROKERAGE_DISPUTE_TOPIC]: BROKERAGE_DISPUTE_TEMPLATE,
        [SITE_ESCALATIONS_TOPIC]: SITE_ESCALATIONS_TEMPLATE
    };
    const SUPPORT_TOPIC_REQUIRED_FIELDS = {
        [ASSET_EDIT_TOPIC]: [
            "SCAC",
            "License plate number",
            "VIN",
            "Explain the issue here"
        ],
        [OTHER_TOPIC]: [
            "Topic (What's your issue about)",
            "SCAC",
            "VRID/Tour/Block/Contract ID",
            "Explain the issue here"
        ],
        [DDU_SUPPORT_TOPIC]: [
            "Carrier",
            "Facility Sequence",
            "VRID",
            "Destination",
            "CPT",
            "Pallet No (99M label)",
            "Explain the issue here"
        ],
        [RELAY_ACCOUNT_TOPIC]: [
            "SCAC",
            "Explain the issue here"
        ],
        [RELAY_APP_WEB_TOPIC]: [
            "Topic (What's your issue about)",
            "SCAC",
            "VRID/Tour/Block/Contract ID",
            "Explain the issue here"
        ],
        [SHORT_TERM_CONTRACTS_TOPIC]: [
            "SCAC",
            "Explain the issue here"
        ],
        [INSURANCE_COMPLIANCE_TOPIC]: [
            "SCAC",
            "Please provide a brief description of the compliance/insurance/suspension issue."
        ],
        [DEALS_DISCOUNT_TOPIC]: [
            "Topic (What's your issue about)",
            "SCAC",
            "Service/Program",
            "Explain the issue here"
        ],
        [RELAY_DRIVER_VERIFICATION_TOPIC]: [
            "VRID(s) referred",
            "SCAC",
            "Driver email associated to Relay account",
            "Carrier justification for driver mis-match",
            "Explain the issue here"
        ],
        [RELAY_TRIP_COMPLETION_TOPIC]: [
            "SCAC",
            "VRID(s)",
            "Tractor License Plate",
            "Explanation for missing time stamps"
        ],
        [RELAY_PAYMENT_TOPIC]: [
            "Topic (What's your issue about)",
            "Invoice #",
            "Dispute Case #",
            "VRID"
        ],
        [RELAY_DRIVER_ASSIGNMENT_TOPIC]: [
            "Driver ID/ Email",
            "Carrier SCAC",
            "Impacted Load ID/s where you are unable to assign a driver",
            "Explain the issue here"
        ],
        [RELAY_SAFETY_REWARDS_TOPIC]: [
            "Issue description",
            "SCAC",
            "Explain the issue here"
        ],
        [BROKERAGE_DISPUTE_TOPIC]: [
            "SCAC",
            "Explain why this decision was made in error"
        ],
        [SITE_ESCALATIONS_TOPIC]: [
            "Topic (What's your issue about)",
            "SCAC",
            "VRID",
            "Location (site name)",
            "Explain the issue here"
        ]
    };
    const SUPPORT_TOPICS = [
        ASSET_EDIT_TOPIC,
        OTHER_TOPIC,
        DDU_SUPPORT_TOPIC,
        RELAY_ACCOUNT_TOPIC,
        RELAY_APP_WEB_TOPIC,
        SHORT_TERM_CONTRACTS_TOPIC,
        INSURANCE_COMPLIANCE_TOPIC,
        DEALS_DISCOUNT_TOPIC,
        RELAY_DRIVER_VERIFICATION_TOPIC,
        RELAY_TRIP_COMPLETION_TOPIC,
        RELAY_PAYMENT_TOPIC,
        RELAY_DRIVER_ASSIGNMENT_TOPIC,
        BROKERAGE_DISPUTE_TOPIC,
        IN_TRANSIT_TRIP_TOPIC,
        SITE_ESCALATIONS_TOPIC,
        RELAY_SAFETY_REWARDS_TOPIC,
        RELAY_AUCTIONS_TOPIC
    ];
    const SUPPORT_CENTER_CASE_ID_VERSION = "demo-support-center-v2";
    const DEFAULT_OPEN_CASES = [
        {
            id: "20058492037",
            status: "open",
            reason: "Relay Payment Support",
            subject: "[Relay Payment Support][Brokerage][AHZCW][USA][Week 17]",
            issueDescription: "The user opened a Relay Payment Support case for brokerage week 17.",
            phone: "",
            attachments: [],
            source: "Support Center",
            idSource: SUPPORT_CENTER_CASE_ID_VERSION,
            createdAt: "2026-04-24T09:00:00",
            updatedAt: "2026-04-24T09:00:00"
        },
        {
            id: "20041763852",
            status: "open",
            reason: "Relay Account Support",
            subject: "[Bank Account Update][AHZCW]",
            issueDescription: "The user opened a bank account update case.",
            phone: "",
            attachments: [],
            source: "Support Center",
            idSource: SUPPORT_CENTER_CASE_ID_VERSION,
            createdAt: "2026-04-23T09:00:00",
            updatedAt: "2026-04-24T09:00:00"
        }
    ];

    const openTitle = document.querySelector("[data-support-open-title]");
    const openTable = document.querySelector("[data-support-open-table]");
    const openBody = document.querySelector("[data-support-open-body]");
    const openEmpty = document.querySelector("[data-support-open-empty]");

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function hashSupportCaseSeed(seed) {
        return String(seed || "").split("").reduce((hash, character) => (
            ((hash * 31) + character.charCodeAt(0)) % 100000000
        ), 17391);
    }

    function buildStoredSupportCenterCaseId(supportCase, usedIds) {
        let numericSeed = hashSupportCaseSeed([
            supportCase?.createdAt,
            supportCase?.subject,
            supportCase?.issueDescription
        ].join("|"));
        let caseId = "";

        do {
            caseId = `200${String(numericSeed).padStart(8, "0").slice(-8)}`;
            numericSeed = (numericSeed + 7919) % 100000000;
        } while (usedIds.has(caseId));

        return caseId;
    }

    function normalizeStoredSupportCases(cases) {
        const usedIds = new Set(DEFAULT_OPEN_CASES.map((supportCase) => supportCase.id));

        return cases.map((supportCase) => {
            const nextCase = { ...(supportCase || {}) };
            const source = String(nextCase.source || "Support Center");
            const shouldUseSupportCenterId = source !== "Relay Assistant";

            if (
                shouldUseSupportCenterId
                && (!/^200\d{8}$/.test(nextCase.id || "") || nextCase.idSource !== SUPPORT_CENTER_CASE_ID_VERSION)
            ) {
                nextCase.id = buildStoredSupportCenterCaseId(nextCase, usedIds);
                nextCase.idSource = SUPPORT_CENTER_CASE_ID_VERSION;
            }

            if (nextCase.id) {
                usedIds.add(nextCase.id);
            }

            return nextCase;
        });
    }

    function readSupportCases() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(SUPPORT_CASES_STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? normalizeStoredSupportCases(parsed) : [];
        } catch (error) {
            console.warn("Unable to read support cases.", error);
            return [];
        }
    }

    function saveSupportCases(cases) {
        try {
            sessionStorage.setItem(SUPPORT_CASES_STORAGE_KEY, JSON.stringify(cases));
        } catch (error) {
            console.warn("Unable to save support cases.", error);
        }
    }

    function getAllOpenCases() {
        const casesById = new Map();
        [...readSupportCases(), ...DEFAULT_OPEN_CASES].forEach((supportCase) => {
            if (supportCase?.id && !casesById.has(supportCase.id)) {
                casesById.set(supportCase.id, supportCase);
            }
        });
        return Array.from(casesById.values());
    }

    function formatCaseDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "--";
        }
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    }

    function normalizeIssueText(text) {
        return String(text || "").replace(/\s+/g, " ").trim();
    }

    function escapeRegExp(value) {
        return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function getTopicRequiredFields(topic) {
        return SUPPORT_TOPIC_REQUIRED_FIELDS[topic] || [];
    }

    function getTopicFieldValue(text, label, topic) {
        const requiredFields = getTopicRequiredFields(topic);
        const lines = String(text || "").split(/\r?\n/);
        const labelPattern = new RegExp(`^\\s*\\*?\\s*${escapeRegExp(label)}\\s*:?\\s*(.*)$`, "i");

        for (let index = 0; index < lines.length; index += 1) {
            const match = lines[index].match(labelPattern);
            if (!match) {
                continue;
            }

            const inlineValue = match[1].trim();
            if (inlineValue) {
                return inlineValue;
            }

            const followingLines = [];
            for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
                const nextLine = lines[nextIndex];
                const isNextField = requiredFields.some((fieldLabel) => (
                    new RegExp(`^\\s*\\*?\\s*${escapeRegExp(fieldLabel)}\\s*:`, "i").test(nextLine)
                ));
                if (isNextField) {
                    break;
                }
                if (/^\s*-{2,}\s*$/.test(nextLine)) {
                    continue;
                }
                followingLines.push(nextLine.trim());
            }

            return followingLines.join(" ").trim();
        }

        return "";
    }

    function getMissingTopicFields(topic, text) {
        return getTopicRequiredFields(topic).filter((label) => !getTopicFieldValue(text, label, topic));
    }

    function getTopicTemplate(topic) {
        return SUPPORT_TOPIC_TEMPLATES[topic] || "";
    }

    function topicUsesTemplate(topic) {
        return Boolean(getTopicTemplate(topic));
    }

    function topicHasTripsRedirect(topic) {
        return topic === IN_TRANSIT_TRIP_TOPIC;
    }

    function topicRequiresPhone(topic) {
        return Boolean(topic) && !topicUsesTemplate(topic) && topic !== RELAY_AUCTIONS_TOPIC && !topicHasTripsRedirect(topic);
    }

    function summarizeIssueText(text) {
        const cleanText = normalizeIssueText(text);
        if (!cleanText) {
            return "The user opened a support case but did not provide issue details.";
        }

        const words = cleanText.split(" ");
        const firstSentenceMatch = cleanText.match(/^(.{24,220}?[.!?])(?:\s|$)/);
        const briefText = firstSentenceMatch
            ? firstSentenceMatch[1]
            : words.slice(0, 30).join(" ");
        const needsEllipsis = !firstSentenceMatch && words.length > 30;
        return `The user is reporting: ${briefText}${needsEllipsis ? "..." : ""}`;
    }

    function buildSupportCaseSubject(topic, message) {
        if (topic === ASSET_EDIT_TOPIC) {
            const licensePlate = getTopicFieldValue(message, "License plate number", topic);
            const vin = getTopicFieldValue(message, "VIN", topic);
            const assetLabel = licensePlate || vin || "asset update";
            return `[Asset Edit] ${assetLabel}`;
        }

        if (topic === DDU_SUPPORT_TOPIC) {
            const vrid = getTopicFieldValue(message, "VRID", topic);
            const destination = getTopicFieldValue(message, "Destination", topic);
            return `[DDU Support] ${vrid || destination || "DDU issue"}`;
        }

        if (topic === RELAY_ACCOUNT_TOPIC) {
            const scac = getTopicFieldValue(message, "SCAC", topic);
            return `[Relay Account Support] ${scac || "account issue"}`;
        }

        if (topic === RELAY_APP_WEB_TOPIC || topic === OTHER_TOPIC) {
            const issueTopic = getTopicFieldValue(message, "Topic (What's your issue about)", topic);
            const issueId = getTopicFieldValue(message, "VRID/Tour/Block/Contract ID", topic);
            return `[${topic}] ${issueTopic || issueId || "support case"}`;
        }

        if (topic === SHORT_TERM_CONTRACTS_TOPIC) {
            const contractId = getTopicFieldValue(message, "Contract ID (if applicable)", topic);
            const blockId = getTopicFieldValue(message, "Block ID (if applicable)", topic);
            return `[Short-Term Contracts] ${contractId || blockId || "contract question"}`;
        }

        if (topic === INSURANCE_COMPLIANCE_TOPIC) {
            const scac = getTopicFieldValue(message, "SCAC", topic);
            return `[Insurance Compliance] ${scac || "insurance issue"}`;
        }

        if (topic === DEALS_DISCOUNT_TOPIC) {
            const serviceProgram = getTopicFieldValue(message, "Service/Program", topic);
            const issueTopic = getTopicFieldValue(message, "Topic (What's your issue about)", topic);
            return `[Deals & Discount Support] ${serviceProgram || issueTopic || "program question"}`;
        }

        if (topic === RELAY_DRIVER_VERIFICATION_TOPIC) {
            const vrids = getTopicFieldValue(message, "VRID(s) referred", topic);
            return `[Relay Driver Verification Dispute] ${vrids || "driver verification issue"}`;
        }

        if (topic === RELAY_TRIP_COMPLETION_TOPIC) {
            const vrids = getTopicFieldValue(message, "VRID(s)", topic);
            return `[Relay Trip Completion Status Dispute] ${vrids || "trip status dispute"}`;
        }

        if (topic === RELAY_PAYMENT_TOPIC) {
            const invoice = getTopicFieldValue(message, "Invoice #", topic);
            const disputeCase = getTopicFieldValue(message, "Dispute Case #", topic);
            return `[Relay Payment Support] ${disputeCase || invoice || "payment inquiry"}`;
        }

        if (topic === RELAY_DRIVER_ASSIGNMENT_TOPIC) {
            const loadIds = getTopicFieldValue(message, "Impacted Load ID/s where you are unable to assign a driver", topic);
            return `[Relay Driver Assignment Support] ${loadIds || "driver assignment issue"}`;
        }

        if (topic === RELAY_SAFETY_REWARDS_TOPIC) {
            const issue = getTopicFieldValue(message, "Issue description", topic);
            return `[Relay safety rewards] ${issue || "program issue"}`;
        }

        if (topic === BROKERAGE_DISPUTE_TOPIC) {
            const scac = getTopicFieldValue(message, "SCAC", topic);
            return `[Brokerage Dispute] ${scac || "brokerage review"}`;
        }

        if (topic === SITE_ESCALATIONS_TOPIC) {
            const site = getTopicFieldValue(message, "Location (site name)", topic);
            const issueTopic = getTopicFieldValue(message, "Topic (What's your issue about)", topic);
            return `[Site Escalations] ${site || issueTopic || "site issue"}`;
        }

        if (topic === RELAY_AUCTIONS_TOPIC) {
            return "[CC - Relay Auctions Support] Support request";
        }

        return summarizeIssueText(message);
    }

    function generateSupportCaseId(existingCases = getAllOpenCases()) {
        const usedIds = new Set(existingCases.map((supportCase) => supportCase.id));
        let caseId = "";

        do {
            let suffix = "";
            for (let index = 0; index < 8; index += 1) {
                suffix += Math.floor(Math.random() * 10);
            }
            caseId = `200${suffix}`;
        } while (usedIds.has(caseId));

        return caseId;
    }

    function formatAttachmentSize(size) {
        const numericSize = Number(size) || 0;
        if (numericSize >= 1048576) {
            return `${(numericSize / 1048576).toFixed(1)} MB`;
        }
        if (numericSize >= 1024) {
            return `${Math.round(numericSize / 1024)} KB`;
        }
        return `${numericSize} B`;
    }

    function readAttachmentFile(file) {
        return new Promise((resolve) => {
            const baseAttachment = {
                name: file?.name || "Attachment",
                type: file?.type || "Unknown file",
                size: file?.size || 0,
                sizeLabel: formatAttachmentSize(file?.size || 0)
            };

            if (!file || file.size > 262144 || typeof FileReader === "undefined") {
                resolve(baseAttachment);
                return;
            }

            try {
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    resolve({
                        ...baseAttachment,
                        dataUrl: typeof reader.result === "string" ? reader.result : ""
                    });
                });
                reader.addEventListener("error", () => resolve(baseAttachment));
                reader.addEventListener("abort", () => resolve(baseAttachment));
                reader.readAsDataURL(file);
            } catch (error) {
                console.warn("Unable to read support attachment.", error);
                resolve(baseAttachment);
            }
        });
    }

    function readAttachments(fileList) {
        return Promise.all(Array.from(fileList || []).map(readAttachmentFile));
    }

    function activatePane(targetId) {
        const tabs = Array.from(document.querySelectorAll(".support-tab[data-target]"));
        const panes = Array.from(document.querySelectorAll(".support-pane"));

        tabs.forEach((tab) => {
            const isActive = tab.dataset.target === targetId;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        panes.forEach((pane) => {
            const active = pane.id === targetId;
            pane.hidden = !active;
            pane.classList.toggle("support-pane-active", active);
        });
    }

    function renderOpenCases() {
        if (!openTitle || !openTable || !openBody || !openEmpty) {
            return;
        }

        const openCases = getAllOpenCases();
        openTitle.textContent = `${openCases.length} open issue${openCases.length === 1 ? "" : "s"}`;
        openTable.hidden = !openCases.length;
        openEmpty.hidden = Boolean(openCases.length);

        openBody.innerHTML = openCases.map((supportCase) => `
            <tr data-support-case-id="${escapeHtml(supportCase.id)}">
                <td>${escapeHtml(supportCase.id)}</td>
                <td>${escapeHtml(supportCase.subject || supportCase.issueDescription || "Support case")}</td>
                <td>${formatCaseDate(supportCase.createdAt)}</td>
                <td>${formatCaseDate(supportCase.updatedAt || supportCase.createdAt)}</td>
            </tr>
        `).join("");

        openBody.querySelectorAll("[data-support-case-id]").forEach((row) => {
            row.addEventListener("click", () => {
                const supportCase = getAllOpenCases().find((entry) => entry.id === row.dataset.supportCaseId);
                if (supportCase) {
                    openCaseDetail(supportCase);
                }
            });
        });
    }

    function ensureSupportOverlay() {
        let overlay = document.getElementById("support-case-overlay");
        if (overlay) {
            return overlay;
        }

        overlay = document.createElement("div");
        overlay.id = "support-case-overlay";
        overlay.className = "support-case-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeSupportOverlay();
            }
        });
        return overlay;
    }

    function closeSupportOverlay() {
        const overlay = document.getElementById("support-case-overlay");
        if (overlay) {
            overlay.classList.remove("is-open");
            overlay.innerHTML = "";
        }
    }

    function buildAttachmentList(attachments) {
        if (!Array.isArray(attachments) || !attachments.length) {
            return "<p class=\"support-case-muted\">No attachments provided.</p>";
        }

        return `
            <ul class="support-case-attachments">
                ${attachments.map((attachment) => `
                    <li>
                        ${attachment.dataUrl
                            ? `<a href="${escapeHtml(attachment.dataUrl)}" download="${escapeHtml(attachment.name)}">${escapeHtml(attachment.name)}</a>`
                            : `<span>${escapeHtml(attachment.name)}</span>`}
                        <small>${escapeHtml(attachment.sizeLabel || formatAttachmentSize(attachment.size))}</small>
                    </li>
                `).join("")}
            </ul>
        `;
    }

    function openCaseDetail(supportCase) {
        const overlay = ensureSupportOverlay();
        overlay.classList.add("is-open");
        overlay.innerHTML = `
            <section class="support-case-dialog support-case-detail-dialog">
                <header class="support-case-head">
                    <strong>Support case ${escapeHtml(supportCase.id)}</strong>
                    <button type="button" data-support-close aria-label="Close support case">&times;</button>
                </header>
                <div class="support-case-body">
                    <div class="support-case-status-line">
                        <span>Open</span>
                        <strong>${escapeHtml(supportCase.reason || "Support request")}</strong>
                    </div>
                    <dl class="support-case-detail-grid">
                        <div><dt>Subject</dt><dd>${escapeHtml(supportCase.subject || "Support case")}</dd></div>
                        <div><dt>Created</dt><dd>${formatCaseDate(supportCase.createdAt)}</dd></div>
                        <div><dt>Last updated</dt><dd>${formatCaseDate(supportCase.updatedAt || supportCase.createdAt)}</dd></div>
                        ${supportCase.phone ? `<div><dt>Phone</dt><dd>${escapeHtml(supportCase.phone)}</dd></div>` : ""}
                        ${supportCase.additionalRecipients ? `<div><dt>Additional recipients</dt><dd>${escapeHtml(supportCase.additionalRecipients)}</dd></div>` : ""}
                        ${supportCase.loadCode ? `<div><dt>Load</dt><dd>${escapeHtml(supportCase.loadCode)}</dd></div>` : ""}
                        ${supportCase.source ? `<div><dt>Source</dt><dd>${escapeHtml(supportCase.source)}</dd></div>` : ""}
                    </dl>
                    <section class="support-case-section">
                        <h3>Issue description</h3>
                        <p>${escapeHtml(supportCase.issueDescription || supportCase.subject || "")}</p>
                    </section>
                    <section class="support-case-section">
                        <h3>Attachments</h3>
                        ${buildAttachmentList(supportCase.attachments)}
                    </section>
                </div>
            </section>
        `;
        overlay.querySelector("[data-support-close]")?.addEventListener("click", closeSupportOverlay);
    }

    function buildTopicOptions(selectedTopic = "") {
        return `
            <option value="">Select topic</option>
            ${SUPPORT_TOPICS.map((topic) => `<option value="${escapeHtml(topic)}"${topic === selectedTopic ? " selected" : ""}>${escapeHtml(topic)}</option>`).join("")}
        `;
    }

    function isValidPhone(value) {
        return /^\d{3}-\d{3}-\d{4}$/.test(String(value || ""));
    }

    function formatPhoneInput(value) {
        const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
        if (digits.length <= 3) {
            return digits;
        }
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    function renderTripsRedirectPanel() {
        return `
            <div class="support-case-trip-redirect" data-support-trip-redirect hidden>
                <p><strong>We're improving our process to help you faster.</strong><br>Easier in-transit issue reporting directly from the Trips page.</p>
                <div class="support-case-trip-preview" aria-hidden="true">
                    <div class="support-case-trip-preview-card">
                        <div class="support-case-trip-preview-dots"><span></span><span></span><span></span></div>
                        <div class="support-case-trip-preview-line"></div>
                        <div class="support-case-trip-preview-line"></div>
                        <div class="support-case-trip-preview-action"><span>&#8594;</span><strong>Request trip support</strong></div>
                    </div>
                </div>
                <button type="button" data-support-go-trips>Go to Trips</button>
            </div>
        `;
    }

    function updateCreateCaseTopicFields(form) {
        const topic = form.elements.topic.value;
        const message = form.elements.message;
        const template = getTopicTemplate(topic);
        const previousTemplate = message.dataset.topicTemplate || "";
        const previousTopic = form.dataset.supportTopic || "";
        const isNewTemplateSelection = topicUsesTemplate(topic) && previousTopic !== topic;
        const canReplaceMessage = !message.value.trim() || message.value === previousTemplate || isNewTemplateSelection;
        const isTripsRedirect = topicHasTripsRedirect(topic);
        const phoneField = form.querySelector("[data-support-phone-field]");
        const messageField = form.querySelector("[data-support-message-field]");
        const additionalField = form.querySelector("[data-support-additional-field]");
        const attachmentsField = form.querySelector("[data-support-attachments-field]");
        const attachmentsList = form.querySelector("[data-support-attachments]");
        const alert = form.querySelector("[data-support-form-alert]");
        const actions = form.querySelector("[data-support-actions]");
        const submit = form.querySelector("[data-support-submit]");
        const tripRedirect = form.querySelector("[data-support-trip-redirect]");

        if (tripRedirect) {
            tripRedirect.hidden = !isTripsRedirect;
        }

        [messageField, phoneField, additionalField, attachmentsField, attachmentsList, alert].forEach((element) => {
            if (element) {
                element.hidden = isTripsRedirect;
            }
        });

        if (actions) {
            actions.classList.toggle("support-case-actions-cancel-only", isTripsRedirect);
        }

        if (submit) {
            submit.hidden = isTripsRedirect;
        }

        if (isTripsRedirect) {
            message.value = "";
            message.required = false;
            message.classList.remove("is-invalid");
            form.elements.phone.required = false;
            form.elements.phone.value = "";
            form.elements.phone.classList.remove("is-invalid");
            message.dataset.topicTemplate = "";
            form.dataset.supportTopic = topic;
            return;
        }

        message.required = true;

        if (template && canReplaceMessage) {
            message.value = template;
        } else if (!template && previousTemplate && message.value === previousTemplate) {
            message.value = "";
        }

        message.dataset.topicTemplate = template;
        form.dataset.supportTopic = topic;
        message.placeholder = template ? "" : "Type your message here...";

        if (phoneField) {
            const requiresPhone = topicRequiresPhone(topic);
            phoneField.hidden = !requiresPhone;
            form.elements.phone.required = requiresPhone;
            if (!requiresPhone) {
                form.elements.phone.value = "";
                form.elements.phone.classList.remove("is-invalid");
            }
        }
    }

    function validateCreateCaseForm(form, showErrors = false) {
        const topic = form.elements.topic;
        const message = form.elements.message;
        const phone = form.elements.phone;
        const alert = form.querySelector("[data-support-form-alert]");
        const submit = form.querySelector("[data-support-submit]");
        const hasTopic = Boolean(topic.value);
        const isTripsRedirect = topicHasTripsRedirect(topic.value);
        const isTemplatedTopic = topicUsesTemplate(topic.value);
        const files = Array.from(form.elements.attachments?.files || []);
        const missingTopicFields = isTemplatedTopic ? getMissingTopicFields(topic.value, message.value) : [];
        const hasMessage = Boolean(message.value.trim()) && !missingTopicFields.length;
        const hasPhone = !topicRequiresPhone(topic.value) || isValidPhone(phone.value.trim());
        const hasAllowedAttachmentCount = files.length <= 9;
        const isValid = !isTripsRedirect && hasTopic && hasMessage && hasPhone && hasAllowedAttachmentCount;

        topic.classList.toggle("is-invalid", showErrors && !hasTopic);
        message.classList.toggle("is-invalid", showErrors && !hasMessage);
        phone.classList.toggle("is-invalid", showErrors && !hasPhone);

        if (alert) {
            if (isTripsRedirect || !showErrors || isValid) {
                alert.textContent = "";
            } else if (!hasAllowedAttachmentCount) {
                alert.textContent = "Attach up to 9 files before submitting.";
            } else if (isTemplatedTopic && missingTopicFields.length) {
                alert.textContent = `Fill in ${missingTopicFields.join(", ")} before submitting this case.`;
            } else {
                alert.textContent = "Select a topic, describe the issue, and enter the phone number as 000-000-0000.";
            }
        }

        if (submit) {
            submit.disabled = !isValid;
        }

        return isValid;
    }

    function updateCreateAttachmentList(form) {
        const output = form.querySelector("[data-support-attachments]");
        const files = Array.from(form.elements.attachments?.files || []);
        if (output) {
            output.textContent = files.length
                ? files.map((file) => `${file.name} (${formatAttachmentSize(file.size)})`).join(", ")
                : "No attachments selected";
        }
        form.elements.attachments?.classList.toggle("is-invalid", files.length > 9);
    }

    function openCreateCaseModal(selectedTopic = "") {
        const overlay = ensureSupportOverlay();
        overlay.classList.add("is-open");
        overlay.innerHTML = `
            <section class="support-case-dialog support-case-create-dialog">
                <header class="support-case-head">
                    <strong>Submit a New Case to Customer Support</strong>
                    <button type="button" data-support-close aria-label="Close support form">&times;</button>
                </header>
                <form class="support-case-form" data-support-create-form novalidate>
                    <p>Fill out the form below and we will respond by email. A copy of your message will be sent by email to <strong>tageneralfreight@gmail.com</strong></p>
                    <label>
                        <span class="sr-only">Select topic</span>
                        <select name="topic" required>${buildTopicOptions(selectedTopic)}</select>
                    </label>
                    ${renderTripsRedirectPanel()}
                    <label data-support-message-field>
                        <span class="sr-only">Type your message here</span>
                        <textarea name="message" rows="6" placeholder="Type your message here..." required></textarea>
                    </label>
                    <label data-support-phone-field>
                        <span>Phone number</span>
                        <input name="phone" type="tel" inputmode="numeric" maxlength="12" placeholder="000-000-0000" required>
                    </label>
                    <label data-support-additional-field>
                        <span class="sr-only">Copy additional recipients optional</span>
                        <input name="additionalRecipients" type="text" placeholder="Copy additional recipients (optional):">
                    </label>
                    <label data-support-attachments-field>
                        <span>Attach up to 9 files:</span>
                        <input name="attachments" type="file" multiple>
                    </label>
                    <div class="support-case-selected-files" data-support-attachments>No attachments selected</div>
                    <div class="support-case-form-alert" data-support-form-alert></div>
                    <div class="support-case-actions" data-support-actions>
                        <button type="button" data-support-close>Cancel</button>
                        <button type="submit" data-support-submit disabled>Submit</button>
                    </div>
                </form>
            </section>
        `;

        overlay.querySelectorAll("[data-support-close]").forEach((button) => {
            button.addEventListener("click", closeSupportOverlay);
        });
        overlay.querySelector("[data-support-go-trips]")?.addEventListener("click", () => {
            window.location.href = "trips.html";
        });

        const form = overlay.querySelector("[data-support-create-form]");
        form.elements.topic.addEventListener("change", () => {
            updateCreateCaseTopicFields(form);
            validateCreateCaseForm(form);
        });
        form.elements.message.addEventListener("input", () => validateCreateCaseForm(form));
        form.elements.phone.addEventListener("input", () => {
            form.elements.phone.value = formatPhoneInput(form.elements.phone.value);
            validateCreateCaseForm(form);
        });
        form.elements.additionalRecipients.addEventListener("input", () => validateCreateCaseForm(form));
        form.elements.attachments.addEventListener("change", () => {
            updateCreateAttachmentList(form);
            const tooManyAttachments = Array.from(form.elements.attachments?.files || []).length > 9;
            validateCreateCaseForm(form, tooManyAttachments);
        });
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!validateCreateCaseForm(form, true)) {
                return;
            }

            const submit = form.querySelector("[data-support-submit]");
            submit.disabled = true;
            submit.textContent = "Submitting...";

            try {
                const existingCases = readSupportCases();
                const now = new Date().toISOString();
                const message = form.elements.message.value.trim();
                const topic = form.elements.topic.value;
                const supportCase = {
                    id: generateSupportCaseId(),
                    status: "open",
                    reason: topic,
                    subject: buildSupportCaseSubject(topic, message),
                    issueDescription: message,
                    phone: form.elements.phone.value.trim(),
                    additionalRecipients: normalizeIssueText(form.elements.additionalRecipients.value),
                    attachments: await readAttachments(form.elements.attachments?.files),
                    source: "Support Center",
                    idSource: SUPPORT_CENTER_CASE_ID_VERSION,
                    createdAt: now,
                    updatedAt: now
                };

                saveSupportCases([supportCase, ...existingCases]);
                renderOpenCases();
                activatePane("support-pane-open");
                closeSupportOverlay();
                openCaseDetail(supportCase);
            } catch (error) {
                console.warn("Unable to submit support case.", error);
                submit.textContent = "Submit";
                validateCreateCaseForm(form, true);
                const alert = form.querySelector("[data-support-form-alert]");
                if (alert) {
                    alert.textContent = "The case could not be submitted. Please try again.";
                }
            }
        });

        updateCreateCaseTopicFields(form);
        validateCreateCaseForm(form);
        updateCreateAttachmentList(form);
    }

    function viewCaseFromSearch() {
        const input = document.querySelector("#support-pane-open [data-support-case-search]");
        const caseId = input?.value.trim();
        if (!caseId) {
            input?.focus();
            return;
        }

        const supportCase = getAllOpenCases().find((entry) => entry.id.toLowerCase() === caseId.toLowerCase());
        if (supportCase) {
            openCaseDetail(supportCase);
            return;
        }

        input.setCustomValidity("Case not found");
        input.reportValidity();
        window.setTimeout(() => input.setCustomValidity(""), 1000);
    }

    document.querySelectorAll("[data-support-create-case]").forEach((button) => {
        button.addEventListener("click", () => openCreateCaseModal());
    });

    document.querySelector("[data-support-view-case]")?.addEventListener("click", viewCaseFromSearch);
    document.querySelector("#support-pane-open [data-support-case-search]")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            viewCaseFromSearch();
        }
    });

    renderOpenCases();

    const params = new URLSearchParams(window.location.search);
    if (params.get("pane") === "open" || params.get("caseId")) {
        activatePane("support-pane-open");
    }

    const requestedCaseId = params.get("caseId");
    if (requestedCaseId) {
        const supportCase = getAllOpenCases().find((entry) => entry.id.toLowerCase() === requestedCaseId.toLowerCase());
        const input = document.querySelector("#support-pane-open [data-support-case-search]");
        if (input) {
            input.value = requestedCaseId;
        }
        if (supportCase) {
            openCaseDetail(supportCase);
        }
    }
});
