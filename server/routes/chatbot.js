const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Event = require('../models/Event');
const ClubInfo = require('../models/ClubInfo');

// Advanced ML: Stop words for better keyword extraction
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
    'this', 'that', 'these', 'those', 'am', 'to', 'of', 'in', 'for', 'on',
    'at', 'by', 'with', 'from', 'about', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'all', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'but', 'if', 'or', 'because'
]);

// Advanced ML: Extract keywords from query
function extractKeywords(text) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
    
    // Remove duplicates and return
    return [...new Set(words)];
}

// Advanced ML: Calculate semantic similarity with keyword weighting
function calculateSemanticSimilarity(query, target, keywords = []) {
    const queryKeywords = extractKeywords(query);
    const targetKeywords = extractKeywords(target);
    
    // Keyword overlap score
    const commonKeywords = queryKeywords.filter(k => targetKeywords.includes(k));
    const keywordScore = commonKeywords.length / Math.max(queryKeywords.length, targetKeywords.length, 1);
    
    // Additional keyword matching
    let additionalKeywordScore = 0;
    if (keywords && keywords.length > 0) {
        const matchedKeywords = keywords.filter(k => 
            queryKeywords.some(qk => k.toLowerCase().includes(qk) || qk.includes(k.toLowerCase()))
        );
        additionalKeywordScore = matchedKeywords.length / keywords.length;
    }
    
    // String similarity
    const stringSimilarity = calculateSimilarity(query, target);
    
    // Weighted combination
    return (stringSimilarity * 0.4) + (keywordScore * 0.4) + (additionalKeywordScore * 0.2);
}

// Advanced ML: Context-aware response selection
function selectBestResponseWithContext(responses, context = {}) {
    if (!responses || responses.length === 0) return null;
    
    // Sort by quality score and confidence
    const sorted = responses.sort((a, b) => {
        const scoreA = (a.qualityScore || 0) * 0.6 + (a.confidence || 0) * 0.4;
        const scoreB = (b.qualityScore || 0) * 0.6 + (b.confidence || 0) * 0.4;
        return scoreB - scoreA;
    });
    
    // Consider context if available
    if (context.previousQuery) {
        // Prefer responses that relate to previous context
        const contextualResponse = sorted.find(r => 
            r.context && calculateSimilarity(r.context, context.previousQuery) > 0.5
        );
        if (contextualResponse) return contextualResponse;
    }
    
    return sorted[0];
}

// Advanced ML: Intent classification
function classifyIntent(query) {
    const queryLower = query.toLowerCase();
    
    const intents = {
        greeting: ['hi', 'hello', 'hey', 'hii', 'hola', 'namaste', 'good morning', 'good afternoon', 'good evening'],
        thanks: ['thank', 'thanks', 'thx', 'appreciate', 'grateful'],
        event: ['event', 'hackathon', 'contest', 'competition', 'workshop', 'seminar', 'when', 'upcoming'],
        registration: ['register', 'sign up', 'join', 'enroll', 'participate', 'how to register'],
        payment: ['payment', 'pay', 'fee', 'price', 'cost', 'money', 'upi', 'bank', 'refund'],
        club: ['club', 'team vortex', 'about', 'who are', 'what is', 'mission', 'vision'],
        contact: ['contact', 'email', 'phone', 'reach', 'call', 'message', 'address'],
        help: ['help', 'support', 'assist', 'guide', 'how', 'what', 'explain'],
        team: ['team', 'member', 'founder', 'president', 'coordinator', 'who'],
        sponsor: ['sponsor', 'partner', 'collaborate', 'partnership']
    };
    
    let bestIntent = 'general';
    let bestScore = 0;
    
    for (const [intent, keywords] of Object.entries(intents)) {
        const matches = keywords.filter(keyword => queryLower.includes(keyword));
        const score = matches.length / keywords.length;
        
        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }
    
    return { intent: bestIntent, confidence: bestScore };
}

// Helper function to calculate string similarity (Levenshtein distance based)
function calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return 1.0;
    
    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Word match
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    if (commonWords.length > 0) {
        return commonWords.length / Math.max(words1.length, words2.length);
    }
    
    // Levenshtein distance for fuzzy matching
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - (distance / maxLength);
}

// Levenshtein distance algorithm
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Helper function to find best matching FAQ with advanced ML
function findBestMatch(query, faqs, context = {}) {
    let bestMatch = null;
    let bestScore = 0;
    
    // Get intent for better matching
    const { intent } = classifyIntent(query);

    for (const faq of faqs) {
        if (!faq.enabled) continue;

        // Semantic similarity with keyword weighting
        let score = calculateSemanticSimilarity(query, faq.question, faq.keywords);
        
        // Boost score if category matches intent
        if (faq.category === intent) {
            score *= 1.2;
        }
        
        // Boost score based on quality and usage
        if (faq.qualityScore > 0.7) {
            score *= 1.1;
        }
        
        // Boost frequently used FAQs slightly
        if (faq.usageCount > 10) {
            score *= 1.05;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = faq;
        }
    }

    return { match: bestMatch, score: bestScore };
}

