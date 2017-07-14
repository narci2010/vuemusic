import { commonParams } from './config'
import axios from 'axios'
import jsop from 'common/js/jsonp'

// 获取轮播图列表
// https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg
// g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1498400849619
export function getRecommendList () {
  const url = '/api/getRecommedList'
  const data = Object.assign({}, commonParams, {
    format: 'json',
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    _: new Date().getTime(),
  })
  return axios.get(url, {
    params: data,
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

// 获取歌单列表
// https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg
// ?rnd=0.6782422050448755&g_tk=5381&jsonpCallback=getPlaylist&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&categoryId=10000000&sortId=5&sin=0&ein=29
export function getDiscList () {
  const url = '/api/getDiscList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    loginUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json',
    jsonpCallback: 'getPlaylist' //这只是给服务器看的，实际是找axios要的json数据
  })
  return axios.get(url, {
    params: data,
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

// 根据歌单id获取歌单里的歌曲列表
// https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg
// type=1&json=1&utf8=1&onlysong=0&disstid=2372160429&format=jsonp&g_tk=5381&jsonpCallback=playlistinfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0
export function getSongList (disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    format: 'jsonp',
    loginUin: 0
  })
  return jsop(url, data, {
    param: 'jsonpCallback',
    prefix: '',
    name: 'playlistinfoCallback'
  })
}
