// ProjectNexus Mock Data Store - Aligned with the Master Plan & MERN MVP Requirements

export const initialProjects = [
  {
    id: "proj-101",
    title: "Smart Attendance System using Edge Vision",
    problemStatement: "Manual classroom attendance is prone to proxy signing and consumes 10-15 minutes of lecture time. This project deploys an on-device facial recognition system on edge hardware.",
    description: "Multi-camera real-time facial verification platform with automatic SIS integration and anti-spoofing detection.",
    category: "Computer Vision & IoT",
    department: "Computer Science & Engineering",
    techStack: ["React", "Node.js", "Python", "OpenCV", "PyTorch", "MongoDB"],
    currentVersionNumber: 2,
    isContinuation: true,
    status: "active",
    currentProgress: 62,
    githubUrl: "https://github.com/nexus-college/smart-attendance-system",
    githubStats: {
      repoName: "smart-attendance-system",
      stars: 14,
      commitsCount: 42,
      lastCommitMessage: "feat: edge camera pipeline optimization and anti-spoofing",
      lastCommitDate: "2026-08-30T14:22:00Z",
      contributors: 4
    },
    team: {
      name: "Team Beta (Continuation)",
      lead: { name: "Aarav Sharma", email: "aarav.s@college.edu", rollNo: "CS23B104" },
      members: [
        { name: "Priya Patel", email: "priya.p@college.edu", rollNo: "CS23B108", tasksAssigned: 3 },
        { name: "Rahul Verma", email: "rahul.v@college.edu", rollNo: "CS23B112", tasksAssigned: 2 },
        { name: "Sneha Nair", email: "sneha.n@college.edu", rollNo: "CS23B119", tasksAssigned: 2 }
      ]
    },
    previousTeam: {
      name: "Team Alpha (Original)",
      version: 1,
      discontinuedAt: 45,
      reason: "Lead transferred institution; 2 members shifted to elective research project.",
      discontinuedDate: "2026-06-15"
    },
    lastUpdateDaysAgo: 2,
    lastUpdateDate: "2026-08-30",
    expectedEndDate: "2026-11-30",
    hasOverdueMilestones: false
  },
  {
    id: "proj-102",
    title: "Autonomous Campus Delivery Drone",
    problemStatement: "Internal campus package transit (lab samples, documents) is slow and manual across large university grounds.",
    description: "GPS-waypoint guided UAV with collision avoidance and payload security mechanism for inter-department deliveries.",
    category: "Robotics & Embedded Systems",
    department: "Electronics & Communication",
    techStack: ["ROS 2", "C++", "Python", "PX4 Autopilot", "Gazebo"],
    currentVersionNumber: 1,
    isContinuation: false,
    status: "active",
    currentProgress: 75,
    githubUrl: "https://github.com/nexus-college/autonomous-campus-drone",
    githubStats: {
      repoName: "autonomous-campus-drone",
      stars: 28,
      commitsCount: 89,
      lastCommitMessage: "fix: obstacle avoidance lidar point cloud filter",
      lastCommitDate: "2026-08-31T09:15:00Z",
      contributors: 4
    },
    team: {
      name: "AeroPulse Tech",
      lead: { name: "Vikram Malhotra", email: "vikram.m@college.edu", rollNo: "EC23B045" },
      members: [
        { name: "Ananya Iyer", email: "ananya.i@college.edu", rollNo: "EC23B050", tasksAssigned: 4 },
        { name: "Kiran Das", email: "kiran.d@college.edu", rollNo: "EC23B062", tasksAssigned: 3 }
      ]
    },
    lastUpdateDaysAgo: 1,
    lastUpdateDate: "2026-08-31",
    expectedEndDate: "2026-10-15",
    hasOverdueMilestones: false
  },
  {
    id: "proj-103",
    title: "AI Health Diagnostic Assistant for Rural Clinics",
    problemStatement: "Primary healthcare centres in rural districts lack radiologist access for chest X-ray screening.",
    description: "Deep learning based mobile-first decision support tool for rapid pneumonia and tuberculosis screening from digital radiographs.",
    category: "Healthcare AI",
    department: "Computer Science & Engineering",
    techStack: ["TensorFlow", "React Native", "FastAPI", "PostgreSQL"],
    currentVersionNumber: 1,
    isContinuation: false,
    status: "active",
    currentProgress: 35,
    githubUrl: "https://github.com/nexus-college/rural-ai-diagnostics",
    githubStats: {
      repoName: "rural-ai-diagnostics",
      stars: 9,
      commitsCount: 22,
      lastCommitMessage: "wip: dataset augmentations",
      lastCommitDate: "2026-08-21T18:00:00Z",
      contributors: 3
    },
    team: {
      name: "MediVision Lab",
      lead: { name: "Rohan Gupta", email: "rohan.g@college.edu", rollNo: "CS23B088" },
      members: [
        { name: "Divya Singh", email: "divya.s@college.edu", rollNo: "CS23B092", tasksAssigned: 2 }
      ]
    },
    lastUpdateDaysAgo: 11, // STAGNANT ALERT (>= 7 days)
    lastUpdateDate: "2026-08-21",
    expectedEndDate: "2026-12-10",
    hasOverdueMilestones: true
  },
  {
    id: "proj-104",
    title: "Decentralized Academic Credential Verification",
    problemStatement: "Fake certificate fraud and lengthy transcript verification processes burden college registrar offices.",
    description: "Polygon blockchain smart contract infrastructure for verifiable tamper-proof degree and grade-sheet issuance.",
    category: "Blockchain & Security",
    department: "Information Technology",
    techStack: ["Solidity", "Ethers.js", "React", "IPFS", "Node.js"],
    currentVersionNumber: 1,
    isContinuation: false,
    status: "pending_approval",
    currentProgress: 10,
    githubUrl: "https://github.com/nexus-college/decentral-credentials",
    githubStats: {
      repoName: "decentral-credentials",
      stars: 5,
      commitsCount: 8,
      lastCommitMessage: "init: smart contracts for soulbound tokens",
      lastCommitDate: "2026-08-28T11:45:00Z",
      contributors: 3
    },
    team: {
      name: "ChainAuth Group",
      lead: { name: "Nikhil Joshi", email: "nikhil.j@college.edu", rollNo: "IT23B014" },
      members: [
        { name: "Meera Menon", email: "meera.m@college.edu", rollNo: "IT23B022", tasksAssigned: 1 }
      ]
    },
    lastUpdateDaysAgo: 4,
    lastUpdateDate: "2026-08-28",
    expectedEndDate: "2026-11-20",
    hasOverdueMilestones: false
  },
  {
    id: "proj-105",
    title: "IoT Smart Campus Energy Optimizer",
    problemStatement: "High idle electricity wastage in classrooms, labs, and auditoriums during non-operational hours.",
    description: "PIR motion + ambient lux sensor grid driving smart relays with automated HVAC scheduling and energy analytics dashboard.",
    category: "IoT & Sustainable Tech",
    department: "Electrical & Electronics",
    techStack: ["ESP32", "MQTT", "Node.js", "InfluxDB", "Grafana"],
    currentVersionNumber: 1,
    isContinuation: false,
    status: "completed",
    currentProgress: 100,
    githubUrl: "https://github.com/nexus-college/iot-energy-optimizer",
    githubStats: {
      repoName: "iot-energy-optimizer",
      stars: 31,
      commitsCount: 94,
      lastCommitMessage: "release: v1.0 final pilot report and PCB schematics",
      lastCommitDate: "2026-07-15T16:30:00Z",
      contributors: 4
    },
    team: {
      name: "VoltGuard Engineers",
      lead: { name: "Tanvi Kulkarni", email: "tanvi.k@college.edu", rollNo: "EE23B033" },
      members: [
        { name: "Suresh Babu", email: "suresh.b@college.edu", rollNo: "EE23B039", tasksAssigned: 0 }
      ]
    },
    lastUpdateDaysAgo: 45,
    lastUpdateDate: "2026-07-15",
    expectedEndDate: "2026-07-15",
    hasOverdueMilestones: false
  }
];

