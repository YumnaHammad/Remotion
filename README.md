# Framekit — Templates & Automation

Lightweight video SaaS built with **Next.js**, **Remotion**, **Zustand**, and **Tailwind**.

Turn websites and spreadsheets into videos — pick a template, edit text and colors, preview live, export MP4.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For real MP4 export locally:

```bash
REMOTION_RENDER=1 npm run dev
```

## Main pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard |
| `/templates` | Template gallery → simple create workflow |
| `/website-to-video` | Paste URL → auto-fill from metadata |
| `/data-to-video` | Upload CSV / Excel / JSON → slideshow video |
| `/brand` | Brand kit (logo, colors, font) — localStorage |
| `/exports` | Download renders + manage projects |
| `/create/[id]` | 5-step editor (no timeline) |
| `/projects` | Advanced timeline projects (preserved) |
| `/editor/[id]` | Full timeline editor (preserved) |

## Folder structure

```
src/
  app/              # Next.js routes
  components/       # UI + layout + editor (advanced)
  features/         # Website-to-video, data-to-video, brand kit, workflow
  templates/        # Template catalog + composition map
  hooks/            # useBrandKit, etc.
  types/            # Shared TypeScript types
  utils/            # Parsers, project factory, brand defaults
  remotion/         # Compositions (templates + DataSlideshow)
  stores/           # Zustand (projects, brand, simple videos)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js app |
| `npm run remotion` | Remotion CLI (composition inspector) |
| `npm run build` | Production build |
