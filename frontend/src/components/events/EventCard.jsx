import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatComponent from '../ChatComponent';

function EventCard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAddEventDialog, setOpenAddEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    from: '',
    to: '',
    location: '',
    participants: [],
  });

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Handle clicking on an event card
  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  // Handle adding a new event
  const handleAddEvent = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/events', newEvent);
      setEvents((prevEvents) => [...prevEvents, response.data]); // Add the newly created event
      setNewEvent({
        title: '',
        description: '',
        from: '',
        to: '',
        location: '',
        participants: [],
      });
      setOpenAddEventDialog(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary">Event Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddEventDialog(true)}
          sx={{ fontWeight: 'bold', backgroundColor: '#1976d2', ':hover': { backgroundColor: '#115293' } }}
        >
          Add Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card
              sx={{ p: 2, cursor: 'pointer', boxShadow: 4, transition: '0.3s', ':hover': { boxShadow: 6 } }}
              onClick={() => handleCardClick(event)}
            >
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>{event.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{event.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>From:</strong> {new Date(event.from).toLocaleDateString()} - <strong>To:</strong> {new Date(event.to).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Location:</strong> {event.location}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Participants:</strong> {event.participants.join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Display ChatComponent if an event is selected */}
      {selectedEvent && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="secondary" sx={{ mb: 2 }}>Chat for {selectedEvent.title}</Typography>
          <ChatComponent event={selectedEvent} />
        </Box>
      )}

      {/* Add Event Dialog */}
      <Dialog open={openAddEventDialog} onClose={() => setOpenAddEventDialog(false)}>
        <DialogTitle>Add a New Event</DialogTitle>
        <DialogContent>
          <TextField
            label="Event Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Event Description"
            fullWidth
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="From Date"
            type="date"
            fullWidth
            value={newEvent.from}
            onChange={(e) => setNewEvent({ ...newEvent, from: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            fullWidth
            value={newEvent.to}
            onChange={(e) => setNewEvent({ ...newEvent, to: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Location"
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Participants (comma separated)"
            fullWidth
            value={newEvent.participants.join(', ')}
            onChange={(e) => setNewEvent({ ...newEvent, participants: e.target.value.split(',') })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEventDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddEvent} color="primary" variant="contained">
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventCard;
