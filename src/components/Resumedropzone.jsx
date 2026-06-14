//src/components/ResumeDropzone.jsx


"use client";
import { useState, useRef, useCallback } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ─── PDF text extraction — worker disabled (main-thread mode) ────────────────
// Disabling the worker entirely is the most reliable approach in Next.js
// because webpack chunk resolution for workers varies by version.
// For resume-sized files main-thread parsing is fast enough.
async function extractTextFromPDF(file) {
  // Use legacy build + disable worker entirely to avoid version mismatches
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  pdfjsLib.GlobalWorkerOptions.workerSrc = ""; // empty = main-thread, no worker

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n");
}

// ─── DOCX text extraction via mammoth browser build ──────────────────────────
async function extractTextFromDOCX(file) {
  // Must use the browser build — the default entry is Node.js only
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ─── Groq resume parser ───────────────────────────────────────────────────────
async function parseResumeWithGroq(rawText) {
  const prompt = `You are a resume parser. Extract all information from the resume text below and return ONLY a valid JSON object matching this exact schema. No markdown, no backticks, no explanation.

Schema:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "summary": "string (professional summary if present, else empty string)",
  "experience": [
    {
      "title": "string",
      "employer": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or empty string if current",
      "customResponsibilities": ["string"],
      "responsibilityType": "skillBased"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "grade": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "YYYY-MM",
      "expiryDate": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "link": "string"
    }
  ],
  "customSkills": [
    {
      "skill": "string",
      "experienceMappings": []
    }
  ]
}

Rules:
- Extract skills from a dedicated skills section if present, otherwise infer from experience descriptions
- For dates use YYYY-MM format. If only year is given use YYYY-01. If date is unknown use empty string
- customResponsibilities: extract bullet points or responsibility lines for each role
- experienceMappings must always be an empty array — do not fill it
- If a field is not found, use empty string or empty array as appropriate
- Return only the JSON object, nothing else

Resume text:
${rawText.slice(0, 12000)}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a precise resume parser. Return ONLY valid JSON matching the exact schema provided. No markdown, no backticks, no preamble.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content || "{}";
  console.log("[ResumeDropZone] Groq raw response:", raw);
  const parsed = JSON.parse(raw);
  console.log("[ResumeDropZone] Parsed object:", parsed);
  return parsed;
}

// ─── Post-process: guarantee all fields exist + auto-map skills ───────────────
function normaliseAndMap(parsed) {
  // Guarantee every top-level field exists so the compact view never
  // reads undefined and silently shows nothing
  const safe = {
    fullName: parsed.fullName || "",
    email: parsed.email || "",
    phone: parsed.phone || "",
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications
      : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    customSkills: Array.isArray(parsed.customSkills) ? parsed.customSkills : [],
    savedSummary: parsed.summary || parsed.savedSummary || "", // ← capture it
    summaryMode: parsed.summaryMode || "append", // ← default to "append" on import
  };

  // Auto-map every skill to every experience title (safe default)
  // const experienceTitles = safe.experience.map((e) => e.title).filter(Boolean);
  const allIndices = safe.experience.map((_, i) => i); // [0, 1, 2, ...]
  safe.customSkills = safe.customSkills.map((skillObj) => ({
    ...skillObj,
    experienceMappings: allIndices.length > 0 ? [...allIndices] : []
  }));

  console.log("[ResumeDropZone] Final normalised details:", safe);
  return safe;
}

// ─── Progress steps config ────────────────────────────────────────────────────
const STEPS = [
  { id: "read", label: "Reading file…" },
  { id: "parse", label: "Parsing with AI…" },
  { id: "map", label: "Mapping profile…" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResumeDropZone({
  hasProfile,
  onParsed,
  onFillManually,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  const resetState = () => {
    setStep(null);
    setErrorMsg("");
  };

  // ─── Core pipeline ─────────────────────────────────────────────────────────
  const processFile = useCallback(
    async (file) => {
      if (!file) return;

      const isPDF =
        file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isDOCX =
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx");

      if (!isPDF && !isDOCX) {
        setStep("error");
        setErrorMsg("Only PDF or DOCX files are supported.");
        return;
      }

      try {
        // Step 1 — extract raw text
        setStep("read");
        console.log(
          "[ResumeDropZone] Extracting text from",
          file.name,
          file.type,
        );
        const rawText = isPDF
          ? await extractTextFromPDF(file)
          : await extractTextFromDOCX(file);

        console.log("[ResumeDropZone] Extracted text length:", rawText.length);
        console.log("[ResumeDropZone] Text preview:", rawText.slice(0, 300));

        if (!rawText.trim()) {
          throw new Error(
            "Could not extract text. The file may be image-based or scanned.",
          );
        }

        // Step 2 — Groq parse
        setStep("parse");
        const parsed = await parseResumeWithGroq(rawText);

        // Step 3 — normalise + map
        setStep("map");
        const finalDetails = normaliseAndMap(parsed);

        setStep("done");
        await new Promise((r) => setTimeout(r, 600));

        onParsed(finalDetails);
        resetState();
        setExpanded(false);
      } catch (err) {
        console.error("[ResumeDropZone] error:", err);
        setStep("error");
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    },
    [onParsed],
  );

  // ─── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };
  const onFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const isLoading = step && step !== "done" && step !== "error";

  // ─── Progress bar ──────────────────────────────────────────────────────────
  const ProgressBar = () => {
    const currentIdx = STEPS.findIndex((s) => s.id === step);
    const pct =
      step === "done"
        ? 100
        : currentIdx === -1
          ? 0
          : Math.round(((currentIdx + 1) / STEPS.length) * 90);

    return (
      <div style={{ width: "100%", marginTop: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          {STEPS.map((s, i) => {
            const done = currentIdx > i || step === "done";
            const active = s.id === step;
            return (
              <span
                key={s.id}
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: done ? "#10b981" : active ? "#6366f1" : "#cbd5e1",
                  transition: "color 0.2s",
                }}
              >
                {done ? "✓ " : ""}
                {s.label}
              </span>
            );
          })}
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "#e2e8f0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 999,
              background: "linear-gradient(90deg, #6366f1, #10b981)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>
    );
  };

  const ErrorBanner = ({ stopProp }) => (
    <div
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 10,
        background: "#fef2f2",
        border: "1px solid #fca5a5",
        color: "#dc2626",
        fontSize: 12,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <span>⚠ {errorMsg}</span>
      <button
        onClick={(e) => {
          if (stopProp) e.stopPropagation();
          resetState();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#dc2626",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        Try again ↺
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // HERO STATE (no profile yet)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!hasProfile) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isLoading && inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#6366f1" : "#c7d2fe"}`,
            borderRadius: 16,
            background: isDragging
              ? "rgba(99,102,241,0.06)"
              : "linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)",
            padding: "32px 20px",
            textAlign: "center",
            cursor: isLoading ? "default" : "pointer",
            transition: "border-color 0.18s, background 0.18s",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: 22,
              boxShadow: "0 4px 14px rgba(99,102,241,0.28)",
            }}
          >
            📄
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: 6,
            }}
          >
            {isLoading ? "Importing your resume…" : "Drop your resume here"}
          </p>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 0 }}>
            {isLoading
              ? "This usually takes under 10 seconds"
              : "PDF or DOCX · AI extracts everything automatically"}
          </p>
          {isLoading && <ProgressBar />}
          {step === "error" && <ErrorBanner stopProp />}
        </div>

        {!isLoading && (
          <p
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            Prefer typing?{" "}
            <button
              onClick={onFillManually}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6366f1",
                fontWeight: 600,
                fontSize: 12,
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Fill profile manually
            </button>
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={onFileInput}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPACT STRIP (profile exists)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Strip — hidden while loading */}
      {!isLoading && step !== "error" && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            border: `1.5px dashed ${isDragging ? "#6366f1" : "#c7d2fe"}`,
            borderRadius: 10,
            background: isDragging ? "rgba(99,102,241,0.06)" : "#fafafe",
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: 15 }}>📄</span>
          <span
            style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#475569" }}
          >
            Drop resume to re-import
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            PDF · DOCX
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            padding: "12px 14px",
            border: "1.5px dashed #a5b4fc",
            borderRadius: 10,
            background: "#f5f3ff",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#4338ca",
              marginBottom: 2,
            }}
          >
            Importing resume…
          </p>
          <ProgressBar />
        </div>
      )}

      {/* Error */}
      {step === "error" && <ErrorBanner />}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: "none" }}
        onChange={onFileInput}
      />
    </div>
  );
}
