import React from "react";
import { Link } from "react-router-dom";

const AuthLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-sm text-gray-600 hover:text-gold-600 hover:underline"
    >
      {children}
    </Link>
  );
};

export default AuthLink;