export const initialTasks = [
  {
    id: "task-1",
    projectId: "proj-101",
    version: 2,
    title: "Optimize Face Recognition Inference Speed on Jetson Nano",
    description: "Profile OpenCV DNN vs TensorRT backend to achieve >15 FPS on 4 concurrent streams.",
    status: "in_progress",
    priority: "high",
    assignee: "Aarav Sharma",
    assigneeAvatar: "AS",
    dueDate: "2026-09-10",
    milestoneId: "m3",
    weight: 1
  },
  {
    id: "task-2",
    projectId: "proj-101",
    version: 2,
    title: "Implement Anti-Spoofing Liveness Detection Filter",
    description: "Prevent photo/screen proxy attacks using texture analysis & eye-blink verification model.",
    status: "under_review",
    priority: "high",
    assignee: "Priya Patel",
    assigneeAvatar: "PP",
    dueDate: "2026-09-08",
    milestoneId: "m3",
    weight: 1
  },
  {
    id: "task-3",
    projectId: "proj-101",
    version: 2,
    title: "REST API Endpoint for Daily Attendance Aggregation",
    description: "Express endpoint to calculate student attendance percentages and flag continuous absentees.",
    status: "done",
    priority: "medium",
    assignee: "Rahul Verma",
    assigneeAvatar: "RV",
    dueDate: "2026-08-25",
    milestoneId: "m2",
    weight: 1
  },
  {
    id: "task-4",
    projectId: "proj-101",
    version: 2,
    title: "Database Indexing for 5000+ Student Face Embeddings",
    description: "Set up pgvector / FAISS vector similarity search for millisecond 1:N face identification.",
    status: "done",
    priority: "medium",
    assignee: "Sneha Nair",
    assigneeAvatar: "SN",
    dueDate: "2026-08-28",
    milestoneId: "m2",
    weight: 1
  },
  {
    id: "task-5",
    projectId: "proj-101",
    version: 2,
    title: "Design Faculty Mobile Push Notification for Absentee Alerts",
    description: "Create WebPush / FCM integration when a student misses 3 consecutive lab sessions.",
    status: "todo",
    priority: "low",
    assignee: "Rahul Verma",
    assigneeAvatar: "RV",
    dueDate: "2026-09-20",
    milestoneId: "m4",
    weight: 1
  },
  {
    id: "task-6",
    projectId: "proj-101",
    version: 2,
    title: "Dockerize Camera Stream Ingestion Service",
    description: "Create lightweight Dockerfile and docker-compose script for edge node deployment.",
    status: "todo",
    priority: "medium",
    assignee: "Aarav Sharma",
    assigneeAvatar: "AS",
    dueDate: "2026-09-18",
    milestoneId: "m3",
    weight: 1
  }
];

