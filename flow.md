# Resume Builder — Complete System Flow

---

## Table of Contents

1. Architecture Overview
2. Data Structures
3. State Management — What Lives Where and Why
4. Flow 1: Resume Parsing (Drop Zone → Master Profile)
5. Flow 2: Manual Profile Entry (UserForm)
6. Flow 3: Job Description Analysis
7. Flow 4: Skill Categorization
8. Flow 5: Skill Mapping (Experiences ↔ Skills)
9. Flow 6: Resume Generation
10. Flow 7: Preview & Editing
11. Flow 8: Download as Word
12. Cross-cutting Concerns (Quota, Auth, Saving)
13. The Full Data Journey — End to End
14. Common Bug Patterns & Why They Happen

---

## 1. Architecture Overview

The app is a Next.js frontend-only application. There is no custom backend. All AI calls
go directly from the browser to third-party APIs. Persistence is Firebase Firestore.

```
Browser
  ├── Redux Store (in-memory, session-only)
  │     ├── auth slice     → user object (uid, name, email)
  │     ├── firebase slice → userDetails (master profile), userQuota
  │     └── skills slice   → combinedSkills, skillsMapped, skills (JD session)
  │
  ├── Firestore (persistent across sessions)
  │     └── users/{uid}/details → userDetails document
  │
  └── Third-party APIs (called directly from browser)
        ├── Groq (llama-3.3-70b-versatile) → skill extraction, categorization,
        │                                     responsibilities, summary
        ├── Google Gemini → fallback AI (imported but mostly unused)
        └── OpenAI → fallback AI (imported but mostly unused)
```

The entire UI lives in `NewLayout.jsx`. It renders two columns:

- Left: Master Profile (compact view, live editable)
- Right: Job Description Analyzer (Steps 2 & 3)

Below both columns: Resume Generator (Step 4), which produces the preview and download.

---

## 2. Data Structures

### 2a. userDetails (the master profile — stored in Firestore + Redux)

```javascript
{
  fullName: "string",
  email: "string",
  phone: "string",

  // Professional summary
  savedSummary: "string",         // User's written summary text
  summaryMode: "own"|"append"|"regenerate",

  // Work experience array
  experience: [
    {
      title: "string",            // Job title
      employer: "string",
      location: "string",
      startDate: "YYYY-MM",
      endDate: "YYYY-MM",
      customResponsibilities: ["string"],  // User-written bullet points
      responsibilityType: "skillBased"|"titleBased"|"none"
        // skillBased → AI generates bullets from mapped skills
        // titleBased → AI generates bullets from job title alone
        // none → locked, no AI bullets, only customResponsibilities used
    }
  ],

  // Master skills — the source of truth for the user's known skills
  customSkills: [
    {
      skill: "string",            // e.g. "React", "Python"
      category: "string",         // e.g. "Frameworks & Libraries"
      experienceMappings: [0, 1, 2]  // indices into experience array
        // means "this skill was used in experience[0], experience[1], experience[2]"
    }
  ],

  education: [
    {
      degree: "string",
      institution: "string",
      startDate: "YYYY-MM",
      endDate: "YYYY-MM",
      grade: "string"
    }
  ],

  certifications: [
    {
      name: "string",
      issuer: "string",
      issueDate: "YYYY-MM",
      expiryDate: "YYYY-MM"
    }
  ],

  projects: [
    {
      name: "string",
      description: "string",
      technologies: "string",
      startDate: "YYYY-MM",
      endDate: "YYYY-MM",
      link: "string"
    }
  ]
}
```

### 2b. combinedSkills (JDA session state — Redux only, never persisted)

```javascript
[
  // Generated (from JD analysis, NOT yet in master):
  {
    skill: "JavaScript",
    category: "Programming Languages", // assigned by categorizeNewSkills
    experienceMappings: [0, 1], // indices
    type: "generated",
    _fromJD: true,
  },
  // Custom (from master profile, always present):
  {
    skill: "Telugu",
    category: "Languages",
    experienceMappings: [0],
    type: "custom",
    // no _fromJD flag
  },
];
```

### 2c. skillMappings (JDA local state — component-level only)

```javascript
[
  {
    skill: "JavaScript",
    category: "Programming Languages",
    experienceMappings: [0, 1],
  },
];
// This is the intermediate store used by JDA before combinedSkills is built.
// category is attached here first (from categorizeNewSkills),
// then initializeCombinedSkills reads it to build combinedSkills.
```

