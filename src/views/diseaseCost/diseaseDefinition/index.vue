<!-- 示例 -->
<script setup name="diseaseDefinition">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import axios from "axios";
import {ElLoading} from "element-plus";
import {
  addDiseaseDefinition, addDiseaseDefinitionICD,
  deleteDiseaseDefinition, deleteDiseaseDefinitionICD, exportDiseaseDefinition, exportDiseaseDefinitionICD,
  pageDiseaseDefinition,
  pageDiseaseDefinitionICD, updateDiseaseDefinition, updateDiseaseDefinitionICD
} from "@/api/diseaseCostDiseaseDefinition";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostDiseaseDefinition'
const API = {
  query: pageDiseaseDefinition,
  queryICD: pageDiseaseDefinitionICD,
  add: addDiseaseDefinition,
  addICD: addDiseaseDefinitionICD,
  update: updateDiseaseDefinition,
  updateICD: updateDiseaseDefinitionICD,
  delete: deleteDiseaseDefinition,
  deleteICD: deleteDiseaseDefinitionICD,
  download: exportTemplateExcel,
  export: exportDiseaseDefinition,
  exportICD: exportDiseaseDefinitionICD
}
const TEMPLATE_NAME = 'diseaseDefinitionTemplate'
const TEMPLATE_CHILD_NAME = 'diseaseMappingIcdTemplate'
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13068',
  action: '/base/diseaseDefinition/import/excelRecord',
})
const { uploadExcelBtns: uploadExcelRelationshipBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '130681',
  action: '/base/diseaseMappingIcd/import/excelRecord',
})
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '病种编码', value: 'codeLike', type: 'input', event: getList },
    { label: '病种名称', value: 'nameLike', type: 'input', event: getList },
    { label: '是否单病种', value: 'isSingleDisease', type: 'select-model', code: 'yes_or_no', event: getList },
    // { type: 'button', label: '查询', btType: 'primary', event: getList, },
    // { type: 'button', label: '重置', event: reset, },
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
const filterChildInfo = reactive({
  query: {},
  copyQuery: {},
  list: [],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openChildModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteChildData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadChildTemplate(), },
    ...uploadExcelRelationshipBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportChildData(), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '病种编码', value: 'code' },
    { label: '病种名称', value: 'name' },
    { label: '是否单病种', value: 'isSingleDiseaseName' },
    { label: '支付标准', value: 'payStandard', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.payStandard) },
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
        ifRender: (row) => row.sysFlag != 1
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.sysFlag != 1
      },
    ]
  },
  sectionRows: []
})
const tableChildInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '主要诊断代码', value: 'icd10Code' },
    { label: '主要诊断名称', value: 'icd10Name' },
    { label: '手术操作代码', value: 'icd9Code' },
    { label: '手术操作名称', value: 'icd9Name' },
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
        event: openChildModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteChildData,
      },
    ]
  },
  sectionRows: []
})

