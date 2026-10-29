let memoryAgents = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(memoryAgents);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const newAgent = {
      _id: body._id || 'agent-' + Math.random().toString(36).slice(2, 10),
      name: body.name || 'Untitled Agent',
      description: body.description || '',
      purpose: body.purpose || '',
      industry: body.industry || 'other',
      capabilities: body.capabilities || ['text-generation'],
      config: body.config || { model: 'gpt-4o-mini', temperature: 0.7, systemPrompt: '' },
      status: body.status || 'testing',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryAgents = [newAgent, ...memoryAgents.filter(a => a._id !== newAgent._id)];
    return res.status(201).json(newAgent);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
