import { Label } from "./ui/label";

export const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="ModernClean"
          name="template"
          value="ModernClean"
          checked={selectedTemplate === "ModernClean"}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-4 h-4 text-blue-600"
        />
        <Label htmlFor="ModernClean">Modern Clean</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="Standard"
          name="template"
          value="Standard"
          checked={selectedTemplate === "Standard"}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-4 h-4 text-blue-600"
        />
        <Label htmlFor="Standard">Standard Format</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="Hybrid"
          name="template"
          value="Hybrid"
          checked={selectedTemplate === "Hybrid"}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-4 h-4 text-blue-600"
        />
        <Label htmlFor="Hybrid">Hybrid Format</Label>
      </div>
      
    </div>
  );
};
