import React from "react";
import AuthBrandPanel from "./AuthBrandPanel";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex font-sans">
      <AuthBrandPanel />

      <div className="w-full md:w-1/2 lg:w-3/5 min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 p-4 sm:p-8">
        {/* Decorative depth -- soft accent blobs, not literal shapes */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-900/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
