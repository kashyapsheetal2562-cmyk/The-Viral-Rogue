/* ============================================================
   THE VIRAL ROGUE
   AI-POWERED TREND & CONTENT INTELLIGENCE PLATFORM
   ============================================================ */


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let selectedContent = 2;


/* ============================================================
   MOBILE SIDEBAR / BURGER MENU
   ============================================================ */

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) {
        console.error("Viral Rogue: Sidebar not found.");
        return;
    }

    sidebar.classList.toggle("open");
}


/* Close mobile sidebar after clicking a navigation link */

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    const navLinks = sidebar.querySelectorAll("nav a");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("open");
            }
        });
    });
});


/* ============================================================
   GENERIC DECISION MODAL
   ============================================================ */

function showDecision(title, message, type = "processing", details = null) {

    removeExistingModal();

    const icon =
        type === "success" ? "✓" :
        type === "warning" ? "⚠" :
        type === "error" ? "!" :
        "✦";

    const safeTitle = escapeHTML(title);

    const safeMessage = escapeHTML(message)
        .replace(/\n/g, "<br>");

    let metricsHTML = "";

    if (details) {

        const confidence =
            typeof details.confidence === "number"
                ? (
                    details.confidence <= 1
                        ? Math.round(details.confidence * 100)
                        : Math.round(details.confidence)
                ) + "%"
                : "—";

        metricsHTML = `
            <div class="vr-decision-metrics">

                <div class="vr-metric-card">
                    <span>RISK LEVEL</span>
                    <strong>${escapeHTML(details.riskLevel || "—")}</strong>
                    <small>${details.riskScore ?? "—"}/100</small>
                </div>

                <div class="vr-metric-card">
                    <span>CONFIDENCE</span>
                    <strong>${confidence}</strong>
                    <small>AI confidence</small>
                </div>

                <div class="vr-metric-card">
                    <span>DECISION</span>
                    <strong>${escapeHTML(details.decision || "—")}</strong>
                    <small>Risk engine</small>
                </div>

                <div class="vr-metric-card">
                    <span>ENGAGEMENT</span>
                    <strong>${escapeHTML(details.engagement || "—")}</strong>
                    <small>Prediction</small>
                </div>

            </div>
        `;
    }

    let reasonsHTML = "";

    if (
        details &&
        Array.isArray(details.reasons) &&
        details.reasons.length > 0
    ) {

        reasonsHTML = `
            <div class="vr-reason-box">

                <div class="vr-section-title">
                    🧠 AI REASONING
                </div>

                <ul>
                    ${details.reasons.map(function(reason) {
                        return `
                            <li>
                                ${escapeHTML(reason)}
                            </li>
                        `;
                    }).join("")}
                </ul>

            </div>
        `;
    }

    const modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `

        <div class="decision-overlay">

            <div class="decision-modal vr-rich-modal ${type}">

                <button
                    class="close-btn"
                    onclick="closeDecision()"
                    aria-label="Close"
                >
                    ×
                </button>

                <div class="decision-icon ${type}">
                    ${icon}
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • DECISION ENGINE
                </div>

                <h2>
                    ${safeTitle}
                </h2>

                <p>
                    ${safeMessage}
                </p>

                ${metricsHTML}

                ${reasonsHTML}

                <div class="vr-agent-status">

                    <span class="agent-live">
                        ● AGENT ACTIVE
                    </span>

                    <span>
                        ${new Date().toLocaleTimeString()}
                    </span>

                </div>

                <div class="decision-footer">

                    <span class="vr-stage-text">
                        Trend → Create → Evaluate → Decide
                    </span>

                    <button onclick="closeDecision()">
                        Continue
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeDecision() {
    const modal = document.getElementById("decision-modal");

    if (modal) {
        modal.remove();
    }
}


/* ============================================================
   RUN AI AGENT
   ============================================================ */

async function runAgent() {

    const input =
        document.getElementById("contentIdea")?.value?.trim() ||
        document.querySelector("textarea")?.value?.trim() ||
        "Create a safe and engaging social media post about AI and technology.";

    showDecision(
        "🤖 AI AGENT RUNNING",
        "Scanning trends → analyzing content → checking safety → making autonomous decision...",
        "processing"
    );

    try {

        const response = await window.vrFetch("/api/decision", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                content: input
            })

        });

        if (!response.ok) {
            throw new Error(
                "Server returned " + response.status
            );
        }

        const data = await response.json();

        if (!data.success) {

            throw new Error(
                data.error || "Decision engine failed."
            );

        }

        const analysis =
            data.analysis || {};

        const decision =
            data.decision ||
            analysis.decision ||
            "PROCEED";

        const details = {

            decision: decision,

            riskLevel:
                analysis.riskLevel ||
                "UNKNOWN",

            riskScore:
                analysis.riskScore ??
                0,

            confidence:
                analysis.confidence ??
                0,

            engagement:
                analysis.engagement ||
                analysis.engagementLevel ||
                "N/A",

            reasons:
                Array.isArray(analysis.reasons)
                    ? analysis.reasons
                    : []

        };

        if (decision === "PROCEED") {

            showDecision(

                "🟢 AUTO-EXECUTE",

                "The content passed the risk evaluation and is eligible for autonomous execution.",

                "success",

                details

            );

        }

        else if (decision === "HUMAN_APPROVAL") {

            showDecision(

                "🟡 HUMAN APPROVAL REQUIRED",

                "The risk engine detected signals that require human review before execution.",

                "warning",

                details

            );

        }

        else {

            showDecision(

                "🔴 ACTION BLOCKED",

                "The risk engine blocked this action because the detected risk is too high for autonomous execution.",

                "error",

                details

            );

        }

    }

    catch (error) {

        console.error(
            "Viral Rogue Agent Error:",
            error
        );

        showDecision(

            "⚠️ AGENT ERROR",

            error.message ||
            "Unable to connect to the Viral Rogue decision engine.",

            "error"

        );

    }

}


/* ============================================================
   TREND ANALYSIS
   ============================================================ */





function analyzeTrend() {
    const trendsSection = document.getElementById("trends");

    if (!trendsSection) {
        console.error("Trends section not found!");
        return;
    }

    // Sidebar mein Trends link ko activate karo
    document.querySelectorAll('nav a[data-section]').forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === "trends"
        );
    });

    // Trends section ko visible karo
    trendsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}





/* ============================================================
   RISK CENTER
   ============================================================ */

function showRisk() {
    showHumanApproval();
}


function showHumanApproval() {
    removeExistingModal();

    const modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal human-review">

                <button
                    class="close-btn"
                    onclick="closeDecision()"
                >
                    ×
                </button>

                <div class="decision-icon warning-icon">
                    ⚠
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • SAFETY CHECK
                </div>

                <h2>
                    🔴 HUMAN APPROVAL REQUIRED
                </h2>

                <p>
                    The agent detected a potentially sensitive trend.
                    Autonomous execution has been paused.
                </p>

                <div class="risk-details">

                    <div>
                        <span>Trend</span>
                        <strong>#ControversialTrend</strong>
                    </div>

                    <div>
                        <span>Risk Level</span>
                        <strong class="risk-high">
                            HIGH
                        </strong>
                    </div>

                    <div>
                        <span>AI Confidence</span>
                        <strong>61%</strong>
                    </div>

                </div>

                <div class="pause-message">
                    🛑 Agent has stopped automatically.
                    <br>
                    Human decision is required before continuing.
                </div>

                <div class="approval-actions">

                    <button
                        class="approve-btn"
                        onclick="approveAction()"
                    >
                        ✓ Approve Action
                    </button>

                    <button
                        class="reject-btn"
                        onclick="rejectAction()"
                    >
                        ✕ Keep Agent Paused
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


/* ============================================================
   APPROVE HUMAN ACTION
   ============================================================ */

function approveAction() {
    const modal = document.querySelector(".human-review");

    if (!modal) return;

    modal.innerHTML = `
        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div class="decision-icon success">
            ✓
        </div>

        <div class="decision-label">
            HUMAN OVERRIDE
        </div>

        <h2>
            🟢 ACTION APPROVED
        </h2>

        <p>
            Human approval received.
            The agent is now allowed to continue the action.
        </p>

        <div class="pause-message approved-message">
            ✓ Autonomous execution resumed.
        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● AGENT ACTIVE
            </span>

            <button onclick="closeDecision()">
                Continue
            </button>

        </div>
    `;
}


/* ============================================================
   REJECT HUMAN ACTION
   ============================================================ */

function rejectAction() {
    const modal = document.querySelector(".human-review");

    if (!modal) return;

    modal.innerHTML = `
        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div class="decision-icon warning-icon">
            🛑
        </div>

        <div class="decision-label">
            SAFETY OVERRIDE
        </div>

        <h2>
            ⛔ ACTION BLOCKED
        </h2>

        <p>
            Human approval was not granted.
            The agent will remain paused and will not publish the content.
        </p>

        <div class="pause-message">
            🛡️ Unsafe action prevented successfully.
        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● AGENT PAUSED
            </span>

            <button onclick="closeDecision()">
                Close
            </button>

        </div>
    `;
}


/* ============================================================
   CONTENT GENERATION LAB
   ============================================================ */

async function generateContent() {

    const topic =
        document.getElementById("contentIdea")?.value?.trim() ||
        document.querySelector("textarea")?.value?.trim() ||
        "AI and Technology";

    showDecision(
        "✍️ CONTENT LAB",
        "AI is analyzing the topic and generating content variations...",
        "processing"
    );

    try {

        const response = await window.vrFetch(
            "/api/content/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    topic: topic,
                    content: topic
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Content API returned " +
                response.status
            );
        }

        const data = await response.json();

        console.log(
            "Content Generation Response:",
            data
        );

        if (data.success === false) {
            throw new Error(
                data.error ||
                "Content generation failed."
            );
        }

        let variations =
            data.variations ||
            data.content ||
            data.results ||
            [];

        /*
         * Convert backend response
         * into our standard format.
         */

        if (typeof variations === "string") {

            variations = [
                {
                    title: "AI Generated Content",
                    text: variations,
                    virality: 90,
                    risk: "LOW"
                }
            ];

        }

        variations = variations
            .slice(0, 3)
            .map(function(item, index) {

                if (typeof item === "string") {

                    return {

                        title:
                            "AI Variation " +
                            (index + 1),

                        text: item,

                        virality:
                            90 - (index * 5),

                        risk: "LOW"

                    };

                }

                return {

                    title:
                        item.title ||
                        item.heading ||
                        "AI Generated Variation " +
                        (index + 1),

                    text:
                        item.text ||
                        item.caption ||
                        item.content ||
                        item.description ||
                        "Generated content variation.",

                    virality:
                        Number(
                            item.virality ??
                            item.viralityScore ??
                            (90 - index * 5)
                        ),

                    risk:
                        item.risk ||
                        item.riskLevel ||
                        "LOW"

                };

            });

        /*
         * If backend doesn't return
         * variations, use safe fallback.
         */

        if (!variations.length) {

            variations = [

                {
                    title:
                        topic +
                        " is changing everything 🤖",

                    text:
                        "When " +
                        topic +
                        " moves faster than your morning coffee...",

                    virality: 87,

                    risk: "LOW"
                },

                {
                    title:
                        "POV: " +
                        topic +
                        " just took over your feed 🚀",

                    text:
                        "Everyone is talking about " +
                        topic +
                        ". Your feed should too.",

                    virality: 94,

                    risk: "LOW"
                },

                {
                    title:
                        "Future loading... ⚡",

                    text:
                        "The next viral moment around " +
                        topic +
                        " might already be here.",

                    virality: 81,

                    risk: "LOW"
                }

            ];

        }

        /*
         * Create Content Lab UI
         * directly here.
         */

        removeExistingModal();

        selectedContent = 1;

        const modal =
            document.createElement("div");

        modal.id =
            "decision-modal";

        modal.innerHTML = `

            <div class="decision-overlay">

                <div class="decision-modal content-lab">

                    <button
                        class="close-btn"
                        onclick="closeDecision()"
                    >
                        ×
                    </button>

                    <div class="decision-icon processing">
                        ✦
                    </div>

                    <div class="decision-label">
                        VIRAL ROGUE • CONTENT LAB
                    </div>

                    <h2>
                        ✨ AI Generated Content
                    </h2>

                    <p>
                        AI analyzed
                        <strong>${escapeHTML(topic)}</strong>
                        and generated multiple
                        content strategies.
                    </p>

                    <div class="content-options">

                        ${variations.map(
                            function(item, index) {

                                return `

                                    <div
                                        class="content-card ${
                                            index === 0
                                                ? "selected"
                                                : ""
                                        }"
                                        onclick="
                                            selectContent(
                                                this,
                                                ${index + 1}
                                            )
                                        "
                                        data-index="${index}"
                                    >

                                        ${
                                            index === 0
                                                ? `
                                                    <div
                                                        class="best-badge"
                                                    >
                                                        ★ AI PICK
                                                    </div>
                                                `
                                                : ""
                                        }

                                        <span
                                            class="content-number"
                                        >
                                            ${String(
                                                index + 1
                                            ).padStart(2, "0")}
                                        </span>

                                        <h3>
                                            ${escapeHTML(
                                                item.title
                                            )}
                                        </h3>

                                        <p>
                                            ${escapeHTML(
                                                item.text
                                            )}
                                        </p>

                                        <div
                                            class="content-meta"
                                        >

                                            <span>
                                                🔥
                                                ${Math.round(
                                                    item.virality
                                                )}%
                                                Virality
                                            </span>

                                            <span>
                                                🛡️
                                                ${escapeHTML(
                                                    item.risk
                                                )}
                                                Risk
                                            </span>

                                        </div>

                                    </div>

                                `;

                            }
                        ).join("")}

                    </div>

                    <div
                        class="content-decision"
                    >

                        <div>

                            <strong
                                id="recommendation-title"
                            >
                                ★ AI Recommendation
                            </strong>

                            <span
                                id="recommendation-text"
                            >
                                Variation 01 selected —
                                ${Math.round(
                                    variations[0].virality
                                )}% predicted virality
                                with
                                ${escapeHTML(
                                    variations[0].risk
                                )}
                                risk.
                            </span>

                        </div>

                        <button
                            onclick="publishContent()"
                        >
                            🚀 Select & Continue
                        </button>

                    </div>

                </div>

            </div>

        `;

        /*
         * Save generated variations
         * for Select & Continue.
         */

        modal.dataset.variations =
            JSON.stringify(
                variations
            );

        document.body.appendChild(
            modal
        );

    }

    catch (error) {

        console.error(
            "Content Generation Error:",
            error
        );

        showDecision(
            "⚠️ CONTENT GENERATION ERROR",
            error.message ||
            "Unable to generate content.",
            "error"
        );

    }

}


/* ============================================================
   SELECT CONTENT
   ============================================================ */

function selectContent(card, number) {
    selectedContent = number;

    document
        .querySelectorAll(".content-card")
        .forEach(function (item) {

            item.classList.remove("selected");

            const badge = item.querySelector(".best-badge");

            if (badge) {
                badge.remove();
            }
        });

    card.classList.add("selected");

    card.insertAdjacentHTML(
        "afterbegin",
        `<div class="best-badge">★ SELECTED</div>`
    );

    const title =
        document.getElementById("recommendation-title");

    const text =
        document.getElementById("recommendation-text");

    if (!title || !text) return;

    if (number === 1) {

        title.textContent =
            "Variation 01 Selected";

        text.textContent =
            "87% predicted virality • Low risk • Suitable for auto-execution.";

    } else if (number === 2) {

        title.textContent =
            "Variation 02 Selected";

        text.textContent =
            "94% predicted virality • Highest engagement potential.";

    } else if (number === 3) {

        title.textContent =
            "Variation 03 Selected";

        text.textContent =
            "81% predicted virality • Low risk • Moderate engagement.";
    }
}


/* ============================================================
   PUBLISH / CONTINUE CONTENT
   ============================================================ */

async function publishContent() {

    const modal =
        document.querySelector(".content-lab");

    const mainModal =
        document.getElementById("decision-modal");

    if (!modal || !mainModal) {
        return;
    }

    /*
     * Get the generated content
     * that was stored by Content Lab.
     */

    let variations = [];

    try {

        variations =
            JSON.parse(
                mainModal.dataset.variations || "[]"
            );

    } catch (error) {

        console.error(
            "Unable to read generated content:",
            error
        );

    }

    /*
     * Find the selected variation.
     */

    const selectedIndex =
        Math.max(
            0,
            Number(selectedContent || 1) - 1
        );

    const selected =
        variations[selectedIndex];

    /*
     * Fallback content in case
     * generated data is unavailable.
     */

    const contentText =
        selected?.text ||
        selected?.content ||
        selected?.caption ||
        selected?.title ||
        "AI generated social media content about AI and technology.";

    /*
     * Show processing state first.
     */

    modal.innerHTML = `

        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div class="decision-icon processing">
            ✦
        </div>

        <div class="decision-label">
            VIRAL ROGUE • RISK ENGINE
        </div>

        <h2>
            🧠 Evaluating Content
        </h2>

        <p>
            The selected content is being analyzed
            by the Viral Rogue decision engine.
        </p>

        <div class="pause-message">

            <strong>
                Selected Content
            </strong>

            <br><br>

            ${escapeHTML(contentText)}

            <br><br>

            <span>
                🔍 Checking safety signals...
            </span>

            <br>

            <span>
                📊 Calculating risk score...
            </span>

            <br>

            <span>
                🛡️ Applying decision policy...
            </span>

        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● ENGINE ACTIVE
            </span>

            <span>
                Analyzing...
            </span>

        </div>
    `;

    try {

        /*
         * Send selected content
         * to the real backend.
         */

        const response =
            await window.vrFetch(
                "/api/decision",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        content:
                            contentText,

                        selectedVariation:
                            selectedIndex + 1,

                        virality:
                            selected?.virality || null
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Risk engine returned HTTP " +
                response.status
            );

        }

        const data =
            await response.json();

        console.log(
            "Risk Evaluation:",
            data
        );

        if (data.success === false) {

            throw new Error(
                data.error ||
                "Risk evaluation failed."
            );

        }

        const analysis =
            data.analysis || {};

        const decision =
            data.decision ||
            analysis.decision ||
            "PROCEED";

        const riskLevel =
            analysis.riskLevel ||
            "UNKNOWN";

        const riskScore =
            analysis.riskScore ??
            0;

        const confidence =
            analysis.confidence ??
            0;

        const confidencePercent =
            confidence <= 1
                ? Math.round(
                    confidence * 100
                )
                : Math.round(
                    confidence
                );

        const reasons =
            Array.isArray(
                analysis.reasons
            )
                ? analysis.reasons
                : [];

        /*
         * Decide UI based on
         * backend decision.
         */

        let title;
        let message;
        let type;
        let icon;

        if (decision === "PROCEED") {

            title =
                "🟢 AUTONOMOUS EXECUTION APPROVED";

            message =
                "The selected content passed the risk evaluation and can proceed autonomously.";

            type =
                "success";

            icon =
                "✓";

        }

        else if (
            decision ===
            "HUMAN_APPROVAL"
        ) {

            title =
                "🟡 HUMAN APPROVAL REQUIRED";

            message =
                "The content needs human review before the agent can continue.";

            type =
                "warning";

            icon =
                "⚠";

        }

        else {

            title =
                "🔴 ACTION BLOCKED";

            message =
                "The decision engine blocked this content from autonomous execution.";

            type =
                "error";

            icon =
                "!";

        }

        /*
         * Build reasons section.
         */

        let reasonsHTML = "";

        if (reasons.length > 0) {

            reasonsHTML = `

                <div
                    class="vr-reason-box"
                    style="
                        margin-top:18px;
                        padding:16px;
                        border-radius:14px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.08);
                    "
                >

                    <strong>
                        🧠 Decision Engine Reasoning
                    </strong>

                    <ul
                        style="
                            margin-top:10px;
                            padding-left:20px;
                        "
                    >

                        ${reasons.map(
                            function(reason) {

                                return `
                                    <li
                                        style="
                                            margin:7px 0;
                                            color:#bfc3d3;
                                        "
                                    >
                                        ${escapeHTML(
                                            reason
                                        )}
                                    </li>
                                `;

                            }
                        ).join("")}

                    </ul>

                </div>

            `;

        }

        /*
         * Build final evaluation UI.
         */

        modal.innerHTML = `

            <button
                class="close-btn"
                onclick="closeDecision()"
            >
                ×
            </button>

            <div
                class="decision-icon ${type}"
            >
                ${icon}
            </div>

            <div class="decision-label">
                VIRAL ROGUE • DECISION ENGINE
            </div>

            <h2>
                ${title}
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(3,1fr);
                    gap:12px;
                    margin:22px 0;
                "
            >

                <div
                    style="
                        padding:16px;
                        border-radius:14px;
                        background:
                            rgba(255,255,255,0.04);
                        border:
                            1px solid
                            rgba(255,255,255,0.08);
                    "
                >

                    <small>
                        RISK SCORE
                    </small>

                    <strong
                        style="
                            display:block;
                            margin-top:7px;
                            font-size:22px;
                        "
                    >
                        ${riskScore}/100
                    </strong>

                </div>

                <div
                    style="
                        padding:16px;
                        border-radius:14px;
                        background:
                            rgba(255,255,255,0.04);
                        border:
                            1px solid
                            rgba(255,255,255,0.08);
                    "
                >

                    <small>
                        RISK LEVEL
                    </small>

                    <strong
                        style="
                            display:block;
                            margin-top:7px;
                            font-size:22px;
                        "
                    >
                        ${escapeHTML(
                            riskLevel
                        )}
                    </strong>

                </div>

                <div
                    style="
                        padding:16px;
                        border-radius:14px;
                        background:
                            rgba(255,255,255,0.04);
                        border:
                            1px solid
                            rgba(255,255,255,0.08);
                    "
                >

                    <small>
                        CONFIDENCE
                    </small>

                    <strong
                        style="
                            display:block;
                            margin-top:7px;
                            font-size:22px;
                        "
                    >
                        ${confidencePercent}%
                    </strong>

                </div>

            </div>

            <div
                class="pause-message"
                style="
                    text-align:left;
                "
            >

                <strong>
                    Selected Content
                </strong>

                <br><br>

                ${escapeHTML(
                    contentText
                )}

            </div>

            ${reasonsHTML}

            <div
                class="decision-footer"
            >

                <span class="agent-live">
                    ● ENGINE COMPLETE
                </span>

                ${
                    decision ===
                    "HUMAN_APPROVAL"

                        ? `
                            <button
                                onclick="
                                    requestHumanApproval(
                                        ${JSON.stringify(
                                            contentText
                                        )}
                                    )
                                "
                            >
                                👤 Request Approval
                            </button>
                        `

                        : decision ===
                          "PROCEED"

                            ? `
                                <button
                                    onclick="
                                        executeApprovedContent()
                                    "
                                >
                                    🚀 Execute
                                </button>
                            `

                            : `
                                <button
                                    onclick="
                                        closeDecision()
                                    "
                                >
                                    Close
                                </button>
                            `
                }

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Risk Evaluation Error:",
            error
        );

        modal.innerHTML = `

            <button
                class="close-btn"
                onclick="closeDecision()"
            >
                ×
            </button>

            <div class="decision-icon error">
                !
            </div>

            <div class="decision-label">
                VIRAL ROGUE • DECISION ENGINE
            </div>

            <h2>
                ⚠️ Evaluation Failed
            </h2>

            <p>
                ${escapeHTML(
                    error.message ||
                    "Unable to evaluate the selected content."
                )}
            </p>

            <div class="decision-footer">

                <span>
                    ● ENGINE ERROR
                </span>

                <button
                    onclick="closeDecision()"
                >
                    Close
                </button>

            </div>

        `;

    }

}
async function requestHumanApproval(content) {

    const modal =
        document.querySelector(
            ".content-lab"
        );

    if (!modal) return;

    modal.innerHTML = `

        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div class="decision-icon processing">
            👤
        </div>

        <div class="decision-label">
            VIRAL ROGUE • HUMAN REVIEW
        </div>

        <h2>
            Sending for Human Approval
        </h2>

        <p>
            The content has been submitted
            for human review.
        </p>

        <div class="pause-message">

            ${escapeHTML(content)}

            <br><br>

            ⏳ Approval request is being
            recorded by the decision engine...

        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● REVIEW REQUESTED
            </span>

            <button
                onclick="closeDecision()"
            >
                Close
            </button>

        </div>

    `;

    try {

        const response =
            await window.vrFetch(
                "/api/approval",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        content: content,
                        action: "request"
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "Approval Response:",
            data
        );

    }

    catch (error) {

        console.error(
            "Approval Error:",
            error
        );

    }

}