const dialogInfoRef = ref()
const dialogInfo = reactive({
  refObj: null,
  row: {},
  title: '病种定义',
  visible: false,
  fieldList: [
  ],
  rules: {
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
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

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })
watch(() => tableChildInfo.sectionRows, (rows) => {
  const btns = filterChildInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })
watch(() => filterChildInfo.query, (query) => {
  const btns = filterChildInfo.btnList
  const addBtn = btns.find(btn => btn.label === '新增')
  const downloadBtn = btns.find(btn => btn.label === '下载模板')
  const importBtn = btns.find(btn => btn.label === '导入')
  const exportBtn = btns.find(btn => btn.label === '导出Excel')
  console.log(query)
  addBtn.disabled = downloadBtn.disabled = importBtn.disabled = exportBtn.disabled = !query.definitionId || query.sysFlag == 1
}, { immediate: true, deep: true })

onMounted(() => {
  tableInfo.api = API.query
  tableChildInfo.api = API.queryICD
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep(filterInfo.query)
  tableInfo.refresh = Math.random()
}

// 查询
function getChildList() {
  filterChildInfo.copyQuery = cloneDeep({
    definitionId: filterChildInfo.query.definitionId
  })
  tableChildInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  dialogInfo.fieldList = [
    { label: '病种编码', span: 12, value: 'code', type: 'input' },
    { label: '病种名称', span: 12, value: 'name', type: 'input' },
    { label: '是否单病种', span: 12, value: 'isSingleDisease', type: 'select-model', code: 'yes_or_no' },
    { label: '支付标准', span: 12, value: 'payStandard', type: 'money' }
  ]
  dialogInfo.rules = {
    code: [{ required: true, message: '请输入病种编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入病种名称', trigger: 'blur' }],
        isSingleDisease: [{ required: true, message: '请选择是否单病种', trigger: 'blur' }],
  }
  dialogInfo.row = row ? cloneDeep(row) : {}
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}病种定义`
  dialogInfo.visible = true
}

function openChildModify(row) {
  dialogInfo.fieldList = [
    { label: '主要诊断代码', span: 12, value: 'icd10Code', type: 'slot' },
    { label: '主要诊断名称', span: 12, value: 'icd10Name', type: 'input', disabled: true },
    { label: '手术操作代码', span: 12, value: 'icd9Code', type: 'slot' },
    { label: '手术操作名称', span: 12, value: 'icd9Name', type: 'input', disabled: true },
  ]
  dialogInfo.rules = {
    icd10Code: [{ required: true, message: '请输入主要诊断代码', trigger: 'blur' }],
  }
  dialogInfo.mark = 'child'
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}数据`
  dialogInfo.row = row ? cloneDeep(row) : {}
  dialogInfo.visible = true
}

function saveData() {
  dialogInfo.refObj.validate(flag => {
    if (flag) {
      const data = dialogInfo.row
      const API_MAP = {
        main: [ API.add, API.update ],
        child: [API.addICD, API.updateICD]
      }[dialogInfo.mark === 'child' ? 'child' : 'main']
      const api = data.id ? API_MAP[1] : API_MAP[0]
      api({
        ...data,
        definitionId: dialogInfo.mark ? filterChildInfo.query.definitionId : undefined
      }).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          dialogInfo.visible = false
          dialogInfo.mark === 'child' ? getChildList() : getList()
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

// 删除数据
function deleteChildData(row) {
  const ids = row ? [row.id] : tableChildInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.deleteICD(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

// 下载模板
function downloadTemplate() {
  API.download(TEMPLATE_NAME, `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '病种导入模板')
    }
  })
}

// 下载模板
function downloadChildTemplate() {
  API.download(TEMPLATE_CHILD_NAME).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '病种诊断信息导入模板')
    }
  })
}

// 导出数据
function exportData() {
  API.export(filterInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

// 导出数据
function exportChildData() {
  API.exportICD(filterChildInfo.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  } else if (eventName === 'tableClickRow') {
    filterChildInfo.query.definitionId = raw?.id
    filterChildInfo.query.sysFlag = raw?.sysFlag
    if (!raw || !raw.id) {
      tableChildInfo.data = []
    } else {
      getChildList()
    }
  }
}

// 表格事件处理
const tableChildHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableChildInfo.sectionRows = raw
  }
}

function openICD9Selector() {
  tableParameter.title = '主要手术操作'
  tableParameter.type = 'ICD9File'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = ICD9Callback
  dialogInfoRef.value.openDialog(tableParameter, 'table')
}
function ICD9Callback(raw) {
  dialogInfo.row.icd9Id = raw.id
  dialogInfo.row.icd9Code = raw.code
  dialogInfo.row.icd9Name = raw.name
}

function openICD10Selector() {
  tableParameter.title = '主要诊断'
  tableParameter.type = 'ICD10File'
  tableParameter.query = {}
  tableParameter.visible = true
  tableParameter.callBack = ICD10Callback
  dialogInfoRef.value.openDialog(tableParameter, 'table')
}
function ICD10Callback(raw) {
  dialogInfo.row.icd10Id = raw.id
  dialogInfo.row.icd10Code = raw.code
  dialogInfo.row.icd10Name = raw.name
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md6">
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
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :highlight-row="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <div class="layui-card layui-col-md6">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterChildInfo.btnList">
          </NewPageFilter>
        </div>
        <table-container
            :refresh="tableChildInfo.refresh"
            :init-curpage="tableChildInfo.initCurpage"
            v-model:data="tableChildInfo.data"
            :api="tableChildInfo.api"
            :query="filterChildInfo.copyQuery"
            :tabIndex="true"
            :field-list="tableChildInfo.fieldList"
            :handle="tableChildInfo.handle"
            @handleEvent="tableChildHandler"
        >
        </table-container>
      </div>
    </div>
    <dialog-form :title="dialogInfo.title" :btList="dialogInfo.btList" v-model:visible="dialogInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="dialogInfo.refObj"
          :label-width="dialogInfo.labelWidth"
          :data="dialogInfo.row"
          :field-list="dialogInfo.fieldList"
          :rules="dialogInfo.rules"
      >
        <template #form-icd10Code>
          <el-input
              v-model="dialogInfo.row.icd10Code"
              class="not-mongolia"
              type="input"
              placeholder="请选择主要诊断"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openICD10Selector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #form-icd9Code>
          <el-input
              v-model="dialogInfo.row.icd9Code"
              class="not-mongolia"
              type="input"
              placeholder="请选择主要手术操作"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openICD9Selector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
  </div>
</template>

<style scoped lang="scss">
.layui-card:first-of-type {
  padding-right: 5px;
}
.layui-card:last-of-type {
  padding-left: 5px;
}
</style>
