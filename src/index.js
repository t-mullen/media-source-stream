module.exports = MediaSourceStream

/* globals MediaSource */

var stream = require('readable-stream')
var inherits = require('inherits')

inherits(MediaSourceStream, stream.Writable)

function MediaSourceStream (opts) {
  var self = this
  if (!(self instanceof MediaSourceStream)) return new MediaSourceStream(opts)

  if (!('MediaSource' in window)) throw new Error('No MediaSource support: Unsupported browser')

  opts = opts || {}
  opts.mimeType = opts.mimeType || 'video/webm; codecs="opus,vp8"'

  self.mediaSource = new MediaSource(opts)
  self._sourceBuffer = null

  self.mediaSource.addEventListener('sourceopen', function (e) {
    self._sourceBuffer = self.mediaSource.addSourceBuffer(opts.mimeType)
  })

  stream.Writable.call(this, opts)
}

MediaSourceStream.prototype._write = function (chunk, enc, next) {
  var self = this

  if (!self._sourceBuffer || self._sourceBuffer.updating) return
  self._sourceBuffer.appendBuffer(chunk)
  next()
}

MediaSourceStream.prototype.destroy = function () {
  var self = this

  self.mediaSource.endOfStream()
  self.mediaSource = null

  self._sourceBuffer = null
}
