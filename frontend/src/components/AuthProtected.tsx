"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi } from '@/lib/api';

interface AuthProtectedProps {
  children: React.ReactNode;
}

export default function AuthProtected({ children }: AuthProtectedProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verify authentication by attempting to fetch devices
    const checkAuth = async () => {
      try {
        await devicesApi.list({ limit: 1 });
        setIsChecking(false);
      } catch (error) {
        // If unauthorized, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
