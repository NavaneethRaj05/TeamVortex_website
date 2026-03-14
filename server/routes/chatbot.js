const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Event = require('../models/Event');
const ClubInfo = require('../models/ClubInfo');

// ─── STOP WORDS ───────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
    'a','an','the','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','should','could','may','might','must','can',
    'i','you','he','she','it','we','they','what','which','who','when','where',
    'why','how','this','that','these','those','am','to','of','in','for','on',
    'at','by','with','from','about','as','into','through','during','before',
    'after','above','below','between','under','again','further','then','once',
    'here','there','all','both','each','few','more','most','other','some','such',
    'no','nor','not','only','own','same','so','than','too','very','just','but',
    'if','or','because'
]);

// ─── NAIVE BAYES TRAINING CORPUS ─────────────────────────────────────────────
const NB_TRAINING = {
    greeting:     ['hi','hello','hey','hii','hola','namaste','good morning','good afternoon','good evening','sup','greetings'],
    thanks:       ['thank','thanks','thx','appreciate','grateful','ty','thank you','cheers'],
    event:        ['event','hackathon','contest','competition','workshop','seminar','upcoming','schedule','when is','next event','prayog','fest'],
    registration: ['register','sign up','join','enroll','participate','how to register','registration','signup','apply'],
    payment:      ['payment','pay','fee','price','cost','money','upi','bank','refund','transaction','utr','gpay','phonepe','paytm','transfer'],
    club:         ['club','team vortex','about','who are','what is','mission','vision','vortex','nce','navkis','college'],
    contact:      ['contact','email','phone','reach','call','message','address','instagram','linkedin','social'],
    help:         ['help','support','assist','guide','explain','how does','what should','confused','stuck'],
    team:         ['team','member','founder','president','coordinator','who leads','organizer','staff'],
    sponsor:      ['sponsor','partner','collaborate','partnership','sponsorship','brand','company']
};

// Pre-build NB model at startup
const NB_CLASS_WORD_FREQ = {};
const NB_CLASS_TOTAL_WORDS = {};
let NB_VOCAB_SIZE = 0;
(function buildNBModel() {
    const vocab = new Set();
    for (const [cls, phrases] of Object.entries(NB_TRAINING)) {
        NB_CLASS_WORD_FREQ[cls] = {};
        NB_CLASS_TOTAL_WORDS[cls] = 0;
        for (const phrase of phrases) {
            for (const w of phrase.toLowerCase().split(/\s+/)) {
                vocab.add(w);
                NB_CLASS_WORD_FREQ[cls][w] = (NB_CLASS_WORD_FREQ[cls][w] || 0) + 1;
                NB_CLASS_TOTAL_WORDS[cls]++;
            }
        }
    }
    NB_VOCAB_SIZE = vocab.size;
})();

// ─── ML ALGORITHMS ───────────────────────────────────────────────────────────

// 1. Tokenize + remove stop words
function tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// 2. N-gram extraction (unigrams + bigrams)
function getNgrams(tokens) {
    const ng = [...tokens];
    for (let i = 0; i < tokens.length - 1; i++) ng.push(tokens[i] + '_' + tokens[i + 1]);
    return ng;
}

// 3. TF-IDF vector
function buildTFIDF(text, corpus) {
    const tokens = getNgrams(tokenize(text));
    const tf = {};
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    const total = tokens.length || 1;
    for (const t in tf) tf[t] /= total;
    const N = corpus.length;
    const vec = {};
    for (const t in tf) {
        const df = corpus.filter(d => getNgrams(tokenize(d)).includes(t)).length;
        vec[t] = tf[t] * (Math.log((N + 1) / (df + 1)) + 1);
    }
    return vec;
}

// 4. Cosine similarity
function cosineSim(a, b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dot = 0, ma = 0, mb = 0;
    for (const k of keys) {
        const av = a[k] || 0, bv = b[k] || 0;
        dot += av * bv; ma += av * av; mb += bv * bv;
    }
    return (ma === 0 || mb === 0) ? 0 : dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

// 5. Naive Bayes intent classifier (Laplace smoothing)
function classifyIntent(query) {
    const words = tokenize(query);
    const classes = Object.keys(NB_TRAINING);
    let bestIntent = 'general', bestLogProb = -Infinity;
    for (const cls of classes) {
        let lp = Math.log(1 / classes.length);
        const total = NB_CLASS_TOTAL_WORDS[cls];
        for (const w of words) lp += Math.log(((NB_CLASS_WORD_FREQ[cls][w] || 0) + 1) / (total + NB_VOCAB_SIZE));
        if (lp > bestLogProb) { bestLogProb = lp; bestIntent = cls; }
    }
    return { intent: bestIntent, confidence: Math.min(1, Math.max(0, (bestLogProb + 50) / 50)) };
}

// 6. Levenshtein distance
function levenshtein(s1, s2) {
    const m = s1.length, n = s2.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j]);
    return dp[m][n];
}

