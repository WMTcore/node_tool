'use strict';

let request = require('request');
let fs = require('fs');

let path = '../gui-config.json'; //shadowsocks的配置文件相对路径
let json = require(path);

let reg = ['A', 'C', 'B'];

setInterval(function() {
	request('http://www.ishadowsocks.net', function(error, response, body) {
		reg.some((param, i) => {
			let temp = new RegExp('(' + param + '密码:)[\\s\\S]+?(</h4>)').exec(body);
			console.error(temp)
			if (!temp) return false;
			let password = temp[0].replace(temp[1], '').replace(temp[2], '').replace('/\s/g', '');
			if (isNaN(Number(password)))
				return false;
			json.configs[i].password = password;
			json.configs[i].remarks = password;
			json.index = i;
			fs.writeFile(path, JSON.stringify(json, null, 2));
			console.log('当前ishadowsocks 密码为：', password, i);
			return true;
		})
	});
}, 60*10*1000);