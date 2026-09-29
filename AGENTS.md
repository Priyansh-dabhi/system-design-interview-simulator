# Project Architecture & Agent Instructions

This is the System Design Interview Simulator (React Native / Expo 54 with New Architecture).
- Root workspace: `p:\sd-sim`
- Mobile app: `p:\sd-sim\frontend`
- Backend: `p:\sd-sim\backend`

## Expo & Project Guidelines

- **Package Management**: ALWAYS use `npx expo install <package>` instead of `npm install` for native libraries to ensure SDK 54 compatibility.
- **Verification**: Run `npm run typecheck` or `npx tsc --noEmit` from `frontend/` to verify types.
- **Routing**: Uses **Expo Router** (`frontend/app/`). All navigation happens via Expo Router hooks (`useRouter`, `<Link>`).
- **Icons**: Use `phosphor-react-native` (standard across the app) with appropriate weights (`regular`, `fill`, `bold`).

---

## 🎨 Mandatory UI / Screen Rule

Before implementing, generating, redesigning, or modifying ANY UI, screen, or frontend component (e.g., Home, Practice, Learning, Session, Profile):

1. **Analyze Skill First**: You MUST call `view_file` on `p:/sd-sim/.agents/skills/frontend/SKILL.md` before proposing or writing code changes.
2. **Output Design Read**: You must state a one-line Design Read before any implementation:
   `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic>."`
3. **Set the Three Dials**: Explicitly define the three dials:
   - `DESIGN_VARIANCE` (1-10)
   - `MOTION_INTENSITY` (1-10)
   - `VISUAL_DENSITY` (1-10)
4. **Anti-Congestion & Anti-Slop Discipline**:
   - **First impression over text walls**: Cut text ruthlessly. No giant paragraphs, dense checklists, or essay-length summaries on overview cards.
   - **Breathing room & hierarchy**: Clean spacing, concise labels (1-2 lines max), distinct visual weight for primary actions.
   - **No duplication**: The Home screen is a command center/dashboard—it should NOT duplicate entire curriculum lists that already belong in the Learn or Practice tabs.
   - **Contrast & polish**: Ensure WCAG AA readability, consistent rounded radii, and cohesive dark/light palette matching Figma tokens (`#080B12`, `#2563EB`, `#10B981`).
