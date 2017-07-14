<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  // 播放器不属于任何组件，在任何组件里都可以访问到，所以放在App.vue里面
  import Player from 'components/player/player.vue'

  export default {
    components: {
      MHeader, Tab, Player
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
</style>
