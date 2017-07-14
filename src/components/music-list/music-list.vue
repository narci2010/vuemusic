<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!--在滚动列表的时候，需要让列表的背景跟着一起滚，背景在scroll上，scroll肯定不能动的。
    那么可以在列表的下边再放一个bg-layer层，这个层跟着列表滚动就行了。-->
    <!--<div class="bg-layer" ref="layer"></div>-->
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs" :rank="rank" @select="selectItem"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { prefixStyle } from 'common/js/dom'
  import { mapActions } from 'vuex'
  import { playlistMixin } from '../../common/js/mixin'

  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    name: 'music-list',
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        scrollY: 0
      }
    },
    computed: {
      // 根据传过来的图片给bgImage设置背景图?
      // 为什么不直接搞个img标签呢？上边还要放播放按钮的
      bgStyle () {
        return `background-image:url(${this.bgImage})`
      }
    },
    created () {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted () {
      // 高度缓存起来，在滚动bg-layer的时候需要用到
      this.imageHeight = this.$refs.bgImage.clientHeight
      // bg-layer往上滚动的最高点
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      // mixin指定的函数
      handlePlaylist (playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      back () {
        this.$router.back()
      },
      scroll (pos) {
        this.scrollY = pos.y
      },
      selectItem (song, index) {
        this.selectPlay({
          list: this.songs,
          index: index
        })
      },
      random () {
        this.randomPlay({
          list: this.songs
        })
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      // 根据列表滑动，一起移动后边的背景bg-layer
      scrollY (newY) {
        let translateY = Math.max(this.minTranslateY, newY)
        let scale = 1 // 图片放大的比例
        let zIndex = 0  // 列表的z-index值
        let blur = 0 // 图片的高斯模糊效果
        const percent = Math.abs(newY / this.imageHeight)
        // 往下拉的时候，newY是大于0的
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10 // 往下拉的时候列表的z-index要小于bgImage，不然列表会盖住图片下拉的部分
        } else {
          blur = Math.min(20, percent * 20) // 列表越往上，遮罩越暗
        }
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`
        // 当背景滚到最上边时，继续滚动，文字会超出背景，文字会出现在图片上
        // 可以让文字的z-index比图片的小
        // 这时候不让图片占位了，而且让图片高度减小。由于图片是以背景图存在，所以盒子变矮不会压缩图片
        if (newY < 0) {
          if (newY < this.minTranslateY) {
            zIndex = 10
            this.$refs.bgImage.style.paddingTop = 0
            this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
            this.$refs.playBtn.style.display = 'none' // 列表到顶部时，按钮消失
          } else { // 背景没到顶点时，列表往上滑动多少，bgImage就裁掉多少
            // todo 这个paddingTop的后边没有加'px'，导致耗了半天时间，麻蛋
            this.$refs.bgImage.style.paddingTop = this.imageHeight + newY + 'px'
            this.$refs.bgImage.style.height = 0
            this.$refs.playBtn.style.display = ''
          }
        }
        this.$refs.bgImage.style[transform] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components: {
      SongList,
      Scroll,
      Loading
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  @import "../../common/scss/mixin";

  .music-list {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0px;
    @include bg-image-jpg("../../common/image/bg_content");
    background-size: 100% auto;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 100;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .title {
      position: absolute;
      top: 0;
      left: 10%;
      z-index: 40;
      width: 80%;
      text-align: center;
      @include no-wrap();
      line-height: 40px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .bg-image {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 70%;
      transform-origin: top;
      background-size: cover;
      .play-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 50;
        width: 100%;
        .play {
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid $color-theme;
          color: $color-theme;
          border-radius: 100px;
          font-size: 0;
          .icon-play {
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: $font-size-medium-x;
          }
          .text {
            display: inline-block;
            vertical-align: middle;
            font-size: $font-size-small;
          }
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .list {
      position: fixed;
      top: 0; // 这个top要比背景图片低，而每个浏览器背景图片高度都不同，需要在mouted里计算
      bottom: 0;
      width: 100%;
      .song-list-wrapper {
        padding: 10px 30px 20px 30px;
      }
      .loading-container {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>
