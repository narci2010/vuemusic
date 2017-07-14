// 判断是否有这个类
export function hasClass (el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}
// 添加类
export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}
// 获取元素上 data-xxx 属性中的值
export function getData (el, name, val) {
  const prefix = 'data-'
  // 如果val有值，就是set
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  // 如果val没值，就是get
  return el.getAttribute(prefix + name)
}

// 利用transform这个属性的前缀，来检测是哪种浏览器，然后把对应的前缀增加到各个属性上去
let elementStyle = document.createElement('div').style
let vendor = (() => {
  // 1 把各种浏览器类别列举出来
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform',
  }
  // 2 能力检测。遍历上边的值，匹配那个，就返回相应浏览器的前缀
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()
// 3 传进来一个属性，返回一个带前缀的属性
export function prefixStyle (style) {
  // 如果那些属性都不支持，说明你的浏览器有问题
  if (vendor === false) {
    return false
  }
  // 不需要带前缀的属性
  if (vendor === 'standard') {
    return style
  }
  // 给需要带前缀的增加前缀
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
