<script setup>
import {onMounted, ref, watch} from "vue";
import PieChart from './pie.vue'
import BarChart from './bar.vue'
import LineChart from './line.vue'
import ScatterChart from './scatter.vue'
import ChartSwitch from "@/views/comprehensiveAnalysis/components/chartSwitch/index.vue";

const emits = defineEmits(['switchChange'])
const chart = ref()

const CHART_TYPE = {
  pie: PieChart,
  bar: BarChart,
  scatter: ScatterChart,
  line: LineChart
}

const props = defineProps({
  type: String,
  switchers: {
    type: Array,
    default: () => []
  },
  noBorder: Boolean
})

const option = ref({})

onMounted(() => {
  switchers.value = props.switchers || []
})

const active = ref(0)
const switchers = ref([])

watch(active, (val) => {
  emits('switchChange', val)
})

function setOption(_option) {
  option.value = _option
}
function setData(data) {
  chart.value.setData && chart.value.setData(data)
}
function refresh() {
  chart.value.refresh && chart.value.refresh()
}

defineExpose({
  setOption,
  setData,
  refresh
})
</script>

<template>
  <div class="report-charts" :class="{ 'no-border': noBorder }">
    <component :is="CHART_TYPE[type]" ref="chart" :option="option" />
    <chart-switch v-if="switchers?.length" v-model="active" :switchs="switchers" />
  </div>
</template>

<style scoped lang="scss">
.report-charts {
  width: 100%;
  box-sizing: border-box;
  height: 300px;
  position: relative;
  border-radius: 5px;
  border: 1px solid rgba(170, 170, 170, 1);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, .2);
}
.no-border {
  border: none;
  box-shadow: none;
}
</style>