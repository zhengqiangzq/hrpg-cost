<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import ReportCharts from "@/views/comprehensiveAnalysis/components/reportCharts/index.vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import {analysis} from "@/api/beddayCost/hospitalComposition";

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

const title = ref('院级床日成本分类构成分析')
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
  ]
})

const { chartRef: scatterChartRef, setData: scatterSetData, setOption: scatterSetOption } = useChart({
})

const { chartRef: barChartRef, setData: barSetData, setOption: barSetOption } = useChart({
  title: { text: '医院排名前50床日成本分类构成图' },
  legend: {
    show: true,
    data: ['成本项目']
  },
  series: [
    {
      name: '成本项目',
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
  analysis(props.query).then(({ data }) => {
    info.value = data
    pieSwitchChange()
    scatterSwitchChange()
    barSetOption({
      xAxis: { data: data.histogram?.map(it => it.name) || [] }
    })
    barSetData([
      data.histogram?.map(it => it.value) || [],
    ])
  })
}
function pieSwitchChange() {
  const key = 'cost'
  const data = (info.value || {})[`${key}Pie`]
  const name = '合计'
  const title = '医院床日成本构成分析'
  pieSetOption({
    title: {
      text: title
    },
    legend: { data: data.pieList?.map(it => it.name) || [] },
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
    data.pieList || [],
    [data.total || 0]
  ])
}
function scatterSwitchChange() {
  const key = 'cost'
  const data = (info.value || {})[`${key}Points`]
  const title = '医院床日成本项目分布图'
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
            <el-col :span="12">分析期间：{{ query.periodName }}</el-col>
          </el-row>
        </el-col>
        <el-col :span="14">
          <el-row class="box-border analysis-info" align="middle">
            <el-col :span="5">床日成本: <span class="money">{{ info.totalCost != null ? $fn.TripartiteMethod(info.totalCost) : '-' }}元</span></el-col>
            <el-col :span="10" class="inline-info">
              <el-row :gutter="5">
                <el-col :span="12">人员经费: <span class="money">{{ info.personnelExpensesCost != null ? $fn.TripartiteMethod(info.personnelExpensesCost) : '-' }}元</span></el-col>
                <el-col :span="12">药品费: <span class="money">{{ info.drugCost != null ? $fn.TripartiteMethod(info.drugCost) : '-' }}元</span></el-col>
                <el-col :span="12">无形资产摊销费: <span class="money">{{ info.intangibleAssetsAmortizationCost != null ? $fn.TripartiteMethod(info.intangibleAssetsAmortizationCost) : '-' }}元</span></el-col>
                <el-col :span="12">计提医疗风险基金: <span class="money">{{ info.medicalVentureFundCost != null ? $fn.TripartiteMethod(info.medicalVentureFundCost) : '-' }}元</span></el-col>
              </el-row>
            </el-col>
            <el-col :span="9" class="inline-info">
              <el-row :gutter="5">
                <el-col :span="12">卫生材料费: <span class="money">{{ info.healthMaterialCost != null ? $fn.TripartiteMethod(info.healthMaterialCost) : '-' }}元</span></el-col>
                <el-col :span="12">固定资产折旧费: <span class="money">{{ info.fixedAssetsDepreciationCost != null ? $fn.TripartiteMethod(info.fixedAssetsDepreciationCost) : '-' }}元</span></el-col>
                <el-col :span="12">其他医疗费用: <span class="money">{{ info.otherCost != null ? $fn.TripartiteMethod(info.otherCost) : '-' }}元</span></el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="10">
          <report-charts ref="pieRef" type="pie">
          </report-charts>
        </el-col>
        <el-col :span="14">
          <report-charts ref="scatterChartRef" type="scatter" />
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
