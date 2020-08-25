const http = require('https')
const fs = require('fs')
const { app, BrowserWindow } = require('electron')
const EventEmitter = require('events')
const Throttle = require('throttle')

const loadingEvents = new EventEmitter()
const createMainWindow = () => new BrowserWindow({
  webPreferences: {
    nodeIntegration: true
  }
})
const throttle = new Throttle(5e6)

app.on('ready', () => {
  const window = createMainWindow()
  window.loadFile('loading.html')

  // Our loadingEvents object listens for 'finished'
  loadingEvents.on('finished', () => {
    window.loadFile('index.html')
  })

  loadingEvents.on('progress', percentage => {
    window.webContents.send('progress', percentage)
  })

  download(
    'https://512pixels.net/downloads/macos-wallpapers/10-15-Day.jpg'
  )
})

const download = (url, closeCallback) => {
  const file = fs.createWriteStream('big-file.jpg')

  http.get(url, function(response) {
    let total = 0
    response.on('data', (c) => {
      total += c.length
      loadingEvents.emit('progress', total/response.headers['content-length'])
    })
    response.pipe(throttle).pipe(file)
    file.on('finish', function() {
      file.close(() => loadingEvents.emit('finished'))
    })
  }).on('error', function(err) {
    fs.unlink(dest)
  })
}
