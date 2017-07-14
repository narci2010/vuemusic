<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" ref="toplist" :data="topList">
      <ul>
        <li @click="selectItem(item)" class="item" v-for="item in topList">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl">
          </div>
          <ul class="songlist">
            <!-- 因为这里传过来了4首歌，我们封面只需要3首，需要截断 -->
            <li class="song" v-for="(song,index) in item.songList" v-if="index < 3">
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { playlistMixin } from 'common/js/mixin'
  import { getTopList } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { mapMutations } from 'vuex'

  export default {
    mixins: [playlistMixin],
    created () {
      this._getTopList()
    },
    data () {
      return {
        topList: [],
        songList: []
      }
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      },
      selectItem (item) {
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setCurrentTopList(item)
      },
      _getTopList () {
        getTopList().then((res) => {
          if (ERR_OK === res.code) {
            this.topList = res.data.topList
          }
        })
      },
      ...mapMutations({
        setCurrentTopList: 'SET_CURRENT_TOP_LIST'
      })
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";
  @import "../../common/scss/mixin";

  .rank {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }
  .toplist {
    height: 100%;
    overflow: hidden;
    .item {
      display: flex;
      padding: 0 0 0 20px;
      height: 120px;
      &:last-child {
        padding-bottom: 20px;
      }
      .icon {
        flex: 0 0 100px;
        margin-top: 10px;
        width: 100px;
        height: 100px;
      }
      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 10px 0 10px 20px;
        height: 100px;
        overflow: hidden;
        border-bottom: 0 solid rgba(255,255,255,0.2);
        @include border-1px(0,0,1px,0);
        color: $color-text-l;
        font-size: $font-size-small;
        .song {
          @include no-wrap();
          line-height: 26px;
        }
      }
    }
  }
  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
