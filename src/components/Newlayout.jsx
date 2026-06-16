//src/components/NewLayout.jsx

"use client";
import UserForm from "./UserForm";
import JobDescriptionAnalyzer from "./JobDescriptionAnalyzer";
import ResumeGenerator from "./ResumeGenerator";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { UserDetailsService } from "../services/UserDetailsService";
import { Spinner } from "../components/ui/spinner";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails } from "../store/slices/firebaseSlice";
import { toast, Toaster } from "sonner";
import MiniPreview from "./MiniPreview";
import ResumeDropZone from "./ResumeDropZone";
import AuthService from "../services/AuthService";
import { setUser } from "../store/slices/authSlice";
import { setUserQuota } from "../store/slices/firebaseSlice";

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden mb-8"
      style={{
        background:
          "linear-gradient(135deg, #0f1c3f 0%, #1a2e6b 60%, #1e3a8a 100%)",
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-8 gap-6">
        <div className="flex-1 space-y-3">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#60a5fa" }}
          >
            The Smart Job Seeker Tool
          </span>
          <h1
            className="text-2xl md:text-3xl font-extrabold leading-tight"
            style={{ color: "#ffffff" }}
          >
            Tailor your resume for any job
            <br className="hidden md:block" /> description in seconds
          </h1>
          <p className="text-sm max-w-md" style={{ color: "#93c5fd" }}>
            Keep one master profile of achievements and let our integrated AI
            rewrite targeted metrics, custom bullets, and summaries directly
            matched with target JDs.
          </p>
        </div>
        <div className="flex-shrink-0">
          <a
            href="#step-1"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
            style={{
              background: "#ffffff",
              color: "#1e3a8a",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            }}
          >
            Get Started Below
            <span
              className="block text-xs font-normal mt-0.5"
              style={{ color: "#6b7280" }}
            >
              Works locally. Zero data leaks.
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Step Label ───────────────────────────────────────────────────────────────
function StepLabel({ number, icon, title, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
          style={{ background: "#e0e7ff", color: "#3730a3" }}
        >
          {icon || number}
        </span>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {badge && (
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: "#dcfce7", color: "#166534" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// Add this small component above DashboardContent:
function SkillInput({ value, onSave }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onSave(local);
      }}
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#3730a3",
        background: "transparent",
        border: "none",
        outline: "none",
        width: `${Math.max((local || "").length, 4)}ch`,
      }}
    />
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function DashboardContent() {
  const { user, loading } = useSelector((state) => state.auth);
  const { userDetails } = useSelector((state) => state.firebase);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState("builder"); // 'builder' | 'preview'
  const [showEditModal, setShowEditModal] = useState(false);
  const [liveDetails, setLiveDetails] = useState(null);
  // const [compactEdits, setCompactEdits] = useState(null);
  const [compactDropdown, setCompactDropdown] = useState(null);
  const [inlineSaving, setInlineSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── Step gating ──
  const isProfileComplete = Boolean(
    // userDetails?.fullName?.trim() &&
    // userDetails?.email?.trim() &&
    userDetails?.experience?.length > 0,
  );

  // helper — always read from buffer if it exists, else Redux
  // const displayDetails = compactEdits || userDetails;
  // useEffect(() => {
  //   if (!loading) {
  //     if (!user) {
  //       router.push("/");
  //       return;
  //     }
  //     // if (!userDetails && !isEditing && router.pathname !== "/userFormPage") {
  //     //   router.push("/userFormPage");
  //     //   return;
  //     // }
  //   }
  // }, [loading, user, userDetails, router, isEditing]);

  // ADD after the compactDropdown state:
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest("[data-compact-dropdown]")) {
        setCompactDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveDetails = async (details) => {
    try {
      if (!user) return;
      setIsSaving(true);
      await UserDetailsService.saveUserDetails(user.uid, details);
      dispatch(setUserDetails(details));
      toast.success("Saved your details to Master Template");
      // router.push("/dashboard");
    } catch (error) {
      console.error("Error saving user details:", error);
      toast.error("Failed to save details. Please try again.", error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleParsedResume = async (parsedDetails) => {
    console.log("[Dashboard] Resume parsed — raw result:", parsedDetails);

    if (!user) return;

    try {
      await UserDetailsService.saveUserDetails(user.uid, parsedDetails);
      dispatch(setUserDetails(parsedDetails));
      toast.success("Resume imported and saved to your Master Profile!", {
        duration: 5000,
      });
    } catch (err) {
      console.error("Error saving imported resume:", err);
      dispatch(setUserDetails(parsedDetails)); // still show it in the UI
      toast.error(
        "Resume imported but couldn't auto-save. Please open Edit Full Profile and save manually.",
      );
    }
  };
  // const handleParsedResume = (parsedDetails) => {
  //   // Merges parsed resume into the compactEdits buffer.
  //   // Nothing is saved to Firestore until the user clicks "Save Changes".
  //   console.log("[Dashboard] Resume parsed — raw result:", parsedDetails);
  //   console.log("[Dashboard] experience:", parsedDetails.experience);
  //   console.log("[Dashboard] skills:", parsedDetails.customSkills);
  //   console.log("[Dashboard] education:", parsedDetails.education);

  //   // Push straight into Redux so the entire existing UI updates immediately.
  //   // Nothing hits Firestore until the user clicks "Save Changes".
  //   dispatch(setUserDetails(parsedDetails));

  //   // Also stage as compactEdits so the Save Changes button appears.
  //   setCompactEdits(parsedDetails);
  //   toast.success("Resume imported — review and SAVE before proceeding.", {
  //     duration: 9000,
  //   });
  // };

  const handleDirectSave = async (updatedDetails) => {
    try {
      setInlineSaving(true);

      await UserDetailsService.saveUserDetails(user.uid, updatedDetails);
      dispatch(setUserDetails(updatedDetails));
    } catch (err) {
      console.error("Direct save failed:", err);
      toast.error("Failed to save. Please try again.");
    }
  };
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await AuthService.signInWithGoogle(
        dispatch,
        setUser,
        setUserQuota,
        setUserDetails,
      );
      setShowLoginModal(false);
      toast.success("Logged in! Let's build your profile.");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading || isSaving) {
    return (
      <div
        className="min-h-[400px] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #fdf4ff 100%)",
        }}
      >
        <div className="text-center space-y-4">
          <Spinner className="w-12 h-12 border-4 text-indigo-600" />
          <p className="text-gray-600 font-medium">
            {loading ? "Loading..." : "Saving your details..."}
          </p>
        </div>
      </div>
    );
  }

  // if (!user) return null;

  return (
    <div
      className="min-h-screen"
      id="resume-builder"
      style={{
        background:
          "linear-gradient(135deg, #f0f4ff 0%, #f8f4ff 50%, #fff0fb 100%)",
      }}
    >
      <Toaster position="top-center" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 pb-16">
        {/* ── Hero ── */}
        <HeroBanner />
        {/* ── Two-column workspace ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start">
          {/* ── LEFT COLUMN — Step 1: Master Profile ── */}
          {/* ── LEFT COLUMN — Master Profile Display ── */}
          <div id="step-1" className="space-y-0">
            <div
              className="rounded-2xl shadow-sm border"
              style={{
                background: "rgba(255,255,255,0.85)",
                borderColor: "rgba(203,213,225,0.6)",
                backdropFilter: "blur(12px)",
                position: "relative",
              }}
            >
              {!user && (
                <div
                  onClick={() => setShowLoginModal(true)}
                  title="Log in to build your profile"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 20,
                    cursor: "pointer",
                    background: "transparent",
                  }}
                />
              )}
              {/* Header */}
              <div className="px-5 pt-5 pb-0">
                <StepLabel
                  number="1"
                  icon="📋"
                  title="Step 1: Your Master Profile"
                  badge="Compact version"
                />
                {/* ── Resume drop zone — hero when empty, compact strip when profile exists ── */}
                <ResumeDropZone
                  hasProfile={!!userDetails}
                  onParsed={handleParsedResume}
                  onFillManually={() => setShowEditModal(true)}
                />
              </div>

              {/* Read-only profile display */}
              <div className="px-5 pb-5 space-y-5">
                <button
                  onClick={() => setShowEditModal(true)}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  ✏️ Edit Full Profile
                </button>

                {/* Contact */}
                {userDetails ? (
                  <>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94a3b8",
                          marginBottom: 10,
                        }}
                      >
                        Contact
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#1e293b",
                          marginBottom: 2,
                        }}
                      >
                        {userDetails?.fullName || user?.name || "—"}
                      </p>
                      <p style={{ fontSize: 12, color: "#64748b" }}>
                        {userDetails?.email || user?.email || "—"}
                        {userDetails?.phone ? ` · ${userDetails?.phone}` : ""}
                      </p>
                    </div>

                    {/* ── Summary Mode ── */}
                    {/* <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94a3b8",
                          marginBottom: 8,
                        }}
                      >
                        Summary Generation
                      </p>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          {
                            value: "own",
                            label: "✍️ Own",
                            title: "Use your saved summary as-is",
                          },
                          {
                            value: "append",
                            label: "➕ Append",
                            title: "Your summary + JD-matched sentences",
                          },
                          {
                            value: "regenerate",
                            label: "🤖 AI",
                            title: "Fully regenerate every time",
                          },
                        ].map((opt) => {
                          const current =
                            (compactEdits || userDetails)?.summaryMode ||
                            "regenerate";
                          const isActive = current === opt.value;
                          return (
                            <button
                              key={opt.value}
                              title={opt.title}
                              onClick={() => {
                                const base = compactEdits || userDetails;
                                setCompactEdits({
                                  ...base,
                                  summaryMode: opt.value,
                                });
                              }}
                              style={{
                                flex: 1,
                                padding: "6px 4px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                border: `2px solid ${isActive ? "#6366f1" : "#e2e8f0"}`,
                                background: isActive ? "#eef2ff" : "#f8fafc",
                                color: isActive ? "#3730a3" : "#64748b",
                                textAlign: "center",
                                transition: "all 0.15s",
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      <div> Remove from UI Show textarea if own or append<div/>
                      {(() => {
                        const current =
                          (compactEdits || userDetails)?.summaryMode ||
                          "regenerate";
                        if (current === "regenerate") return null;
                        return (
                          <textarea
                            value={
                              (compactEdits || userDetails)?.savedSummary || ""
                            }
                            onChange={(e) => {
                              const base = compactEdits || userDetails;
                              setCompactEdits({
                                ...base,
                                savedSummary: e.target.value,
                              });
                            }}
                            placeholder={
                              current === "own"
                                ? "Your summary — used exactly as written…"
                                : "Your base summary — AI will append JD-matched sentences…"
                            }
                            rows={4}
                            style={{
                              marginTop: 8,
                              width: "100%",
                              borderRadius: 10,
                              border: "1px solid #e2e8f0",
                              padding: "10px 12px",
                              fontSize: 12,
                              color: "#1e293b",
                              resize: "vertical",
                              fontFamily: "inherit",
                              lineHeight: 1.6,
                              background: "#f8fafc",
                            }}
                          />
                        );
                      })()}
                    </div> */}
                    {/* ── Summary Mode NEW── */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94a3b8",
                          marginBottom: 10,
                        }}
                      >
                        Summary Generation Mode
                      </p>

                      {/* Show truncated current summary if exists */}
                      {userDetails.savedSummary && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            marginBottom: 10,
                            lineHeight: 1.5,
                            fontStyle: "italic",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          "{userDetails.savedSummary}"
                        </p>
                      )}

                      {/* 3 mode buttons — direct save, no buffer */}
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          {
                            value: "own",
                            label: "✍️ Own",
                            title: "Use saved summary as-is",
                          },
                          {
                            value: "append",
                            label: "➕ Append",
                            title: "Saved + JD-matched sentences appended",
                          },
                          {
                            value: "regenerate",
                            label: "🤖 AI",
                            title: "Fully regenerate every time",
                          },
                        ].map((opt) => {
                          const current =
                            userDetails.summaryMode || "regenerate";
                          const isActive = current === opt.value;
                          return (
                            <button
                              key={opt.value}
                              title={opt.title}
                              onClick={() => {
                                const updated = {
                                  ...userDetails,
                                  summaryMode: opt.value,
                                };
                                handleDirectSave(updated); // ← direct save
                              }}
                              style={{
                                flex: 1,
                                padding: "6px 4px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                border: `2px solid ${isActive ? "#6366f1" : "#e2e8f0"}`,
                                background: isActive ? "#eef2ff" : "#f8fafc",
                                color: isActive ? "#3730a3" : "#64748b",
                                textAlign: "center",
                                transition: "all 0.15s",
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      <p
                        style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}
                      >
                        Edit your summary text in ✏️ Edit Full Profile → Summary
                        tab
                      </p>
                    </div>
                    {/* ── Quick controls: master skills ── */}
                    {/* ── Quick controls: master skills ── */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94a3b8",
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        Master Skills
                        {inlineSaving && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#6366f1",
                              fontWeight: 600,
                            }}
                          >
                            saving…
                          </span>
                        )}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        {userDetails?.customSkills?.map((s, i) => (
                          <div
                            key={i}
                            data-compact-dropdown=""
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#eef2ff",
                              border: "1px solid #c7d2fe",
                              borderRadius: 6,
                              padding: "3px 8px",
                            }}
                          >
                            {/* Skill name — debounced direct save on blur */}
                            <span
                              className="ro-tooltip"
                              data-tooltip="Click to rename this skill"
                            >
                              <SkillInput
                                value={s.skill}
                                onSave={(newVal) => {
                                  const updated = userDetails.customSkills.map(
                                    (sk, idx) =>
                                      idx === i ? { ...sk, skill: newVal } : sk,
                                  );
                                  handleDirectSave({
                                    ...userDetails,
                                    customSkills: updated,
                                  });
                                }}
                              />
                            </span>

                            {/* Map button */}
                            <button
                              className="ro-tooltip"
                              data-tooltip="Map this skill to specific work experiences"
                              onClick={() =>
                                setCompactDropdown(
                                  compactDropdown === i ? null : i,
                                )
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color:
                                  compactDropdown === i ? "#f97316" : "#6366f1",
                                fontSize: 12,
                                padding: 0,
                                lineHeight: 1,
                              }}
                              title="Map to experience"
                            >
                              ⇄
                            </button>

                            {/* Delete — direct save */}
                            <button
                              className="ro-tooltip"
                              data-tooltip="Remove this skill"
                              onClick={() => {
                                const updated = userDetails.customSkills.filter(
                                  (_, idx) => idx !== i,
                                );
                                handleDirectSave({
                                  ...userDetails,
                                  customSkills: updated,
                                });
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#a5b4fc",
                                fontSize: 12,
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              ✕
                            </button>

                            {/* Mapping dropdown */}
                            {compactDropdown === i && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 6px)",
                                  left: 0,
                                  zIndex: 9999,
                                  background: "#1e293b",
                                  color: "#f1f5f9",
                                  borderRadius: 10,
                                  padding: 12,
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                                  minWidth: 200,
                                  border: "1px solid #334155",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    color: "#64748b",
                                    marginBottom: 8,
                                  }}
                                >
                                  Map to experience
                                </p>
                                {userDetails.experience?.map((exp, ei) => {
                                  const isLocked =
                                    exp.responsibilityType === "none";
                                  const isTitleBased =
                                    exp.responsibilityType === "titleBased";
                                  const isDisabled = isTitleBased || isLocked;
                                  const isMapped =
                                    s.experienceMappings?.includes(ei); // ← ei not exp.title
                                  const cbId = `compact-map-${i}-${ei}`;
                                  return (
                                    <div
                                      key={ei}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "4px 0",
                                        opacity: isDisabled ? 0.4 : 1,
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        id={cbId}
                                        checked={isMapped || false}
                                        disabled={isDisabled}
                                        onChange={(e) => {
                                          const updated =
                                            userDetails.customSkills.map(
                                              (sk, idx) => {
                                                if (idx !== i) return sk;
                                                const mappings = e.target
                                                  .checked
                                                  ? [
                                                      ...new Set([
                                                        ...(sk.experienceMappings ||
                                                          []),
                                                        ei,
                                                      ]),
                                                    ] // ← ei
                                                  : (
                                                      sk.experienceMappings ||
                                                      []
                                                    ).filter((m) => m !== ei); // ← ei
                                                return {
                                                  ...sk,
                                                  experienceMappings: mappings,
                                                };
                                              },
                                            );
                                          handleDirectSave({
                                            ...userDetails,
                                            customSkills: updated,
                                          });
                                        }}
                                      />
                                      <label
                                        htmlFor={cbId}
                                        style={{
                                          fontSize: 12,
                                          cursor: isDisabled
                                            ? "not-allowed"
                                            : "pointer",
                                        }}
                                      >
                                        {exp.title}
                                        {isLocked && (
                                          <span
                                            style={{
                                              color: "#64748b",
                                              marginLeft: 4,
                                            }}
                                          >
                                            (Locked)
                                          </span>
                                        )}
                                        {isTitleBased && !isLocked && (
                                          <span
                                            style={{
                                              color: "#64748b",
                                              marginLeft: 4,
                                            }}
                                          >
                                            (Title-based)
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add skill — direct save */}
                      <button
                        onClick={() => {
                          const updated = [
                            ...(userDetails.customSkills || []),
                            {
                              skill: "",
                              experienceMappings:
                                userDetails.experience?.map((_, i) => i) || [],
                            },
                          ];
                          handleDirectSave({
                            ...userDetails,
                            customSkills: updated,
                          });
                        }}
                        // disabled={inlineSaving}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#6366f1",
                          background: "#eef2ff",
                          border: "1px solid #c7d2fe",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          // opacity: inlineSaving ? 0.6 : 1,
                        }}
                      >
                        + Add Skill
                      </button>
                    </div>

                    {/* ── Action buttons ── */}
                    {/* <div
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: "10px",
                        borderRadius: 10,
                      }}
                    > */}
                    {/* Save compact edits */}
                    {/* {compactEdits && (
                        <button
                          onClick={async () => {
                            await handleSaveDetails(compactEdits);
                            setCompactEdits(null);
                            setCompactDropdown(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg, #10b981, #059669)",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          💾 Save Changes
                        </button>
                      )} */}
                    {/* {compactEdits && (
                        <button
                          onClick={() => {
                            setCompactEdits(null);
                            setCompactDropdown(null);
                          }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      )} */}
                    {/* Edit full profile */}
                    {/* <button
                        onClick={() => setShowEditModal(true)}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        ✏️ Edit Full Profile
                      </button> */}
                    {/* </div> */}

                    {/* Experience */}
                    {userDetails.experience?.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#94a3b8",
                            marginBottom: 8,
                          }}
                        >
                          Work History
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {userDetails.experience.map((exp, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                                padding: "8px 14px",
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    marginBottom: 1,
                                  }}
                                >
                                  {exp.title || "—"}
                                </p>
                                <p style={{ fontSize: 12, color: "#64748b" }}>
                                  {exp.employer || ""}
                                  {exp.location ? ` · ${exp.location}` : ""}
                                </p>
                              </div>

                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#94a3b8",
                                  flexShrink: 0,
                                  marginLeft: 8,
                                }}
                              >
                                {exp.startDate || "—"} →{" "}
                                {exp.endDate || "Present"}
                              </p>

                              {/* Bullet Generation btn — Skills | Title | None */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: 4,
                                  flexShrink: 0,
                                }}
                              >
                                {[
                                  {
                                    type: "skillBased",
                                    label: "Skills",
                                    tip: "Generate bullets based on mapped skills",
                                  },
                                  {
                                    type: "titleBased",
                                    label: "Title",
                                    tip: "Generate bullets based on job title",
                                  },
                                  {
                                    type: "none",
                                    label: "🔒",
                                    tip: "Lock — no AI bullets for this role",
                                  },
                                ].map(({ type, label, tip }) => (
                                  <button
                                    key={type}
                                    // onClick={() => {
                                    //   const updated =
                                    //     compactEdits || userDetails;
                                    //   const newExp = updated.experience.map(
                                    //     (e, idx) =>
                                    //       idx === i
                                    //         ? { ...e, responsibilityType: type }
                                    //         : e,
                                    //   );
                                    //   setCompactEdits({
                                    //     ...updated,
                                    //     experience: newExp,
                                    //   });
                                    // }}
                                    className="ro-tooltip"
                                    data-tooltip={tip}
                                    onClick={() => {
                                      const newExp = userDetails.experience.map(
                                        (e, idx) =>
                                          idx === i
                                            ? { ...e, responsibilityType: type }
                                            : e,
                                      );
                                      const updated = {
                                        ...userDetails,
                                        experience: newExp,
                                      };
                                      handleDirectSave(updated); // ← direct, no buffer
                                    }}
                                    title={
                                      type === "skillBased"
                                        ? "Generate from skills"
                                        : type === "titleBased"
                                          ? "Generate from title"
                                          : "Lock - No AI bullets"
                                    }
                                    style={{
                                      padding: "3px 8px",
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      border: "1px solid",
                                      background:
                                        exp.responsibilityType === type
                                          ? type === "none"
                                            ? "#fee2e2"
                                            : "#6366f1"
                                          : "#f1f5f9",
                                      color:
                                        exp.responsibilityType === type
                                          ? type === "none"
                                            ? "#dc2626"
                                            : "#fff"
                                          : "#64748b",
                                      borderColor:
                                        exp.responsibilityType === type
                                          ? type === "none"
                                            ? "#fca5a5"
                                            : "#6366f1"
                                          : "#e2e8f0",
                                    }}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {/* {userDetails.education?.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#94a3b8",
                            marginBottom: 8,
                          }}
                        >
                          Education
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {userDetails.education.map((edu, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                                padding: "10px 14px",
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    marginBottom: 1,
                                  }}
                                >
                                  {edu.degree || "—"}
                                </p>
                                <p style={{ fontSize: 12, color: "#64748b" }}>
                                  {edu.institution || ""}
                                </p>
                              </div>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#94a3b8",
                                  flexShrink: 0,
                                  marginLeft: 8,
                                }}
                              >
                                {edu.startDate || "—"} → {edu.endDate || "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )} */}

                    {/* Edit button */}
                    {/* <button
                      onClick={() => setShowEditModal(true)}
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      ✏️ Edit Profile
                    </button> */}
                  </>
                ) : (
                  /* Empty state */
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#94a3b8",
                        marginBottom: 16,
                      }}
                    >
                      No profile yet. Add your details to get started.
                    </p>
                    <button
                      onClick={() => setShowEditModal(true)}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      + Create Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Steps 2 & 3 ── */}
          <div className="space-y-6">
            {/* Step 2: Job Description Analyzer */}
            {/* Step 3: Align Skills → Resume Generator */}

            <div
              className="rounded-2xl shadow-sm border relative"
              style={{
                background: "rgba(255,255,255,0.85)",
                borderColor: "rgba(203,213,225,0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="px-5 pt-5 pb-2">
                <StepLabel
                  number="2"
                  icon="🎯"
                  title="Step 2: Paste Target Job Description"
                />
                <p className="text-xs text-gray-500 mb-3 -mt-1 ml-9">
                  Paste the raw specification text details representing the
                  target job description to match against.
                </p>
              </div>
              <div
                className="px-4 pb-5"
                style={
                  !isProfileComplete
                    ? { pointerEvents: "none", opacity: 0.4 }
                    : undefined
                }
              >
                <JobDescriptionAnalyzer />
              </div>

              {!isProfileComplete && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(2px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textAlign: "center",
                    padding: 24,
                    zIndex: 10,
                  }}
                >
                  <span style={{ fontSize: 28 }}>🔒</span>
                  <p
                    style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}
                  >
                    Complete Step 1 first
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", maxWidth: 260 }}>
                    Add your name, email, and at least one work experience to
                    your Master Profile to unlock this step.
                  </p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{
                      marginTop: 6,
                      padding: "8px 18px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Go to Step 1
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Step: 4 - Resume Generator */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm border relative"
          style={{
            background: "rgba(255,255,255,0.85)",
            borderColor: "rgba(203,213,225,0.6)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="px-4 pb-5"
            style={
              !isProfileComplete
                ? { pointerEvents: "none", opacity: 0.4 }
                : undefined
            }
          >
            <ResumeGenerator />
          </div>

          {!isProfileComplete && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(2px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textAlign: "center",
                padding: 24,
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 28 }}>🔒</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Complete Step 1 first
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", maxWidth: 260 }}>
                Your Master Profile must be set up before generating a resume.
              </p>
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  marginTop: 6,
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Go to Step 1
              </button>
            </div>
          )}
        </div>
        {/* ── Edit Profile Modal / UserForm ── */}
        {/* ── Edit Profile Modal / UserForm ── */}
        {showEditModal && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setShowEditModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 50,
              }}
            />

            {/* Modal */}
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(1100px, 95vw)",
                maxHeight: "92vh",
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
                zIndex: 51,
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
              }}
            >
              {/* Modal header — sticky */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: "1px solid #e2e8f0",
                  background: "#fff",
                  flexShrink: 0,
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                  Edit Master Profile
                </p>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal body — two columns */}
              <div style={{ overflowY: "auto", flex: 1, overflow: "auto" }}>
                {/* LEFT — scrollable vertical form */}
                <div
                  style={{
                    overflowY: "auto",
                    borderRight: "1px solid #e2e8f0",
                    padding: "20px 24px",
                  }}
                >
                  <UserForm
                    initialData={userDetails}
                    onSave={async (details) => {
                      await handleSaveDetails(details);
                      setShowEditModal(false);
                    }}
                    onCancel={() => setShowEditModal(false)}
                    onDetailsChange={(details) => setLiveDetails(details)}
                    isEditing={true}
                    user={user}
                  />
                </div>

                {/* RIGHT — not so live MiniPreview */}
                {/* <div style={{
          overflowY: "auto",
          padding: "20px 20px",
          background: "#f8fafc",
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "#94a3b8", marginBottom: 12,
          }}>
            Live Preview
          </p>
          <MiniPreview
            userDetails={liveDetails || userDetails}
            user={user}
          />
        </div> */}
              </div>
            </div>
          </>
        )}
        {/* Login modal */}
        {showLoginModal && (
          <>
            <div
              onClick={() => setShowLoginModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 60,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(380px, 90vw)",
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
                zIndex: 61,
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔐</p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 6,
                }}
              >
                Sign in to build your resume
              </p>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                Create your free master profile and start tailoring resumes to
                any job description.
              </p>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  cursor: isLoggingIn ? "not-allowed" : "pointer",
                  opacity: isLoggingIn ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {isLoggingIn ? (
                  <>
                    <Spinner className="w-4 h-4 border-2" />
                    Signing in…
                  </>
                ) : (
                  "Continue with Google"
                )}
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  width: "100%",
                  padding: "9px 0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function Newlayout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Spinner className="w-10 h-10 text-indigo-500" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
