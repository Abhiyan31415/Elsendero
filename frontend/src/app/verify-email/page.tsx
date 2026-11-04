import { Suspense } from 'react';
import type { Metadata } from 'next';
import VerifyEmail from '@/components/auth/VerifyEmail';

export const metadata: Metadata = {
  title: 'Verify email',
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    // useSearchParams needs a Suspense boundary for static rendering.
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