// 7. Combined similarity: TF-IDF cosine + Levenshtein + keyword boost
function similarity(query, target, keywords, corpus) {
    const docs = corpus && corpus.length > 0 ? corpus : [query, target];
    const cosine = cosineSim(buildTFIDF(query, docs), buildTFIDF(target, docs));
    const s1 = query.toLowerCase().trim(), s2 = target.toLowerCase().trim();
    const lev = 1 - levenshtein(s1, s2) / Math.max(s1.length, s2.length, 1);
    let kwBoost = 0;
    if (keywords && keywords.length > 0) {
        const qt = tokenize(query);
        const matched = keywords.filter(k => qt.some(t => k.toLowerCase().includes(t) || t.includes(k.toLowerCase())));
        kwBoost = (matched.length / keywords.length) * 0.15;
    }
    return Math.min(1, cosine * 0.55 + lev * 0.3 + kwBoost);
}

// 8. Confidence decay for stale learned interactions (5% per 30 days, max 30%)
function decayScore(score, timestamp) {
    const days = (Date.now() - new Date(timestamp).getTime()) / 86400000;
    return score * (1 - Math.min(0.3, (days / 30) * 0.05));
}

// 9. Find best FAQ match
function findBestMatch(query, faqs) {
    if (!faqs || faqs.length === 0) return { match: null, score: 0 };
    const { intent } = classifyIntent(query);
    const corpus = faqs.filter(f => f.enabled).map(f => f.question).concat([query]);
    let best = null, bestScore = 0;
    for (const faq of faqs) {
        if (!faq.enabled) continue;
        let s = similarity(query, faq.question, faq.keywords, corpus);
        if (faq.category === intent) s = Math.min(1, s * 1.15);
        if ((faq.qualityScore || 0) > 0.7) s = Math.min(1, s * 1.08);
        if ((faq.usageCount || 0) > 10) s = Math.min(1, s * 1.03);
        if (s > bestScore) { bestScore = s; best = faq; }
    }
    return { match: best, score: bestScore };
}

// 10. Check learned interactions
async function checkLearnedInteractions(query, chatbot) {
    if (!chatbot.settings.mlEnabled) return null;
    const { intent } = classifyIntent(query);
    const corpus = chatbot.learnedInteractions.filter(l => l.approved && l.suggestedAnswer).map(l => l.userQuery).concat([query]);
    let best = null, bestScore = 0;
    for (const l of chatbot.learnedInteractions) {
        if (!l.approved || !l.suggestedAnswer) continue;
        let s = similarity(query, l.userQuery, [], corpus);
        for (const rq of (l.relatedQueries || [])) s = Math.max(s, similarity(query, rq, [], corpus));
        s = decayScore(s, l.timestamp);
        if (l.category === intent) s = Math.min(1, s * 1.12);
        const pos = (l.userFeedback || []).filter(f => f.wasHelpful).length;
        const tot = (l.userFeedback || []).length;
        if (tot > 0) s = Math.min(1, s * (1 + (pos / tot) * 0.15));
        if (s > bestScore) { bestScore = s; best = l; }
    }
    const threshold = chatbot.settings.similarityThreshold || 0.65;
    if (best && bestScore > threshold) {
        best.frequency = (best.frequency || 0) + 1;
        let response = best.suggestedAnswer;
        if (best.autoGeneratedAnswers && best.autoGeneratedAnswers.length > 0) {
            const top = best.autoGeneratedAnswers.sort((a, b) => b.confidence - a.confidence)[0];
            if (top.confidence > 0.85) response = top.answer;
        }
        await chatbot.save();
        return { response, confidence: bestScore, learnedId: best._id, intent };
    }
    return null;
}

