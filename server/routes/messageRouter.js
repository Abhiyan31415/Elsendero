import express from "express";
import { getMessages, createMessage } from "../controllers/MessageController.js";

const router = express.Router();

router.get("/", getMessages); // Get the latest messages
router.post("/", createMessage); // Post a new message

export default router;
