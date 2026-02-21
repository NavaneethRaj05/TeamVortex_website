import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../apiConfig';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatbotData, setChatbotData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load chatbot data and initial greeting
    fetchChatbotData();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const fetchChatbotData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/data`);
      const data = await res.json();
      setChatbotData(data);
      
      // Add welcome message
      if (messages.length === 0) {
        setMessages([{
          id: Date.now(),
          text: data.welcomeMessage || "Hi! I'm VortexBot. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error('Error fetching chatbot data:', err);
      // Fallback welcome message
      if (messages.length === 0) {
        setMessages([{
          id: Date.now(),
          text: "Hi! I'm VortexBot. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await res.json();

      // Simulate typing delay
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions || []
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
    } catch (err) {
      console.error('Error sending message:', err);
      setIsTyping(false);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later or contact us directly.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button - Unique Animated Design - ALWAYS VISIBLE */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            onClick={() => setIsOpen(true)}
            className="chatbot-button-unique"
            style={{
              position: 'fixed',
              bottom: '1rem',
              right: '1rem',
              zIndex: 9999,
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            aria-label="Open Chat"
          >
            {/* Animated rotating gradient background */}
            <div className="absolute inset-0 rounded-full bg-gradient-conic-animated"></div>
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 rounded-full animate-ping-slow opacity-75 bg-gradient-radial-glow"></div>
            
            {/* Inner circle with icon */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-inner">
              <MessageCircle className="w-6 h-6 text-white animate-bounce-subtle" />
            </div>
            
            {/* Status indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-glow shadow-glow-green"></span>
            
            {/* Tooltip - Hidden on mobile, shown on desktop */}
            <div className="hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
              Chat with VortexBot AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Window - ALWAYS ON RIGHT SIDE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="glass-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-cyan-500/30"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 9999,
              width: '90vw',
              maxWidth: '384px',
              height: '90vh',
              maxHeight: '600px',
              boxShadow: '0 0 40px rgba(6, 182, 212, 0.3), 0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header with Unique Animated Gradient */}
            <div className="bg-gradient-animated p-3 sm:p-4 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
              {/* Animated wave background */}
              <div className="absolute inset-0 bg-wave-animated opacity-30"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="particle-float particle-1"></div>
                <div className="particle-float particle-2"></div>
                <div className="particle-float particle-3"></div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30 animate-spin-slow">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                    VortexBot
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse-glow">ML</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow"></span>
                    <span className="text-white/90 text-xs font-medium">Learning...</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white active:scale-95 transition-all p-2 -m-2 touch-manipulation hover:bg-white/10 rounded-lg relative z-10"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Messages Area - Mobile Optimized with Unique Animated Background */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-cyan-900/20 via-blue-900/30 to-purple-900/40 relative">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-cyan-400/30 animate-pulse-glow">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] sm:max-w-[75%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-2xl p-2.5 sm:p-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 text-white border border-cyan-500/30 backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    </div>
                    
                    {/* Suggestions - Mobile Optimized with Unique Colors */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-gradient-to-r from-cyan-500/10 to-blue-500/10 active:from-cyan-500/20 active:to-blue-500/20 sm:hover:from-cyan-500/15 sm:hover:to-blue-500/15 text-white/90 active:text-white sm:hover:text-white px-2.5 sm:px-3 py-2 rounded-lg border border-cyan-500/20 transition-all touch-manipulation"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-[10px] text-white/40 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm ring-2 ring-white/20">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator with Unique Colors */}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-cyan-400/30 animate-pulse-glow">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-2.5 sm:p-3 border border-cyan-500/30 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-glow-cyan"></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-glow-blue" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-glow-purple" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Mobile Optimized with Unique Animated Colors */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 border-t border-cyan-500/20 flex-shrink-0 relative">
              {/* Animated border glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer"></div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/10 border border-cyan-500/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm touch-manipulation backdrop-blur-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white p-2.5 sm:p-3 rounded-xl active:scale-95 sm:hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-shrink-0 shadow-lg shadow-cyan-500/30"
                  aria-label="Send Message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Powered by with ML Badge */}
              <div className="flex items-center justify-center gap-1 mt-2">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse-glow" />
                <span className="text-[10px] text-cyan-300/60">Powered by VortexBot ML</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