// 11. Auto-generate answer from similar FAQs
function tryAutoGenerateAnswer(query, chatbot) {
    const { intent } = classifyIntent(query);
    const corpus = chatbot.customFAQs.filter(f => f.enabled).map(f => f.question).concat([query]);
    const candidates = chatbot.customFAQs
        .filter(f => f.enabled)
        .map(f => ({ faq: f, s: similarity(query, f.question, f.keywords, corpus) }))
        .filter(x => x.s > 0.45)
        .sort((a, b) => {
            const score = x => x.s * 0.5 + (x.faq.qualityScore || 0) * 0.3 + (x.faq.category === intent ? 0.1 : 0) + Math.min((x.faq.usageCount || 0) / 100, 1) * 0.1;
            return score(b) - score(a);
        });
    if (candidates.length === 0) return null;
    const best = candidates[0];
    if (best.s > 0.65) return { answer: best.faq.answer, confidence: best.s, source: 'similar_faq', faqId: best.faq._id };
    if (candidates.length > 1 && best.s > 0.55) return { answer: best.faq.answer + '\n\n💡 You might also want to ask about related topics!', confidence: best.s * 0.88, source: 'combined_faq', faqId: best.faq._id };
    return null;
}

// 12. Record unresolved query + auto-promote to FAQ
async function recordUnresolvedQuery(query, chatbot) {
    if (!chatbot.settings.mlEnabled) return;
    const { intent } = classifyIntent(query);
    const corpus = chatbot.learnedInteractions.map(l => l.userQuery).concat([query]);
    let existing = null, highestSim = 0;
    for (const l of chatbot.learnedInteractions) {
        const s = similarity(query, l.userQuery, [], corpus);
        if (s > highestSim) { highestSim = s; if (s > 0.82) existing = l; }
    }
    if (existing) {
        existing.frequency = (existing.frequency || 0) + 1;
        if (!existing.relatedQueries.includes(query)) existing.relatedQueries.push(query);
        if (chatbot.settings.enableAutoImprovement && !existing.suggestedAnswer) {
            const auto = tryAutoGenerateAnswer(query, chatbot);
            if (auto) existing.autoGeneratedAnswers.push({ ...auto, timestamp: new Date() });
        }
    } else {
        const newL = { userQuery: query, frequency: 1, timestamp: new Date(), relatedQueries: [], autoGeneratedAnswers: [], category: intent };
        if (chatbot.settings.enableAutoImprovement) {
            const auto = tryAutoGenerateAnswer(query, chatbot);
            if (auto) newL.autoGeneratedAnswers.push({ ...auto, timestamp: new Date() });
        }
        chatbot.learnedInteractions.push(newL);
        chatbot.analytics.learnedQueries = (chatbot.analytics.learnedQueries || 0) + 1;
    }
    chatbot.analytics.unresolvedQueries = (chatbot.analytics.unresolvedQueries || 0) + 1;

    // Auto-promote to FAQ if threshold reached
    const target = existing || chatbot.learnedInteractions[chatbot.learnedInteractions.length - 1];
    const autoThreshold = chatbot.settings.autoLearnThreshold || 3;
    if (target.frequency >= autoThreshold && !target.approved && target.autoGeneratedAnswers.length > 0) {
        const best = target.autoGeneratedAnswers.sort((a, b) => b.confidence - a.confidence)[0];
        if (best.confidence > 0.85) {
            target.suggestedAnswer = best.answer;
            target.approved = true;
            chatbot.customFAQs.push({
                question: target.userQuery,
                answer: best.answer,
                keywords: tokenize(target.userQuery),
                category: target.category || 'general',
                enabled: true,
                usageCount: target.frequency
            });
            chatbot.learnedInteractions = chatbot.learnedInteractions.filter(l => l._id.toString() !== target._id.toString());
        }
    }

    // N-gram pattern tracking
    const tokens = tokenize(query).filter(w => w.length > 3);
    for (let i = 0; i < tokens.length; i++) {
        const phrases = [tokens[i]];
        if (i < tokens.length - 1) phrases.push(tokens[i] + ' ' + tokens[i + 1]);
        if (i < tokens.length - 2) phrases.push(tokens[i] + ' ' + tokens[i + 1] + ' ' + tokens[i + 2]);
        for (const phrase of phrases) {
            const p = chatbot.queryPatterns.find(x => x.pattern === phrase);
            if (p) { p.frequency++; p.lastUpdated = new Date(); }
            else chatbot.queryPatterns.push({ pattern: phrase, frequency: 1, category: intent, confidence: 0, lastUpdated: new Date() });
        }
    }
    await chatbot.save();
}

