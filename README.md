[Duplicate of feross/mediasource... oops](https://github.com/feross/mediasource)

# media-source-stream
Creates [MSE MediaSource](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource) objects from readable streams.  
Does the reverse of [media-recorder-stream](https://github.com/mafintosh/media-recorder-stream).  

```
npm install media-source-stream
```

## Usage
The easiest way to get a compatible readable stream is to use [media-recorder-stream](https://github.com/mafintosh/media-recorder-stream), but you can also create your own via FFMPEG.  

```javascript
var getMedia = require('getusermedia')
var recorder = require('media-recorder-stream')
var sourcer = require('media-source-stream')

getMedia({video: true, audio: true}, function (err, media) {

  // Change a MediaStream into a data stream
  var recordStream = recorder(media, {
    mimeType: 'video/webm; codecs=vp8', // You MUST set the MIME type
    interval: 100 // A short interval is recommended to keep buffer sizes low
  })
  
  // Do stuff to the data...
  
  // And change it back!
  var sourceStream = MediaSourceStream(recordStream)
  sourceStream.mediaSource
})
```

## Why?
- Modify MediaStreams in realtime, in the browser.
- Send audio/video data over a WebRTC DataChannel.
- Send audio/video over a `net.socket`.
- Upload media without needing to finish recording.

## API
### `sourceStream = new MediaSourceStream(stream, [opts])`  

Create a new MediaSourceStream.  

`stream` is any Node.js-style Readable stream.  

Optional `opts` is the options object to pass to the `MediaSource` constructor.  

### `sourceStream.mediaSource`  

The output `MediaSource` object.  

## Example
Here is an example of how to send video/audio over a WebRTC DataChannel (with [simple-peer](https://github.com/feross/simple-peer)), **without** using media channels.  

Keep in mind there is a moderate increase in latency, so this is only suitable for some applications.  

```javascript
getMedia({video: true, audio: true}, function (err, stream) {
  var recordStream = mediaRecorderStream(stream, {
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

  var sourceStream = MediaSourceStream(peer2)

  var url = window.URL.createObjectURL(sourceStream.mediaSource)
  document.querySelector('video').src = url
})
```

