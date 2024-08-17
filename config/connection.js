const { MongoClient } = require('mongodb');
const state = { db: null };

module.exports.connect = async function (done) {
  const url = 'mongodb+srv://hainofficialweb:0wCqDqaj0vQO28oD@samle-shopping.f5two.mongodb.net/?retryWrites=true&w=majority&appName=samle-shopping';
  const dbname = 'shopping';

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    state.db = client.db(dbname);
    done();
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    done(err);
  }
};

module.exports.get = function () {
  return state.db;
};
