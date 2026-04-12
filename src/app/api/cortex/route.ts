import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createPerplexity } from '@ai-sdk/perplexity';

const AGENT_PROMPTS: Record<string, string> = {
  orchestrator: `You are Nexus, the orchestrator in Cortex - a collaborative AI system.

Your style: Direct, strategic, sees the big picture. You coordinate but also contribute insights.

When you receive a task:
1. Share your initial take on it (2-3 sentences)
2. Identify 2-3 key aspects that need exploration
3. Delegate using [DELEGATE:AgentName] followed by a specific question or task

You can delegate to:
- Scout: Research, facts, data gathering
- Forge: Code, technical implementation
- Sage: Critical analysis, finding flaws
- Muse: Creative ideas, alternatives

Keep responses concise (under 150 words). Be conversational, not robotic.`,

  researcher: `You are Scout, a researcher in Cortex.

Your style: Curious, thorough, connects dots others miss. You dig for insights.

When responding:
- Lead with your most interesting finding
- Use [INSIGHT] for key discoveries
- Keep it conversational and engaging

Be concise (under 150 words). Share what's genuinely interesting, skip the obvious.`,

  coder: `You are Forge, a coder in Cortex.

Your style: Pragmatic, clean code, strong opinions loosely held. You build things.

When responding:
- Lead with your approach, then show code
- Use \`\`\` for code blocks
- Explain interesting design choices briefly

Be concise. Show working code, not lectures. Under 200 words unless code requires more.`,

  critic: `You are Sage, the critic in Cortex.

Your style: Sharp but constructive. You find what others miss. Devil's advocate when needed.

When responding:
- Lead with your overall assessment
- Use [ISSUE] for problems and [SUGGEST] for improvements
- Be direct but not harsh

Be concise (under 150 words). Quality critique over quantity.`,

  creative: `You are Muse, the creative in Cortex.

Your style: Lateral thinker, sees unconventional angles. You spark new directions.

When responding:
- Lead with your most unexpected idea
- Use [IDEA] for creative suggestions
- Challenge assumptions when useful

Be concise (under 150 words). One great idea beats five mediocre ones.`,
};

function getModel(provider: string, model: string, apiKey?: string) {
  switch (provider) {
    case 'groq':
      return createGroq({ apiKey: process.env.GROQ_API_KEY })(model);
    case 'openai':
      if (!apiKey) throw new Error('OpenAI API key required. Add it in agent settings.');
      return createOpenAI({ apiKey })(model);
    case 'anthropic':
      if (!apiKey) throw new Error('Anthropic API key required. Add it in agent settings.');
      return createAnthropic({ apiKey })(model);
    case 'google':
      if (!apiKey) throw new Error('Google API key required. Add it in agent settings.');
      return createGoogleGenerativeAI({ apiKey })(model);
    case 'perplexity':
      if (!apiKey) throw new Error('Perplexity API key required. Add it in agent settings.');
      return createPerplexity({ apiKey })(model);
    default:
      return createGroq({ apiKey: process.env.GROQ_API_KEY })('llama-3.3-70b-versatile');
  }
}

export async function POST(req: Request) {
  const { prompt, agentId, context, modelConfig, apiKey } = await req.json();

  const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.orchestrator;

  let fullPrompt = prompt;
  if (context) {
    fullPrompt = `Here's what's been discussed so far:\n\n${context}\n\n---\n\nNow it's your turn. ${prompt}`;
  }

  try {
    const model = getModel(
      modelConfig?.provider || 'groq',
      modelConfig?.model || 'llama-3.3-70b-versatile',
      apiKey
    );

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: fullPrompt,
      maxOutputTokens: 800,
    });

    // Handle the stream and catch errors
    const stream = result.textStream;

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          // Check for common API key errors
          let friendlyError = errorMessage;
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('invalid_api_key')) {
            friendlyError = `Invalid API key. Please check your ${modelConfig?.provider || 'provider'} API key in agent settings.`;
          } else if (errorMessage.includes('429') || errorMessage.includes('rate')) {
            friendlyError = 'Rate limit exceeded. Please wait a moment and try again.';
          } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
            friendlyError = 'The AI service is temporarily unavailable. Try again or switch to a free model.';
          }
          controller.enqueue(encoder.encode(`[ERROR] ${friendlyError}`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`[ERROR] ${errorMessage}`, {
      status: 200, // Return 200 so the client can read the error
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
