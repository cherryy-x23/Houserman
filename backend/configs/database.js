const mongoose = require('mongoose');

const initDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_CONNECTION);
    console.log(`Database linked successfully: ${connection.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('Database link lost. Attempting reconnect...');
    });

    mongoose.connection.on('error', (e) => {
      console.error('Database error:', e.message);
    });
  } catch (e) {
    console.error('Database link failed:', e.message);
    setTimeout(initDatabase, 5000);
  }
};

module.exports = initDatabase;
