
/* The Viral Rogue - API Configuration
   Backend URL will be added after deployment.
   Never put API keys or secrets in frontend files.
*/

(function () {
    const config = window.VR_CONFIG || {};
    const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/+$/, "");

    window.VR_CONFIG = { ...config, apiBaseUrl };
    window.VR_API_MODE = apiBaseUrl ? "connecting" : "demo";

    const demoTrends = [
        { id: "demo-1", title: "AI tools for everyday productivity", traffic: "Sample signal", source: "Demo data", region: "India" },
        { id: "demo-2", title: "Campus creator economy", traffic: "Sample signal", source: "Demo data", region: "India" },
        { id: "demo-3", title: "Short-form educational content", traffic: "Sample signal", source: "Demo data", region: "India" },
        { id: "demo-4", title: "Responsible generative AI", traffic: "Sample signal", source: "Demo data", region: "India" },
        { id: "demo-5", title: "Developer workflow automation", traffic: "Sample signal", source: "Demo data", region: "India" },
        { id: "demo-6", title: "Women in technology communities", traffic: "Sample signal", source: "Demo data", region: "India" }
    ];

    function analyzeText(input) {
        const text = String(input || "").trim().toLowerCase();

        const blocked = [
            "malware", "ransomware", "steal password",
            "credential theft", "phishing", "ddos",
            "bomb", "attack system"
        ];

        const sensitive = [
            "politics", "election", "religion", "violence",
            "medical", "health claim", "investment",
            "crypto", "controversial", "adult", "nsfw"
        ];

        const actions = [
            "publish", "post", "send email", "send message",
            "payment", "transfer money", "delete account"
        ];

        const reasons = [];
        const foundBlocked = blocked.filter(word => text.includes(word));
        const foundSensitive = sensitive.filter(word => text.includes(word));
        const foundActions = actions.filter(word => text.includes(word));

        let riskScore = 8;

        foundBlocked.forEach(word => {
            riskScore += 80;
            reasons.push(`High-risk signal detected: "${word}".`);
        });

        foundSensitive.forEach(word => {
            riskScore += 24;
            reasons.push(`Sensitive topic detected: "${word}".`);
        });

        foundActions.forEach(word => {
            riskScore += 12;
            reasons.push(`External action detected: "${word}".`);
        });

        riskScore = Math.min(100, riskScore);

        const decision = foundBlocked.length
            ? "BLOCK"
            : (foundSensitive.length || foundActions.length)
                ? "HUMAN_APPROVAL"
                : "PROCEED";

        if (!reasons.length) {
            reasons.push("No configured high-risk or sensitive keywords were detected.");
        }

        return {
            success: true,
            decision,
            riskLevel: riskScore >= 70 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW",
            riskScore,
            confidence: 0.82,
            requiresHumanApproval: decision === "HUMAN_APPROVAL",
            category: "RULE_BASED_PROTOTYPE",
            reasons,
            analyzedAt: new Date().toISOString()
        };
    }

    function makeDemoResponse(path, options = {}) {
        let body = {};

        try {
            body = options.body ? JSON.parse(options.body) : {};
        } catch (error) {
            body = {};
        }

        let payload;

        if (path === "/api/health") {
            payload = {
                success: true,
                service: "The Viral Rogue",
                status: "demo",
                engine: "Rule-based prototype",
                version: "2.1.0-demo"
            };
        }

        else if (path === "/api/trends") {
            payload = {
                success: true,
                source: "Sample preview",
                region: "India",
                demo: true,
                trends: demoTrends
            };
        }

        else if (path === "/api/stats") {
            payload = {
                success: true,
                stats: {
                    totalAnalyses: 0,
                    totalDecisions: 0,
                    totalGenerated: 0,
                    humanApprovals: 0,
                    blockedActions: 0,
                    autoProceed: 0,
                    activities: 0
                },
                demo: true
            };
        }

        else if (path === "/api/activity") {
            payload = {
                success: true,
                activities: [],
                demo: true
            };
        }

        else if (path === "/api/analyze" || path === "/api/decision") {
            const analysis = analyzeText(
                body.content || body.topic || body.text || body.idea || ""
            );

            payload = path === "/api/decision"
                ? {
                    success: true,
                    analysis,
                    decision: analysis.decision,
                    action: analysis.decision === "PROCEED"
                        ? "AUTO_EXECUTE"
                        : analysis.decision === "HUMAN_APPROVAL"
                            ? "PAUSE_FOR_REVIEW"
                            : "BLOCK_ACTION",
                    demo: true
                }
                : { ...analysis, demo: true };
        }

        else if (path === "/api/content/generate") {
            const topic = String(
                body.topic || body.idea || body.content || "AI and technology"
            ).trim();

            payload = {
                success: true,
                topic,
                variations: [
                    `POV: Everyone is talking about ${topic} 😭`,
                    `When ${topic} becomes the conversation of the day 🔥`,
                    `A creator's quick take on ${topic} ✨`
                ],
                note: "Template-based demo output. Connect an AI provider for production generation.",
                demo: true
            };
        }

        else if (path === "/api/approval") {
            payload = {
                success: true,
                approved: body.approved === true,
                status: body.approved === true ? "APPROVED" : "PAUSED",
                demo: true
            };
        }

        else {
            payload = {
                success: false,
                error: "Demo endpoint not found.",
                demo: true
            };
        }

        return new Response(JSON.stringify(payload), {
            status: payload.success ? 200 : 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    window.vrFetch = async function (path, options = {}) {
        const safePath = String(path || "");

        if (!apiBaseUrl) {
            window.VR_API_MODE = "demo";
            return makeDemoResponse(safePath, options);
        }

        try {
            const response = await window.fetch(
                `${apiBaseUrl}${safePath}`,
                options
            );

            window.VR_API_MODE = response.ok ? "connected" : "degraded";
            return response;
        }

        catch (error) {
            window.VR_API_MODE = "demo";

            console.warn(
                "Viral Rogue API unavailable. Running in demo mode.",
                error
            );

            return makeDemoResponse(safePath, options);
        }
    };

    window.VR_DEMO_TRENDS = demoTrends;

})();
