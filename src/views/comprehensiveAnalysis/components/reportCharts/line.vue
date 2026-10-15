<script setup>
import {onBeforeUnmount, onMounted, ref, shallowRef, watch} from "vue";
import {init, use} from 'echarts'
import { GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import {merge} from "lodash";

use([GridComponent, BarChart, CanvasRenderer])

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
  grid: {
    top: '30%',
    right: '20%',
    left: '20%',
    bottom: '10%',
  },
  xAxis: {
    name: '病例数',
    minInterval: 1
  },
  yAxis: {
    name: '金额(元)'
  },
  series: [
    {
      data: [],
      endLabel: {
        show: true,
        formatter: '业务收入线'
      },
      type: 'line'
    },
    {
      data: [],
      endLabel: {
        show: true,
        formatter: '总成本线'
      },
      type: 'line'
    },
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
  <div style="width: 100%; height: 100%;" ref="dom"></div>
</template>

<style scoped lang="scss">

</style>