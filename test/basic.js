var test = require('tape')
var getMedia = require('getusermedia')
var MediaRecorderStream = require('media-recorder-stream')
var MediaSourceStream = require('./../src/index')

var media = null
test('record and get url' , function (t) {
  t.plan(1)
  getMedia({video: true, audio: true}, function (err, stream) {
    if (err) throw err
    media = stream
    var mediaRecorder = MediaRecorderStream(media, {
      mimeType: 'video/webm; codecs=vp8',
      interval: 100
    })

    var mediaSourceStream = MediaSourceStream()
    mediaRecorder.pipe(mediaSourceStream)

    var video = document.createElement('video')
    video.autoplay = true
    video.src = window.URL.createObjectURL(mediaSourceStream.mediaSource)
    document.body.appendChild(video)
    
    video.oncanplay = function () {
      t.ok(video.src)
      t.end()
    }
  })
})