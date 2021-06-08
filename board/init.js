const five = require('johnny-five')
const events = require('events')

module.exports = ({serialPort, slotConfig = []}) => {
    const main = new events.EventEmitter()
    const motor = require('./motor')

    const mc = new five.Board({
        port: serialPort,
        repl: false,
        debug: false
    })

    mc.on('ready', async function() {
        try {
            const Motor = motor({
                five: five,
                slotConfig: slotConfig
            })

            main.emit('ready', {
                Mcu: this,
                Motor: Motor
            })
        } catch(e) {
            main.emit('error', e)
        }
    })

    mc.on('close', () => {
        main.emit('error', 'Board closed')
    })

    mc.on('fail', (e) => {
        main.emit('error', e)
    })

    mc.on('error', (e) => {
        main.emit('error', e)
    })

    return main

}