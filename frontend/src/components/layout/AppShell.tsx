'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import useCheckToken from '@/hooks/useCheckToken';
import Loading from './Loading';
import Notification from './Notification';
import NavBar from './NavBar';
import BottomNav from './BottomNav';
import Login from '../user/Login';

// The trail quick-view pulls in Swiper; load it only in the browser, on demand.
const TrailInfo = dynamic(() => import('../trails/TrailInfo'), { ssr: false });

/** Global chrome shared by every page: nav bars, dialogs, alerts and session checks. */
export default function AppShell({ children }: { children: ReactNode }) {
  useCheckToken();
  return (
    <>
      <Loading />
      <Notification />
      <Login />
      <NavBar />
      <TrailInfo />
      <Box component="main" sx={{ pb: 7 }}>
        {children}
      </Box>
      <BottomNav />
    </>
  );
}
