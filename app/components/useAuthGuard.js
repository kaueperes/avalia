'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  return ready;
}
