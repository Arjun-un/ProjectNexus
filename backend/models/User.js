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
    select: false // Don't return password by default in queries
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
  // USN / Student ID — e.g. "CS24B041"
  usn: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  // Specialization / role tag — e.g. "Frontend & Edge UI Developer"
  roleTitle: {
    type: String,
    trim: true,
    default: ''
  },
  // Derived initials stored for fast avatar rendering (e.g. "PR")
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
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Auto-derive avatarInitials before saving if name is set
userSchema.pre('save', async function() {
  // Derive initials from name whenever name is modified
  if (this.isModified('name') && this.name) {
    const parts = this.name.trim().split(/\s+/);
    this.avatarInitials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return;

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Instance method: compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
