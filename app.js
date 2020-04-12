const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main(){
  const client = new MongoClient(url);
  await client.connect();

  try{
    const results = await circulationRepo.loadData(data);
    assert.equal(data.length, results.insertedCount); //this assert will help us know if what we are doing is correct, if it is not we will know

    const getData = await circulationRepo.get(); //we should see the 50 records we added to the DB
    assert.equal(data.length, getData.length);

    const filterData = await circulationRepo.get({Newspaper: getData[4].Newspaper}); // We are going to pass a query to the get method
    assert.deepEqual(filterData[0], getData[4]);

    const limitData = await circulationRepo.get({},3);
    assert.equal(limitData.length,3);
  }

  catch(error){
    console.log(error);
  }

  finally{
    const admin = client.db(dbName).admin();
    await client.db(dbName).dropDatabase(); //we just deleted the database...
    console.log(await admin.listDatabases());
    client.close(); //this will trigger the terminal to not hang open when we do node app.js
  }


}
main();
