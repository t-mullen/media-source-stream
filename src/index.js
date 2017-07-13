module.exports = MediaSourceStream

/* globals MediaSource, File, FileReader */

var stream = require('readable-stream')
var inherits = require('inherits')

inherits(MediaSourceStream, stream.Writable)

function MediaSourceStream (opts) {
  var self = this
  if (!(self instanceof MediaSourceStream)) return new MediaSourceStream(opts)

  if (!('MediaSource' in window)) throw new Error('No MediaSource support: Unsupported browser')

  opts = opts || {}
  opts.mimeType = opts.mimeType || 'video/webm; codecs="opus,vp8"'
  self.incomplete = opts.incomplete || false

  self.mediaSource = new MediaSource(opts)
  self._sourceBuffer = null

  self.mediaSource.addEventListener('sourceopen', function (e) {
    self._sourceBuffer = self.mediaSource.addSourceBuffer(opts.mimeType)
    self._sourceBuffer.mode = 'sequence'
  })

  stream.Writable.call(this, opts)
}

MediaSourceStream.prototype._write = function (chunk, enc, next) {
  var self = this

  if (self.incomplete) {
    self._writeIncomplete(chunk, enc, next)
  } else {
    if (!self._sourceBuffer || self._sourceBuffer.updating) return
    self._sourceBuffer.appendBuffer(chunk)
    next()
  }
}

// TODO: Remove this when incomplete streams can be properly repaired
MediaSourceStream.prototype._writeIncomplete = function (chunk, enc, next) {
  var self = this
  
  var file = new File([chunk], 'file.webm', {
    type: 'video/webm'
  })

  var reader = new FileReader()
  reader.onload = function () {
    var array = new Uint8Array(this.result)
    if (!self._sourceBuffer || self._sourceBuffer.updating) return

    self._sourceBuffer.appendBuffer(array)
    next()
  }
  reader.readAsArrayBuffer(file)
}

MediaSourceStream.prototype.destroy = function () {
  var self = this

  self.mediaSource.endOfStream()
  self.mediaSource = null

  self._sourceBuffer = null
}
