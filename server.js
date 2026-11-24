/* ============================================================
   THE VIRAL ROGUE
   Autonomous AI Growth & Risk Intelligence Platform

   Single Server Architecture
   --------------------------
   Website + API both run on PORT 5500.

   Main routes:
   GET  /
   GET  /api/health
   POST /api/analyze
   POST /api/decision
   POST /api/approval
   GET  /api/stats
   GET  /api/activity
   GET  /api/trends
   POST /api/content/generate
============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const Parser = require("rss-parser");

const trendsParser = new Parser({
  customFields: {
    item: [
      ["ht:approx_traffic", "approxTraffic"],
      ["ht:picture", "picture"]
    ]
  }
});

const GOOGLE_TRENDS_RSS =
  "https://trends.google.com/trending/rss?geo=IN";

let trendsCache = {
  data: null,
  fetchedAt: 0
};

const TRENDS_CACHE_MS = 5 * 60 * 1000;


/* ============================================================
   CONFIGURATION
============================================================ */

const PORT = 5500;

const HOST = "127.0.0.1";

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB


/* ============================================================
   MIME TYPES
============================================================ */

const MIME_TYPES = {

    ".html":
        "text/html; charset=utf-8",

    ".css":
        "text/css; charset=utf-8",

    ".js":
        "application/javascript; charset=utf-8",

    ".json":
        "application/json; charset=utf-8",

    ".png":
        "image/png",

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".webp":
        "image/webp",

    ".svg":
        "image/svg+xml",

    ".ico":
        "image/x-icon",

    ".txt":
        "text/plain; charset=utf-8"
};


/* ============================================================
   APPLICATION STATE
============================================================ */

const state = {

    startedAt:
        new Date().toISOString(),

    totalAnalyses: 0,

    totalDecisions: 0,

    totalGenerated: 0,

    humanApprovals: 0,

    blockedActions: 0,

    autoProceed: 0,

    activities: [],

    analyses: []
};


/* ============================================================
   DEMO TREND DATA
============================================================ */

const trends = [

    {
        hashtag: "#AIChallenge",

        title:
            "AI Challenge",

        viralityScore: 92,

        growth:
            "+18%",

        audience:
            "High",

        risk:
            "Low",

        confidence:
            94
    },

    {
        hashtag: "#TechMemes",

        title:
            "Tech Memes",

        viralityScore: 86,

        growth:
            "+13%",

        audience:
            "High",

        risk:
            "Low",

        confidence:
            91
    },

    {
        hashtag: "#FutureOfAI",

        title:
            "Future of AI",

        viralityScore: 81,

        growth:
            "+9%",

        audience:
            "Medium",

        risk:
            "Low",

        confidence:
            88
    }
];


/* ============================================================
   ACTIVITY LOGGER
============================================================ */

function addActivity(
    type,
    message,
    metadata = {}
) {

    const activity = {

        id:
            Date.now() +
            Math.random()
                .toString(16)
                .slice(2),

        type,

        message,

        metadata,

        timestamp:
            new Date().toISOString()
    };


    state.activities.unshift(
        activity
    );


    /* Keep latest 100 activities */

    if (
        state.activities.length >
        100
    ) {

        state.activities =
            state.activities.slice(
                0,
                100
            );
    }


    return activity;
}


/* ============================================================
   INITIAL ACTIVITY
============================================================ */

addActivity(
    "system",
    "Viral Rogue backend initialized.",
    {
        status: "online"
    }
);

addActivity(
    "trend",
    "Demo trend intelligence is ready.",
    {
        trends: trends.length
    }
);


/* ============================================================
   JSON RESPONSE
============================================================ */

function sendJSON(
    res,
    statusCode,
    data
) {

    if (
        res.headersSent
    ) {
        return;
    }


    const body =
        JSON.stringify(
            data,
            null,
            2
        );


    res.writeHead(
        statusCode,
        {

            "Content-Type":
                "application/json; charset=utf-8",

            "Cache-Control":
                "no-store",

            "Access-Control-Allow-Origin":
                "*",

            "Access-Control-Allow-Methods":
                "GET, POST, OPTIONS",

            "Access-Control-Allow-Headers":
                "Content-Type",

            "X-Content-Type-Options":
                "nosniff"
        }
    );


    res.end(body);
}


