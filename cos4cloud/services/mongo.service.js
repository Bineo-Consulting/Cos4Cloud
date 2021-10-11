let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    console.log('CACHED: connectToDatabase')
    return cachedDb;
  }
  const MongoClient = require('mongodb').MongoClient;
  const MONGODB_URI = 'mongodb+srv://c4c:PDE719b7ukyfs5DN@cluster0.rbcyx.mongodb.net/myFirstDatabase';
  const client = await MongoClient.connect(MONGODB_URI);
  // Specify which database we want to use
  const db = await client.db('c4c');
  cachedDb = db;
  return db;
}

exports.get = async (ref, id) => {
  const db = await connectToDatabase();

  if (id) {
    const data = await db.collection(ref).findOne({_id: id})
    return data;
  } else {
    const data = await db.collection(ref).find({}).limit(32).toArray();
    return data;
  }
};

exports.update = async (ref, data) => {
  const db = await connectToDatabase();
  const aux = await db.collection('users').findOneAndUpdate({ _id: data.id }, { $set: { ...data } }, { upsert: true })
  return aux.value
}
