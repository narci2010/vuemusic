<template>
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :pullup="pullup"
          @scrollToEnd="searchMore"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
  import NoResult from 'base/no-result/no-result'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  import { search } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'
  import { mapMutations, mapActions } from 'vuex'
  import Singer from 'common/js/singer'

  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default {
    name: 'suggest',
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      query: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        page: 1,
        pullup: true,
        beforeScroll: true,
        hasMore: true,
        result: []
      }
    },
    methods: {
      refresh () {
        this.$refs.suggest.refresh()
      },
      search () {
        // 第一次请求的时候，复位请求页数和scroll的位置
        this.page = 1
        this.$refs.suggest.scrollTo(0, 0)
        // 判断是否还有更多数据，以控制上拉刷新组件
        this.hasMore = true
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (ERR_OK === res.code) {
            // 里面的数据乱七八糟，进一步处理，得出我们的歌手和歌名组成的数组
            this.result = this._genResult(res.data)
            // 计算是否有更多数据
            this._checkMore(res.data)
          }
        })
      },
      // 上拉刷新
      searchMore () {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            // 这里必须是添加数据，不能直接用等号
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      getIconCls (item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      _genResult (data) {
        let ret = []
        // 如果是歌手
        if (data.zhida && data.zhida.singerid) {
          // 在第一行增加一个歌手标记，好显示不同样式（字体图标）
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid && musicData.songmid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      // 判断是否还有更多数据
      _checkMore (data) {
        const song = data.song
        // 已经传过来的页数*每页的条数 > 总条数
        if (!song.list.length || song.curpage * perpage >= song.totalnum) {
          this.hasMore = false
        }
      },
      // 歌曲或者歌手的名字
      getDisplayName (item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      selectItem (item) {
        if (item.type === TYPE_SINGER) {
          let singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          // 这是在当前列表插入，不是在该歌星的列表插入。
          // 在歌手列表，点击一个歌手，就会把整个列表刷新为该歌手的歌。
          // 而这里是插入歌曲，不会干掉以前的列表，只是在以前的列表上增加这首被点击的歌
          this.insertSong(item)
        }
        this.$emit('select', item)
      },
      // 监听滚动事件，当滚动的时候隐藏键盘,因为键盘是input组件粗发的，所以需要进一步派发给search组件，由searc转给search-box
      listScroll () {
        this.$emit('listScroll')
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      query (newQuery) {
        this.search(newQuery)
      }
    },
    components: {
      NoResult,
      Scroll,
      Loading
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  @import "../../common/scss/mixin";

  .suggest {
    height: 100%;
    overflow: hidden;
  }

  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }
    .icon {
      flex: 0 0 30px;
      width: 30px;
      [class^="icon-"] {
        font-size: 14px;
        color: $color-text-d;
      }
    }
    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-ll;
      overflow: hidden;
      .text {
        @include no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }

</style>
