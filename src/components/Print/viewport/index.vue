<template>
  <div id="viewport" data-type="viewport" class="holder">
    <div
      :style="{
        height: page.height + 'px',
        width: page.width + 'px',
        backgroundImage: 'url(' + backImg + ')',
      }"
      class="screen"
    >
      <!-- 组件 -->
      <component
        v-for="val in widgetStore"
        :is="val.type"
        :data-title="val.type"
        :class="{ active: widgetId === val.uuid }"
        :key="val.uuid"
        :val="val"
        :data-type="val.type"
        :data-uuid="val.uuid"
        class="layer"
      ></component>

      <!-- 参考线 -->
      <!-- <ref /> -->

      <!-- 尺寸控制器 -->
      <control />
    </div>
  </div>
</template>

<script setup>
import control from './size-control.vue'
const { proxy } = getCurrentInstance()

// 已添加的组件
const widgetStore = computed(() => {
  return proxy.$store.state.print.page.tempItems
})
// 背景图地址
const backImg = computed(() => {
  return proxy.$store.state.print.page.imageUrl
    ? proxy.$store.state.print.page.imageUrl
    : ''
})
// 画布高度
const page = computed(() => {
  return proxy.$store.state.print.page
})
// 选中项id
const widgetId = computed(() => {
  return proxy.$store.state.print.uuid
})

onMounted(() => {
  // 采用事件代理的方式监听元件的选中操作
  let viewportDom = document.getElementById('viewport')
  if (viewportDom) {
    viewportDom.addEventListener('mousedown', handleSelection, false)
  } else {
    console.error('未找的‘viewport’节点')
  }
  // 绑定键盘上下左右键用于元件的移动
  document.addEventListener(
    'keydown',
    (e) => {
      e.stopPropagation()
      var target = proxy.$store.state.print.activeElement
      // 左
      if (e.keyCode === 37 && target.left) {
        target.left -= 1
        return
      }
      // 上
      if (e.keyCode === 38 && target.top) {
        e.preventDefault()
        target.top -= 1
        return
      }
      // 右
      if (e.keyCode === 39 && target.left) {
        target.left += 1
        return
      }
      // 下
      if (e.keyCode === 40 && target.top) {
        e.preventDefault()
        target.top += 1
      }
    },
    true
  )
})

/**
 * 目标元素获得焦点
 */
function handleSelection(e) {
  var target = selectTarget(e.target)
  if (target) {
    var uuid = target.getAttribute('data-uuid')
    // 设置选中元素
    proxy.$store.commit('print/select', {
      uuid: uuid || -1,
    })
    // 绑定移动事件：除背景图以外的元件才能移动
    target = proxy.$store.state.print.activeElement
    if (target.dragable) {
      initmovement(e) // 参见 mixins
    }
  } else {
    // 取消选中元素
    proxy.$store.commit('print/select', {
      uuid: -1,
    })
  }
}
 /**
     * 初始化鼠标拖拽事件
     * @param {*} e 
     */
   function  initmovement(e) {
      var target = proxy.$store.state.print.activeElement

      // 设置移动状态初始值
      proxy.$store.commit('print/initmove', {
        startX: e.pageX,
        startY: e.pageY,
        originX: target.left,
        originY: target.top
      })

      // 绑定鼠标移动事件
      document.addEventListener('mousemove', handlemousemove, true)

      // 取消鼠标移动事件
      document.addEventListener('mouseup', handlemouseup, true)
    }

    /**
     * 鼠标移动
     * @param {*} e 
     */
     function handlemousemove(e) {
      e.stopPropagation()
      e.preventDefault()

      proxy.$store.commit('print/move', {
        x: e.pageX,
        y: e.pageY
      })
    }

    /**
     * 鼠标up
     */
     function  handlemouseup() {
      document.removeEventListener('mousemove', handlemousemove, true)
      document.removeEventListener('mouseup', handlemouseup, true)
      proxy.$store.commit('print/stopmove')
    }
/**
 * 获得选中的目标，如果没有返回false
 */
function selectTarget(target) {
  let type = target.getAttribute('data-type')
  if (type) {
    if (type === 'viewport') {
      return false
    } else {
      return target
    }
  } else {
    return selectTarget(target.parentNode)
  }
}
</script>

<style scoped>
.holder {
  display: flex;
  justify-content: center;
  overflow: auto;
  font-size: 0;
  border: 1px solid #f5f5f5;
  border-width: 0 1px;
  background-image: linear-gradient(
      45deg,
      #f5f5f5 25%,
      transparent 0,
      transparent 75%,
      #f5f5f5 0
    ),
    linear-gradient(
      45deg,
      #f5f5f5 25%,
      transparent 0,
      transparent 75%,
      #f5f5f5 0
    );
  background-position: 0 0, 13px 13px;
  background-size: 26px 26px;
}
.screen {
  margin: 25px auto;
  transform-origin: center top;
  position: relative;
  box-shadow: 0 0 5px 1px #cccccc;
  background-color: #ffffff;
  background-repeat: no-repeat;
}
</style>
