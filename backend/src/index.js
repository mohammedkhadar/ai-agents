import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../db/connect.js';
import agentRoutes from '../routes/agent.routes.js';
import chatRoutes from '../routes/chat.routes.js';
import authRoutes from '../routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'AI Agent Platform Backend is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Agent Platform Backend is running' });
});

// Start server when running outside Vercel serverless
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
