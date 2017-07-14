<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query">
      <scroll class="shortcut" :data="shortcut" ref="shortcut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
            </h1>
            <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest :query="query" ref="suggest" @select="saveSearch" @listScroll="blurInput"></suggest>
    </div>
    <confirm ref="confirm" @confirm="clearSearchHistory" text="是否清空所有搜索历史？" confirmBtnText="清空"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
  import SearchBox from 'base/search-box/search-box.vue'
  import Scroll from 'base/scroll/scroll'
  import SearchList from 'base/search-list/search-list.vue'
  import Confirm from 'base/confirm/confirm'

  import { getHotWords } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { playlistMixin } from 'common/js/mixin'
  import { searchMixin } from 'common/js/mixin'
  import { mapActions } from 'vuex'

  import Suggest from 'components/suggest/suggest'

  export default {
    mixins: [playlistMixin, searchMixin],
    data () {
      return {
        hotKey: [],
        query: ''
      }
    },
    computed: {
      shortcut () {
        // 这里两个有一个变化就行了。由于scroll的data是数组，所以这里也要封装成数组
        return this.hotKey.concat(this.searchHistory)
      }
    },
    created () {
      this._getHotWords()
    },
    methods: {
      handlePlaylist (playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()

        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()
      },
      showConfirm () {
        this.$refs.confirm.show()
      },
      _getHotWords () {
        getHotWords().then((res) => {
          if (ERR_OK === res.code) {
            this.hotKey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      ...mapActions([
        'clearSearchHistory'
      ])
    },
    watch: {
      // 因为选择一个结果后，从结果页面退出来，此时结果列表多了一个记录，应该刷新一下
      query (newQeury) {
        if (!newQeury) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      Suggest,
      Scroll,
      SearchList,
      Confirm
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  @import "../../common/scss/mixin";

  .search {

  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;
    .shortcut {
      height: 100%;
      overflow: hidden;
      .hot-key {
        padding: 0 20px 20px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.5);
          font-size: $font-size-medium;
          color: $color-text-ll;
        }
      }
      .search-history {
        position: relative;
        margin: 0 20px;
        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-d;
          .text {
            flex: 1;
          }
          .clear {
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
</style>
