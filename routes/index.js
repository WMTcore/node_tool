var express = require('express');
var router = express.Router();
var Excel = require("node-xlsx");
var formidable = require('formidable'),
	fs = require('fs'),
	TITLE = 'formidable上传示例',
	AVATAR_UPLOAD_FOLDER = '/xls/';

var beginTime = '8:36:00',
	endTime = '17:30:00',
	overTime = '18:00:00',
	warnValue = {};

function PushToWarn(type, name, time) {
	warnValue[type] = warnValue[type] || {};
	warnValue[type][name] = warnValue[type][name] || [];
	warnValue[type][name].push(time);
}

function CompareTimeLarge(timeA, timeB) {
	if (new Date('0000 ' + timeA) - new Date('0000 ' + timeB) > 0)
		return true;
	return false;
}

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title: TITLE
	});
});

function Analyse(path) {
	warnValue = {};
	var data = Excel.parse(path),
		info = {};
	// console.error(data, path)
	data.forEach(function(table) {
		for (var i = 2; i < table.data.length; i++) {
			var value = table.data[i];
			var time = value[3].split(' ');
			info[value[1]] = info[value[1]] || {};
			info[value[1]][time[0]] = info[value[1]][time[0]] || [];
			info[value[1]][time[0]].push(time[1])
		}
		// console.error(info)
		for (var name in info) {
			for (var date in info[name]) {
				var value = info[name][date];
				value.sort(function(a, b) {
					return new Date(date + ' ' + a) - new Date(date + ' ' + b) > 0;
				});
				if (CompareTimeLarge(value[0], beginTime)) {
					PushToWarn('late', name, date + ' ' + value[0]);
				}
				if (!CompareTimeLarge(value[value.length - 1], endTime)) {
					PushToWarn('early', name, date + ' ' + value[value.length - 1]);
				}
				if (CompareTimeLarge(value[value.length - 1], overTime)) {
					PushToWarn('over', name, date + ' ' + value[value.length - 1])
				}
			}
		}
		// console.error(warnValue);
	});
};

router.post('/', function(req, res) {
	var form = new formidable.IncomingForm(); //创建上传表单
	form.encoding = 'utf-8'; //设置编辑
	form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER; //设置上传目录
	form.keepExtensions = true; //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
	try {
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

			// console.log(newPath);
			fs.renameSync(files.fulAvatar.path, newPath); //重命名
			Analyse(newPath);
			res.render('warnValue', {
				data: warnValue
			});
		});
	} catch (error) {
		res.status(500).json({
			data: '出错，请重试'
		})
	}

	// res.locals.success = '上传成功';
	// res.json(warnValue)

});


module.exports = router;