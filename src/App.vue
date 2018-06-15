<template>
<div id="app"></div>
</template>

<script>
import DanmakuClient from 'bilibili-danmaku-client';

localStorage.debug = '*';

export default {
    name: 'App',
    data() {
        return {
            client: new DanmakuClient({
                room: 5441,
            })
        };
    },
    mounted() {
        this.client.start();
    },
}
</script>

<style scoped>
#app {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    overflow: hidden;
    background-color: rgb(236, 236, 236);
}
</style>
