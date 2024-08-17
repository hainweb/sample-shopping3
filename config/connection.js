const { MongoClient } = require('mongodb');
const state = { db: null };

let db = null;

module.exports = {
  connect: (callback) => {
    const url = 'mongodb+srv://hainofficialweb:0wCqDqaj0vQO28oD@samle-shopping.f5two.mongodb.net/?retryWrites=true&w=majority&appName=samle-shopping';
    const dbname = 'shopping';

    MongoClient.connect(url, { useUnifiedTopology: true })
      .then((client) => {
        db = client.db(dbname);
        console.log("Database connected");
        callback();
      })
      .catch((err) => {
        console.error("Database connection failed", err);
        callback(err);
      });
  },
  
  get: () => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  }
};