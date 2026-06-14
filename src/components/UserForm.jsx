//src/components/UserForm.jsx


"use client";
import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { PlusCircle, Save, Trash2, X, MapIcon, DotIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Spinner } from "../components/ui/spinner";
import { toast, Toaster } from "sonner";
import MiniPreview from "./MiniPreview";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: "contact", label: "Contact" },
  { id: "experience", label: "Work History" },
  { id: "customSkills", label: "Master Skills" },
  { id: "summary", label: "Summary" },

  { id: "academics", label: "Academics" },
];

// ─── Shared section wrapper ───────────────────────────────────────────────────
function SectionPanel({ children }) {
  return <div className="raf-panel">{children}</div>;
}

const UserForm = ({
  onSave,
  onCancel,
  initialData,
  user,
  isEditing,
  onDetailsChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");
  const [expandedExp, setExpandedExp] = useState(null);
  const expCardRefs = useRef({});

  const [userDetails, setUserDetails] = useState(() => {
    if (initialData) {
      return { ...initialData, customSkills: initialData.customSkills || [] };
    }
    return {
      fullName: "",
      email: "",
      phone: "",
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      customSkills: [],
    };
  });

  useEffect(() => {
    if (initialData) {
      setUserDetails({
        ...initialData,
        customSkills: initialData.customSkills || [],
      });
    }
  }, [initialData]);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const handleChange = (field, value) => {
    if (field === "experience") {
      const titleChanges = value
        .map((exp, index) => ({
          oldTitle: userDetails.experience[index]?.title,
          newTitle: exp.title,
          changed: exp.title !== userDetails.experience[index]?.title,
        }))
        .filter((change) => change.changed);

      if (titleChanges.length > 0) {
        const updatedCustomSkills = userDetails.customSkills?.map((skill) => ({
          ...skill,
          experienceMappings: skill.experienceMappings.map((title) => {
            const change = titleChanges.find((c) => c.oldTitle === title);
            return change ? change.newTitle : title;
          }),
        }));
        setUserDetails((prev) => ({
          ...prev,
          experience: value,
          customSkills: updatedCustomSkills,
        }));
        return;
      }
    }
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date, field, index, section) => {
    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const formattedDate = `${year}-${month.toString().padStart(2, "0")}`;
      handleChange(section, [
        ...userDetails[section].slice(0, index),
        { ...userDetails[section][index], [field]: formattedDate },
        ...userDetails[section].slice(index + 1),
      ]);
    }
  };

  const handleAddField = (field, value) => {
    setUserDetails((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value],
    }));
  };

  const handleRemoveField = (field, index) => {
    setUserDetails((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddCustomSkill = () => {
    setUserDetails((prev) => ({
      ...prev,
      customSkills: [
        ...(prev.customSkills || []),
        {
          skill: "",
          experienceMappings: prev.experience?.map((_, i) => i) || [], // indices
        },
      ],
    }));
  };

  const handleRemoveCustomSkill = (index) => {
    setUserDetails((prev) => ({
      ...prev,
      customSkills: prev?.customSkills?.filter((_, i) => i !== index),
    }));
  };

  const handleCustomSkillChange = (index, newSkill) => {
    setUserDetails((prev) => ({
      ...prev,
      customSkills: prev?.customSkills?.map((skill, i) =>
        i === index ? { ...skill, skill: newSkill } : skill,
      ),
    }));
  };

  const handleSkillMappingChange = (skillIndex, expIndex, checked) => {
    setUserDetails((prev) => ({
      ...prev,
      customSkills: prev?.customSkills?.map((skillItem, i) =>
        i === skillIndex
          ? {
              ...skillItem,
              experienceMappings: checked
                ? [...new Set([...skillItem.experienceMappings, expIndex])]
                : skillItem.experienceMappings.filter(
                    (idx) => idx !== expIndex,
                  ),
            }
          : skillItem,
      ),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave({ ...userDetails });
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Failed to save user details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Scoped styles ── */}
      <style>{`
        /* ── Tab bar ── */
        .raf-tabs {
          display: flex;
          gap: 2px;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 20px;
        }
        .raf-tab {
          flex: 1;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          color: #64748b;
          background: transparent;
          border: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .raf-tab:hover { color: #334155; }
        .raf-tab.active {
          background: #ffffff;
          color: #1e3a8a;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }

        /* ── Panel ── */
        .raf-panel {
          animation: rafFadeIn 0.18s ease;
        }
        @keyframes rafFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

        /* ── Field label ── */
        .raf-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 4px;
          display: block;
        }

        /* ── Experience card ── */
        .raf-exp-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          position: relative;
        }
        .raf-exp-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .raf-exp-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }
        .raf-remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
          border-radius: 7px;
          border: 1px solid #fca5a5;
          background: #fff;
          color: #ef4444;
          cursor: pointer;
          transition: background 0.12s;
        }
        .raf-remove-btn:hover { background: #fee2e2; }

        /* ── Add button ── */
        .raf-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .raf-add-btn:hover { opacity: 0.9; }

        /* ── Skill chip in Master Skills tab ── */
        .raf-skill-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8faff;
          border: 1px solid #c7d2fe;
          border-radius: 10px;
          padding: 6px 10px;
          margin-bottom: 8px;
        }
        .raf-skill-input {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          background: transparent;
          border: none;
          outline: none;
          min-width: 0;
        }
        .raf-skill-input::placeholder { color: #94a3b8; }
        .raf-map-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px; height: 26px;
          border-radius: 6px;
          border: 1px solid #93c5fd;
          background: #fff;
          color: #3b82f6;
          cursor: pointer;
          transition: background 0.12s;
          flex-shrink: 0;
        }
        .raf-map-btn:hover, .raf-map-btn.active { background: #eff6ff; }
        .raf-map-btn.active { color: #f97316; border-color: #f97316; }

        /* ── Dropdown ── */
        .raf-dropdown {
          position: fixed;
          z-index: 9999;
          background: #1e293b;
          color: #f1f5f9;
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          min-width: 200px;
          top: calc(100% + 6px);
          left: 0;
        }
        .raf-dropdown h4 {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .raf-dropdown-scroll {
          max-height: 180px;
          overflow-y: auto;
        }
        .raf-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          font-size: 12px;
          cursor: pointer;
        }

        /* ── Form grid helpers ── */
        .raf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .raf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) {
          .raf-grid-2, .raf-grid-3 { grid-template-columns: 1fr; }
          .raf-tab { font-size: 11px; padding: 6px 6px; }
        }

        /* ── Sticky footer ── */
        .raf-footer {
          position: relative;
          bottom: 0;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          border-top: 1px solid #e2e8f0;
          padding: 12px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          border-radius: 0 0 12px 12px;
        }

        /* ── Responsibility row ── */
        .raf-resp-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        /* ── Section heading ── */
        .raf-section-heading {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 14px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
        }

        /* ── Datepicker overrides ── */
        .raf-datepicker {
          width: 100%;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 0 10px;
          font-size: 13px;
          color: #1e293b;
          background: #fff;
          transition: border-color 0.12s;
        }
        .raf-datepicker:hover { border-color: #94a3b8; }
        .raf-datepicker:focus { outline: none; border-color: #6366f1; }

        /* ── Input override ── */
        .raf-input {
          height: 38px !important;
          font-size: 13px !important;
          border-radius: 8px !important;
        }
        .raf-input:hover { border-color: #94a3b8 !important; }

        /* ── Select override ── */
        .raf-select-trigger {
          height: 38px;
          font-size: 13px;
          border-radius: 8px;
        }

        /* ── Skills grid ── */
        .raf-skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          fontFamily: "Inter, system-ui, sans-serif",
          minHeight: 0,
        }}
      >
        {/* Mini Preview — left, sticky */}
        <div
          style={{
            width: "40%",
            position: "sticky",
            top: 16,
            flexShrink: 0,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <MiniPreview userDetails={userDetails} user={user} />
        </div>

        {/* Form — right, scrollable */}
        <div
          style={{ flex: 1, minWidth: 0, maxHeight: "80vh", overflowY: "auto" }}
        >
          <form onSubmit={handleSave}>
            {/* ── Tab bar ── */}
            <div className="raf-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`raf-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* ══════════════════════════════════════════
              TAB 1 — Contact Details
          ══════════════════════════════════════════ */}
            {activeTab === "contact" && (
              <SectionPanel>
                <p className="raf-section-heading">Contact Details</p>
                <div className="raf-grid-3" style={{ marginBottom: 16 }}>
                  <div>
                    <span className="raf-label">Full Name</span>
                    <Input
                      className="raf-input"
                      value={
                        userDetails.fullName ? userDetails.fullName : user.name
                      }
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <span className="raf-label">Email</span>
                    <Input
                      className="raf-input"
                      type="email"
                      value={userDetails.email ? userDetails.email : user.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <span className="raf-label">Phone</span>
                    <Input
                      className="raf-input"
                      value={userDetails.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </SectionPanel>
            )}

            {/* ══════════════════════════════════════════
              TAB 2 — Summary
          ══════════════════════════════════════════ */}
            {activeTab === "summary" && (
              <SectionPanel>
                <p className="raf-section-heading">Professional Summary</p>

                {/* Mode selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {[
                    {
                      value: "own",
                      label: "✍️ My Own",
                      desc: "Used exactly as written",
                    },
                    {
                      value: "append",
                      label: "➕ Mine + AI",
                      desc: "Yours + JD-matched lines",
                    },
                    {
                      value: "regenerate",
                      label: "🤖 Full AI",
                      desc: "Regenerated every time",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange("summaryMode", opt.value)}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "center",
                        border: `2px solid ${userDetails.summaryMode === opt.value ? "#6366f1" : "#e2e8f0"}`,
                        background:
                          userDetails.summaryMode === opt.value
                            ? "#eef2ff"
                            : "#f8fafc",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1e293b",
                          marginBottom: 2,
                        }}
                      >
                        {opt.label}
                      </p>
                      <p style={{ fontSize: 11, color: "#64748b" }}>
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Textarea — only hidden for pure regenerate */}
                {userDetails.summaryMode !== "regenerate" && (
                  <>
                    <span className="raf-label">
                      {userDetails.summaryMode === "append"
                        ? "Your base summary (AI appends 2 JD-matched sentences)"
                        : "Your summary (used exactly as written)"}
                    </span>
                    <textarea
                      value={userDetails.savedSummary || ""}
                      onChange={(e) =>
                        handleChange("savedSummary", e.target.value)
                      }
                      placeholder="Write your professional summary here…"
                      rows={7}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        padding: "10px 12px",
                        fontSize: 13,
                        color: "#1e293b",
                        resize: "vertical",
                        fontFamily: "inherit",
                        lineHeight: 1.6,
                      }}
                    />
                  </>
                )}

                {userDetails.summaryMode === "regenerate" && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  >
                    A fresh summary will be AI-generated on each resume build
                    based on your profile and the target job description. No
                    saved summary needed.
                  </p>
                )}
              </SectionPanel>
            )}

            {/* ══════════════════════════════════════════
              TAB 3 — WORK HISTORY (Experience)
          ══════════════════════════════════════════ */}
            {/*  Replace the experience tab SectionPanel opening with: */}
            {activeTab === "experience" && (
              <SectionPanel>
                <p className="raf-section-heading">Work History</p>

                {/* Quick-jump pills */}
                {userDetails.experience.length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 16,
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {" "}
                    {userDetails.experience.map((exp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          expCardRefs.current[i]?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "1px solid #c7d2fe",
                          background: "#eef2ff",
                          color: "#3730a3",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {exp.title || `Exp ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                <p className="raf-section-heading">Work History</p>
                {userDetails.experience.map((exp, index) => (
                  <div
                    key={index}
                    ref={(el) => (expCardRefs.current[index] = el)}
                    className="raf-exp-card"
                  >
                    <div className="raf-exp-card-header">
                      <span className="raf-exp-title">
                        {`Experience ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="raf-remove-btn"
                        onClick={() => handleRemoveField("experience", index)}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="raf-grid-2" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="raf-label">Job Title</span>
                        <Input
                          className="raf-input"
                          value={exp.title}
                          onChange={(e) =>
                            handleChange("experience", [
                              ...userDetails.experience.slice(0, index),
                              { ...exp, title: e.target.value },
                              ...userDetails.experience.slice(index + 1),
                            ])
                          }
                          placeholder="e.g. Senior Engineer"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Employer</span>
                        <Input
                          className="raf-input"
                          value={exp.employer}
                          onChange={(e) =>
                            handleChange("experience", [
                              ...userDetails.experience.slice(0, index),
                              { ...exp, employer: e.target.value },
                              ...userDetails.experience.slice(index + 1),
                            ])
                          }
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <div className="raf-grid-3" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="raf-label">Start Date</span>
                        <DatePicker
                          selected={
                            isValidDate(exp.startDate)
                              ? new Date(exp.startDate)
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "startDate",
                              index,
                              "experience",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">End Date</span>
                        <DatePicker
                          selected={
                            isValidDate(exp.endDate)
                              ? new Date(exp.endDate)
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "endDate",
                              index,
                              "experience",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Location</span>
                        <Input
                          className="raf-input"
                          value={exp.location}
                          onChange={(e) =>
                            handleChange("experience", [
                              ...userDetails.experience.slice(0, index),
                              { ...exp, location: e.target.value },
                              ...userDetails.experience.slice(index + 1),
                            ])
                          }
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    {/* Responsibility type */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        className="raf-label"
                        style={{ marginBottom: 0, flexShrink: 0 }}
                      >
                        Generate bullets from:
                      </span>
                      <Select
                        value={exp.responsibilityType}
                        onValueChange={(value) =>
                          handleChange("experience", [
                            ...userDetails.experience.slice(0, index),
                            { ...exp, responsibilityType: value },
                            ...userDetails.experience.slice(index + 1),
                          ])
                        }
                      >
                        <SelectTrigger
                          className="raf-select-trigger"
                          style={{ width: 160 }}
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent style={{ zIndex: 9999 }}>
                          <SelectItem value="skillBased">
                            Current Skills
                          </SelectItem>
                          <SelectItem value="titleBased">Role Title</SelectItem>
                          <SelectItem value="none">Lock</SelectItem>{" "}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom responsibilities */}
                    <div>
                      <span className="raf-label">Custom Responsibilities</span>
                      {exp.customResponsibilities?.map((resp, respIndex) => (
                        <div key={respIndex} className="raf-resp-row">
                          <DotIcon
                            style={{
                              width: 14,
                              height: 14,
                              color: "#94a3b8",
                              flexShrink: 0,
                            }}
                          />
                          <Input
                            className="raf-input"
                            value={resp}
                            onChange={(e) => {
                              const newR = [
                                ...(exp.customResponsibilities || []),
                              ];
                              newR[respIndex] = e.target.value;
                              handleChange("experience", [
                                ...userDetails.experience.slice(0, index),
                                { ...exp, customResponsibilities: newR },
                                ...userDetails.experience.slice(index + 1),
                              ]);
                            }}
                            placeholder="Describe a responsibility"
                          />
                          <button
                            type="button"
                            className="raf-remove-btn"
                            style={{ flexShrink: 0 }}
                            onClick={() => {
                              const newR = exp.customResponsibilities.filter(
                                (_, i) => i !== respIndex,
                              );
                              handleChange("experience", [
                                ...userDetails.experience.slice(0, index),
                                { ...exp, customResponsibilities: newR },
                                ...userDetails.experience.slice(index + 1),
                              ]);
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="raf-add-btn"
                        style={{
                          marginTop: 6,
                          background: "transparent",
                          color: "#3b82f6",
                          border: "1px solid #3b82f6",
                          fontSize: 11,
                        }}
                        onClick={() =>
                          handleChange("experience", [
                            ...userDetails.experience.slice(0, index),
                            {
                              ...exp,
                              customResponsibilities: [
                                ...(exp.customResponsibilities || []),
                                "",
                              ],
                            },
                            ...userDetails.experience.slice(index + 1),
                          ])
                        }
                      >
                        <PlusCircle size={12} />
                        Add Responsibility
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="raf-add-btn"
                  onClick={() =>
                    handleAddField("experience", {
                      title: "",
                      employer: "",
                      startDate: "",
                      endDate: "",
                      location: "",
                      customResponsibilities: [],
                      responsibilityType: "skillBased",
                    })
                  }
                >
                  <PlusCircle size={14} />
                  Add Experience
                </button>
              </SectionPanel>
            )}
            {/* ══════════════════════════════════════════
              TAB 4 — MASTER SKILLS (Custom Skills)
          ══════════════════════════════════════════ */}
            {activeTab === "customSkills" && (
              <SectionPanel>
                <p className="raf-section-heading">Master Skills</p>
                <div className="raf-skills-grid">
                  {userDetails?.customSkills?.map((skillItem, index) => (
                    <div
                      key={index}
                      className="raf-skill-chip"
                      style={{ position: "relative" }}
                    >
                      <input
                        type="text"
                        className="raf-skill-input"
                        value={skillItem.skill}
                        onChange={(e) =>
                          handleCustomSkillChange(index, e.target.value)
                        }
                        placeholder="Skill name"
                        title="Edit Skill"
                      />
                      {/* Map button */}
                      <button
                        type="button"
                        className={`raf-map-btn${openDropdown === index ? " active" : ""}`}
                        title="Map to experience"
                        onClick={() =>
                          setOpenDropdown(openDropdown === index ? null : index)
                        }
                      >
                        <MapIcon size={12} />
                      </button>
                      {/* Remove button */}
                      <button
                        type="button"
                        className="raf-remove-btn"
                        style={{ width: 26, height: 26 }}
                        title="Remove"
                        onClick={() => handleRemoveCustomSkill(index)}
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Mapping dropdown */}
                      {openDropdown === index && (
                        <div ref={dropdownRef} className="raf-dropdown">
                          <h4>Map to experience</h4>
                          <div className="raf-dropdown-scroll">
                            {userDetails.experience?.map((exp, ei) => {
                              const isLocked =
                                exp.responsibilityType === "none";
                              const isTitleBased =
                                exp.responsibilityType === "titleBased";
                              const isDisabled = isTitleBased || isLocked;
                              const checkboxId = `raf-map-${index}-${ei}`;
                              const isMapped =
                                skillItem.experienceMappings?.includes(ei); // ← ei not exp.title
                              return (
                                <div
                                  key={ei}
                                  className="raf-dropdown-item"
                                  style={{ opacity: isDisabled ? 0.4 : 1 }}
                                >
                                  <input
                                    id={checkboxId}
                                    type="checkbox"
                                    checked={isMapped || false}
                                    disabled={isDisabled}
                                    onChange={(e) =>
                                      handleSkillMappingChange(
                                        index,
                                        ei,
                                        e.target.checked,
                                      )
                                    } // ← ei
                                  />
                                  <label
                                    htmlFor={checkboxId}
                                    style={{
                                      cursor: isDisabled
                                        ? "not-allowed"
                                        : "pointer",
                                      fontSize: 12,
                                    }}
                                  >
                                    {exp.title}
                                    {isLocked && (
                                      <span
                                        style={{
                                          color: "#64748b",
                                          marginLeft: 4,
                                          fontSize: 11,
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
                                          fontSize: 11,
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="raf-add-btn"
                  style={{ marginTop: 12 }}
                  onClick={handleAddCustomSkill}
                >
                  <PlusCircle size={14} />
                  Add Skill
                </button>
              </SectionPanel>
            )}
            {/* ══════════════════════════════════════════
              TAB 5 — ACADEMICS (Education + Certs + Projects)
          ══════════════════════════════════════════ */}
            {activeTab === "academics" && (
              <SectionPanel>
                {/* Education */}
                <p className="raf-section-heading">Education</p>
                {userDetails.education.map((edu, index) => (
                  <div key={index} className="raf-exp-card">
                    <div className="raf-exp-card-header">
                      <span className="raf-exp-title">
                        {edu.degree || `Education ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="raf-remove-btn"
                        onClick={() => handleRemoveField("education", index)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="raf-grid-2" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="raf-label">Degree</span>
                        <Input
                          className="raf-input"
                          value={edu.degree}
                          onChange={(e) =>
                            handleChange("education", [
                              ...userDetails.education.slice(0, index),
                              { ...edu, degree: e.target.value },
                              ...userDetails.education.slice(index + 1),
                            ])
                          }
                          placeholder="e.g. B.S. Computer Science"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Institution</span>
                        <Input
                          className="raf-input"
                          value={edu.institution}
                          onChange={(e) =>
                            handleChange("education", [
                              ...userDetails.education.slice(0, index),
                              { ...edu, institution: e.target.value },
                              ...userDetails.education.slice(index + 1),
                            ])
                          }
                          placeholder="University name"
                        />
                      </div>
                    </div>
                    <div className="raf-grid-3">
                      <div>
                        <span className="raf-label">Start</span>
                        <DatePicker
                          selected={
                            isValidDate(edu.startDate)
                              ? new Date(edu.startDate)
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "startDate",
                              index,
                              "education",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">End</span>
                        <DatePicker
                          selected={
                            isValidDate(edu.endDate)
                              ? new Date(edu.endDate)
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "endDate",
                              index,
                              "education",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Grade / GPA</span>
                        <Input
                          className="raf-input"
                          value={edu.grade}
                          onChange={(e) =>
                            handleChange("education", [
                              ...userDetails.education.slice(0, index),
                              { ...edu, grade: e.target.value },
                              ...userDetails.education.slice(index + 1),
                            ])
                          }
                          placeholder="3.8 / 4.0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="raf-add-btn"
                  style={{ marginBottom: 24 }}
                  onClick={() =>
                    handleAddField("education", {
                      institution: "",
                      degree: "",
                      field: "",
                      startDate: "",
                      endDate: "",
                      location: "",
                    })
                  }
                >
                  <PlusCircle size={14} /> Add Education
                </button>

                {/* Certifications */}
                <p className="raf-section-heading" style={{ marginTop: 8 }}>
                  Certifications
                </p>
                {userDetails.certifications.map((cert, index) => (
                  <div key={index} className="raf-exp-card">
                    <div className="raf-exp-card-header">
                      <span className="raf-exp-title">
                        {cert.name || `Certification ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="raf-remove-btn"
                        onClick={() =>
                          handleRemoveField("certifications", index)
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="raf-grid-2" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="raf-label">Name</span>
                        <Input
                          className="raf-input"
                          value={cert.name}
                          onChange={(e) =>
                            handleChange("certifications", [
                              ...userDetails.certifications.slice(0, index),
                              { ...cert, name: e.target.value },
                              ...userDetails.certifications.slice(index + 1),
                            ])
                          }
                          placeholder="e.g. AWS Solutions Architect"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Issuer</span>
                        <Input
                          className="raf-input"
                          value={cert.issuer}
                          onChange={(e) =>
                            handleChange("certifications", [
                              ...userDetails.certifications.slice(0, index),
                              { ...cert, issuer: e.target.value },
                              ...userDetails.certifications.slice(index + 1),
                            ])
                          }
                          placeholder="e.g. Amazon Web Services"
                        />
                      </div>
                    </div>
                    <div className="raf-grid-2">
                      <div>
                        <span className="raf-label">Issue Date</span>
                        <DatePicker
                          selected={
                            cert.issueDate
                              ? new Date(cert.issueDate + "-01")
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "issueDate",
                              index,
                              "certifications",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Expiry (optional)</span>
                        <DatePicker
                          selected={
                            cert.expiryDate
                              ? new Date(cert.expiryDate + "-01")
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "expiryDate",
                              index,
                              "certifications",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="raf-add-btn"
                  style={{ marginBottom: 24 }}
                  onClick={() =>
                    handleAddField("certifications", {
                      name: "",
                      issuer: "",
                      issueDate: "",
                      expiryDate: "",
                    })
                  }
                >
                  <PlusCircle size={14} /> Add Certification
                </button>

                {/* Projects */}
                <p className="raf-section-heading" style={{ marginTop: 8 }}>
                  Projects
                </p>
                {userDetails.projects.map((project, index) => (
                  <div key={index} className="raf-exp-card">
                    <div className="raf-exp-card-header">
                      <span className="raf-exp-title">
                        {project.name || `Project ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="raf-remove-btn"
                        onClick={() => handleRemoveField("projects", index)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="raf-grid-2" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="raf-label">Project Name</span>
                        <Input
                          className="raf-input"
                          value={project.name}
                          onChange={(e) =>
                            handleChange("projects", [
                              ...userDetails.projects.slice(0, index),
                              { ...project, name: e.target.value },
                              ...userDetails.projects.slice(index + 1),
                            ])
                          }
                          placeholder="Project name"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Technologies</span>
                        <Input
                          className="raf-input"
                          value={project.technologies}
                          onChange={(e) =>
                            handleChange("projects", [
                              ...userDetails.projects.slice(0, index),
                              { ...project, technologies: e.target.value },
                              ...userDetails.projects.slice(index + 1),
                            ])
                          }
                          placeholder="React, Node.js, AWS…"
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <span className="raf-label">Description</span>
                      <Input
                        className="raf-input"
                        value={project.description}
                        onChange={(e) =>
                          handleChange("projects", [
                            ...userDetails.projects.slice(0, index),
                            { ...project, description: e.target.value },
                            ...userDetails.projects.slice(index + 1),
                          ])
                        }
                        placeholder="Short project summary"
                      />
                    </div>
                    <div className="raf-grid-3">
                      <div>
                        <span className="raf-label">Start</span>
                        <DatePicker
                          selected={
                            isValidDate(project.startDate)
                              ? new Date(project.startDate)
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              date,
                              "startDate",
                              index,
                              "projects",
                            )
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">End</span>
                        <DatePicker
                          selected={
                            isValidDate(project.endDate)
                              ? new Date(project.endDate)
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(date, "endDate", index, "projects")
                          }
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                          className="raf-datepicker"
                        />
                      </div>
                      <div>
                        <span className="raf-label">Link</span>
                        <Input
                          className="raf-input"
                          value={project.link}
                          onChange={(e) =>
                            handleChange("projects", [
                              ...userDetails.projects.slice(0, index),
                              { ...project, link: e.target.value },
                              ...userDetails.projects.slice(index + 1),
                            ])
                          }
                          placeholder="https://github.com/…"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="raf-add-btn"
                  onClick={() =>
                    handleAddField("projects", {
                      name: "",
                      description: "",
                      technologies: "",
                      startDate: "",
                      endDate: "",
                      link: "",
                    })
                  }
                >
                  <PlusCircle size={14} /> Add Project
                </button>
              </SectionPanel>
            )}
            {/* ── Sticky Save / Cancel footer ── */}
            <div className="raf-footer">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  cursor: "pointer",
                }}
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 border-2" />
                    <span style={{ color: "#fce7f3" }}>Saving…</span>
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserForm;