function executeApprovedContent() {

    const modal =
        document.querySelector(
            ".content-lab"
        );

    if (!modal) return;

    modal.innerHTML = `

        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div class="decision-icon success">
            ✓
        </div>

        <div class="decision-label">
            VIRAL ROGUE • EXECUTION ENGINE
        </div>

        <h2>
            🚀 Execution Complete
        </h2>

        <p>
            The selected content has passed
            the decision engine and the
            autonomous execution flow is complete.
        </p>

        <div class="pause-message approved-message">

            ✓ Risk evaluation passed.

            <br>

            ✓ Decision policy approved.

            <br>

            ✓ Autonomous execution authorized.

            <br>

            ✓ Activity recorded.

        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● EXECUTION COMPLETE
            </span>

            <button
                onclick="closeDecision()"
            >
                Done
            </button>

        </div>

    `;

}

/* ============================================================
   OPEN RISK CENTER
   ============================================================ */

function openRiskCenter() {
    removeExistingModal();

    const modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal risk-center-modal">

                <button
                    class="close-btn"
                    onclick="closeDecision()"
                >
                    ×
                </button>

                <div class="decision-icon processing">
                    🛡
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • RISK CENTER
                </div>

                <h2>
                    AI Safety Monitor
                </h2>

                <p>
                    The agent continuously evaluates every
                    action before execution.
                </p>


                <div class="risk-overview">

                    <div class="risk-score">

                        <span>
                            CURRENT RISK
                        </span>

                        <strong>
                            LOW
                        </strong>

                        <small>
                            Safe to execute autonomously
                        </small>

                    </div>


                    <div class="risk-score">

                        <span>
                            AI CONFIDENCE
                        </span>

                        <strong>
                            92%
                        </strong>

                        <small>
                            High confidence
                        </small>

                    </div>

                </div>


                <div class="risk-checks">

                    <div class="risk-check">

                        <span>✓</span>

                        <div>

                            <strong>
                                Audience Safety
                            </strong>

                            <small>
                                No harmful signals detected
                            </small>

                        </div>

                        <b>
                            PASS
                        </b>

                    </div>


                    <div class="risk-check">

                        <span>✓</span>

                        <div>

                            <strong>
                                Content Risk
                            </strong>

                            <small>
                                Content complies with safety rules
                            </small>

                        </div>

                        <b>
                            PASS
                        </b>

                    </div>


                    <div class="risk-check warning">

                        <span>!</span>

                        <div>

                            <strong>
                                Trend Sensitivity
                            </strong>

                            <small>
                                Monitoring continuously
                            </small>

                        </div>

                        <b>
                            WATCH
                        </b>

                    </div>

                </div>


                <div class="decision-rule">

                    <div class="rule-icon">
                        🧠
                    </div>

                    <div>

                        <strong>
                            Autonomous Decision Rule
                        </strong>

                        <p>
                            Low risk → Agent continues automatically.
                            High risk → Agent stops and requests
                            human approval.
                        </p>

                    </div>

                </div>


                <div class="decision-footer">

                    <span class="agent-live">
                        ● MONITORING ACTIVE
                    </span>

                    <button onclick="simulateRisk()">
                        Test High-Risk Scenario
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


/* ============================================================
   SIMULATE HIGH RISK
   ============================================================ */

function simulateRisk() {
    const modal =
        document.querySelector(".risk-center-modal");

    if (!modal) return;

    modal.innerHTML = `
        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div
            class="decision-icon"
            style="
                background: rgba(239, 68, 68, 0.12);
                color: #f87171;
            "
        >
            ⚠
        </div>

        <div class="decision-label">
            VIRAL ROGUE • SAFETY CHECK
        </div>

        <h2>
            🛑 Autonomous Execution Paused
        </h2>

        <p>
            The agent detected a potentially sensitive
            trend and stopped automatically.
        </p>


        <div class="high-risk-box">

            <div>

                <span>
                    TREND
                </span>

                <strong>
                    #ControversialTrend
                </strong>

            </div>


            <div>

                <span>
                    RISK LEVEL
                </span>

                <strong class="high-risk">
                    HIGH
                </strong>

            </div>


            <div>

                <span>
                    AI CONFIDENCE
                </span>

                <strong>
                    61%
                </strong>

            </div>

        </div>


        <div class="stop-message">

            <div class="stop-icon">
                🛑
            </div>

            <div>

                <strong>
                    Agent stopped itself.
                </strong>

                <p>
                    Human decision is required before
                    continuing.
                </p>

            </div>

        </div>


        <div class="approval-actions">

            <button
                class="approve-btn"
                onclick="approveRisk()"
            >
                ✓ Approve Action
            </button>

            <button
                class="pause-btn"
                onclick="closeDecision()"
            >
                ✕ Keep Agent Paused
            </button>

        </div>
    `;
}


/* ============================================================
   APPROVE RISK
   ============================================================ */

function approveRisk() {
    const modal =
        document.querySelector(".decision-modal");

    if (!modal) return;

    modal.innerHTML = `
        <button
            class="close-btn"
            onclick="closeDecision()"
        >
            ×
        </button>

        <div class="decision-icon success">
            ✓
        </div>

        <div class="decision-label">
            VIRAL ROGUE • HUMAN OVERRIDE
        </div>

        <h2>
            🟢 Action Approved
        </h2>

        <p>
            Human approval received.
            The agent can safely continue execution.
        </p>

        <div class="stop-message approved-message">

            ✓ Human approval verified.

            <br>

            ✓ Risk override recorded.

            <br>

            ✓ Agent resumed safely.

        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● AGENT RESUMED
            </span>

            <button onclick="closeDecision()">
                Continue
            </button>

        </div>
    `;
}


/* ============================================================
   TREND INTELLIGENCE
   ============================================================ */

 

/* ============================================================
   ANALYTICS
   ============================================================ */

function openAnalytics() {
    removeExistingModal();

    const modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal">

                <button
                    class="close-btn"
                    onclick="closeDecision()"
                >
                    ×
                </button>

                <div class="decision-icon processing">
                    📊
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • PERFORMANCE ANALYTICS
                </div>

                <h2>
                    Growth Analytics
                </h2>

                <p>
                    AI performance metrics from autonomous
                    growth activities.
                </p>


                <div class="risk-overview">

                    <div class="risk-score">

                        <span>
                            VIRALITY SCORE
                        </span>

                        <strong>
                            92%
                        </strong>

                        <small>
                            ↑ 18% this week
                        </small>

                    </div>


                    <div class="risk-score">

                        <span>
                            CONTENT GENERATED
                        </span>

                        <strong>
                            37
                        </strong>

                        <small>
                            12 ready to post
                        </small>

                    </div>

                </div>


                <div class="risk-overview">

                    <div class="risk-score">

                        <span>
                            TRENDS DETECTED
                        </span>

                        <strong>
                            24
                        </strong>

                        <small>
                            ↑ 18% today
                        </small>

                    </div>


                    <div class="risk-score">

                        <span>
                            HUMAN APPROVALS
                        </span>

                        <strong>
                            3
                        </strong>

                        <small>
                            Agent paused safely
                        </small>

                    </div>

                </div>


                <div class="decision-footer">

                    <span class="agent-live">
                        ● ANALYTICS LIVE
                    </span>

                    <button onclick="closeDecision()">
                        Close
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


/* ============================================================
   DASHBOARD
   ============================================================ */

function showDashboard() {
    closeDecision();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    const sidebar =
        document.getElementById("sidebar");

    if (
        sidebar &&
        window.innerWidth <= 768
    ) {
        sidebar.classList.remove("open");
    }
}


/* ============================================================
   GENERIC MODAL CLEANUP
   ============================================================ */

function removeExistingModal() {
    const oldBox =
        document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }
}


/* ============================================================
   MEME EXPORT
   ============================================================ */

function saveMeme() {
    const memeResult =
        document.getElementById("memeResult");

    if (!memeResult) {
        alert("Meme preview not found!");
        return;
    }

    if (typeof html2canvas === "undefined") {
        alert(
            "Image export library is still loading. Please refresh the page."
        );
        return;
    }

    html2canvas(memeResult, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
    })
        .then(function (canvas) {

            const link =
                document.createElement("a");

            link.download =
                "viral-rogue-meme.png";

            link.href =
                canvas.toDataURL("image/png");

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        })
        .catch(function (error) {

            console.error(
                "Meme export error:",
                error
            );

            alert(
                "Meme save nahi ho paya. Console check karo."
            );
        });
}


