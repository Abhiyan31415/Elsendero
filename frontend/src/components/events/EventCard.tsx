'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import { useValue } from '@/context/ContextProvider';
import { createEvent, getEvents } from '@/actions/event';
import { recordId, type Event, type NewEvent } from '@/types';
import { formatDateRange } from '@/utils/format';

const EMPTY_EVENT: NewEvent = { title: '', description: '', from: '', to: '', location: '', participants: [] };

const validateEvent = (e: NewEvent): string => {
  if (!e.title.trim()) return 'Title is required';
  if (!e.description.trim()) return 'Description is required';
  if (!e.from || !e.to) return 'Both dates are required';
  if (new Date(e.to) < new Date(e.from)) return 'The end date must be after the start date';
  if (!e.location.trim()) return 'Location is required';
  return '';
};

function EventCard() {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();
  const [events, setEvents] = useState<Event[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [newEvent, setNewEvent] = useState<NewEvent>(EMPTY_EVENT);
  const [participantsText, setParticipantsText] = useState('');

  useEffect(() => {
    void getEvents(dispatch).then((list) => {
      if (list) setEvents(list);
      setLoaded(true);
    });
  }, [dispatch]);

  const openDialog = () => {
    if (!currentUser) {
      dispatch({ type: 'OPEN_LOGIN' });
      return;
    }
    setFormError('');
    setOpen(true);
  };

  const handleAddEvent = async () => {
    if (!currentUser?.token) {
      dispatch({ type: 'OPEN_LOGIN' });
      return;
    }
    const payload: NewEvent = {
      ...newEvent,
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      location: newEvent.location.trim(),
      participants: participantsText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    };
    const err = validateEvent(payload);
    setFormError(err);
    if (err) return;
    setSaving(true);
    const created = await createEvent(payload, currentUser.token, dispatch);
    setSaving(false);
    if (created) {
      setEvents((prev) => [...prev, created]);
      setNewEvent(EMPTY_EVENT);
      setParticipantsText('');
      setOpen(false);
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'success', message: 'Event created' } });
    }
  };

  const set = (field: keyof NewEvent) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setNewEvent((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: 10, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap">
        <Typography variant="h4" component="h1" color="primary">
          Events
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog} sx={{ fontWeight: 'bold' }}>
          Add Event
        </Button>
      </Box>

      {!loaded ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Loading events" />
        </Box>
      ) : events.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          No events yet. Create the first one!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={recordId(event)}>
              <Card sx={{ height: '100%', boxShadow: 4, transition: '0.3s', ':hover': { boxShadow: 6 } }}>
                <CardActionArea component={Link} href={`/chat?eventId=${encodeURIComponent(recordId(event))}`} sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {event.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>When:</strong> {formatDateRange(event.from, event.to)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {event.location}
                    </Typography>
                    {(event.participants ?? []).length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Participants:</strong> {(event.participants ?? []).join(', ')}
                      </Typography>
                    )}
                    <Typography variant="body2" color="primary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ChatIcon fontSize="small" /> Open chat
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a New Event</DialogTitle>
        <DialogContent>
          <TextField label="Event Title" fullWidth value={newEvent.title} onChange={set('title')} sx={{ my: 1 }} required />
          <TextField
            label="Event Description"
            fullWidth
            multiline
            minRows={2}
            value={newEvent.description}
            onChange={set('description')}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="From Date"
            type="date"
            fullWidth
            value={newEvent.from}
            onChange={set('from')}
            sx={{ mb: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="To Date"
            type="date"
            fullWidth
            value={newEvent.to}
            onChange={set('to')}
            sx={{ mb: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField label="Location" fullWidth value={newEvent.location} onChange={set('location')} sx={{ mb: 2 }} required />
          <TextField
            label="Participants (comma separated)"
            fullWidth
            value={participantsText}
            onChange={(e) => setParticipantsText(e.target.value)}
          />
          {formError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }} role="alert">
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAddEvent} variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventCard;
