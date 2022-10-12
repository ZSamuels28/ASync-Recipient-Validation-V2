const csv = require("fast-csv");
const fs = require("fs");
const axios = require("./axios-instance-config");
const dotenv = require("dotenv");
const path = require("path");
const { JSDOM } = require("jsdom");
const { extname } = require("path");
const converter = require("json-2-csv");

//Environment varialbes pulled from the ../config/variables.env file
dotenv.config({ path: path.resolve(__dirname, "../config/variables.env") });
const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
const SPARKPOST_HOST = process.env.SPARKPOST_HOST;

async function validateRecipients(email_count, myArgs) {
  if (
    //If both the infile and outfile are in .csv format
    extname(myArgs[1]).toLowerCase() == ".csv" &&
    extname(myArgs[3]).toLowerCase() == ".csv"
  ) {
    let completed = 0; //Counter for each API call
    email_count++; //Line counter returns #lines - 1, this is done to correct the number of lines

    //Start a timer
    const { window } = new JSDOM();
    const start = window.performance.now();

    const output = fs.createWriteStream(myArgs[3]); //Outfile
    output.write(
      "Email,Valid,Result,Reason,Is_Role,Is_Disposable,Is_Free,Delivery_Confidence,Did_You_Mean\n"
    ); //Write the headers in the outfile

    fs.createReadStream(myArgs[1])
      .pipe(csv.parse({ headers: false }))
      .on("data", async (email) => {
        let url =
          SPARKPOST_HOST + "/api/v1/recipient-validation/single/" + email;
        await axios
          .get(url, {
            headers: {
              Authorization: SPARKPOST_API_KEY,
            },
          }) //For each row read in from the infile, call the SparkPost Recipient Validation API
          .then(function (response) {
            response.data.results.email = String(email); //Adds the email as a value/key pair to the response JSON to be used for output

            response.data.results.reason
              ? null
              : (response.data.results.reason = ""); //If reason is null, set it to blank so the CSV is uniform

            response.data.results.did_you_mean
              ? null
              : (response.data.results.did_you_mean = ""); //If did_you_mean is null, set it to blank so the CSV is uniform

            //Utilizes json-2-csv to convert the JSON to CSV format and output
            let options = {
              prependHeader: false, //Disables JSON values from being added as header rows for every line
              keys: [
                "results.email",
                "results.valid",
                "results.result",
                "results.reason",
                "results.is_role",
                "results.is_disposable",
                "results.is_free",
                "results.delivery_confidence",
                "results.did_you_mean",
              ], //Sets the order of keys
            };
            let json2csvCallback = function (err, csv) {
              if (err) throw err;
              output.write(`${csv}\n`);
            };
            converter.json2csv(response.data, json2csvCallback, options);

            completed++; //Increase the API counter
            process.stdout.write(`Done with ${completed} / ${email_count}\r`); //Output status of Completed / Total to the console without showing new lines

            //If all emails have completed validation
            if (completed == email_count) {
              const stop = window.performance.now(); //Stop the timer
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
