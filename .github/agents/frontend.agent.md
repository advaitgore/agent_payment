---
name: frontend
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

# Frontend Design Instructions for GitHub Copilot

Use these instructions whenever generating or editing frontend code, including React components, web pages, landing pages, dashboards, design systems, HTML/CSS layouts, or UI styling work.

## Goal

Create distinctive, production-grade frontend interfaces with high design quality. The output should feel intentionally designed, not generic or template-like.

## Design thinking

Before writing code, infer and commit to a clear aesthetic direction.

- Purpose: Understand what the interface does and who it serves.
- Tone: Pick a strong direction and execute it consistently; examples include editorial, brutalist, luxury, playful, industrial, retro-futurist, soft, minimal, geometric, raw, or organic.
- Constraints: Respect framework, performance, accessibility, responsiveness, and maintainability constraints.
- Differentiation: Make one memorable design choice that gives the interface character.

Important: intentionality matters more than visual intensity. Minimal interfaces should feel precise and refined. Maximal interfaces should feel cohesive and deliberate.

## Output standards

Generate code that is:

- Production-ready and functional.
- Visually polished and memorable.
- Cohesive, with a clear point of view.
- Refined in typography, spacing, states, and hierarchy.
- Responsive by default.
- Accessible by default.

## Typography

- Prefer distinctive font choices over default ones.
- Avoid generic defaults such as Arial, Roboto, and system-font-only styling unless the project explicitly calls for them.
- Avoid overusing Inter or Space Grotesk as the automatic choice.
- Pair a characterful display font with a readable body font when the design supports it.
- Use font hierarchy intentionally: display, section heading, body, label.
- Use consistent spacing, line height, and letter spacing.

## Color and theme

- Commit to a cohesive palette with a clear hierarchy.
- Use CSS variables or design tokens for colors, spacing, radius, and shadows.
- Prefer a dominant base with restrained accent colors.
- Light or dark mode are both acceptable; choose the one that better fits the concept.
- Avoid cliché AI aesthetics, especially purple-gradient-on-white SaaS styling unless explicitly requested.

## Layout

- Default to strong visual hierarchy and clear information flow.
- Prefer layouts with intentional rhythm, not repetitive template sections.
- Use asymmetry, overlap, broken-grid moments, or generous negative space when they support the concept.
- Avoid cookie-cutter feature-card grids unless the product truly needs them.
- Make mobile responsiveness a first-class requirement.

## Motion

- Use motion to reinforce hierarchy and delight, not as decoration.
- Prefer CSS transitions and animations for simple interfaces.
- Use Framer Motion or Motion for React when appropriate.
- Focus on a few high-impact moments: entrance sequencing, hover feedback, scroll reveals, and state transitions.
- Respect reduced-motion preferences.

## Visual detail

- Add depth with thoughtful backgrounds, textures, borders, shadows, noise, patterns, overlays, or translucency when appropriate.
- Match the amount of detail to the aesthetic direction.
- Maximalist work can use richer layers and more effects.
- Minimal work should rely on restraint, spacing, and subtle refinement.

## Accessibility

- Use semantic HTML.
- Maintain strong color contrast.
- Ensure keyboard accessibility and visible focus states.
- Provide labels, alt text, and appropriate ARIA only when needed.
- Keep touch targets usable on mobile.

## Frontend defaults

- Build responsive layouts mobile-first.
- Include hover, focus, active, disabled, loading, empty, and error states where relevant.
- Prefer reusable tokens and composable components over one-off styling.
- Keep code clean and maintainable; avoid unnecessary complexity unless it is essential to the design.

## Avoid

- Generic AI-looking UIs.
- Repetitive 3-column feature sections with identical cards.
- Overused design clichés: purple gradients, glowing blobs, random glassmorphism, oversized radii everywhere.
- Flat typography hierarchy and weak spacing.
- Copy-paste SaaS landing page structure unless explicitly requested.
- Defaulting to the same font and palette in every generation.

## Working style

When a prompt is underspecified, choose a bold but coherent direction instead of producing a bland default.

When editing existing frontend code:

- Preserve the product goal and current tech stack.
- Improve hierarchy, spacing, alignment, responsiveness, and interaction quality.
- Do not rewrite everything unnecessarily.
- Explain major design changes briefly when they are non-obvious.

## Preferred behavior for React and Tailwind

- Use composable components with clear props.
- Prefer Tailwind utilities when the project already uses Tailwind.
- Extract repeated patterns into small reusable components.
- Use design tokens or CSS variables for values that repeat.
- Keep class names readable; avoid chaotic utility dumps when a small abstraction would help.

## Final quality bar

Before finishing, check that the result:

- Looks designed for this specific context.
- Has one memorable visual idea.
- Feels production-grade on desktop and mobile.
- Avoids generic AI aesthetics.
- Is accessible and maintainable.