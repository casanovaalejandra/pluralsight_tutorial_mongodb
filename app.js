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

    const id = getData[4]._id.toString();
    const byId = await circulationRepo.getById(id);
    assert.deepEqual(byId, getData[4]);

    const newItem = {
      "Newspaper": "the papaer",
      "Daily Circulation, 2004": 3571,
      "Daily Circulation, 2013": 2506,
      "Change in Daily Circulation, 2004-2013": -390,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 1
    };
    const addedItem = await circulationRepo.add(newItem);
    assert(addedItem._id); //if it has an id it means it was added
    const addedItemQuery = await circulationRepo.getById(addedItem._id);
    assert.deepEqual(addedItemQuery, newItem);

    const updatedItem = await circulationRepo.update(addedItem._id,{
      "Newspaper": "the OTHER papaer",
      "Daily Circulation, 2004": 3571,
      "Daily Circulation, 2013": 2506,
      "Change in Daily Circulation, 2004-2013": -390,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 1
    });
    const newAddedItemQuery = await circulationRepo.getById(addedItem._id); // grab the item we just added
    assert.deepEqual(newAddedItemQuery.Newspaper, "the OTHER papaer");

    const removed = await circulationRepo.remove(addedItem._id);
    //assert(removed);
    const deletedItem = await circulationRepo.getById(addedItem._id);
    assert.equal(deletedItem, null);
    const averageFinalists = await circulationRepo.averageFinalists();
    console.log("average", averageFinalists);
    const avgByChange = await circulationRepo.averageFinalistsByChange();
    console.log("avgByChange: ",avgByChange);
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
