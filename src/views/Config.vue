<template>
    <section id="config">
        <nav>
            <div class="row middle-xs">
                <div class="col-xs-10">
                    <div class="first" v-if="$store.state.appPreferences.serialPort === '' || $store.state.appPreferences.slotConfig.length === 0">
                        <img src="../assets/figget.gif" height="48" alt="">
                        <h1>First Time Configuration</h1>
                    </div>
                    <router-link class="back-btn" v-else :to="{name: 'Home'}" replace>
                        <img src="../assets/arrow.png" width="20" alt="">
                    </router-link>
                </div>
                <div class="col-xs-2 refresh-btn">
                    <img src="../assets/refresh.png" width="26" alt="" @click="resetToDefault()">
                </div>
            </div>
        </nav>
        <div class="content">
            <form action="#" @submit.prevent="savePref">
                <h3>Board Setting</h3>
                <div class="row">
                    <div class="col-xs-3">
                        <label for="serialPort">Serial Port</label>
                        <select id="serialPort" v-model="pref.serialPort" required="true">
                            <option value="">-</option>
                            <option v-for="port, index in listPorts" :key="index" :value="port.path">{{ port.path }}</option>
                        </select>
                    </div>
                    <div class="col-xs-3">
                        <label for="baudRate">Baud Rate</label>
                        <select id="baudRate" v-model="pref.baudRate" required="true">
                            <option v-for="baud, index in listBaudRates" :key="index" :value="baud">{{ baud }}</option>
                        </select>                    
                    </div>
                </div>
                <div class="devider"></div>
                <h3>Slot Configuration</h3>
                <div class="row slot-conf" v-for="row, i in pref.slotConfigRaw" :key="i">
                    <div class="col-xs-1" v-for="col, j in pref.slotConfigRaw[i]" :key="j">
                        <label for="col">R{{i + 1}}-C{{j + 1}}</label>
                        <select v-model="pref.slotConfigRaw[i][j]" :class="{'input-blue': (pref.slotConfigRaw[i][j] !== '')}" id="col">
                            <option value=""></option>
                            <option v-for="motor, index in listMotorSlot" :key="index" :value="this.motorSlot[index]" :disabled="(motor === null)">{{ this.motorSlot[index] }}</option>
                        </select>
                    </div>
                </div>
                <!-- <div class="row">
                    <div class="col-xs-2">
                        <label for="row">Total Row</label>
                        <input type="number" id="row" min="1" max="8" v-model="pref.row" required="true">
                    </div> 
                </div>
                <div class="spacer"></div>
                <div class="row" v-for="r in parseInt(pref.row)" :key="r">
                    <div class="col-xs-2">
                        <label for="colrow">Total Col in Row {{r}}</label>
                        <input type="number" class="input-blue" id="colrow" min="1" max="10" v-model="pref.col[r - 1]" required="true">
                    </div>
                    <div class="col-xs-1" v-for="c in parseInt(pref.col[r - 1])" :key="c">
                        <label for="col">Col {{c}}</label>
                        <select v-model="pref.slotConfigRaw[r - 1][c - 1]" id="col" required="true">
                            <option value=null>-</option>
                            <option v-for="motor, index in listMotorSlot" :key="index" :value="motor">{{ motor }}</option>
                        </select>
                    </div>
                </div> -->
                <div class="devider" style="margin-top: 10px"></div>
                <transition name="slide">
                    <div class="button-group" v-if="JSON.stringify(pref) !== JSON.stringify(this.$store.state.appPreferences)">
                        <button type="submit">Apply</button>
                        <a href="#" class="btn outline" @click.prevent="cancelPref()">Cancel</a>
                    </div>
                </transition>
            </form>
        </div>
        
        <img class="logo" src="../assets/logo.png" height="35" alt="">
        
        <transition name="fade">
            <div class="overlay" v-if="loading">
                <img src="../assets/figget.gif" width="128" alt="">
            </div>
        </transition>
    </section>
</template>

<script>

const { ipcRenderer } = window.require('electron')
const SerialPort = window.require('serialport');