export const initialMilestones = [
  {
    id: "m1",
    title: "Milestone 1: SRS & System Architecture Definition",
    dueDate: "2026-06-30",
    status: "approved",
    progress: 100,
    adminFeedback: "Architecture approved by HOD Dr. Raman. Clear separation of edge capture and central SIS DB.",
    completedInVersion: 1
  },
  {
    id: "m2",
    title: "Milestone 2: Face Embeddings Model & Backend APIs",
    dueDate: "2026-08-20",
    status: "approved",
    progress: 100,
    adminFeedback: "Solid accuracy benchmarks demonstrated on the department test dataset (98.2%).",
    completedInVersion: 2
  },
  {
    id: "m3",
    title: "Milestone 3: Realtime Edge Camera Ingestion & Liveness",
    dueDate: "2026-09-15",
    status: "in_progress",
    progress: 60,
    adminFeedback: "Ensure anti-spoofing tests include low-light classroom conditions.",
    completedInVersion: 2
  },
  {
    id: "m4",
    title: "Milestone 4: Full Institutional Pilot & Faculty Dashboard",
    dueDate: "2026-10-30",
    status: "pending",
    progress: 0,
    adminFeedback: "Scheduled for live testing across CS Labs 1 & 2.",
    completedInVersion: 2
  }
];

