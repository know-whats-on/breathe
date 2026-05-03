As a senior UX designer and digital health strategist, I have analyzed the psychological and physical state of an elderly user experiencing a COPD breathlessness episode. During a flare-up, the user is likely experiencing panic, hypoxia, and physical tremors, which severely degrade cognitive function and fine motor skills.pdf].

Therefore, the "Palm of Calm" application must transcend traditional app design. It cannot be a digital filing cabinet; it must act as a structured, calming companion that requires near-zero cognitive effort.

Here is the comprehensive, implementation-ready product specification for Figma and Lovable.

Product Specification: "Palm of Calm"
1. App Structure & Architecture
The architecture is aggressively flat, divided into two distinct mental models: "Quiet Time" (baseline management) and "Episode Mode" (emergency recovery).

Home (The Dashboard)

Primary Action: "HELP ME RECOVER" (Triggers Episode Mode)

Secondary Tiles: My Info, My Logs, Emergency Contacts

Episode Mode (Linear Flow)

Step 1: STOP

Step 2: POSITION

Step 3: FAN

Step 4: BREATHE

Step 5: EVALUATE

Post-Evaluate Action: Resolution (Log) OR Escalation (Action Plan/000)

Quiet Time Hub

My Info: Static display of personalized settings.

My Logs: Simple chronological list of recorded episodes.

Emergency Contacts: Large, tap-to-call buttons for 000, preferred doctor, and next of kin.

2. Detailed Screen Designs & Interaction Flows
Screen 1: The Home Dashboard
Layout: No scrolling allowed. All elements must fit within the viewport of a standard device (e.g., iPhone SE size).

Hero Element: The top 50% of the screen is dedicated to a massive, pill-shaped button labeled "HELP ME RECOVER".

Interaction: Tapping anywhere in this zone instantly launches the Episode Mode.

Secondary Elements: The bottom 50% contains three large, equally sized square tiles arranged in a grid or row: "My Info", "My Logs", "Emergency Contacts".

Screens 2-6: Episode Mode (The "12345 Palm" Flow)
This is a full-screen, focused flow. The background transitions to a soft, calming white-to-green gradient. A prominent "Exit" button (X) is always available in the top right corner.

Visual Anchor: A large, simplified line-drawing of a hand remains in the center of the screen throughout the flow.pdf]. As the user progresses, the corresponding finger highlights.

Interaction: Users navigate via a massive "NEXT" button at the bottom of the screen. Swiping is supported but tapping is primary.

Audio: Upon entering this mode, an optional, calm voice automatically reads the text on the screen.pdf].

The Sequence:

STOP (Thumb): Bold text reads "STOP what you are doing".pdf].

POSITION (Index): Bold text reads "Find a resting position".pdf]. Shows a simple silhouette leaning forward with arms supported.pdf].

FAN (Middle): Bold text reads "Use your fan or the breeze".pdf].

BREATHE (Ring): Bold text reads "Choose your breathing technique".pdf]. Displays an animated "Rectangle Breathing" visual guide that expands and contracts slowly.pdf].

EVALUATE (Pinky): A 2-minute timer appears. Bold text asks "Are you feeling less breathless?".pdf].

Options: Two massive buttons: "Yes, I am better" (Green) and "No, I need more help" (Blue).

Screen 7: Escalation / Action Plan (If "No" is selected)
If the behavioral recovery fails, the app transitions to clinical intervention.

Prompt: "Take your prescribed reliever inhaler medication through a spacer".pdf].

Action: Displays a massive button to dial 000 or call the preferred doctor.

Screen 8: Post-Episode Log (If "Yes" is selected)
Prompt: "Great job. What triggered this?"

Interaction: One-tap selection from common triggers (e.g., Walking, Showering, Dressing).pdf]. This automatically saves to "My Logs" with a timestamp.

3. UI Components & Design Tokens
Color Palette
Backgrounds: Clinical White (#FFFFFF) and Soft Off-White (#F8F9FA) to reduce glare.

Primary Action (Lung Foundation Green): Soft Sage Green (e.g., #78B382). Used only for positive progression (e.g., the "Next" button, the "HELP ME RECOVER" button).

Secondary Action (UTS Blue): Soft, muted Blue (e.g., #5A8BAF). Used for informational tiles.

Text (High Contrast): Dark Charcoal (#222222). Never use pure black or light gray for text.

Alert/Escalation: Warm, soft orange (e.g., #E88C5D). Avoid harsh, panic-inducing reds.

Typography (Accessibility First)
Font Family: System Sans-Serif (e.g., San Francisco on iOS, Roboto on Android) for maximum legibility.

Body Text: Minimum 24pt (Exceeds the 20pt requirement for enhanced safety).

Headers: 36pt, Bold.

Line Height: 1.5x minimum to ensure text is highly scannable.

Iconography
Must use thick strokes (min 3px) and filled shapes.

Icons must be literal, not abstract (e.g., a physical phone receiver for "Call", not a speech bubble).

4. Accessibility Rules (WCAG AAA Focus)
Touch Targets: Minimum dimension for any interactive element is 60x60px. The "HELP ME RECOVER" and "NEXT" buttons should span the full width of the screen with generous padding.

Contrast Ratio: Ensure a minimum contrast ratio of 7:1 for all text against its background.

Cognitive Load Limit: strictly one instruction per screen during the Episode Mode. Do not force the user to hold multiple steps in their working memory.

No Scrolling: Critical pathways (Home and Episode Mode) must be 100% visible without scrolling. If content exceeds the screen, it must be paginated via a "Next" button.

Feedback: Every tap must provide immediate visual feedback (e.g., button darkens) and optional haptic feedback.

5. Developer Constraints & Implementation Notes
Offline-First Architecture: The core recovery flow (Screens 2-7) and all associated assets (images, animations, text-to-speech audio files) must be bundled locally within the app. The app must function flawlessly in airplane mode or areas with zero connectivity.

State Management Resilience: If the user accidentally backgrounds the app or locks their phone during an episode, reopening the app must return them exactly to the step they were on, without restarting the sequence.

Animation Performance: The breathing animation (Step 4) must be smooth and run on a dedicated thread to ensure it does not stutter, as irregular animations can induce anxiety.

Audio Implementation: Use native text-to-speech APIs, but provide pre-recorded, high-quality audio files as a fallback to ensure the "calm, reassuring" tone is preserved across all devices.