const {MongoClient} = require('mongodb');

// function to build up our circulation object
function circulationRepo(){
  //Funtion that we pass data into to add it to our DB
  const url = 'mongodb://localhost:27017';
  const dbName = 'circulation';

  function get(query, limit){
    return new Promise(async(resolve, reject)=>{
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        let items = db.collection('newspapers').find(query); //this is going to return a cursor

        if(limit > 0 ){
          items = items.limit(limit);
        }
        resolve(await items.toArray());

      } catch (error) {
        reject(error);
      }
    })
  }

  function getById(id){
    return new Promise(async(resolve,reject)=>{
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        // We search by OBJECT id not by STRING id
        const item = await db.collection('newspapers').findOne({_id: ObjectId(id)}); // iT WILL RETURN ONLY THE FIRST ONE, it returns a object id

        resolve(item);
        client.close();
      } catch (error) {
        reject(error);
      }

    })
  }


  function loadData(data){
    return new Promise(async(resolve, reject)=>{ //we can only make our promise async not the whole function
      const client = new MongoClient(url);
        try{
            await client.connect(); // make connection to our db
            const db = client.db(dbName);
            results = await db.collection('newspapers').insertMany(data);// everything that happens inside a DB in mongo happens inside a collection
            //insertMany takes a json with data and returns the results of the INSERTIONS of that data to the db
            resolve(results);

        }
        catch(error){
          reject(error);
        }
        client.close();

    })
  }
  return {loadData, get, getById}

  }


module.exports = circulationRepo();
