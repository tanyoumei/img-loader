import loaderUtils from 'loader-utils'
import merge from 'merge'
import {
  createReadStream,
  createWriteStream,
  appendFileSync
} from 'fs'
import {
  request,
  get
} from 'https'
import {
  red,
  blue
} from 'chalk'

const option = {
  hostname: 'tinypng.com',
  port: 443,
  path: '/web/shrink',
  method: 'POST',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
  },
}


module.exports = function (content) {
  this.cacheable && this.cacheable();
  var callback = this.async();
  const options = merge({
    limit: 30,
    publicPath: undefined,
    useRelativePath: false,
    name: "[hash].[ext]"
  }, loaderUtils.getOptions(this))

  var limit = options.limit
  var filePath = this.resourcePath;
  // 这里根据路径压缩图片
  compress(filePath)
    .then((res) => {
      try {
        var content = res
        // 转换成base64
        if (!limit || content.length < limit) {
          if (typeof content === "string") {
            content = new Buffer(content);
          }
          return "module.exports = " + JSON.stringify("data:" + (options.mimetype ? options.mimetype + ";" : "") + "base64," + content.toString("base64"));
        }
        // 转换成url
        var url = loaderUtils.interpolateName(this, options.name, {
          context: options.context,
          content: content,
          regExp: options.regExp
        });
        var outputPath = url;
        var publicPath = "__webpack_public_path__ + " + JSON.stringify(url);
        if (options.publicPath !== undefined) {
          publicPath = JSON.stringify(
            typeof options.publicPath === "function" ?
            options.publicPath(url) :
            options.publicPath + url
          );
        }

        this.emitFile(outputPath, content);
        callback(null, publicPath)
      } catch (e) {
        callback(e, publicPath)
      }
    })
};



var compress = (path) => {
  return new Promise((resolve, reject) => {
    createReadStream(path).pipe(request(option, (res) => {
      res.on('data', resInfo => {
        try {
          resInfo = JSON.parse(resInfo.toString())
          if (resInfo.error) {
            return console.log(`CompressError '${red(path)}'.....${resInfo.message}`)
          }
          var oldSize = (resInfo.input.size / 1024).toFixed(2)
          var newSize = (resInfo.output.size / 1024).toFixed(2)
          get(resInfo.output.url, imgRes => {
            let writeS = createWriteStream(`${path}`)
            imgRes.pipe(writeS)
            var buffers = []
            imgRes.on('data', function (buffer) {
              buffers.push(buffer);
            });
            imgRes.on('end', () => {
              console.log(`CompressSize ${blue(`${oldSize}KB ==> ${newSize}KB -${Math.floor(((oldSize - newSize) / oldSize * 100))}% `)}`)
              console.log(`CompressDone '${blue(path)}'.....`)
              // 改变chunk
              resolve(Buffer.concat(buffers))
            })
            writeS.on('close', () => {})
          })
        } catch (error) {
          return console.log(`CompressError '${base}'.....${resInfo.message}`)
        }
      })
    }))
  })

}
module.exports.raw = true;