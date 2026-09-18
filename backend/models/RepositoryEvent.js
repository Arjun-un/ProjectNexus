const mongoose = require('mongoose');

const repositoryEventSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['push', 'pull_request', 'create', 'release', 'ping'],
    index: true
  },
  commitSha: {
    type: String,
    trim: true,
    default: ''
  },
  author: {
    name: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    githubUsername: { type: String, default: '', trim: true }
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  filesChanged: {
    added: { type: Number, default: 0 },
    removed: { type: Number, default: 0 },
    modified: { type: Number, default: 0 }
  },
  linkedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  rawPayloadSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({})
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for querying project events chronologically
repositoryEventSchema.index({ projectId: 1, receivedAt: -1 });

// Compound sparse index for idempotent commit deduplication per project
repositoryEventSchema.index(
  { projectId: 1, commitSha: 1 },
  { sparse: true, unique: false }
);

const RepositoryEvent = mongoose.model('RepositoryEvent', repositoryEventSchema);

module.exports = RepositoryEvent;
