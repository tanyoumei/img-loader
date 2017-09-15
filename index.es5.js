'use strict';

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _fs = require('fs');

var _https = require('https');

var _chalk = require('chalk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var option = {
  hostname: 'tinypng.com',
  port: 443,
  path: '/web/shrink',
  method: 'POST',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
  }
};

module.exports = function (content) {
  var _this = this;

  this.cacheable && this.cacheable();
  var callback = this.async();
  var options = (0, _merge2.default)({
    limit: 30,
    publicPath: undefined,
    useRelativePath: false,
    name: "[hash].[ext]"
  }, _loaderUtils2.default.getOptions(this));

  var limit = options.limit;
  var filePath = this.resourcePath;
  // 这里根据路径压缩图片
  compress(filePath).then(function (res) {
    try {
      var content = res;
      // 转换成base64
      if (!limit || content.length < limit) {
        if (typeof content === "string") {
          content = new Buffer(content);
        }
        return "module.exports = " + JSON.stringify("data:" + (options.mimetype ? options.mimetype + ";" : "") + "base64," + content.toString("base64"));
      }
      // 转换成url
      var url = _loaderUtils2.default.interpolateName(_this, options.name, {
        context: options.context,
        content: content,
        regExp: options.regExp
      });
      var outputPath = url;
      var publicPath = "__webpack_public_path__ + " + JSON.stringify(url);
      if (options.publicPath !== undefined) {
        publicPath = JSON.stringify(typeof options.publicPath === "function" ? options.publicPath(url) : options.publicPath + url);
      }

      _this.emitFile(outputPath, content);
      callback(null, publicPath);
    } catch (e) {
      callback(e, publicPath);
    }
  });
};

var compress = function compress(path) {
  return new Promise(function (resolve, reject) {
    (0, _fs.createReadStream)(path).pipe((0, _https.request)(option, function (res) {
      res.on('data', function (resInfo) {
        try {
          resInfo = JSON.parse(resInfo.toString());
          if (resInfo.error) {
            return console.log('CompressError \'' + (0, _chalk.red)(path) + '\'.....' + resInfo.message);
          }
          var oldSize = (resInfo.input.size / 1024).toFixed(2);
          var newSize = (resInfo.output.size / 1024).toFixed(2);
          (0, _https.get)(resInfo.output.url, function (imgRes) {
            var writeS = (0, _fs.createWriteStream)('' + path);
            imgRes.pipe(writeS);
            var buffers = [];
            imgRes.on('data', function (buffer) {
              buffers.push(buffer);
            });
            imgRes.on('end', function () {
              console.log('CompressSize ' + (0, _chalk.blue)(oldSize + 'KB ==> ' + newSize + 'KB -' + Math.floor((oldSize - newSize) / oldSize * 100) + '% '));
              console.log('CompressDone \'' + (0, _chalk.blue)(path) + '\'.....');
              // 改变chunk
              resolve(Buffer.concat(buffers));
            });
            writeS.on('close', function () {});
          });
        } catch (error) {
          return console.log('CompressError \'' + base + '\'.....' + resInfo.message);
        }
      });
    }));
  });
};
module.exports.raw = true;
