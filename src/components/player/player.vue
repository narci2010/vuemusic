<template>
  <div class="player">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>

        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>

        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>

        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{active:currentShow==='cd'}"></span>
            <span class="dot" :class="{active:currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="currentSong.id && !fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!--canplay和error都是w3c标准里的audio的事件  end也是audio的事件-->
    <audio @timeupdate="updateTime"
           @ended="end"
           ref="audio"
           :src="currentSong.url"
           @play="ready"
           @error="error">
    </audio>
  </div>
</template>

<script>
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import ProgressBar from 'base/progress-bar/progress-bar.vue'
  import Scroll from 'base/scroll/scroll'
  import Playlist from 'components/playlist/playlist.vue'

  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import animations from 'create-keyframe-animation'
  import { prefixStyle } from 'common/js/dom'
  import { playMode } from 'common/js/config'
  import Lyric from 'lyric-parser'
  import { playerMixin } from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    name: 'app',
    data () {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      // 根据播放情况，计算对应的样式
      cdCls () {
        return this.playing ? 'play' : 'play pause'
      },
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls () {
        return this.songReady ? '' : 'disable'
      },
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    created () {
      this.touch = {}
    },
    methods: {
      // vue的动画钩子函数
      enter (el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0} scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        // 注册一个叫move的动画
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        // 执行这个叫move的动画,done是回调函数
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter () {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      // 顶部返回按钮
      back () {
        this.setFullScreen(false) // 调用mutation
      },
      open () {
        this.setFullScreen(true)
      },
      middleTouchStart (e) {
        this.touch.initiated = true
        let touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
        // 避免了点击翻页
        if (this.currentShow === 'cd') {
          this.touch.percent = 0
        } else {
          this.touch.percent = 1
        }
      },
      middleTouchMove (e) {
        if (!this.touch.initiated) {
          return
        }
        let touch = e.touches[0]
        let deltaX = touch.pageX - this.touch.startX
        let deltaY = touch.pageY - this.touch.startY
        // 因为歌词列表可以纵向滚动，所以这里要屏蔽掉纵向滚动，直接return
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 歌词的起始left位置
        let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // 只要lyric移动，必然是负数，所以offsetWidth最大值是0，最小值是负的屏幕宽度
        let lyricDeltaX = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.$refs.lyricList.$el.style[transform] = `translate3d(${lyricDeltaX}px,0,0)`
        this.touch.percent = Math.abs(lyricDeltaX / window.innerWidth)
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
      },
      middleTouchEnd () {
        let lyricDeltaX
        let opacity
        // 处于光盘界面，右滑出歌词界面
        if (this.currentShow === 'cd') {
          // 划过了三分之一就不复位
          if (this.touch.percent > 0.3) {
            lyricDeltaX = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            lyricDeltaX = 0
            opacity = 1
          }
        } else { // 处于歌词界面，左滑到光盘界面
          if (this.touch.percent < 0.7) {
            lyricDeltaX = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            lyricDeltaX = -window.innerWidth
            opacity = 0
          }
        }
        let time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${lyricDeltaX}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      prev () {
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
          // 底下把songReady设置为false，由于只有一首歌，那么切歌的时候直接设置currentTime为0，而不是重新ready，
          // songReady状态不会变为true，导致按钮不能点击，所以这里直接return就好了
          return
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      togglePlaying () {
        this.setPlayingState(!this.playing)
        // 歌曲暂停的时候，歌词也要暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      next () {
        if (!this.songReady) {
          return
        }
        // 如果只有一首歌
        if (this.playlist.length === 1) {
          this.loop()
          // 理由同上
          return
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      ready () {
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      error () {
        // 就算出了错误，也能让用户点击上下一首，所以返回true
        this.songReady = true
      },
      updateTime (e) {
        this.currentTime = e.target.currentTime
      },
      end () {
        // 如果是单曲循环播放
        if (this.mode === playMode.loop) {
          this.loop()
        } else { // 如果是(随机或正常)列表播放
          this.next()
        }
      },
      loop () {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        // 循环播放模式下，歌曲播完了要把歌词重置到开头
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      format (interval) {
        interval = interval | 0
        let minute = this._pad(interval / 60 | 0)
        let second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      _pad(num, n = 2) { // 两位，不足两位就补0
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      onProgressBarChange (percent) {
        let currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        // 如果是暂停状态，拖动后也直接播放
        if (!this.playing) {
          this.togglePlaying()
        }
        // 点击进度条，歌词也应该跟着变
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      // **********************************************************
      // 处理歌词。借助lyric-parser库
      getLyric () {
        this.currentSong.getLyric().then((lyric) => {
          // Lyric是lyric-parser里定义的
          // 当快速切歌的时候，因为在play方法里设置了一个1秒的延迟，所以可能在切到下好几首歌的歌词后，才播放下一首歌
          // 这时候加个判断，如果歌词不一致，直接返回
          if (this.currentSong.lyric !== lyric) {
            return
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      // lyric-parser回调函数
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        // 前五行不用滚动。超过5行就滚动了，把当前行滚动到中间
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      // 显示播放列表
      showPlaylist () {
        this.$refs.playlist.show()
      },
      // 由全屏到最小化，需要获取底部播放区域的位置和比例
      _getPosAndScale () {
        let targetWidth = 40 // 底部图片的宽高
        let centerPaddingLeft = 40 // 底部图片的中心距离屏幕左边
        let centerPaddingBottom = 30 // 底部图片中心距离屏幕底边
        let paddingTop = 80 // 大图距离屏幕上边
        let width = window.innerWidth * 0.8  // 大图宽度
        let scale = targetWidth / width  // 缩放比例
        let x = -(window.innerWidth / 2 - centerPaddingLeft) // x变化
        let y = window.innerHeight - paddingTop - width / 2 - centerPaddingBottom // y变化
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong (newSong, oldSong) {
        // 如果歌曲删完了，也就不用监听当前歌曲了
        if (!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) {
          return
        }
        // 每次切歌之后，停掉当时的歌词定时器
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        // 定时器设置久一点，从后台回来前台能继续播放，我暂时不知道为什么，反正这样有效
        clearTimeout(this.timer) // 保证每次播放的时候都清掉以前的状态，以免快速切歌时出错
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing (newPlaying) {
        let audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressCircle,
      ProgressBar,
      Scroll,
      Playlist
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  @import "../../common/scss/mixin";

  .player {
    // 样式嵌套层太多了，拿出来一层
  }

  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    @include bg-image-jpg("../../common/image/bg_content");
    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;
      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    &.normal-enter, &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        font-size: $font-size-large;
        color: $color-text;
        @include no-wrap();
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            &.play {
              animation: rotate 20s linear infinite;
            }
            &.pause {
              animation-play-state: paused;
            }
            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;
          &.time-l {
            text-align: left;
            padding-right: 4px;
          }
          &.time-r {
            text-align: right;
            padding-left: 4px;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: #121823;
    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }
    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }
    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;
      img {
        border-radius: 50%;
        &.play {
          animation: rotate 10s linear infinite;
        }
        &.pause {
          animation-play-state: paused;
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        margin-bottom: 2px;
        font-size: $font-size-medium;
        color: $color-text;
        @include no-wrap();
      }
      .desc {
        font-size: $font-size-small;
        color: $color-text-d;
        @include no-wrap();
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }
      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
