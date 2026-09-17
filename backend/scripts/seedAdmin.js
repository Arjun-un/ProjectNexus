/**
 * Admin Seed Script
 * Run once to create the default admin account in the database.
 * 
 * Usage: node scripts/seedAdmin.js
 * 
 * Default credentials:
 *   Email:    admin@projectnexus.edu
 *   Password: Admin@123
 */

const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Force Google DNS to bypass college/institutional DNS blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@projectnexus.edu' });

    if (existingAdmin) {
      console.log('ℹ️  Admin account already exists:');
      console.log(`   Name:  ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role:  ${existingAdmin.role}`);
      console.log('\n   No changes made. Use existing credentials to log in.');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'System Administrator',
        email: 'admin@projectnexus.edu',
        passwordHash: 'Admin@123', // Will be hashed by the pre-save hook
        role: 'admin',
        department: 'Administration',
        isActive: true
      });

      console.log('🎉 Admin account created successfully!');
      console.log('───────────────────────────────────');
      console.log(`   Name:     ${admin.name}`);
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Role:     ${admin.role}`);
      console.log(`   Password: Admin@123`);
      console.log('───────────────────────────────────');
      console.log('\n   Use these credentials to log into the Admin Dashboard.');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
