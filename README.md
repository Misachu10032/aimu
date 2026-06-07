# Aimu

Aimu is a subtitle translation editor built for correcting AI-generated translations. Load a video, review the machine-translated subtitles alongside the original, and fix up timing, wording, and errors — all in one synced view.

## Why

Auto-generated subtitle translations are a good first draft, not a final one. Aimu is built around the *correction* workflow: it plays the video, renders both original and translated text per line, flags common issues automatically, and lets you fix them in place without leaving the editor.

## Features

- **Synced video playback** — powered by [ArtPlayer](https://github.com/zheeeng/ArtPlayer) with [JASSUB](https://github.com/ThaUnknown/jassub) for styled `.ass`/`.ssa` subtitle rendering, plus [wfplayer](https://github.com/zhw2590582/WFPlayer) for the audio waveform view.
- **Dual-text subtitle editing** — edit original and translated text side by side per cue.
- **Timeline tools** — waveform-based scrubbing, drag-to-mark cue boundaries, and a subtitle list synced to playback position.
- **Automatic issue detection** — flags problems like overlapping cues and cues that are too short, surfaced directly on the timeline as you play.
- **Local-first tasks** — video and subtitle tasks are analyzed and stored client-side (via `localforage`), so nothing leaves your machine unless you export it.
- **Multi-language UI** — interface available in English, Japanese, Korean, Thai, Simplified Chinese, and Traditional Chinese.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Zustand](https://github.com/pmndrs/zustand) for app/task/create state
- [Ant Design](https://ant.design) for UI components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [i18next](https://www.i18next.com) / `react-i18next` for localization
- ArtPlayer + JASSUB + wfplayer for video/subtitle/waveform playback

> **Note:** This project pins a Next.js version with breaking API changes from what most tooling and training data expect. See [AGENTS.md](AGENTS.md) and `node_modules/next/dist/docs/` before making framework-level changes.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the codebase
```

## Project Structure

```
app/           # Next.js App Router entry points
components/    # UI: Player, Subtitle editor, Footer (waveform/timeline), Header, Dialogs, Tool
store/         # Zustand stores (app state, active task, create/upload flow)
lib/           # Subtitle model, task/error-detection logic, shared utilities
i18n/          # Locale files and i18next setup
types/         # Ambient type declarations for untyped dependencies
public/        # Static assets, including the JASSUB WASM worker
```

## Usage

1. Open the **Create** dialog and upload a video file.
2. Aimu analyzes the video and loads its subtitle task (original + AI-translated text).
3. Play through the video; flagged cues (overlaps, timing issues) are highlighted on the timeline.
4. Edit subtitle text and timing directly, using the waveform and subtitle list to navigate.
