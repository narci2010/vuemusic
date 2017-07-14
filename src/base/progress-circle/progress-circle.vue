<template>
  <div class="progress-circle">
    <!-- width height真正显示在屏幕上的宽高  viewBox视口(左上角x 左上角y 宽的百分比 高的百分比) -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!--r半径 cx cy圆心坐标-->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!-- stroke-dasharray 描边距离(相当于progress总长)
           stroke-dashoffset 描边的偏移(相当于progress的1-percent)
      -->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent"
              :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'progress-circle',
    props: {
      radius: {
        type: Number,
        default: 100
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100
      }
    },
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  .progress-circle {
    position: relative;
    circle {
      stroke-width: 8px;
      transform-origin: center;
      &.progress-background {
        transform: scale(0.9);
        stroke: $color-theme-d;
      }
      &.progress-bar {
        transform: scale(0.9) rotate(-90deg);
        stroke: $color-theme;
      }
    }
  }
</style>
