<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import ReportCharts from "@/views/comprehensiveAnalysis/components/reportCharts/index.vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import {analysis} from "@/api/deptCost/medicalTechComprehensive";

const {proxy} = getCurrentInstance()
const emits = defineEmits(['update:visible'])

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  query: {
    type: Object,
    required: true,
  }
})

const title = ref('医技本量利分析')
const info = ref({})

const {chartRef: lineRef, setData: lineSetData, setOption: lineSetOption} = useChart({
  title: {text: '医技本量利图'},
})


const {chartRef: scatterChartRef, setData: scatterSetData, setOption: scatterSetOption} = useChart({})

const {chartRef: barChartRef, setData: barSetData, setOption: barSetOption} = useChart({
  title: {text: '科室医技本量利图'},
  legend: {
    show: true,
    data: ['保本工作量', '保本收入', '边际贡献'],
  },
  yAxis: [
    {name: '元', type: 'value'},
    {name: '人次', type: 'value', minInterval: 1},
  ],
  series: [
    {
      name: '保本工作量',
      type: 'line',
      yAxisIndex: 1,
      data: [],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c}人次'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
    {
      name: '保本收入',
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
    {
      name: '边际贡献',
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
  ],
  xAxis: {
    nameRotate: 45
  }
})

const cacheData = ref({})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emits('update:visible', newValue)
  },
})

onMounted(() => {
  getAnalysis()
})

function getAnalysis() {
  analysis(props.query).then(({data}) => {
    info.value = data
    putLineData(data)
    scatterSwitchChange(0)
    barSetOption({
      xAxis: {data: data.histogram?.map(it => it.name) || []}
    })
    barSetData([
      data.histogram?.map(it => it.protectionWorkNum) || [],
      data.histogram?.map(it => it.protectionIncome) || [],
      data.histogram?.map(it => it.marginalContribution) || [],
    ])
  })
}

function putLineData(data) {
  const lineSeriesMark = [
    {},
    {
      markLine: {
        data: [
          {yAxis: data.line[0].value}
        ],
        symbol: 'none',
        label: {
          formatter: '固定成本线'
        },
        silent: true,
        lineStyle: {
          color: '#000',
        },
        animation: false
      },
    }
  ]
  if (data.line[3].number > 0) {
    // y = aX + b
    // 计算 line1 a
    const line1A = (data.line[1].value - data.line[0].value) / data.line[1].number
    // y = aX
    // 计算line2 a
    const line2A = data.line[2].value / data.line[2].number
    // 存在交点，将交点扩大2倍得到x
    const x = data.line[3].number * 2
    // 计算line1后点y
    data.line[1].number = data.line[2].number = x
    data.line[1].value = line1A * x + data.line[0].value
    data.line[2].value = line2A * x
    lineSeriesMark[0] = {
      markPoint: {
        symbol: 'circle',
        symbolSize: 8,
        silent: true,
        label: {
          offset: [30, 20],
          color: '#000',
          formatter: '保本点'
        },
        emphasis: {
          disabled: false,
        },
        data: [
          {xAxis: data.line[3].number, yAxis: data.line[3].value},
        ]
      },
      markLine: {
        label: {
          // show: false
        },
        symbol: 'none',
        data: [
          {yAxis: data.line[3].value},
          {xAxis: data.line[3].number}
        ],
        silent: true,
        lineStyle: {
          color: '#000',
          // type: 'solid'
        },
      },
    }
  }
  lineSetOption({
    series: lineSeriesMark
  })
  lineSetData([
    [
      [0, 0], [data.line[2].number, data.line[2].value]
    ],
    [
      [data.line[0].number, data.line[0].value], [data.line[1].number, data.line[1].value]
    ],
  ])
}

function scatterSwitchChange(active) {
  const key = ['income', 'cost'][active]
  const data = (info.value || {})[`${key}Points`]
  const title = ['医院收费项目分布图', '医院成本项目分布图'][active]
  scatterSetOption({
    title: {
      text: title
    }
  })
  scatterSetData([
    data.map(it => {
      return [it.number, it.money, it.name]
    }) || []
  ])
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div style="padding: 0 10px;">
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="10">
          <el-row class="box-border basic-info" align="middle">
            <el-col :span="24" class="info-title">{{ title }}</el-col>
            <el-col :span="12">成本类型：{{ dict_cost_type.find(it => it.value == query.costType)?.key }}</el-col>
            <el-col :span="12">分析期间：{{ query.startPeriodName }}~{{ query.endPeriodName }}</el-col>
          </el-row>
        </el-col>
        <el-col :span="14">
          <el-row class="box-border analysis-info" align="middle">
            <el-col :span="8">累计收入: <span
                class="money">{{ info.totalIncome != null ? $fn.TripartiteMethod(info.totalIncome) : '-' }}元</span>
            </el-col>
            <el-col :span="8">累计成本: <span
                class="money">{{ info.totalCost != null ? $fn.TripartiteMethod(info.totalCost) : '-' }}元</span>
            </el-col>
            <el-col :span="8">累计结余: <span
                class="money">{{ info.totalBalance != null ? $fn.TripartiteMethod(info.totalBalance) : '-' }}元</span>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="10">
          <report-charts ref="lineRef" type="line">
          </report-charts>
        </el-col>
        <el-col :span="14">
          <report-charts ref="scatterChartRef" type="scatter" :switchers="['收入', '成本']"
                         @switch-change="scatterSwitchChange"/>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <report-charts ref="barChartRef" type="bar"/>
        </el-col>
      </el-row>
    </div>
  </ModifyPage>
</template>

<style scoped lang="scss">
.box-border {
  border-radius: 5px;
  border: 1px solid rgba(170, 170, 170, 1);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, .2);
}

.basic-info, .analysis-info {
  height: 65px;
  text-align: center;
}

.analysis-info {
  font-size: 1.25em;

  .money {
    color: #B80017;
  }
}

.inline-info {
  font-size: .7em !important;
  padding-right: 10px;
  text-align: right;
}

.inline-info :deep(.el-col) > *:not(span) {
  width: 8em;
}

.info-title {
  font-size: 1.25rem;
  font-weight: bold;
}


</style>
