<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportDetailListAssessmentScheme, pageDetailListAssessmentScheme} from "@/api/deptCost/assessmentScheme";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:assessmentScheme'
const API = {
  query: pageDetailListAssessmentScheme,
  export: exportDetailListAssessmentScheme
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '目标方案', value: 'schemeKeyword', type: 'input' },
    { label: '考核指标', value: 'indicatorsKeyword', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData }
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '考核方案编码', value: 'schemeCode' },
    { label: '考核方案名称', value: 'schemeName' },
    { label: '开始会计期间', value: 'startPeriodName' },
    { label: '结束会计期间', value: 'endPeriodName' },
    { label: '指标代码', value: 'indicatorsCode' },
    { label: '指标名称', value: 'indicatorsName' },
    { label: '权重', value: 'weight', align: 'center' },
    { label: '区间一得分', value: 'intervalOneScore', align: 'center' },
    { label: '最佳值', value: 'optimumValue', align: 'center' },
    { label: '区间二得分', value: 'intervalTwoScore', align: 'center' },
    { label: '目标值', value: 'targetValue', align: 'center' },
    { label: '区间三得分', value: 'intervalThreeScore', align: 'center' },
    { label: '基准值', value: 'referenceValue', align: 'center' },
    { label: '区间四得分', value: 'intervalFourScore', align: 'center' },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: null,
  sectionRows: []
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function exportData() {
  API.export(filterInfo.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}
</script>

<template>
  <div className="view-fill">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :check-box="false"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
