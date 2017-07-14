import jsonp from 'common/js/jsonp'
import { commonParams } from './config'
import axios from 'axios'

// 热门搜索关键词
// https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg
// ?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1499438967791
export function getHotWords () {
  const url = '/api/getHotKey'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    format: 'json',
    needNewCode: 1,
    platform: 'h5',
    _: new Date().getTime(),
  })
  return axios.get(url, {
    params: data,
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

// https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp
// ?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&w=%E5%9 &zhidaqu=1 &catZhida=1 &t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=20&p=1&remoteplace=txt.mqq.all&_=1499476665934
// 点击或者输入关键词
// https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp
// ?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&w=%E5%8 &zhidaqu=1 &catZhida=1 &t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=20&p=1&remoteplace=txt.mqq.all&_=1499476321889

// ?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&w=%E6%A &zhidaqu=1 &catZhida=1 &t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=20&p=1&remoteplace=txt.mqq.all&_=1499479056585
export function search (query, page, zhida, perpage) {
  const url = '/api/search'
  const data = Object.assign({}, commonParams, {
    w: query,
    uin: 0,
    format: 'json',
    needNewCode: 1,
    platform: 'h5',
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage,
    n: perpage,
    p: page,
    remoteplace: 'txt.mqq.all',
    _: new Date().getTime(),
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