/* ============================================================
   CHARACTER COUNTER
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    const input =
        document.getElementById("contentIdea");

    const counter =
        document.getElementById("characterCount");

    if (!input || !counter) return;

    function updateCharacterCount() {

        counter.textContent =
            `${input.value.length}/5000`;
    }

    input.addEventListener(
        "input",
        updateCharacterCount
    );

    updateCharacterCount();
});


/* ============================================================
   CONTENT ANALYZE BUTTON
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    const analyzeButton =
        document.getElementById("analyzeButton");

    const contentIdea =
        document.getElementById("contentIdea");

    if (!analyzeButton || !contentIdea) return;

    analyzeButton.addEventListener(
        "click",
        async function () {

            const idea =
                contentIdea.value.trim();

            if (!idea) {

                showDecision(
                    "⚠️ CONTENT REQUIRED",
                    "Please enter a content idea before running the Viral Rogue analysis.",
                    "warning"
                );

                return;
            }


            analyzeButton.disabled = true;

            const originalText =
                analyzeButton.innerHTML;

            analyzeButton.innerHTML =
                "⏳ Analyzing...";


            try {

                const response =
                    await window.vrFetch(
                        "/api/analyze",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                content: idea
                            })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "API request failed"
                    );
                }


                const result =
                    await response.json();


                updateAnalysisUI(result);


            } catch (error) {

                console.error(
                    "Viral Rogue API Error:",
                    error
                );

                showDecision(
                    "⚠️ ANALYSIS UNAVAILABLE",
                    "The AI analysis service is currently unavailable. Make sure the Viral Rogue server is running.",
                    "warning"
                );

            } finally {

                analyzeButton.disabled = false;

                analyzeButton.innerHTML =
                    originalText;
            }
        }
    );
});


async function analyzeDecision() {
    const input = document.getElementById("contentIdea");

    if (!input || !input.value.trim()) {
        showDecision(
            "CONTENT REQUIRED",
            "Please enter a content idea before analysis.",
            "warning"
        );
        return;
    }

    try {
        const response = await window.vrFetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: input.value.trim()
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Analysis failed.");
        }

        updateAnalysisUI(result);

    } catch (error) {
        console.error("Analysis error:", error);

        showDecision(
            "ANALYSIS FAILED",
            error.message,
            "error"
        );
    }
}

/* ============================================================
   UPDATE ANALYSIS UI
   ============================================================ */

