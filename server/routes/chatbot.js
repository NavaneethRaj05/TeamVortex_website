const express = require('express');
const router = express.Router();
const Chatbot = require('../models/Chatbot');
const Event = require('../models/Event');
const ClubInfo = require('../models/ClubInfo');

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

// Helper function to find best matching FAQ
function findBestMatch(query, faqs) {
    let bestMatch = null;
    let bestScore = 0;

    for (const faq of faqs) {
        if (!faq.enabled) continue;

        // Check question similarity
        let score = calculateSimilarity(query, faq.question);

        // Check keywords
        if (faq.keywords && faq.keywords.length > 0) {
            for (const keyword of faq.keywords) {
                const keywordScore = calculateSimilarity(query, keyword);
                score = Math.max(score, keywordScore);
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = faq;
        }
    }

    return { match: bestMatch, score: bestScore };
}

// Helper function to check if query matches learned interactions
async function checkLearnedInteractions(query, chatbot) {
    if (!chatbot.settings.mlEnabled) return null;
    
    for (const learned of chatbot.learnedInteractions) {
        if (!learned.approved || !learned.suggestedAnswer) continue;
        
        const similarity = calculateSimilarity(query, learned.userQuery);
        
        if (similarity > (chatbot.settings.similarityThreshold || 0.7)) {
            // Update frequency
            learned.frequency += 1;
            learned.lastUsed = new Date();
            await chatbot.save();
            
            return {
                response: learned.suggestedAnswer,
                source: 'learned',
                confidence: similarity
            };
        }
    }
    
    return null;
}

// Helper function to record unresolved query for ML learning
async function recordUnresolvedQuery(query, chatbot) {
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
    } else {
        // Add new learned interaction
        chatbot.learnedInteractions.push({
            userQuery: query,
            frequency: 1,
            timestamp: new Date(),
            relatedQueries: []
        });
        chatbot.analytics.learnedQueries += 1;
    }
    
    chatbot.analytics.unresolvedQueries += 1;
    
    // Auto-create FAQ if threshold reached
    const autoThreshold = chatbot.settings.autoLearnThreshold || 3;
    if (existingQuery && existingQuery.frequency >= autoThreshold && !existingQuery.approved) {
        // Mark for admin review
        existingQuery.category = 'general';
    }
    
    await chatbot.save();
}

