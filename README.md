# Cortex - AI Agent Workspace

A visually stunning multi-agent AI system that demonstrates real-time collaboration between specialized AI agents. Watch agents reason, delegate tasks, and solve problems together.

## Features

- **5 Specialized Agents**: Orchestrator (Nexus), Researcher (Scout), Coder (Forge), Critic (Sage), and Creative (Muse)
- **Real-time Streaming**: See agent thoughts appear as they're generated
- **Visual Agent Network**: Animated visualization of agent connections and activity
- **Task Delegation**: Watch the orchestrator break down problems and delegate to specialists
- **Beautiful Dark UI**: Glassmorphic design with smooth animations

## Tech Stack

- **Next.js 16** with App Router
- **Vercel AI SDK** with AI Gateway
- **Framer Motion** for animations
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** for state management

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API key:
- `ANTHROPIC_API_KEY` for direct Anthropic access, or
- Configure Vercel AI Gateway in your Vercel project

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **User Input**: Enter a prompt or click an example
2. **Orchestration**: Nexus analyzes the request and delegates subtasks
3. **Specialist Work**: Relevant agents (Scout, Forge, Sage, Muse) process their assigned tasks
4. **Streaming Output**: Watch thoughts stream in real-time with agent attribution
5. **Visual Feedback**: See active agents pulse and connections light up

## Deploy on Vercel

The easiest way to deploy is via [Vercel](https://vercel.com/new):

1. Push to GitHub
2. Import to Vercel
3. Add your `ANTHROPIC_API_KEY` environment variable
4. Deploy

## License

MIT
