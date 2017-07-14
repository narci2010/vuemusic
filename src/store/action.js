// action一般用于异步操作
// 或者是封装mutation，比如某个动作需要触发多个mutation，那么就很适合封装成action

import * as types from './mutation-types'
import  { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

// 点击歌曲列表的歌曲
// 第一个参数{commit, state}是解构获取数据，不需要外界传入，外界传入的是第二个参数{list, index}
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
  // 我们这里要获得state里面的东西进行计算，得到计算结果后再commit
  // 但是如果直接修改state里面的值是不允许的，所以需要获取一个state里面的值的副本,由于是数组，用splice方法即可获取副本
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 当前歌曲。必须在插入歌曲之前取得，因为下边还要用到这个值
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有被点击的歌。如果不在列表中，那就直接加再末尾；如果在，那就干掉旧的，把这个新的插到末尾
  let fpIndex = findIndex(playlist, song)
  // 因为要把即将插入的歌曲放到当前歌曲的后边，所以索引+1，然后把新歌放到这个新的curentIndex
  currentIndex++

  // 插入这首歌到当前索引的位置
  playlist.splice(currentIndex, 0, song)
  // 如果包含了这首，那么就有个重复的了，必须干掉一个
  if (fpIndex > -1) {
    // 如果插入序号在旧的序号后边，那么干掉旧的之后，插入的就要往前边挪一个位置
    if (currentIndex > fpIndex) {
      // 干掉旧的
      playlist.splice(fpIndex, 1)
      // 往前挪了一个位置，所以-1
      currentIndex--
    } else {
      // 反之，插入序号在旧的前边，干掉旧的，currentIndex位置不变，不需要-1
      // 因为前边多了一个，所以旧的索引+1了，即fpIndex+1
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 插入原本的序列，那就考虑的很少了
  // 得到当前"播放/暂停中"的歌曲，把即将插入的歌曲放到当前歌曲的后边
  // 直接+1，作为要即将插入歌曲的位置。
  let currentSeqIndex = findIndex(sequenceList, currentSong) + 1
  // 判断点击的歌是否在列表中
  let fseqIndex = findIndex(sequenceList, song)
  // 插入歌曲。这里不需要弄什么+1或者-1了，因为这个列表只是增加一个歌曲记录而已，不会影响当前播放列表
  sequenceList.splice(currentSeqIndex, 0, song)
  // 如果在列表中
  if (fseqIndex > -1) {
    // 插入的比旧的要大，干掉旧的
    if (currentSeqIndex > fseqIndex) {
      sequenceList.splice(fseqIndex, 1)
    } else {
      // 插入的比旧的小。因为此时旧的前边多了一个，所以旧的索引+1了，需要删除(fseqIndex+1)处的才行
      sequenceList.splice(fseqIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}

export const deleteSongList = function ({commit}) {
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
  commit(types.SET_FULL_SCREEN, false)
}

export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
