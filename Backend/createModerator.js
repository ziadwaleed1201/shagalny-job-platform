// Creates ONE moderator account. Adds no other data. Safe to re-run.
// Run from the Backend folder:  node createModerator.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Moderator = require('./models/Moderator');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shagalny';

const MOD = {
  fullName: 'Site Moderator',
  email: 'mod@shagalny.eg',
  password: 'mod12345',
  phone: '+201000000002',
};

(async () => {
  await mongoose.connect(MONGO_URI);

  let user = await User.findOne({ email: MOD.email });
  if (user) {
    console.log(`Moderator user "${MOD.email}" already exists. Nothing created.`);
  } else {
    // Plain password on purpose: the User model's pre-save hook hashes it.
    user = await User.create({
      fullName: MOD.fullName,
      email: MOD.email,
      password: MOD.password,
      phone: MOD.phone,
      role: 'moderator',
      accountStatus: 'active',
    });
    console.log('Created moderator user.');
  }

  const hasProfile = await Moderator.findOne({ user: user._id });
  if (!hasProfile) {
    await Moderator.create({ user: user._id });
    console.log('Created moderator profile.');
  }

  console.log('\nModerator login:');
  console.log(`  ${MOD.email} / ${MOD.password}`);

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
