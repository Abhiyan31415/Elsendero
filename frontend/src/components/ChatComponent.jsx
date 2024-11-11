import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    TextField,
    IconButton,
    Paper,
    Typography,
    AppBar,
    Toolbar,
} from "@mui/material";
import { useRef } from "react";
import io from "socket.io-client";
import SendIcon from "@mui/icons-material/Send";

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("testUser1");
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io("http://localhost:5000"); // Adjust to your server URL

        socket.current.on("connect", () => {
            console.log("Connected to server");
        });

        socket.current.on("chat message", (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        socket.current.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:5000/messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageData = { userId: "123", username, content: newMessage };
            socket.current.emit("chat message", messageData);
            setNewMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Chat Room</Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'grey.100',
                p: 3
            }}>
                <Container maxWidth="md">
                    {messages.map((message, index) => {
                        const isCurrentUser = message.username === username;
                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                    mb: 2
                                }}
                            >
                                <Paper
                                    elevation={1}
                                    sx={{
                                        maxWidth: '70%',
                                        p: 2,
                                        bgcolor: isCurrentUser ? 'primary.main' : 'background.paper',
                                        color: isCurrentUser ? 'primary.contrastText' : 'text.primary'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{
                                            mb: 0.5,
                                            color: isCurrentUser ? 'primary.light' : 'text.secondary'
                                        }}
                                    >
                                        {message.username}
                                    </Typography>
                                    <Typography variant="body1">
                                        {message.content}
                                    </Typography>
                                </Paper>
                            </Box>
                        );
                    })}
                </Container>
            </Box>

            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            variant="outlined"
                            size="medium"
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSendMessage}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                                width: 56,
                                height: 56
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