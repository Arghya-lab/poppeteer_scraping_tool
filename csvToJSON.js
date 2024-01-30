const csv = require("csvtojson");
const fs = require("fs");
const { createFile, fileFormats } = require("./writeFile");

const csvFilePath = "./joyp.out.csv";

csv()
  .fromFile(csvFilePath)
  .then((jsonArray) => {
    createFile("json", jsonArray, fileFormats.JSON);
    /**
     * [
     * 	{a:"1", b:"2", c:"3"},
     * 	{a:"4", b:"5". c:"6"}
     * ]
     */
  });

// Async / await usage
// const jsonArray = await csv().fromFile(csvFilePath);

// fs.watchFile(`json-${new Date.now()}.out.json`, JSON.stringify(jsonArray), (e) => {
//   if (e) console.log(e);
// });
