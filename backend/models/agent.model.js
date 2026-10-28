import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Agent description is required'],
    trim: true,
  },
  config: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo',
    },
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7,
    },
    systemPrompt: {
      type: String,
      default: '',
    },
  },
  capabilities: [{
    type: String,
    enum: ['text-generation', 'code-generation', 'analysis', 'customer-service', 'automation', 'custom'],
  }],
  conversationFlow: {
    type: Map,
    of: String,
    default: {},
  },
  status: {
    type: String,
    enum: ['draft', 'testing', 'deployed', 'archived'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
agentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;