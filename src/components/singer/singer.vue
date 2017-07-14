<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <!-- 子路由 -->
    <router-view></router-view>
  </div>
</template>

<script>
  import { getSingerList } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import Singer from 'common/js/singer'
  import { playlistMixin } from 'common/js/mixin'

  import ListView from 'base/listview/listview'

  // vuex的语法糖，相当于this.$state.xxx的别名
  // xxx需要配置映射的内容，在methods的末尾增加...setSinger({setSinger: SET_SINGER})
  // 然后在其他地方调用setSinger，就等于调用mutation的SET_SINGER方法，即this.$store.commit('方法名', 参数)
  import { mapMutations } from 'vuex'

  const HOT_SINGER_LEN = 10 // 前10条数据为热门歌手
  const HOT_NAME = '热门' // 右边分组导航栏第一个选项

  export default {
    name: 'singer',
    mixins: [playlistMixin],
    data () {
      return {
        singers: []
      }
    },
    created () {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      selectSinger (singer) {
        // 子路由的用法
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer)
      },
      _getSingerList () {
        getSingerList().then((res) => {
          if (ERR_OK === res.code) {
            this.singers = this._sortSingers(res.data.list)
          }
        })
      },
      // 把歌手名字按姓氏首字母分组
      _sortSingers (list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 遍历每一个item,根据Findex分组
        list.forEach((item, index) => {
          // 先把第一组"热门"搞定。即：取前10个
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }
          // 把所有的名字按照姓氏首字母分组
          const key = item.Findex  // key是首字母
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          // value是对应首字母的一组人名
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
        // 对得到的map进一步分组(hot一组，所有一组)与进行排序(对所有排序)
        let hot = [] // 热门的
        let ret = [] // 除开热门的所有的
        // 把map分为两组
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (HOT_NAME === val.title) {
            hot.push(val)
          }
        }
        // 对所有那一组排序
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .singer {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
  }
</style>
