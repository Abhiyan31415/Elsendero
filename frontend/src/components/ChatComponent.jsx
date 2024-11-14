import React, { useState, useEffect, useRef } from "react";
import { Box, Container, TextField, IconButton, Paper, Typography, AppBar, Toolbar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import io from "socket.io-client";

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(true);  // Loading state
    const socket = useRef(null);

    // Initialize user data from localStorage
    const initializeUser = () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser && currentUser.name && currentUser.id) {
            setUsername(currentUser.name);
            setUserId(currentUser.id);
            setLoading(false);  // Set loading to false once user data is available
        } else {
            setLoading(false);  // Set loading to false if no user found
        }
    };

    useEffect(() => {
        initializeUser();
    }, []);

    useEffect(() => {
        if (!userId || !username) {
            return;  // Don't initialize socket if user is not logged in
        }

        // Connect to the socket server
        socket.current = io("http://localhost:5000", {
            query: { userId, username },
        });

        socket.current.on("connect", () => {
            console.log("Connected to server");
        });

        socket.current.on("chat message", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        fetchMessages();

        // Cleanup on component unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [userId, username]); // Reconnect if `userId` or `username` changes

    const fetchMessages = async () => {
        try {
            const response = await axios.get("http://localhost:5000/messages");
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageData = { userId, username, content: newMessage };
            socket.current.emit("chat message", messageData);
            setNewMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Show loading screen or redirect if user is not logged in
    if (loading) {
        return <div>Loading...</div>;  // You can replace this with a spinner or redirect logic
    }

    if (!userId) {
        return <div>User Not Logged In</div>;  // Redirect to login page if user is not logged in
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Chat Room</Typography>
                </Toolbar>
            </AppBar> */}

            <Box sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'grey.100',
                p: 3
            }}>
                <Container maxWidth="md">
                    {messages.map((message, index) => {
                        const isCurrentUser = message.userId === userId;
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
                                        bgcolor: isCurrentUser ? '#06402b' : 'grey.300',
                                        color: isCurrentUser ? 'primary.contrastText' : 'text.primary'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{
                                            mb: 0.5,
                                            color: isCurrentUser ? 'yellow' : 'blue'
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
                <Container maxWidth="md" >
                    <Box sx={{ display: 'flex', gap: 2 ,paddingBottom:"50px",position:"abolute"}}>
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
                                bgcolor: '#06402b',
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
