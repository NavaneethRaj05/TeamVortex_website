import React, { useState, useEffect } from 'react';
import { Bot, Plus, Edit2, Trash2, Save, X, MessageCircle, TrendingUp, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const ChatbotManager = () => {
  const [chatbotConfig, setChatbotConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [showAddFAQ, setShowAddFAQ] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: 'general',
    enabled: true
  });

  useEffect(() => {
    fetchChatbotConfig();
  }, []);

  const fetchChatbotConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/chatbot/config`);
      const data = await res.json();
      setChatbotConfig(data);
    } catch (err) {
      console.error('Error fetching chatbot config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWelcomeMessage = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeMessage: chatbotConfig.welcomeMessage })
      });
      alert('Welcome message updated!');
    } catch (err) {
      alert('Failed to update welcome message');
    }
  };

  const handleAddFAQ = async () => {
    try {
      const faqData = {
        ...newFAQ,
        keywords: newFAQ.keywords.split(',').map(k => k.trim()).filter(k => k)
      };

      await fetch(`${API_BASE_URL}/api/chatbot/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqData)
      });

      setShowAddFAQ(false);
      setNewFAQ({
        question: '',
        answer: '',
        keywords: '',
        category: 'general',
        enabled: true
      });
      fetchChatbotConfig();
      alert('FAQ added successfully!');
    } catch (err) {
      alert('Failed to add FAQ');
    }
  };

  const handleUpdateFAQ = async (faqId) => {
    try {
      const faq = chatbotConfig.customFAQs.find(f => f._id === faqId);
      await fetch(`${API_BASE_URL}/api/chatbot/faq/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      });
      setEditingFAQ(null);
      fetchChatbotConfig();
      alert('FAQ updated successfully!');
    } catch (err) {
      alert('Failed to update FAQ');
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Delete this FAQ?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/chatbot/faq/${faqId}`, {
        method: 'DELETE'
      });
      fetchChatbotConfig();
      alert('FAQ deleted successfully!');
    } catch (err) {
      alert('Failed to delete FAQ');
    }
  };

  const handleToggleFAQ = async (faqId) => {
    try {
      const faq = chatbotConfig.customFAQs.find(f => f._id === faqId);
      faq.enabled = !faq.enabled;
      
      await fetch(`${API_BASE_URL}/api/chatbot/faq/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      });
      fetchChatbotConfig();
    } catch (err) {
      alert('Failed to toggle FAQ');
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="text-center text-white/50">Loading chatbot configuration...</div>
      </div>
    );
  }

  if (!chatbotConfig) {
    return (
      <div className="glass-card p-8">
        <div className="text-center text-white/50">Chatbot not configured</div>
      </div>
    );
  }

  const categories = ['general', 'events', 'club', 'website', 'registration', 'payment'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-vortex-blue" />
            VortexBot Manager
          </h2>
          <p className="text-white/60 mt-1">Configure chatbot responses and FAQs</p>
        </div>
      </div>

      {/* Analytics */}
      {chatbotConfig.analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Total Queries</span>
            </div>
            <div className="text-3xl font-bold text-white">{chatbotConfig.analytics.totalQueries}</div>
          </div>

          <div className="glass-card p-4 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Resolved</span>
            </div>
            <div className="text-3xl font-bold text-white">{chatbotConfig.analytics.resolvedQueries}</div>
          </div>

          <div className="glass-card p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {chatbotConfig.analytics.totalQueries > 0
                ? Math.round((chatbotConfig.analytics.resolvedQueries / chatbotConfig.analytics.totalQueries) * 100)
                : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Welcome Message</h3>
        <div className="space-y-3">
          <textarea
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none"
            value={chatbotConfig.welcomeMessage}
            onChange={(e) => setChatbotConfig({ ...chatbotConfig, welcomeMessage: e.target.value })}
            placeholder="Enter welcome message..."
          />
          <button
            onClick={handleSaveWelcomeMessage}
            className="bg-vortex-blue text-black font-bold py-2 px-4 rounded-lg hover:bg-vortex-blue/80 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Welcome Message
          </button>
        </div>
      </div>

      {/* Custom FAQs */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Custom FAQs</h3>
          <button
            onClick={() => setShowAddFAQ(true)}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        {/* Add FAQ Form */}
        {showAddFAQ && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-bold">New FAQ</h4>
              <button onClick={() => setShowAddFAQ(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Question</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  placeholder="What is Team Vortex?"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Answer</label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none"
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                  placeholder="Team Vortex is a technical club..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                    value={newFAQ.keywords}
                    onChange={(e) => setNewFAQ({ ...newFAQ, keywords: e.target.value })}
                    placeholder="team vortex, club, about"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Category</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddFAQ}
                className="bg-vortex-blue text-black font-bold py-2 px-4 rounded-lg hover:bg-vortex-blue/80 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-3">
          {chatbotConfig.customFAQs && chatbotConfig.customFAQs.length > 0 ? (
            chatbotConfig.customFAQs.map((faq) => (
              <div
                key={faq._id}
                className={`p-4 rounded-xl border transition-all ${
                  faq.enabled
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/5 border-red-500/30 opacity-60'
                }`}
              >
                {editingFAQ === faq._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = chatbotConfig.customFAQs.map(f =>
                          f._id === faq._id ? { ...f, question: e.target.value } : f
                        );
                        setChatbotConfig({ ...chatbotConfig, customFAQs: updated });
                      }}
                    />
                    <textarea
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm h-20 resize-none"
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = chatbotConfig.customFAQs.map(f =>
                          f._id === faq._id ? { ...f, answer: e.target.value } : f
                        );
                        setChatbotConfig({ ...chatbotConfig, customFAQs: updated });
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateFAQ(faq._id)}
                        className="bg-vortex-blue text-black font-bold py-1 px-3 rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingFAQ(null)}
                        className="bg-white/10 text-white py-1 px-3 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{faq.question}</div>
                        <div className="text-white/70 text-sm">{faq.answer}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-vortex-blue/20 text-vortex-blue px-2 py-1 rounded-full">
                            {faq.category}
                          </span>
                          {faq.keywords && faq.keywords.length > 0 && (
                            <span className="text-xs text-white/40">
                              Keywords: {faq.keywords.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleToggleFAQ(faq._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            faq.enabled
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                          title={faq.enabled ? 'Disable' : 'Enable'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingFAQ(faq._id)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq._id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              No custom FAQs added yet. Click "Add FAQ" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="glass-card p-4 border border-blue-500/30 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Bot className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-blue-400 font-bold mb-1">Automatic Responses</div>
            <div className="text-white/70 text-sm">
              The chatbot automatically answers questions about:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Upcoming events (fetched from database)</li>
                <li>Registration process</li>
                <li>Payment methods</li>
                <li>Club information</li>
                <li>Contact details</li>
                <li>Website navigation</li>
              </ul>
              Custom FAQs take priority over automatic responses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotManager;
