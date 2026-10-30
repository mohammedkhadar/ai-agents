import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  provider: { type: String, default: 'email' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