/* ============================================================
   TEXT RESPONSE
============================================================ */

function sendText(
    res,
    statusCode,
    message
) {

    if (
        res.headersSent
    ) {
        return;
    }


    res.writeHead(
        statusCode,
        {

            "Content-Type":
                "text/plain; charset=utf-8",

            "Cache-Control":
                "no-cache",

            "X-Content-Type-Options":
                "nosniff"
        }
    );


    res.end(message);
}


/* ============================================================
   READ REQUEST BODY
============================================================ */

function readBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            let finished =
                false;


            function fail(error) {

                if (
                    finished
                ) {
                    return;
                }

                finished = true;

                reject(error);
            }


            req.on(
                "data",
                (chunk) => {

                    body +=
                        chunk.toString(
                            "utf8"
                        );


                    if (
                        Buffer.byteLength(
                            body,
                            "utf8"
                        ) >
                        MAX_BODY_SIZE
                    ) {

                        fail(
                            new Error(
                                "REQUEST_TOO_LARGE"
                            )
                        );


                        req.destroy();
                    }
                }
            );


            req.on(
                "end",
                () => {

                    if (
                        finished
                    ) {
                        return;
                    }

                    finished = true;

                    resolve(body);
                }
            );


            req.on(
                "error",
                fail
            );
        }
    );
}


/* ============================================================
   PARSE JSON BODY
============================================================ */

async function getJSONBody(
    req
) {

    const raw =
        await readBody(req);


    if (
        !raw.trim()
    ) {

        return {};
    }


    try {

        return JSON.parse(raw);

    } catch (error) {

        throw new Error(
            "INVALID_JSON"
        );
    }
}


/* ============================================================
   RISK KEYWORDS
============================================================ */

const BLOCKED_KEYWORDS = [

    "malware",

    "ransomware",

    "steal password",

    "steal passwords",

    "credential theft",

    "account takeover",

    "phishing",

    "ddos",

    "attack system",

    "weapon",

    "bomb",

    "exploit",

    "illegal activity"
];


const SENSITIVE_KEYWORDS = [

    "politics",

    "political",

    "election",

    "religion",

    "violence",

    "death",

    "medical",

    "medicine",

    "health claim",

    "financial advice",

    "investment",

    "crypto",

    "lawsuit",

    "controversy",

    "controversial",

    "adult",

    "nsfw"
];


const APPROVAL_KEYWORDS = [

    "delete account",

    "delete post",

    "ban account",

    "payment",

    "pay",

    "password",

    "send money",

    "transfer money",

    "refund",

    "purchase",

    "publish",

    "post",

    "tweet",

    "send message",

    "send email",

    "change password",

    "approve transaction"
];


const MISINFORMATION_KEYWORDS = [

    "guaranteed",

    "100% true",

    "breaking news",

    "confirmed",

    "secret cure",

    "miracle cure",

    "everyone knows",

    "scientists hate this",

    "no side effects",

    "instant cure"
];


const COPYRIGHT_KEYWORDS = [

    "reupload",

    "pirated",

    "copyrighted",

    "full movie",

    "copy this video",

    "upload leaked",

    "leaked movie",

    "stolen content"
];


/* ============================================================
   FIND KEYWORDS
============================================================ */

function findKeywords(
    text,
    keywords
) {

    const found = [];

    for (
        const keyword of keywords
    ) {

        if (
            text.includes(
                keyword
            )
        ) {

            found.push(keyword);
        }
    }

    return found;
}


/* ============================================================
   CONTENT RISK ANALYZER
============================================================ */