### 2d. Resume Content (generated output — local state in ResumeGenerator)

```javascript
{
  fullName: "string",
  contactInformation: "email | phone",
  professionalSummary: "string",    // final generated or user-written text
  summaryParts: {                   // only set when mode === "append"
    base: "string",                 // user's original text
    appended: "string"              // AI-generated addition
  },
  summaryMode: "own"|"append"|"regenerate",
  technicalSkills: "Languages: X, Y | Tools: A, B",  // pipe-separated string
  technicalSkillsGrouped: [         // structured version for rendering
    { category: "Languages", skills: ["Telugu", "English"] },
    { category: "Programming Languages", skills: ["JavaScript", "PHP"] }
  ],
  appendedSkills: ["JavaScript"],   // JD-only skills (for green highlight in preview)
  professionalExperience: [
    {
      title: "string",
      employer: "string",
      location: "string",
      startDate: "string",
      endDate: "string",
      responsibilities: ["string"]  // merged: AI-generated + customResponsibilities
    }
  ],
  education: [...],
  certifications: [...],
  projects: [...]
}
```

---

## 3. State Management — What Lives Where and Why

### Redux slices

**auth slice** (`store/slices/authSlice.js`)

- `user`: `{ uid, name, email, photoURL }`
- Set on Google login, cleared on logout
- Read everywhere that needs the user's uid for API calls

**firebase slice** (`store/slices/firebaseSlice.js`)

- `userDetails`: the full master profile object (see 2a)
- `userQuota`: `{ generates, downloads, parsing }` — usage counts
- Loaded from Firestore on login, updated on every save
- This is the single source of truth for the profile across all components

**skills slice** (`store/slices/skillsSlice.js`)

- `skills`: flat array of skill name strings from the current JD analysis
- `skillsMapped`: array of `{ skill, experienceMappings }` objects
- `combinedSkills`: the full array including type, category, \_fromJD (see 2b)
- These are SESSION ONLY — they reset when the page refreshes
- They represent the current JD analysis session, not the master profile

### Why this split?

`userDetails.customSkills` = permanent master skills the user has built over time.
`skills/combinedSkills` = temporary working set for the current JD session, which
merges master skills + JD-extracted skills together for the purpose of resume generation.

When the user clicks "Generate Resume", `ResumeGenerator` reads from Redux
`combinedSkills` (the merged session set), not just `userDetails.customSkills`.

### Local component state

**`JobDescriptionAnalyzer`** keeps:

- `jobDescription`: textarea content
- `analysis`: the raw Groq response `{ technicalSkills, yearsOfExperience, roleDescriptions }`
- `skillMappings`: intermediate array with category attached, before combinedSkills is built
- `combinedSkills`: local mirror of what's in Redux (kept in sync via useEffect)
- `openDropdown`: which skill chip's mapping dropdown is open

**`ResumeGenerator`** keeps:

- `resumeContent`: the generated resume object (see 2d)
- `loading`: generation in progress flag
- `refreshPreview`: boolean toggle to force ResumePreview to re-read resumeContent

**`ResumePreview`** keeps:

- `resumeData`: local copy of resumeContent (parsed from JSON)
- `isEditing`: whether the inline editor is active
- `savedResponsibilities`: map of `"expIndex-respText" → true` for highlighting

### Firestore

One document per user: `users/{uid}/details`

Contents: the entire `userDetails` object serialized as JSON.

Written by `UserDetailsService.saveUserDetails(uid, details)`.
Read by `UserDetailsService.getUserDetails(uid)` on login/mount.

The app never reads from Firestore during generation — it always uses Redux.
Firestore is only written when the user explicitly saves (Edit Profile → Save,
or compact view direct-save actions like toggling responsibilityType).

---

## 4. Flow 1: Resume Parsing (Drop Zone → Master Profile)

### Entry point: `ResumeDropZone.jsx`

The user drops or selects a PDF or DOCX file.

```
User drops file
  → processFile(file)
  → Step 1: extractTextFromPDF(file) or extractTextFromDOCX(file)
  → Step 2: parseResumeWithGroq(rawText)
  → Step 3: normaliseAndMap(parsed)
  → onParsed(finalDetails)  ← callback from NewLayout
```

