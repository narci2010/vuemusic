// vue的mixin可以向调用的组件中插入代码

import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist',
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    },
  },
  methods: {
    // handlePlaylist是给调用它的组件去实现的，如果组件没实现，这里的handlePlaylist方法就会生效，抛出异常
    // 组件里实现了，就会覆盖这里的方法，这里的就不会被调用
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    },
  },
}

export const playerMixin = {
  computed: {
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    changeMode () {
      let mode = (this.mode + 1) % 3 // 总共3种状态
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        // 调用洗牌函数
        list = shuffle(this.sequenceList)
      } else { // 其他播放模式
        list = this.sequenceList
      }
      // 切换playlist的时候，要保证当时的currentIndex不变，总不能放着放着歌就跳歌了吧
      this.resetCurrentIndex(list)
      // 修改playlist。这句不要放上去了，开始搞错了后来才改过来。
      this.setPlaylist(list)
    },
    resetCurrentIndex (list) {
      // findIndex  来自es6
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 来回点击收藏按钮
    toggleFavorite (song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    // 计算收藏按钮的类
    getFavoriteIcon (song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    // 判断这首歌是不是在收藏列表中
    isFavorite (song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE',
      setPlaylist: 'SET_PLAYLIST',
      setPlayMode: 'SET_PLAY_MODE',
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  },
}

export const searchMixin = {
  data () {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory',
    ])
  },
  methods: {
    // 点击关键词，回显到输入框中
    addQuery (query) {
      // 调用输入框组件的方法
      this.$refs.searchBox.setQuery(query)
    },
    // 监听输入框组件派发的事件。再把query传给seggest组件
    onQueryChange (query) {
      this.query = query
    },
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    blurInput () {
      this.$refs.searchBox.blur()
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  },
}
