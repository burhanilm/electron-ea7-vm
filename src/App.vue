<template>
  <router-view />
  <transition name="fade">
      <div class="overlay" v-if="!$store.state.appReady">
          <img src="./assets/figget.gif" width="128" alt="">
      </div>
  </transition>
</template>

<script>

const { ipcRenderer } = window.require('electron')

export default {
  async created () {

    const pref = await ipcRenderer.invoke('appPreferences:fetch', true)
    if (!pref) {
      ipcRenderer.on('appPreferences:ready', (event, arg) => {
        if (arg) {
          this.$store.commit('SET_PREFERENCES', arg)
          if (arg.serialPort === '' || arg.slotConfig.length === 0) this.$router.replace({name: 'Configuration'})
        }
      })
    } else {
      this.$store.commit('SET_PREFERENCES', pref)
      if (pref.serialPort === '' || pref.slotConfig.length === 0) this.$router.replace({name: 'Configuration'})
    }
    
    if (!(await ipcRenderer.invoke('board:status', true))) {
      ipcRenderer.on('board:ready', (event, arg) => {
        this.$store.commit('SET_BOARD_READY')
      })
    } else {
      this.$store.commit('SET_BOARD_READY')
    }

    ipcRenderer.on('goto', (event, arg) => {
      this.$router.replace({name: arg})
    })
  }
}
</script>

<style lang="sass">

@import ./assets/flexboxgrid.css
@import ./assets/global.sass


.content
  padding: 24px 24px 0

#home
  .content
    .wrapper
      text-align: center
      border-radius: 15px 0 15px 0
      box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.06)
      border: 1px solid #dfdfdf
      margin-bottom: 24px

      background-image: url(./assets/level.png)
      background-size: 30px 30px
      background-repeat: no-repeat
      background-position: right top

      img
        display: inline-block
        width: 162px

#config
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: #2c2f33

  nav
    padding: 7px 30px
    border-bottom: 1px solid #25272b
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

  .content
    padding: 30px 30px 0

  .first
    h1
      font-weight: 500
      color: #ffffff
      font-size: 16px
      line-height: 45px
      letter-spacing: 1px
      display: inline-block

    img
      display: inline-block
      margin-right: 16px

  .back-btn
    display: inline-block
    margin: 17px 0 11px

  .refresh-btn
    text-align: right

    img
      display: inline-block

  h3
    margin-bottom: 17px

  .slot-conf

    margin-right: -7px
    margin-left: -7px
    
    .col-xs-1
      padding-right: 7px
      padding-left: 7px

    input, 
    select
      margin-bottom: 7px
      font-size: 22px
      font-weight: 800
      line-height: 55px

  .button-group
    text-align: right
    display: block
    width: 100%
    margin-left: -10px
    margin-right: -10px


.modal
  position: fixed
  left: 0
  top: 0
  width: 100%
  height: 100%
  background: rgba(0, 0, 0, 0.12)

  .wrapper
    padding: 70px
    position: fixed
    left: 50%
    top: 50%
    transform: translate(-50%, -50%)
    background: white
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.06)

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.5s ease

.fade-enter-from,
.fade-leave-to 
  opacity: 0


.fade-enter-active
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1)

.fade-leave-active
  transition: all 0.4s cubic-bezier(0.64, 0, 0.78, 0)

.fade-enter-from,
.fade-leave-to 
  opacity: 0
  transform: scale(2)



.slide-enter-active
  transition-duration: 0.1s
  transition-timing-function: ease-in

.slide-leave-active
  transition-duration: 0.1s
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1)

.slide-enter-to, .slide-leave-from 
  max-height: 50px
  overflow: hidden

.slide-enter-from, .slide-leave-to 
  overflow: hidden
  max-height: 0


</style>
