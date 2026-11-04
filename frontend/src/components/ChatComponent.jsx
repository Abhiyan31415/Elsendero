import React, { useState, useEffect, useRef } from "react";
import { Box, Container, TextField, IconButton, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import io from "socket.io-client";
import { API_URL, SOCKET_URL } from "../config";
import { useValue } from "../context/ContextProvider";

const ChatComponent = ({ eventId }) => {
    const { state: { currentUser } } = useValue();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [connected, setConnected] = useState(false);
    const socket = useRef(null);
    const bottomRef = useRef(null);

    const userId = currentUser?.id;
    const token = currentUser?.token;

    // Load message history for the selected event.
    useEffect(() => {
        if (!eventId) return;
        let cancelled = false;
        setMessages([]);
        axios
            .get(`${API_URL}/messages`, {
                params: { eventId },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            .then((response) => {
                if (!cancelled) setMessages(Array.isArray(response.data) ? response.data : []);
            })
            .catch((error) => console.error("Error fetching messages:", error));
        return () => {
            cancelled = true;
        };
    }, [eventId, token]);

    // (Re)connect the socket whenever the user or event changes.
    useEffect(() => {
        if (!token || !eventId) return;

        const s = io(SOCKET_URL, { auth: { token } });
        socket.current = s;

        s.on("connect", () => {
            setConnected(true);
            s.emit("join room", eventId);
        });
        s.on("disconnect", () => setConnected(false));
        s.on("connect_error", (err) => {
            setConnected(false);
            console.error("Socket connection error:", err.message);
        });
        s.on("chat message", (message) => {
            if (message?.eventId && String(message.eventId) !== String(eventId)) return;
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            s.off();
            s.disconnect();
            if (socket.current === s) socket.current = null;
            setConnected(false);
        };
    }, [token, eventId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        const content = newMessage.trim();
        if (!content || !socket.current || !connected) return;
        socket.current.emit("chat message", { eventId, content });
        setNewMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!currentUser || !token) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1">Please log in to join the chat.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, overflow: "auto", bgcolor: "grey.100", p: 3 }}>
                <Container maxWidth="md">
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                justifyContent: String(message.userId) === String(userId) ? "flex-end" : "flex-start",
                                mb: 2,
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    maxWidth: "70%",
                                    p: 2,
                                    bgcolor: String(message.userId) === String(userId) ? "#06402b" : "grey.300",
                                    color: String(message.userId) === String(userId) ? "primary.contrastText" : "text.primary",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mb: 0.5,
                                        color: String(message.userId) === String(userId) ? "yellow" : "blue",
                                    }}
                                >
                                    {message.username}
                                </Typography>
                                <Typography variant="body1">{message.content}</Typography>
                            </Paper>
                        </Box>
                    ))}
                    <div ref={bottomRef} />
                </Container>
            </Box>
            <Paper elevation={3} sx={{ p: 2, bgcolor: "background.paper" }}>
                <Container maxWidth="md">
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            variant="outlined"
                            size="medium"
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!connected || !newMessage.trim()}
                            sx={{
                                bgcolor: "#06402b",
                                color: "white",
                                "&:hover": { bgcolor: "primary.dark" },
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