### Step 1: Text Extraction

**PDF**: Uses `pdfjs-dist/legacy/build/pdf` with worker disabled (main-thread mode).
Iterates pages, joins text items into one string per page, then joins all pages.

**DOCX**: Uses `mammoth/mammoth.browser` (browser build specifically — the default
entry is Node.js only and would fail). Calls `extractRawText({ arrayBuffer })`.

Both return a raw text string. If empty after trim, throws an error (image-based PDF).

### Step 2: Groq Parsing

`parseResumeWithGroq(rawText)` sends the first 12,000 characters to Groq
(llama-3.3-70b-versatile) with a detailed schema prompt.

The prompt asks Groq to return a JSON object matching:

```
fullName, email, phone, summary, experience[], education[],
certifications[], projects[], skillCategories[]
```

Key detail: `skillCategories` is the structured form:

```javascript
[{ category: "Languages", skills: ["JavaScript", "Python"] }];
```

Groq is instructed to:

- If skills have headings in the resume → use those exact headings as categories
- If skills are flat → infer sensible categories
- If no skills section → infer from experience descriptions

### Step 3: normaliseAndMap(parsed)

This function transforms the raw Groq output into the `userDetails` schema.

Critical transformation: `skillCategories → customSkills`

```javascript
// Groq returns:
skillCategories: [{ category: "Languages", skills: ["Java", "Python"] }];

// normaliseAndMap converts to:
customSkills: [
  { skill: "Java", category: "Languages", experienceMappings: [] },
  { skill: "Python", category: "Languages", experienceMappings: [] },
];
```

`experienceMappings` defaults to NO experience indices (`[]`).
The user can then refine these mappings in the compact view or UserForm.

Also sets:

- `savedSummary` from `parsed.summary`
- `summaryMode` defaults to `"append"` on import

### Saving

`onParsed` in `NewLayout` calls:

```javascript
await UserDetailsService.saveUserDetails(user.uid, parsedDetails);
dispatch(setUserDetails(parsedDetails));
```

Both Firestore and Redux are updated simultaneously. The compact view
re-renders immediately from Redux. The page does NOT reload.

---

## 5. Flow 2: Manual Profile Entry (UserForm)

### Entry point

"Edit Full Profile" button → `showEditModal = true` → renders `UserForm` inside a modal.

### How UserForm works

UserForm has its own internal `userDetails` state, initialized from `initialData` prop
(which is the current Redux `userDetails`).

This means edits are LOCAL to UserForm until the user clicks "Save Details".
Nothing goes to Redux or Firestore mid-edit.

The form has 5 tabs:

- **Contact**: fullName, email, phone
- **Work History**: experience array with dates, responsibilities, responsibilityType
- **Master Skills**: customSkills grouped by category, with mapping dropdowns
- **Summary**: summaryMode selector + textarea for savedSummary
- **Academics**: education, certifications, projects

### Category rename in UserForm

The category rename input in UserForm uses `onChange` only (no blur save needed)
because UserForm saves everything at once on submit. The `setUserDetails` local state
update is fine here — it doesn't trigger any external save.

### Save flow

```javascript
handleSave(e)
  → onSave(userDetails)          ← prop from NewLayout
  → handleSaveDetails(details)
  → UserDetailsService.saveUserDetails(uid, details)
  → dispatch(setUserDetails(details))
  → setShowEditModal(false)
```

### MiniPreview

UserForm renders a `MiniPreview` on the left side showing a live preview of the
profile as the user edits. This reads from UserForm's LOCAL state (not Redux),
so it updates in real-time as you type without any saves.

---

## 6. Flow 3: Job Description Analysis

### Entry point: `JobDescriptionAnalyzer.jsx`

User pastes JD text → clicks "Analyze Job Description".

```
analyzeJobDescription()
  → QuotaService.checkQuota(uid, "parsing")
  → Groq call #1: extract skills from JD
  → setAnalysis(result)               ← local state
  → dispatch(setSkills(result.technicalSkills))  ← Redux skills slice
  → filter brandNewSkills (not in master)
  → get existingCategories from userDetails.customSkills
  → Groq call #2: categorizeNewSkills(brandNewSkills, existingCategories)
  → setSkillMappings(updatedMappings)  ← local state with categories attached
  → dispatch(setSkillsMapped(updatedMappings))
  → QuotaService.incrementUsage(uid, "parsing")
```

