const url = require('url');
var path = require('path');
const proxy = require('express-http-proxy');
const express = require('express')
const app = express()

// Load and check configurations
var config = require('./config/config');

if (!config.ipv4) {
	console.log('No ipv4 address specified in ./config/config ');
	exit()
} else if (!config.port) {
	console.log('No port specified in ./config/config ');
	exit()
} else if (!config.proxyipv4) {
	console.log('No proxy ipv4 address specified in ./config/config ');
	exit()
} else if (!config.proxyport) {
	console.log('No proxy port specified in ./config/config ');
	exit()
}

let ipv4Array = [];
if (typeof config.ipv4 === 'string') ipv4Array.push(config.ipv4)
else if (Array.isArray(config.ipv4)) ipv4Array = config.ipv4

if (!ipv4Array.length) {
	console.log('No ipv4 address specified in ./config/config ');
	exit()
}

// Send API requests to API server
const apiProxy = proxy(`${config.proxyipv4}:${config.proxyport}/`, {
  proxyReqPathResolver: req => url.parse(req.originalUrl).path
});
app.use('/api/*', apiProxy);

// Serve compiled public files
app.use(express.static(path.join(__dirname, 'public')))

// Catch all
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
})

// Listen
var http = require('http');

ipv4Array.forEach(function(ipv4, index) {
	http.createServer(app).listen(config.port, ipv4, function() {
    console.log(`${config.name} listening on ${ipv4}:${config.port}\nSending /api/* calls to ${config.proxyipv4}:${config.proxyport}`)
	});
});