import { commonParams } from './config'
import axios from 'axios'

// 获取歌词
// https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg
// ?callback=MusicJsonCallback_lrc&jsonpCallback=MusicJsonCallback_lrc
export function getLyric (mid) {
  let url = 'api/lyric'
  let data = Object.assign({}, commonParams, {
    pcachetime: new Date().getTime(),
    songmid: mid,
    loginUin: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
