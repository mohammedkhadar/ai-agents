import express from 'express';
import { sendMessage, getConversationHistory } from '../controllers/chat.controller.js';

const router = express.Router();

// Send a message in the conversation
router.post('/message', sendMessage);

// Get conversation history
router.get('/history/:sessionId', getConversationHistory);

export default router;