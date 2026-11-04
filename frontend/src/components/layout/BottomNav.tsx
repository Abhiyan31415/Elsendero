'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Chat, Hiking, LocationOn, Today } from '@mui/icons-material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

export const NAV_ITEMS = [
  { href: '/map', label: 'Map', icon: <LocationOn /> },
  { href: '/events', label: 'Events', icon: <Today /> },
  { href: '/trails', label: 'Trails', icon: <Hiking /> },
  { href: '/add-trail', label: 'Add Trail', icon: <AddLocationAltIcon /> },
  { href: '/chat', label: 'Chat', icon: <Chat /> },
] as const;

const BottomNav = () => {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const index = NAV_ITEMS.findIndex((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2 }} component="nav">
      <BottomNavigation
        showLabels
        value={index === -1 ? false : index}
        onChange={(_e, newValue: number) => {
          const item = NAV_ITEMS[newValue];
          if (item) {
            window.scrollTo(0, 0);
            router.push(item.href);
          }
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction key={item.href} label={item.label} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
