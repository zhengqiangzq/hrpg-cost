<script setup>
import {onBeforeUnmount, onMounted, ref, shallowRef, watch} from "vue";
import {init, use} from 'echarts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import {merge} from "lodash";

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout
])

const props = defineProps({
  option: Object
})

const dom = shallowRef()
const chart = ref()
let activeOption = {
  title: {
    text: '',
    left: 'left'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b} : {c} ({d}%)'
  },
  legend: {
    type: 'scroll',
    orient: 'vertical',
    width: 150,
    right: 10,
    top: 20,
    bottom: 20,
    data: []
  },
  series: [
  ]
}
let resizeObserver = null
onMounted(() => {
  chart.value = init(dom.value)
  setOption(props.option)
  resizeObserver = new ResizeObserver((entries) => {
    chart.value.resize()
    setOption(props.option)
  })
  resizeObserver.observe(dom.value)
})

onBeforeUnmount(() => {
  resizeObserver.unobserve(dom.value)
})

watch(() => props.option, (_option) => {
  setOption(_option)
}, { deep: true })

function setOption(_option) {
  activeOption = merge(activeOption, _option)
  refresh()
}

function setData(data) {
  data.forEach((it, index) => {
    if (activeOption.series[index]) {
      activeOption.series[index].data = it
    }
  })
  refresh()
}

function refresh() {
  chart.value.setOption(activeOption)
}

defineExpose({
  setData,
  refresh,
  chart
})
</script>

<template>
  <div style="width: 100%; height: 100%;" ref="dom"></div>
</template>

<style scoped lang="scss">

</style>