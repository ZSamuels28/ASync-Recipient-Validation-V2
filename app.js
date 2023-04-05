const validateRecipients = require("./scripts/validateRecipients");
const myArgs = process.argv.slice(2); // Extract command line arguments

// Check if command line arguments are formatted properly
if (
  myArgs[0] === "-i" &&
  myArgs[1] != null &&
  myArgs[2] === "-o" &&
  myArgs[3] != null
) {
  let count = 0; // Line count

  // Read the input file and count the number of lines
  require("fs")
    .createReadStream(myArgs[1])
    .on("data", function (chunk) {
      for (let i = 0; i < chunk.length; ++i) {
        if (chunk[i] === 10) {
          count++;
        }
      }
    })
    .on("close", function () {
      // After all lines have been counted, run the recipient validation function
      validateRecipients.validateRecipients(count, myArgs);
    });
} else if (myArgs[0] === "-h") {
  // If the first command line argument is -h, show usage instructions
  console.log(
    "\x1b[31mThe following is how to use this app.\n\nPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
} else {
  // If the command line arguments are improperly formatted, show an error message
  console.log(
    "\x1b[31mPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
}
