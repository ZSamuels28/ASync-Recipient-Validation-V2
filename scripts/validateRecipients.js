const csv = require("fast-csv");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");
const { JSDOM } = require("jsdom");
const { extname } = require("path");
const converter = require("json-2-csv");
const pLimit = require("p-limit");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../config/variables.env") });
const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
const SPARKPOST_HOST = process.env.SPARKPOST_HOST;
const CONCURRENCY_LIMIT = 100; //Note this can be set higher or lower depending on necessity and computing power

async function validateRecipients(email_count, myArgs) {
  // Check if input and output files are CSV
  if (
    extname(myArgs[1]).toLowerCase() === ".csv" &&
    extname(myArgs[3]).toLowerCase() === ".csv"
  ) {
    email_count++;

    const { window } = new JSDOM();
    const start = window.performance.now();

    // Create output file and write header
    const output = fs.createWriteStream(myArgs[3]);
    output.write(
      "Email,Valid,Result,Reason,Is_Role,Is_Disposable,Is_Free,Delivery_Confidence,Did_You_Mean\n"
    );

    // Read and parse CSV file
    const emails = await new Promise((resolve, reject) => {
      const emails = [];
      fs.createReadStream(myArgs[1])
        .pipe(csv.parse({ headers: false }))
        .on("data", (email) => {
          emails.push(email);
        })
        .on("end", () => {
          resolve(emails);
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    // Set concurrency limit
    const limit = pLimit(CONCURRENCY_LIMIT);
    let completed = 0;
    const tasks = emails.map((email) =>
      limit(() => {
        const wrappedProcessEmail = async () => {
          const result = await processEmail(email, output, email_count);
          if (result) {
            completed++;
            // Output status of Completed / Total to the console without showing new lines
            process.stdout.write(`Done with ${completed} / ${email_count} \r`);
          }
        };
        return wrappedProcessEmail();
      })
    );

    // Wait for all tasks to complete
    await Promise.all(tasks);

    const stop = window.performance.now();
    console.log(
      `All emails successfully validated in ${(stop - start) / 1000} seconds`
    );
  } else {
    console.log(
      "\x1b[31mInvalid input or output file. Please ensure these files are in .csv format"
    );
  }
}

async function processEmail(email, output, email_count) {
  let url =
    SPARKPOST_HOST + "/api/v1/recipient-validation/single/" + email;
  try {
    // Make API request
    const response = await axios.get(url, {
      headers: {
        Authorization: SPARKPOST_API_KEY,
      },
    });

    // Format response data
    response.data.results.email = String(email);
    response.data.results.reason = response.data.results.reason || "";
    response.data.results.did_you_mean = response.data.results.did_you_mean || "";

    // Set options for JSON to CSV conversion
    let options = {
      prependHeader: false,
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
      ],
    };
    let json2csvCallback = function (err, csv) {
      if (err) throw err;
      output.write(`${csv}\n`);
    };
    converter.json2csv(response.data, json2csvCallback, options);

    return true;
  } catch (error) {
    // Log error to console
    console.log(`${error} with email ${email}`);
    return false;
  }
}

module.exports = { validateRecipients };
