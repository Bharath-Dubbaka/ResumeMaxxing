import React from "react";

const About = () => {
   return (
      <div className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="max-w-4xl mx-auto">
            {" "}
            <h2 className="flex flex-col text-4xl font-bold text-center mb-12">
               About ResumeOnFly{" "}
               <span className="text-sm">(prod by CVtoSalary)</span>
            </h2>
            <div className="border border-blue-500 p-8 rounded-lg">
               <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                     Problems We Solve
                  </h2>
                  <p className="mb-4">
                     <strong>Tailoring Resumes:</strong> Adjusting resumes for
                     every job description is already exhausting. Tailoring them
                     for recruiters too? That is next level. And we have all
                     been told to “keep a master resume,” but how do you manage
                     it without drowning in multiple files?
                  </p>
                  <p className="mb-4">
                     <strong>ATS Compatibility:</strong> Recruiters often ask
                     for resumes in Word format as it is better suited for most
                     ATS globally. Issues like readability, format, and the
                     right keywords can make or break your chances.
                  </p>
                  <p className="mb-4">
                     <strong>The “Perfect Resume Structure”:</strong> Should I
                     use Word or PDF? What should be the format, font, or
                     alignment? These endless doubts add unnecessary confusion.
                  </p>
                  <p className="mb-4">
                     <strong>Keeping a Master Resume:</strong> To solve these
                     problems, we are told to maintain a master resume and make
                     multiple copies for different jobs, skills, or scenarios.
                     But this approach often leads to even more hassle and
                     confusion.
                  </p>
                  <p>
                     All this time spent on resume tweaks could be better
                     focused on interview prep, upskilling, or other priorities,
                     potentially narrowing your chances.
                  </p>
               </section>
               <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                     How We Solve These Problems
                  </h2>
                  <ul className="list-disc list-inside space-y-4">
                     <li>
                        <strong>Start with a Master Resume:</strong> We provide
                        a central hub for all your basic info, custom
                        responsibilities, and AI-generated content. Enter your
                        details like contact info, education, and work
                        experience once, and you’re set.
                     </li>
                     <li>
                        <strong>AI-Powered Job Description Analysis:</strong>{" "}
                        Paste a job description, and our AI analyzes it to
                        extract key skills and responsibilities. Generate
                        targeted content that ensures you do not miss a thing.
                        Save these responsibilities to your master resume for
                        easy reuse. This is the feature we are most proud of.
                     </li>
                     <li>
                        <strong>Save Custom Responsibilities:</strong> Tired of
                        writing “responsible for X” repeatedly? Save
                        AI-generated responsibilities to your master resume or
                        tweak them for future applications. These tailored
                        responsibilities can be reused across jobs or
                        industries.
                     </li>
                     <li>
                        <strong>Generate ATS-Friendly Resumes:</strong> Built
                        with recruiter-approved, ATS-compatible formats, your
                        resume will include the right keywords analyzed from job
                        descriptions for better visibility and matching in
                        recruiter queries and ATS systems.
                     </li>
                     <li>
                        <strong>“Market-Preferred” Resume Structure:</strong>{" "}
                        With decades of professional experience in staffing and
                        recruitment, we have cracked the code for what
                        recruiters and agencies actually want.
                     </li>
                     <li>
                        <strong>Edit Without Hassle:</strong> Fine-tune your
                        resume using our editor mode and download it in Word or
                        PDF format with ease.
                     </li>
                  </ul>
               </section>
               <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                     Why This Matters
                  </h2>
                  <p className="mb-4">
                     Candidates are already juggling job boards, applications,
                     and life. ResumeOnFly bridges the gap between real-world
                     struggles and recruiter expectations, so you can focus on
                     landing that job.
                  </p>
               </section>
               <section>
                  <h2 className="text-2xl font-semibold mb-4">
                     Why ResumeOnFly Matters
                  </h2>
                  <ul className="list-disc list-inside space-y-4">
                     <li>
                        <strong>💼 Increase Callback Rates:</strong> Tailored
                        resumes are proven to get more responses.
                     </li>
                     <li>
                        <strong>🕒 Save Time:</strong> No more hours spent
                        redoing the same thing for every job application.
                     </li>
                     <li>
                        <strong>📄 ATS-Optimized:</strong> Your resume will pass
                        through automated systems smoothly.
                     </li>
                     <li>
                        <strong>💸 Freemium Model:</strong> Get started for free
                        with 10 trial credits. Upgrade for just $15/month for
                        100 credits.
                     </li>
                  </ul>
               </section>
               <section className="mt-10 text-xl">
                  <div>
                     <strong>
                        Please note: Since ResumeOnFly is a product of
                        CVtoSalary,
                     </strong>{" "}
                     you may see CVtoSalary's name during payment processing and
                     other related transactions.
                  </div>
               </section>
            </div>
         </div>
      </div>
   );
};

export default About;
