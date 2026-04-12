'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCortexStore } from '@/lib/store';
import { AVAILABLE_MODELS, RECOMMENDED_MODELS, PRESET_COLORS, APIKeys } from '@/lib/types';

export function AgentSettings() {
  const {
    agents,
    editingAgentId,
    apiKeys,
    setEditingAgent,
    updateAgent,
    setAPIKey,
  } = useCortexStore();

  const agent = agents.find((a) => a.id === editingAgentId);

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [tab, setTab] = useState<'agent' | 'model'>('agent');
  const [localApiKey, setLocalApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const currentProvider = selectedModel.split(':')[0] as keyof APIKeys;

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setColor(agent.color);
      setSelectedModel(`${agent.modelConfig.provider}:${agent.modelConfig.model}`);
      setTab('agent');
      setKeySaved(false);
    }
  }, [agent]);

  useEffect(() => {
    // Load existing API key for current provider
    if (currentProvider && apiKeys[currentProvider]) {
      setLocalApiKey(apiKeys[currentProvider] || '');
    } else {
      setLocalApiKey('');
    }
    setKeySaved(false);
  }, [currentProvider, apiKeys]);

  if (!agent) return null;

  const handleSaveApiKey = () => {
    if (localApiKey.trim()) {
      setAPIKey(currentProvider, localApiKey.trim());
      setKeySaved(true);
    }
  };

  const handleSave = () => {
    const [provider, model] = selectedModel.split(':');
    const modelConfig = AVAILABLE_MODELS.find(
      (m) => m.provider === provider && m.model === model
    );

    if (modelConfig) {
      updateAgent(agent.id, {
        name,
        avatar: name[0].toUpperCase(),
        color,
        modelConfig,
      });
    }
    setEditingAgent(null);
  };

  const handleUseRecommended = () => {
    const recommended = RECOMMENDED_MODELS[agent.role];
    setSelectedModel(`${recommended.provider}:${recommended.model}`);
  };

  const needsAPIKey = currentProvider && currentProvider !== 'groq' && !apiKeys[currentProvider];
  const hasAPIKey = currentProvider && currentProvider !== 'groq' && apiKeys[currentProvider];

  return (
    <AnimatePresence>
      {editingAgentId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingAgent(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4"
          >
            <div className="rounded-3xl bg-[#0a0a0f] border border-white/10 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-medium text-lg shadow-lg"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 8px 30px -5px ${color}50`
                    }}
                  >
                    {name[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">Configure Agent</h2>
                    <p className="text-sm text-white/40 capitalize">{agent.role}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5">
                {(['agent', 'model'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      tab === t ? 'text-white border-b-2 border-violet-500' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t === 'agent' ? 'Appearance' : 'Model'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                {tab === 'agent' ? (
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2">
                        Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="Agent name"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-3">
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className="h-10 w-10 rounded-xl transition-all duration-200 hover:scale-110"
                            style={{
                              backgroundColor: c,
                              boxShadow: color === c ? `0 0 0 2px #0a0a0f, 0 0 0 4px ${c}` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Model Select */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] text-white/40 uppercase tracking-wider">
                          Model
                        </label>
                        <button
                          onClick={handleUseRecommended}
                          className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          Use Recommended
                        </button>
                      </div>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 transition-colors appearance-none cursor-pointer"
                      >
                        {AVAILABLE_MODELS.map((m) => (
                          <option
                            key={`${m.provider}:${m.model}`}
                            value={`${m.provider}:${m.model}`}
                            className="bg-[#0a0a0f]"
                          >
                            {m.displayName}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-white/30 mt-2">
                        Recommended: {RECOMMENDED_MODELS[agent.role].displayName}
                      </p>
                    </div>

                    {/* API Key Input */}
                    {needsAPIKey && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <label className="block text-[11px] text-amber-400 uppercase tracking-wider mb-2">
                          {currentProvider.toUpperCase()} API Key Required
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            placeholder={`Enter your ${currentProvider} API key`}
                            className="flex-1 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            onClick={handleSaveApiKey}
                            disabled={!localApiKey.trim()}
                            className="px-4 h-10 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                        <p className="text-[10px] text-white/30 mt-2">
                          Stored locally in your browser only.
                        </p>
                      </div>
                    )}

                    {/* API Key Saved */}
                    {hasAPIKey && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-white/60 uppercase tracking-wider">
                              {currentProvider.toUpperCase()} API Key
                            </span>
                            <p className="text-xs text-white/30 mt-1 font-mono">
                              {apiKeys[currentProvider]?.slice(0, 8)}...{apiKeys[currentProvider]?.slice(-4)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setAPIKey(currentProvider, '');
                              setLocalApiKey('');
                            }}
                            className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-[10px] text-white/20 mt-2">
                          Will be validated when you send a message
                        </p>
                      </div>
                    )}

                    {currentProvider === 'groq' && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-[11px] text-emerald-400">
                          Groq is free! Using server-side API key.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setEditingAgent(null)}
                  className="flex-1 h-12 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
