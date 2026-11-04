'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { googleSignIn } from '@/actions/user';
import { GOOGLE_CLIENT_ID } from '@/config';
import { useValue } from '@/context/ContextProvider';

interface GoogleId {
  initialize(options: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: 'popup' }): void;
  renderButton(
    el: HTMLElement,
    options: { theme?: string; size?: string; text?: string; shape?: string; width?: number; logo_alignment?: string },
  ): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise: Promise<void> | null = null;

/** Loads Google Identity Services once per page. */
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Google sign-in'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Google's own "Continue with Google" button. Renders nothing when no client id is configured. */
export default function GoogleButton({ text = 'continue_with' }: { text?: 'continue_with' | 'signup_with' }) {
  const { dispatch } = useValue();
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        const el = ref.current;
        const id = window.google?.accounts.id;
        if (cancelled || !el || !id) return;
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: 'popup',
          callback: ({ credential }) => {
            if (credential) void googleSignIn(credential, dispatch);
          },
        });
        id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'center',
          width: Math.min(el.clientWidth || 320, 400),
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [dispatch, text]);

  if (!GOOGLE_CLIENT_ID || failed) return null;
  return <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', minHeight: 44, width: '100%' }} />;
}
