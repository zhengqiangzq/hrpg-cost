<script setup>
import {getCurrentInstance, onBeforeUnmount, onMounted, ref, shallowRef, watch} from "vue";
import {init, use} from 'echarts'
import { TooltipComponent, GridComponent } from 'echarts/components';
import { ScatterChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import {merge} from "lodash";

use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  UniversalTransition
])

const { proxy } = getCurrentInstance()

const props = defineProps({
  option: Object
})

const dom = shallowRef()
const chart = ref()
let activeOption = {
  title: {
    text: ''
  },
  grid: {
    top: '30%',
    bottom: '10%'
  },
  xAxis: {
    name: '数量',
    max: (value) => value.max < 0 ? Math.floor(value.max * .75) : Math.ceil(value.max * 1.25),
    minInterval: 1
  },
  yAxis: {
    name: '金额(元)',
    max: (value) => value.max < 0 ? Math.floor(value.max * .75) : Math.ceil(value.max * 1.25),
  },
  tooltip: {
    // trigger: 'axis',
    showDelay: 0,
    formatter: function (params) {
      return (
      params.value[2] +
      `<br/>${activeOption.xAxis.name}:` +
      params.value[0] +
      `<br/>${activeOption.yAxis.name}:` +
      proxy.$fn.TripartiteMethod(params.value[1]) +
      ''
      );
    },
    axisPointer: {
      show: true,
      type: 'cross',
      lineStyle: {
        type: 'dashed',
        width: 1
      }
    }
  },
  series: [
    {
      symbolSize: 10,
      data: [],
      type: 'scatter'
    }
  ]
}
let resizeObserver = null
onMounted(() => {
  chart.value = init(dom.value)
  setOption(props.option)
  resizeObserver = new ResizeObserver(chart.value.resize)
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
  <div style="overflow: hidden; width: 100%; height: 100%;" ref="dom"></div>
</template>

<style scoped lang="scss">

</style>
