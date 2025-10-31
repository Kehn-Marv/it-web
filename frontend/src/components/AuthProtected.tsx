"use client";

import React from 'react';

interface AuthProtectedProps {
  children: React.ReactNode;
}

export default function AuthProtected({ children }: AuthProtectedProps) {
  return <>{children}</>;
}
