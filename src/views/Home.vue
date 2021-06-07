<template>
    <section id="home">
        <div class="content">
            <div v-for="i in 6" class="row" :key="i">
                <div class="col-xs-3">
                    <div class="wrapper" @click="trigger((i - 1) * 4 + 1)">
                        <img :src="require(`../assets/${i}.png`)" alt="">
                    </div>
                </div>
                <div class="col-xs-3">
                    <div class="wrapper" @click="trigger((i - 1) * 4 + 2)">
                        <img :src="require(`../assets/${i}.png`)" alt="">
                    </div>
                </div>
                <div class="col-xs-3">
                    <div class="wrapper" @click="trigger((i - 1) * 4 + 3)">
                        <img :src="require(`../assets/${i}.png`)" alt="">
                    </div>
                </div>
                <div class="col-xs-3">
                    <div class="wrapper" @click="trigger((i - 1) * 4 + 4)">
                        <img :src="require(`../assets/${i}.png`)" alt="">
                    </div>
                </div>
            </div>
        </div>
        
        <transition name="fade">
            <div class="modal" v-if="loading">
                <div class="wrapper">
                    <img src="../assets/loading.gif" width="100" alt="">
                </div>
            </div>
        </transition>
    </section>
</template>

<script>

const { ipcRenderer } = window.require('electron')

export default {
    data () {
        return {
            loading: false
        }
    },
    methods: {
        async trigger (i) {
            this.loading = true
            if (await ipcRenderer.invoke('board:motor:trigger', i)) {
                console.log('success')
            } else {
                console.log('error')
            }
            this.loading = false
        }
    },
    created () {
        
    }
}
</script>