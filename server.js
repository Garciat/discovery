var express = require('express');
var fs = require('fs');
var path = require('path');

function isValidServiceModule(module) {
	if (!module.serviceId || 'string' !== typeof module.serviceId) {
		return false;
	}
	
	if (!module.requestHandler) {
		return false;
	}
	
	// more?
	
	return true;
}

function discoverServices() {
	var files = fs.readdirSync('services');
	
	var modules = files.map(function (filename) {
		return require(path.join(__dirname, 'services', filename));
	});
	
	modules = modules.filter(isValidServiceModule);
	
	modules.forEach(function (module) {
		console.log('service module found:', module.serviceId);
	});
	
	return modules;
}

var services = discoverServices();

var app = express();

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {
	res.send('hi (:');
});

app.get('/api/', function (req, res) {
	res.send({
		services: services.map(function (service) {
			return service.serviceId
		})
	});
});

// Register each service with express
services.forEach(function (service) {
	app.get('/api/' + service.serviceId +'/:handle', service.requestHandler);
});

var port = process.env.PORT || 8080;

if (process.env.IP) {
	app.listen(port, process.env.IP, function () {
		console.log('server listening on', host, port);
	});
} else {
	app.listen(port, function () {
		console.log('server listening on', port);
	});
}

// (:
