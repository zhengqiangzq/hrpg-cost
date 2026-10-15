<script setup>
import {getCurrentInstance, onBeforeUnmount, onMounted, ref, shallowRef, watch} from "vue";
import {init, use} from 'echarts'
import { GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import {merge} from "lodash";

use([GridComponent, BarChart, CanvasRenderer])

const { proxy } = getCurrentInstance()

const props = defineProps({
  option: Object
})

let dom = shallowRef()
const chart = ref()
let activeOption = {
  title: {
    text: '',
    left: 'left'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c}(元)'
  },
  grid: {
    top: '30%',
    right: '5%',
    bottom: '10%'
  },
  color: ['#7692EF', '#82D3AD', '#CB2D25'],
  legend: {
    type: 'scroll',
    left: '10%',
    top: 30,
    data: []
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value',
    name: '元'
  },
  series: [
    {
      type: 'bar',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
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
  const xData = _option.xAxis?.data
  activeOption = merge(activeOption, _option)
  if (Array.isArray(xData)) {
    activeOption.xAxis.data = xData
  }
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
  <div class="bar_chart_box" style="width: 100%; height: 100%;" ref="dom"></div>
</template>

<style scoped lang="scss">

</style>