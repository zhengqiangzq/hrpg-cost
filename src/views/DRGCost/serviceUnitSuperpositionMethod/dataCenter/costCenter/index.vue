<!-- 成本中心 -->
<script setup name="DRGCostServiceUnitCostCenter">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  pageCostCenter,
  exportCostCenter,
  collectCostCenter,
  disableCostCenter,
  enableCostCenter,
  deleteCostCenter
} from "@/api/DRGCostServiceUnitCostCenter";
import {useUpload} from "@/hooks/useUpload";
import {useStorage} from "@vueuse/core";
import Detail from "./detail.vue";
import DetailList from "./detailList.vue";

const { proxy } = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)
const PERMISSION_CODE = 'DRGCostServiceUnitCostCenter'
const API = {
  query: pageCostCenter,
  enable: enableCostCenter,
  disable: disableCostCenter,
  delete: deleteCostCenter,
  collect: collectCostCenter,
  export: exportCostCenter
}
const {
  exportData
} = useUpload(API, null, null, null)
const { tableParameter, openDialog } = useSelectTableData()
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '核算期间', value: 'accountingPeriodName', showLabel: true, type: 'slot' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '成本归集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => openCollectData(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(), },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => disabledData(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '单据号', value: 'orderNo', type: 'slot' },
    { label: '核算期间', value: 'accountingPeriodName' },
    { label: '开始会计期间', value: 'startPeriod' },
    { label: '结束会计期间', value: 'endPeriod' },
    { label: '总金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney) },
    { label: '确认状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
    { label: '制单人', value: 'createUserName' },
    { label: '制单时间', value: 'createTime' },
  ],
  summaryFieldList: [
    { value: 'totalMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const detailListInfo = ref({
  visible: false
})
const detailInfo = reactive({
  visible: false,
})
const dialogInfoRef = ref()
const collectInfo = reactive({
  refObj: null,
  title: '成本归集',
  visible: false,
  data: {
    hospitalName: setting.value.hospitalName
  },
  fieldList: [
    { label: '业务单元', span: 12, value: 'hospitalName', type: 'input', disabled: true },
    { label: '核算期间', span: 12, value: 'accountingPeriodName', type: 'slot' },
    { label: '开始会计期间', span: 12, value: 'startPeriod', type: 'input', disabled: true },
    { label: '结束会计期间', span: 12, value: 'endPeriod', type: 'input', disabled: true },
  ],
  rules: {
    accountingPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: collectData }
  ]
})
const messageInfo = reactive({
  title: '归集',
  visible: false,
  fieldList: [
    { label: '错误信息', span: 12, value: 'message', align: 'left', type: 'slot' },
    { label: '错误级别', span: 12, value: 'levelName', width: '120px', type: 'slot' },
  ],
  data: [],
  btList: [
    { type: 'primary', label: '确认', event: closeMessageInfo }
  ]
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(it => it.label === '删除')
  const enableBtn = btns.find(it => it.label === '确认')
  const disableBtn = btns.find(it => it.label === '取消确认')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status == 1)
  enableBtn.disabled = !rows.length || !!rows.find(it => it.status == 1)
  disableBtn.disabled = !rows.length || !!rows.find(it => it.status == 0)
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    accountingPeriodName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function detail(row) {
  detailInfo.id = row.id
  detailInfo.visible = true
}

function enableData(row) {
  const rows = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  API.enable(rows).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function disabledData(row) {
  const rows = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  API.disable(rows).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function openCollectData() {
  collectInfo.data.orgId = setting.value.hospitalId
  collectInfo.data.hospitalName = setting.value.hospitalName
  collectInfo.visible = true
}

function collectData() {
  collectInfo.refObj.validate(flag => {
    if (flag) {
      API.collect(collectInfo.data).then(res => {
        if (res.success) {
          if (!res.data || res.data?.length === 0) {
            proxy.$message.success('采集成功')
            collectInfo.data = {}
            collectInfo.visible = false
            getList()
          } else {
            messageInfo.data = res.data
            messageInfo.visible = true
          }
        }
      })
    }
  })
}

function closeMessageInfo() {
  messageInfo.visible = false
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openAccountingPeriod(mark) {
  tableParameter.type = 'DRGPeriod'
  tableParameter.query = {}
  tableParameter.mark = mark
  tableParameter.callBack = accountingPeriodCallback
  const ref = mark === 'collect' ? dialogInfoRef.value : filterRef.value
  openDialog(ref)
}
function accountingPeriodCallback(raw) {
  if (tableParameter.mark === 'collect') {
    collectInfo.data.accountingPeriodId = raw.id
    collectInfo.data.accountingPeriodName = raw.name
    collectInfo.data.startPeriod = raw.beginPeriodName
    collectInfo.data.endPeriod = raw.endPeriodName
  } else {
    filterInfo.query.accountingPeriodId = raw.id
    filterInfo.query.accountingPeriodName = raw.name
  }
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!detailInfo.visible && !detailListInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <div class="filter-wrapper">
          <PageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-accountingPeriodName>
              <el-input
                  v-model="filterInfo.query.accountingPeriodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriod('')"><Search /></el-icon>
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
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-orderNo="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.orderNo }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <dialog-form :title="collectInfo.title" :btList="collectInfo.btList" v-model:visible="collectInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="collectInfo.refObj"
          :label-width="collectInfo.labelWidth"
          :data="collectInfo.data"
          :field-list="collectInfo.fieldList"
          :rules="collectInfo.rules"
      >
        <template #form-accountingPeriodName>
          <el-input
              v-model="collectInfo.data.accountingPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriod('collect')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
      <div style="color: #f56c6c; font-size: .75rem;">* 成本中心成本=成本单据总成本-成本单据药品成本-成本单据单收费材料成本+收费数据中患者的药品费+收费数据中患者的单收费材料费</div>
    </dialog-form>
    <dialog-form
        :title="messageInfo.title" :btList="messageInfo.btList" v-model:visible="messageInfo.visible"
    >
      <dialog-table :field-list="messageInfo.fieldList" :data="messageInfo.data" :check-box="false">
        <template #col-message="{ row }">
          <div :class="{ 'error-style': row.level == 1 }">{{ row.message }}</div>
        </template>
        <template #col-levelName="{ row }">
          <div :class="{ 'error-style': row.level == 1 }">{{ row.levelName }}</div>
        </template>
      </dialog-table>
    </dialog-form>
    <Detail
        v-if="detailInfo.visible"
        :id="detailInfo.id"
        v-model:visible="detailInfo.visible"
        @returnBack="getList"
    ></Detail>
    <DetailList
        v-if="detailListInfo.visible"
        v-model:visible="detailListInfo.visible"
        @callback="getList"
    ></DetailList>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
