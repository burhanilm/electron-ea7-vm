import {
    createStore
} from 'vuex'

function appPreferencesDefault() {
    return {
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
}

export default createStore({
    state: {
        appReady: false,
        appPreferences: appPreferencesDefault(),
        appPreferencesDefault: JSON.stringify(appPreferencesDefault()),
        appPreferencesReady: false,
        boardReady: false
    },
    mutations: {
        SET_PREFERENCES(state, data) {
            state.appPreferences = {
                ...data
            }
            state.appPreferencesReady = true
            if (state.boardReady) state.appReady = true
        },
        SET_BOARD_READY(state) {
            state.boardReady = true
            if (state.appPreferencesReady) state.appReady = true
        },
        SET_APPREADY(state) {
            state.appReady = true
        }
    },
    actions: {},
    modules: {}
})