### Groq call #1 — JD extraction

Prompt asks for:

```json
{
  "technicalSkills": ["string"],
  "yearsOfExperience": number,
  "roleDescriptions": [{ "title", "organization", "description" }]
}
```

Only `technicalSkills` is used downstream. `yearsOfExperience` and
`roleDescriptions` are returned but currently not surfaced in the UI.

### The skillMappings useEffect

After `setAnalysis` runs, a `useEffect` fires:

```javascript
useEffect(() => {
  if (analysis?.technicalSkills && userDetails) {
    setSkillMappings((prev) => {
      // For each skill in JD:
      //   - if already in skillMappings → keep existing (preserves user edits)
      //   - if in userDetails.customSkills → use master skill's mappings
      //   - if brand new → create with all experience indices
    });
  }
}, [analysis?.technicalSkills, userDetails]);
```

This runs BEFORE `categorizeNewSkills` completes, so the initial skillMappings
entries don't have `category` yet. Category gets added later when `analyzeJobDescription`
calls `setSkillMappings` again inside the async flow.

### The combinedSkills useEffect

```javascript
useEffect(() => {
  if (
    (analysis?.technicalSkills || userDetails?.customSkills) &&
    skillMappings.length > 0
  ) {
    const initialSkills = initializeCombinedSkills();
    // only update if actually changed (prevents infinite loops)
    if (JSON.stringify(initialSkills) !== JSON.stringify(combinedSkills)) {
      setCombinedSkills(initialSkills);
      dispatch({ type: "skills/setCombinedSkills", payload: initialSkills });
    }
  }
}, [skillMappings, userDetails?.customSkills, analysis?.technicalSkills]);
```

This fires every time `skillMappings` changes (including after category is attached),
rebuilding `combinedSkills` fresh each time.

### initializeCombinedSkills()

```javascript
const initializeCombinedSkills = () => {
  // generated = JD skills NOT in master profile
  const generated = analysis.technicalSkills
    .filter((skill) => !customSkillSet.has(skill))
    .map((skill) => {
      const mapping = skillMappings.find((m) => m.skill === skill);
      return {
        skill,
        experienceMappings: mapping?.experienceMappings || allIndices,
        category: mapping?.category || "Technical Skills", // ← reads category
        type: "generated",
        _fromJD: true,
      };
    });

  // custom = master profile skills (always included)
  const custom = userDetails.customSkills.map((s) => ({
    ...s,
    type: "custom",
  }));

  return [...generated, ...custom];
};
```

This is the critical function where `category` from `skillMappings` gets
transferred onto the `combinedSkills` objects. If this function runs before
`categorizeNewSkills` finishes, `category` will be `undefined` → falls back
to `"Technical Skills"`. When it runs again after categories are assigned
(because `skillMappings` changed), it picks up the real categories.

---

## 7. Flow 4: Skill Categorization

### categorizeNewSkills(newSkills, existingCategories)

This is a top-level async function (outside the component) in `JobDescriptionAnalyzer.jsx`.

It sends two pieces of information to Groq:

1. The brand-new skills (not in master profile)
2. The user's existing category names (so Groq can reuse them)

The prompt has explicit rules:

- Human languages → "Languages"
- CSS/SQL/PHP/HTML → "Programming Languages"
- Mapping/Conversion/ETL → "Data Processing"
- Never use "Technical Skills", "From Job Description", "Other"

Returns: `{ "JavaScript": "Programming Languages", "Spanish": "Languages", ... }`

Post-processing safety net applies rule-based categorization to any skill
that Groq still returned with a vague category.

### The duplicate function problem (historical bug)

There was a second `categorizeNewSkills` function defined INSIDE `analyzeJobDescription`.
In JavaScript, a function declaration inside another function creates a new binding in
that inner scope, shadowing the outer one. So the outer (good) function was never called —
the inner (bad) one with the old prompt and `"From Job Description"` fallback was used
instead. Fix: delete the inner duplicate entirely.

---

## 8. Flow 5: Skill Mapping (Experiences ↔ Skills)

### What is skill mapping?

Each skill has an `experienceMappings` array of experience indices.

