const mongo = require('mongodb');

exports.controller = async (reqData) => {
  let url = '';
  let query = '';
  let collection = '';
  let action = 'find';
  try {
    reqData = JSON.parse(reqData);
    url = reqData.url;
    query = reqData.query;
    collection = reqData.collection;
    if (reqData.action) action = reqData.action;
  } catch (err) {
    console.log('Content is not json');
  }

  if (url && collection && query) {
    const client = new mongo.MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const connectedDb = client.db();
    let result = undefined;
    switch (action) {
      case 'find':
        result = await connectedDb.collection(collection).find(query).toArray();
        break;
      case 'insert':
        result = await connectedDb.collection(collection).insertOne(query);
        break;
      case 'delete': 
        result = await connectedDb.collection(collection).deleteOne(query);
        break;
      case 'drop': 
        result = await connectedDb.collection(collection).drop();
        break;
    }
    await client.close();
    return JSON.stringify(result);
  }

}