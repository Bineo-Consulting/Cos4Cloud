let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
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

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
const get = async (ref, id, opts) => {
  const db = await connectToDatabase();

  if (id) {
    const data = await db.collection(ref).findOne({ _id: id })
    return data;
  } else {
    const data = await db.collection(ref).find(opts || {}).sort({ created_at: -1 }).limit(64).toArray();
    return data;
  }
}
exports.get = get
exports.update = update = async (ref, data) => {
  const db = await connectToDatabase();
  if (data.id) {
    delete data.created_at
    const aux = await db.collection(ref).findOneAndUpdate({ _id: data.id }, { $set: { ...data }, $setOnInsert: { created_at: new Date() } }, { upsert: true })
    return aux.value    
  } else {
    delete data.created_at
    const aux = await db.collection(ref).insert({...data, created_at: new Date()})
    return aux.value  
  }
}
exports.update = update

exports.delete = async (ref, id) => {
  const db = await connectToDatabase();

  const aux = await db.collection(ref).remove({ _id: id || null })
  return aux.value
}

const pad2 = s => String(s).padStart(2, '0')
const padYear2 = y => String(y).padStart(2, '0').slice(-2)
const getMonth = (d, n) => (new Date(new Date().setMonth(d.getMonth() - (n || 0)))).getMonth() + 1
const getYear = (d, n) => (new Date(new Date().setMonth(d.getMonth() - (n || 0)))).getFullYear()

const getDay = (d, n) => (new Date(new Date().setDate(d.getDate() - (n || 0)))).getDate()

const getLast12M = (() => {
  const d = new Date()
  const loop = [...new Array(12)]

  const aux = {}
  loop.forEach((_, n) => {
    aux[`${pad2(getMonth(d, 11 - n))}/${padYear2(getYear(d, 11 - n))}`] = 0
  })
  return aux
})()

const getLast30d = (() => {
  const d = new Date()
  const loop = [...new Array(30)]

  const aux = {}
  loop.forEach((_, n) => {
    aux[`${pad2(getDay(d, 29 - n))}/${pad2(getMonth(d, 29 - n))}`] = 0
  })
  return aux
})()

// const total = await db.collection('users').countDocuments();
exports.agg = async (ref, params) => {
  const db = await connectToDatabase();
  const aux = {last12M: {}, last30d: {}}

  const today = new Date()
  const last30d = new Date(new Date().setDate(today.getDate() - 30))
  const last12M = new Date(new Date().setMonth(today.getMonth() - 12))

  const query = params.user_id ? {user_id: params.user_id} : {}

  const items12M = await db.collection(ref).find({ created_at: {$gte: last12M}, ...query }).toArray();
  const items30d = items12M.filter(i => new Date(i.created_at) >= last30d)

  if (ref === 'comments') {
    const originsAgg = await db.collection(ref).aggregate([
      { $match: query },
      { $group: { _id: '$origin', count: { $sum: 1 } } },
    ]).toArray();

    aux.origins = [ ...originsAgg ]

    const p = [
      db.collection(ref).countDocuments({ type: 'comment', ...query }),
      db.collection(ref).countDocuments({ type: 'identification', ...query })
    ]
    const [commentsCount, identificationsCount] = await Promise.all(p)
    aux.comments_count = commentsCount
    aux.identifications_count = identificationsCount

    aux.last12M.comments = aux.last12M.comments || { ...getLast12M } 
    aux.last12M.identifications = aux.last12M.identifications || { ...getLast12M }
    aux.last30d.comments = aux.last30d.comments || { ...getLast30d } 
    aux.last30d.identifications = aux.last30d.identifications || { ...getLast30d }

    items12M.filter(i => !i.taxon).map(item => {
      const d = new Date(item.created_at)
      const key = `${pad2(getMonth(d))}/${padYear2(getYear(d))}`
      aux.last12M.comments[key] = aux.last12M.comments[key] || 0
      aux.last12M.comments[key] += 1
    })
    items12M.filter(i => i.taxon).map(item => {
      const d = new Date(item.created_at)
      const key = `${pad2(getMonth(d))}/${padYear2(getYear(d))}`
      aux.last12M.identifications[key] = aux.last12M.identifications[key] || 0
      aux.last12M.identifications[key] += 1
    })

    items30d.filter(i => !i.taxon).map(item => {
      const d = new Date(item.created_at)
      const key = `${d.getDate()}/${pad2(getMonth(d))}`
      aux.last30d.comments[key] = aux.last30d.comments[key] || 0
      aux.last30d.comments[key] += 1
    })
    items30d.filter(i => i.taxon).map(item => {
      const d = new Date(item.created_at)
      const key = `${d.getDate()}/${pad2(getMonth(d))}}`
      aux.last30d.identifications[key] = aux.last30d.identifications[key] || 0
      aux.last30d.identifications[key] += 1
    })
  } else {
    aux.last12M = { ...getLast12M }
    aux.last30d = { ...getLast30d }

    aux[`${ref}_count`] = await db.collection(ref).countDocuments({ ...query })

    if (ref === 'downloads') {
      const reasonsAgg = await db.collection(ref).aggregate([
        { $match: query },
        { $unwind: { path: '$reason', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$reason', count: { $sum: 1 } } }
      ]).toArray();

      aux.reasons = [ ...reasonsAgg ]
    }

    if (ref === 'users') {
      const professionAgg = await db.collection(ref).aggregate([
            { $match: query },
        { $unwind: { path: '$profession', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$profession', count: { $sum: 1 } } }
      ]).toArray();

      aux.professions = [ ...professionAgg ]
    }
    items12M.filter(i => i.created_at).map(item => {
      const d = new Date(item.created_at)
      const key = `${pad2(getMonth(d))}/${padYear2(getYear(d))}`
      aux.last12M[key] = aux.last12M[key] || 0
      aux.last12M[key] += 1
    })
    items30d.filter(i => i.created_at).map(item => {
      const d = new Date(item.created_at)
      const key = `${d.getDate()}/${pad2(getMonth(d))}}`
      aux.last30d[key] = aux.last30d[key] || 0
      aux.last30d[key] += 1
    })
  }

  return JSON.stringify({ ...aux }, null, 2)
}
