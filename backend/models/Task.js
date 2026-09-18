const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  taskId: {
    type: String,
    uppercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  assigneeEmail: {
    type: String,
    default: '',
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'under_review', 'done'],
    default: 'todo',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

taskSchema.index({ projectId: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
