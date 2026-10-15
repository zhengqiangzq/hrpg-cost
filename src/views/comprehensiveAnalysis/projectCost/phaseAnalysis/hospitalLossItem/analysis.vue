<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import ReportCharts from "@/views/comprehensiveAnalysis/components/reportCharts/index.vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import {analysisDeptPhaseAnalysis} from "@/api/projectCost/hospitalLossItemPhaseAnalysis";

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

const title = ref('院级收费类别亏损分析')
const info = ref({
})

const { chartRef: pieRef, setData: pieSetData, setOption: pieSetOption } = useChart({
  series: [
    {
      type: 'pie',
      radius: [50, 80],
      center: ['50%', '60%'],
      right: 160,
      data: [],
      label: {
        alignTo: 'edge',
        formatter: (params) => {
          return `{name|${params.name}}\n{money|${proxy.$fn.TripartiteMethod(params.value)} 元}`
        },
        minMargin: 5,
        edgeDistance: 10,
        lineHeight: 15,
        rich: {
          money: {
            fontSize: 10,
            color: '#999'
          }
        }
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
      type: 'custom',
      data: [0],
      coordinateSystem: 'none',
      universalTransition: true,
      animationDurationUpdate: 1000,
      renderItem: function (params, api) {
        return {
          type: "text",
          x: api.getWidth() *.5 - 80,
          y: api.getHeight() * .56,
          silent: true,
          style: {
            text: `合计\n{money|${proxy.$fn.TripartiteMethod(api.value(0))}元}`,
            rich: {
              money: {
                fontSize: 10,
                fill: '#333'
              }
            },
            textAlign: "center",
            fill: "#999",
            fontSize: 12,
            fontWeight: 600
          },
        }
      },
    }
  ]
})

const { chartRef: scatterChartRef, setData: scatterSetData, setOption: scatterSetOption } = useChart({
})

const { chartRef: barChartRef, setData: barSetData, setOption: barSetOption } = useChart({
  title: { text: '医院亏损收费类别前20分析' },
  legend: {
    show: true,
    data: ['有保本点数量', '无保本点数量']
  },
  yAxis: {
    name: '数量'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c}个'
  },
  series: [
    {
      name: '有保本点数量',
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
      name: '无保本点数量',
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
  analysisDeptPhaseAnalysis(props.query).then(({ data }) => {
    info.value = data
    pieSwitchChange(0)
    scatterSwitchChange(0)
    barSetOption({
      xAxis: { data: data.cylinderList?.map(it => it.name) || [] }
    })
    barSetData([
      data.cylinderList?.map(it => it.costValue) || [],
      data.cylinderList?.map(it => it.incomeValue) || []
    ])
  })
}
function pieSwitchChange(index) {
  const data = (info.value || {}).barList
  const name = ['合计'][index]
  const title = ['医院亏损服务项目成本构成分析'][index]
  pieSetOption({
    title: {
      text: title
    },
    legend: { data: data?.map(it => it.name) || [] },
    series: [
      {},
      {
        type: 'custom',
        coordinateSystem: 'none',
        universalTransition: true,
        animationDurationUpdate: 1000,
        renderItem: function (params, api) {
          return {
            type: "text",
            x: api.getWidth() *.5 - 80,
            y: api.getHeight() * .56,
            silent: true,
            style: {
              text: `${name}\n{money|${proxy.$fn.TripartiteMethod(api.value(0))}元}`,
              rich: {
                money: {
                  fontSize: 10,
                  fill: '#333'
                }
              },
              textAlign: "center",
              fill: "#999",
              fontSize: 12,
              fontWeight: 600
            },
          }
        },
      }
    ]
  })
  pieSetData([
    data || [],
    [data.reduce((prev, cur) => prev + (cur.value || 0), 0) || 0]
  ])
}
function scatterSwitchChange(index) {
  const key = ['profit', 'loss'][index]
  const data = (info.value || {})[`${key}List`]
  const title = ['医院亏损服务项目分布图', '医院亏损服务项目分布图'][index]
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
            <el-col :span="12">分析期间：{{ query.beginPeriodName }}~{{ query.endPeriodName }}</el-col>
          </el-row>
        </el-col>
        <el-col :span="14">
          <el-row class="box-border analysis-info" align="middle">
            <el-col :span="8">亏损项目: <span class="money">{{ info.loss }}种</span></el-col>
            <el-col :span="8">有保本点项目: <span class="money">{{ info.lossItem }}种</span></el-col>
            <el-col :span="8">无保本点项目: <span class="money">{{ info.noLossItem }}种</span></el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="10">
          <report-charts ref="pieRef" type="pie">
          </report-charts>
        </el-col>
        <el-col :span="14">
          <report-charts ref="scatterChartRef" type="scatter" :switchers="['有保本点', '无保本点']" @switch-change="scatterSwitchChange" />
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <report-charts ref="barChartRef" type="bar" />
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
