const fs = require("fs");

const fileFormats = Object.freeze({
  JSON: "json",
  CSV: "csv",
});

function createFile(name, data, fileType, timeInName = true) {
  if ((fileType === fileFormats.JSON)) {
    data = JSON.stringify(data);
  }
  fs.writeFileSync(
    `./out/${timeInName ? `${name}-${Date.now()}` : `${name}`}.${fileType}`,
    data,
    "utf-8"
  );
}

function appendDataInFile(name, data, fileType) {
  fs.appendFileSync(`./out/${name}.${fileType}`, data, "utf-8");
}

module.exports = { fileFormats, createFile, appendDataInFile };
