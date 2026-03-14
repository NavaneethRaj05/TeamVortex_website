import React, { useState, useEffect } from 'react';
import { Bot, Plus, Edit2, Trash2, Save, X, MessageCircle, TrendingUp, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const ChatbotManager = () => {
  const [tab, setTab] = useState('faqs');
  const [chatbotConfig, setChatbotConfig] = useState(null);
  const [learnedInteractions, setLearnedInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [showAddFAQ, setShowAddFAQ] = useState(false);
  const [improvementSuggestions, setImprovementSuggestions] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [approveAnswer, setApproveAnswer] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', keywords: '', category: 'general', enabled: true });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchChatbotConfig(), fetchLearned(), fetchImprovementSuggestions()]);
    setLoading(false);
  };

  const fetchChatbotConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/config`);
      setChatbotConfig(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchLearned = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/learned`);
      setLearnedInteractions(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchImprovementSuggestions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/improvement-suggestions`);
      setImprovementSuggestions(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSaveWelcomeMessage = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ welcomeMessage: chatbotConfig.welcomeMessage }) });
      alert('Welcome message updated!');
    } catch { alert('Failed to update'); }
  };

  const handleAddFAQ = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/faq`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newFAQ, keywords: newFAQ.keywords.split(',').map(k => k.trim()).filter(Boolean) }) });
      setShowAddFAQ(false);
      setNewFAQ({ question: '', answer: '', keywords: '', category: 'general', enabled: true });
      fetchChatbotConfig();
    } catch { alert('Failed to add FAQ'); }
  };

  const handleUpdateFAQ = async (faqId) => {
    try {
      const faq = chatbotConfig.customFAQs.find(f => f._id === faqId);
      await fetch(`${API_BASE_URL}/api/chatbot/faq/${faqId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(faq) });
      setEditingFAQ(null);
      fetchChatbotConfig();
    } catch { alert('Failed to update FAQ'); }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/faq/${faqId}`, { method: 'DELETE' });
      fetchChatbotConfig();
    } catch { alert('Failed to delete'); }
  };

  const handleToggleFAQ = async (faqId) => {
    try {
      const faq = chatbotConfig.customFAQs.find(f => f._id === faqId);
      await fetch(`${API_BASE_URL}/api/chatbot/faq/${faqId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...faq, enabled: !faq.enabled }) });
      fetchChatbotConfig();
    } catch { alert('Failed to toggle'); }
  };

  const handleApprovelearned = async (id) => {
    if (!approveAnswer.trim()) return alert('Please enter an answer');
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/learned/${id}/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suggestedAnswer: approveAnswer, category: 'general' }) });
      setApprovingId(null);
      setApproveAnswer('');
      fetchLearned();
    } catch { alert('Failed to approve'); }
  };

  const handleConvertToFAQ = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/learned/${id}/convert-to-faq`, { method: 'POST' });
      fetchLearned();
      fetchChatbotConfig();
      alert('Converted to FAQ!');
    } catch { alert('Failed to convert'); }
  };

  const handleDeleteLearned = async (id) => {
    if (!window.confirm('Delete this learned interaction?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/learned/${id}`, { method: 'DELETE' });
      fetchLearned();
    } catch { alert('Failed to delete'); }
  };

  if (loading) return <div className="glass-card p-8 text-center text-white/50">Loading...</div>;
  if (!chatbotConfig) return <div className="glass-card p-8 text-center text-white/50">Chatbot not configured</div>;

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
          <p className="text-white/60 mt-1">Configure chatbot responses and review ML learning</p>
        </div>
        <button onClick={fetchAll} className="p-2 bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Analytics */}
      {chatbotConfig.analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Queries', value: chatbotConfig.analytics.totalQueries, color: 'blue', icon: MessageCircle },
            { label: 'Resolved', value: chatbotConfig.analytics.resolvedQueries, color: 'green', icon: CheckCircle },
            { label: 'Success Rate', value: `${chatbotConfig.analytics.totalQueries > 0 ? Math.round((chatbotConfig.analytics.resolvedQueries / chatbotConfig.analytics.totalQueries) * 100) : 0}%`, color: 'purple', icon: TrendingUp },
            { label: 'Learned', value: learnedInteractions.length, color: 'yellow', icon: Brain },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`glass-card p-4 border border-${color}-500/30`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 text-${color}-400`} />
                <span className="text-xs text-white/60 uppercase tracking-wider">{label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {[
          { id: 'faqs', label: 'Custom FAQs' },
          { id: 'learned', label: `Learned (${learnedInteractions.filter(l => !l.approved).length} pending)` },
          { id: 'suggestions', label: 'ML Suggestions' },
          { id: 'settings', label: 'Settings' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'bg-vortex-blue/20 text-vortex-blue border-b-2 border-vortex-blue' : 'text-white/60 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* FAQs Tab */}
      {tab === 'faqs' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Custom FAQs</h3>
            <button onClick={() => setShowAddFAQ(true)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>

          {showAddFAQ && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-bold">New FAQ</h4>
                <button onClick={() => setShowAddFAQ(false)}><X className="w-5 h-5 text-white/60" /></button>
              </div>
              <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none" placeholder="Question" value={newFAQ.question} onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })} />
              <textarea className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none" placeholder="Answer" value={newFAQ.answer} onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" className="bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none" placeholder="Keywords (comma-separated)" value={newFAQ.keywords} onChange={e => setNewFAQ({ ...newFAQ, keywords: e.target.value })} />
                <select className="bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none" value={newFAQ.category} onChange={e => setNewFAQ({ ...newFAQ, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleAddFAQ} className="bg-vortex-blue text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" /> Add FAQ</button>
            </div>
          )}

          <div className="space-y-3">
            {chatbotConfig.customFAQs?.length > 0 ? chatbotConfig.customFAQs.map(faq => (
              <div key={faq._id} className={`p-4 rounded-xl border ${faq.enabled ? 'bg-white/5 border-white/10' : 'bg-white/5 border-red-500/30 opacity-60'}`}>
                {editingFAQ === faq._id ? (
                  <div className="space-y-2">
                    <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm" value={faq.question} onChange={e => setChatbotConfig({ ...chatbotConfig, customFAQs: chatbotConfig.customFAQs.map(f => f._id === faq._id ? { ...f, question: e.target.value } : f) })} />
                    <textarea className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm h-20 resize-none" value={faq.answer} onChange={e => setChatbotConfig({ ...chatbotConfig, customFAQs: chatbotConfig.customFAQs.map(f => f._id === faq._id ? { ...f, answer: e.target.value } : f) })} />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateFAQ(faq._id)} className="bg-vortex-blue text-black font-bold py-1 px-3 rounded-lg text-sm">Save</button>
                      <button onClick={() => setEditingFAQ(null)} className="bg-white/10 text-white py-1 px-3 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{faq.question}</div>
                      <div className="text-white/70 text-sm">{faq.answer}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-vortex-blue/20 text-vortex-blue px-2 py-1 rounded-full">{faq.category}</span>
                        {faq.keywords?.length > 0 && <span className="text-xs text-white/40">Keywords: {faq.keywords.join(', ')}</span>}
                        {faq.totalRatings > 0 && <span className={`text-xs px-2 py-1 rounded-full ${faq.qualityScore >= 0.7 ? 'bg-green-500/20 text-green-400' : faq.qualityScore >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{Math.round(faq.qualityScore * 100)}% quality ({faq.totalRatings} ratings)</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleToggleFAQ(faq._id)} className={`p-2 rounded-lg ${faq.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => setEditingFAQ(faq._id)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteFAQ(faq._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            )) : <div className="text-center py-8 text-white/40">No FAQs yet. Click "Add FAQ" to create one.</div>}
          </div>
        </div>
      )}

      {/* Learned Interactions Tab */}
      {tab === 'learned' && (
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" /> Learned Interactions</h3>
            <p className="text-white/50 text-sm mt-1">Queries the bot couldn't answer — review, approve, or convert to FAQ. Auto-promoted entries (high confidence) are already approved.</p>
          </div>

          {learnedInteractions.length === 0 ? (
            <div className="text-center py-8 text-white/40">No learned interactions yet.</div>
          ) : (
            <div className="space-y-3">
              {learnedInteractions.map(l => (
                <div key={l._id} className={`p-4 rounded-xl border ${l.approved ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-white font-medium">{l.userQuery}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">Asked {l.frequency}x</span>
                        {l.category && <span className="text-xs bg-vortex-blue/20 text-vortex-blue px-2 py-0.5 rounded-full">{l.category}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{l.approved ? '✓ Approved' : 'Pending'}</span>
                      </div>
                      {l.suggestedAnswer && <div className="mt-2 text-sm text-white/70 bg-white/5 rounded-lg p-2">{l.suggestedAnswer}</div>}
                      {l.relatedQueries?.length > 0 && <div className="mt-1 text-xs text-white/40">Related: {l.relatedQueries.slice(0, 3).join(' · ')}</div>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {l.approved && <button onClick={() => handleConvertToFAQ(l._id)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs px-3">→ FAQ</button>}
                      <button onClick={() => handleDeleteLearned(l._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {!l.approved && (
                    approvingId === l._id ? (
                      <div className="mt-3 space-y-2">
                        <textarea className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm h-20 resize-none" placeholder="Enter answer for this query..." value={approveAnswer} onChange={e => setApproveAnswer(e.target.value)} />
                        <div className="flex gap-2">
                          <button onClick={() => handleApprovelearned(l._id)} className="bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approve</button>
                          <button onClick={() => { setApprovingId(null); setApproveAnswer(''); }} className="bg-white/10 text-white py-1 px-3 rounded-lg text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setApprovingId(l._id); setApproveAnswer(l.autoGeneratedAnswers?.[0]?.answer || ''); }} className="mt-2 text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-colors">
                        + Provide Answer & Approve
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ML Suggestions Tab */}
      {tab === 'suggestions' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-yellow-400" /> ML Improvement Suggestions</h3>
          {improvementSuggestions?.suggestions?.length > 0 ? (
            <div className="space-y-3">
              {improvementSuggestions.suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg border border-yellow-500/20">
                  {s.type === 'low_quality_faq' ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="text-yellow-400 font-medium text-sm">Low Quality FAQ</div>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">{Math.round(s.qualityScore * 100)}% quality</span>
                      </div>
                      <div className="text-white/80 text-sm mt-1">{s.question}</div>
                      <div className="text-white/50 text-xs mt-1">{s.suggestion}</div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="text-yellow-400 font-medium text-sm">Frequent Unresolved</div>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Asked {s.frequency}x</span>
                      </div>
                      <div className="text-white/80 text-sm mt-1">{s.query}</div>
                      <div className="text-white/50 text-xs mt-1">{s.suggestion}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : <div className="text-center py-8 text-white/40">No suggestions right now — the bot is doing well!</div>}
          {improvementSuggestions?.summary && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="text-sm text-white/60">Avg Quality: <span className="text-white">{(improvementSuggestions.summary.averageQuality || 0).toFixed(1)}/5</span></div>
              <div className="text-sm text-white/60">Total Feedback: <span className="text-white">{improvementSuggestions.summary.totalFeedback}</span></div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Welcome Message</h3>
          <textarea className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none" value={chatbotConfig.welcomeMessage} onChange={e => setChatbotConfig({ ...chatbotConfig, welcomeMessage: e.target.value })} />
          <button onClick={handleSaveWelcomeMessage} className="bg-vortex-blue text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">ML Settings</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
              <div>Auto-learn threshold: <span className="text-white font-medium">{chatbotConfig.settings?.autoLearnThreshold || 5} queries</span></div>
              <div>Similarity threshold: <span className="text-white font-medium">{chatbotConfig.settings?.similarityThreshold || 0.45}</span></div>
              <div>ML enabled: <span className="text-white font-medium">{chatbotConfig.settings?.mlEnabled ? 'Yes' : 'No'}</span></div>
              <div>Auto-improve: <span className="text-white font-medium">{chatbotConfig.settings?.enableAutoImprovement ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotManager;
