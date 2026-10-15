<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import {dict_cost_type} from "@/views/comprehensiveAnalysis/common/fakeDict";
import ReportCharts from "@/views/comprehensiveAnalysis/components/reportCharts/index.vue";
import {useChart} from "@/views/comprehensiveAnalysis/components/useChart";
import {
  analysisDoctorMedicalSettlementVolumeProfitAnalysis
} from "@/api/DRGCost/doctorMedicalSettlementVolumeProfitAnalysis";

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

const title = ref('主诊医生医保结算本量利分析')
const info = ref({
})

const { chartRef: lineRef, setData: lineSetData, setOption: lineSetOption } = useChart({
  title: { text: '主诊医生医保结算本量利图' },
})

const { chartRef: scatterChartRef, setData: scatterSetData, setOption: scatterSetOption } = useChart({
  title: { text: '主诊医生DRGs成本分布图' },
})

const { chartRef: barChartRef, setData: barSetData, setOption: barSetOption } = useChart({
  title: { text: '主诊医生排名前50DRGs成本图' },
  series: [{ name: '成本' }],
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
  analysisDoctorMedicalSettlementVolumeProfitAnalysis(props.query).then(({ data }) => {
    info.value = data
    const lineSeriesMark = [
      {},
      {
        markLine: {
          data: [
            { yAxis: data.line[0].value }
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
            { xAxis: data.line[3].number, yAxis: data.line[3].value },
          ]
        },
        markLine: {
          label: {
            // show: false
          },
          symbol: 'none',
          data: [
            { yAxis: data.line[3].value },
            { xAxis: data.line[3].number }
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
    scatterSetData([
      data.pointList?.map(it => {
        return [it.number, it.money, it.name]
      }) || []
    ])
    barSetOption({
      xAxis: { data: data.cylinderList?.map(it => it.name) || [] }
    })
    barSetData([
        data.cylinderList?.map(it => it.value) || []
    ])
  })
}
</script>

<template>
  <ModifyPage v-model:visible="showDialog" no-full-button>
    <div style="padding: 0 10px;">
      <el-row :gutter="10" style="margin-bottom: 10px;">
        <el-col :span="7">
          <el-row class="box-border basic-info" align="middle">
            <el-col :span="24" class="info-title">{{ title }}</el-col>
            <el-col :span="8">成本类型：{{ dict_cost_type.find(it => it.value == query.costType)?.key }}</el-col>
            <el-col :span="8">主诊医生：{{ query.mainDoctorName }}</el-col>
            <el-col :span="8">分析期间：{{ query.accountingPeriodName }}</el-col>
          </el-row>
        </el-col>
        <el-col :span="17">
          <el-row class="box-border analysis-info" align="middle">
            <el-col :span="5">本期成本: <span class="money">{{ info.costTotal != null ? $fn.TripartiteMethod(info.costTotal) : '-' }}元</span></el-col>
            <el-col :span="10" class="inline-info">
              <el-row :gutter="5">
                <el-col :span="12">人员经费: <span class="money">{{ info.personnelAmount != null ? $fn.TripartiteMethod(info.personnelAmount) : '-' }}元</span></el-col>
                <el-col :span="12">药品费: <span class="money">{{ info.drugAmount != null ? $fn.TripartiteMethod(info.drugAmount) : '-' }}元</span></el-col>
                <el-col :span="12">无形资产摊销费: <span class="money">{{ info.intangibleAssetsAmortizationAmount != null ? $fn.TripartiteMethod(info.intangibleAssetsAmortizationAmount) : '-' }}元</span></el-col>
                <el-col :span="12">计提医疗风险基金: <span class="money">{{ info.medicalVentureFundAmount != null ? $fn.TripartiteMethod(info.medicalVentureFundAmount) : '-' }}元</span></el-col>
              </el-row>
            </el-col>
            <el-col :span="9" class="inline-info">
              <el-row :gutter="5">
                <el-col :span="12">卫生材料费: <span class="money">{{ info.healthMaterialAmount != null ? $fn.TripartiteMethod(info.healthMaterialAmount) : '-' }}元</span></el-col>
                <el-col :span="12">固定资产折旧费: <span class="money">{{ info.fixedAssetsDepreciationAmount != null ? $fn.TripartiteMethod(info.fixedAssetsDepreciationAmount) : '-' }}元</span></el-col>
                <el-col :span="12">其他医疗费用: <span class="money">{{ info.otherOperatingExpensesAmount != null ? $fn.TripartiteMethod(info.otherOperatingExpensesAmount) : '-' }}元</span></el-col>
              </el-row>
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
