import { motion } from "motion/react";
import { User, Cpu, Sparkles, FileText } from "lucide-react";

export default function HowWeSolve() {
  const steps = [
    {
      num: "01",
      icon: User,
      title: "Master Profile Setup",
      description:
        "Upload or input your master resume once. This stores all of your comprehensive work histories, redundant metrics, and exhaustive tech stack securely in a central hub.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "Smart JD Analysis",
      description:
        "Paste any target job description. The AI instantly extracts primary technical tools, core responsibilities, and leadership skills preferred by the employer.",
    },
    {
      num: "03",
      icon: Sparkles,
      title: "AI tailoring Engine",
      description:
        "Our AI matches your profile with the job requirements, dynamically rephrasing statements, prioritizing elements, and elevating relevant keywords without altering facts.",
    },
    {
      num: "04",
      icon: FileText,
      title: "Professional Export",
      description:
        "Get pristine, ATS-friendly markdown text or clean standard formats styled for immediate submission, and watch your callback rates climb.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 bg-white px-6 sm:px-12 lg:px-24"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
            The Solution Flow
          </span>
          <h2 className="text-3xl font-sans font-bold text-slate-950 tracking-tight mt-3">
            Tailor-made resumes in four clean steps
          </h2>
          <p className="text-slate-500 font-sans text-sm sm:text-base mt-2">
            Automating the painstaking process of tailoring your professional
            summary, core competencies, and career experiences.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative bg-slate-50 border border-slate-200/60 p-5 rounded-2xl group hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-950 group-hover:text-indigo-400 transition-colors">
                    <IconComponent
                      className="w-5 h-5"
                      id={`icon-solve-${step.num}`}
                    />
                  </div>
                  <span className="text-2xl font-mono font-black text-slate-300 group-hover:text-slate-700 transition-colors leading-none">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-sans font-semibold text-slate-900 group-hover:text-white mt-6 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-500 font-sans text-xs sm:text-sm mt-2 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
