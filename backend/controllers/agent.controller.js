import Agent from '../models/agent.model.js';
import { isDBConnected } from '../db/connect.js';

// In-memory store when MongoDB is not configured
let memoryAgents = [];

// Get all agents
export const getAgents = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json(memoryAgents);
    }
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new agent
export const createAgent = async (req, res) => {
  try {
    const { name, description, config, capabilities } = req.body;
    if (!isDBConnected()) {
      const createdAgent = {
        _id: 'agent-' + Math.random().toString(36).slice(2, 11),
        name,
        description,
        config: config || { model: 'gpt-3.5-turbo', temperature: 0.7, systemPrompt: '' },
        capabilities: capabilities || [],
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryAgents.push(createdAgent);
      return res.status(201).json(createdAgent);
    }
    const agent = new Agent({
      name,
      description,
      config,
      capabilities,
      createdAt: new Date(),
    });
    const createdAgent = await agent.save();
    res.status(201).json(createdAgent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single agent
export const getAgent = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const agent = memoryAgents.find(a => a._id === req.params.id);
      if (!agent) return res.status(404).json({ message: 'Agent not found' });
      return res.json(agent);
    }
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an agent
export const updateAgent = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const idx = memoryAgents.findIndex(a => a._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Agent not found' });
      memoryAgents[idx] = { ...memoryAgents[idx], ...req.body, updatedAt: new Date() };
      return res.json(memoryAgents[idx]);
    }
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an agent
export const deleteAgent = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const idx = memoryAgents.findIndex(a => a._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Agent not found' });
      memoryAgents.splice(idx, 1);
      return res.json({ message: 'Agent deleted successfully' });
    }
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
