<template>
  <div class="song-list">
    <ul>
      <li v-for="(song, index) in songs" @click="selectItem(song, index)" class="item">
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'song-list',
    props: {
      songs: {
        type: Array,
        default: []
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      selectItem (song, index) {
        // 基础组件一律不处理事件，只需要派发事件
        // 把点击的歌曲和序号传出去
        this.$emit('select', song, index)
      },
      getDesc (song) {
        return `${song.singer}.${song.album}`
      },
      getRankCls (index) {
        if (index <= 2) {
          return `icon icon${index}`
        } else {
          return 'text'
        }
      },
      getRankText (index) {
        if (index > 2) {
          return index + 1
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  @import "../../common/scss/mixin";

  .song-list {
    // 嵌套层数太多，拿出来
  }
  .item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 65px;
    font-size: $font-size-medium;
    padding: 6px 0;
    border-bottom: 0 solid rgba(255,255,255,0.2);
    @include border-1px(0,0,1px,0);
    .rank {
      flex: 0 0 25px;
      width: 25px;
      margin-right: 30px;
      text-align: center;
      .icon {
        display: inline-block;
        width: 25px;
        height: 24px;
        background-size: 25px 24px;
        &.icon0 {
          @include bg-image('first')
        }
        &.icon1 {
          @include bg-image('second')
        }
        &.icon2 {
          @include bg-image('third')
        }
      }
      .text {
        color: $color-theme;
        font-size: $font-size-large;
      }
    }
    .content {
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        @include no-wrap();
        color: $color-text;
      }
      .desc {
        @include no-wrap();
        margin-top: 4px;
        color: $color-text-d;
      }
    }
  }
</style>