export default {
    data () {
        return {
            loading: false,
            pref: JSON.parse(JSON.stringify(this.$store.state.appPreferences)),
            listPorts: [],
            listBaudRates: [9600, 19200, 38400, 57600, 115200],
            listMotorSlot: [
                'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16',
                'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16',
                'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16',
                'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16',
                'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16',
                'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16',
                'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16',
                'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12', 'H13', 'H14', 'H15', 'H16',
            ],
            motorSlot: []
        }
    },
    computed: {
        slotConfigRawCom () {
            return this.pref.slotConfigRaw.map(function(arr) {
                return arr.slice();
            })
        }
    },
    watch: {
        slotConfigRawCom: {
            handler (n, o) {
                for (let i = 0; i < n.length; i++) {
                    for (let j = 0; j < n[i].length; j++) {
                        if (n[i][j] !== o[i][j]) {
                            if (n[i][j] !== "") {
                                const idn = this.listMotorSlot.findIndex((g) => g === n[i][j])
                                this.listMotorSlot[idn] = null
                            }
                            if (o[i][j] !== "") {
                                const ido = this.motorSlot.findIndex((g) => g === o[i][j])
                                this.listMotorSlot[ido] = o[i][j]
                            }
                        }                        
                    }                    
                }
            },
            deep: true
        }
    },
    // computed: {
    //     computedPref: function() {
    //         return {
    //             serialPort: this.pref.serialPort,
    //             slotConfigRaw: [
    //                 ...this.pref.slotConfigRaw
    //             ],
    //             row: this.pref.row,
    //             col: [
    //                 ...this.pref.col
    //             ],
    //             slotConfig: [
    //                 ...this.pref.slotConfig
    //             ],
    //             baudRate: this.pref.baudRate
    //         }
    //     }
    // },
    // watch: {
    //     computedPref: {
    //         handler: function (val, old) {

    //             const nr = parseInt(val.row)
    //             const or = parseInt(old.row)

    //             if (nr !== or) {
    //                 if (or < nr) {
    //                     this.pref.col.push(1)
    //                     this.pref.slotConfigRaw.push([""])
    //                 } else {
    //                     this.pref.col.pop()
    //                     this.pref.slotConfigRaw.pop()
    //                 }
    //             } else {
    //                 for (let i = 0; i < val.col.length; i++) {
    //                     const nc = parseInt(val.col[i])
    //                     const oc = parseInt(old.col[i])

    //                     if (nc !== oc) {
    //                         if (oc < nc) {
    //                             this.pref.slotConfigRaw[i].push("")
    //                         } else {
    //                             this.pref.slotConfigRaw[i].pop()
    //                         }
    //                     } else {
    //                         for (let j = 0; j < val.slotConfigRaw[i].length; j++) {
    //                             const np = val.val.slotConfigRaw[i][j]
    //                             const op = val.val.slotConfigRaw[i][j]

    //                             if (np !== op) {

    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         deep: true
    //     }
    // },
    methods: {
        async listSerialPorts() {
            await SerialPort.list().then((ports, err) => {
                if (err) {
                    console.log(err.message)
                    return
                }
                this.listPorts = ports
            })
        },
        savePref () {
            this.loading = true
            ipcRenderer.send('appPreferences:set:serialPort', this.pref.serialPort)
            ipcRenderer.send('appPreferences:set:slotConfigRaw', JSON.stringify(this.pref.slotConfigRaw))
            ipcRenderer.send('appPreferences:set:baudRate', parseInt(this.pref.baudRate))
            setTimeout(() => {
                this.loading = false
                ipcRenderer.send('app:restart', true)
            }, 1000);
        },
        resetToDefault () {
            this.pref = JSON.parse(this.$store.state.appPreferencesDefault)
        },
        cancelPref () {
            this.pref = JSON.parse(JSON.stringify(this.$store.state.appPreferences))
        }
    },
    mounted () {
        this.$store.commit('SET_APPREADY')
    },
    async created () {
        this.listSerialPorts()
        setInterval(() => {
            this.listSerialPorts()
        }, 2000);

        this.motorSlot = this.listMotorSlot.map(function(arr) {
            return arr.slice();
        })

        for (let i = 0; i < this.pref.slotConfigRaw.length; i++) {
            for (let j = 0; j < this.pref.slotConfigRaw[i].length; j++) {
                if (this.pref.slotConfigRaw[i][j] !== "") {
                    const idn = this.listMotorSlot.findIndex((g) => g === this.pref.slotConfigRaw[i][j])
                    this.listMotorSlot[idn] = null
                }                        
            }                    
        }
    }
}
</script>