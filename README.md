# Remotion Studio

Production-grade Remotion operating system — compositions, timeline editing, labs, and render queues. Built with **Next.js**, **Remotion**, **Zustand**, and **Tailwind**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Official Remotion Studio (composition registry):

```bash
npm run remotion
```

## Studio routes

| Route | Purpose |
|-------|---------|
| `/` · `/dashboard` | Enterprise dashboard |
| `/projects` · `/templates` | Projects & template marketplace |
| `/editor/[id]` | Full timeline editor |
| `/storyboard` | Scene planning |
| `/compositions` | Composition registry inspector |
| `/timeline` · `/assets` · `/audio` | Timeline / assets / mixer hubs |
| `/showcase` | Capability showcase |
| `/primitives` · `/animations` · `/transitions` · `/captions` · `/three` · `/player-lab` | Interactive Remotion labs |
| `/render-center` | Render queue & export history |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js app |
| `npm run remotion` | Remotion Studio CLI |
| `npm run remotion:render` | CLI render Main composition |
| `npm run build` | Production build |
