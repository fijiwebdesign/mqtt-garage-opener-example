// controller.js
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

var garageState = ''
var connected = false

client.on('connect', () => {
  console.log('Connected, subscribing...')
  client.subscribe('garage/connected')
  client.subscribe('garage/state')
  client.publish('controller/connected', 'true')
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'garage/connected':
      return handleGarageConnected(message)
    case 'garage/state':
      return handleGarageState(message)
  }
  console.log('No handler for topic %s', topic)
})

function handleGarageConnected (message) {
  console.log('garage connected status %s', message)
  connected = (message.toString() === 'true')
}

function handleGarageState (message) {
  garageState = message
  console.log('garage state update to %s', message)
}

function openGarageDoor () {
  // can only open door if we're connected to mqtt and door isn't already open
  if (connected && garageState !== 'open') {
    // Ask the door to open
    client.publish('garage/open', 'true')
  }
}

function closeGarageDoor () {
  // can only close door if we're connected to mqtt and door isn't already closed
  if (connected && garageState !== 'closed') {
    // Ask the door to close
    client.publish('garage/close', 'true')
  }
}

// --- For Demo Purposes Only ----//

// promise garage door connected
function onceGarageConnected(timeout = 5000) {
  return new Promise((resolve, reject) => {
    var timer = setTimeout(() => reject(), timeout)
    client.once('message', (topic, message) => {
      if(topic === 'garage/connected') {
        resolve(message)
      }
    })
  })
}

onceGarageConnected()
  .then(() => {
    
    // simulate opening garage door
    setTimeout(() => {
      console.log('open door')
      openGarageDoor()
    }, 5000)

    // simulate closing garage door
    setTimeout(() => {
      console.log('close door')
      closeGarageDoor()
    }, 20000)

  })
  .catch(() => {
      console.log('Failed to connect to garage door')
  })