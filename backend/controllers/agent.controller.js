import Agent from '../models/agent.model.js';

// Get all agents
export const getAgents = async (req, res) => {
  try {
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
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};