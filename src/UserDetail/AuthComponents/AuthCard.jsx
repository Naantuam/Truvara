import React from "react";

// No card: the form sits directly on the gold background. The auth pages
// are written in the old white card's colours (gray-900 headings, gray-500
// hints, brand links); .auth-on-gold in App.css darkens those same tokens so
// they stay readable on gold, and turns the gold AuthButton black.
const AuthCard = ({ children }) => {
  return <div className="auth-on-gold w-full max-w-md flex flex-col p-2 sm:p-4">{children}</div>;
};

export default AuthCard;
