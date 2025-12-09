const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ONE-TIME SETUP ROUTE - DELETE AFTER USE
router.post('/create-admin', async (req, res) => {
  try {
    const { setupKey } = req.body;
    
    // Security check - use a secret key
    if (setupKey !== process.env.SETUP_SECRET) {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@saylani.org' });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin user already exists!',
        email: 'admin@saylani.org'
      });
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = new User({
      cnic: '12345-1234567-1',
      email: 'admin@saylani.org',
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
      isFirstLogin: false,
      phoneNumber: '+92-21-111-729-526',
      address: {
        street: 'Main Office',
        city: 'Karachi',
        country: 'Pakistan',
        zipCode: '75000'
      }
    });

    await admin.save();

    res.status(201).json({
      message: '✅ Admin user created successfully!',
      email: 'admin@saylani.org',
      password: 'Admin@123',
      warning: '⚠️ DELETE THIS ENDPOINT IMMEDIATELY and change the password!'
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
