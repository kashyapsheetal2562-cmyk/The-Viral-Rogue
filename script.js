function runAgent() {
    showDecision(
        "🤖 AI AGENT RUNNING",
        "Scanning trends, analyzing engagement and evaluating risk...",
        "processing"
    );

    setTimeout(() => {
        showDecision(
            "🟢 AUTO-EXECUTE",
            "The trend is safe, relevant and high-confidence. Viral Rogue can proceed autonomously.",
            "success"
        );
    }, 1500);
}

function analyzeTrend() {
    showDecision(
        "🔥 TREND ANALYSIS",
        "Trend: #AIChallenge\n\nVirality Score: 92%\nAudience Relevance: High\nRisk Level: Low\nAI Confidence: 94%",
        "success"
    );
}

function showRisk() {
    showHumanApproval();
}

function showHumanApproval() {

    let oldBox = document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }

    let modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal human-review">

                <button class="close-btn" onclick="closeDecision()">×</button>

                <div class="decision-icon warning-icon">
                    ⚠
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • SAFETY CHECK
                </div>

                <h2>🔴 HUMAN APPROVAL REQUIRED</h2>

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
                        <strong class="risk-high">HIGH</strong>
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

                    <button class="approve-btn"
                            onclick="approveAction()">
                        ✓ Approve Action
                    </button>

                    <button class="reject-btn"
                            onclick="rejectAction()">
                        ✕ Keep Agent Paused
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


