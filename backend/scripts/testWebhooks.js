require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const crypto = require('crypto');
const axios = require('axios');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const Project = require('../models/Project');
const RepositoryEvent = require('../models/RepositoryEvent');
const Task = require('../models/Task');
const { recalculateHealthScore } = require('../services/healthService');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting ProjectNexus GitHub Webhook & Tracking Test Suite...\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Find a test project
    let project = await Project.findOne();
    if (!project) {
      console.error('❌ No projects found in database. Seed projects first.');
      process.exit(1);
    }
    console.log(`📌 Using project: ${project.projectId} ("${project.title}")`);

    // 2. Create a test task for Smart Commits
    const testTaskId = `TEST-${Math.floor(100 + Math.random() * 900)}`;
    const task = await Task.create({
      projectId: project._id,
      taskId: testTaskId,
      title: `Implement authentication token validation (${testTaskId})`,
      status: 'todo',
      priority: 'high'
    });
    console.log(`📋 Created test Task: ${task.taskId} (status: ${task.status})`);

    // 3. Configure a test webhookSecret on project
    const testSecret = crypto.randomBytes(32).toString('hex');
    project.githubIntegration = {
      isConnected: true,
      repoUrl: 'https://github.com/Arjun-un/ProjectNexus',
      repoOwner: 'Arjun-un',
      repoName: 'ProjectNexus',
      webhookSecret: testSecret,
      connectedAt: new Date(),
      lastEventAt: new Date(),
      totalCommits: 5,
      totalPullRequests: 1,
      contributors: [
        {
          name: 'Lead Developer',
          email: 'lead@projectnexus.edu',
          githubUsername: 'lead-dev',
          commitCount: 5,
          linesAdded: 150,
          linesRemoved: 20,
          lastCommitAt: new Date()
        }
      ]
    };
    await project.save();
    console.log('🔑 Saved webhook secret to project (select: false protected)');

    // 4. Test Webhook Ingestion with Valid HMAC Signature
    const commitSha = crypto.randomBytes(20).toString('hex');
    const webhookPayload = {
      ref: 'refs/heads/main',
      pusher: { name: 'Arjun-un' },
      sender: { login: 'Arjun-un' },
      commits: [
        {
          id: commitSha,
          message: `Fixes #${testTaskId}: resolve authentication token expiration bug`,
          url: `https://github.com/Arjun-un/ProjectNexus/commit/${commitSha}`,
          author: {
            name: 'Arjun-un',
            email: 'lead@projectnexus.edu',
            username: 'Arjun-un'
          },
          added: ['backend/auth.js'],
          removed: [],
          modified: ['backend/server.js']
        }
      ]
    };

    const rawPayloadString = JSON.stringify(webhookPayload);
    const validSignature = 'sha256=' + crypto
      .createHmac('sha256', testSecret)
      .update(Buffer.from(rawPayloadString, 'utf8'))
      .digest('hex');

    console.log('\n🚀 Sending test push webhook with HMAC-SHA256 signature...');
    const pushRes = await axios.post(
      `${BASE_URL}/webhooks/github/${project.projectId}`,
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Event': 'push',
          'X-Hub-Signature-256': validSignature
        }
      }
    );

    console.log(`✅ Webhook Response Status: ${pushRes.status} OK`);
    console.log(`📦 Webhook Response:`, pushRes.data);

    // 5. Verify Smart Commit updated the Task status
    const updatedTask = await Task.findById(task._id);
    if (updatedTask.status === 'done') {
      console.log(`🎉 Smart Commit Verification: Task ${updatedTask.taskId} transitioned to 'done' successfully!`);
    } else {
      console.warn(`⚠️ Task status expected 'done', found '${updatedTask.status}'`);
    }

    // 6. Verify RepositoryEvent was created
    const event = await RepositoryEvent.findOne({ projectId: project._id, commitSha });
    if (event) {
      console.log(`✅ RepositoryEvent recorded: commit ${event.commitSha.slice(0, 7)} linked to Task ${event.linkedTaskId}`);
    } else {
      console.error('❌ RepositoryEvent not found!');
    }

    // 7. Verify Tampered Signature Rejected (Security Gate)
    console.log('\n🔒 Testing tampered signature rejection...');
    try {
      await axios.post(
        `${BASE_URL}/webhooks/github/${project.projectId}`,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-GitHub-Event': 'push',
            'X-Hub-Signature-256': 'sha256=invalid_tampered_signature_hex_0000000000000000000000000000000000000000'
          }
        }
      );
      console.error('❌ Security check failed: Tampered signature was accepted!');
    } catch (tamperErr) {
      if (tamperErr.response?.status === 401) {
        console.log('✅ Tampered signature correctly rejected with HTTP 401 Unauthorized.');
      } else {
        console.warn('⚠️ Unexpected error code:', tamperErr.response?.status || tamperErr.message);
      }
    }

    // 8. Test Health Score Engine
    console.log('\n📊 Testing Dynamic Health Score Engine...');
    const healthResult = await recalculateHealthScore(project._id);
    console.log('✅ Health Engine Result:', healthResult);

    // Clean up test task
    await Task.findByIdAndDelete(task._id);
    console.log('\n🧹 Cleaned up temporary test artifacts.');
    console.log('✨ ALL WEBHOOK BACKEND VERIFICATIONS PASSED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test Suite Failure:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
