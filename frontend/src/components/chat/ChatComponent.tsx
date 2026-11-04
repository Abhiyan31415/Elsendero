'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Box, Chip, Container, IconButton, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { SOCKET_URL } from '@/config';
import { useValue } from '@/context/ContextProvider';
import { getMessages } from '@/actions/event';
import { recordId, type Message } from '@/types';

interface ServerToClient {
  'chat message': (message: Message) => void;
  error: (message: string) => void;
}
interface ClientToServer {
  'join room': (eventId: string) => void;
  'chat message': (payload: { eventId: string; content: string }) => void;
}

const ChatComponent = ({ eventId }: { eventId: string }) => {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const socket = useRef<Socket<ServerToClient, ClientToServer> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const userId = currentUser?.id;
  const token = currentUser?.token;

  // Load message history for the selected event.
  useEffect(() => {
    if (!eventId) return undefined;
    let cancelled = false;
    setMessages([]);
    void getMessages(eventId, token, dispatch).then((list) => {
      if (!cancelled && list) setMessages(list);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, token, dispatch]);

  // (Re)connect the socket whenever the user or event changes.
  useEffect(() => {
    if (!token || !eventId) return undefined;

    const s: Socket<ServerToClient, ClientToServer> = io(SOCKET_URL, { auth: { token } });
    socket.current = s;

    s.on('connect', () => {
      setConnected(true);
      s.emit('join room', eventId);
    });
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      setConnected(false);
      console.error('Socket connection error:', err.message);
    });
    s.on('chat message', (message) => {
      if (message?.eventId && String(message.eventId) !== String(eventId)) return;
      setMessages((prev) =>
        prev.some((m) => recordId(m) && recordId(m) === recordId(message)) ? prev : [...prev, message],
      );
    });
    s.on('error', (message) => {
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'error', message: String(message) } });
    });

    return () => {
      s.off();
      s.disconnect();
      if (socket.current === s) socket.current = null;
      setConnected(false);
    };
  }, [token, eventId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const content = newMessage.trim();
    if (!content || !socket.current || !connected) return;
    socket.current.emit('chat message', { eventId, content });
    setNewMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser || !token) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Please log in to join the chat.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'flex-end', bgcolor: 'background.paper' }}>
        <Chip size="small" color={connected ? 'success' : 'default'} label={connected ? 'Connected' : 'Connecting…'} />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.100', p: 3 }}>
        <Container maxWidth="md">
          {messages.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No messages yet — say hello!
            </Typography>
          )}
          {messages.map((message, index) => {
            const mine = String(message.userId) === String(userId);
            return (
              <Box key={recordId(message) || index} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', mb: 2 }}>
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    bgcolor: mine ? 'primary.main' : 'grey.300',
                    color: mine ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ mb: 0.5, color: mine ? 'yellow' : 'blue' }}>
                    {message.username}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
          <div ref={bottomRef} />
        </Container>
      </Box>
      <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }} square>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              variant="outlined"
              slotProps={{ htmlInput: { 'aria-label': 'Message' } }}
            />
            <IconButton
              aria-label="Send message"
              onClick={handleSendMessage}
              disabled={!connected || !newMessage.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 56,
                height: 56,
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default ChatComponent;
