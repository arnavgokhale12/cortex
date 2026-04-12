'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCortexStore } from '@/lib/store';
import { AVAILABLE_MODELS, RECOMMENDED_MODELS, PRESET_COLORS, ModelConfig } from '@/lib/types';

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

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setColor(agent.color);
      setSelectedModel(`${agent.modelConfig.provider}:${agent.modelConfig.model}`);
    }
  }, [agent]);

  if (!agent) return null;

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

  const currentProvider = selectedModel.split(':')[0];
  const needsAPIKey = currentProvider && currentProvider !== 'groq' && !apiKeys[currentProvider as keyof typeof apiKeys];

  return (
    <Dialog open={!!editingAgentId} onOpenChange={(open) => !open && setEditingAgent(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              {name[0]?.toUpperCase() || 'A'}
            </div>
            Configure {agent.role}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="agent" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agent">Agent</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
          </TabsList>

          <TabsContent value="agent" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent name"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? '2px solid white' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#hex color"
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Model</Label>
                <Button variant="ghost" size="sm" onClick={handleUseRecommended}>
                  Use Recommended
                </Button>
              </div>
              <Select value={selectedModel} onValueChange={(v) => v && setSelectedModel(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((m) => (
                    <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Recommended for {agent.role}: {RECOMMENDED_MODELS[agent.role].displayName}
              </p>
            </div>

            {needsAPIKey && (
              <div className="space-y-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Label htmlFor="apikey" className="text-amber-500">
                  {currentProvider.toUpperCase()} API Key Required
                </Label>
                <Input
                  id="apikey"
                  type="password"
                  placeholder={`Enter your ${currentProvider} API key`}
                  onChange={(e) => setAPIKey(currentProvider as keyof typeof apiKeys, e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your key is stored locally in your browser only.
                </p>
              </div>
            )}

            {currentProvider === 'groq' && (
              <p className="text-xs text-green-500">
                Groq is free! Using server-side API key.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setEditingAgent(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
