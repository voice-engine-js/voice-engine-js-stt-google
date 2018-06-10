const fetch = require('node-fetch')
const Transform = require('stream').Transform

class GoogleSpeechToText extends Transform {
  constructor (options) {
    options = options || {}

    super({
      readableObjectMode: true,
      writableObjectMode: true
    })

    this.apiKey = options.apiKey || process.env.GOOGLE_API_KEY

    this.once('pipe', input => {
      input.once('format', format => {
        this.format = format
      })
    })
  }

  _transform (chunk, encoding, callback) {
    return fetch('https://speech.googleapis.com/v1/speech:recognize?key=' + this.apiKey, {
      method: 'post',
      headers: {
        accept: 'application/json',
        'content-type': `audio/${this.format.endianness.slice(0, 1).toLowerCase() + this.format.bitDepth}; rate=${this.format.sampleRate};`
      },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: this.format.sampleRate,
          languageCode: 'en-US',
          maxAlternatives: 30,
          enableWordTimeOffsets: false
        },
        audio: {
          content: chunk.toString('base64')
        }
      })
    }).then(res => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(res.statusText)
      }
    }).then(json => {
      if (json.error) {
        return Promise.reject(json.error.message)
      } else {
        return json.results.shift().alternatives.map(alternative => {
          return {
            confidence: alternative.confidence,
            text: alternative.transcript
          }
        })
      }
    }).then(result => {
      callback(null, result)
    }).catch(err => {
      callback(null, [{
        confidence: 0,
        error: err
      }])
    })
  }

  static create (options) {
    return new GoogleSpeechToText(options)
  }
}

module.exports = GoogleSpeechToText