// Helper function to check if query matches learned interactions with advanced ML
async function checkLearnedInteractions(query, chatbot, context = {}) {
    if (!chatbot.settings.mlEnabled) return null;
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Get intent for better matching
    const { intent } = classifyIntent(query);
    
    for (const learned of chatbot.learnedInteractions) {
        if (!learned.approved || !learned.suggestedAnswer) continue;
        
        // Semantic similarity
        let similarity = calculateSemanticSimilarity(query, learned.userQuery);
        
        // Check related queries
        for (const relatedQuery of learned.relatedQueries) {
            const relatedSimilarity = calculateSemanticSimilarity(query, relatedQuery);
            similarity = Math.max(similarity, relatedSimilarity);
        }
        
        // Boost if category matches intent
        if (learned.category === intent) {
            similarity *= 1.15;
        }
        
        // Boost based on positive feedback
        const positiveFeedback = learned.userFeedback.filter(f => f.wasHelpful).length;
        const totalFeedback = learned.userFeedback.length;
        if (totalFeedback > 0) {
            const feedbackRatio = positiveFeedback / totalFeedback;
            similarity *= (1 + feedbackRatio * 0.2);
        }
        
        if (similarity > bestScore) {
            bestScore = similarity;
            bestMatch = learned;
        }
    }
    
    if (bestMatch && bestScore > (chatbot.settings.similarityThreshold || 0.7)) {
        // Update frequency
        bestMatch.frequency += 1;
        
        // ML Enhancement: Select best answer based on feedback and confidence
        let responseText = bestMatch.suggestedAnswer;
        let confidence = bestScore;
        
        // Check auto-generated answers
        if (bestMatch.autoGeneratedAnswers && bestMatch.autoGeneratedAnswers.length > 0) {
            const bestAutoAnswer = bestMatch.autoGeneratedAnswers
                .sort((a, b) => b.confidence - a.confidence)[0];
            
            if (bestAutoAnswer.confidence > 0.85) {
                responseText = bestAutoAnswer.answer;
                confidence = Math.max(confidence, bestAutoAnswer.confidence);
            }
        }
        
        await chatbot.save();
        
        return {
            response: responseText,
            source: 'learned',
            confidence: confidence,
            learnedId: bestMatch._id,
            intent: intent
        };
    }
    
    return null;
}

// Helper function to record unresolved query for ML learning with pattern recognition
async function recordUnresolvedQuery(query, chatbot, context = {}) {
    if (!chatbot.settings.mlEnabled) return;
    
    // Check if similar query already exists
    let existingQuery = null;
    let highestSimilarity = 0;
    
    for (const learned of chatbot.learnedInteractions) {
        const similarity = calculateSimilarity(query, learned.userQuery);
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            if (similarity > 0.85) { // Very similar
                existingQuery = learned;
            }
        }
    }
    
    if (existingQuery) {
        // Increment frequency of existing query
        existingQuery.frequency += 1;
        if (!existingQuery.relatedQueries.includes(query)) {
            existingQuery.relatedQueries.push(query);
        }
        
        // ML Enhancement: Try to auto-generate answer from similar FAQs
        if (chatbot.settings.enableAutoImprovement && !existingQuery.suggestedAnswer) {
            const autoAnswer = await tryAutoGenerateAnswer(query, chatbot);
            if (autoAnswer) {
                existingQuery.autoGeneratedAnswers.push(autoAnswer);
            }
        }
    } else {
        // Add new learned interaction
        const newLearned = {
            userQuery: query,
            frequency: 1,
            timestamp: new Date(),
            relatedQueries: [],
            autoGeneratedAnswers: []
        };
        
        // Try to auto-generate answer
        if (chatbot.settings.enableAutoImprovement) {
            const autoAnswer = await tryAutoGenerateAnswer(query, chatbot);
            if (autoAnswer) {
                newLearned.autoGeneratedAnswers.push(autoAnswer);
            }
        }
        
        chatbot.learnedInteractions.push(newLearned);
        chatbot.analytics.learnedQueries += 1;
    }
    
    chatbot.analytics.unresolvedQueries += 1;
    
    // Auto-create FAQ if threshold reached
    const autoThreshold = chatbot.settings.autoLearnThreshold || 3;
    if (existingQuery && existingQuery.frequency >= autoThreshold && !existingQuery.approved) {
        // Mark for admin review
        existingQuery.category = 'general';
        
        // If we have a high-confidence auto-generated answer, auto-approve it
        if (existingQuery.autoGeneratedAnswers.length > 0) {
            const bestAnswer = existingQuery.autoGeneratedAnswers
                .sort((a, b) => b.confidence - a.confidence)[0];
            
            if (bestAnswer.confidence > 0.85) {
                existingQuery.suggestedAnswer = bestAnswer.answer;
                existingQuery.approved = true;
            }
        }
    }
    
    // ML Enhancement: Update query patterns
    await updateQueryPatterns(query, chatbot);
    
    await chatbot.save();
}

