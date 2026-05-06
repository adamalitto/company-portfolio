(() => {
    const TEACHER_STATE_KEY = "relayTeacherEnabled";
    const TEACHER_VOICE_KEY = "relayTeacherVoiceEnabled";
    const TEACHER_PANEL_KEY = "relayTeacherPanelOpen";
    const TEACHER_SEEN_PREFIX = "relayTeacherSeen:";

    const pageName = window.location.pathname.split("/").pop().toLowerCase() || "dashboard.html";
    const pageKey = pageName.replace(".html", "");
    const teacherName = "Mira";
    const MIRA_IMAGE_SRC = "Mira.png";
    const voiceOpeners = [
        "Nice, let's make this clean.",
        "Here is the smart move.",
        "Quick dispatcher tip.",
        "Perfect, watch this part.",
        "This is the Amazon way to read it."
    ];
    const feminineVoicePattern = /(zira|aria|jenny|ava|emma|joanna|kendra|kimberly|salli|samantha|victoria|susan|serena|karen|moira|tessa|fiona|allison|nicky|amy|joelle|ivy|tiffany|rachel|natasha|olivia|hazel|heather|lisa|melissa|female|woman)/i;
    const masculineVoicePattern = /(david|mark|george|daniel|alex|fred|tom|michael|guy|brian|ryan|male|man|paul|james|richard)/i;

    const pageGuides = {
        dashboard: {
            title: "Dashboard",
            intro: "This is your control tower. Watch trips needing attention, performance, payments, and the Baltimore load count before deciding where to work next.",
            steps: [
                { selector: ".welcome-card, .welcome-section", title: "Welcome block", body: "Use Add driver to go to Driver Roster and Add user to go to Site Users. Amazon expects people and permissions to be ready before dispatch work begins." },
                { selector: ".attention-card, [data-dashboard-attention], .dashboard-attention", title: "Trips needing attention", body: "These counts increase when a trip is missing a driver, tractor, trailer-required number, or an on-time check-in/check-out action." },
                { selector: ".dashboard-load-board, [data-dashboard-baltimore-loads], .loadboard-card", title: "Load Board count", body: "Baltimore load count reflects what is actually still available. Booking a Baltimore load removes it from the board and lowers this count." },
                { selector: ".performance-card, .score-card, .dashboard-scorecard", title: "Performance snapshot", body: "Performance shows how next week's score may look based on completed, rejected, disrupted, and on-time work." },
                { selector: ".income-card, canvas, .dashboard-chart", title: "Revenue chart", body: "Monthly totals match the Payments page. The demo keeps the numbers believable by rolling current-year weekly payments into monthly views." }
            ],
            quickTips: [
                "Start the day on Dashboard, then use the orange attention counts to decide whether Trips or Notifications needs work first.",
                "If a number is orange, Amazon is telling you a workflow needs action before it hurts performance."
            ]
        },
        loadboard: {
            title: "Load Board",
            intro: "This is where students practice finding spot work. Search filters narrow the board, Book moves a load to Trips, and Post A Truck creates an availability order.",
            steps: [
                { selector: "[data-loadboard-view-target='search'], .loadboard-tab", title: "Search tab", body: "Search is for actively choosing spot loads. Filters such as origin, radius, equipment, driver type, work type, and load type change which loads are available." },
                { selector: "[data-loadboard-view-target='post-truck'], [data-loadboard-view='post-truck']", title: "Post A Truck", body: "Post A Truck tells Amazon what equipment, city, schedule, and driver type you have. If Amazon matches it, the order can book a trip into Upcoming." },
                { selector: ".filters, .loadboard-filter-shell, .loadboard-search-panel", title: "Criteria", body: "Origin city and radius control the load count. Driver type matters: Solo and Team loads have different transit expectations." },
                { selector: ".load-row, .loadboard-row, [data-load-row]", title: "Load row", body: "A load row shows origin, destination, distance, driver type, equipment, load type, price, and price per mile. Multi-stop rows use numbered stop circles." },
                { selector: ".detail-panel, .load-detail-panel", title: "Booking panel", body: "Opening a load shows stops, addresses, pickup window, payout, and details. If pickup is adjustable, edit arrival before booking." },
                { selector: ".loadboard-footer-bar", title: "Footer controls", body: "Go to top scrolls up, Clear filters resets criteria, Refresh updates the board, Auto refresh cycles new results, and chat opens rate negotiation when available." }
            ],
            quickTips: [
                "Book only after checking equipment, pickup time, driver type, and payout. Once booked, the load leaves the board and appears in Trips.",
                "If a rate changed, refresh the Load Board before booking. Amazon wants you to review the new rate first."
            ]
        },
        trips: {
            title: "Trips",
            intro: "Trips is dispatch execution. Upcoming is planning, In Transit is live work, and History is completed, rejected, or canceled work.",
            steps: [
                { selector: ".trips-tabs, .trip-tabs, [data-trip-tab]", title: "Trip tabs", body: "Upcoming holds booked loads before execution. In Transit holds loads already started. History holds completed, rejected, and canceled loads." },
                { selector: ".trip-upcoming-card, .trip-card", title: "Trip card", body: "Every card shows load number, route, mileage, equipment, payout, driver type, and assignment status." },
                { selector: "[data-trip-assignment], [data-trip-segment-assignment]", title: "Assignments", body: "Assign eligible drivers and tractors before dispatch. Trailer-required loads also need the carrier trailer number inside the equipment detail area." },
                { selector: "[data-trip-time], .trip-time-edit-line, .trip-time-cell", title: "Check-in and check-out", body: "Times must be entered in order: pickup arrival, pickup departure, delivery arrival, delivery departure. Missing or late times can create attention tasks." },
                { selector: "[data-trip-delay], .trip-delay-trigger", title: "Report delay", body: "Report delay when you know a scheduled time will not be met. A proper delay report turns off the orange timing warning for that event." },
                { selector: "[data-trip-reject], .trip-reject-trigger", title: "Reject", body: "Reject appears only for Upcoming trips. Rejected loads move to History, do not need assignments, and affect next week's performance." },
                { selector: "[data-trip-assistant], .trip-assistant-trigger", title: "Ask a question", body: "Ask a question opens Relay Assistant. If it cannot understand the issue, it can help create a support case and write a note on the trip." }
            ],
            quickTips: [
                "History should be locked: completed loads keep the driver, tractor, and trailer they used.",
                "Blocks do not need early assignment because details are hidden until closer to start time."
            ]
        },
        notification: {
            title: "Notifications",
            intro: "Notifications turns dashboard problems into specific tasks. It names the load, explains the issue, and can send students directly to the affected trip.",
            steps: [
                { selector: ".tabs, .notification-tabs", title: "Tasks and notifications", body: "Tasks are actionable problems. Notifications are informational messages. Start with Tasks when the dashboard attention number is above zero." },
                { selector: ".task-card, .notification-card, #tasks-results", title: "Task cards", body: "Each task should show the load number and the exact issue, such as missing driver, missing tractor, or unreported timing problem." },
                { selector: "[data-open-trip], .notification-action-button", title: "Open trip", body: "Open Trip should navigate to the correct Trips tab and expand the affected load so the student can fix it quickly." }
            ],
            quickTips: [
                "Use Tasks as the checklist for protecting performance.",
                "If the task is about Upcoming, it should send you to Upcoming. If it is about In Transit, it should send you to In Transit."
            ]
        },
        driverroster: {
            title: "Driver Roster",
            intro: "Driver Roster controls who can be assigned. Eligible drivers can be used on Trips and Post A Truck; ineligible or deactivated drivers cannot.",
            steps: [
                { selector: ".driver-roster-toolbar, .filters", title: "Search and filters", body: "Search by name, email, or phone to find a driver. Load eligibility shows whether that driver can be assigned." },
                { selector: "[data-driver-add], #driver-roster-add-driver, .btn-primary", title: "Add driver", body: "Add Driver sends an invite by email. Domicile can be All or BWI in this demo because there is one domicile." },
                { selector: ".driver-row, .driver-roster-table tbody tr", title: "Driver rows", body: "Profile verified means ready. Reverification due, license expired, or deactivated means the driver cannot be assigned until fixed." },
                { selector: ".driver-row-menu, [data-driver-menu-toggle]", title: "Three-dot menu", body: "Deactivate makes a driver ineligible. Activate restores a deactivated driver. Delete removes the driver from the demo until refresh." }
            ],
            quickTips: [
                "Assignments pull from this roster, so a deactivated driver should disappear from Trips and Post A Truck dropdowns.",
                "Use fake training data only; never expose real driver credentials."
            ]
        },
        assets: {
            title: "Assets",
            intro: "Assets controls tractors and asset compliance. Tractor license plates here feed the Trips tractor dropdown.",
            steps: [
                { selector: ".assets-toolbar, .assets-filters", title: "Asset filters", body: "Search by unit, license plate, or VIN. Verification and California compliance filters help locate available equipment." },
                { selector: "[data-assets-add], #assets-add-button, .assets-add-button", title: "Add asset", body: "Add Asset submits a new asset for review. Required fields turn red only after a student touches or submits them empty." },
                { selector: "[data-assets-import], #assets-import-button, .assets-import-button", title: "Import assets", body: "Import Assets teaches spreadsheet upload. In the demo, submitting creates an under-review confirmation." },
                { selector: ".assets-row-menu, [data-asset-menu-toggle]", title: "Asset actions", body: "The three-dot menu can view equipment details, add a temporary asset, or delete the asset until refresh." }
            ],
            quickTips: [
                "Temporary assets can be used while standard review is pending, but they still need accurate plate, state, unit, and VIN information.",
                "Only realistic 5-digit unit numbers, realistic plates, and 17-character VINs should appear."
            ]
        },
        assetdetails: {
            title: "Asset Details",
            intro: "Asset Details is the evidence page for one tractor or box truck. It shows plate, VIN, ownership, verification, and Clean Truck Check.",
            steps: [
                { selector: ".asset-detail-topbar, .asset-detail-header", title: "Asset summary", body: "The top area confirms the unit number and eligibility status. Students use this to verify the tractor before assigning it." },
                { selector: ".asset-verification, .asset-detail-section", title: "Verification", body: "Verified means Amazon recognizes the equipment under the carrier authority." },
                { selector: ".clean-truck, .asset-detail-section", title: "Clean Truck Check", body: "CTC compliant means the asset can operate where compliance is required." },
                { selector: "[data-asset-temporary], .asset-actions", title: "Actions", body: "Actions can add a temporary asset or return to the asset list depending on the selected flow." }
            ],
            quickTips: [
                "Asset details teach students to verify equipment before dispatch, not after a load is already late."
            ]
        },
        contracts: {
            title: "Contracts",
            intro: "Contracts combines offer browsing with booked contract tracking. Available offers are future recurring work; booked contracts are monitored separately.",
            steps: [
                { selector: ".contracts-tabs", title: "Available offers and Contracts", body: "Available offers are where students can book contract opportunities. The Contracts tab shows Upcoming, Active, and History after booking." },
                { selector: ".contracts-filter-bar, .contracts-filter-grid", title: "Filters", body: "Domicile, equipment, driver type, and dates help narrow offers before booking." },
                { selector: ".contract-row, .contracts-offer-row", title: "Offer row", body: "Each row shows location, date range, resources per week, contract type, and estimated payout." },
                { selector: ".contracts-side-panel, .contract-booking-panel", title: "Booking panel", body: "The booking panel opens only when students click a row or Book. Confirming moves the contract into the Contracts tab." }
            ],
            quickTips: [
                "Booked contracts create weekly Trips from the contract start until the end date.",
                "Rejecting contract work after booking can affect performance."
            ]
        },
        auctions: {
            title: "Auctions",
            intro: "Auctions are future loads. Students can learn how they look, but the demo explains why new dispatchers should master spot loads first.",
            steps: [
                { selector: ".auction-alert-stack", title: "Auction notices", body: "Notices explain participation limits and auction access. They set expectations before bidding." },
                { selector: ".auction-filter-bar, .auction-filters", title: "Auction filters", body: "Origin, destination, equipment, and bid status filters narrow future auction opportunities." },
                { selector: ".auction-card", title: "Auction card", body: "Click a card to fold or unfold details. Disabled bid buttons show why a company cannot bid on that location." },
                { selector: ".auction-bid-button, [data-auction-bid]", title: "Place a bid", body: "In this demo, Place a bid opens a teaching message because auctions are future loads and not the first skill a student needs." }
            ],
            quickTips: [
                "Auctions and contracts come with experience. Spot loads and Post A Truck are the core beginner skills."
            ]
        },
        equipmentmarketplace: {
            title: "Equipment Marketplace",
            intro: "Equipment Marketplace is for trailer rental opportunities. In this demo it mostly teaches that there may be no matches and filters can be expanded.",
            steps: [
                { selector: ".equipment-marketplace-alert-stack", title: "Marketplace notices", body: "Notices explain training and compliance expectations before renting equipment to Amazon." },
                { selector: ".equipment-marketplace-filters, .filters", title: "Marketplace filters", body: "Equipment, location, radius, and dates determine whether any marketplace matches appear." },
                { selector: ".equipment-marketplace-empty, .empty-state", title: "No matches", body: "If there are zero results, students should widen radius or select Anywhere." }
            ],
            quickTips: [
                "Marketplace is separate from booking spot loads. It is about equipment opportunities, not immediate dispatch."
            ]
        },
        payments: {
            title: "Payments",
            intro: "Payments teaches weekly settlement. The page shows current year totals, last six months of payments, and a temporary next-week preview.",
            steps: [
                { selector: ".payments-kpi-grid, .payment-summary", title: "Payment totals", body: "YTD is year-to-date based on device date. It should match Dashboard totals." },
                { selector: ".payments-preview, .next-week-preview", title: "Next-week estimate", body: "Preview uses finished student loads in History. It disappears after hard refresh and does not change prepared payment history." },
                { selector: ".payments-table, table", title: "Payment rows", body: "Rows are weekly payment periods. The demo prepares a full year and renders the last six months based on the current date." },
                { selector: ".disputes, [data-payments-tab='disputes']", title: "Disputes", body: "Disputes are for payment corrections, not trip operations. Operational issues belong in Trips or Support Center." }
            ],
            quickTips: [
                "Rejected loads should never increase payments because the carrier did not complete the work.",
                "Canceled loads can show a cancellation fee when Amazon cancels the work within the allowed conditions."
            ]
        },
        scorecard: {
            title: "Scorecard",
            intro: "Scorecard explains performance. It uses recent completed work plus student actions to show how next week may be affected.",
            steps: [
                { selector: ".scorecard-summary-grid, .scorecard-grade", title: "Grade", body: "The grade is driven by on-time, disruption-free, acceptance, and other performance measures." },
                { selector: ".scorecard-metric, .scorecard-table", title: "Metrics", body: "Late times without reported delay lower disruption-free metrics. Rejections affect performance too." },
                { selector: ".scorecard-history, .performance-history", title: "Recent history", body: "The scorecard considers recent completed history, not future loads that have not happened." }
            ],
            quickTips: [
                "Reporting a delay matters because Amazon sees the difference between proactive communication and an unexplained miss."
            ]
        },
        rewards: {
            title: "Rewards",
            intro: "Rewards converts performance into Basic, Bronze, Silver, Gold, or Platinum status for next week.",
            steps: [
                { selector: ".rewards-status, .rewards-tier", title: "Current tier", body: "The displayed tier follows the performance score students create for next week." },
                { selector: ".rewards-table, .rewards-benefits", title: "Benefits", body: "Higher tiers unlock more benefits such as promotions, offers, swag, office hours, and priority dispute resolution." },
                { selector: ".reward-eligibility, .rewards-eligibility", title: "Eligibility", body: "Eligibility depends on performance grade, tenure, verified drivers, and executed miles." }
            ],
            quickTips: [
                "Platinum requires excellent performance. A single missed operational habit can move the student down."
            ]
        },
        supportcenter: {
            title: "Support Center",
            intro: "Support Center is for formal cases. Ask a Question in Trips creates S-style cases; Create New inside Support Center creates 200-style cases.",
            steps: [
                { selector: ".support-tabs, .support-tab", title: "Support tabs", body: "Open shows active cases, Closed shows resolved cases, and Requires Attention shows cases needing action." },
                { selector: ".support-create-button, [data-support-create]", title: "Create New", body: "Create New is for support issues from the Support Center. In Transit callback redirects to Trips instead of asking for attachments." },
                { selector: ".support-case-table, table", title: "Case list", body: "Cases show ID, subject, created date, and last update. Open cases stay visible until resolved." },
                { selector: ".support-modal, .support-case-modal", title: "New case form", body: "Topic and message are required. Attachments are optional unless a specific case type asks for them." }
            ],
            quickTips: [
                "Use Trips Ask a Question for load-specific operational issues because it can write notes directly to the trip."
            ]
        },
        learningcenter: {
            title: "Learning Center",
            intro: "Learning Center is where students review course material and Amazon-style training topics before using advanced features.",
            steps: [
                { selector: ".learning-filters, .filters", title: "Learning filters", body: "Filters help students find the right course or topic quickly." },
                { selector: ".learning-card, .course-card", title: "Course cards", body: "Course cards represent training content. Students should use this when they need process explanation before practice." }
            ],
            quickTips: [
                "Use Learning Center for study, then return to Load Board and Trips for practice."
            ]
        },
        documents: {
            title: "Documents",
            intro: "Documents is where compliance paperwork lives. Students should connect documents to assets, drivers, and carrier readiness.",
            steps: [
                { selector: ".documents-card, .document-list, table", title: "Documents", body: "Documents support account readiness. Missing documents can block asset or driver workflows." }
            ],
            quickTips: [
                "Documents are proof. Dispatch work goes smoother when paperwork is already clean."
            ]
        },
        siteusers: {
            title: "Site Users",
            intro: "Site Users controls account access. Add user from Dashboard brings students here to manage who can use the account.",
            steps: [
                { selector: ".site-users-card, table", title: "Users", body: "Users represent people with account access. Permissions should match the person's role." },
                { selector: ".btn, button", title: "User actions", body: "User actions teach how admin access is managed separately from drivers and assets." }
            ],
            quickTips: [
                "Drivers move freight. Site users access the account. They are not the same thing."
            ]
        },
        performance: {
            title: "Performance",
            intro: "Performance is the detailed version of the score view. Students use it to understand what improves or hurts their carrier standing.",
            steps: [
                { selector: ".notification-box", title: "Performance notice", body: "Performance notices explain what the carrier should improve before next week." },
                { selector: ".performance-card, table", title: "Performance details", body: "The detail view explains how operational habits connect to the score." }
            ],
            quickTips: [
                "Treat performance as a weekly habit tracker, not just a grade."
            ]
        },
        companyprofile: {
            title: "Company Profile",
            intro: "Company Profile stores carrier account identity, business details, and administrative settings.",
            steps: [
                { selector: ".tabs, .company-tabs", title: "Profile sections", body: "Tabs split business, insurance, compliance, and carrier details into manageable sections." },
                { selector: ".card, .profile-card", title: "Company information", body: "This information supports account trust and carrier setup." }
            ],
            quickTips: [
                "Company Profile is about the carrier, not an individual trip."
            ]
        },
        userprofile: {
            title: "User Profile",
            intro: "User Profile controls personal settings for the signed-in user.",
            steps: [
                { selector: ".tabs, .profile-tabs", title: "Profile tabs", body: "Tabs separate personal info, notifications, and account preferences." },
                { selector: ".profile-notification-list", title: "Notification settings", body: "Notification settings determine what alerts the user receives." }
            ],
            quickTips: [
                "Profile settings help students understand account behavior without changing dispatch data."
            ]
        },
        californiacompliance: {
            title: "California Compliance",
            intro: "California Compliance teaches why certain equipment must meet additional requirements before operating in California.",
            steps: [
                { selector: ".card, .panel, table", title: "Compliance content", body: "Use this page to understand why asset compliance affects where a truck can be assigned." }
            ],
            quickTips: [
                "Compliance problems should be fixed before booking freight into restricted areas."
            ]
        },
        carrierterms: {
            title: "Carrier Terms",
            intro: "Carrier Terms is reference material for program rules and responsibilities.",
            steps: [
                { selector: ".card, .panel, main", title: "Terms", body: "Terms explain the responsibilities behind the operational workflows students practice." }
            ],
            quickTips: [
                "Rules pages are references. Workflows happen in Load Board, Trips, Payments, and Support."
            ]
        },
        paymentinfo: {
            title: "Payment Info",
            intro: "Payment Info explains how payment setup supports weekly settlements.",
            steps: [
                { selector: ".card, .panel, table", title: "Payment setup", body: "Payment setup is separate from weekly payment history. It supports where carrier payments are sent." }
            ],
            quickTips: [
                "Payment setup must be clean before payment questions can be solved quickly."
            ]
        },
        programpolicies: {
            title: "Program Policies",
            intro: "Program Policies is a reference page for Amazon Relay operating rules.",
            steps: [
                { selector: ".card, .panel, main", title: "Policy reference", body: "Policies explain the rules behind actions like booking, rejecting, canceling, and reporting delays." }
            ],
            quickTips: [
                "When a student asks why a workflow exists, policies are often where the answer lives."
            ]
        }
    };

    const defaultGuide = {
        title: "Amazon Demo",
        intro: "I can teach this page by explaining the controls, expected Amazon workflow, and common student mistakes.",
        steps: [
            { selector: ".top-bar", title: "Header", body: "Use the header to navigate global shortcuts and control the teacher." },
            { selector: ".sidebar", title: "Sidebar", body: "The sidebar moves between major Amazon Relay areas." },
            { selector: ".page-shell, main, .main-content", title: "Main work area", body: "The main area contains the page workflow students should practice." }
        ],
        quickTips: [
            "Move through the demo like a dispatcher: check Dashboard, find work, assign Trips, execute times, then review Payments and Scorecard."
        ]
    };

    const actionTips = [
        { selector: "a[href='dashboard.html']", message: "Dashboard is the morning check. Start here to see attention counts, current performance, YTD money, and Baltimore load availability before touching dispatch." },
        { selector: "a[href='loadboard.html']", message: "Load Board is for spot work. Filters decide which loads are visible; Book accepts one load, removes it from search results, and creates a matching Upcoming trip." },
        { selector: "a[href='trips.html']", message: "Trips is dispatch execution. Upcoming is planning, In Transit is live work, and History is the locked record after completion, rejection, or cancellation." },
        { selector: "a[href='notification.html']", message: "Tasks are the problem list. Each task should tell the student the load number, what is wrong, and where to open that load." },
        { selector: "a[href='driverroster.html']", message: "Driver Roster controls assignment eligibility. Eligible drivers appear in Trips and Post A Truck; deactivated or ineligible drivers should disappear from assignment choices." },
        { selector: "a[href='assets.html']", message: "Assets is the tractor source of truth. Tractor license plates from here are what students should see when assigning tractors in Trips." },
        { selector: "a[href='payments.html']", message: "Payments is settlement history. Completed loads and valid cancellation fees count; rejected loads do not because no work was performed." },
        { selector: "a[href='scorecard.html']", message: "Scorecard shows the next-week effect of student behavior: on-time actions, disruptions, rejected loads, and missed check-ins all matter." },
        { selector: "a[href='rewards.html']", message: "Rewards turns performance into Basic, Bronze, Silver, Gold, or Platinum. Better score and enough executed miles unlock better reward rows." },
        { selector: "a[href='supportcenter.html']", message: "Support Center is for formal cases. Trip Ask a Question creates S-style load cases; Support Center Create New creates 200-style general cases." },
        { selector: "[data-loadboard-view-target='post-truck']", message: "Post A Truck is not booking yet. It stores the city, equipment, driver type, and availability window so Amazon can offer matching work." },
        { selector: ".detail-book-button", message: "Book is the commitment button. Before clicking it, verify pickup time, stop count, driver type, equipment, payout, and whether the rate changed." },
        { selector: ".detail-close", message: "Closing the booking panel only closes the preview. It does not reserve, book, reject, or save the load." },
        { selector: "[data-trip-assignment], [data-trip-segment-assignment]", message: "Assignment fields are required dispatch prep. Driver comes from eligible Driver Roster; tractor comes from Assets; trailer-required loads need the carrier trailer number inside the equipment section." },
        { selector: "[data-trip-reject]", message: "Reject is only for Upcoming. Once rejected, the load moves to History, needs no driver or tractor, and affects next-week performance." },
        { selector: "[data-trip-delay], .trip-delay-trigger", message: "Report Delay is the correct Amazon-facing move when timing will be missed. It explains the delay and turns off the unreported-delay warning for that event." },
        { selector: "[data-trip-assistant]", message: "Ask a Question opens Relay Assistant with this load context. If the student confirms the issue, a note is saved and a support case can be opened." },
        { selector: "[data-assets-add], #assets-add-button", message: "Add Asset sends one tractor or box truck for review. The student must enter body type, ownership, plate country, state, plate number, unit number, and VIN." },
        { selector: "[data-assets-import], #assets-import-button", message: "Import Assets is spreadsheet practice. After selecting asset type and importing, the assets are marked under review." },
        { selector: "[data-asset-menu-toggle]", message: "Asset actions are practical: view details, add a temporary asset for the unit, or delete it from this session until refresh." },
        { selector: "[data-driver-menu-toggle]", message: "Driver actions change eligibility immediately. Deactivate blocks assignment; Activate restores assignment; Delete removes the driver until refresh." },
        { selector: ".contracts-book-button, [data-contract-book]", message: "Booking a contract accepts recurring work. It should appear under Contracts, and weekly trips start from the contract start date." },
        { selector: ".auction-bid-button, [data-auction-bid]", message: "Auction bids are future opportunities. Students should understand they cannot know exactly what future winning work will look like." },
        { selector: ".support-create-button, [data-support-create]", message: "Create New opens a general support case. Choose the topic, enter the message, then submit to create a 200-style open case." },
        { selector: ".loadboard-footer-clear, [data-loadboard-footer-clear]", message: "Clear filters removes active Load Board criteria and returns the board to a broad result set." },
        { selector: ".loadboard-footer-refresh, [data-loadboard-footer-refresh]", message: "Refresh updates only Load Board results. It can reveal changed rates, removed loads, and new matching options." }
    ];

    const workflowLessons = {
        dashboard: {
            nextClicks: [
                "If Trips needing attention is orange, click View or go to Notifications Tasks first. That is the fastest way to find the exact load that needs action.",
                "If Baltimore loads are available, click Load Board and search Baltimore. When a student books one Baltimore load, the dashboard count should drop by one.",
                "Use Add driver in the welcome card when a student needs more eligible drivers before assigning loads."
            ],
            savedInfo: [
                "Dashboard does not store dispatch actions by itself. It reflects stored work from Load Board bookings, Trips assignments, timing entries, rejected loads, payments, and scorecard performance.",
                "Attention counts are calculated from real trip problems: missing driver, missing tractor, missing carrier trailer number, or an unreported late/missing stop time."
            ],
            mistakes: [
                "Do not ignore orange numbers. They are not decoration; they point to issues that can lower next week's performance.",
                "Do not treat the load count as static. Booking work from the Load Board should lower available counts."
            ]
        },
        loadboard: {
            nextClicks: [
                "Start with Origin. Choose a city, then radius. The result count should reflect loads inside that range; nearby but outside-range work belongs as similar matches, not the main count.",
                "Choose Equipment and Driver type before opening a load. Team loads have tighter transit timing; Solo loads need realistic rest time on longer miles.",
                "Click a load row to open the booking panel. Read stops, pickup window, equipment, load type, payout, and price per mile before Book.",
                "If a pencil appears on pickup time, edit the pickup arrival before booking. Delivery times update with that chosen pickup time.",
                "If a price is green or pale red, refresh before booking. Amazon is telling you the rate changed and the student must review the new payout first."
            ],
            savedInfo: [
                "Book saves the accepted load number, route, stops, pickup and delivery schedule, equipment, driver type, payout, work type, trailer-required status, and adjustable pickup choice.",
                "After booking, that load is removed from Load Board counts and appears in Trips Upcoming. The student's current Load Board filters should stay in place when they come back.",
                "Post A Truck saves requested city, radius, equipment, driver type, time window, and order choices so matched work can be shown from that setup."
            ],
            mistakes: [
                "Do not book by high payout alone. Check transit time, team or solo icon, equipment, and whether the load is trailer-required.",
                "Do not ignore a changed-rate warning. Refresh first, then book the updated rate.",
                "Do not change pickup time after booking in Trips. Adjustable pickup belongs on Load Board before acceptance."
            ]
        },
        trips: {
            nextClicks: [
                "In Upcoming, first assign an eligible driver, then assign a tractor from Assets. If it is trailer-required, enter the carrier trailer number inside the 53' Required equipment area.",
                "Use timing in order: pickup arrival, pickup departure, delivery arrival, delivery departure. The demo should block random out-of-order timing.",
                "If you will miss a scheduled time, click Report delay before the unreported warning becomes a performance problem.",
                "Use Ask a question when the issue is load-specific. It carries the load context and can create an S-style support case.",
                "Use Reject only when you truly reject an Upcoming load. Rejected work goes to History and should not need assignment afterward."
            ],
            savedInfo: [
                "Trips stores driver, tractor, carrier trailer number when required, reported delays, stop times, status movement, support notes, and final History records.",
                "Completed History loads keep the original driver, tractor, trailer, route, payout, and times locked. Students should not be able to edit completed assignment data.",
                "Rejected loads store rejected status and reason, but they do not store driver or tractor assignment because no dispatch action is needed."
            ],
            mistakes: [
                "Do not assign deactivated or ineligible drivers.",
                "Do not leave orange clocks unhandled. Either enter the correct time or report a delay.",
                "Do not treat Blocks like normal loads too early. Blocks should not trigger assignment alarms while details are hidden."
            ]
        },
        notification: {
            nextClicks: [
                "Open Tasks, read the load number, then click the task button. The student should land on the correct Trips tab with that load expanded.",
                "If a task says driver assignment is missing, go directly to that load's assignment field. If it says timing is missing, go directly to that stop time.",
                "After fixing the trip, come back to Tasks or Dashboard to confirm the orange count dropped."
            ],
            savedInfo: [
                "Notifications does not create the problem; it displays problems already stored on Trips. Fixing the Trip should remove or reduce the task.",
                "Task entries store the load number, issue type, route label, and the tab target: Upcoming or In Transit."
            ],
            mistakes: [
                "Do not manually hunt through all trips when a task button can open the exact load.",
                "Do not leave duplicate driver and tractor tasks unresolved; both can count against attention."
            ]
        },
        driverroster: {
            nextClicks: [
                "Click Add driver, choose All or BWI domicile, then enter a valid email. Send invite becomes active only after the email is valid.",
                "Use the three-dot menu to Deactivate a driver. That should immediately remove the driver from assignment dropdowns until Activate is clicked.",
                "Use Delete only for demo cleanup. It removes the driver from this session until refresh."
            ],
            savedInfo: [
                "Driver Roster stores name, email, domicile, phone, profile status, eligibility status, and deactivation reason for assignment decisions.",
                "Activation changes should immediately update Trips and Load Board Post A Truck driver choices."
            ],
            mistakes: [
                "Do not use real personal credentials in the demo.",
                "Do not assign drivers with reverification due, license expired, or deactivated status."
            ]
        },
        assets: {
            nextClicks: [
                "Use Add asset for a permanent asset review. Use a row's three-dot menu for temporary asset or equipment details.",
                "When adding an asset, choose body type, ownership, plate country, state, plate number, unit number, and VIN. Required fields turn red only after the student touches them or submits empty.",
                "Use Import assets for spreadsheet-style practice. Select asset type, attach the template, then Import assets."
            ],
            savedInfo: [
                "Assets stores unit number, type, make, model year, license plate, VIN, verification status, California compliance, and temporary review status.",
                "Tractor license plates from Assets feed the tractor dropdown in Trips. Deleting an asset removes it from this session."
            ],
            mistakes: [
                "Do not enter fake-looking plates or invalid VIN length. VIN should be 17 alphanumeric characters.",
                "Do not show validation errors before the student interacts with the field."
            ]
        },
        contracts: {
            nextClicks: [
                "Available offers is for booking new recurring contracts. Click a contract row or Book to open the booking side panel.",
                "After confirming a contract, open the Contracts tab to see Upcoming, Active, and History contract views.",
                "Read the note: contract trips move to Trips Upcoming every week from contract start until contract end."
            ],
            savedInfo: [
                "A booked contract stores location, date range, drivers required, blocks per week, tractor requirement, weekly payout, and recurring schedule.",
                "Contracts are not immediate spot loads. They create repeated future obligations."
            ],
            mistakes: [
                "Do not leave the booking panel open all the time. It should open only when the student selects a contract or Book.",
                "Do not confuse Auctions with Contracts. Auctions are bidding; Contracts are accepted recurring work."
            ]
        },
        auctions: {
            nextClicks: [
                "Start with closed auction cards. Click anywhere on a card to expand details, not only the arrow.",
                "Use Type, Equipment, Origin, Destination, and Sort to narrow available auction contracts.",
                "Click Place a bid to see the beginner-warning popup. Students should understand Auctions are future work and not guaranteed spot loads."
            ],
            savedInfo: [
                "Auction cards display lane, equipment, loads per week, dates, bid eligibility, and closing time. The demo does not actually book auction work.",
                "Disabled bid buttons explain why the company cannot bid, such as equipment or tenure limits."
            ],
            mistakes: [
                "Do not show impossible result counts. The top result count must match visible auction rows.",
                "Do not let disabled-tooltip messages hide behind other cards."
            ]
        },
        payments: {
            nextClicks: [
                "Use Payments to compare weekly settlements with the Dashboard monthly chart. The totals should add up correctly.",
                "Toggle next week preview to include or remove estimated payment from YTD display.",
                "Search by payment ID, date, or amount when a student wants to prove where a dollar number came from."
            ],
            savedInfo: [
                "Payments renders a rolling 53-week schedule but shows the last six months based on the device date.",
                "Completed loads and cancellation fees count. Rejected loads do not count because they were never hauled."
            ],
            mistakes: [
                "Do not let January through April monthly totals exceed YTD. Math must look believable.",
                "Do not flash old static totals during refresh; students notice."
            ]
        },
        scorecard: {
            nextClicks: [
                "Open Scorecard after practicing Trips. It should show how the last six weeks and next-week estimate respond to dispatch behavior.",
                "Compare On-time and Disruption-free. Late departures without reported delay should lower disruption-free performance.",
                "Rejected loads should affect one criteria for next week, not every metric."
            ],
            savedInfo: [
                "Scorecard reads completed history, rejected loads, disruptions, report-delay behavior, and recent six-week execution count.",
                "The score affects Rewards tier for Basic, Bronze, Silver, Gold, or Platinum."
            ],
            mistakes: [
                "Do not let future history loads affect score. Future has not happened.",
                "Do not count rejected loads as completed work."
            ]
        },
        rewards: {
            nextClicks: [
                "Read the current tier first, then compare it against Minimum performance grade and minimum monthly executed miles.",
                "Use the reward table to explain what each tier unlocks: promotions, discounts, swag, office hours, and dispute priority."
            ],
            savedInfo: [
                "Rewards reads next-week performance and executed miles, then highlights Basic, Bronze, Silver, Gold, or Platinum.",
                "The company label is Future Logistics Academy for this training demo."
            ],
            mistakes: [
                "Do not show a tier that disagrees with Scorecard performance.",
                "Do not show benefits as earned if the minimum performance grade is not met."
            ]
        },
        supportcenter: {
            nextClicks: [
                "Use Open to view current cases. Use Closed to view completed history. Use Create New for a general support request.",
                "For In Transit Trips issue request call back, send students to Trips with the Go to Trips button instead of collecting message, phone, or attachments.",
                "Use View case by ID when a student wants to verify an existing case."
            ],
            savedInfo: [
                "Ask a Question from Trips creates S-style case IDs and a Relay-Assistant note on the load.",
                "Support Center Create New creates 200-style case IDs and stores topic, message, optional recipients, and attachments."
            ],
            mistakes: [
                "Do not expose real company case IDs or real trip numbers in closed case examples.",
                "Do not collect unnecessary phone or attachment information for the callback-only flow."
            ]
        }
    };

    const tripTabLessons = {
        upcoming: {
            title: "Upcoming Trips",
            body: "Upcoming is the planning stage. Students assign an eligible driver, choose a tractor from Assets, add a carrier trailer number when the load is trailer-required, and reject only if they truly cannot take the load. Do not enter live stop times here until the trip is ready to execute."
        },
        "in-transit": {
            title: "In Transit Trips",
            body: "In Transit is live execution. Students enter stop times in order, report delays before missed times become unreported problems, and keep driver and tractor assignments valid. Missing live actions can create Dashboard and Notification tasks."
        },
        history: {
            title: "Trip History",
            body: "History is the record after the work is finished, rejected, or canceled. Completed loads keep driver, tractor, trailer, payout, and stop timing locked. Rejected loads do not need assignments, and canceled loads show canceled status and any valid cancellation fee."
        }
    };

    const contextualLessons = {
        "loadboard:solo": {
            title: "Solo Load",
            body: "Solo means one driver is expected to run the trip. On longer miles, Amazon gives more transit time because a solo driver needs rest time. Before booking, check pickup time, distance, equipment, and whether the schedule is realistic for one person."
        },
        "loadboard:team": {
            title: "Team Load",
            body: "Team means two drivers are expected. Transit is tighter because the truck can keep moving while drivers rotate. Only book a team load when the company really has a team available, because the schedule is built around that speed."
        },
        "payments:disputes": {
            title: "Payment Disputes",
            body: "Disputes are for settlement corrections. Use this area when payment math is wrong, not for live trip problems. Trip timing, trailer, driver, or facility problems should be handled from Trips or Support Center."
        }
    };

    let teacherEnabled = readBoolean(TEACHER_STATE_KEY, false);
    let voiceEnabled = readBoolean(TEACHER_VOICE_KEY, false);
    let panelOpen = readBoolean(TEACHER_PANEL_KEY, true);
    let teacherRoot = null;
    let teacherPanel = null;
    let teacherText = null;
    let teacherSubtext = null;
    let tourState = null;
    let lastMessage = "";
    let preferredVoice = null;
    let lessonCursorByPage = {};
    let birdIdCounter = 0;
    let pendingVoiceText = "";
    let voiceRetryTimer = null;
    let voiceRetryCount = 0;
    let pendingGestureSpeechText = "";
    let highlightedTarget = null;
    let highlightPlacementTimer = null;
    let suppressScrollDismissUntil = 0;
    let teacherAutoHideTimer = null;

    document.addEventListener("DOMContentLoaded", initializeTeacher);

    function initializeTeacher() {
        if (document.body.classList.contains("print-page")) {
            return;
        }

        resetTeacherSessionIfHardRefresh();
        injectHeaderControls();
        injectTeacherWidget();
        wireGlobalActionTeaching();
        wireTeacherDismissals();
        wireVoiceGestureFallback();
        updateTeacherVisibility(false);

        if (teacherEnabled) {
            panelOpen = false;
            updateTeacherVisibility(false);
            window.setTimeout(() => teachCurrentPageOnce(), 450);
        }

        if ("speechSynthesis" in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                choosePreferredVoice();
                if (pendingVoiceText) {
                    const textToSpeak = pendingVoiceText;
                    pendingVoiceText = "";
                    voiceRetryCount = 0;
                    speak(textToSpeak);
                }
            };
            choosePreferredVoice();
        }
    }

    function readBoolean(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                return fallback;
            }

            return value === "true";
        } catch (error) {
            return fallback;
        }
    }

    function writeBoolean(key, value) {
        try {
            localStorage.setItem(key, String(Boolean(value)));
        } catch (error) {
            // Local storage can be blocked in private windows. The teacher still works for the current page.
        }
    }

    function getCurrentGuide() {
        return pageGuides[pageKey] || defaultGuide;
    }

    function resetTeacherSessionIfHardRefresh() {
        let isReload = false;
        try {
            const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
            isReload = navigationEntry?.type === "reload" || performance.navigation?.type === 1;
        } catch (error) {
            isReload = false;
        }

        if (!isReload) {
            return;
        }

        try {
            Object.keys(sessionStorage)
                .filter((key) => key.startsWith(TEACHER_SEEN_PREFIX))
                .forEach((key) => sessionStorage.removeItem(key));
        } catch (error) {
            // If session storage is blocked, Mira simply teaches again on demand.
        }
    }

    function hasTeacherSeen(key) {
        try {
            return sessionStorage.getItem(`${TEACHER_SEEN_PREFIX}${key}`) === "true";
        } catch (error) {
            return false;
        }
    }

    function markTeacherSeen(key) {
        try {
            sessionStorage.setItem(`${TEACHER_SEEN_PREFIX}${key}`, "true");
        } catch (error) {
            // Session memory is optional. The teaching behavior still works.
        }
    }

    function injectHeaderControls() {
        const topIcons = document.querySelector(".top-icons");
        if (!topIcons || topIcons.querySelector("[data-ai-teacher-toggle]")) {
            return;
        }

        const controls = document.createElement("div");
        controls.className = "ai-teacher-header-controls";
        controls.innerHTML = `
            <label class="ai-teacher-switch" title="Turn Mira, the AI teacher, on or off">
                <span>Teacher</span>
                <input type="checkbox" data-ai-teacher-toggle${teacherEnabled ? " checked" : ""}>
                <i aria-hidden="true"></i>
            </label>
            <label class="ai-teacher-switch ai-teacher-voice-switch" title="Turn Mira's voice on or off">
                <span>Voice</span>
                <input type="checkbox" data-ai-teacher-voice-toggle${voiceEnabled ? " checked" : ""}>
                <i aria-hidden="true"></i>
            </label>
        `;

        topIcons.appendChild(controls);

        controls.querySelector("[data-ai-teacher-toggle]")?.addEventListener("change", (event) => {
            teacherEnabled = Boolean(event.target.checked);
            writeBoolean(TEACHER_STATE_KEY, teacherEnabled);
            panelOpen = teacherEnabled ? true : panelOpen;
            writeBoolean(TEACHER_PANEL_KEY, panelOpen);
            updateTeacherVisibility(true);

            if (teacherEnabled) {
                const guide = getCurrentGuide();
                showCoachMessage(
                    `Hi, I am ${teacherName}.`,
                    composePageLesson(),
                    { speak: true, autoHide: true }
                );
                markTeacherSeen(`page:${pageKey}`);
            } else {
                stopSpeaking();
                removeTourHighlight();
                clearTeacherAutoHide();
            }
        });

        controls.querySelector("[data-ai-teacher-voice-toggle]")?.addEventListener("change", (event) => {
            voiceEnabled = Boolean(event.target.checked);
            writeBoolean(TEACHER_VOICE_KEY, voiceEnabled);
            if (voiceEnabled && teacherEnabled) {
                speak("Voice is on. I will keep it bright, quick, and practical while you practice.");
            } else {
                stopSpeaking();
            }
        });
    }

    function injectTeacherWidget() {
        if (document.getElementById("ai-teacher-root")) {
            teacherRoot = document.getElementById("ai-teacher-root");
            teacherPanel = teacherRoot.querySelector(".ai-teacher-panel");
            teacherText = teacherRoot.querySelector("[data-ai-teacher-title]");
            teacherSubtext = teacherRoot.querySelector("[data-ai-teacher-message]");
            wireMiraImageFallbacks(teacherRoot);
            return;
        }

        const guide = getCurrentGuide();
        teacherRoot = document.createElement("aside");
        teacherRoot.id = "ai-teacher-root";
        teacherRoot.className = "ai-teacher-root";
        teacherRoot.setAttribute("aria-live", "polite");
        teacherRoot.innerHTML = `
            <button class="ai-teacher-bird-button" type="button" data-ai-teacher-open aria-label="Open AI teacher">
                ${buildBirdMarkup("portrait")}
            </button>
            <section class="ai-teacher-panel" role="dialog" aria-label="AI teacher panel">
                <header class="ai-teacher-panel-header">
                    <div>
                        <strong>${teacherName}</strong>
                        <span>Relay Coach</span>
                    </div>
                    <div class="ai-teacher-panel-actions">
                        <button type="button" data-ai-teacher-minimize aria-label="Minimize AI teacher">_</button>
                        <button type="button" data-ai-teacher-close aria-label="Turn off AI teacher">&times;</button>
                    </div>
                </header>
                <div class="ai-teacher-panel-body">
                    <div class="ai-teacher-bird-stage" aria-hidden="true">
                        ${buildBirdMarkup("full")}
                    </div>
                    <div class="ai-teacher-speech">
                        <h3 data-ai-teacher-title>${escapeHtml(guide.title)}</h3>
                        <p data-ai-teacher-message>${escapeHtml(guide.intro)}</p>
                    </div>
                    <div class="ai-teacher-progress" data-ai-teacher-progress hidden></div>
                    <div class="ai-teacher-button-grid" aria-label="Mira repeat controls">
                        <button type="button" data-ai-teacher-action="repeat">Repeat</button>
                    </div>
                </div>
            </section>
            <div class="ai-teacher-highlight" data-ai-teacher-highlight hidden></div>
        `;

        document.body.appendChild(teacherRoot);
        teacherPanel = teacherRoot.querySelector(".ai-teacher-panel");
        teacherText = teacherRoot.querySelector("[data-ai-teacher-title]");
        teacherSubtext = teacherRoot.querySelector("[data-ai-teacher-message]");

        teacherRoot.querySelector("[data-ai-teacher-open]")?.addEventListener("click", () => {
            teacherEnabled = true;
            panelOpen = true;
            writeBoolean(TEACHER_STATE_KEY, true);
            writeBoolean(TEACHER_PANEL_KEY, true);
            syncHeaderSwitches();
            updateTeacherVisibility(false);
            if (lastMessage) {
                const splitIndex = lastMessage.indexOf(". ");
                const title = splitIndex > -1 ? lastMessage.slice(0, splitIndex) : `Repeat from ${teacherName}`;
                const body = splitIndex > -1 ? lastMessage.slice(splitIndex + 2) : lastMessage;
                showCoachMessage(title, body, { speak: true, autoHide: true, forceRepeat: true });
            } else {
                teachCurrentPageOnce({ force: true });
            }
        });

        teacherRoot.querySelector("[data-ai-teacher-minimize]")?.addEventListener("click", () => {
            panelOpen = false;
            writeBoolean(TEACHER_PANEL_KEY, false);
            updateTeacherVisibility(false);
            removeTourHighlight();
        });

        teacherRoot.querySelector("[data-ai-teacher-close]")?.addEventListener("click", () => {
            teacherEnabled = false;
            writeBoolean(TEACHER_STATE_KEY, false);
            syncHeaderSwitches();
            updateTeacherVisibility(false);
            stopSpeaking();
            removeTourHighlight();
        });

        teacherRoot.querySelectorAll("[data-ai-teacher-action]").forEach((button) => {
            button.addEventListener("click", () => handleTeacherAction(button.dataset.aiTeacherAction));
        });

        teacherRoot.querySelectorAll("[data-ai-teacher-tour]").forEach((button) => {
            button.addEventListener("click", () => handleTourAction(button.dataset.aiTeacherTour));
        });

        wireMiraImageFallbacks(teacherRoot);
    }

    function buildBirdMarkup(variant = "full") {
        return `
            <span class="teacher-bird-image-wrap teacher-bird-image-wrap-${variant}" data-mira-image-wrap>
                <img class="teacher-bird-image teacher-bird-image-${variant}" src="${MIRA_IMAGE_SRC}" alt="Mira, stylish lady bird teacher" data-mira-image>
                ${buildBirdFallbackSvg(variant)}
            </span>
        `;
    }

    function wireMiraImageFallbacks(root = document) {
        root.querySelectorAll("[data-mira-image]").forEach((image) => {
            if (image.dataset.miraImageWired) {
                return;
            }

            image.dataset.miraImageWired = "true";
            image.addEventListener("load", () => {
                image.closest("[data-mira-image-wrap]")?.classList.remove("is-fallback");
            });
            image.addEventListener("error", () => {
                image.closest("[data-mira-image-wrap]")?.classList.add("is-fallback");
            });

            if (image.complete && image.naturalWidth < 1) {
                image.closest("[data-mira-image-wrap]")?.classList.add("is-fallback");
            }
        });
    }

    function buildBirdFallbackSvg(variant = "full") {
        birdIdCounter += 1;
        const id = `miraBird${birdIdCounter}`;
        const isPortrait = variant === "portrait";
        const viewBox = isPortrait ? "32 0 126 148" : "0 0 190 260";
        return `
            <svg class="teacher-bird-svg teacher-bird-svg-${variant}" viewBox="${viewBox}" role="img" aria-label="Mira, stylish lady bird teacher">
                <defs>
                    <linearGradient id="${id}BodyGradient" x1="46" y1="16" x2="124" y2="154" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#fff8a7"/>
                        <stop offset="0.5" stop-color="#dfc45f"/>
                        <stop offset="1" stop-color="#b57b2d"/>
                    </linearGradient>
                    <linearGradient id="${id}WingGradient" x1="90" y1="74" x2="166" y2="151" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f6e79b"/>
                        <stop offset="0.56" stop-color="#c4aa54"/>
                        <stop offset="1" stop-color="#8d642a"/>
                    </linearGradient>
                    <linearGradient id="${id}LegGradient" x1="72" y1="146" x2="86" y2="238" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#ffe6bf"/>
                        <stop offset="1" stop-color="#d78d55"/>
                    </linearGradient>
                    <linearGradient id="${id}CapGradient" x1="38" y1="25" x2="104" y2="46" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#223140"/>
                        <stop offset="1" stop-color="#080f18"/>
                    </linearGradient>
                    <linearGradient id="${id}LensGradient" x1="54" y1="63" x2="97" y2="84" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#1c2730"/>
                        <stop offset="0.5" stop-color="#0b1118"/>
                        <stop offset="1" stop-color="#5f6c72"/>
                    </linearGradient>
                    <filter id="${id}Shadow" x="-20%" y="-20%" width="140%" height="150%">
                        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#4a2b12" flood-opacity="0.24"/>
                    </filter>
                    <filter id="${id}Glow" x="-25%" y="-25%" width="150%" height="150%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffffff" flood-opacity="0.92"/>
                    </filter>
                </defs>
                <g class="teacher-bird-fashion" filter="url(#${id}Glow)">
                    <g filter="url(#${id}Shadow)" stroke="#080808" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M76 47 C78 27 88 8 97 3 C101 24 95 42 82 57" fill="#fff18a"/>
                        <path d="M85 55 C99 35 113 21 125 17 C123 38 105 55 90 66" fill="#f3dc75"/>
                        <path d="M91 67 C108 51 127 45 140 48 C130 64 112 73 94 76" fill="#e4cc6b"/>
                        <path d="M95 77 C113 68 132 71 144 79 C128 88 109 86 95 82" fill="#d5b95f"/>

                        <path class="teacher-bird-wing-left-svg" d="M62 83 C45 88 39 108 45 126 C56 122 64 103 69 88 Z" fill="#ead27a"/>
                        <path class="teacher-bird-wing-right-svg" d="M96 83 C121 86 153 107 169 142 C141 135 111 120 91 102 Z" fill="url(#${id}WingGradient)"/>
                        <path d="M118 118 C139 129 157 147 171 166 C148 161 123 149 104 133" fill="#b99a48"/>
                        <path d="M116 121 L154 134 M108 132 L145 148 M101 143 L135 160" fill="none" stroke-width="2.4"/>

                        <path d="M74 39 C91 28 112 38 121 62 C134 95 118 129 93 144 C70 158 49 136 50 107 C51 81 56 51 74 39 Z" fill="url(#${id}BodyGradient)"/>
                        <path d="M63 119 C75 137 96 139 110 120 C107 149 84 164 64 148 C55 140 51 130 53 119 Z" fill="#ad772c" opacity="0.28" stroke-width="0"/>
                        <path d="M62 98 C66 109 79 111 88 101" fill="none" stroke-width="2.5"/>
                        <path d="M69 102 L68 114 M77 105 L78 117 M85 102 L89 113" fill="none" stroke-width="2.4"/>

                        <path d="M50 39 L83 23 L119 36 L85 52 Z" fill="url(#${id}CapGradient)"/>
                        <path d="M66 45 H102 V55 C92 60 75 58 66 53 Z" fill="#121d29"/>
                        <path d="M113 39 C118 52 115 65 109 78" fill="none" stroke="#ffc857" stroke-width="2.6"/>
                        <circle cx="108" cy="80" r="3.8" fill="#ffc857"/>

                        <path d="M70 58 C76 49 90 50 99 62 C91 73 77 72 70 58 Z" fill="url(#${id}LensGradient)"/>
                        <path d="M99 63 C107 53 121 55 130 67 C120 78 107 76 99 63 Z" fill="url(#${id}LensGradient)"/>
                        <path d="M98 62 L101 63" fill="none" stroke-width="2.4"/>
                        <path d="M72 55 L62 49 M75 54 L73 45 M123 62 L135 58 M120 59 L123 50" fill="none" stroke-width="2.8"/>
                        <path d="M78 57 C84 53 93 55 97 61" fill="#ffffff" opacity="0.48" stroke-width="0"/>
                        <path d="M106 61 C112 58 121 61 126 66" fill="#ffffff" opacity="0.38" stroke-width="0"/>
                        <ellipse cx="75" cy="79" rx="6.5" ry="8" fill="#f28a34" opacity="0.82" stroke-width="0"/>
                        <path d="M68 72 L53 83 L65 92 Z" fill="#edd37b"/>
                        <circle cx="121" cy="86" r="3.8" fill="#111111"/>

                        <path d="M78 147 C75 170 69 193 60 216" fill="none" stroke="#2d1c17" stroke-width="5.4"/>
                        <path d="M95 145 C91 171 88 194 94 224" fill="none" stroke="#2d1c17" stroke-width="5.4"/>
                        <path d="M78 147 C75 170 69 193 60 216" fill="none" stroke="url(#${id}LegGradient)" stroke-width="3.4"/>
                        <path d="M95 145 C91 171 88 194 94 224" fill="none" stroke="url(#${id}LegGradient)" stroke-width="3.4"/>
                        <path d="M59 215 C47 220 40 229 38 238 C50 240 61 235 69 225 Z" fill="#d91645"/>
                        <path d="M91 224 C77 226 68 234 64 244 C78 248 93 241 101 230 Z" fill="#d91645"/>
                        <path d="M41 238 L31 249 M67 226 L62 242 M99 231 L106 247" fill="none" stroke="#8d102d" stroke-width="2.6"/>

                        <path d="M49 112 C37 108 31 97 34 88 C43 89 50 100 53 113" fill="#ead27a"/>
                        <path d="M35 88 L28 76" fill="none" stroke="#ffc857" stroke-width="3.5"/>
                        <path d="M25 73 L20 66" fill="none" stroke="#111111" stroke-width="3.5"/>
                    </g>
                </g>
            </svg>
        `;
    }

    function syncHeaderSwitches() {
        const teacherToggle = document.querySelector("[data-ai-teacher-toggle]");
        const voiceToggle = document.querySelector("[data-ai-teacher-voice-toggle]");
        if (teacherToggle) {
            teacherToggle.checked = teacherEnabled;
        }

        if (voiceToggle) {
            voiceToggle.checked = voiceEnabled;
        }
    }

    function updateTeacherVisibility(animateBird) {
        if (!teacherRoot) {
            return;
        }

        teacherRoot.classList.toggle("is-enabled", teacherEnabled);
        teacherRoot.classList.toggle("is-panel-open", teacherEnabled && panelOpen);
        teacherRoot.classList.toggle("is-panel-closed", teacherEnabled && !panelOpen);
        teacherRoot.classList.toggle("is-disabled", !teacherEnabled);

        if (animateBird) {
            teacherRoot.classList.add("is-waving");
            window.setTimeout(() => teacherRoot?.classList.remove("is-waving"), 1700);
        }
    }

    function handleTeacherAction(action) {
        if (!teacherEnabled) {
            teacherEnabled = true;
            writeBoolean(TEACHER_STATE_KEY, true);
            syncHeaderSwitches();
            updateTeacherVisibility(false);
        }

        panelOpen = true;
        writeBoolean(TEACHER_PANEL_KEY, true);
        updateTeacherVisibility(false);

        if (action === "tour") {
            startTour();
            return;
        }

        if (action === "next") {
            teachNextStep();
            return;
        }

        if (action === "stored") {
            teachStoredInfo();
            return;
        }

        if (action === "mistakes") {
            teachMistakes();
            return;
        }

        if (action === "repeat") {
            if (!lastMessage) {
                teachCurrentPageOnce({ force: true });
                return;
            }

            const splitIndex = lastMessage.indexOf(". ");
            const title = splitIndex > -1 ? lastMessage.slice(0, splitIndex) : `Repeat from ${teacherName}`;
            const body = splitIndex > -1 ? lastMessage.slice(splitIndex + 2) : lastMessage;
            showCoachMessage(title, body, { speak: true, autoHide: true, forceRepeat: true });
        }
    }

    function startTour() {
        const guide = getCurrentGuide();
        const usableSteps = guide.steps.filter((step) => !step.selector || document.querySelector(step.selector));

        if (!usableSteps.length) {
            setTeacherMessage("I do not see the expected controls yet.", "Try opening the relevant section, then start the walkthrough again.", { speak: true });
            return;
        }

        tourState = {
            steps: usableSteps,
            index: 0
        };
        renderTourStep();
    }

    function renderTourStep() {
        if (!tourState || !tourState.steps.length) {
            endTour("Walkthrough finished.");
            return;
        }

        const step = tourState.steps[tourState.index];
        const progress = teacherRoot.querySelector("[data-ai-teacher-progress]");
        const actions = teacherRoot.querySelector("[data-ai-teacher-tour-actions]");

        if (progress) {
            progress.hidden = false;
            progress.textContent = `Step ${tourState.index + 1} of ${tourState.steps.length}`;
        }

        if (actions) {
            actions.hidden = false;
            const back = actions.querySelector("[data-ai-teacher-tour='back']");
            const next = actions.querySelector("[data-ai-teacher-tour='next']");
            if (back) {
                back.disabled = tourState.index === 0;
            }

            if (next) {
                next.textContent = tourState.index === tourState.steps.length - 1 ? "Finish" : "Next";
            }
        }

        highlightStep(step);
        setTeacherMessage(step.title, step.body, { speak: true });
    }

    function handleTourAction(action) {
        if (!tourState) {
            return;
        }

        if (action === "end") {
            endTour("Walkthrough ended. I will stay nearby if you need another page explained.");
            return;
        }

        if (action === "back") {
            tourState.index = Math.max(0, tourState.index - 1);
            renderTourStep();
            return;
        }

        if (action === "next") {
            if (tourState.index >= tourState.steps.length - 1) {
                endTour("Walkthrough complete. Practice the workflow once, then come back if you want reminders.");
                return;
            }

            tourState.index += 1;
            renderTourStep();
        }
    }

    function endTour(message) {
        tourState = null;
        removeTourHighlight();
        const progress = teacherRoot.querySelector("[data-ai-teacher-progress]");
        const actions = teacherRoot.querySelector("[data-ai-teacher-tour-actions]");
        if (progress) {
            progress.hidden = true;
        }

        if (actions) {
            actions.hidden = true;
        }

        setTeacherMessage("Walkthrough", message, { speak: true });
    }

    function highlightStep(step) {
        const highlight = teacherRoot.querySelector("[data-ai-teacher-highlight]");
        const target = step.selector ? document.querySelector(step.selector) : null;

        if (!highlight || !target) {
            removeTourHighlight();
            return;
        }

        highlightedTarget = target;
        suppressScrollDismissUntil = Date.now() + 1000;
        window.clearTimeout(highlightPlacementTimer);
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

        highlightPlacementTimer = window.setTimeout(() => {
            positionTourHighlight();
            suppressScrollDismissUntil = Date.now() + 900;
        }, 360);
    }

    function positionTourHighlight() {
        const highlight = teacherRoot?.querySelector("[data-ai-teacher-highlight]");
        if (!highlight || !highlightedTarget || !document.documentElement.contains(highlightedTarget)) {
            removeTourHighlight();
            return;
        }

        const rect = highlightedTarget.getBoundingClientRect();
        highlight.hidden = false;
        highlight.style.left = `${Math.max(8, rect.left - 8)}px`;
        highlight.style.top = `${Math.max(8, rect.top - 8)}px`;
        highlight.style.width = `${Math.max(24, rect.width + 16)}px`;
        highlight.style.height = `${Math.max(24, rect.height + 16)}px`;
    }

    function removeTourHighlight() {
        window.clearTimeout(highlightPlacementTimer);
        highlightedTarget = null;
        const highlight = teacherRoot?.querySelector("[data-ai-teacher-highlight]");
        if (!highlight) {
            return;
        }

        highlight.hidden = true;
        highlight.removeAttribute("style");
    }

    function dismissActiveTourFocus() {
        if (!tourState && !highlightedTarget) {
            return;
        }

        tourState = null;
        removeTourHighlight();
        const progress = teacherRoot?.querySelector("[data-ai-teacher-progress]");
        const actions = teacherRoot?.querySelector("[data-ai-teacher-tour-actions]");
        if (progress) {
            progress.hidden = true;
        }

        if (actions) {
            actions.hidden = true;
        }
    }

    function teachCurrentPageOnce(options = {}) {
        if (!teacherEnabled) {
            return;
        }

        const key = `page:${pageKey}`;
        if (!options.force && hasTeacherSeen(key)) {
            return;
        }

        markTeacherSeen(key);
        showCoachMessage(`Hi, I am ${teacherName}.`, composePageLesson(), {
            speak: true,
            autoHide: true
        });
    }

    function composePageLesson() {
        const guide = getCurrentGuide();
        return guide.intro;
    }

    function teachTripTabOnce(tabName) {
        const lesson = tripTabLessons[tabName];
        if (!lesson || !teacherEnabled) {
            return;
        }

        const key = `trips-tab:${tabName}`;
        if (hasTeacherSeen(key)) {
            return;
        }

        markTeacherSeen(key);
        showCoachMessage(lesson.title, lesson.body, { speak: true, autoHide: true });
    }

    function teachContextOnce(key, lesson) {
        if (!teacherEnabled || !lesson || hasTeacherSeen(key)) {
            return false;
        }

        markTeacherSeen(key);
        showCoachMessage(lesson.title, lesson.body, { speak: true, autoHide: true });
        return true;
    }

    function teachLoadDriverTypeOnce(driverType) {
        const normalizedType = String(driverType || "").trim().toLowerCase();
        if (normalizedType === "solo") {
            return teachContextOnce("loadboard:solo", contextualLessons["loadboard:solo"]);
        }

        if (normalizedType === "team") {
            return teachContextOnce("loadboard:team", contextualLessons["loadboard:team"]);
        }

        return false;
    }

    function showCoachMessage(title, body, options = {}) {
        if (!teacherRoot) {
            return;
        }

        clearTeacherAutoHide();
        tourState = null;
        removeTourHighlight();
        teacherRoot.classList.remove("is-fading-away");
        teacherRoot.querySelector("[data-ai-teacher-progress]")?.setAttribute("hidden", "");
        teacherRoot.querySelector("[data-ai-teacher-tour-actions]")?.setAttribute("hidden", "");
        panelOpen = true;
        writeBoolean(TEACHER_PANEL_KEY, true);
        updateTeacherVisibility(false);
        setTeacherMessage(title, body, { speak: options.speak !== false });

        if (options.autoHide !== false) {
            scheduleTeacherAutoHide(`${title} ${body}`);
        }
    }

    function scheduleTeacherAutoHide(text) {
        clearTeacherAutoHide();
        const wordCount = String(text || "").trim().split(/\s+/).filter(Boolean).length;
        const delay = Math.max(7000, Math.min(26000, wordCount * 360));
        teacherAutoHideTimer = window.setTimeout(() => {
            if (!teacherRoot) {
                return;
            }

            teacherRoot.classList.add("is-fading-away");
            window.setTimeout(() => {
                panelOpen = false;
                writeBoolean(TEACHER_PANEL_KEY, false);
                updateTeacherVisibility(false);
                teacherRoot?.classList.remove("is-fading-away");
            }, 260);
        }, delay);
    }

    function clearTeacherAutoHide() {
        window.clearTimeout(teacherAutoHideTimer);
        teacherAutoHideTimer = null;
        teacherRoot?.classList.remove("is-fading-away");
    }

    function teachNextStep() {
        const guide = getCurrentGuide();
        const specific = workflowLessons[pageKey]?.nextClicks;
        const tips = specific?.length ? specific : (guide.quickTips?.length ? guide.quickTips : defaultGuide.quickTips);
        const index = nextLessonIndex("next", tips.length);
        showCoachMessage(`Exact next click on ${guide.title}`, tips[index], { speak: true, autoHide: true });
    }

    function teachStoredInfo() {
        const guide = getCurrentGuide();
        const storedInfo = workflowLessons[pageKey]?.savedInfo;
        const tips = storedInfo?.length ? storedInfo : [
            "This page stores or reflects the Amazon-facing choices students make. The important lesson is to know whether a click is only a preview, a filter, or a real commitment.",
            "Preview actions usually do not change records. Submit, Book, Reject, Report delay, Assign, and Create case are the actions students should treat as record-changing."
        ];
        const index = nextLessonIndex("stored", tips.length);
        showCoachMessage(`What gets saved on ${guide.title}`, tips[index], { speak: true, autoHide: true });
    }

    function teachMistakes() {
        const mistakesByPage = {
            loadboard: "Do not book by payout alone. Check equipment, driver type, pickup window, and whether the rate changed before accepting.",
            trips: "Do not enter times out of order. Do not leave missing assignments, and do not ignore orange clocks without reporting a delay.",
            notification: "Do not treat Tasks like decoration. They name the exact trip issue that can hurt performance.",
            driverroster: "Do not assign ineligible or deactivated drivers. Eligibility controls whether the driver appears in assignment dropdowns.",
            assets: "Do not use fake-looking plates, VINs, or unit numbers. Asset data should look realistic because it feeds dispatch.",
            payments: "Do not count rejected trips as payment. Only completed work and valid cancellation fees belong in settlement.",
            contracts: "Do not book contracts without understanding they create recurring future trips.",
            auctions: "Do not treat auctions like immediate spot loads. They are future opportunities with uncertainty.",
            supportcenter: "Do not open a generic support case for a load-specific question if Trips Ask a Question can capture the load context.",
            scorecard: "Do not wait until the end of the week to care about performance. Timing and rejection choices affect next week."
        };

        const specificMistakes = workflowLessons[pageKey]?.mistakes;
        const message = specificMistakes?.length
            ? specificMistakes[nextLessonIndex("mistakes", specificMistakes.length)]
            : (mistakesByPage[pageKey] || "Do not click through the demo blindly. Read what each Amazon-facing action means before committing.");
        showCoachMessage("Mistake to avoid", message, { speak: true, autoHide: true });
    }

    function wireGlobalActionTeaching() {
        document.addEventListener("click", (event) => {
            if (!teacherEnabled || event.target.closest("#ai-teacher-root") || event.target.closest(".ai-teacher-header-controls")) {
                return;
            }

            const tripTab = event.target.closest("[data-trip-tab]");
            if (tripTab?.dataset.tripTab) {
                teachTripTabOnce(tripTab.dataset.tripTab);
                return;
            }

            const loadRow = event.target.closest(".amazon-load-row[data-driver-type]");
            if (loadRow) {
                teachLoadDriverTypeOnce(loadRow.dataset.driverType);
                return;
            }

            const tripCard = event.target.closest(".trip-upcoming-card[data-driver-type]");
            if (tripCard) {
                teachLoadDriverTypeOnce(tripCard.dataset.driverType);
                return;
            }

            const paymentDisputeTab = event.target.closest("[data-target='payments-pane-disputes']");
            if (paymentDisputeTab) {
                teachContextOnce("payments:disputes", contextualLessons["payments:disputes"]);
                return;
            }

            const tip = actionTips.find((candidate) => event.target.closest(candidate.selector));
            if (!tip) {
                return;
            }

            showCoachMessage("What that action means", tip.message, { speak: true, autoHide: true });
        }, true);
    }

    function wireVoiceGestureFallback() {
        const flushPendingSpeech = () => {
            if (!pendingGestureSpeechText || !teacherEnabled || !voiceEnabled) {
                return;
            }

            const textToSpeak = pendingGestureSpeechText;
            pendingGestureSpeechText = "";
            window.setTimeout(() => speak(textToSpeak), 0);
        };

        document.addEventListener("pointerdown", flushPendingSpeech, true);
        document.addEventListener("keydown", flushPendingSpeech, true);
    }

    function wireTeacherDismissals() {
        document.addEventListener("click", (event) => {
            if (!teacherEnabled || event.target.closest("#ai-teacher-root") || event.target.closest(".ai-teacher-header-controls")) {
                return;
            }

            dismissActiveTourFocus();
        }, true);

        window.addEventListener("scroll", () => {
            if (!highlightedTarget || Date.now() < suppressScrollDismissUntil) {
                return;
            }

            dismissActiveTourFocus();
        }, { passive: true });

        window.addEventListener("resize", () => {
            if (!highlightedTarget) {
                return;
            }

            positionTourHighlight();
        }, { passive: true });
    }

    function setTeacherMessage(title, body, options = {}) {
        const cleanTitle = String(title || teacherName);
        const cleanBody = String(body || "");

        if (teacherText) {
            teacherText.textContent = cleanTitle;
        }

        if (teacherSubtext) {
            teacherSubtext.textContent = cleanBody;
        }

        lastMessage = `${cleanTitle}. ${cleanBody}`;

        if (options.speak) {
            speak(lastMessage);
        }
    }

    function choosePreferredVoice() {
        if (!("speechSynthesis" in window)) {
            return null;
        }

        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
            return null;
        }

        const englishVoices = voices.filter((voice) => /en/i.test(voice.lang));
        preferredVoice = englishVoices.find((voice) => feminineVoicePattern.test(voice.name))
            || englishVoices.find((voice) => !masculineVoicePattern.test(voice.name))
            || null;

        return preferredVoice;
    }

    function speak(text) {
        if (!teacherEnabled || !voiceEnabled || !("speechSynthesis" in window) || !text) {
            return false;
        }

        const selectedVoice = preferredVoice || choosePreferredVoice();
        if (!selectedVoice && voiceRetryCount < 8) {
            pendingVoiceText = text;
            voiceRetryCount += 1;
            window.clearTimeout(voiceRetryTimer);
            voiceRetryTimer = window.setTimeout(() => speak(text), 250);
            return false;
        }

        stopSpeaking();
        pendingVoiceText = "";
        pendingGestureSpeechText = text;
        voiceRetryCount = 0;

        const utterance = new SpeechSynthesisUtterance(buildVoiceLine(text));
        utterance.lang = "en-US";
        utterance.rate = 1.08;
        utterance.pitch = selectedVoice ? 1.18 : 1.36;
        utterance.volume = 1;
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.onstart = () => {
            if (pendingGestureSpeechText === text) {
                pendingGestureSpeechText = "";
            }
        };
        utterance.onend = () => {
            if (pendingGestureSpeechText === text) {
                pendingGestureSpeechText = "";
            }
        };
        utterance.onerror = () => {
            if (pendingGestureSpeechText !== text) {
                pendingGestureSpeechText = text;
            }
        };
        window.speechSynthesis.speak(utterance);
        return true;
    }

    function stopSpeaking() {
        pendingVoiceText = "";
        pendingGestureSpeechText = "";
        voiceRetryCount = 0;
        window.clearTimeout(voiceRetryTimer);
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function hashString(value) {
        return String(value || "").split("").reduce((hash, character) => (
            ((hash * 33) + character.charCodeAt(0)) >>> 0
        ), 2166136261);
    }

    function nextLessonIndex(kind, length) {
        const key = `${pageKey}:${kind}`;
        const current = lessonCursorByPage[key] || 0;
        lessonCursorByPage[key] = current + 1;
        return length ? current % length : 0;
    }

    function buildVoiceLine(text) {
        const normalized = String(text || "").replace(/\s+/g, " ").trim();
        if (!normalized) {
            return "";
        }

        const opener = voiceOpeners[Math.abs(hashString(`${pageKey}:${normalized.length}:${Date.now().toString().slice(0, -3)}`)) % voiceOpeners.length];
        const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
        const title = sentences.shift() || "";
        const firstUseful = sentences.find((sentence) => sentence.length > 18) || title;
        const summary = firstUseful.length > 230 ? `${firstUseful.slice(0, 227)}...` : firstUseful;
        return `${opener} ${title} ${summary}`.replace(/\s+/g, " ").trim();
    }
})();
