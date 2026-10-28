import express from 'express';
import { createAgent, getAgents, getAgent, updateAgent, deleteAgent } from '../controllers/agent.controller.js';

const router = express.Router();

// Get all agents
router.get('/', getAgents);

// Create a new agent
router.post('/', createAgent);

// Get a single agent
router.get('/:id', getAgent);

// Update an agent
router.put('/:id', updateAgent);

// Delete an agent
router.delete('/:id', deleteAgent);

export default router;