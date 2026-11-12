import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({ id, type = "text", placeholder, value, onChange, Icon }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Determine if this field is a password type
  const isPassword = type === "password";
  // Toggle between "password" and "text" for visibility
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="group relative flex items-center w-full">
        {/* Left-side icon, in a small tile that turns black while the field
            is focused -- shows at a glance which field you're typing in. */}
        {Icon && (
          <div className="absolute left-2 h-9 w-9 rounded-lg flex items-center justify-center pointer-events-none bg-gold-100 text-gold-800 transition-colors group-focus-within:bg-black group-focus-within:text-gold-300">
            <Icon size={18} strokeWidth={2.25} />
          </div>
        )}

        {/* Input field */}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-[52px] px-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
            Icon ? "pl-14" : ""
          } ${isPassword ? "pr-11" : ""}`} // extra space for the eye icon
        />

        {/* Right-side eye toggle (only for password fields) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 p-1 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