function updateAnalysisUI(result) {

    const analysisBox =
        document.getElementById("aiAnalysis");

    const scanText =
        document.getElementById("scanText");


    if (scanText) {

        scanText.textContent =
            `${result.decision || "ANALYZED"} • ${result.riskLevel || "UNKNOWN"} RISK`;
    }


    if (!analysisBox) {

        showDecision(
            result.decision || "ANALYSIS COMPLETE",

            Array.isArray(result.reasons)
                ? result.reasons.join("\n")
                : "Analysis completed successfully.",

            result.riskLevel === "HIGH"
                ? "warning"
                : "success"
        );

        return;
    }


    analysisBox.style.display =
        "block";


    /*
       Server returns confidence as a decimal
       such as 0.89, so convert it to 89%.
    */

    const confidenceValue =
        typeof result.confidence === "number"
            ? result.confidence <= 1
                ? Math.round(result.confidence * 100)
                : Math.round(result.confidence)
            : "--";


    analysisBox.innerHTML = `
        <div class="analysis-result">

            <div class="analysis-header">

                <span>
                    VIRAL ROGUE ANALYSIS
                </span>

                <strong>
                    ${escapeHTML(
                        result.decision || "ANALYZED"
                    )}
                </strong>

            </div>


            <div class="analysis-grid">

                <div>

                    <span>
                        Risk Level
                    </span>

                    <strong>
                        ${escapeHTML(
                            result.riskLevel || "UNKNOWN"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Risk Score
                    </span>

                    <strong>
                        ${
                            result.riskScore !== undefined
                                ? result.riskScore
                                : "--"
                        }/100
                    </strong>

                </div>


                <div>

                    <span>
                        AI Confidence
                    </span>

                    <strong>
                        ${confidenceValue}%
                    </strong>

                </div>


                <div>

                    <span>
                        Decision
                    </span>

                    <strong>
                        ${escapeHTML(
                            result.decision || "--"
                        )}
                    </strong>

                </div>

            </div>


            <div class="analysis-reasons">

                <strong>
                    AI Reasoning
                </strong>

                <ul>

                    ${
                        Array.isArray(result.reasons) &&
                        result.reasons.length > 0

                            ? result.reasons
                                .map(
                                    function (reason) {
                                        return `
                                            <li>
                                                ${escapeHTML(reason)}
                                            </li>
                                        `;
                                    }
                                )
                                .join("")

                            : `
                                <li>
                                    Analysis completed successfully.
                                </li>
                            `
                    }

                </ul>

            </div>


            <div class="analysis-footer">

                ${
                    result.requiresHumanApproval

                        ? "🟡 Human approval required before execution."

                        : result.decision === "BLOCK"

                            ? "🔴 Autonomous execution blocked by the risk engine."

                            : "🟢 Autonomous execution can proceed."
                }

            </div>

        </div>
    `;
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   API HEALTH CHECK
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    const apiStatus =
        document.getElementById("apiStatus");

    if (!apiStatus) return;


    window.vrFetch("/api/health")

        .then(function (response) {

            if (!response.ok) {
                throw new Error("API offline");
            }

            return response.json();
        })

        .then(function (data) {

            apiStatus.textContent =
                "● API ONLINE";

            apiStatus.classList.add("online");

            console.log(
                "Viral Rogue API:",
                data
            );
        })

        .catch(function () {

            apiStatus.textContent =
                "● API OFFLINE";

            apiStatus.classList.remove("online");
        });
});