// Helper function to get automatic responses from website data
async function getAutomaticResponse(query) {
    const queryLower = query.toLowerCase();

    // Greeting queries - handle casual greetings
    const greetings = ['hi', 'hello', 'hey', 'hii', 'hiii', 'helo', 'hola', 'namaste', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(greeting => {
        const words = queryLower.split(/\s+/);
        return words.includes(greeting) || queryLower === greeting;
    });

    if (isGreeting) {
        const responses = [
            "Hey there! 👋 I'm VortexBot, your friendly assistant. I can help you with:\n\n• Upcoming events and hackathons\n• Registration process\n• Payment information\n• Club details and team info\n• Contact information\n\nWhat would you like to know?",
            "Hello! 🎉 Welcome to Team Vortex! I'm here to help you with events, registrations, payments, and more. What can I assist you with today?",
            "Hi! 😊 Great to see you here! I can answer questions about our events, help with registration, explain payment methods, or tell you about Team Vortex. What interests you?",
            "Hey! 🚀 I'm VortexBot, your go-to assistant for all things Team Vortex. Ask me about events, registration, payments, or anything else!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            response: randomResponse,
            suggestions: ['Upcoming events', 'How to register?', 'About Team Vortex', 'Contact us']
        };
    }

    // Thank you responses
    if (queryLower.includes('thank') || queryLower.includes('thanks') || queryLower.includes('thx')) {
        return {
            response: "You're welcome! 😊 Happy to help! If you have any more questions about events, registration, or anything else, feel free to ask!",
            suggestions: ['Upcoming events', 'How to register?', 'Contact us']
        };
    }

    // Event-related queries
    if (queryLower.includes('event') || queryLower.includes('hackathon') || queryLower.includes('contest') || queryLower.includes('competition')) {
        try {
            const now = new Date();
            const upcomingEvents = await Event.find({
                status: { $ne: 'draft' },
                date: { $gte: now }
            })
            .select('title date location price registrationType')
            .sort({ date: 1 })
            .limit(3);

            if (upcomingEvents.length > 0) {
                let response = "Here are our upcoming events:\n\n";
                upcomingEvents.forEach((event, idx) => {
                    response += `${idx + 1}. ${event.title}\n`;
                    response += `   📅 ${new Date(event.date).toLocaleDateString()}\n`;
                    response += `   📍 ${event.location}\n`;
                    response += `   💰 ${event.price > 0 ? `₹${event.price}` : 'Free'}\n`;
                    response += `   👥 ${event.registrationType}\n\n`;
                });
                response += "Visit our Events page to register!";
                
                return {
                    response,
                    suggestions: ['How to register?', 'Event details', 'Payment methods']
                };
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        }
    }

    // Registration queries
    if (queryLower.includes('register') || queryLower.includes('sign up') || queryLower.includes('join')) {
        return {
            response: "To register for an event:\n\n1. Visit the Events page\n2. Choose your event\n3. Click 'Register Now'\n4. Fill in your details\n5. Complete payment (if required)\n6. You'll receive a confirmation email\n\nNeed help with a specific event?",
            suggestions: ['Upcoming events', 'Registration fee', 'Team registration']
        };
    }

    // Payment queries
    if (queryLower.includes('payment') || queryLower.includes('fee') || queryLower.includes('price') || queryLower.includes('cost')) {
        return {
            response: "Payment Information:\n\n💳 We accept:\n- UPI payments\n- Bank transfers\n- Cash (for some events)\n\nPayment process:\n1. Register for the event\n2. Upload payment screenshot\n3. Enter UTR number\n4. Wait for admin verification (24-48 hours)\n\nAll payments are secure and verified by our team.",
            suggestions: ['Refund policy', 'Payment proof', 'Event prices']
        };
    }

    // Club information queries
    if (queryLower.includes('club') || queryLower.includes('team vortex') || queryLower.includes('about')) {
        try {
            const clubInfo = await ClubInfo.findOne();
            if (clubInfo) {
                return {
                    response: `About Team Vortex:\n\n${clubInfo.vision || 'Team Vortex is a technical club at Navkis College of Engineering focused on innovation and technology.'}\n\nOur Mission: ${clubInfo.mission || 'To foster technical excellence and innovation among students.'}\n\nVisit our website to learn more about our team and activities!`,
                    suggestions: ['Team members', 'Contact us', 'Our events']
                };
            }
        } catch (err) {
            console.error('Error fetching club info:', err);
        }
    }

    // Contact queries
    if (queryLower.includes('contact') || queryLower.includes('email') || queryLower.includes('phone') || queryLower.includes('reach')) {
        return {
            response: "Contact Team Vortex:\n\n📧 Email: teamvortexnce@gmail.com\n📱 Instagram: @teamvortex_nce\n💼 LinkedIn: Team Vortex NCE\n\nFeel free to reach out for any queries or collaborations!",
            suggestions: ['Event queries', 'Sponsorship', 'Collaboration']
        };
    }

    // Website navigation
    if (queryLower.includes('website') || queryLower.includes('page') || queryLower.includes('navigate')) {
        return {
            response: "Website Navigation:\n\n🏠 Home - Overview and highlights\n📅 Events - Upcoming and past events\n🏆 Contests - Active competitions\n👥 Team - Meet our members\n🤝 Sponsors - Our partners\n\nUse the navigation menu to explore!",
            suggestions: ['View events', 'Meet the team', 'Become a sponsor']
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
// @desc    Process user query and return response with ML learning
router.post('/query', async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const chatbot = await Chatbot.findOne();
        
        if (!chatbot) {
            return res.json({
                response: "I'm currently being set up. Please try again later or contact us directly.",
                suggestions: []
            });
        }

        // Update analytics
        chatbot.analytics.totalQueries += 1;
        await chatbot.save();

        // 1. Check learned interactions (ML)
        const learnedResponse = await checkLearnedInteractions(message, chatbot);
        if (learnedResponse) {
            chatbot.analytics.resolvedQueries += 1;
            await chatbot.save();
            
            return res.json({
                response: learnedResponse.response + "\n\n💡 (Learned from previous interactions)",
                suggestions: chatbot.settings.showSuggestions 
                    ? chatbot.quickReplies.slice(0, chatbot.settings.maxSuggestions).map(qr => qr.text)
                    : []
            });
        }

        // 2. Try to find custom FAQ match
        const { match: customMatch, score: customScore } = findBestMatch(message, chatbot.customFAQs);
        
        if (customMatch && customScore > (chatbot.settings.similarityThreshold || 0.6)) {
            // Update FAQ usage
            customMatch.usageCount = (customMatch.usageCount || 0) + 1;
            customMatch.lastUsed = new Date();
            
            chatbot.analytics.resolvedQueries += 1;
            
            // Record successful interaction for training
            chatbot.trainingData.push({
                query: message,
                response: customMatch.answer,
                wasHelpful: true,
                timestamp: new Date()
            });
            
            await chatbot.save();
            
            return res.json({
                response: customMatch.answer,
                suggestions: chatbot.settings.showSuggestions 
                    ? chatbot.quickReplies.slice(0, chatbot.settings.maxSuggestions).map(qr => qr.text)
                    : []
            });
        }

        // 3. Try automatic response from website data
        const automaticResponse = await getAutomaticResponse(message);
        
        if (automaticResponse) {
            chatbot.analytics.resolvedQueries += 1;
            
            // Record for training
            chatbot.trainingData.push({
                query: message,
                response: automaticResponse.response,
                wasHelpful: true,
                timestamp: new Date()
            });
            
            await chatbot.save();
            
            return res.json(automaticResponse);
        }

        // 4. No match found - Record for ML learning
        await recordUnresolvedQuery(message, chatbot);

        // 5. Return fallback response
        return res.json({
            response: chatbot.settings.fallbackMessage,
            suggestions: ['Upcoming events', 'How to register?', 'Contact us']
        });

    } catch (err) {
        console.error('Query processing error:', err);
        res.status(500).json({
            response: "Sorry, I'm having trouble processing your request. Please try again later.",
            suggestions: []
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

module.exports = router;
