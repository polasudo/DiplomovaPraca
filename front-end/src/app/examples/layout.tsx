'use client';

import { AwsAuthProvider } from '@/contexts/AwsAuthContext';
import React from 'react';

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AwsAuthProvider>
      {children}
    </AwsAuthProvider>
  );
}