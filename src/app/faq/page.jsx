"use client";
import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FAQ() {
  const faqs = [
    {
      question: "What is ResumeOnFly / ResumeTailor?",
      answer:
        "ResumeOnFly is an AI-powered resume-building tool designed to help job seekers create tailored, professional resumes for specific job descriptions. It simplifies the resume creation process, increases success rates, and saves you time by eliminating guesswork.",
    },
    {
      question: "How does the AI tailoring save time?",
      answer:
        "Our AI handles the heavy lifting by analyzing job descriptions, identifying key missing technical terms or soft competencies, and drafting tailored bullet-points. You don't have to rewrite your experience manually from scratch for every single application.",
    },
    {
      question: "Will this improve my chances of passing ATS scans?",
      answer:
        "Yes. By strategically aligning the custom bullet points inside your summary and experience fields to match the exact requirements of the target description, you significantly raise your algorithmic ATS matching compatibility score.",
    },
    {
      question: "Is my personal work history kept secure and private?",
      answer:
        "Absolutely. We secure your credentials on-the-fly and process rewrite pipelines server-side. Your raw history is never indexed by public search tools or shared with unapproved third-party agencies.",
    },
    {
      question: "Do I have direct access to edit the tailored result?",
      answer:
        "Yes, you can edit either the Master resume or the tailored results directly inside our realiable text editors with a double-view interface anytime before copying or exporting.",
    },
    {
      question: "How does the pricing credit quota work?",
      answer:
        "Each account starts with high-speed sandbox trial credits. Upgrading to our Premium Tier gives you 100 deep-analysis credits, faster pipeline generation speeds, and support for high-impact customized suggestions.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5 }}
      className="py-16 px-4 sm:px-6 lg:px-12 bg-[#fafbfc] min-h-[70vh] flex flex-col justify-center"
    >
      <div className="max-w-3xl mx-auto w-full">
        {/* FAQ Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
            Support Wiki
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 font-sans text-sm sm:text-base mt-2">
            Everything you need to know about preparing high-converting,
            ATS-friendly customized resumes.
          </p>
        </div>

        {/* FAQs Accordion Grid */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              index={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>

        {/* Support helper CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
          <h4 className="text-sm font-bold text-slate-900">
            Still have unanswered questions?
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our helper division is always ready to assist you. Contact us
            directly for active workspace assistance.
          </p>
          <a
            href="mailto:support@cvtosalary.com"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            <span>Ask Support Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function AccordionItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={`border rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer ${
        isOpen
          ? "border-slate-350 bg-white shadow-sm"
          : "border-slate-200/80 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className="p-5 flex justify-between items-center select-none"
        role="button"
        tabIndex={0}
      >
        <span className="font-sans font-semibold text-slate-950 text-sm sm:text-base">
          {question}
        </span>
        <div
          className={`p-1 rounded-lg bg-slate-50 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-slate-800" : ""}`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-[#fafbfc]">
              <p className="text-slate-600 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
