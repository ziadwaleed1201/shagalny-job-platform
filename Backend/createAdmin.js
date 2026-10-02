// Creates ONE admin account so you can reach the admin panel.
// Adds no other data. Safe to re-run.
// Run from the Backend folder:  node createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shagalny';

const ADMIN = {
  fullName: 'Site Admin',
  email: 'admin@shagalny.eg',
  password: 'admin1234',
  phone: '+201000000001',
};

(async () => {
  await mongoose.connect(MONGO_URI);

  let user = await User.findOne({ email: ADMIN.email });
  if (user) {
    console.log(`Admin user "${ADMIN.email}" already exists. Nothing created.`);
  } else {
    // Plain password on purpose: the User model's pre-save hook hashes it,
    // which is why we use User.create (not insertMany).
    user = await User.create({
      fullName: ADMIN.fullName,
      email: ADMIN.email,
      password: ADMIN.password,
      phone: ADMIN.phone,
      role: 'admin',
      accountStatus: 'active',
    });
    console.log('Created admin user.');
  }

  // Make sure the Admin profile row exists for this user.
  const hasProfile = await Admin.findOne({ user: user._id });
  if (!hasProfile) {
    await Admin.create({ user: user._id });
    console.log('Created admin profile.');
  }

  console.log('\nAdmin login:');
  console.log(`  ${ADMIN.email} / ${ADMIN.password}`);

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