function analyzeContent(
    content
) {

    const text =
        String(
            content || ""
        ).trim();


    const lower =
        text.toLowerCase();


    /* --------------------------------------------------------
       EMPTY INPUT
    -------------------------------------------------------- */

    if (
        !text
    ) {

        return {

            success: false,

            decision:
                "HUMAN_APPROVAL",

            riskLevel:
                "MEDIUM",

            riskScore:
                50,

            confidence:
                0,

            requiresHumanApproval:
                true,

            category:
                "EMPTY_INPUT",

            reasons: [
                "No content was provided."
            ],

            analyzedAt:
                new Date().toISOString()
        };
    }


    let riskScore = 0;

    const reasons = [];


    /* --------------------------------------------------------
       BLOCKED SIGNALS
    -------------------------------------------------------- */

    const blocked =
        findKeywords(
            lower,
            BLOCKED_KEYWORDS
        );


    blocked.forEach(
        (keyword) => {

            riskScore += 80;

            reasons.push(
                `High-risk signal detected: "${keyword}".`
            );
        }
    );


    /* --------------------------------------------------------
       SENSITIVE SIGNALS
    -------------------------------------------------------- */

    const sensitive =
        findKeywords(
            lower,
            SENSITIVE_KEYWORDS
        );


    sensitive.forEach(
        (keyword) => {

            riskScore += 25;

            reasons.push(
                `Sensitive topic detected: "${keyword}".`
            );
        }
    );


    /* --------------------------------------------------------
       CONSEQUENTIAL ACTIONS
    -------------------------------------------------------- */

    const approvals =
        findKeywords(
            lower,
            APPROVAL_KEYWORDS
        );


    approvals.forEach(
        (keyword) => {

            riskScore += 20;

            reasons.push(
                `Consequential action detected: "${keyword}".`
            );
        }
    );


    /* --------------------------------------------------------
       MISINFORMATION
    -------------------------------------------------------- */

    const misinformation =
        findKeywords(
            lower,
            MISINFORMATION_KEYWORDS
        );


    misinformation.forEach(
        (keyword) => {

            riskScore += 30;

            reasons.push(
                `Potentially unverified claim detected: "${keyword}".`
            );
        }
    );


    /* --------------------------------------------------------
       COPYRIGHT
    -------------------------------------------------------- */

    const copyright =
        findKeywords(
            lower,
            COPYRIGHT_KEYWORDS
        );


    copyright.forEach(
        (keyword) => {

            riskScore += 35;

            reasons.push(
                `Potential copyright risk detected: "${keyword}".`
            );
        }
    );


    /* --------------------------------------------------------
       LIMIT SCORE
    -------------------------------------------------------- */

    riskScore =
        Math.min(
            riskScore,
            100
        );


    /* --------------------------------------------------------
       DECISION
    -------------------------------------------------------- */

    let decision;

    let riskLevel;

    let requiresHumanApproval;

    let confidence;


    if (
        riskScore >= 70
    ) {

        decision =
            "BLOCK";

        riskLevel =
            "HIGH";

        requiresHumanApproval =
            false;

        confidence =
            0.91;

    } else if (
        riskScore >= 25
    ) {

        decision =
            "HUMAN_APPROVAL";

        riskLevel =
            "MEDIUM";

        requiresHumanApproval =
            true;

        confidence =
            0.82;

    } else {

        decision =
            "PROCEED";

        riskLevel =
            "LOW";

        requiresHumanApproval =
            false;

        confidence =
            0.89;
    }


    /* --------------------------------------------------------
       CATEGORY
    -------------------------------------------------------- */

    let category =
        "LOW_RISK_CONTENT";


    if (
        riskScore >= 70
    ) {

        category =
            "HIGH_RISK_CONTENT";

    } else if (
        riskScore >= 25
    ) {

        category =
            "SENSITIVE_CONTENT";
    }


    /* --------------------------------------------------------
       DEFAULT REASON
    -------------------------------------------------------- */

    if (
        reasons.length === 0
    ) {

        reasons.push(
            "No predefined high-risk indicators were detected."
        );
    }


    return {

        success: true,

        decision,

        riskLevel,

        riskScore,

        confidence,

        requiresHumanApproval,

        category,

        reasons:
            [...new Set(reasons)],

        analyzedAt:
            new Date().toISOString()
    };
}


