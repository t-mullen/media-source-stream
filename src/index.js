module.exports = MediaSourceStream

/* globals MediaSource, Blob, FileReader */

function MediaSourceStream (stream, opts) {
  var self = this
  if (!(self instanceof MediaSourceStream)) return new MediaSourceStream(stream, opts)

  if (!('MediaSource' in window)) throw new Error('No MediaSource support: Unsupported browser')

  opts = opts || {}
  opts.mimeType = opts.mimeType || 'video/webm; codecs="opus,vp8"'

  self.mediaSource = new MediaSource(opts)

  self._sourceBuffer = null
  self._blob = null

  self.mediaSource.addEventListener('sourceopen', function (e) {
    self._sourceBuffer = self.mediaSource.addSourceBuffer(opts.mimeType)
  })

  stream.on('data', function (chunk) {
    if (self._blob == null) {
      self._blob = new Blob([chunk], {type: 'video/webm'})
    } else {
      self._blob = new Blob([self._blob, chunk], {type: 'video/webm'}) // Merge blobs
    }

    if (!self._sourceBuffer || self._sourceBuffer.updating) return

    var bl = self._blob
    self._blob = null

    var fileReader = new FileReader()
    fileReader.onload = function (e) {
      if (self._sourceBuffer.updating) return
      self._sourceBuffer.appendBuffer(new Uint8Array(fileReader.result))
    }
    fileReader.readAsArrayBuffer(bl)
  })
}

MediaSourceStream.prototype.destroy = function () {
  var self = this

  self.mediaSource.endOfStream()
  self.mediaSource = null

  self._sourceBuffer = null
  self._blob = null
}
