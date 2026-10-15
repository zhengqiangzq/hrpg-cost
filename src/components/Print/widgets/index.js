import braidTxt from './txt/index.vue'
import barCode from './bar-code/index.vue'
import table from './table/index.vue'
import image from './image/index.vue'
import html from './html/index.vue'
import horizontalLine from './horizontalLine/index.vue'
import verticalLine from './verticalLine/index.vue'
const install = function (Vue) {
  Vue.component(braidTxt.name, braidTxt)
  Vue.component(barCode.name, barCode)
  Vue.component(table.name, table)
  Vue.component(image.name, image)
  Vue.component(html.name, html)
  Vue.component(horizontalLine.name, horizontalLine)
  Vue.component(verticalLine.name, verticalLine)
}

const getWidgetsSetting = function () {
  return {
    [braidTxt.name]: braidTxt.setting,
    [barCode.name]: barCode.setting,
    [table.name]: table.setting,
    [image.name]: image.setting,
    [html.name]: html.setting,
    [horizontalLine.name]: horizontalLine.setting,
    [verticalLine.name]: verticalLine.setting,
  }
}
export default {
  install,
  getWidgetsSetting
}
