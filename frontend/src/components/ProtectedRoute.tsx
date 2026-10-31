import React from 'react';
import { ReactNode } from 'react';

// Login disabled for now — all routes are public
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;