var test = require('tape')
var getMedia = require('getusermedia')
var MediaRecorderStream = require('media-recorder-stream')
var MediaSourceStream = require('./../src/index')

test('record and get url' , function (t) {
  t.plan(1)
  getMedia({video: true, audio: true}, function (err, stream) {
    if (err) throw err
    var mediaRecorder = new MediaRecorderStream(stream, {
      mimeType: 'video/webm; codecs=vp8',
      interval: 100
    })

    var mediaSourceStream = new MediaSourceStream(mediaRecorder)

    var video = document.createElement('video')
    video.autoplay = true
    video.src = window.URL.createObjectURL(mediaSourceStream.mediaSource)

    t.ok(video.src)
  })
})