<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
          <slider>
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <!--当BScroll与fastclick冲突的时候，加名字为needsclick的类(该类是fastclick的属性 ),可以消除冲突-->
                <img class="needsclick" @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import Slider from 'base/slider/slider'
  import Loading from 'base/loading/loading'
  import Scroll from 'base/scroll/scroll'

  import { getRecommendList, getDiscList } from 'api/recommend'
  import { ERR_OK } from 'api/config'
  import { playlistMixin } from 'common/js/mixin'

  import { mapMutations } from 'vuex'

  export default {
    mixins: [playlistMixin],
    data () {
      return {
        recommends: [],
        discList: []
      }
    },
    created () {
      // 如果轮播图数据先获取到(高度不够，BScroll不生效)，歌单后获取到(BScroll生效)，那么一切正常
      // 如果先获得歌单，那么BScroll已经生效了，当轮播图获得之后，页面高度已经改变了，BScroll还未改变
      // 这时候就要再次调用better-scroll的refresh方法，但是怎么通知BScroll，可以搞个watch，但是不好
      // 给轮播图加个标记，让它加载成功后改变标记不就行了。@load="loadImage"。load是图片加载后自动调用的
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      _getRecommend() {
        // 这里的then()不是在执行axios后的方法，是在执行getRecommendList方法后的then()方法，
        // 所以不需要剥离data了。
        getRecommendList().then((res) => {
          if (ERR_OK === res.code) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      loadImage() {
        if (!this.checkloaded) {
          this.checkloaded = true
          this.$refs.scroll.refresh()
        }
      },
      selectItem(item) {
        // mutations一个disc，然后歌单详情页面就会根据这个disc而改变
        this.setDisc(item)
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    components: {
      Slider, Loading, Scroll
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/scss/variable";

  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }

  .recommend-content {
    height: 100%;
    overflow: hidden;
  }

  .slider-wraper {
    width: 100%;
    overflow: hidden;
  }

  .recommend-list {
    .list-title {
      height: 65px;
      line-height: 65px;
      text-align: center;
      font-size: $font-size-medium;
      color: $color-theme;
    }
    .item {
      display: flex;
      box-sizing: border-box;
      align-items: center;
      padding: 0 20px 20px 20px;
      .icon {
        flex: 0 0 60px;
        width: 60px;
        padding-right: 20px;
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        font-size: $font-size-medium;
        .name {
          margin-bottom: 10px;
          color: $color-text;
        }
        .desc {
          color: $color-text-d;
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
