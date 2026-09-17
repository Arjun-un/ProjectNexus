const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  rollNo: { type: String, trim: true, default: '' },
  role: { type: String, trim: true, default: 'Project Contributor' },
  githubUsername: { type: String, trim: true, default: '' }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  leader: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    rollNo: { type: String, default: '' },
    role: { type: String, default: 'Team Lead' },
    githubUsername: { type: String, default: '' }
  },
  members: [memberSchema]
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['creation', 'team_join', 'milestone', 'alert', 'status_change', 'handover'],
    default: 'creation'
  }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: ['Software', 'IoT', 'Hardware'],
    default: 'Software',
    index: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    index: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    default: '2025-2026',
    trim: true
  },
  facultyGuide: {
    type: String,
    required: [true, 'Faculty guide is required'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  // Conditional category metadata
  techStack: [{
    type: String,
    trim: true
  }],
  componentsRequired: [{
    type: String,
    trim: true
  }],
  labAssigned: {
    type: String,
    default: '',
    trim: true
  },
  githubUrl: {
    type: String,
    default: '',
    trim: true
  },
  // Team access & claim state
  teamAccessCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  isAccessCodeClaimed: {
    type: Boolean,
    default: false,
    index: true
  },
  accessCodeStatus: {
    type: String,
    enum: ['active', 'claimed', 'revoked'],
    default: 'active'
  },
  invitedLeadEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  invitationSentAt: {
    type: Date
  },
  team: {
    type: teamSchema,
    default: () => ({
      name: '',
      leader: { name: '', email: '' },
      members: []
    })
  },
  // Status & Health
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Active', 'Completed', 'Discontinued', 'At Risk'],
    default: 'Active',
    index: true
  },
  health: {
    type: String,
    enum: ['Good', 'Moderate', 'At Risk', 'Critical'],
    default: 'Good',
    index: true
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentMilestone: {
    type: String,
    default: 'Project Initiation & Setup'
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  timeline: [timelineEventSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
