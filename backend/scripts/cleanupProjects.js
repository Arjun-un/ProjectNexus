require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Project = require('../db/Project');
const RepositoryEvent = require('../db/RepositoryEvent');
const Task = require('../db/Task');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas.');

    const keepProjectIds = ['IT-2026-064', 'ECE-2026-022', 'CSE-2026-041'];
    const toDelete = await Project.find({ projectId: { $nin: keepProjectIds } });

    console.log('Projects identified for removal:', toDelete.map(p => `${p.projectId}: "${p.title}"`));

    for (const p of toDelete) {
      await Project.findByIdAndDelete(p._id);
      await RepositoryEvent.deleteMany({ projectId: p._id });
      await Task.deleteMany({ projectId: p._id });
      console.log(`Deleted project ${p.projectId} and related records`);
    }

    const remaining = await Project.find({}, 'projectId title department status teamAccessCode');
    console.log('\n✅ Successfully cleaned up database! Remaining projects in DB:');
    console.log(JSON.stringify(remaining, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanup();
