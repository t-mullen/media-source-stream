(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MediaSourceStream = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});