require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Project = require('../db/Project');

const activeProjects = [
  {
    projectId: 'CSE-2026-041',
    title: 'Smart Attendance & Proximate Face Biometrics System',
    category: 'Software',
    department: 'Computer Science & Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Robert Chen',
    deadline: new Date('2026-05-15'),
    priority: 'High',
    description: 'High-throughput edge-computing facial recognition engine for lecture hall attendance tracking with anti-spoofing liveness detection and ERP sync.',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'React 19', 'PostgreSQL', 'Docker'],
    teamAccessCode: 'NEXUS-7F2K',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 94,
    progress: 68,
    currentMilestone: 'Sprint 4: Liveness Anti-Spoofing & Edge Model Quantization',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 4),
    team: {
      name: 'Alpha Visionary Labs',
      leader: {
        name: 'Arjun Swaminathan',
        email: 'arjun.swami@projectnexus.edu'
      },
      members: [
        { name: 'Priya Raman', email: 'priya.raman@projectnexus.edu' },
        { name: 'Karthik Raja', email: 'karthik.raja@projectnexus.edu' },
        { name: 'Sneha Patel', email: 'sneha.patel@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Milestone Review Completed',
        description: 'Sprint 3 Face Vector Matching passed faculty review with 99.2% accuracy.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        type: 'milestone'
      },
      {
        title: 'Team Registered & Project Linked',
        description: 'Team Alpha Visionary Labs claimed access code NEXUS-7F2K.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
        type: 'team_join'
      },
      {
        title: 'Project Created by Administration',
        description: 'Initial allocation under CSE Department with supervisor Dr. Robert Chen.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        type: 'creation'
      }
    ]
  },
  {
    projectId: 'ECE-2026-022',
    title: 'Industrial IoT Predictive Vibration & Thermal Monitor',
    category: 'IoT',
    department: 'Electronics & Communication',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Arvind Rao',
    deadline: new Date('2026-04-30'),
    priority: 'High',
    description: 'Autonomous multi-sensor acoustic and thermal monitoring pod for three-phase industrial motors with edge anomaly inferencing.',
    techStack: ['C++', 'FreeRTOS', 'ESP-IDF', 'MQTT', 'InfluxDB', 'Grafana'],
    componentsRequired: ['ESP32-S3', 'ADXL345 Accelerometer', 'MLX90614 IR Temp', 'SX1262 LoRa'],
    labAssigned: 'Embedded Systems & Sensor Networks Lab (Room 204)',
    teamAccessCode: 'NEXUS-3W8L',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'At Risk',
    health: 'Critical',
    healthScore: 36,
    progress: 32,
    currentMilestone: 'Milestone 2: LoRa Gateway Integration & Anomaly Thresholds',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    team: {
      name: 'VibroSense Tech',
      leader: {
        name: 'Meghana Kulkarni',
        email: 'meghana.ece@projectnexus.edu'
      },
      members: [
        { name: 'Aditya Patil', email: 'aditya.ece@projectnexus.edu' },
        { name: 'Naveen Kumar', email: 'naveen.ece@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Risk Flag: Stalled Sensor Firmware',
        description: 'No telemetry commits for 6 days. SPI DMA buffer overflow blocker unresolved.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        type: 'alert'
      },
      {
        title: 'Hardware Lab Access Approved',
        description: 'Allocated test rig in Embedded Systems Lab Room 204.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        type: 'milestone'
      }
    ]
  },
  {
    projectId: 'IT-2026-064',
    title: 'Decentralized Academic Credential Verification Network',
    category: 'Software',
    department: 'Information Technology',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Meera Nambiar',
    deadline: new Date('2026-04-10'),
    priority: 'Medium',
    description: 'Zero-Knowledge Proof academic credential minting and verification protocol on Polygon for instant employer diploma validation.',
    techStack: ['Solidity', 'Hardhat', 'Next.js 14', 'Ethers.js', 'IPFS', 'TailwindCSS'],
    teamAccessCode: 'NEXUS-4B9Q',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 98,
    progress: 88,
    currentMilestone: 'Sprint 6: Mainnet Test Deploy & Verifier Portal Audit',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 90),
    team: {
      name: 'BlockNexus Team',
      leader: {
        name: 'Varun Krishnan',
        email: 'varun.it@projectnexus.edu'
      },
      members: [
        { name: 'Ayesha Siddiqua', email: 'ayesha.it@projectnexus.edu' },
        { name: 'Rohan Deshmukh', email: 'rohan.it@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Smart Contract Audit Passed',
        description: 'Zero high-severity vulnerabilities found in automated MythX audit run.',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        type: 'milestone'
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects from database.');

    // Insert only the 3 desired projects
    const inserted = await Project.insertMany(activeProjects);
    console.log(`✅ Successfully seeded ${inserted.length} clean projects into database:`);
    console.log(inserted.map(p => `${p.projectId}: ${p.title}`));

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
