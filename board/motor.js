const log = require('electron-log')

module.exports = ({
    five,
    dropDetection,
    dropDetectorPin,
    slotConfig
}) => {
    
    const mcpAddrStart = 32
    const mcpMap = ["A", "B", "C", "D", "E", "F", "G", "H"]

    const _dropDetection = (dropDetection)
    const _dropDetectorPin = (dropDetectorPin === undefined) ? 3 : dropDetectorPin

    const sensor = (_dropDetection) ? new johnny.Button(_dropDetectorPin) : undefined

    const defaultConfig = [
        'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
        'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16',
        'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
        'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16',
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
        'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16',
        'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
        'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16'
    ]

    const _slotConfig = (slotConfig === undefined || slotConfig.length == 0) ? defaultConfig : slotConfig

    let mcp = {}
    for (let i = 0; i < mcpMap.length; i++) {
        mcp[mcpMap[i]] = new five.Expander({
            controller: "MCP23017",
            address: mcpAddrStart + i
        })
    }

    const RunMotor = (m) => {
        return new Promise((resolve, reject) => {

            log.info(">> Triggering motor " + m)

            if (_dropDetection) {
                let err_count = 0

                const readDetector = setInterval(() => {
                    const val = sensor.value
                    if (!val) {
                        clearInterval(readDetector)
                        log.info("Drop success " + m)
                        return resolve(true)
                    } else {
                        err_count++
                        if (err_count >= 120) {
                            clearInterval(readDetector)
                            log.info("Drop error " + m)
                            return resolve(false)
                        }
                    }
                }, 50)
            }

            let mtr = (m).match(/[a-z]+|\d+/ig)

            mcp[mtr[0]].digitalWrite(parseInt(mtr[1]) - 1, 1)
            setTimeout(() => {
                log.info(">> Auto run " + m)
                mcp[mtr[0]].digitalWrite(parseInt(mtr[1]) - 1, 0)

                if (!_dropDetection) {
                    setTimeout(() => {
                        return resolve(true)
                    }, 3500)
                }
            }, 1000)

        })
    }

    const Trigger = (slot, qty = 1) => {
        return new Promise(async (resolve, reject) => {

            if (qty < 1) return reject({
                code: 7002,
                message: "Quantity must be greater then zero"
            })

            let errorCount = 0,
                _slot = null

            if (Number.isInteger(slot) && slot <= _slotConfig.length) _slot = _slotConfig[slot - 1]
            else if (_slotConfig.includes(slot)) _slot = slot
            else return reject({
                code: 7001,
                message: "Slot not available"
            })

            for (let i = 0; i < qty; i++) {
                if (!await RunMotor(_slot)) errorCount++
            }

            return resolve({
                errorCount: errorCount
            })

        })
    }

    return {
        Trigger: Trigger
    }
}