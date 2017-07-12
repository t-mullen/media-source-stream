# media-source-stream

Creates [MSE MediaSource](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource) objects from readable streams.  

Does the reverse of [media-recorder-stream](https://github.com/mafintosh/media-recorder-stream).  

[Demo](https://rationalcoding.github.io/media-source-stream/)

```
npm install media-source-stream
```

## Usage
The easiest way to get a compatible readable stream is to use [media-recorder-stream](https://github.com/mafintosh/media-recorder-stream), but you can also create your own via FFMPEG.  

```javascript
var getMedia = require('getusermedia')
var MediaRecorderStream = require('media-recorder-stream')
var MediaSourceStream = require('media-source-stream')

getMedia({video: true, audio: true}, function (err, media) {

  // Change a MediaStream into a data stream
  var recordStream = MediaRecorderStream(media, {
    mimeType: 'video/webm; codecs=vp8', // You MUST set the MIME type
    interval: 100 // A short interval is recommended to keep buffer sizes low
  })
  
  // Do stuff to the data...
  
  // And change it back!
  var sourceStream = MediaSourceStream() // Creates a writable stream
  recordStream.pipe(sourceStream)
  sourceStream.mediaSource
})
```

## Why?
- Modify MediaStreams in realtime, in the browser.
- Send audio/video data over a WebRTC DataChannel.
- Send audio/video over a `net.socket`.
- Upload media without needing to finish recording.

## API
### `sourceStream = new MediaSourceStream([opts])`  

Create a new MediaSourceStream, which is a writable stream.   

Optional `opts` is the options object to pass to the `MediaSource` constructor.  

### `sourceStream.mediaSource`  

The output `MediaSource` object.  

## Example
Here is an example of how to send video/audio over a WebRTC DataChannel (with [simple-peer](https://github.com/feross/simple-peer)), **without** using media channels. You could also do this over WebSockets.

Keep in mind there is a moderate increase in latency, so this is only suitable when MediaStreams aren't an option.

```javascript
getMedia({video: true, audio: true}, function (err, stream) {
  var recordStream = MediaRecorderStream(stream, {
    mimeType: 'video/webm; codecs=vp8',
    interval: 100
  })

  var peer1 = new SimplePeer({
    initiator: true
  })
  var peer2 = new SimplePeer()
  peer1.on('signal', function (data) {
    peer2.signal(data)
  })
  peer2.on('signal', function (data) {
    peer1.signal(data)
  })

  peer1.on('connect', function () {
    recordStream.pipe(peer1)
  })

  var sourceStream = MediaSourceStream()
  peer2.pipe(sourceStream)

  var url = window.URL.createObjectURL(sourceStream.mediaSource)
  document.querySelector('video').src = url
})
```

***Note:** You want to start recording once you already have a connection so that all recorded data is sent. If any initial data is missing, the stream cannot be reconstructed on the other side.*

