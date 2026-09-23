import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col">
      {children}
    </div>
  );
};

export default AuthCard;
