'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Container, MenuItem, TextField, Typography } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import { getEvents } from '@/actions/event';
import { recordId, type Event } from '@/types';
import ChatComponent from './ChatComponent';

/** Event picker + chat room. The selected event lives in the `?eventId=` query param. */
const ChatPage = () => {
  const { dispatch } = useValue();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get('eventId') ?? '';
  const [events, setEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    void getEvents(dispatch).then((list) => setEvents(list ?? []));
  }, [dispatch]);

  const selected = events?.find((e) => recordId(e) === eventId);

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
      <Typography variant="h4" component="h1" color="primary" gutterBottom>
        Event chat
      </Typography>
      {events === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress aria-label="Loading events" />
        </Box>
      ) : events.length === 0 ? (
        <Typography color="text.secondary">There are no events to chat about yet. Create one on the Events page.</Typography>
      ) : (
        <TextField
          select
          fullWidth
          label="Choose an event"
          value={selected ? eventId : ''}
          onChange={(e) => router.replace(`${pathname}?eventId=${encodeURIComponent(e.target.value)}`)}
          sx={{ mb: 3 }}
        >
          {events.map((e) => (
            <MenuItem key={recordId(e)} value={recordId(e)}>
              {e.title}
            </MenuItem>
          ))}
        </TextField>
      )}
      {eventId && <ChatComponent key={eventId} eventId={eventId} />}
    </Container>
  );
};

export default ChatPage;
