<!-- 医疗服务项目对照 -->
<script setup name="profileConfigProgramCompare">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {
  cancelCompareProfileConfigProgramCompare,
  compareProfileConfigProgramCompare,
  exportProfileConfigProgramCompare,
  pageProfileConfigProgramCompare
} from "@/api/projectCost/profileConfigProgramCompare";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import {exportTemplateExcel} from "@/api/pub";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const {proxy} = getCurrentInstance()
const PERMISSION_CODE = 'profileConfigProgramCompare'
const API = {
  query: pageProfileConfigProgramCompare,
  compare: compareProfileConfigProgramCompare,
  cancelCompare: cancelCompareProfileConfigProgramCompare,
  download: exportTemplateExcel,
  export: exportProfileConfigProgramCompare
}
const TEMPLATE_NAME = 'itemFeeItemStandardsLibMapping'
const UPLOAD_PATH = '/item/feeItemStandardsLibMapping/import/excel'

const {downloadTemplate} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), `${PERMISSION_CODE}:import`)

const {uploadExcelBtns} = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13061',
  action: '/item/feeItemStandardsLibMapping/import/excelRecord',
})
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    {type: 'input', label: '医院服务项目', value: 'feeItem'},
    {type: 'input', label: '规范服务项目', value: 'standardsLib'},
    {type: 'select-model', code: 'fee_yes_or_no', label: '是否对照', value: 'mapped'},
  ],
  filterbtn: [
    {type: 'button', label: '查询', btType: 'primary', event: getList,},
    {type: 'button', label: '重置', event: reset,},
  ],
  btnList: [
    {
      type: 'button',
      btType: 'primary',
      label: '下载模板',
      show: proxy.$permission(`${PERMISSION_CODE}:download`),
      event: () => downloadTemplate('医疗服务项目对照导入模板', `${PERMISSION_CODE}:download`),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      show: proxy.$permission(`${PERMISSION_CODE}:export`),
      event: () => exportData(),
    },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    {label: '医院服务项目编码', value: 'feeItemCode'},
    {label: '医院服务项目名称', value: 'feeItemName'},
    {label: '规范服务项目编码', value: 'standardsLibCode'},
    {label: '规范服务项目名称', value: 'standardsLibName'},
    {label: '项目内涵', value: 'projectConnotation'},
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '对照',
        show: proxy.$permission(`${PERMISSION_CODE}:compare`),
        ifRender: (row) => row.standardsLibId == '-2',
        event: compareData,
      },
      {
        label: '取消对照',
        show: proxy.$permission(`${PERMISSION_CODE}:compare`),
        ifRender: (row) => row.standardsLibId != '-2',
        event: cancelCompareData,
      },
    ]
  },
  sectionRows: []
})

const dialogRef = ref()
const dialogInfo = reactive({
  row: {},
})
const {tableParameter, openDialog} = useSelectTableData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = {
    ...filterInfo.query,
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function compareData(row) {
  dialogInfo.row = JSON.parse(JSON.stringify(row))
  openMSProgramRegulateLibSelector()
}

function cancelCompareData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  API.cancelCompare(ids).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function saveData() {
  const data = dialogInfo.row
  API.compare(data).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

// 导出数据
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

function openMSProgramRegulateLibSelector() {
  tableParameter.title = '规范服务项目'
  tableParameter.type = 'MSProgramRegulateLibrary'
  tableParameter.callBack = (raw) => {
    dialogInfo.row.standardsLibId = raw.id
    dialogInfo.row.standardsLibName = raw.name
    saveData()
  }
  tableParameter.visible = true
  openDialog(filterRef.value)
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
            ref="filterRef"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
          >
          </NewPageFilter>
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
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        @handleEvent="tableHandler"
      >
      </table-container>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