/* ============================================================
   HEALTH API
============================================================ */

function healthResponse() {

    return {

        success: true,

        service:
            "The Viral Rogue",

        status:
            "online",

        server:
            "Node.js",

        port:
            PORT,

        engine:
            "Risk Decision Engine",

        architecture:
            "Trend → Create → Evaluate → Decide",

        version:
            "2.0.0",

        uptimeSeconds:
            Math.floor(
                process.uptime()
            ),

        timestamp:
            new Date().toISOString()
    };
}


/* ============================================================
   GENERATE CONTENT
============================================================ */

function generateContent(
    idea
) {

    const topic =
        String(
            idea || "AI and technology"
        ).trim();


    return {

        success: true,

        topic,

        variations: [

            `POV: Everyone is talking about ${topic} 😭`,

            `When ${topic} suddenly becomes the biggest trend 🔥`,

            `Nobody was ready for ${topic} 💀`
        ],

        generatedAt:
            new Date().toISOString(),

        note:
            "Prototype content generation. Connect an LLM provider for production AI generation."
    };
}


/* ============================================================
   API ROUTER
============================================================ */

async function handleAPI(
    req,
    res,
    pathname
) {

    /* --------------------------------------------------------
       CORS PREFLIGHT
    -------------------------------------------------------- */

    if (
        req.method === "OPTIONS"
    ) {

        res.writeHead(
            204,
            {
                "Access-Control-Allow-Origin":
                    "*",

                "Access-Control-Allow-Methods":
                    "GET, POST, OPTIONS",

                "Access-Control-Allow-Headers":
                    "Content-Type"
            }
        );

        res.end();

        return true;
    }


    /* ========================================================
       HEALTH
       GET /api/health
    ======================================================== */

    if (
        pathname ===
        "/api/health" &&
        req.method === "GET"
    ) {

        sendJSON(
            res,
            200,
            healthResponse()
        );

        return true;
    }


    /* ========================================================
       TRENDS
       GET /api/trends
    ======================================================== */

 

if (pathname === "/api/trends" && req.method === "GET") {
    try {
        const now = Date.now();

        // Cache trends for 5 minutes
        if (
            trendsCache.data &&
            now - trendsCache.fetchedAt < TRENDS_CACHE_MS
        ) {
            sendJSON(res, 200, {
                success: true,
                source: "Google Trends",
                region: "India",
                timeframe: "Past 24 hours",
                cached: true,
                total: trendsCache.data.length,
                trends: trendsCache.data
            });
            return true;
        }

        const trendsURL =
            "https://trends.google.com/trending?geo=IN&hl=en-IN&hours=24";

        const response = await fetch(trendsURL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
                "Accept-Language": "en-IN,en;q=0.9"
            },
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            throw new Error(
                `Google Trends returned HTTP ${response.status}`
            );
        }

        const html = await response.text();

        const match = html.match(
            /AF_initDataCallback\(\{key: 'ds:0', hash: '\d+', data:(\[.*?\]), sideChannel: \{\}\}\);/s
        );

        if (!match) {
            throw new Error(
                "Google Trends data structure was not found."
            );
        }

        const parsedData = JSON.parse(match[1]);

        const rawTrends = Array.isArray(parsedData[1])
            ? parsedData[1]
            : [];

        function formatTrendVolume(value) {
            if (typeof value !== "number") {
                return "Not provided";
            }

            if (value >= 1000000) {
                return `${Math.floor(value / 1000000)}M+`;
            }

            if (value >= 1000) {
                return `${Math.floor(value / 1000)}K+`;
            }

            return `${value}+`;
        }

        const liveTrends = rawTrends.map((trend, index) => {
            const title = trend[0] || "Untitled trend";

            const startedAt =
                Array.isArray(trend[3]) && trend[3][0]
                    ? new Date(trend[3][0] * 1000).toISOString()
                    : null;

            const volume = trend[6] ?? null;

            return {
                id: `IN-${index}-${startedAt || title}`,
                title,
                link: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
                publishedAt: startedAt,
                traffic: formatTrendVolume(volume),
                volume,
                growth: trend[8] ?? null,
                active: !trend[4],
                breakdown: trend[9] || [],
                categories: trend[10] || [],
                source: "Google Trends",
                region: "India"
            };
        });

        if (liveTrends.length === 0) {
            throw new Error("No trending topics were found.");
        }

        trendsCache = {
            data: liveTrends,
            fetchedAt: Date.now()
        };

        sendJSON(res, 200, {
            success: true,
            source: "Google Trends",
            region: "India",
            timeframe: "Past 24 hours",
            cached: false,
            total: liveTrends.length,
            trends: liveTrends
        });

    } catch (error) {
        console.error("Google Trends fetch failed:", error.message);

        sendJSON(res, 502, {
            success: false,
            source: "Google Trends",
            region: "India",
            error: error.message,
            trends: []
        });
    }

    return true;
}




    /* ========================================================
       STATS
       GET /api/stats
    ======================================================== */

    if (
        pathname ===
        "/api/stats" &&
        req.method === "GET"
    ) {

        sendJSON(
            res,
            200,
            {

                success: true,

                stats: {

                    totalAnalyses:
                        state.totalAnalyses,

                    totalDecisions:
                        state.totalDecisions,

                    totalGenerated:
                        state.totalGenerated,

                    humanApprovals:
                        state.humanApprovals,

                    blockedActions:
                        state.blockedActions,

                    autoProceed:
                        state.autoProceed,

                    activities:
                        state.activities.length
                }
            }
        );

        return true;
    }


    /* ========================================================
       ACTIVITY
       GET /api/activity
    ======================================================== */

    if (
        pathname ===
        "/api/activity" &&
        req.method === "GET"
    ) {

        sendJSON(
            res,
            200,
            {

                success: true,

                activities:
                    state.activities
            }
        );

        return true;
    }


    /* ========================================================
       ANALYZE CONTENT
       POST /api/analyze
    ======================================================== */

    if (
        pathname ===
        "/api/analyze" &&
        req.method === "POST"
    ) {

        try {

            const body =
                await getJSONBody(req);


            const content =
                body.content ||
                body.text ||
                body.topic ||
                body.idea ||
                "";


            const result =
                analyzeContent(
                    content
                );


            state.totalAnalyses++;

            state.analyses.unshift(
                result
            );


            addActivity(
                "analysis",
                "Content risk analysis completed.",
                {
                    decision:
                        result.decision,

                    riskLevel:
                        result.riskLevel,

                    riskScore:
                        result.riskScore
                }
            );


            sendJSON(
                res,
                result.success
                    ? 200
                    : 400,
                result
            );


            return true;

        } catch (error) {

            if (
                error.message ===
                "REQUEST_TOO_LARGE"
            ) {

                sendJSON(
                    res,
                    413,
                    {

                        success: false,

                        error:
                            "Request body too large.",

                        maxSize:
                            "1 MB"
                    }
                );

            } else if (
                error.message ===
                "INVALID_JSON"
            ) {

                sendJSON(
                    res,
                    400,
                    {

                        success: false,

                        error:
                            "Invalid JSON."
                    }
                );

            } else {

                console.error(
                    "Analyze error:",
                    error
                );


                sendJSON(
                    res,
                    500,
                    {

                        success: false,

                        error:
                            "Analysis failed."
                    }
                );
            }


            return true;
        }
    }


    /* ========================================================
       DECISION
       POST /api/decision
    ======================================================== */

    if (
        pathname ===
        "/api/decision" &&
        req.method === "POST"
    ) {

        try {

            const body =
                await getJSONBody(req);


            const content =
                body.content ||
                body.text ||
                body.idea ||
                "";


            const analysis =
                analyzeContent(
                    content
                );


            state.totalDecisions++;


            if (
                analysis.decision ===
                "PROCEED"
            ) {

                state.autoProceed++;

            } else if (
                analysis.decision ===
                "BLOCK"
            ) {

                state.blockedActions++;

            } else {

                state.humanApprovals++;
            }


            addActivity(
                "decision",
                `Decision engine returned ${analysis.decision}.`,
                {
                    decision:
                        analysis.decision,

                    riskLevel:
                        analysis.riskLevel,

                    riskScore:
                        analysis.riskScore
                }
            );


            sendJSON(
                res,
                200,
                {

                    success: true,

                    analysis,

                    decision:
                        analysis.decision,

                    action:
                        analysis.decision ===
                        "PROCEED"
                            ? "AUTO_EXECUTE"
                            : analysis.decision ===
                              "HUMAN_APPROVAL"
                                ? "PAUSE_FOR_REVIEW"
                                : "BLOCK_ACTION",

                    timestamp:
                        new Date().toISOString()
                }
            );


            return true;

        } catch (error) {

            sendJSON(
                res,
                400,
                {

                    success: false,

                    error:
                        error.message
                }
            );


            return true;
        }
    }


    /* ========================================================
       CONTENT GENERATION
       POST /api/content/generate
    ======================================================== */

    if (
        pathname ===
        "/api/content/generate" &&
        req.method === "POST"
    ) {

        try {

            const body =
                await getJSONBody(req);


            const idea =
                body.idea ||
                body.topic ||
                body.content ||
                "AI";


            const result =
                generateContent(
                    idea
                );


            state.totalGenerated++;


            addActivity(
                "content",
                "Content variations generated.",
                {
                    topic:
                        idea
                }
            );


            sendJSON(
                res,
                200,
                result
            );


            return true;

        } catch (error) {

            sendJSON(
                res,
                400,
                {

                    success: false,

                    error:
                        error.message
                }
            );


            return true;
        }
    }


    /* ========================================================
       HUMAN APPROVAL
       POST /api/approval
    ======================================================== */

    if (
        pathname ===
        "/api/approval" &&
        req.method === "POST"
    ) {

        try {

            const body =
                await getJSONBody(req);


            const approved =
                body.approved === true;


            if (
                approved
            ) {

                state.humanApprovals++;
            }


            addActivity(
                "approval",
                approved
                    ? "Human approval granted."
                    : "Human approval denied.",
                {
                    approved
                }
            );


            sendJSON(
                res,
                200,
                {

                    success: true,

                    approved,

                    status:
                        approved
                            ? "APPROVED"
                            : "PAUSED",

                    message:
                        approved
                            ? "Human approval received. Action may continue."
                            : "Action remains paused.",

                    timestamp:
                        new Date().toISOString()
                }
            );


            return true;

        } catch (error) {

            sendJSON(
                res,
                400,
                {

                    success: false,

                    error:
                        error.message
                }
            );


            return true;
        }
    }


    /* ========================================================
       UNKNOWN API
    ======================================================== */

    if (
        pathname.startsWith(
            "/api/"
        )
    ) {

        sendJSON(
            res,
            404,
            {

                success: false,

                error:
                    "API endpoint not found.",

                path:
                    pathname
            }
        );

        return true;
    }


    return false;
}


