"use client";
import { useState } from "react";

export default function FAQ() {
   const faqs = [
      {
         question: "What is ResumeOnFly?",
         answer: `ResumeOnFly is an AI-powered resume-building tool designed to help job seekers create tailored, professional resumes for specific job descriptions. It simplifies the resume creation process, increases success rates, and saves you time by eliminating guesswork.`,
      },
      {
         question: "How does ResumeOnFly save time?",
         answer: `Our AI handles the heavy lifting by analyzing job descriptions, identifying relevant keywords, and generating job-specific resumes in minutes. You no longer need to spend hours customizing your resume for each application.`,
      },
      {
         question: "Can ResumeOnFly improve my chances of landing interviews?",
         answer: `Yes! Tailored resumes are proven to boost callback rates from recruiters. By using ResumeOnFly to create customized documents that align with the job description and ATS requirements, you maximize your chances of standing out.`,
      },
      {
         question:
            "Why should I create a customized resume for every job application?",
         answer: `Every job description is unique. A customized resume highlights the skills, experience, and keywords specific to the role, increasing your chances of passing ATS scans and catching the recruiter’s attention.`,
      },
      {
         question:
            "What are the benefits of using ResumeOnFly for multiple job applications?",
         answer: `Job seekers often struggle to craft unique resumes for multiple job applications. ResumeOnFly simplifies this process by enabling you to generate tailored resumes quickly and efficiently for each position.`,
      },
      {
         question: "Does ResumeOnFly guarantee a perfect resume?",
         answer: `While ResumeOnFly provides powerful tools to create an impressive resume, it’s essential to review the final output for grammatical issues, spelling mistakes, and flow. The AI assists you, but your personal touch ensures the resume reflects your personality and achievements.`,
      },
      {
         question: "Is my resume ATS compatible?",
         answer: `Yes, ResumeOnFly ensures your resume is optimized for Applicant Tracking Systems (ATS). Our AI ensures the formatting and keywords meet modern ATS requirements, increasing the likelihood of your resume being shortlisted.`,
      },
      {
         question: "Can I add my personal touch to the resume?",
         answer: `Absolutely! ResumeOnFly is designed to assist, not replace, your input. You can edit and customize the final output to ensure it represents your unique skills, achievements, and personality.`,
      },
      {
         question: "How does ResumeOnFly help with keywords?",
         answer: `ResumeOnFly identifies critical keywords from the job description and incorporates them into your resume. This increases your chances of passing ATS scans and aligning with recruiter expectations. However, it’s essential to review and ensure the keywords truly reflect your expertise.`,
      },
      {
         question: "How does ResumeOnFly handle multiple job descriptions?",
         answer: `With ResumeOnFly, you can effortlessly switch between job descriptions and generate unique resumes tailored to each role. This ensures your application is always relevant and impactful.`,
      },
      {
         question: "How does ResumeOnFly ensure a polished resume?",
         answer: `Our tool provides a professional resume preview with properly formatted sections, including contact information, technical skills, work experience, and more. You can download your resume as a Word document and make any final tweaks before submitting it.`,
      },
      {
         question:
            "What should I keep in mind when using AI-powered resume tools?",
         answer: `While ResumeOnFly is powerful, it’s essential to review the final resume for errors and consistency, ensure it reflects your real skills and experiences, and quantify your achievements where possible to make a stronger impact.`,
      },
   ];

   return (
      <div className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 underline">
               Frequently Asked Questions
            </h2>
            <div className="space-y-6">
               {faqs.map((faq, index) => (
                  <Accordion
                     key={index}
                     question={faq.question}
                     answer={faq.answer}
                  />
               ))}
            </div>
         </div>
      </div>
   );
}

function Accordion({ question, answer }) {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <div
         className="border border-gray-300 rounded-lg overflow-hidden shadow-sm"
         onClick={() => setIsOpen(!isOpen)}
      >
         <div
            className="bg-white p-4 flex justify-between items-center cursor-pointer"
            role="button"
         >
            <h3 className="text-lg font-medium">{question}</h3>
            <span className="text-gray-500">{isOpen ? "-" : "+"}</span>
         </div>
         {isOpen && (
            <div className="bg-gray-50 p-4 border-t border-gray-300">
               <p className="text-gray-700">{answer}</p>
            </div>
         )}
      </div>
   );
}
