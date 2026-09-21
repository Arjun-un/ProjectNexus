const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'team_lead', 'team_member'],
    required: [true, 'Role is required']
  },
  rollNumber: {
    type: String,
    trim: true
  },
  usn: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  roleTitle: {
    type: String,
    trim: true,
    default: ''
  },
  avatarInitials: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (this.isModified('name') && this.name) {
    const parts = this.name.trim().split(/\s+/);
    this.avatarInitials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  if (!this.isModified('passwordHash')) return;

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