/* ============================================================
   SAFE STATIC FILE PATH
============================================================ */

function getSafeFilePath(
    pathname
) {

    const decoded =
        decodeURIComponent(
            pathname
        );


    const relativePath =
        decoded === "/" ||
        decoded === ""
            ? "index.html"
            : decoded.replace(
                /^[/\\]+/,
                ""
            );


    const root =
        path.resolve(
            __dirname
        );


    const target =
        path.resolve(
            root,
            relativePath
        );


    if (
        target !== root &&
        !target.startsWith(
            root +
            path.sep
        )
    ) {

        return null;
    }


    return target;
}


/* ============================================================
   STATIC FILE SERVER
============================================================ */

async function serveStatic(
    req,
    res,
    pathname
) {

    if (
        req.method !== "GET" &&
        req.method !== "HEAD"
    ) {

        sendText(
            res,
            405,
            "405 - Method Not Allowed"
        );

        return;
    }


    const filePath =
        getSafeFilePath(
            pathname
        );


    if (
        !filePath
    ) {

        sendText(
            res,
            403,
            "403 - Forbidden"
        );

        return;
    }


    try {

        const stat =
            await fs.promises.stat(
                filePath
            );


        if (
            stat.isDirectory()
        ) {

            sendText(
                res,
                403,
                "403 - Directory access denied"
            );

            return;
        }


        const data =
            await fs.promises.readFile(
                filePath
            );


        const ext =
            path.extname(
                filePath
            ).toLowerCase();


        const contentType =
            MIME_TYPES[ext] ||
            "application/octet-stream";


        res.writeHead(
            200,
            {

                "Content-Type":
                    contentType,

                "Content-Length":
                    data.length,

                "Cache-Control":
                    "no-cache, no-store, must-revalidate",

                "Pragma":
                    "no-cache",

                "X-Content-Type-Options":
                    "nosniff"
            }
        );


        if (
            req.method ===
            "HEAD"
        ) {

            res.end();

            return;
        }


        res.end(data);

    } catch (error) {

        if (
            error.code ===
            "ENOENT"
        ) {

            sendText(
                res,
                404,
                "404 - File Not Found"
            );

            return;
        }


        console.error(
            "Static file error:",
            error
        );


        sendText(
            res,
            500,
            "500 - Internal Server Error"
        );
    }
}