// Advanced ML: Try to auto-generate answer from similar FAQs with context awareness
async function tryAutoGenerateAnswer(query, chatbot, context = {}) {
    const similarFAQs = [];
    const { intent } = classifyIntent(query);
    
    for (const faq of chatbot.customFAQs) {
        if (!faq.enabled) continue;
        
        const similarity = calculateSemanticSimilarity(query, faq.question, faq.keywords);
        
        if (similarity > 0.5) {
            similarFAQs.push({
                faq,
                similarity,
                qualityScore: faq.qualityScore || 0,
                usageCount: faq.usageCount || 0
            });
        }
    }
    
    if (similarFAQs.length === 0) return null;
    
    // Advanced scoring: similarity + quality + usage + intent match
    similarFAQs.sort((a, b) => {
        const scoreA = (a.similarity * 0.5) + 
                      (a.qualityScore * 0.3) + 
                      (Math.min(a.usageCount / 100, 1) * 0.1) +
                      (a.faq.category === intent ? 0.1 : 0);
        const scoreB = (b.similarity * 0.5) + 
                      (b.qualityScore * 0.3) + 
                      (Math.min(b.usageCount / 100, 1) * 0.1) +
                      (b.faq.category === intent ? 0.1 : 0);
        return scoreB - scoreA;
    });
    
    const bestMatch = similarFAQs[0];
    
    // Higher threshold for auto-generation
    if (bestMatch.similarity > 0.7) {
        return {
            answer: bestMatch.faq.answer,
            confidence: bestMatch.similarity,
            source: 'similar_faq',
            timestamp: new Date(),
            faqId: bestMatch.faq._id
        };
    }
    
    // If multiple similar FAQs, try to combine insights
    if (similarFAQs.length > 1 && bestMatch.similarity > 0.6) {
        // Use the best match but note that multiple sources exist
        return {
            answer: bestMatch.faq.answer + "\n\n💡 Tip: You might also want to know about related topics. Feel free to ask!",
            confidence: bestMatch.similarity * 0.9,
            source: 'combined_faq',
            timestamp: new Date(),
            faqId: bestMatch.faq._id
        };
    }
    
    return null;
}

// ML Enhancement: Update query patterns for better matching
async function updateQueryPatterns(query, chatbot) {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter(w => w.length > 3);
    
    if (words.length === 0) return;
    
    // Extract key phrases (2-3 word combinations)
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words[i] + ' ' + words[i + 1]);
        if (i < words.length - 2) {
            phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
        }
    }
    
    // Update pattern frequency
    for (const phrase of phrases) {
        let pattern = chatbot.queryPatterns.find(p => p.pattern === phrase);
        
        if (pattern) {
            pattern.frequency += 1;
            pattern.lastUpdated = new Date();
        } else {
            chatbot.queryPatterns.push({
                pattern: phrase,
                frequency: 1,
                category: 'general',
                confidence: 0,
                lastUpdated: new Date()
            });
        }
    }
}

