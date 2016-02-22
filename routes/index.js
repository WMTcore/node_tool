var express = require('express');
var router = express.Router();
var Excel = require("node-xlsx");
var formidable = require('formidable'),
	fs = require('fs'),
	TITLE = 'formidable上传示例',
	AVATAR_UPLOAD_FOLDER = '/xls/';

var beginTime = '8:35:00',
	endTime = '17:30:00',
	warnValue = {};

function PushToWarn(name, time) {
	warnValue[name] = warnValue[name] || [];
	warnValue[name].push(time);
}

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title: TITLE
	});
});

function Analyse(path) {
	warnValue={};
	var data = Excel.parse(__dirname + '/1.xls'),
		info = {};
	data.forEach(function(table) {
		for (var i = 2; i < table.data.length; i++) {
			var value = table.data[i];
			var time = value[3].split(' ');
			info[value[1]] = info[value[1]] || {};
			info[value[1]][time[0]] = info[value[1]][time[0]] || [];
			info[value[1]][time[0]].push(time[1])
		}
		for (var name in info) {
			for (var date in info[name]) {
				var value = info[name][date];
				value.sort();
				if (value[0] > beginTime) {
					PushToWarn(name, date + '' + value[0]);
				}
				if (value[value.length - 1] < endTime) {
					PushToWarn(name, date + ' ' + value[value.length - 1]);
				}
			}
		}
		console.error(warnValue);
	});
};

router.post('/', function(req, res) {
	var form = new formidable.IncomingForm(); //创建上传表单
	form.encoding = 'utf-8'; //设置编辑
	form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER; //设置上传目录
	form.keepExtensions = true; //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024; //文件大小

	form.parse(req, function(err, fields, files) {

		if (err) {
			res.locals.error = err;
			res.render('index', {
				title: TITLE
			});
			return;
		}

		var extName = ''; //后缀名

		if (files.fulAvatar.type == 'application/vnd.ms-excel')
			extName = 'xls'
			// switch (files.fulAvatar.type) {
			// 	case :
			// 		extName = 'els';
			// 		break;
			// 	case 'image/jpeg':
			// 		extName = 'jpg';
			// 		break;
			// 	case 'image/png':
			// 		extName = 'png';
			// 		break;
			// 	case 'image/x-png':
			// 		extName = 'png';
			// 		break;
			// }

		if (extName.length == 0) {
			res.locals.error = '只支持xls文件';
			return res.render('index', {
				title: TITLE
			});
		}

		var avatarName = Math.random() + '.' + extName;
		var newPath = form.uploadDir + avatarName;

		console.log(newPath);
		fs.renameSync(files.fulAvatar.path, newPath); //重命名
		Analyse(newPath);
	});

	// res.locals.success = '上传成功';
	// res.json(warnValue)
	res.render('warnValue', {
		data: warnValue
	});
});


module.exports = router;