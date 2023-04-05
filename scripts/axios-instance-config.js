// Import the required modules
const axios = require("axios");
const http = require("http");
const https = require("https");

// Set a 60-second timeout for all axios requests
axios.defaults.timeout = 60000;

// Use keepAlive to pool and reuse TCP connections for all axios requests, improving performance
axios.defaults.httpAgent = new http.Agent({ keepAlive: true });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

// Allow following up to 10 HTTP 3xx redirects for all axios requests
axios.defaults.maxRedirects = 10;

// Set a maximum accepted content length to 50MBs for all axios requests
axios.defaults.maxContentLength = 50 * 1000 * 1000;

// Optionally, add global interceptors for requests and responses here...