```javascript
{ skill: "React", experienceMappings: [0, 2] }
// means React was used in experience[0] and experience[2]
```

When `generateResponsibilities` runs for experience[0], it only uses skills
where `experienceMappings.includes(0)`.

### Three mapping locations

**In compact view (NewLayout):**
Clicking ⇄ on a skill opens an inline dropdown.
Checkbox changes call `handleDirectSave` immediately → Firestore + Redux updated.

**In JDA chip UI:**
Clicking the map icon on a skill chip opens a dropdown.
For `type === "custom"` skills: updates `userDetails.customSkills` in Redux
(but does NOT auto-save to Firestore — user needs to save via UserForm).
For `type === "generated"` skills: updates `skillMappings` local state only.

**In UserForm Master Skills tab:**
Map icon opens a `PortalDropdown` (rendered via React portal to avoid z-index issues).
Changes update UserForm's local `userDetails` state. Saved on form submit.

### responsibilityType per experience

Each experience also has a `responsibilityType`:

- `"skillBased"`: AI prompt includes only the skills mapped to this experience
- `"titleBased"`: AI prompt uses only the job title, no skills mentioned
- `"none"`: No AI generation at all — only `customResponsibilities` are used

This is set per-experience in UserForm, compact view toggle buttons, or JDA chip dropdown.

---

## 9. Flow 6: Resume Generation

### Entry point: `ResumeGenerator.jsx`

User clicks "Generate Resume".

```
generateResume()
  → QuotaService.checkQuota(uid, "generates")
  → Promise.all: generateResponsibilities for each experience
  → generateProfessionalSummary or use savedSummary (based on summaryMode)
  → build newResumeContent object
  → setResumeContent(newResumeContent)
  → setRefreshPreview(toggle)
  → QuotaService.incrementUsage(uid, "generates")
```

### Step 1: generateResponsibilities(experience, expIndex)

For each experience:

1. If `responsibilityType === "none"` → return `[]` (skip AI)
2. Find all `combinedSkills` where `experienceMappings.includes(expIndex)`
3. Build prompt based on `responsibilityType`:
   - `"skillBased"`: "Generate 8 bullets using these skills: [list]. Do NOT mention the title."
   - `"titleBased"`: "Generate 8 bullets for the role of [title]. Do NOT mention any skills."
4. Call Groq, parse JSON response `{ responsibilities: ["string"] }`
5. Returns array of 8 responsibility strings

Final responsibilities in the resume = `[...generatedResponsibilities, ...customResponsibilities]`

Custom (user-written) ones always appear after AI-generated ones.

### Step 2: Summary generation (three modes)

**`"own"` mode:**
Uses `userDetails.savedSummary` exactly as written. No AI call.
If `savedSummary` is empty, falls back to full regeneration.

**`"append"` mode:**
Calls `generateSummaryAppend(savedSummary, combinedSkills)`.
Prompt: "Write EXACTLY 2 sentences to append to this existing summary that naturally
mention these skills: [skills not already mentioned in summary]."
Returns `{ appended: "two sentences" }`.
Final: `savedSummary.trimEnd() + " " + appended`
Sets `summaryParts = { base: savedSummary, appended }` for preview highlighting.

**`"regenerate"` mode:**
Calls `generateProfessionalSummary(totalExperience, combinedSkills, latestRole)`.
Prompt: "Generate 6-8 sentence summary for someone with X years experience,
these skills, and current role as Y."

### Step 3: Skills string building

**`getAllSkills()`**: flat array of all unique skill names (master + JD-only).
Used only for the summary generation prompt.

**`getJDOnlySkills()`**: skills from `combinedSkills` that are `type === "generated"`
AND not in `userDetails.customSkills`. These are the "new" skills from the JD.
Used to populate `appendedSkills` for green highlighting in preview.

**`getGroupedSkillsString()`**: builds the pipe-separated string for the Word doc.
Calls `getSkillsGroupedForTemplate()` and joins with `"  |  "`.

**`getSkillsGroupedForTemplate()`**: builds the structured array for rendering.

```javascript
[
  { category: "Languages", skills: ["Telugu", "English"] },
  { category: "Programming Languages", skills: ["PHP", "JavaScript"] },
  { category: "Data Processing", skills: ["Template Conversion"] },
];
```

