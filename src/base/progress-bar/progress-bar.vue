<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16  // 滑块的宽度
  const transform = prefixStyle('transform')

  export default {
    name: 'progress-bar',
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created () {
      this.touch = {} // 把touch的数据挂载这个对象上
    },
    methods: {
      // 点击进度条，我们因为得不到duration，所以不能处理歌曲的播放进度。
      // 再者，作为一个非业务组件，也不该自己处理事件。应该把事件派发出去。
      progressClick (e) {
        // getBoundingClientRect 这个方法返回一个矩形对象，
        // 包含四个属性：left、top、right和bottom。分别表示元素各边与对应页面边的距离。
        let rect = this.$refs.progressBar.getBoundingClientRect()
        let offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      progressTouchStart (e) {
        this.touch.initiated = true // 初始化的标记
        this.touch.startX = e.touches[0].pageX  // x轴的位置
        this.touch.left = this.$refs.progress.clientWidth  // 开始时左边走过的距离
      },
      progressTouchMove (e) {
        if (!this.touch.initiated) {
          return
        }
        let deltaX = e.touches[0].pageX - this.touch.startX
        let offsetWidth = Math.min(
          this.$refs.progressBar.clientWidth - progressBtnWidth,
          Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      progressTouchEnd () {
        this.touch.initiated = false
        this._triggerPercent()
      },
      // trigger 引发、引起
      _triggerPercent() {
        let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        let percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      }
    },
    watch: {
      // 根据外界传过来的进度，显示我们滑块的位置
      percent (newPercent) {
        // 拖动的时候不要监视这个变化了，不然滑块会一直跳动
        if (newPercent >= 0 && !this.touch.initiated) {
          //progressBar  progressBtn
          let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          let offsetWidth = newPercent * barWidth
//          this.$refs.progress.style.width = offsetWidth + 'px'
//          this.$refs.progressBtn.style.left = offsetWidth - 8 + 'px'
          // 少用js动画，多用css动画
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  .progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>
