import React from "react";

export function Button({
   children,
   size = "md",
   variant = "default",
   className = "",
   ...props
}) {
   const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
   };

   const variantClasses = {
      default: "bg-blue-600 hover:bg-blue-700 text-white",
      outline:
         "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
   };

   const baseClasses = "rounded-md font-medium transition-colors duration-200";

   return (
      <button
         className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
         {...props}
      >
         {children}
      </button>
   );
}