Sources: master skills first (preserving user's category order), then JD-only
skills appended using their `category` from `combinedSkills` in Redux.

### Step 4: The resume content object

```javascript
const newResumeContent = {
  fullName: userDetails.fullName,
  contactInformation: `${userDetails.email} | ${userDetails.phone}`,
  professionalSummary: finalSummary,
  summaryParts, // null unless mode === "append"
  summaryMode: mode,
  technicalSkills: getGroupedSkillsString(), // pipe string
  technicalSkillsGrouped: getSkillsGroupedForTemplate(), // structured array
  appendedSkills: getJDOnlySkills(), // for green highlights
  professionalExperience: userDetails.experience.map((exp, index) => ({
    ...exp,
    responsibilities: [
      ...generatedExperiences[index],
      ...(exp.customResponsibilities || []),
    ],
  })),
  education: userDetails.education || [],
  certifications: userDetails.certifications || [],
  projects: userDetails.projects || [],
};
```

This object is stored in `resumeContent` local state in `ResumeGenerator` and
passed as `initialResumeContent` prop to `ResumePreview`.

---

## 10. Flow 7: Preview & Editing

### ResumePreview.jsx

Receives `initialResumeContent` and parses it to local `resumeData` state.

Renders a `TemplateSelector` (Standard, Hybrid, ModernClean) and conditionally
renders `StandardPreview`, `HybridPreview`, or `ModernCleanPreview`.

The `refresh` prop is a boolean toggle. When it changes, the `useEffect` re-parses
`initialResumeContent` into `resumeData`. This is how re-generations update the preview.

### Editing mode

"Edit Resume" button → `setIsEditing(true)`

In editing mode, all text fields become inputs/textareas.
Every change calls `handleEdit(field, value)` which:

1. Updates local `resumeData` state
2. Calls `onUpdate(JSON.stringify(updatedData))` → updates `resumeContent` in ResumeGenerator

So edits flow: input → local state → parent state. Nothing goes to Firestore.

### StandardPreview — Technical Skills rendering

The component checks for `technicalSkillsGrouped` first (structured data).
If present, renders category-per-line:

```
Languages: Telugu, English, Hindi
Programming Languages: PHP, CSS, JavaScript
Data Processing: Template Conversion, Data Mapping
```

JD-matched skills (`appendedSkills`) get a green underline highlight.

If `technicalSkillsGrouped` is absent, falls back to parsing the pipe-separated
`technicalSkills` string.

### Responsibility highlighting

When a responsibility was AI-generated (not in `savedResponsibilities` map),
it gets a green background and a "Save" button. Clicking "Save" calls
`handleSaveToCustom(expIndex, responsibility)` which:

1. Calls `onSaveCustomResponsibility(expIndex, responsibility)`
2. Updates `userDetails.experience[expIndex].customResponsibilities` in Firestore + Redux
3. Marks the responsibility as saved in local `savedResponsibilities` state (removes highlight)

This is the mechanism for promoting AI-generated bullets to permanent custom bullets.

---

## 11. Flow 8: Download as Word

### Entry point: `downloadAsWord(template)` in `ResumeGenerator.jsx`

```
downloadAsWord(template)
  → QuotaService.checkQuota(uid, "downloads")
  → parse resumeContent to resumeData object
  → dynamic import of template module based on template name:
      "Standard" → Standardformat(resumeData)
      "Hybrid"   → Hybridformat(resumeData)
      "ModernClean" → ModernCleanFormat(resumeData)
  → Packer.toBlob(doc)
  → create download link, click it
  → QuotaService.incrementUsage(uid, "downloads")
```

### Template modules (e.g. Standardformat.jsx)

Uses the `docx` npm library to construct a Word document programmatically.

Receives the full `resumeData` object. Key rendering decisions:

**Technical Skills:**

```javascript
// If technicalSkillsGrouped is present and non-empty:
resumeData.technicalSkillsGrouped.map(
  (group) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${group.category}: `, bold: true }),
        new TextRun({ text: group.skills.join(", ") }),
      ],
    }),
);
// Falls back to single paragraph with technicalSkills string if not present
```

**Professional Experience:**

```javascript
resumeData.professionalExperience.flatMap(exp => [
  // Title + dates paragraph (with right-aligned tab stop)
  new Paragraph({ children: [title TextRun, tab, dates TextRun] }),
  // Employer + location paragraph
  new Paragraph({ children: [employer TextRun, location TextRun] }),
  // One bullet paragraph per responsibility
  ...exp.responsibilities.map(resp =>
    new Paragraph({ children: [new TextRun({ text: resp })], bullet: { level: 0 } })
  )
])
```

The Word doc has:

- 0.5 inch margins all around
- Roboto font throughout
- 1.5 line spacing (line: 360 in half-points)
- Section headings with bottom border
- Right-aligned tab stops for dates

---

## 12. Cross-cutting Concerns

### Quota System (QuotaService)

Three quota types: `parsing`, `generates`, `downloads`.

`checkQuota(uid, type)` → reads from Firestore, returns boolean.
`incrementUsage(uid, type)` → increments count in Firestore.

Checked before every AI operation. If exceeded, the operation is blocked
with a toast error.

`userQuota` is also in Redux so the UI can show usage counts.

### Authentication (AuthService)

Google Sign-In only. On successful login:

```javascript
dispatch(setUser(user));
dispatch(setUserQuota(quota));
dispatch(setUserDetails(details));
```

All three Redux slices are populated at once. The app then shows the full UI.

If `!user`, the compact view shows a transparent overlay that triggers
the login modal when clicked.

### Direct Save vs Form Save

**Direct save** (compact view, NewLayout): `handleDirectSave(updatedDetails)`

- Called immediately on interaction (toggling responsibilityType, skill mapping, etc.)
- Saves to Firestore + Redux in one call
- No intermediate state — what you see is what's saved
- Problem: if called on every keystroke (like category rename), causes input focus loss
- Fix: use local state + onBlur for text inputs, direct save only for discrete actions

**Form save** (UserForm): `handleSave(e)`

- All changes staged in UserForm's local state
- Single save on form submit
- Safe for continuous text editing

### handleDirectSave anti-pattern for text inputs

The compact view category rename had:

```javascript
onChange → handleDirectSave   // BAD for text inputs
```

This causes:

1. User types one character
2. onChange fires → handleDirectSave → Firestore write → Redux update
3. React re-renders compact view with new Redux state
4. React re-renders the input with the new `categoryName` value from Redux
5. Input's cursor position is lost, focus may be lost

Fix: local state + onBlur (like `CategoryInput` and `SkillInput` components).

---

## 13. The Full Data Journey — End to End

```
RESUME FILE (PDF/DOCX)
  ↓ pdfjs / mammoth → raw text string
  ↓ Groq (parseResumeWithGroq) → structured JSON
  ↓ normaliseAndMap() → userDetails shape
  ↓ UserDetailsService.saveUserDetails() → Firestore
  ↓ dispatch(setUserDetails()) → Redux firebase slice
  ↓ NewLayout compact view re-renders from Redux

