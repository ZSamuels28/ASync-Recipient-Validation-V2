<a href="https://www.sparkpost.com"><img src="https://www.sparkpost.com/sites/default/files/attachments/SparkPost_Logo_2-Color_Gray-Orange_RGB.svg" width="200px"/></a>

[Sign up](https://app.sparkpost.com/join?plan=free-0817?src=Social%20Media&sfdcid=70160000000pqBb&pc=GitHubSignUp&utm_source=github&utm_medium=social-media&utm_campaign=github&utm_content=sign-up) for a SparkPost account and visit our [Developer Hub](https://developers.sparkpost.com) for even more content.

# SparkPost ASyncRecipientValidation

[![Build Status](https://github.com/ZSamuels28/ASyncRecipientValidation-V2/actions/workflows/node.js.yml/badge.svg)](https://github.com/ZSamuels28/ASyncRecipientValidation-V2/actions/workflows/node.js.yml)

## Easy installation

Firstly ensure you have `node`:

Either by downloading directly and installing via: https://nodejs.org/en/download/

Or by using the following instructions: https://treehouse.github.io/installation-guides/mac/node-mac.html

Get the project, and install dependencies.

```
git clone https://github.com/ZSamuels28/ASyncRecipientValidation-V2.git
cd ASyncRecipientValidation-V2
npm install
```

You can now type `node ./app.js -h` and see usage info.

## Pre-requisites

Set the following environment variables by creating a variables.env file within the ASyncRecipientValidation/config directory with the following information. Note these are case-sensitive:

```
SPARKPOST_HOST
    The URL of the SparkPost API service you're using. Defaults to https://api.sparkpost.com.

SPARKPOST_API_KEY
    API key on your SparkPost account, with Recipient Validation rights.
```

The variables.env file should look something like the following:

```
# .env
SPARKPOST_API_KEY=1234567890ABCDEFGHIJKLMNOPQRSTUVXYZ
SPARKPOST_HOST=https://api.sparkpost.com
```

## Usage

```
node ./app.js -h
usage: ./app.js [-h] [-i INFILE] [-o OUTFILE]

Validate recipients with SparkPost. Reads from specified input CSV file.
Results to specified output file. Error rows are exported to the ErrorLog.csv file.

optional arguments:
  -h, --help            show this help message and exit
  -i INFILE, --infile INFILE
                        filename to read email recipients from (in .CSV
                        format)
  -o OUTFILE, --outfile OUTFILE
                        filename to write validation results to (in .CSV
                        format)
```

## Concurrency

Note that concurrency limit can be set in the `validateRecipients.js` file by changing the following parameter `const CONCURRENCY_LIMIT = [ConcurrencyLimit]`. This will vary based on computing power.

## File input / output

Use the `-i` and `-o` options to specify input and output files.

An example input file is included in the project (valtest.csv) and can be seen below:

```
Kristylucky2914254@test.yahoo.ca
Renee_E3291294@test.earthlink.net
Todddoubtfu123l@test.124frontiernet.net
fashion126K142esari@test.gmail.com
shyTrevor723295234@test.zonnet.nl
```

The output file follows the same form as the SparkPost web application. Note that
_all_ your address results are reported, not just the rejected ones (unlike the web UI validation).

Validations are made via an asynchronous API call so speed will be determined on machine capability.

## Progress

Progress of email validations will be shown in the console in the following form:
`Done with [CompletedCalls] / [TotalValidEmails]`

When all APIs are completed, the following will be shown if all emails are valid:
`All emails successfully validated in X seconds`

## See Also

[SparkPost Developer Hub](https://developers.sparkpost.com/)

[Recipient Validation](https://www.sparkpost.com/docs/tech-resources/recipient-validation-sparkpost/)

[Recipient Validation SparkPost API endpoint](https://developers.sparkpost.com/api/recipient-validation/)
