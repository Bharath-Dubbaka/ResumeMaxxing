import { Label } from "./ui/label";

export const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="BNP"
          name="template"
          value="BNP"
          checked={selectedTemplate === "BNP"}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-4 h-4 text-blue-600"
        />
        <Label htmlFor="BNP">BNP Format</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="StateOfMS"
          name="template"
          value="StateOfMS"
          checked={selectedTemplate === "StateOfMS"}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-4 h-4 text-blue-600"
        />
        <Label htmlFor="StateOfMS">State of MS Format</Label>
      </div>
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
    </div>
  );
};
