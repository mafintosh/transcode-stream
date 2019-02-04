# transcode-stream

Transform stream that transcodes video and audio codecs

```
npm install transcode-stream
```

## Usage

``` js
const transcode = require('transcode-stream')

inputStream
  .pipe(transcode({
    vcodec: 'h264',
    acodec: 'mp3'
  }))
  .pipe(outputStream)
```

## API

#### `transformStream = transcode(options)`

Transcode an incoding audio or video stream.

Options include:

``` js
{
  acodec: 'audio-codec-to-use', // defaults to 'copy'
  vcodec: 'video-codec-to-use', // defaults to 'copy'
  format: 'container-format' // defaults to mp4
}
```

FFMPEG is used for the actual transcoding so make sure
that is in your PATH. PRs for more options welcome.

#### `writableStream = transcode.info(cb)`

Get media info about an incoding stream. Returns an object
that looks like this:

``` js
{
  vcodec: 'the-video-codec-used',
  acodec: 'the-audio-codec-used',
  width: videoWidth,
  height: videoHeight
}
```

## License

MIT
