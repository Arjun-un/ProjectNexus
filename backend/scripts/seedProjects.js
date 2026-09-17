/**
 * Seed Script for Projects
 * Populates realistic college projects across Software, IoT, and Hardware.
 * Usage: node scripts/seedProjects.js
 */

const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Force Google DNS to bypass institutional/college DNS blocks on Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Project = require('../models/Project');

const sampleProjects = [
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
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
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
        description: 'Sprint 3 Face Vector Matching passed faculty review with 99.2% accuracy on validation set.',
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
    description: 'Multi-axis accelerometer node monitoring high-voltage industrial motors with LoRaWAN wireless telemetry and cloud anomaly detection.',
    componentsRequired: ['STM32 Nucleo-F446RE', 'MPU-6050 6-DoF Accelerometer', 'SX1276 LoRa Transceiver', 'Thermocouple MAX6675', 'LiPo Battery Management Circuit'],
    labAssigned: 'Advanced Embedded Systems & Sensors Lab (Room 304)',
    teamAccessCode: 'NEXUS-3W8L',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'At Risk',
    health: 'Critical',
    healthScore: 36,
    progress: 24,
    currentMilestone: 'Hardware Bring-up & Sensor Calibration (Overdue)',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9), // 9 days inactive
    team: {
      name: 'VibroSense Tech',
      leader: {
        name: 'Rohan Sharma',
        email: 'rohan.sharma@projectnexus.edu'
      },
      members: [
        { name: 'Ananya Roy', email: 'ananya.roy@projectnexus.edu' },
        { name: 'Vivek Joshi', email: 'vivek.joshi@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Health Warning: Milestone Delayed',
        description: 'Component calibration delayed by 11 days. LoRa gateway packet loss exceeds 45%. Admin review triggered.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        type: 'alert'
      },
      {
        title: 'Team Access Code Claimed',
        description: 'VibroSense Tech claimed access code NEXUS-3W8L.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
        type: 'team_join'
      },
      {
        title: 'Project Initialized',
        description: 'Allocated to Advanced Embedded Systems Lab.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        type: 'creation'
      }
    ]
  },
  {
    projectId: 'MECH-2026-077',
    title: 'Automated 5-Axis Robotic Arm for Surface SMD Soldering',
    category: 'Hardware',
    department: 'Mechanical Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Prof. David Vance',
    deadline: new Date('2026-05-20'),
    priority: 'Medium',
    description: 'Precision inverse kinematics mechanical arm with computer vision guidance for micro-soldering dense PCB surface mount ICs.',
    componentsRequired: ['NEMA 17 Stepper Motors (x5)', 'TMC2209 SilentStep Drivers', '3D Printed Carbon-Nylon Joints', 'Stereo Microscope Camera', 'Custom G-Code CNC Controller'],
    labAssigned: 'Robotics Fabrication & Mechatronics Bay 2',
    teamAccessCode: 'NEXUS-8M2Y',
    isAccessCodeClaimed: false,
    accessCodeStatus: 'active',
    status: 'Pending Approval',
    health: 'Moderate',
    healthScore: 68,
    progress: 10,
    currentMilestone: 'Team Onboarding & Access Code Distribution',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    team: {
      name: '',
      leader: { name: '', email: '' },
      members: []
    },
    timeline: [
      {
        title: 'Access Code Generated',
        description: 'Access Code NEXUS-8M2Y ready to be shared with prospective student team leader.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        type: 'creation'
      },
      {
        title: 'Hardware Spec Approved',
        description: 'Departmental curriculum committee approved fabrication budget in Mechatronics Bay 2.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
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
    description: 'Ethereum L2 smart contracts issuing cryptographically verifiable student transcripts and degree hashes with zero-knowledge privacy proof.',
    techStack: ['Solidity', 'Hardhat', 'Next.js', 'Ethers.js', 'IPFS', 'TypeScript'],
    teamAccessCode: 'NEXUS-4B9Q',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 98,
    progress: 82,
    currentMilestone: 'Zero-Knowledge Proof Verifier Deployment on Sepolia Testnet',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    team: {
      name: 'BlockNexus Team',
      leader: {
        name: 'Gaurav Kulkarni',
        email: 'gaurav.kulkarni@projectnexus.edu'
      },
      members: [
        { name: 'Divya Soni', email: 'divya.soni@projectnexus.edu' },
        { name: 'Aditya Nair', email: 'aditya.nair@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Smart Contract Audit Passed',
        description: 'Automated Slither security scan completed with 0 high severity vulnerabilities.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        type: 'milestone'
      },
      {
        title: 'Weekly Progress Submitted',
        description: 'Team submitted weekly progress update with live Sepolia explorer contract link.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        type: 'milestone'
      }
    ]
  },
  {
    projectId: 'EEE-2026-015',
    title: 'Campus Smart Microgrid Renewable Balancing Controller',
    category: 'IoT',
    department: 'Electrical & Electronics',
    academicYear: '2025-2026',
    facultyGuide: 'Prof. Sundar Rajan',
    deadline: new Date('2026-05-30'),
    priority: 'High',
    description: 'Real-time solar inverter load shedding and battery storage balancing controller interfacing via Modbus RTU and MQTT telemetry.',
    componentsRequired: ['Raspberry Pi 4B', 'Modbus RTU to RS485 Shield', 'Current Transformers SCT-013', 'Solid State Relays 40A', 'Grafana Dashboard Node'],
    labAssigned: 'Power Electronics & Renewable Energy Lab (Room 112)',
    teamAccessCode: 'NEXUS-6K4P',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 89,
    progress: 54,
    currentMilestone: 'Solar PV Array Load Profiling & Modbus Polling Loop',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 18),
    team: {
      name: 'GridPulse Dynamics',
      leader: {
        name: 'Harish Varma',
        email: 'harish.varma@projectnexus.edu'
      },
      members: [
        { name: 'Kavita Menon', email: 'kavita.menon@projectnexus.edu' },
        { name: 'Rahul Bose', email: 'rahul.bose@projectnexus.edu' },
        { name: 'Tanya Sen', email: 'tanya.sen@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Telemetry Feed Live',
        description: 'MQTT broker established streaming power metrics every 500ms.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
        type: 'milestone'
      }
    ]
  },
  {
    projectId: 'MECH-2026-092',
    title: 'Subsea Autonomous ROV for Acoustic Pipeline Flaw Detection',
    category: 'Hardware',
    department: 'Mechanical Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Anand Venkat',
    deadline: new Date('2026-04-18'),
    priority: 'High',
    description: 'Submersible remote operated vehicle with 30-meter depth rating, ultrasonic non-destructive testing probe, and onboard thruster PID stabilization.',
    componentsRequired: ['BlueRobotics T200 Thrusters (x4)', 'Pixhawk 4 Flight Controller', 'Ultrasonic Thickness Gauge', 'Acrylic Pressure Hull', 'Tether Reel System'],
    labAssigned: 'Fluid Mechanics & Hydrodynamics Testing Basin',
    teamAccessCode: 'NEXUS-5R7T',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'At Risk',
    health: 'At Risk',
    healthScore: 49,
    progress: 32,
    currentMilestone: 'Pressure Hull Seal Integrity Testing at 3 Atmospheres',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    team: {
      name: 'Aquanaut Robotics',
      leader: {
        name: 'Siddharth Nair',
        email: 'siddharth.nair@projectnexus.edu'
      },
      members: [
        { name: 'Pooja Hegde', email: 'pooja.hegde@projectnexus.edu' }
      ]
    },
    timeline: [
      {
        title: 'Seal Flange Micro-Leak Detected',
        description: 'Test dive revealed minor seal seepage at 2.2 bar pressure. Rework of O-ring groove required.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        type: 'alert'
      }
    ]
  },
  {
    projectId: 'CSE-2026-118',
    title: 'Autonomous Multi-Agent Compiler Optimization Framework',
    category: 'Software',
    department: 'Computer Science & Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Robert Chen',
    deadline: new Date('2026-05-10'),
    priority: 'Low',
    description: 'Reinforcement learning LLVM intermediate representation pass scheduler discovering domain-specific loop vectorization heuristics.',
    techStack: ['C++20', 'LLVM 18', 'PyTorch', 'Rust', 'Linux Perf'],
    teamAccessCode: 'NEXUS-1Z9V',
    isAccessCodeClaimed: false,
    accessCodeStatus: 'active',
    status: 'Active',
    health: 'Good',
    healthScore: 90,
    progress: 15,
    currentMilestone: 'LLVM Custom Pass Infrastructure Setup',
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 36),
    team: {
      name: '',
      leader: { name: '', email: '' },
      members: []
    },
    timeline: [
      {
        title: 'Project Initialized',
        description: 'Team Access Code NEXUS-1Z9V generated for CSE department candidates.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
        type: 'creation'
      }
    ]
  }
];

const seedProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing projects to prevent duplicates
    await Project.deleteMany({});
    console.log('🧹 Cleaned existing projects collection');

    // Insert rich sample projects
    const inserted = await Project.insertMany(sampleProjects);
    console.log(`🎉 Successfully seeded ${inserted.length} projects!`);

    inserted.forEach(p => {
      console.log(`   [${p.category.padEnd(8)}] ${p.projectId} | ${p.title.substring(0, 40)}... | Code: ${p.teamAccessCode} (${p.isAccessCodeClaimed ? 'Claimed' : 'Unassigned'})`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Project Seed Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedProjects();