USER EDITS PROFILE (optional)
  ↓ UserForm local state (no saves until submit)
  ↓ handleSaveDetails() → Firestore + Redux

JOB DESCRIPTION TEXT
  ↓ Groq call #1 (analyzeJobDescription) → { technicalSkills[] }
  ↓ setAnalysis() → JDA local state
  ↓ dispatch(setSkills()) → Redux skills slice
  ↓ categorizeNewSkills() → Groq call #2 → { skill: category } map
  ↓ setSkillMappings() → JDA local state with categories
  ↓ initializeCombinedSkills() → merges master + JD skills with categories
  ↓ setCombinedSkills() → JDA local state
  ↓ dispatch(setCombinedSkills()) → Redux skills slice

USER MAPS SKILLS TO EXPERIENCES (optional)
  ↓ checkbox in JDA chip dropdown
  ↓ handleSkillMappingChange()
  ↓ updates skillMappings local state (for generated skills)
  ↓ or userDetails.customSkills in Redux (for master skills)
  ↓ initializeCombinedSkills() re-runs via useEffect
  ↓ Redux combinedSkills updated

GENERATE RESUME
  ↓ ResumeGenerator reads:
      - userDetails from Redux firebase slice (experience, education, etc.)
      - combinedSkills from Redux skills slice (for skill-based bullet generation)
  ↓ Groq calls (one per experience with responsibilityType !== "none")
  ↓ Groq call for summary (if mode !== "own")
  ↓ build newResumeContent object (local state in ResumeGenerator)
  ↓ setResumeContent() → ResumeGenerator local state
  ↓ passed as prop to ResumePreview

