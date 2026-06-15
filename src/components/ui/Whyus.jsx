import { motion } from "motion/react";
import { Zap, ShieldCheck, HeartHandshake, Award } from "lucide-react";

export default function Whyus() {
  const points = [
    {
      icon: Zap,
      title: "Real-time AI Customization",
      desc: "Our model customizes bullet points synchronously, delivering ATS-aligned phrasing in less than 30 seconds.",
    },
    {
      icon: Award,
      title: "Proven ATS Compatibility",
      desc: "Our formats are engineered to parse perfectly on modern ATS filters including Workday, Lever, and Greenhouse.",
    },
    {
      icon: ShieldCheck,
      title: "100% Secure & Private",
      desc: "Your data is parsed privately server-side, never persistent in databases without approval, and never sold.",
    },
    {
      icon: HeartHandshake,
      title: "No Hidden Costs",
      desc: "Tailor your resumes for free without premium subscription popups forcing payment just as you click export.",
    },
  ];

  return (
    <section
      id="why-us"
      className="py-16 bg-gradient-to-b from-white to-slate-50 px-6 sm:px-12 lg:px-24"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="max-w-lg">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
              The App Advantage
            </span>
            <h2 className="text-3xl font-sans font-bold text-slate-950 tracking-tight mt-3">
              Designed for impact, engineered for callbacks
            </h2>
          </div>
          <p className="text-slate-500 font-sans text-sm md:text-base max-w-md">
            Say goodbye to generalized templates. Present a tailor-made value
            proposition to every single hiring manager, for every role.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {points.map((pt, i) => {
            const IconComponent = pt.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white border border-slate-200/80 p-5 rounded-2xl flex gap-4 hover:border-slate-300 transition-colors"
                id={`whyus-item-${i}`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5" id={`why-icon-${i}`} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-sans font-semibold text-slate-900">
                    {pt.title}
                  </h3>
                  <p className="text-slate-500 font-sans text-xs sm:text-sm mt-1 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