// Advanced ML: Get automatic responses with intent-based routing
async function getAutomaticResponse(query, context = {}) {
    const queryLower = query.toLowerCase();
    const { intent, confidence } = classifyIntent(query);
    
    // Intent-based response routing
    switch (intent) {
        case 'greeting':
            const responses = [
                "Hey there! 👋 I'm VortexBot ML, your intelligent assistant. I can help you with:\n\n• Upcoming events and hackathons\n• Registration process\n• Payment information\n• Club details and team info\n• Contact information\n\nWhat would you like to know?",
                "Hello! 🎉 Welcome to Team Vortex! I'm powered by ML to give you the best answers. I can help with events, registrations, payments, and more. What can I assist you with today?",
                "Hi! 😊 Great to see you here! I'm learning from every conversation to serve you better. Ask me about our events, registration, payment methods, or Team Vortex!",
                "Hey! 🚀 I'm VortexBot ML, continuously improving to help you better. Ask me about events, registration, payments, or anything else!"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            return {
                response: randomResponse,
                suggestions: ['Upcoming events', 'How to register?', 'About Team Vortex', 'Contact us'],
                intent: 'greeting',
                confidence: 1.0
            };
            
        case 'thanks':
            return {
                response: "You're welcome! 😊 Happy to help! If you have any more questions about events, registration, or anything else, feel free to ask!",
                suggestions: ['Upcoming events', 'How to register?', 'Contact us'],
                intent: 'thanks',
                confidence: 1.0
            };
            
        case 'event':
            try {
                const now = new Date();
                const upcomingEvents = await Event.find({
                    status: { $ne: 'draft' },
                    date: { $gte: now }
                })
                .select('title date location price registrationType description')
                .sort({ date: 1 })
                .limit(3);

                if (upcomingEvents.length > 0) {
                    let response = "🎯 Here are our upcoming events:\n\n";
                    upcomingEvents.forEach((event, idx) => {
                        response += `${idx + 1}. **${event.title}**\n`;
                        response += `   📅 ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
                        response += `   📍 ${event.location}\n`;
                        response += `   💰 ${event.price > 0 ? `₹${event.price}` : 'Free Entry'}\n`;
                        response += `   👥 ${event.registrationType}\n\n`;
                    });
                    response += "✨ Visit our Events page to register and see more details!";
                    
                    return {
                        response,
                        suggestions: ['How to register?', 'Event details', 'Payment methods'],
                        intent: 'event',
                        confidence: confidence
                    };
                } else {
                    return {
                        response: "We don't have any upcoming events scheduled right now, but we're always planning something exciting! 🎉\n\nFollow us on social media or check back soon for updates. You can also contact us to suggest event ideas!",
                        suggestions: ['Contact us', 'About Team Vortex', 'Past events'],
                        intent: 'event',
                        confidence: confidence
                    };
                }
            } catch (err) {
                console.error('Error fetching events:', err);
            }
            break;
            
        case 'registration':
            return {
                response: "📝 **Registration Process:**\n\n1️⃣ Visit the Events page\n2️⃣ Choose your event\n3️⃣ Click 'Register Now'\n4️⃣ Fill in your details (name, email, college, etc.)\n5️⃣ Complete payment (if required)\n6️⃣ Upload payment proof\n7️⃣ Wait for confirmation email (within 24-48 hours)\n\n✅ You'll receive your registration confirmation and event details via email!\n\nNeed help with a specific event?",
                suggestions: ['Upcoming events', 'Registration fee', 'Team registration', 'Payment methods'],
                intent: 'registration',
                confidence: confidence
            };
            
        case 'payment':
            return {
                response: "💳 **Payment Information:**\n\n**Accepted Methods:**\n• UPI payments (Google Pay, PhonePe, Paytm)\n• Bank transfers (NEFT/IMPS)\n• Cash (for select events)\n\n**Payment Process:**\n1️⃣ Register for the event\n2️⃣ Make payment via your preferred method\n3️⃣ Upload payment screenshot\n4️⃣ Enter UTR/Transaction number\n5️⃣ Wait for admin verification (24-48 hours)\n\n🔒 All payments are secure and verified by our team.\n💰 Refunds available as per event policy.",
                suggestions: ['Refund policy', 'Payment proof', 'Event prices', 'Registration help'],
                intent: 'payment',
                confidence: confidence
            };
            
        case 'club':
            try {
                const clubInfo = await ClubInfo.findOne();
                if (clubInfo) {
                    return {
                        response: `🌟 **About Team Vortex:**\n\n${clubInfo.vision || 'Team Vortex is a premier technical club at Navkis College of Engineering, dedicated to fostering innovation, technology, and student development.'}\n\n🎯 **Our Mission:**\n${clubInfo.mission || 'To empower students with technical skills, create opportunities for innovation, and build a strong tech community.'}\n\n💡 We organize hackathons, workshops, competitions, and tech talks to help students grow and excel in technology.\n\nVisit our website to learn more about our team and activities!`,
                        suggestions: ['Team members', 'Contact us', 'Our events', 'Join us'],
                        intent: 'club',
                        confidence: confidence
                    };
                }
            } catch (err) {
                console.error('Error fetching club info:', err);
            }
            
            return {
                response: "🌟 **About Team Vortex:**\n\nTeam Vortex is a premier technical club at Navkis College of Engineering, dedicated to fostering innovation and technology among students.\n\n🎯 We organize:\n• Hackathons and coding competitions\n• Technical workshops and seminars\n• Industry expert sessions\n• Project showcases\n• Networking events\n\nJoin us to enhance your technical skills and be part of an amazing community!",
                suggestions: ['Team members', 'Contact us', 'Our events', 'How to join'],
                intent: 'club',
                confidence: confidence
            };
            
        case 'contact':
            return {
                response: "📞 **Contact Team Vortex:**\n\n📧 **Email:** teamvortexnce@gmail.com\n📱 **Instagram:** @teamvortex_nce\n💼 **LinkedIn:** Team Vortex NCE\n🌐 **Website:** teamvortex.in\n\n💬 Feel free to reach out for:\n• Event queries\n• Sponsorship opportunities\n• Collaboration proposals\n• General inquiries\n\nWe typically respond within 24 hours!",
                suggestions: ['Event queries', 'Sponsorship', 'Collaboration', 'Join team'],
                intent: 'contact',
                confidence: confidence
            };
            
        case 'help':
            return {
                response: "🤝 **How can I help you?**\n\nI can assist you with:\n\n📅 **Events:** Information about upcoming hackathons, workshops, and competitions\n📝 **Registration:** Step-by-step registration guidance\n💳 **Payments:** Payment methods and verification process\n🏢 **Club Info:** About Team Vortex, our mission, and team\n📞 **Contact:** How to reach us\n👥 **Team:** Meet our members and coordinators\n🤝 **Sponsors:** Partnership opportunities\n\nJust ask me anything, and I'll do my best to help!",
                suggestions: ['Upcoming events', 'How to register?', 'About Team Vortex', 'Contact us'],
                intent: 'help',
                confidence: confidence
            };
    }

    // Fallback to keyword-based matching if intent classification didn't match
    if (queryLower.includes('website') || queryLower.includes('page') || queryLower.includes('navigate')) {
        return {
            response: "🌐 **Website Navigation:**\n\n🏠 **Home** - Overview and highlights\n📅 **Events** - Upcoming and past events\n🏆 **Contests** - Active competitions\n👥 **Team** - Meet our members\n🤝 **Sponsors** - Our partners\n💬 **Chat** - Talk to me anytime!\n\nUse the navigation menu at the top to explore!",
            suggestions: ['View events', 'Meet the team', 'Become a sponsor', 'Contact us'],
            intent: 'general',
            confidence: 0.8
        };
    }
    
    if (queryLower.includes('team') || queryLower.includes('member') || queryLower.includes('founder')) {
        return {
            response: "👥 **Our Team:**\n\nTeam Vortex is led by passionate students dedicated to technology and innovation.\n\n🎯 Visit our Team page to:\n• Meet our founders and coordinators\n• See our technical and creative teams\n• Learn about our achievements\n• Connect with team members\n\nWant to join our team? We're always looking for talented individuals!",
            suggestions: ['View team page', 'How to join', 'Contact us', 'Our events'],
            intent: 'team',
            confidence: 0.8
        };
    }
    
    if (queryLower.includes('sponsor') || queryLower.includes('partner') || queryLower.includes('collaborate')) {
        return {
            response: "🤝 **Partnership Opportunities:**\n\nWe welcome partnerships with organizations that share our vision!\n\n💼 **Sponsorship Tiers:**\n• Title Sponsor\n• Platinum\n• Gold\n• Silver\n• Bronze\n• Technology Partners\n• Media Partners\n\n📧 Contact us at teamvortexnce@gmail.com with subject 'Sponsorship Inquiry' to discuss partnership opportunities.\n\nLet's create something amazing together!",
            suggestions: ['Contact us', 'View sponsors', 'About Team Vortex'],
            intent: 'sponsor',
            confidence: 0.8
        };
    }

    return null;
}

// @route   GET /api/chatbot/data
// @desc    Get chatbot configuration and initial data
router.get('/data', async (req, res) => {
    try {
        let chatbot = await Chatbot.findOne();
        
        // Create default if doesn't exist
        if (!chatbot) {
            chatbot = new Chatbot({
                welcomeMessage: "Hi! I'm VortexBot. How can I help you today?",
                customFAQs: [
                    {
                        question: "What is Team Vortex?",
                        answer: "Team Vortex is a technical club at Navkis College of Engineering focused on innovation, technology, and student development through hackathons, workshops, and competitions.",
                        keywords: ["team vortex", "club", "about"],
                        category: "club"
                    },
                    {
                        question: "How do I register for events?",
                        answer: "Visit our Events page, select the event you want to join, click 'Register Now', fill in your details, and complete the payment if required. You'll receive a confirmation email.",
                        keywords: ["register", "sign up", "join event"],
                        category: "registration"
                    },
                    {
                        question: "What payment methods do you accept?",
                        answer: "We accept UPI payments, bank transfers, and cash for some events. After registration, upload your payment screenshot with UTR number for verification.",
                        keywords: ["payment", "pay", "fee", "money"],
                        category: "payment"
                    }
                ],
                quickReplies: [
                    { text: "Upcoming events", category: "events" },
                    { text: "How to register?", category: "registration" },
                    { text: "Contact us", category: "general" }
                ]
            });
            await chatbot.save();
        }

        res.json({
            welcomeMessage: chatbot.welcomeMessage,
            quickReplies: chatbot.quickReplies,
            settings: chatbot.settings
        });
    } catch (err) {
        console.error('Chatbot data error:', err);
        res.status(500).json({ message: 'Failed to load chatbot data' });
    }
});

// @route   POST /api/chatbot/query
// @desc    Process user query and return response with advanced ML learning
router.post('/query', async (req, res) => {
    const { message, sessionId, previousQuery, sessionQueries = [] } = req.body;
    const startTime = Date.now();

    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const chatbot = await Chatbot.findOne();
        
        if (!chatbot) {
            return res.json({
                response: "I'm currently being set up. Please try again later or contact us directly.",
                suggestions: [],
                responseId: null
            });
        }

        // Build context for better responses
        const context = {
            previousQuery: previousQuery || null,
            sessionQueries: sessionQueries || [],
            userType: sessionQueries.length > 0 ? 'returning' : 'new'
        };

        // Update analytics
        chatbot.analytics.totalQueries += 1;
        
        // Get intent classification
        const { intent, confidence: intentConfidence } = classifyIntent(message);

        // 1. Check learned interactions (ML) - with improved matching and context
        const learnedResponse = await checkLearnedInteractions(message, chatbot, context);
        if (learnedResponse) {
            chatbot.analytics.resolvedQueries += 1;
            
            const responseTime = Date.now() - startTime;
            
            // Record training data
            const trainingEntry = {
                query: message,
                response: learnedResponse.response,
                wasHelpful: null,
                responseTime,
                timestamp: new Date(),
                context: context
            };
            chatbot.trainingData.push(trainingEntry);
            await chatbot.save();
            
            return res.json({
                response: learnedResponse.response + "\n\n💡 (Improved from user feedback)",
                suggestions: chatbot.settings.showSuggestions 
                    ? chatbot.quickReplies.slice(0, chatbot.settings.maxSuggestions).map(qr => qr.text)
                    : [],
                responseId: trainingEntry._id,
                learnedId: learnedResponse.learnedId,
                confidence: learnedResponse.confidence,
                intent: intent,
                askFeedback: chatbot.settings.enableFeedback
            });
        }

        // 2. Try to find custom FAQ match with advanced scoring
        const { match: customMatch, score: customScore } = findBestMatch(message, chatbot.customFAQs, context);
        
        if (customMatch && customScore > (chatbot.settings.similarityThreshold || 0.6)) {
            // Update FAQ usage
            customMatch.usageCount = (customMatch.usageCount || 0) + 1;
            customMatch.lastUsed = new Date();
            
            // ML Enhancement: Select best answer (original or alternative)
            let responseText = customMatch.answer;
            let usedAlternative = false;
            
            if (customMatch.alternativeAnswers && customMatch.alternativeAnswers.length > 0) {
                const bestAlternative = customMatch.alternativeAnswers
                    .sort((a, b) => b.score - a.score)[0];
                
                // Use alternative if it has significantly better score
                if (bestAlternative.score > (customMatch.qualityScore || 0) + 0.3) {
                    responseText = bestAlternative.answer;
                    bestAlternative.usageCount += 1;
                    usedAlternative = true;
                }
            }
            
            chatbot.analytics.resolvedQueries += 1;
            
            const responseTime = Date.now() - startTime;
            
            // Record successful interaction for training
            const trainingEntry = {
                query: message,
                response: responseText,
                wasHelpful: null,
                responseTime,
                timestamp: new Date(),
                context: context
            };
            chatbot.trainingData.push(trainingEntry);
            
            await chatbot.save();
            
            return res.json({
                response: responseText + (usedAlternative ? "\n\n✨ (Enhanced answer)" : ""),
                suggestions: chatbot.settings.showSuggestions 
                    ? chatbot.quickReplies.slice(0, chatbot.settings.maxSuggestions).map(qr => qr.text)
                    : [],
                responseId: trainingEntry._id,
                faqId: customMatch._id,
                confidence: customScore,
                intent: intent,
                askFeedback: chatbot.settings.enableFeedback
            });
        }

        // 3. Try automatic response from website data with context
        const automaticResponse = await getAutomaticResponse(message, context);
        
        if (automaticResponse) {
            chatbot.analytics.resolvedQueries += 1;
            
            const responseTime = Date.now() - startTime;
            
            // Record for training
            const trainingEntry = {
                query: message,
                response: automaticResponse.response,
                wasHelpful: null,
                responseTime,
                timestamp: new Date(),
                context: context
            };
            chatbot.trainingData.push(trainingEntry);
            
            await chatbot.save();
            
            return res.json({
                ...automaticResponse,
                responseId: trainingEntry._id,
                intent: automaticResponse.intent || intent,
                askFeedback: chatbot.settings.enableFeedback
            });
        }

        // 4. No match found - Record for ML learning with context
        await recordUnresolvedQuery(message, chatbot, context);

        // 5. Return intelligent fallback response based on intent
        let fallbackResponse = chatbot.settings.fallbackMessage;
        let fallbackSuggestions = ['Upcoming events', 'How to register?', 'Contact us'];
        
        // Provide intent-specific fallback
        if (intent === 'event') {
            fallbackResponse = "I'm not sure about that specific event, but I'm learning! 📚\n\nYou can:\n• Check our Events page for all upcoming events\n• Contact us directly for specific event queries\n• Ask me about general event information";
            fallbackSuggestions = ['View all events', 'Contact us', 'Registration help'];
        } else if (intent === 'payment') {
            fallbackResponse = "I'm still learning about that payment query! 💳\n\nFor payment-related questions:\n• Check our payment information guide\n• Contact us at teamvortexnce@gmail.com\n• Ask me about general payment methods";
            fallbackSuggestions = ['Payment methods', 'Contact us', 'Registration help'];
        } else if (intent === 'registration') {
            fallbackResponse = "I'm learning about that registration query! 📝\n\nFor registration help:\n• Visit our Events page\n• Check the registration guide\n• Contact us for specific assistance";
            fallbackSuggestions = ['View events', 'Registration guide', 'Contact us'];
        }

        return res.json({
            response: fallbackResponse,
            suggestions: fallbackSuggestions,
            responseId: null,
            intent: intent,
            confidence: 0,
            askFeedback: false
        });

    } catch (err) {
        console.error('Query processing error:', err);
        res.status(500).json({
            response: "Sorry, I'm having trouble processing your request. Please try again later or contact us directly.",
            suggestions: ['Contact us', 'Try again'],
            responseId: null
        });
    }
});

// @route   GET /api/chatbot/config
// @desc    Get chatbot configuration (admin only)
router.get('/config', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        res.json(chatbot);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/chatbot/config
// @desc    Update chatbot configuration (admin only)
router.put('/config', async (req, res) => {
    try {
        let chatbot = await Chatbot.findOne();
        
        if (!chatbot) {
            chatbot = new Chatbot(req.body);
        } else {
            Object.assign(chatbot, req.body);
        }
        
        await chatbot.save();
        res.json({ message: 'Chatbot configuration updated', chatbot });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/chatbot/faq
// @desc    Add custom FAQ (admin only)
router.post('/faq', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }

        chatbot.customFAQs.push(req.body);
        await chatbot.save();
        
        res.json({ message: 'FAQ added successfully', chatbot });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/chatbot/faq/:id
// @desc    Update custom FAQ (admin only)
router.put('/faq/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }

        const faqIndex = chatbot.customFAQs.findIndex(faq => faq._id.toString() === req.params.id);
        if (faqIndex === -1) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        Object.assign(chatbot.customFAQs[faqIndex], req.body);
        await chatbot.save();
        
        res.json({ message: 'FAQ updated successfully', chatbot });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/chatbot/faq/:id
// @desc    Delete custom FAQ (admin only)
router.delete('/faq/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }

        chatbot.customFAQs = chatbot.customFAQs.filter(faq => faq._id.toString() !== req.params.id);
        await chatbot.save();
        
        res.json({ message: 'FAQ deleted successfully', chatbot });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/chatbot/analytics
// @desc    Get chatbot analytics (admin only)
router.get('/analytics', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne().select('analytics');
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        res.json(chatbot.analytics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/chatbot/learned
// @desc    Get learned interactions for admin review
router.get('/learned', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne().select('learnedInteractions');
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        
        // Sort by frequency (most asked first)
        const sorted = chatbot.learnedInteractions.sort((a, b) => b.frequency - a.frequency);
        
        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/chatbot/learned/:id/approve
// @desc    Approve learned interaction and provide answer
router.put('/learned/:id/approve', async (req, res) => {
    try {
        const { suggestedAnswer, category } = req.body;
        const chatbot = await Chatbot.findOne();
        
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        
        const learned = chatbot.learnedInteractions.id(req.params.id);
        if (!learned) {
            return res.status(404).json({ message: 'Learned interaction not found' });
        }
        
        learned.suggestedAnswer = suggestedAnswer;
        learned.approved = true;
        learned.category = category || 'general';
        
        await chatbot.save();
        
        res.json({ message: 'Learned interaction approved', chatbot });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/chatbot/learned/:id
// @desc    Delete learned interaction
router.delete('/learned/:id', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        
        chatbot.learnedInteractions = chatbot.learnedInteractions.filter(
            l => l._id.toString() !== req.params.id
        );
        
        await chatbot.save();
        
        res.json({ message: 'Learned interaction deleted', chatbot });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/chatbot/learned/:id/convert-to-faq
// @desc    Convert learned interaction to FAQ
router.post('/learned/:id/convert-to-faq', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        
        const learned = chatbot.learnedInteractions.id(req.params.id);
        if (!learned) {
            return res.status(404).json({ message: 'Learned interaction not found' });
        }
        
        if (!learned.approved || !learned.suggestedAnswer) {
            return res.status(400).json({ message: 'Please approve and provide answer first' });
        }
        
        // Create FAQ from learned interaction
        chatbot.customFAQs.push({
            question: learned.userQuery,
            answer: learned.suggestedAnswer,
            keywords: learned.relatedQueries.slice(0, 5), // Use related queries as keywords
            category: learned.category || 'general',
            enabled: true,
            usageCount: learned.frequency
        });
        
        // Remove from learned interactions
        chatbot.learnedInteractions = chatbot.learnedInteractions.filter(
            l => l._id.toString() !== req.params.id
        );
        
        await chatbot.save();
        
        res.json({ message: 'Converted to FAQ successfully', chatbot });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/chatbot/feedback
// @desc    Submit user feedback for ML improvement
router.post('/feedback', async (req, res) => {
    try {
        const { responseId, learnedId, faqId, wasHelpful, rating, comment } = req.body;
        
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        
        // Update analytics
        chatbot.analytics.totalFeedback += 1;
        if (wasHelpful) {
            chatbot.analytics.positiveFeedback += 1;
        } else {
            chatbot.analytics.negativeFeedback += 1;
        }
        
        // Update training data if responseId provided
        if (responseId) {
            const training = chatbot.trainingData.id(responseId);
            if (training) {
                training.wasHelpful = wasHelpful;
                training.userRating = rating || (wasHelpful ? 5 : 1);
                training.userComment = comment || '';
            }
        }
        
        // Update learned interaction feedback
        if (learnedId) {
            const learned = chatbot.learnedInteractions.id(learnedId);
            if (learned) {
                learned.userFeedback.push({
                    wasHelpful,
                    comment: comment || '',
                    timestamp: new Date()
                });
                
                // If negative feedback, try to improve
                if (!wasHelpful && chatbot.settings.enableAutoImprovement) {
                    // Mark for admin review
                    learned.approved = false;
                }
            }
        }
        
        // Update FAQ quality score
        if (faqId) {
            const faq = chatbot.customFAQs.id(faqId);
            if (faq) {
                faq.totalRatings = (faq.totalRatings || 0) + 1;
                
                if (wasHelpful) {
                    faq.positiveRatings = (faq.positiveRatings || 0) + 1;
                } else {
                    faq.negativeRatings = (faq.negativeRatings || 0) + 1;
                }
                
                // Calculate quality score (0-1 scale)
                faq.qualityScore = faq.positiveRatings / faq.totalRatings;
                
                // If quality is low and we have enough feedback, mark for review
                if (faq.totalRatings >= 10 && faq.qualityScore < 0.5) {
                    // Admin should review this FAQ
                    console.log(`FAQ "${faq.question}" has low quality score: ${faq.qualityScore}`);
                }
            }
        }
        
        // Calculate average response quality
        const totalRatings = chatbot.trainingData.filter(t => t.userRating).length;
        if (totalRatings > 0) {
            const sumRatings = chatbot.trainingData
                .filter(t => t.userRating)
                .reduce((sum, t) => sum + t.userRating, 0);
            chatbot.analytics.averageResponseQuality = sumRatings / totalRatings;
        }
        
        await chatbot.save();
        
        res.json({ 
            message: 'Feedback recorded successfully',
            thanksMessage: wasHelpful 
                ? 'Thank you! Your feedback helps me learn and improve! 🎉'
                : 'Thank you for your feedback. I\'ll work on improving my responses! 📚'
        });
    } catch (err) {
        console.error('Feedback error:', err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/chatbot/improvement-suggestions
// @desc    Get AI suggestions for improving responses (admin only)
router.get('/improvement-suggestions', async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne();
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not configured' });
        }
        
        const suggestions = [];
        
        // Find FAQs with low quality scores
        const lowQualityFAQs = chatbot.customFAQs.filter(faq => 
            faq.totalRatings >= 5 && faq.qualityScore < 0.6
        );
        
        for (const faq of lowQualityFAQs) {
            suggestions.push({
                type: 'low_quality_faq',
                faqId: faq._id,
                question: faq.question,
                currentAnswer: faq.answer,
                qualityScore: faq.qualityScore,
                totalRatings: faq.totalRatings,
                suggestion: 'Consider revising this answer based on user feedback'
            });
        }
        
        // Find frequently asked unresolved queries
        const frequentUnresolved = chatbot.learnedInteractions
            .filter(l => !l.approved && l.frequency >= 5)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);
        
        for (const learned of frequentUnresolved) {
            suggestions.push({
                type: 'frequent_unresolved',
                learnedId: learned._id,
                query: learned.userQuery,
                frequency: learned.frequency,
                relatedQueries: learned.relatedQueries,
                autoGeneratedAnswers: learned.autoGeneratedAnswers,
                suggestion: 'This question is asked frequently. Consider creating an FAQ.'
            });
        }
        
        res.json({
            suggestions,
            summary: {
                lowQualityFAQs: lowQualityFAQs.length,
                frequentUnresolved: frequentUnresolved.length,
                averageQuality: chatbot.analytics.averageResponseQuality,
                totalFeedback: chatbot.analytics.totalFeedback
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
