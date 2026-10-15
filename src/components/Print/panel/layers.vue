<template>
  <div class="tag-box">
    <el-tag
      v-for="(layer, index) in layers"
      :key="index"
      :closable="layer === activeElement ? true : false"
      :type="layer === activeElement ? '' : 'info'"
      @click="
        (e) => {
          activeLayer(e, layer)
        }
      "
      @close="
        (e) => {
          dele(e, layer)
        }
      "
      >{{ layer.title }}</el-tag
    >
  </div>
</template>

<script setup>
import { cumulativeOffset, checkInView } from '../utils/offset'
const { proxy } = getCurrentInstance()
const layers = computed(() => {
  return proxy.$store.state.print.page.tempItems
})
const activeElement = computed(() => {
  return proxy.$store.state.print.activeElement
})

function activeLayer(e, item) {
  proxy.$store.commit('print/select', {
    uuid: item.uuid,
  })
  let viewport = document.querySelector('#viewport')
  if (viewport) {
    let target = viewport.querySelector(`[data-uuid='${item.uuid}']`)
    if (target && !checkInView(target)) {
      viewport.scrollTop = cumulativeOffset(target).top - 50
    }
  } else {
    console.error('未找到 "#viewport" 的节点')
  }
}
// 删除元件
function dele(e, item) {
  proxy.$store.commit('print/delete', item.uuid)
}
</script>
<style lang="scss" scoped>
.tag-box {
  .el-tag {
    margin-bottom: 10px;
    margin-right: 10px;
  }
}
</style>
