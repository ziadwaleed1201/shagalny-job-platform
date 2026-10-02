// Wipes the entire Shagalny database so you can import fresh test data.
// Run from the Backend folder:  node wipeDb.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shagalny';
  await mongoose.connect(uri);
  const name = mongoose.connection.name;

  // List collections first so you can see exactly what is being removed.
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log(`Database "${name}" has ${cols.length} collection(s):`);
  cols.forEach((c) => console.log('  - ' + c.name));

  await mongoose.connection.dropDatabase();

  console.log(`\n\u2713 Done. Database "${name}" is now completely empty.`);
  console.log('  Collections and indexes will be rebuilt automatically the next');
  console.log('  time the backend writes data, so no other setup is needed.');

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Wipe failed:', err.message);
  process.exit(1);
});