PREVIEW
  ↓ ResumePreview receives resumeContent as prop
  ↓ parsed into local resumeData state
  ↓ StandardPreview renders it
  ↓ User edits inline → handleEdit() → updates resumeData + onUpdate prop
  ↓ User saves bullet → handleSaveToCustom()
      → UserDetailsService.saveUserDetails() → Firestore
      → dispatch(setUserDetails()) → Redux

DOWNLOAD
  ↓ downloadAsWord(template)
  ↓ reads resumeContent from ResumeGenerator local state
  ↓ passes to template module (Standardformat, etc.)
  ↓ docx library builds Word document in memory
  ↓ Packer.toBlob() → browser download
  ↓ QuotaService.incrementUsage()
```

---

## 14. Common Bug Patterns & Why They Happen

### Category/skill not appearing in download or preview

**Cause:** `getSkillsGroupedForTemplate()` only read `userDetails.customSkills`,
never `combinedSkills`. JD skills exist in Redux `combinedSkills` but not in
`userDetails.customSkills` (until explicitly saved by user).

**Fix:** `getSkillsGroupedForTemplate()` must loop over both: master skills first,
then JD-only skills from `combinedSkills` using their `category` field.

### Category shows as "From Job Description" or "Technical Skills"

**Cause A:** `initializeCombinedSkills()` ran before `categorizeNewSkills()` finished
(async timing). Category was `undefined` → fallback used.

**Cause B:** The fallback string itself was wrong (`"From Job Description"` instead
of something meaningful).

**Cause C:** The inner duplicate `categorizeNewSkills` function inside
`analyzeJobDescription` was shadowing the outer improved version.

**Fix:** Remove duplicate. Strengthen prompt. Add post-processing safety net with
rule-based categorization for known patterns.

### Text input loses focus on every keystroke (compact view)

**Cause:** `onChange` → `handleDirectSave` → Firestore write → Redux update →
React re-render → input re-renders with value from Redux → focus/cursor lost.

**Fix:** Use a local state component (`CategoryInput`, `SkillInput`) that buffers
keystrokes and only calls the save function on `onBlur` or Enter key.

### Skill saved to master with wrong category

**Cause:** `handleSaveToCustomSkills` reads `mapping?.category || "From Job Description"`.
If the mapping entry was created before `categorizeNewSkills` finished,
`mapping.category` is undefined → wrong fallback.

**Fix:** Ensure fallback is a meaningful default. Ensure `categorizeNewSkills`
runs and updates `skillMappings` before user can click save (it does, given the
async flow, but the fallback string matters for the race condition edge case).

### Preview shows wrong highlights (all green or none green)

**Cause:** `appendedSkills` in `newResumeContent` is populated by `getJDOnlySkills()`
which reads `combinedSkills` from Redux. If Redux `combinedSkills` is empty
(no JD analyzed), `appendedSkills` is empty → no highlights.

**Fix:** This is correct behavior. Highlights only appear when a JD has been analyzed
in the current session.

### Generated responsibilities missing (only custom ones appear)

**Cause:** `responsibilityType === "none"` set on an experience → `generateResponsibilities`
returns `[]`. Only `customResponsibilities` are used.

**Fix:** Change `responsibilityType` to `"skillBased"` or `"titleBased"` in the
compact view toggle buttons.

### Duplicate skills in combinedSkills

**Cause:** `initializeCombinedSkills` filters `analysis.technicalSkills` using
`!customSkillSet.has(skill)` to exclude master skills. But if a skill was recently
saved to master (via `handleSaveToCustomSkills`) and Redux updated, but the
`analysis.technicalSkills` array still contains that skill name, a timing issue
can cause it to appear in both generated and custom arrays.

**Fix:** `removeDuplicateSkillMappings()` is called on mount. The JSON stringify
comparison in the combinedSkills useEffect also prevents redundant dispatches.

---

_Document covers: ResumeDropZone.jsx, UserForm.jsx, NewLayout.jsx,
JobDescriptionAnalyzer.jsx, ResumeGenerator.jsx, ResumePreview.jsx,
StandardPreview.jsx, Standardformat.jsx, UserDetailsService, QuotaService,
AuthService, Redux slices (auth, firebase, skills)._