// ─── AUTOMATIC RESPONSES ─────────────────────────────────────────────────────
async function getAutomaticResponse(query, intent, confidence) {
    const q = query.toLowerCase();
    switch (intent) {
        case 'greeting': {
            const opts = [
                "Hey there! 👋 I'm VortexBot ML. Ask me about events, registration, payments, or Team Vortex!",
                "Hello! 🎉 Welcome to Team Vortex! What can I help you with today?",
                "Hi! 😊 I'm learning from every conversation. Ask me anything!"
            ];
            return { response: opts[Math.floor(Math.random() * opts.length)], suggestions: ['Upcoming events','How to register?','About Team Vortex','Contact us'], intent: 'greeting', confidence: 1.0 };
        }
        case 'thanks':
            return { response: "You're welcome! 😊 Feel free to ask anything else!", suggestions: ['Upcoming events','Contact us'], intent: 'thanks', confidence: 1.0 };
        case 'event': {
            try {
                const events = await Event.find({ status: { $ne: 'draft' }, date: { $gte: new Date() } })
                    .select('title date location price').sort({ date: 1 }).limit(3);
                if (events.length > 0) {
                    let r = "🎯 Upcoming events:\n\n";
                    events.forEach((e, i) => { r += `${i+1}. **${e.title}**\n   📅 ${new Date(e.date).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}\n   📍 ${e.location}\n   💰 ${e.price > 0 ? `₹${e.price}` : 'Free'}\n\n`; });
                    r += "Visit our Events page to register!";
                    return { response: r, suggestions: ['How to register?','Payment methods'], intent: 'event', confidence };
                }
            } catch (e) { console.error(e); }
            return { response: "No upcoming events right now, but stay tuned! 🎉", suggestions: ['Contact us','About Team Vortex'], intent: 'event', confidence };
        }
        case 'registration':
            return { response: "📝 **Registration:**\n\n1️⃣ Visit Events page\n2️⃣ Choose event\n3️⃣ Click 'Register Now'\n4️⃣ Fill details\n5️⃣ Complete payment\n6️⃣ Enter UTR number\n7️⃣ Wait for confirmation email (24-48 hrs)", suggestions: ['Upcoming events','Payment methods'], intent: 'registration', confidence };
        case 'payment':
            return { response: "💳 **Payment:**\n\n• UPI (GPay, PhonePe, Paytm)\n• Bank transfer (NEFT/IMPS)\n• Cash (select events)\n\nAfter payment: upload screenshot + enter UTR number. Admin verifies in 24-48 hrs.", suggestions: ['Refund policy','Registration help'], intent: 'payment', confidence };
        case 'club': {
            try {
                const info = await ClubInfo.findOne();
                if (info) return { response: `🌟 **About Team Vortex:**\n\n${info.vision || 'Premier technical club at Navkis College of Engineering.'}\n\n🎯 **Mission:** ${info.mission || 'Empower students with technical skills.'}`, suggestions: ['Team members','Contact us','Our events'], intent: 'club', confidence };
            } catch (e) { console.error(e); }
            return { response: "🌟 Team Vortex is a premier technical club at Navkis College of Engineering.\n\nWe organize hackathons, workshops, competitions, and tech talks!", suggestions: ['Team members','Contact us','Our events'], intent: 'club', confidence };
        }
        case 'contact':
            return { response: "📞 **Contact:**\n\n📧 teamvortexnce@gmail.com\n📱 @teamvortex_nce (Instagram)\n💼 Team Vortex NCE (LinkedIn)\n🌐 teamvortex.in\n\nWe respond within 24 hours!", suggestions: ['Event queries','Sponsorship'], intent: 'contact', confidence };
        case 'help':
            return { response: "🤝 I can help with:\n\n📅 Events • 📝 Registration • 💳 Payments • 🏢 Club Info • 📞 Contact • 👥 Team • 🤝 Sponsors\n\nJust ask!", suggestions: ['Upcoming events','How to register?','About Team Vortex','Contact us'], intent: 'help', confidence };
        case 'team':
            return { response: "👥 **Our Team:**\n\nTeam Vortex is led by passionate students dedicated to tech.\n\nVisit our Team page to meet our founders, coordinators, and members!", suggestions: ['View team page','How to join','Contact us'], intent: 'team', confidence };
        case 'sponsor':
            return { response: "🤝 **Sponsorship:**\n\nTiers: Title, Platinum, Gold, Silver, Bronze, Tech Partners, Media Partners\n\n📧 teamvortexnce@gmail.com (Subject: Sponsorship Inquiry)", suggestions: ['Contact us','View sponsors'], intent: 'sponsor', confidence };
    }
    if (q.includes('website') || q.includes('navigate') || q.includes('page'))
        return { response: "🌐 **Website:**\n🏠 Home | 📅 Events | 🏆 Contests | 👥 Team | 🤝 Sponsors\n\nUse the top navigation to explore!", suggestions: ['View events','Meet the team','Contact us'], intent: 'general', confidence: 0.7 };
    return null;
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// GET /api/chatbot/data
router.get('/data', async (req, res) => {
    try {
        let chatbot = await Chatbot.findOne();
        if (!chatbot) {
            chatbot = new Chatbot({
                welcomeMessage: "Hi! I'm VortexBot ML. How can I help you today?",
                customFAQs: [
                    { question: "What is Team Vortex?", answer: "Team Vortex is a technical club at Navkis College of Engineering focused on innovation, technology, and student development.", keywords: ["team vortex","club","about"], category: "club" },
                    { question: "How do I register for events?", answer: "Visit our Events page, select the event, click 'Register Now', fill in your details, and complete payment if required. You'll receive a confirmation email.", keywords: ["register","sign up","join event"], category: "registration" },
                    { question: "What payment methods do you accept?", answer: "We accept UPI payments, bank transfers, and cash for some events. After registration, upload your payment screenshot with UTR number for verification.", keywords: ["payment","pay","fee","money"], category: "payment" }
                ],
                quickReplies: [
                    { text: "Upcoming events", category: "events" },
                    { text: "How to register?", category: "registration" },
                    { text: "Contact us", category: "general" }
                ]
            });
            await chatbot.save();
        }
        res.json({ welcomeMessage: chatbot.welcomeMessage, quickReplies: chatbot.quickReplies, settings: chatbot.settings });
    } catch (err) { res.status(500).json({ message: 'Failed to load chatbot data' }); }
});

// POST /api/chatbot/query
router.post('/query', async (req, res) => {
    const { message, previousQuery, sessionQueries = [] } = req.body;
    const startTime = Date.now();
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });
    try {
        let chatbot = await Chatbot.findOne();
        if (!chatbot) return res.json({ response: "I'm being set up. Please try again later.", suggestions: [], responseId: null });

        chatbot.analytics.totalQueries += 1;
        const { intent, confidence } = classifyIntent(message);
        const context = { previousQuery: previousQuery || null, sessionQueries };

        // 1. Learned interactions (ML memory with decay + feedback weighting)
        const learnedRes = await checkLearnedInteractions(message, chatbot);
        if (learnedRes) {
            chatbot.analytics.resolvedQueries += 1;
            const entry = { query: message, response: learnedRes.response, wasHelpful: null, responseTime: Date.now() - startTime, timestamp: new Date(), context };
            chatbot.trainingData.push(entry);
            await chatbot.save();
            return res.json({ response: learnedRes.response + "\n\n💡 (Improved from user feedback)", suggestions: chatbot.settings.showSuggestions ? chatbot.quickReplies.slice(0, chatbot.settings.maxSuggestions).map(q => q.text) : [], responseId: entry._id, learnedId: learnedRes.learnedId, confidence: learnedRes.confidence, intent, askFeedback: chatbot.settings.enableFeedback });
        }

        // 2. FAQ match (TF-IDF cosine similarity)
        const { match: faqMatch, score: faqScore } = findBestMatch(message, chatbot.customFAQs);
        if (faqMatch && faqScore > (chatbot.settings.similarityThreshold || 0.6)) {
            faqMatch.usageCount = (faqMatch.usageCount || 0) + 1;
            faqMatch.lastUsed = new Date();
            let responseText = faqMatch.answer;
            let usedAlt = false;
            if (faqMatch.alternativeAnswers && faqMatch.alternativeAnswers.length > 0) {
                const bestAlt = faqMatch.alternativeAnswers.sort((a, b) => b.score - a.score)[0];
                if (bestAlt.score > (faqMatch.qualityScore || 0) + 0.3) { responseText = bestAlt.answer; bestAlt.usageCount += 1; usedAlt = true; }
            }
            chatbot.analytics.resolvedQueries += 1;
            const entry = { query: message, response: responseText, wasHelpful: null, responseTime: Date.now() - startTime, timestamp: new Date(), context };
            chatbot.trainingData.push(entry);
            await chatbot.save();
            return res.json({ response: responseText + (usedAlt ? "\n\n✨ (Enhanced answer)" : ""), suggestions: chatbot.settings.showSuggestions ? chatbot.quickReplies.slice(0, chatbot.settings.maxSuggestions).map(q => q.text) : [], responseId: entry._id, faqId: faqMatch._id, confidence: faqScore, intent, askFeedback: chatbot.settings.enableFeedback });
        }

        // 3. Automatic intent-based response
        const autoRes = await getAutomaticResponse(message, intent, confidence);
        if (autoRes) {
            chatbot.analytics.resolvedQueries += 1;
            const entry = { query: message, response: autoRes.response, wasHelpful: null, responseTime: Date.now() - startTime, timestamp: new Date(), context };
            chatbot.trainingData.push(entry);
            await chatbot.save();
            return res.json({ ...autoRes, responseId: entry._id, askFeedback: chatbot.settings.enableFeedback });
        }

        // 4. Record for ML learning
        await recordUnresolvedQuery(message, chatbot);

        // 5. Intent-specific fallback
        let fallback = chatbot.settings.fallbackMessage || "I'm learning from your question! Our team will review it soon.";
        let fallbackSuggestions = ['Upcoming events','How to register?','Contact us'];
        if (intent === 'event') { fallback = "I'm not sure about that specific event, but I'm learning! 📚\n\nCheck our Events page or contact us."; fallbackSuggestions = ['View all events','Contact us']; }
        else if (intent === 'payment') { fallback = "I'm still learning about that payment query! 💳\n\nContact us at teamvortexnce@gmail.com for help."; fallbackSuggestions = ['Payment methods','Contact us']; }
        else if (intent === 'registration') { fallback = "I'm learning about that registration query! 📝\n\nVisit our Events page or contact us."; fallbackSuggestions = ['View events','Contact us']; }

        return res.json({ response: fallback, suggestions: fallbackSuggestions, responseId: null, intent, confidence: 0, askFeedback: false });
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ response: "Sorry, I'm having trouble. Please try again later.", suggestions: ['Contact us'], responseId: null });
    }
});

