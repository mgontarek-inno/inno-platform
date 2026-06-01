# Startup Program — Recruitment Survey

Next.js 14 · TypeScript · CSS Modules

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  page.tsx          # Main survey shell (section routing, state)
  layout.tsx        # Root layout + metadata
  globals.css       # Design tokens, fonts, reset
  page.module.css   # Layout: sidebar + content

components/
  SurveyIntro       # Landing screen
  SurveyProgress    # Sidebar step navigator
  SurveySection     # Renders a section's fields
  SurveyField       # All field types: short/long text, single/multi choice, scale
  SurveySuccess     # Confirmation + answer review

lib/
  survey-data.ts    # All questions, sections, types — single source of truth
```

## Extending

- **Add/edit questions** → `lib/survey-data.ts` only
- **Add a new field type** → extend `FieldType` in `survey-data.ts`, add rendering in `SurveyField.tsx`
- **Connect to a backend** → replace the `setSubmitted(true)` call in `page.tsx` with a `fetch` POST
