import jsonp from 'common/js/jsonp'
import { commonParams } from './config'

// 获取歌手列表，只获取前100位，不做Loadmore
// https://c.y.qq.com/v8/fcg-bin/v8.fcg
// ?channel=singer&page=list&key=all_all_all&pagesize=100&pagenum=1&g_tk=5381&jsonpCallback=GetSingerListCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0
export function getSingerList () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    loginUin: 0,
    format: 'jsonp',
    // jsonpCallback: 'GetSingerListCallback',
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
  })
  return jsonp(url, data, {
    // jsonp会自动把它们拼到url中
    param: 'jsonpCallback',
    prefix: '',
    name: 'GetSingerListCallback'
  })
}
// 歌手详情
// https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg
// ?g_tk=5381&jsonpCallback=MusicJsonCallbacksinger_track&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&singermid=002J4UUk29y8BY&order=listen&begin=0&num=30&songstatus=1
export function getSingerDetail (singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const data = Object.assign({}, commonParams, {
    loginUin: 0,
    format: 'jsonp',
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    singermid: singerId,
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1
  })
  return jsonp(url, data, {
    param: 'jsonpCallback',
    prefix: '',
    name: 'MusicJsonCallbacksinger_track'
  })
}