// GET /api/chatbot/config
router.get('/config', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Chatbot not configured' });
        res.json(chatbot);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/chatbot/config
router.put('/config', async (req, res) => {
    try {
        let chatbot = await Chatbot.findOne();
        if (!chatbot) chatbot = new Chatbot(req.body);
        else Object.assign(chatbot, req.body);
        await chatbot.save();
        res.json({ message: 'Updated', chatbot });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/chatbot/faq
router.post('/faq', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        chatbot.customFAQs.push(req.body);
        await chatbot.save();
        res.json({ message: 'FAQ added', chatbot });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/chatbot/faq/:id
router.put('/faq/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        const idx = chatbot.customFAQs.findIndex(f => f._id.toString() === req.params.id);
        if (idx === -1) return res.status(404).json({ message: 'FAQ not found' });
        Object.assign(chatbot.customFAQs[idx], req.body);
        await chatbot.save();
        res.json({ message: 'FAQ updated', chatbot });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/chatbot/faq/:id
router.delete('/faq/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        chatbot.customFAQs = chatbot.customFAQs.filter(f => f._id.toString() !== req.params.id);
        await chatbot.save();
        res.json({ message: 'FAQ deleted', chatbot });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/chatbot/analytics
router.get('/analytics', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne().select('analytics');
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        res.json(chatbot.analytics);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/chatbot/learned
router.get('/learned', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne().select('learnedInteractions');
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        res.json(chatbot.learnedInteractions.sort((a, b) => b.frequency - a.frequency));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/chatbot/learned/:id/approve
router.put('/learned/:id/approve', async (req, res) => {
    try {
        const { suggestedAnswer, category } = req.body;
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        const l = chatbot.learnedInteractions.id(req.params.id);
        if (!l) return res.status(404).json({ message: 'Not found' });
        l.suggestedAnswer = suggestedAnswer;
        l.approved = true;
        l.category = category || 'general';
        await chatbot.save();
        res.json({ message: 'Approved', chatbot });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/chatbot/learned/:id
router.delete('/learned/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        chatbot.learnedInteractions = chatbot.learnedInteractions.filter(l => l._id.toString() !== req.params.id);
        await chatbot.save();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/chatbot/learned/:id/convert-to-faq
router.post('/learned/:id/convert-to-faq', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        const l = chatbot.learnedInteractions.id(req.params.id);
        if (!l) return res.status(404).json({ message: 'Not found' });
        if (!l.approved || !l.suggestedAnswer) return res.status(400).json({ message: 'Approve and provide answer first' });
        chatbot.customFAQs.push({ question: l.userQuery, answer: l.suggestedAnswer, keywords: tokenize(l.userQuery), category: l.category || 'general', enabled: true, usageCount: l.frequency });
        chatbot.learnedInteractions = chatbot.learnedInteractions.filter(x => x._id.toString() !== req.params.id);
        await chatbot.save();
        res.json({ message: 'Converted to FAQ', chatbot });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/chatbot/feedback
router.post('/feedback', async (req, res) => {
    try {
        const { responseId, learnedId, faqId, wasHelpful, rating, comment } = req.body;
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });

        chatbot.analytics.totalFeedback += 1;
        if (wasHelpful) chatbot.analytics.positiveFeedback += 1;
        else chatbot.analytics.negativeFeedback += 1;

        if (responseId) {
            const t = chatbot.trainingData.id(responseId);
            if (t) { t.wasHelpful = wasHelpful; t.userRating = rating || (wasHelpful ? 5 : 1); t.userComment = comment || ''; }
        }
        if (learnedId) {
            const l = chatbot.learnedInteractions.id(learnedId);
            if (l) {
                l.userFeedback.push({ wasHelpful, comment: comment || '', timestamp: new Date() });
                if (!wasHelpful && chatbot.settings.enableAutoImprovement) l.approved = false;
            }
        }
        if (faqId) {
            const f = chatbot.customFAQs.id(faqId);
            if (f) {
                f.totalRatings = (f.totalRatings || 0) + 1;
                if (wasHelpful) f.positiveRatings = (f.positiveRatings || 0) + 1;
                else f.negativeRatings = (f.negativeRatings || 0) + 1;
                f.qualityScore = f.positiveRatings / f.totalRatings;
            }
        }
        const rated = chatbot.trainingData.filter(t => t.userRating);
        if (rated.length > 0) chatbot.analytics.averageResponseQuality = rated.reduce((s, t) => s + t.userRating, 0) / rated.length;
        await chatbot.save();
        res.json({ message: 'Feedback recorded', thanksMessage: wasHelpful ? 'Thank you! Your feedback helps me learn! 🎉' : "Thank you! I'll work on improving! 📚" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/chatbot/improvement-suggestions
router.get('/improvement-suggestions', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) return res.status(404).json({ message: 'Not configured' });
        const suggestions = [];
        chatbot.customFAQs.filter(f => f.totalRatings >= 5 && f.qualityScore < 0.6).forEach(f => suggestions.push({ type: 'low_quality_faq', faqId: f._id, question: f.question, qualityScore: f.qualityScore, totalRatings: f.totalRatings, suggestion: 'Consider revising this answer based on user feedback' }));
        chatbot.learnedInteractions.filter(l => !l.approved && l.frequency >= 3).sort((a, b) => b.frequency - a.frequency).slice(0, 10).forEach(l => suggestions.push({ type: 'frequent_unresolved', learnedId: l._id, query: l.userQuery, frequency: l.frequency, relatedQueries: l.relatedQueries, autoGeneratedAnswers: l.autoGeneratedAnswers, suggestion: 'This question is asked frequently. Consider creating an FAQ.' }));
        res.json({ suggestions, summary: { lowQualityFAQs: suggestions.filter(s => s.type === 'low_quality_faq').length, frequentUnresolved: suggestions.filter(s => s.type === 'frequent_unresolved').length, averageQuality: chatbot.analytics.averageResponseQuality, totalFeedback: chatbot.analytics.totalFeedback } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
