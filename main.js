const {
    app,
    ipcMain,
    globalShortcut,
    BrowserWindow
} = require('electron')
const Store = require('electron-store');
const log = require('electron-log');
const sudo = require('sudo-prompt');
const AutoLaunch = require('auto-launch');
const path = require('path')
const url = require('url')
const Board = require('./board/init')

const isDevelopment = process.env.NODE_ENV !== 'production'

if (process.platform === 'linux') {

    sudo.exec('id -nG "$USER" | grep -c "dialout"', {
        name: 'check user in a group'
    }, (error, stdout, stderr) => {
        if (!parseInt(stdout)) {
            sudo.exec('usermod -a -G dialout $USER', {
                name: 'add user to dialout group'
            }, (error, stdout, stderr) => {
                log.info('User set to dialout')
            })
        }
    })
}

let autoLaunch = new AutoLaunch({
    name: 'EA7 Vending Machine'
});

autoLaunch.enable();

autoLaunch.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    autoLaunch.enable();
})
.catch(function(err){
    log.error(err)
});

let mainWindow
let appPreferences = {
    serialPort: "",
    slotConfigRaw: (() => {
        let arr = []
        for (let i = 0; i < 10; i++) {
            arr.push((() => {
                let a = []
                for (let j = 0; j < 12; j++) {
                    a.push("")
                }
                return a
            })())
        }
        return arr
    })(),
    slotConfig: [],
    baudRate: 57600
}
let appPreferencesReady = false
let board
let boardReady = 0

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 1920,
        frame: false,
        kiosk: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './dist/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function() {
        mainWindow = null
    })
}

app.allowRendererProcessReuse = false

app.on('ready', () => {
    createWindow()
    initPreferences()
    initBoard()

    ipcMain.on('app:restart', (event, arg) => {
        app.relaunch()
        app.quit()
    })

    log.info('App ready')
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('browser-window-focus', function() {
    globalShortcut.register('CommandOrControl+F1', () => {
        mainWindow.webContents.send('goto', 'Configuration')
    })
    globalShortcut.register("CommandOrControl+R", () => {
        return
    });
    globalShortcut.register("CommandOrControl+Shift+R", () => {
        return
    });
    globalShortcut.register("F5", () => {
        return
    });
    globalShortcut.register("F11", () => {
        return
    });
});

app.on('browser-window-blur', function() {
    globalShortcut.unregister('CommandOrControl+F1')
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('CommandOrControl+Shift+R');
    globalShortcut.unregister('F5');
    globalShortcut.unregister('F11');
});

if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

function initPreferences() {
    const prefSchema = {
        serialPort: {
            type: 'string',
            default: ''
        },
        slotConfigRaw: {
            type: 'string',
            default: JSON.stringify(appPreferences.slotConfigRaw)
        },
        baudRate: {
            type: 'number',
            default: 57600
        }
    }

    const store = new Store({
        schema: prefSchema
    })

    function fetchPreferences() {

        const serialPortPref = store.get('serialPort')
        appPreferences.serialPort = (serialPortPref === undefined) ? "" : serialPortPref
        appPreferences.baudRate = store.get('baudRate')

        try {
            appPreferences.slotConfigRaw = JSON.parse(store.get('slotConfigRaw'))
        } catch (e) {}

        appPreferences.slotConfig = []
        for (let i = 0; i < appPreferences.slotConfigRaw.length; i++) {
            for (let j = 0; j < appPreferences.slotConfigRaw[i].length; j++) {
                if (appPreferences.slotConfigRaw[i][j] !== "") appPreferences.slotConfig.push(appPreferences.slotConfigRaw[i][j])
            }
        }

        if (!appPreferencesReady) {
            appPreferencesReady = true
            mainWindow.webContents.send('appPreferences:ready', appPreferences)
        }

        return appPreferences
    }

    ipcMain.handle('appPreferences:fetch', async (event, key) => {
        return (appPreferencesReady) ? fetchPreferences() : false
    })

    ipcMain.on('appPreferences:set:serialPort', (event, val) => {
        store.set('serialPort', val)
    })

    ipcMain.on('appPreferences:set:slotConfigRaw', (event, val) => {
        store.set('slotConfigRaw', val)
    })

    ipcMain.on('appPreferences:set:baudRate', (event, val) => {
        store.set('baudRate', val)
    })

    fetchPreferences()

}

function initBoard() {
    if (appPreferences.serialPort === '' || appPreferences.slotConfig.length === 0) {

    } else {
        const b = Board({
            serialPort: appPreferences.serialPort,
            slotConfig: appPreferences.slotConfig
        })

        b.on('ready', (__board) => {
            board = __board

            ipcMain.handle('board:motor:trigger', async (event, val) => {
                try {
                    await board.Motor.Trigger(val)
                    return true
                } catch (e) {
                    log.error(e)
                    return false
                }
            })

            boardReady = 1
            mainWindow.webContents.send('board:ready', 1)

        })

        b.on('error', (e) => {
            log.error(e)
            boardReady = 2
            mainWindow.webContents.send('board:ready', 2)
        })
    }

    ipcMain.handle('board:status', async (event, val) => {
        return boardReady
    })

}