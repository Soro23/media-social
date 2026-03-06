import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
