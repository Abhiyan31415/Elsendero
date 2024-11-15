import React, { useState, useEffect, useRef } from "react";
import { Box, Container, TextField, IconButton, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import io from "socket.io-client";

const ChatComponent = ({ eventId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const socket = useRef(null);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser && currentUser.name && currentUser.id) {
            setUsername(currentUser.name);
            setUserId(currentUser.id);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userId || !username || !eventId) return;

        socket.current = io("http://localhost:5000", { query: { userId, username } });

        socket.current.on("connect", () => {
            console.log("Connected to server");
            socket.current.emit("join room", eventId);
        });

        socket.current.on("chat message", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            console.log("New message received:", message);
        });

        fetchMessages();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
                console.log("Socket disconnected");
            }
        };
    }, [userId, username, eventId]);

    const fetchMessages = async () => {
        if (!eventId) return;
        try {
            const response = await axios.get(`http://localhost:5000/messages?eventId=${eventId}`);
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageData = { eventId, userId, username, content: newMessage };
            socket.current.emit("chat message", messageData);
            setNewMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!userId) return <div>User Not Logged In</div>;

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, overflow: "auto", bgcolor: "grey.100", p: 3 }}>
                <Container maxWidth="md">
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                justifyContent: message.userId === userId ? "flex-end" : "flex-start",
                                mb: 2,
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    maxWidth: "70%",
                                    p: 2,
                                    bgcolor: message.userId === userId ? "#06402b" : "grey.300",
                                    color: message.userId === userId ? "primary.contrastText" : "text.primary",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mb: 0.5,
                                        color: message.userId === userId ? "yellow" : "blue",
                                    }}
                                >
                                    {message.username}
                                </Typography>
                                <Typography variant="body1">{message.content}</Typography>
                            </Paper>
                        </Box>
                    ))}
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
