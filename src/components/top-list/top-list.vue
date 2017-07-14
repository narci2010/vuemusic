<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import { getMusicList, getSongList } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { mapGetters } from 'vuex'
  import { createSong } from 'common/js/song'

  export default {
    name: 'top-list',
    data () {
      return {
        songs: [],
        rank: true
      }
    },
    computed: {
      title () {
        return this.currentTopList.topTitle
      },
      bgImage () {
        if (this.songs.length) {
          // currentTopList里的那张图太黑了，专辑里的要亮一些
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'currentTopList'
      ])
    },
    created () {
      this._getSongList()
    },
    methods: {
      _getSongList () {
        if (!this.currentTopList.id) {
          this.$router.push('/rank')
          return
        }
        getSongList(this.currentTopList.id).then((res) => {
          if (ERR_OK === res.code) {
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albummid && musicData.songmid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }
  .slide-enter, .slider-leave-to {
    transform: translate3d(100%,0,0);
  }
</style>
