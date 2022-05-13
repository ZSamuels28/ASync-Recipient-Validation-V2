const validateRecipients = require("./scripts/validateRecipients");
const myArgs = process.argv.slice(2);

if (
  myArgs[0] == "-i" &&
  myArgs[1] != null &&
  myArgs[2] == "-o" &&
  myArgs[3] != null
) {
  var i;
  var count = 0;
  require("fs")
    .createReadStream(myArgs[1])
    .on("data", function (chunk) {
      for (i = 0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
    })
    .on("close", function () {
      validateRecipients.validateRecipients(count, myArgs);
    });
} else if (myArgs[0] == "-h") {
  console.log(
    "\x1b[31mThe following is how to use this app.\n\nPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
  exit(0);
} else {
  console.log(
    "\x1b[31mPlease provide the following arguments:\n\nnode ./app.js -i infile.csv -o outfile.csv"
  );
}