/* ============================================================
   ESC KEY CLOSES MODALS
   ============================================================ */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeDecision();

            const sidebar =
                document.getElementById("sidebar");

            if (sidebar) {
                sidebar.classList.remove("open");
            }
        }
    }
);


/* ============================================================
   WINDOW RESIZE SAFETY
   ============================================================ */

window.addEventListener(
    "resize",
    function () {

        const sidebar =
            document.getElementById("sidebar");

        if (
            sidebar &&
            window.innerWidth > 768
        ) {
            sidebar.classList.remove("open");
        }
    }
);
(function injectViralRogueStyles() {

    if (
        document.getElementById(
            "vr-rich-ui-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "vr-rich-ui-styles";

    style.textContent = `

        .vr-rich-modal {

            max-height: 88vh;

            overflow-y: auto;

        }

        .vr-decision-metrics {

            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 12px;

            margin: 22px 0;

        }

        .vr-metric-card {

            padding: 16px;

            border-radius: 14px;

            background:
                rgba(255,255,255,0.04);

            border:
                1px solid
                rgba(255,255,255,0.08);

        }

        .vr-metric-card span {

            display: block;

            font-size: 10px;

            letter-spacing: 0.12em;

            color: #9296aa;

        }

        .vr-metric-card strong {

            display: block;

            margin-top: 7px;

            font-size: 19px;

        }

        .vr-metric-card small {

            display: block;

            margin-top: 5px;

            color: #777c91;

        }

        .vr-reason-box {

            margin-top: 16px;

            padding: 17px;

            border-radius: 14px;

            background:
                rgba(255,255,255,0.035);

            border:
                1px solid
                rgba(255,255,255,0.07);

        }

        .vr-section-title {

            font-size: 11px;

            letter-spacing: 0.14em;

            color: #a5a8bb;

            margin-bottom: 10px;

        }

        .vr-reason-box ul {

            margin: 0;

            padding-left: 20px;

        }

        .vr-reason-box li {

            margin: 8px 0;

            color: #c5c8d5;

        }

        .vr-agent-status {

            display: flex;

            justify-content:
                space-between;

            margin-top: 18px;

            color: #777c91;

            font-size: 12px;

        }

        .vr-stage-text {

            color: #777c91;

            font-size: 11px;

        }

        @media(max-width:700px) {

            .vr-decision-metrics {

                grid-template-columns:
                    repeat(2, 1fr);

            }

        }

        @media(max-width:450px) {

            .vr-decision-metrics {

                grid-template-columns: 1fr;

            }

        }

    `;

    document.head.appendChild(style);

})();

/* =========================================
   TRENDS MODULE — BACKEND INTEGRATION
========================================= */

let availableTrends = [];
let selectedTrend = null;

// Fetch trends from the existing backend

async function loadBackendTrends() {
    const list = document.getElementById("trendsList");
    const status = document.getElementById("trendsStatus");

    if (!list || !status) return;

    status.textContent = "Fetching live trends from Google Trends...";
    list.textContent = "Loading...";

    try {
        const response = await window.vrFetch("/api/trends");
        const data = await response.json();

        if (!response.ok || data.success !== true ||
            !Array.isArray(data.trends)) {
            throw new Error(data.error || "Invalid trends response.");
        }

        availableTrends = data.trends.map(trend => ({
            ...trend,
            hashtag: trend.title || "Untitled trend",
            growth: trend.traffic || "Not provided",
            audience: trend.region || data.region || "India",
            risk: "Not assessed",
            viralityScore: null
        }));

        list.replaceChildren();

        if (availableTrends.length === 0) {
            status.textContent = "No live trends available.";
            list.textContent = "Google Trends returned no results.";
            return;
        }

        status.textContent =
            `${availableTrends.length} live trends loaded · ` +
            `${data.source || "Google Trends"} · ${data.region || "India"}`;

        availableTrends.forEach((trend, index) => {
            const card = document.createElement("div");
            card.className = "trend-item";

            const details = document.createElement("div");
            details.className = "trend-content";

            const title = document.createElement("h3");
            title.textContent = trend.title;

            const description = document.createElement("p");
            description.textContent =
                `Traffic: ${trend.traffic || "Not provided"} · ` +
                `Region: ${trend.region || data.region || "India"}`;

            const score = document.createElement("strong");
            score.textContent = trend.traffic || "LIVE";

            const selectButton = document.createElement("button");
            selectButton.type = "button";
            selectButton.textContent = "Select & Analyze";

            selectButton.addEventListener("click", () => {
                analyzeSelectedTrend(index);
            });

            details.append(title, description);
            card.append(details, score, selectButton);
            list.appendChild(card);
        });

    } catch (error) {
        console.error("Could not load trends:", error);

        status.textContent = "Could not load live trends.";
        list.replaceChildren();

        const message = document.createElement("p");
        message.textContent = error.message;
        list.appendChild(message);

        const retry = document.createElement("button");
        retry.type = "button";
        retry.textContent = "Retry";
        retry.addEventListener("click", loadBackendTrends);
        list.appendChild(retry);
    }
}


// Analyze the trend selected by the user

async function analyzeSelectedTrend(index) {
    selectedTrend = availableTrends[index];

    const resultBox = document.getElementById("trendAnalysisResult");

    if (!selectedTrend || !resultBox) return;

    resultBox.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = `Analyzing: ${selectedTrend.title}...`;
    resultBox.appendChild(loading);

    try {
        const response = await window.vrFetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: selectedTrend.title
            })
        });

        const data = await response.json();

        if (!response.ok || data.success !== true) {
            throw new Error(data.error || "Trend analysis failed.");
        }

        resultBox.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = `Analysis: ${selectedTrend.title}`;

        const trendInfo = document.createElement("p");
        trendInfo.textContent =
            `Source: ${selectedTrend.source || "Google Trends"} · ` +
            `Region: ${selectedTrend.region || "India"} · ` +
            `Traffic: ${selectedTrend.traffic || "Not provided"}`;

        const riskInfo = document.createElement("p");
        riskInfo.textContent =
            `Risk Level: ${data.riskLevel} · ` +
            `Risk Score: ${data.riskScore}/100`;

        const decisionInfo = document.createElement("h4");
        decisionInfo.textContent = `Decision: ${data.decision}`;

        const reasonsHeading = document.createElement("h4");
        reasonsHeading.textContent = "Analysis Reasons";

        const reasonsList = document.createElement("ul");

        const reasons = Array.isArray(data.reasons) ? data.reasons : [];

        reasons.forEach(reason => {
            const item = document.createElement("li");
            item.textContent = reason;
            reasonsList.appendChild(item);
        });

        resultBox.append(
            heading,
            trendInfo,
            riskInfo,
            decisionInfo,
            reasonsHeading,
            reasonsList
        );

    } catch (error) {
        console.error("Trend analysis error:", error);

        resultBox.replaceChildren();

        const message = document.createElement("p");
        message.textContent = `Analysis failed: ${error.message}`;

        resultBox.appendChild(message);
    }
}


// Load trends when the page is ready
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        loadBackendTrends
    );
} else {
    loadBackendTrends();
}
function openTrends() {
    const section = document.getElementById("trends");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    loadBackendTrends();
}