<!-- 数据校验 -->
<script setup name="DIPCostServiceUnitDataCheck">
import {getCurrentInstance, onMounted, reactive} from "vue";
import {checkData} from "@/api/DIPCost/DIPCostServiceUnitCostCalc";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostServiceUnitDataCheck'

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'periodName', showLabel: true, type: 'slot' },
    { type: 'button', label: '数据校验', show: proxy.$permission(`${PERMISSION_CODE}:check`), btType: 'primary', event: check, },
  ],
  btnList: [
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '错误信息', value: 'message', align: 'left', type: 'slot' },
    { label: '错误级别', value: 'levelName', width: '120px', type: 'slot' },
  ],
  data: [],
  handle: null,
  sectionRows: []
})

const tableParameter = reactive({
  title: '',
  type: '',
  pager: true,
  checkBox: false,
  visible: false,
  filters: [],
  fieldList: [],
  callBack: null,
  query: {}
})

onMounted(() => {
})

function check() {
  if (!filterInfo.query.id) {
    proxy.$message.warning('请先选择核算期间')
    return
  }
  checkData(filterInfo.query.id).then(res => {
    if (res.success) {
      tableInfo.data = res.data
      if (res.data.filter(it => it.level === 1).length === 0) {
        proxy.$message.success('校验通过')
      }
    }
  })
}

function openPeriodSelector() {
  tableParameter.title = '核算期间'
  tableParameter.visible = true
  tableParameter.query = {}
  tableParameter.type = 'DIPPeriod'
  tableParameter.callBack = periodCallback
  filterRef.value.openDialog(tableParameter, 'table')
}
function periodCallback(raw) {
  filterInfo.query.periodName = raw.name
  filterInfo.query.id = raw.id
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-periodName>
              <el-input
                  v-model="filterInfo.query.periodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openPeriodSelector"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :check-box="false"
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
          <template #col-message="{ row }">
            <div :class="{ 'error-style': row.level == 1 }">{{ row.message }}</div>
          </template>
          <template #col-levelName="{ row }">
            <div :class="{ 'error-style': row.level == 1 }">{{ row.levelName }}</div>
          </template>
        </table-container>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
