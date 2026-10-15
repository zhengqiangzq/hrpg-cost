<script setup name="largeUsers">
import Modify from './modify.vue'
import Details from './details.vue'
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {useStorage} from "@vueuse/core";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import DetailList from "./detailList.vue";
import {
  deptBigUserCostcancel,
  deptBigUserCostdelete, deptBigUserCostexportExcel,
  deptBigUserCostok,
  deptBigUserCostpage
} from "@/api/deptCost/costData/largeUsers";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()
const setting = useStorage('setting', {}, sessionStorage)


const PAGE_NAME = 'largeUsers'
const PAGE_DOWNNAME = '科室大用户成本导入模板'
const PAGE_PATH = '/deptBigUserCost/importExcel'
const API = {
  page: deptBigUserCostpage,
  delete: deptBigUserCostdelete,
  confirm: deptBigUserCostok,
  unconfirm: deptBigUserCostcancel,
  export: deptBigUserCostexportExcel,
  download: exportTemplateExcel,
}


const {
  downloadTemplate,
  exportData,
} = useUpload(API, PAGE_DOWNNAME, PAGE_PATH, () => getList(),'largeUsers:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'largeUsers',
  type: '13032',
  action: '/deptBigUserCost/import/excelRecord',
})


const filterInfo = ref({
  query: {},
  list: [
    {label: '会计期间', value: 'periodName', showLabel: true, type: 'slot'},
    {label: '单据号', value: 'docNum', type: 'input'},
    {label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status'},
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    {type: 'button', label: '新增', show: proxy.$permission(`${PAGE_NAME}:add`), event: () => openModify()},
    {type: 'button', label: '删除', show: proxy.$permission(`${PAGE_NAME}:delete`), event: () => deleteData()},
    {type: 'button', label: '确认', show: proxy.$permission(`${PAGE_NAME}:confirm`), event: () => enableData(1)},
    {type: 'button', label: '取消确认', show: proxy.$permission(`${PAGE_NAME}:unconfirm`), event: () => enableData(0)},
    {
      type: 'button',
      label: '下载模板',
      show: proxy.$permission(`${PAGE_NAME}:download`),
      event: () => downloadTemplate('','largeUsers:download')
    },
    ...uploadExcelBtns,
    {type: 'button', label: '导出Excel', show: proxy.$permission(`${PAGE_NAME}:export`), event: () => exportData(filterInfo.value.query)},
  ]
})
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '单据号', value: 'docNum', type: 'slot'},
    {label: '会计期间', value: 'periodName'},
    {label: '总金额', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney)},
    {label: '确认状态', value: 'statusName'},
    {label: '备注', value: 'remark'},
    {label: '创建人', value: 'createUserName'},
    {label: '创建时间', value: 'createTime'},
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PAGE_NAME}:update`),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PAGE_NAME}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = ref({
  visible: false,
  title: '大用户'
})

const detailsInfo = ref({
  visible: false,
})

const detailListInfo = ref({
  visible: false
})

const filterRef = ref()


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, {immediate: true})

onMounted(() => {
  tableInfo.value.api = API.page
  getList()
})

function getList() {
  filterInfo.value.copyQuery = {...filterInfo.value.query}
  tableInfo.value.refresh = Math.random()
}

function reset() {
  filterInfo.value.query = {}
  getList()
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}大用户`
  dialogInfo.value.visible = true
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  const api = status === 1 ? API.confirm : API.unconfirm
  api(ids).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

const {tableParameter: useTableParameter, openDialog} = useSelectTableData()


const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})

function openAccountingPeriodSelector() {
  tableParameter.value.title = '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  filterInfo.value.query.periodId = raw.id
  filterInfo.value.query.periodName = raw.periodYearAndMonth
}

</script>

<!-- 资产数据 -->
<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12"
         v-show="!detailsInfo.visible &&!detailListInfo.visible && !dialogInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab currentTab">列表页</div>
          <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
        </div>
        <div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-periodName>
              <el-input
                  v-model="filterInfo.query.periodName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择会计期间"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector()">
                    <Search/>
                  </el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-docNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.docNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :title="dialogInfo.title"
        @returnModify="getList"
    />
    <Details
        v-if="detailsInfo.visible"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
    <DetailList
        v-if="detailListInfo.visible"
        v-model:visible="detailListInfo.visible"
        @callback="getList"
    ></DetailList>
  </div>
</template>

<style scoped lang="scss">

</style>
