# Frontend Architecture & Agent Instructions

This is the frontend mobile application for the System Design Interview Simulator, built using Expo SDK 54, React Native 0.81.5, and Expo Router.

## Expo Rules

- **Dependencies**: ALWAYS use `npx expo install <package>` instead of `npm i` or `yarn add` to avoid SDK version mismatches.
- **Routing**: Expo Router file-based routing (`app/`). Screen components live inside `app/`, reusable UI/business logic lives in `src/`.
- **Prebuild**: Do not edit `android/` or `ios/` manually—they are generated via `npx expo prebuild`.
- **Typecheck**: Verify changes with `npx tsc --noEmit`.

---

## 🎨 Mandatory UI / Screen Rule

Before implementing, generating, redesigning, or modifying ANY UI, screen, or frontend component (e.g., Home, Practice, Learning, Session, Profile):

1. **Analyze Skill First**: You MUST call `view_file` on `p:/sd-sim/.agents/skills/frontend/SKILL.md` before writing or modifying any UI code.
2. **Output Design Read**: You must print the one-line Design Read:
   `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic>."`
3. **Set the Three Dials**: Explicitly set the dials:
   - `DESIGN_VARIANCE` (1-10)
   - `MOTION_INTENSITY` (1-10)
   - `VISUAL_DENSITY` (1-10)
4. **Enforce Guidelines**:
   - **No Congestion / Wall of Text**: Cut long descriptions. Replace paragraph dumps with clear typography, metric pills, and scannable cards.
   - **Dashboard Role**: The Home screen is a quick-action command center—not a curriculum catalog. Keep it punchy.
   - **Follow Skill Constraints**: Strict adherence to spacing, contrast, typography pairings, and interaction states as defined in the skill file.
