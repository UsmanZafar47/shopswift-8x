import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import { LoadingState } from '@/components/ui';
export const metadata = { title: 'Your guest details' };
export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthForm />
    </Suspense>
  );
}
