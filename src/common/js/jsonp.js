import originJsonp from 'jsonp'

export default function jsonp (url, data, option) {
  // 如果有问号，说明已经拼接了参数，所以这里不必再加问号了
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

export function param (data) {
  let paramStr = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    paramStr += '&' + k + '=' + encodeURIComponent(value)
  }
  // 从第1个取到最后，第0个是&，所以不要取第0个
  return paramStr ? paramStr.substring(1) : ''
}