function approveAction() {

    let modal = document.querySelector(".human-review");

    modal.innerHTML = `
        <div class="decision-icon success">
            ✓
        </div>

        <div class="decision-label">
            HUMAN OVERRIDE
        </div>

        <h2>🟢 ACTION APPROVED</h2>

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

function approveRisk() {

    let modal = document.querySelector(".decision-modal");

    modal.innerHTML = `

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
            Human approval received. The agent can
            safely continue execution.
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
function rejectAction() {

    let modal = document.querySelector(".human-review");

    modal.innerHTML = `
        <div class="decision-icon warning-icon">
            🛑
        </div>

        <div class="decision-label">
            SAFETY OVERRIDE
        </div>

        <h2>⛔ ACTION BLOCKED</h2>

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

function generateContent() {

    let oldBox = document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }

    let modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal content-lab">

                <button class="close-btn" onclick="closeDecision()">×</button>

                <div class="decision-icon processing">
                    ✦
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • CONTENT LAB
                </div>

                <h2>🎨 AI Generated Content</h2>

                <p>
                    The agent analyzed the trend and generated
                    multiple content variations.
                </p>

                <div class="content-options">

                    <div class="content-card"
                         onclick="selectContent(this, 1)">

                        <span class="content-number">01</span>

                        <h3>
                            AI is changing everything 🤖
                        </h3>

                        <p>
                            When technology moves faster than
                            your morning coffee...
                        </p>

                        <div class="content-meta">
                            <span>🔥 87% Virality</span>
                            <span>Low Risk</span>
                        </div>

                    </div>


                    <div class="content-card selected"
                         onclick="selectContent(this, 2)">

                        <div class="best-badge">
                            ★ AI PICK
                        </div>

                        <span class="content-number">02</span>

                        <h3>
                            POV: AI just took over your feed 🚀
                        </h3>

                        <p>
                            Everyone is talking about AI.
                            Your feed should too.
                        </p>

                        <div class="content-meta">
                            <span>🔥 94% Virality</span>
                            <span>Low Risk</span>
                        </div>

                    </div>


                    <div class="content-card"
                         onclick="selectContent(this, 3)">

                        <span class="content-number">03</span>

                        <h3>
                            Future loading... ⚡
                        </h3>

                        <p>
                            The next viral moment might
                            already be here.
                        </p>

                        <div class="content-meta">
                            <span>🔥 81% Virality</span>
                            <span>Low Risk</span>
                        </div>

                    </div>

                </div>


                <div class="content-decision">

                    <div>

                        <strong id="recommendation-title">
                            AI Recommendation
                        </strong>

                        <span id="recommendation-text">
                            Variation 02 has the highest
                            predicted engagement.
                        </span>

                    </div>

                    <button onclick="publishContent()">
                        🚀 Select & Continue
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}



let selectedContent = 2;

function selectContent(card, number) {

    selectedContent = number;

    document.querySelectorAll(".content-card").forEach(card => {

        card.classList.remove("selected");

        const badge = card.querySelector(".best-badge");

        if (badge) {
            badge.remove();
        }

    });

    card.classList.add("selected");

    card.insertAdjacentHTML(
        "afterbegin",
        `<div class="best-badge">★ SELECTED</div>`
    );

    const title = document.getElementById("recommendation-title");
    const text = document.getElementById("recommendation-text");

    if (number === 1) {

        title.textContent = "Variation 01 Selected";

        text.textContent =
            "87% predicted virality • Low risk • Suitable for auto-execution.";

    } else if (number === 2) {

        title.textContent = "Variation 02 Selected";

        text.textContent =
            "94% predicted virality • Highest engagement potential.";

    } else if (number === 3) {

        title.textContent = "Variation 03 Selected";

        text.textContent =
            "81% predicted virality • Low risk • Moderate engagement.";

    }
}
function publishContent() {

    let modal = document.querySelector(".content-lab");

    let contentTitle = "";
    let virality = "";
    let message = "";

    if (selectedContent === 1) {

        contentTitle = "AI is changing everything 🤖";
        virality = "87%";
        message = "Good engagement potential with low execution risk.";

    } else if (selectedContent === 2) {

        contentTitle = "POV: AI just took over your feed 🚀";
        virality = "94%";
        message = "Highest predicted engagement among all variations.";

    } else if (selectedContent === 3) {

        contentTitle = "Future loading... ⚡";
        virality = "81%";
        message = "Moderate engagement potential with low execution risk.";
    }

    modal.innerHTML = `

        <button class="close-btn" onclick="closeDecision()">×</button>

        <div class="decision-icon success">
            ✓
        </div>

        <div class="decision-label">
            VIRAL ROGUE • CONTENT LAB
        </div>

        <h2>🟢 Content Ready</h2>

        <p>
            The AI selected Variation ${selectedContent}
            for the next stage.
        </p>

        <div class="pause-message approved-message">

            <strong>${contentTitle}</strong>

            <br><br>

            🔥 Virality Score: ${virality}

            <br>

            ✓ Risk check passed.

            <br>

            ✓ ${message}

            <br>

            ✓ Ready for autonomous execution.

        </div>

        <div class="decision-footer">

            <span class="agent-live">
                ● AGENT READY
            </span>

            <button onclick="closeDecision()">
                Continue
            </button>

        </div>
    `;
}


function showDecision(title, message, type) {

    let oldBox = document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }

    let modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal">

                <button class="close-btn" onclick="closeDecision()">×</button>

                <div class="decision-icon ${type}">
                    ${type === "success" ? "✓" : "✦"}
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • DECISION ENGINE
                </div>

                <h2>${title}</h2>

                <p>${message.replace(/\n/g, "<br>")}</p>

                <div class="decision-footer">

                    <span class="agent-live">
                        ● AGENT ACTIVE
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


function closeDecision() {
    let modal = document.getElementById("decision-modal");

    if (modal) {
        modal.remove();
    }
}



function openRiskCenter() {

    let oldBox = document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }

    let modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal risk-center-modal">

                <button class="close-btn"
                        onclick="closeDecision()">
                    ×
                </button>

                <div class="decision-icon processing">
                    🛡
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • RISK CENTER
                </div>

                <h2>AI Safety Monitor</h2>

                <p>
                    The agent continuously evaluates every
                    action before execution.
                </p>

                <div class="risk-overview">

                    <div class="risk-score">
                        <span>CURRENT RISK</span>

                        <strong>LOW</strong>

                        <small>
                            Safe to execute autonomously
                        </small>
                    </div>

                    <div class="risk-score">
                        <span>AI CONFIDENCE</span>

                        <strong>92%</strong>

                        <small>
                            High confidence
                        </small>
                    </div>

                </div>


                <div class="risk-checks">

                    <div class="risk-check">
                        <span>✓</span>

                        <div>
                            <strong>Audience Safety</strong>
                            <small>No harmful signals detected</small>
                        </div>

                        <b>PASS</b>
                    </div>


                    <div class="risk-check">
                        <span>✓</span>

                        <div>
                            <strong>Content Risk</strong>
                            <small>Content complies with safety rules</small>
                        </div>

                        <b>PASS</b>
                    </div>


                    <div class="risk-check warning">
                        <span>!</span>

                        <div>
                            <strong>Trend Sensitivity</strong>
                            <small>Monitoring continuously</small>
                        </div>

                        <b>WATCH</b>
                    </div>

                </div>


                <div class="decision-rule">

                    <div class="rule-icon">
                        🧠
                    </div>

                    <div>
                        <strong>Autonomous Decision Rule</strong>

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

function simulateRisk() {

    let modal = document.querySelector(".risk-center-modal");

    modal.innerHTML = `

        <button class="close-btn"
                onclick="closeDecision()">
            ×
        </button>

        <div class="decision-icon"
             style="
                background:rgba(239,68,68,0.12);
                color:#f87171;
             ">
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
                <span>TREND</span>
                <strong>#ControversialTrend</strong>
            </div>

            <div>
                <span>RISK LEVEL</span>
                <strong class="high-risk">
                    HIGH
                </strong>
            </div>

            <div>
                <span>AI CONFIDENCE</span>
                <strong>61%</strong>
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

            <button class="approve-btn"
                    onclick="approveRisk()">
                ✓ Approve Action
            </button>

            <button class="pause-btn"
                    onclick="closeDecision()">
                ✕ Keep Agent Paused
            </button>

        </div>
    `;
}


function openTrends() {

    let oldBox = document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }

    let modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal">

                <button class="close-btn"
                        onclick="closeDecision()">
                    ×
                </button>

                <div class="decision-icon processing">
                    🔥
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • TREND INTELLIGENCE
                </div>

                <h2>Trending Signals</h2>

                <p>
                    AI is continuously monitoring social
                    signals to identify potential viral trends.
                </p>

                <div class="trend-preview">

                    <div class="trend-row">
                        <strong>#AIChallenge</strong>
                        <span>92% 🔥</span>
                    </div>

                    <div class="trend-row">
                        <strong>#FutureTech</strong>
                        <span>86% 🔥</span>
                    </div>

                    <div class="trend-row">
                        <strong>#CreatorEconomy</strong>
                        <span>78% 🔥</span>
                    </div>

                    <div class="trend-row">
                        <strong>#TechTok</strong>
                        <span>74% 🔥</span>
                    </div>

                </div>

                <div class="decision-footer">

                    <span class="agent-live">
                        ● LIVE MONITORING
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


function openAnalytics() {

    let oldBox = document.getElementById("decision-modal");

    if (oldBox) {
        oldBox.remove();
    }

    let modal = document.createElement("div");

    modal.id = "decision-modal";

    modal.innerHTML = `
        <div class="decision-overlay">

            <div class="decision-modal">

                <button class="close-btn"
                        onclick="closeDecision()">
                    ×
                </button>

                <div class="decision-icon processing">
                    📊
                </div>

                <div class="decision-label">
                    VIRAL ROGUE • PERFORMANCE ANALYTICS
                </div>

                <h2>Growth Analytics</h2>

                <p>
                    AI performance metrics from autonomous
                    growth activities.
                </p>

                <div class="risk-overview">

                    <div class="risk-score">
                        <span>VIRALITY SCORE</span>
                        <strong>92%</strong>
                        <small>↑ 18% this week</small>
                    </div>

                    <div class="risk-score">
                        <span>CONTENT GENERATED</span>
                        <strong>37</strong>
                        <small>12 ready to post</small>
                    </div>

                </div>

                <div class="risk-overview">

                    <div class="risk-score">
                        <span>TRENDS DETECTED</span>
                        <strong>24</strong>
                        <small>↑ 18% today</small>
                    </div>

                    <div class="risk-score">
                        <span>HUMAN APPROVALS</span>
                        <strong>3</strong>
                        <small>Agent paused safely</small>
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

function showDashboard() {
    const modal = document.getElementById("decision-modal");

    if (modal) {
        modal.remove();
    }
}