export const initialWeeklyUpdates = [
  {
    id: "upd-1",
    weekNumber: 4,
    date: "2026-08-30",
    submittedBy: "Aarav Sharma (Team Lead)",
    completedWork: "Integrated FaceNet 512-dim embedding extractor with MongoDB vector storage. Successfully tested 1:N matching across 250 registered test students.",
    blockers: "Occasional frame drop during RTSP stream decode when running on battery-powered edge kit.",
    nextPlan: "Benchmark TensorRT model quantisation (FP16) and complete the Anti-Spoofing pipeline review.",
    currentProgress: 62,
    docLink: "https://nexus-college.edu/docs/smart-attendance-week4-benchmarks.pdf"
  },
  {
    id: "upd-2",
    weekNumber: 3,
    date: "2026-08-23",
    submittedBy: "Aarav Sharma (Team Lead)",
    completedWork: "Finished backend REST APIs for student registration, attendance aggregation, and course timetable mapping.",
    blockers: "Awaiting sample CCTV RTSP feed credentials from campus IT department.",
    nextPlan: "Implement database indexing and begin live camera stream ingest testing.",
    currentProgress: 54,
    docLink: "https://nexus-college.edu/docs/smart-attendance-api-docs.pdf"
  },
  {
    id: "upd-3",
    weekNumber: 2,
    date: "2026-08-16",
    submittedBy: "Aarav Sharma (Team Lead)",
    completedWork: "Team Beta onboarded into Continuation Workspace. Reviewed Team Alpha's code, fixed broken PyTorch environment dependencies, and tested base camera pipeline.",
    blockers: "None. Previous handover notes were comprehensive.",
    nextPlan: "Build backend REST endpoints for attendance records.",
    currentProgress: 48,
    docLink: ""
  }
];

export const flagshipHandoverRecord = {
  projectId: "proj-101",
  fromVersion: 1,
  toVersion: 2,
  fromTeamName: "Team Alpha (Original)",
  toTeamName: "Team Beta (Continuation)",
  discontinuationReason: "Lead transferred institution; remaining members assigned to high-priority departmental research.",
  transferDate: "2026-06-15",
  progressAtHandover: 45,
  completedModules: [
    "Core Project Requirements Specification & Database Schema (PostgreSQL/MongoDB)",
    "Face Enrollment Frontend UI (Student profile picture upload & preprocessing)",
    "Base PyTorch FaceNet embedding model integration (accuracy ~94%)",
    "Department Classroom Layout & Camera Hardware Specification"
  ],
  pendingModules: [
    "Anti-Spoofing & Liveness Detection (Prevents photo/screen spoofing)",
    "Edge optimization (TensorRT/ONNX Runtime for real-time 15+ FPS)",
    "Faculty Attendance Review Dashboard & PDF Generation",
    "Live RTSP Video Stream Ingestion Pipeline"
  ],
  knownIssues: [
    "Memory leak in RTSP stream ingestion when stream reconnects after WiFi drop",
    "Model inference drops to 4 FPS on CPU-only machines (Jetson GPU acceleration required)",
    "Need to normalize lighting conditions for cameras placed near classroom windows"
  ],
  facultyGuidanceNotes: "Team Alpha made solid headway on the core computer vision pipeline. The incoming Team Beta should not rewrite the ML model from scratch; instead, focus immediately on the Anti-Spoofing module and edge inference optimizations. Hardware kit is stored in CS Lab 3, Shelf B.",
  githubUrl: "https://github.com/nexus-college/smart-attendance-system",
  documents: [
    { title: "Team Alpha SRS & Architecture Doc v1.2", url: "https://nexus-college.edu/docs/v1-srs.pdf" },
    { title: "Dataset Training Log & Validation Curves", url: "https://nexus-college.edu/docs/v1-training-log.pdf" },
    { title: "Hardware Bill of Materials & Pinouts", url: "https://nexus-college.edu/docs/v1-hardware-bom.pdf" }
  ]
};

export const initialActivityLogs = [
  {
    id: "act-1",
    action: "TASK_MOVED",
    user: "Priya Patel",
    details: "Moved 'Implement Anti-Spoofing Liveness Detection' from In Progress to Under Review",
    time: "2 hours ago"
  },
  {
    id: "act-2",
    action: "WEEKLY_UPDATE",
    user: "Aarav Sharma",
    details: "Submitted Week 4 Progress Update (Progress reached 62%)",
    time: "2 days ago"
  },
  {
    id: "act-3",
    action: "TASK_COMPLETED",
    user: "Rahul Verma",
    details: "Completed task 'REST API Endpoint for Daily Attendance Aggregation'",
    time: "3 days ago"
  },
  {
    id: "act-4",
    action: "CONTINUATION_ASSIGNED",
    user: "Admin (Dr. Mehta)",
    details: "Assigned Team Beta to continuation project 'Smart Attendance System (v2.0)'",
    time: "18 days ago"
  },
  {
    id: "act-5",
    action: "HANDOVER_GENERATED",
    user: "Admin (Dr. Mehta)",
    details: "Generated Handover Packet for Team Alpha (discontinued at 45% completion)",
    time: "20 days ago"
  }
];
