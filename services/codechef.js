var http = require('http');
var $ = require('jquery');

function grab_profile(handle, callback) {
	var req = http.get('http://www.codechef.com/users/' + handle);
	
	req.setTimeout(10000, function () {
		callback('request timed out', null);
	});
	
	req.on('response', function (res) {
		// CodeChef will redirect us to the home page instead of 404-ing
		if (302 === res.statusCode) {
			req.abort();
			
			return callback('user does not exist', null);
		}
		
		var data = '';
		
		res.setEncoding('utf8');
		
		res.on('data', function (chunk) {
			data += chunk;
		});
		
		res.on('end', function () {
			callback(null, parse_profile(data));
		});
	});
}

function parse_profile(html) {
	var dom = $(html);
	
	// general (rating)
	
	var ratingRows_nodes = dom.find(
		'.rating-table tr:nth-child(n + 2) td:nth-child(3)');
	
	var ratingRows = ratingRows_nodes.map(function (i, ele) {
		return parseFloat($(ele).text().split('&', 1)[0].trim());
	});
	
	var rating_long = ratingRows[0];
	
	var rating_short = ratingRows[1];
	
	return {
		rating: rating_long + rating_short,
		rating_long: rating_long,
		rating_short: rating_short
	};
}

module.exports = {
	serviceId: 'codechef',
	
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
