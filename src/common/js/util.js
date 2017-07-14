
// 洗牌函数。网上找的算法
export function shuffle (arr) {
  // 不应该对元数据进行修改，而是搞一个副本，然后把这个副本返回出去
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
function getRandomInt (min, max) {
  // 包括max和min
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function debounce (func, delay) {
  let timer

  return function (...args) {
    // 如果被反复调用，直接清掉这个定时器即可
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// export function getDateStr () {
//   let str = ''
//   let date = new Date()
//   let year = date.getFullYear()
//   var month = pad(date.getMonth() + 1);      //   月份从0开始计数[0,1,...,11]
//   var day = pad(date.getDate());
//   str += year + '-' + month + '-' + day
//   return str
// }
// function pad(num) { // 两位，不足两位就补0
//   let len = num.toString().length
//   while (len < 2) {
//     num = '0' + num
//     len++
//   }
//   return num
// }
