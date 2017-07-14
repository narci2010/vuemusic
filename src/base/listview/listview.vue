<template>
  <scroll class="listview"
          :data="data"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll"
          ref="listview">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <!-- 把点击事件派发出去 -->
          <li v-for="item in group.items" @click="selectItem(item)" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <!-- 事件会被索引的item接收，stop.prevent阻止事件向下边的歌手列表传递 -->
    <!-- @touchstart 按下去开始，这时候直接滚动 -->
    <!-- @touchmove 按下去后拖动-->
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove" @touchend.stop>
      <ul>
        <li v-for="(item, index) in shortcutList" :data-index="index" class="item"
            :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <!-- 搞个计算属性来确定是否show-->
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { getData } from 'common/js/dom'

  const TITLE_HEIGHT = 30
  const ANCHOR_HEIGHT = 18

  export default {
    name: 'listview',
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList () {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle () {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    data () {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    created () {
      this.probeType = 3
      this.listenScroll = true
      this.touch = {}
      this.listHeight = [] // 列表里面每个元素的高度组成的数组
    },
    methods: {
      // listView充当了scroll的功能，所以也可以向外界暴露refresh方法
      refresh () {
        this.$refs.listview.refresh()
      },
      selectItem (item) {
        // 只需要把事件派发出去
        this.$emit('select', item)
      },
      onShortcutTouchStart (e) {
        // 点击右边的索引后，左边的列表就要滚动。先要得到被点击元素的序号。
        // 已经把索引记载了data-idnex中，直接取来就是。还是把这功能抽取一个方法更好
        let rightIndex = getData(e.target, 'index')
        this.touch.rightIndex = rightIndex  // 把刚点击时的索引存储起来。为touchmove与touchend做准备
        let firstTouch = e.touches[0] // 获得手指。为touchmove准备的
        this.touch.y1 = firstTouch.pageY // 把手指刚点击时的y值存储起来。为touchmove准备
        this._scrollTo(rightIndex)  // 滚动到指定索引的位置
      },
      onShortcutTouchMove (e) {
        let firstTouch = e.touches[0]
        // 手机滑动到的位置的y值
        this.touch.y2 = firstTouch.pageY
        // 滑动经过的索引个数 = 手指滑动产生的距离 / 每一索引的高度
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // 滑动的距离加上滑动开始时候的索引值
        let rightIndex = parseInt(this.touch.rightIndex) + delta
        this._scrollTo(rightIndex)
      },
      // 监听better-scroll派发的滚动事件
      scroll(pos) {
        this.scrollY = pos.y
      },
      _calculateHeight () {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      _scrollTo(index) {
        // 我们在索引的上边和下边都有padding，这个padding也是能被点到的，很显然点到这里后index是没有值的
        // 排除掉这种情况
        if (!index && index !== 0) {
          return
        }
        // 当手指往上滑的时候，rightIndex本来是0，这时候新一步减小，所以小于0，屏蔽掉这该情况
        if (index < 0) {
          index = 0
        }
        // 当手指往下滑的时候，rightIndex已经达到最大值，这时候index还在增加，也屏蔽掉该情况
        else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        // currentIndex是根据监听scrollY来确定的，单是点击右侧还不能让currentIndex改变，所以让scrollY变一下就行了
        this.scrollY = -this.listHeight[index]
        // 第二个参数是是否需要动画
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    },
    watch: {
      data () {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      // 比对scrollY和listHedight，计算列表落在哪个区间
      scrollY (newY) { // 这个newY通过BScroll拿到的
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      // 当前区域的上线与顶部的距离小于fixed-title高度时，此时两个区域的fixed-title会交接
      // 应该让上一个fixed-title往上走，形成一个被挤走的效果
      diff (newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0 )`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";

  .listview {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    //background-color: $color-background;
    .list-group {
      padding-bottom: 30px;
      .list-group-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background-color: $color-highlight-background;
      }
      .list-group-item {
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px;
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .name {
          margin-left: 20px;
          color: $color-text-l;
          font-size: $font-size-medium;
        }
      }
    }
    .list-shortcut {
      position: absolute;
      z-index: 99;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      padding: 20px 0;
      border-radius: 10px;
      text-align: center;
      background-color: $color-background-d;
      font-family: Helvetica;
      .item {
        padding: 3px;
        line-height: 1;
        color: $color-text-l;
        font-size: $font-size-small;
        &.current {
          color: $color-theme;
        }
      }
    }
    .list-fixed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      .fixed-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
