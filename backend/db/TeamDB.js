const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Member email is required'],
    trim: true,
    lowercase: true
  },
  rollNo: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    default: 'Project Contributor',
    trim: true
  },
  githubUsername: {
    type: String,
    default: '',
    trim: true
  },
  tasksAssigned: {
    type: Number,
    default: 0
  }
}, { _id: true });

const teamDBSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    unique: true,
    index: true,
    trim: true,
    uppercase: true
  },
  projectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  teamName: {
    type: String,
    default: 'Alpha Visionary Labs',
    trim: true
  },
  leader: {
    name: {
      type: String,
      required: [true, 'Team leader name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Team leader email is required'],
      trim: true,
      lowercase: true
    },
    rollNo: {
      type: String,
      default: '',
      trim: true
    },
    role: {
      type: String,
      default: 'Team Lead',
      trim: true
    },
    githubUsername: {
      type: String,
      default: '',
      trim: true
    }
  },
  members: [memberSchema],
  githubRepoUrl: {
    type: String,
    default: '',
    trim: true
  },
  gitBranch: {
    type: String,
    default: 'main',
    trim: true
  },
  webhookUrl: {
    type: String,
    default: '',
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'teamdb' // Explicit collection name requested: teamdb
});

module.exports = mongoose.model('TeamDB', teamDBSchema);
