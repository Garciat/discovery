var http = require('http');
var $ = require('jquery');

function grab_profile(handle, callback) {
	grab_profile_link(handle, function (err, profile_link) {
		if (err) {
			return callback(err, null);
		}
		
		// Force Algorithm profile tab
		var req = http.get(profile_link + '&tab=alg');
		
		req.setTimeout(10000, function () {
			callback('request timed out', null);
		});
		
		req.on('response', function (res) {
			var data = '';
			
			res.setEncoding('utf8');
			
			res.on('data', function (chunk) {
				data += chunk;
			});
			
			res.on('end', function () {
				callback(null, parse_profile(data));
			});
		});
	});
}

function grab_profile_link(handle, callback) {
	var req = http.get(
		'http://community.topcoder.com/tc?module=SimpleSearch&ha=' + handle);
	
	req.setTimeout(10000, function () {
		callback('request timed out', null);
	});
	
	req.on('response', function (res) {
		// We don't need the request body either way
		req.abort();
		
		// TopCoder will redirect us to the user's profile if the search
		// succeeds
		if (302 === res.statusCode) {
			return callback(null, res.headers.location);
		}
		
		callback('user does not exist', null);
	});
}

function parse_profile(html) {
	var dom = $(html);
	
	// general (rating)
	
	var rating_str = dom.find('#left > h1').text();
	
	return {
		rating: parseInt(rating_str.trim(), 10)
	};
}

module.exports = {
	serviceId: 'topcoder',
	
	grabProfile: grab_profile,
	
	requestHandler: function (req, res) {
		grab_profile(req.params.handle, function (err, profile) {
			if (err) {
				return res.send({error: err});
			}
			
			res.send({profile: profile});
		});
	}
};
