import jsonp from 'common/js/jsonp'
import { commonParams } from './config'
// import { getDateStr } from 'common/js/util'
import axios from 'axios'

// 排行榜
// https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg
// ?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1499443262086
export function getTopList () {
  const url = '/api/getTopList'
  const data = {
    uin: 0,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    _: new Date().getTime(),
  }
  return axios.get(url, {
    params: data,
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

// 相应榜单里的歌曲列表
// https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg
// ?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=4&_=1499444131148
export function getSongList (topid) {
  const url = '/api/getRankMusicList'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    tpl: 3,
    page: 'detail',
    type: 'top',
    topid: topid,
    _: new Date().getTime(),
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
