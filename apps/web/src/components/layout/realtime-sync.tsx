'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    // Refresh data when user focuses the window or tab (e.g. switching back)
    const handleFocus = () => {
      router.refresh();
    };

    // Lightweight background polling to sync data dynamically across tabs and devices
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [router]);

  return null;
}
