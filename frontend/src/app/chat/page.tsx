import { Suspense } from 'react';
import type { Metadata } from 'next';
import Protected from '@/components/protected/Protected';
import ChatPage from '@/components/chat/ChatPage';

export const metadata: Metadata = {
  title: 'Event chat',
  robots: { index: false },
};

export default function Chat() {
  return (
    <Protected>
      {/* useSearchParams needs a Suspense boundary for static rendering. */}
      <Suspense>
        <ChatPage />
      </Suspense>
    </Protected>
  );
}
