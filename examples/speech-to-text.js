const recorder = require('@voice-engine/core').recorder
const slice = require('@voice-engine/core').slice
const googleSpeechToText = require('..').googleSpeechToText

const input = recorder({
  channels: 1
})

const speechToText = googleSpeechToText()

speechToText.on('data', json => {
  console.log('text: ' + JSON.stringify(json, null, ' '))
})

input.pipe(slice()).pipe(speechToText)

input.once('start', () => {
  console.log('Recording started...')

  setTimeout(() => {
    console.log('Recording stopped. Waiting for speech to text processing...')

    input.stop()
  }, 5000)
})

console.log('Records 5 seconds of audio and converts it to text.')
console.log('The program will exit when the conversion is done.')
