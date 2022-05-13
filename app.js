const validateRecipients = require("./scripts/validateRecipients");
const myArgs = process.argv.slice(2); //Pulls in command line arguments

if (
  myArgs[0] == "-i" &&
  myArgs[1] != null &&
  myArgs[2] == "-o" &&
  myArgs[3] != null
) {
  //If the command line arguments are formatted properly
  let count = 0; //Line count
  require("fs")
    .createReadStream(myArgs[1])
    .on("data", function (chunk) {
      for (let i = 0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
    }) //Reads the infile and increases the count for each line
    .on("close", function () {
      //At the end of the infile, after all lines have been counted, run the recipient validation function
      validateRecipients.validateRecipients(count, myArgs);
    });
} else if (myArgs[0] == "-h") {
  //If the first command line argument is -h
  console.log(
    "\x1b[31mThe following is how to use this app.\n\nPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
} else {
  //If the command line arguments are improperly formatted
  console.log(
    "\x1b[31mPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
}
