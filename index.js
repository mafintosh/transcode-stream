const duplexify = require('duplexify')
const { Writable } = require('readable-stream')
const { spawn } = require('child_process')

createTranscodeStream.info = createInfoStream
module.exports = createTranscodeStream

function createTranscodeStream (opts) {
  if (!opts) opts = {}

  const s = duplexify()
  const proc = spawn('ffmpeg', [
    '-i', '-',
    '-nostats',
    '-loglevel', '0',
    '-acodec', opts.acodec || 'copy',
    '-vcodec', opts.vcodec || 'copy',
    '-f', opts.format || 'mp4',
    '-'
  ])

  proc.on('exit', () => s.destroy())
  proc.stderr.resume()

  s.setReadable(proc.stdout)
  s.setWritable(proc.stdin)
  s.on('close', () => proc.kill())

  return s
}

function createInfoStream (cb) {
  const result = { acodec: null, vcodec: null, width: 0, height: 0 }
  const proc = spawn('ffmpeg', [ '-i', '-', '-hide_banner' ])

  let buf = ''

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', data => (buf += data))
  proc.stderr.on('end', parse)
  proc.on('error', ignore)
  proc.stdin.on('error', ignore)
  proc.on('exit', function () {
    if (!result.vcodec && !result.acodec) return cb(new Error('Could not parse stream'))
    cb(null, result)
  })

  const ws = new Writable({
    write (data, enc, cb) {
      proc.stdin.write(data)
      cb(null)
    }
  })

  return ws

  function parse () {
    for (const line of buf.trim().split('\n')) {
      const l = line.trim()
      if (!/^Stream #\d/.test(l)) continue

      const v = l.match(/ Video: (\w+) /)
      if (v) {
        const dim = l.match(/ (\d+)x(\d+)[, ]/)
        result.vcodec = v[1]
        result.width = dim ? Number(dim[1]) : 0
        result.height = dim ? Number(dim[2]) : 0
        continue
      }
      const a = l.match(/ Audio: (\w+) /)
      if (a) {
        result.acodec = a[1]
      }
    }

    ws.destroy()
  }
}

function ignore () {}
