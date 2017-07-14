<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getSingerDetail } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'

  import MusicList from 'components/music-list/music-list'

  export default {
    name: 'singer-detail',
    data () {
      return {
        songs: []
      }
    },
    computed: {
      title () {
        return this.singer.name
      },
      bgImage () {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created () {
      this._getSingerDetail()
    },
    methods: {
      _getSingerDetail () {
        // 本页面的singer是上个页面通过url的id传过来的，如果用户在详情页面刷新，我们是拿不到id的，所以会出错
        // 这里把这种让它跳转到歌手页面。
        // todo 子路由刷新
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (ERR_OK === res.code) {
            // 得到歌曲列表，但是歌曲里面的内容很多，重新包装出自己想要的就行了
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          // ES6 解构
          let {musicData} = item
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

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
