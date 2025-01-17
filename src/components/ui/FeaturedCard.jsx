function FeatureCard({ title, description }) {
   return (
      <div className="p-6 rounded-lg bg-white border border-slate-400 hover:border-slate-500 transition-all">
         <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
         <p className="text-slate-500">{description}</p>
      </div>
   );
}

export default FeatureCard;
