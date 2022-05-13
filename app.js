//const checkemail = require("./scripts/checkemail")
const csv = require("fast-csv");
const fs = require("fs");

const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const dotenv = require("dotenv");
const path = require("path");
const { JSDOM } = require("jsdom");
dotenv.config({ path: path.resolve(__dirname, "./config/variables.env") });
const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
const SPARKPOST_HOST = process.env.SPARKPOST_HOST;

const { exit } = require("process");
const { extname } = require("path");
const { Stream } = require("stream");
const myArgs = process.argv.slice(2);

/*
function countLines(count)
{
  var i;
  //var count = 0;

  require('fs').createReadStream(myArgs[1])
  .on('data', function(chunk) {
    for (i=0; i < chunk.length; ++i)
      if (chunk[i] == 10) count++;
  })
  .on('end', function() {
    count = count++;
  });
}
*/

if (
  myArgs[0] == "-i" &&
  myArgs[1] != null &&
  myArgs[2] == "-o" &&
  myArgs[3] != null
) {
  if (extname(myArgs[1]).toLowerCase() == ".csv" && extname(myArgs[3]).toLowerCase() == ".csv") {
    let completed = 0
    const { window } = new JSDOM();
    const start = window.performance.now();
    const csvWriter = createCsvWriter({
      path: myArgs[3],
      header: [
        { id: "email", title: "Email" },
        { id: "result", title: "Result" },
        { id: "valid", title: "Valid" },
        { id: "is_role", title: "Is_Role" },
        { id: "is_disposable", title: "Is_Disposable" },
        { id: "is_free", title: "Is_Free" },
        { id: "delivery_confidence", title: "Delivery_Confidence" },
      ]
    });
    
    fs.createReadStream(myArgs[1])
      .pipe(csv.parse({ headers: false }))
      .on("data", async (email) =>
      {
          let url = SPARKPOST_HOST + "/api/v1/recipient-validation/single/" + email
          var instance = axios.create({
            validateStatus: function (status)
            {
                return status == 200;
            }
          });
          await instance.get(url, {
            headers: {
              Authorization: SPARKPOST_API_KEY
            }
          })
          .then(function (response)
          {
            csvWriter.writeRecords(
              [{
                  email: email,
                  valid: response.data.results.valid,
                  result: response.data.results.result,
                  is_role: response.data.results.is_role,
                  is_disposable: response.data.results.is_disposable,
                  is_free: response.data.results.is_free,
                  delivery_confidence: response.data.results.delivery_confidence,
              }]
            )
            completed++
            process.stdout.write(
              `Done with ${completed}\r`
            );
          })
        .catch((error) => {
          console.log(`${error} with email ${email}`);
        })
      })
  } else {
    console.log(
      "\x1b[31mInvalid input or output file. Please ensure these files are in .csv format"
    );
  }
} else if (myArgs[0] == "-h") {
  console.log(
    "\x1b[31mThe following is how to use this app.\n\nPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
  exit(0);
} else {
  console.log(
    "\x1b[31mPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
  exit(0);
}
