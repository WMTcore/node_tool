'use strict';

let request = require('request');
let fs = require('fs');

var path = '../gui-config.json'; //shadowsocks的配置文件相对路径

var json = require(path);
setInterval(function() {
	request('http://www.ishadowsocks.net', function(error, response, body) {
		var temp = /(A密码:)[\s\S]+?(<\/h4>)/.exec(body);
		if (!temp) return;
		var password = temp[0].replace(temp[1], '').replace(temp[2], '').replace('/\s/g', '');
		json.configs[0].password = password;
		json.configs[0].remarks = password;
		fs.writeFile(path, JSON.stringify(json, null, 2));
		console.log('当前ishadowsocks 密码为：', password);
	});
}, 10 * 60 * 1000);