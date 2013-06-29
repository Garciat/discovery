var http = require('http');
var $ = require('jquery');

function grab_profile(handle, callback) {
	var req = http.get('http://codeforces.com/profile/' + handle);
	
	req.on('response', function (res) {
		// Codeforces will redirect us to the home page instead of 404-ing
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
	
	var info_node = dom.find('.info');
	
	// title (rank, handle)
	
	var title_node = info_node.children('h3');
	
	var rank_str = title_node.children('span').text();
	
	var handle_str = title_node.children('a').text();
	
	// meta (name, location)
	
	var meta_node = title_node.next();
	
	var meta_str = meta_node.text();
	
	var meta_divide_i = meta_str.indexOf(',');
	
	var name_str = meta_str.substr(0, meta_divide_i);
	
	var location_str = meta_str.substr(meta_divide_i + 1);
	
	// submeta (organization)
	
	var submeta_node = meta_node.next();
	
	var organization_str = '';
	
	if ('div' === submeta_node.get(0).nodeName.toLowerCase()) {
		organization_str = submeta_node.children('a').text();
	}
	
	// general (rating)
	
	var rating_str = info_node.find('ul li:nth-child(1) span').text();
	
	return {
		handle: handle_str.trim(),
		name: name_str.trim(),
		rank: rank_str.trim(),
		location: location_str.trim(),
		organization: organization_str.trim(),
		rating: parseInt(rating_str.trim(), 10)
	};
}

module.exports = {
	serviceId: 'codeforces',
	
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