/* ============================================================
   HTTP SERVER
============================================================ */

const server =
    http.createServer(
        async (req, res) => {

            try {

                const requestURL =
                    new URL(
                        req.url,
                        `http://${req.headers.host || HOST}`
                    );


                const pathname =
                    requestURL.pathname;


                /* ------------------------------------------------
                   API FIRST
                ------------------------------------------------ */

                const handled =
                    await handleAPI(
                        req,
                        res,
                        pathname
                    );


                if (
                    handled
                ) {

                    return;
                }


                /* ------------------------------------------------
                   STATIC FILES
                ------------------------------------------------ */

                await serveStatic(
                    req,
                    res,
                    pathname
                );

            } catch (error) {

                console.error(
                    "Unhandled server error:",
                    error
                );


                if (
                    !res.headersSent
                ) {

                    sendJSON(
                        res,
                        500,
                        {

                            success: false,

                            error:
                                "Internal server error."
                        }
                    );
                }
            }
        }
    );


/* ============================================================
   SERVER ERROR HANDLING
============================================================ */

server.on(
    "error",
    (error) => {

        if (
            error.code ===
            "EADDRINUSE"
        ) {

            console.error("");
            console.error(
                `❌ Port ${PORT} is already in use.`
            );

            console.error(
                "Close Live Server or stop the other process using port 5500."
            );

            console.error("");

            return;
        }


        console.error(
            "Server error:",
            error
        );
    }
);


