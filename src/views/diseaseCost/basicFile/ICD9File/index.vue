<!-- ICD9档案 -->
<script setup name="diseaseCostICD9File">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import axios from "axios";
import {ElLoading} from "element-plus";
import {addICD9File, deleteICD9File, exportICD9File, pageICD9File, updateICD9File} from "@/api/diseaseCostICD9File";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostICD9File'
const API = {
  query: pageICD9File,
  add: addICD9File,
  update: updateICD9File,
  delete: deleteICD9File,
  download: exportTemplateExcel,
  export: exportICD9File
}
const TEMPLATE_NAME = 'icd9Template'
const UPLOAD_PATH = '/base/diseaseIcd9/import/excel'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13065',
  action: '/base/diseaseIcd9/import/excelRecord',
})
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'input', label: '手术操作代码', value: 'codeLike' },
    { type: 'input', label: '手术操作名称', value: 'nameLike' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '手术操作代码', value: 'code' },
    { label: '手术操作名称', value: 'name' },
    { label: '拼音码', value: 'pinyinCode' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = reactive({
  refObj: null,
  row: {},
  title: 'ICD-9档案',
  visible: false,
  fieldList: [
    { label: '手术操作代码', span: 12, value: 'code', type: 'input' },
    { label: '手术操作名称', span: 12, value: 'name', type: 'input' },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请输入手术操作代码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入手术操作名称', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

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

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  dialogInfo.row = row ? cloneDeep(row) : {}
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}ICD-9档案`
  dialogInfo.visible = true
}

function saveData() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const data = dialogInfo.row
      const api = data.id ? API.update : API.add
      api(data).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          dialogInfo.visible = false
          getList()
        }
      })
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

// 下载模板
function downloadTemplate() {
  API.download(TEMPLATE_NAME, 'diseaseCostICD9File:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, 'ICD-9档案导入模板')
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
          ></NewPageFilter>
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
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          @handleEvent="tableHandler"
      >
      </table-container>
    </div>
    <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
      <page-form
          v-model:ref-obj="dialogInfo.refObj"
          :label-width="dialogInfo.labelWidth"
          :data="dialogInfo.row"
          :field-list="dialogInfo.fieldList"
          :rules="dialogInfo.rules"
      ></page-form>
    </dialog-form>
  </div>
</template>

<style scoped lang="scss">

</style>
