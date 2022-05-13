const csv = require("fast-csv");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");
const { JSDOM } = require("jsdom");
dotenv.config({ path: path.resolve(__dirname, "../config/variables.env") });
const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
const SPARKPOST_HOST = process.env.SPARKPOST_HOST;
const { extname } = require("path");
const converter = require("json-2-csv");

async function validateRecipients(email_count, myArgs) {
  if (
    extname(myArgs[1]).toLowerCase() == ".csv" &&
    extname(myArgs[3]).toLowerCase() == ".csv"
  ) {
    let completed = 0;
    email_count++;
    const { window } = new JSDOM();
    const start = window.performance.now();

    const output = fs.createWriteStream(myArgs[3]);
    output.write(
      "Email,Delivery_Confidence,Is_Disposable,Is_Free,Is_Role,Result,Valid\n"
    );

    fs.createReadStream(myArgs[1])
      .pipe(csv.parse({ headers: false }))
      .on("data", async (email) => {
        let url =
          SPARKPOST_HOST + "/api/v1/recipient-validation/single/" + email;
        await require("axios")
          .get(url, {
            headers: {
              Authorization: SPARKPOST_API_KEY,
            },
          })
          .then(function (response) {
            response.data.email = String(email);
            let options = {
              prependHeader: false,
              sortHeader: true,
            };
            let json2csvCallback = function (err, csv) {
              if (err) throw err;
              output.write(`${csv}\n`);
            };

            converter.json2csv(response.data, json2csvCallback, options);
            completed++;
            process.stdout.write(`Done with ${completed} / ${email_count}\r`);
            if (completed == email_count) {
              const stop = window.performance.now();
              console.log(
                `All emails successfully validated in ${
                  (stop - start) / 1000
                } seconds`
              );
            }
          })
          .catch((error) => {
            console.log(`${error} with email ${email}`);
          });
      });
  } else {
    console.log(
      "\x1b[31mInvalid input or output file. Please ensure these files are in .csv format"
    );
  }
}

module.exports = { validateRecipients };