/* ============================================================
   START SERVER
============================================================ */

server.listen(
    PORT,
    HOST,
    () => {

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            "          THE VIRAL ROGUE"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `🌐 App:    http://${HOST}:${PORT}`
        );

        console.log(
            `❤️ Health: http://${HOST}:${PORT}/api/health`
        );

        console.log(
            "🧠 Analyze: POST /api/analyze"
        );

        console.log(
            "⚡ Decision: POST /api/decision"
        );

        console.log(
            "✍ Content: POST /api/content/generate"
        );

        console.log(
            "🛡 Approval: POST /api/approval"
        );

        console.log(
            "📊 Stats: GET /api/stats"
        );

        console.log(
            "🔥 Trends: GET /api/trends"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "Risk Engine: ONLINE"
        );

        console.log(
            "Decision Flow: PROCEED / HUMAN_APPROVAL / BLOCK"
        );

        console.log(
            "=============================================="
        );

        console.log("");
    }
);


/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */

function shutdown(
    signal
) {

    console.log(
        `\n${signal} received.`
    );


    server.close(
        () => {

            console.log(
                "The Viral Rogue server has stopped."
            );

            process.exit(0);
        }
    );
}


process.on(
    "SIGINT",
    () =>
        shutdown("SIGINT")
);


process.on(
    "SIGTERM",
    () =>
        shutdown("SIGTERM")
);