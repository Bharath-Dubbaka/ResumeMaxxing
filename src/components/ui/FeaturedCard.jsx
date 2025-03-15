function FeatureCard({ title, description }) {
   return (
      <div className="p-6 rounded-lg bg-white border border-slate-400 hover:border-slate-500 shadow-xl hover:shadow-md duration-300 hover:-translate-y-1.5 transition-transform dotted-pattern">
         <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
         <p className="text-slate-500">{description}</p>
      </div>
   );
}

export default FeatureCard;
