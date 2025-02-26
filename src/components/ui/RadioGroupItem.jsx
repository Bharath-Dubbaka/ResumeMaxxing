import { useState } from "react";

export const RadioGroupItem = ({ value, id, name, onChange, checked }) => {
  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
          checked ? "border-blue-500" : "border-gray-400"
        }`}
      >
        {checked && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
      </div>
      <span className="text-gray-800">{value}</span>
    </label>
  );
};
