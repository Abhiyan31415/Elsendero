import { Suspense } from 'react';
import type { Metadata } from 'next';
import ResetPassword from '@/components/auth/ResetPassword';

export const metadata: Metadata = {
  title: 'Reset password',
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    // useSearchParams needs a Suspense boundary for static rendering.
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
