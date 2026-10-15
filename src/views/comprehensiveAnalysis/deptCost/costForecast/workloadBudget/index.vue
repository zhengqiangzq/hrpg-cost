<script setup>
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import {
  addWorkloadBudget,
  deleteWorkloadBudget, exportWorkloadBudget,
  pageWorkloadBudget,
  updateWorkloadBudget
} from "@/api/deptCost/workloadBudget";
import {sectiontree} from "@/api/accountingDepartment";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'deptCost:workloadBudget'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageWorkloadBudget,
  add: addWorkloadBudget,
  update: updateWorkloadBudget,
  delete: deleteWorkloadBudget,
  download: exportTemplateExcel,
  export: exportWorkloadBudget
}
const TEMPLATE_NAME = 'workloadForecastTemplate'
const UPLOAD_PATH = '/deptCost/deptWorkloadForecast/import/excel'

const {
  uploadInfo,
    beforeUpload,
    uploadError,
    uploadSuccess,
    exportData,
    downloadTemplate
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), 'deptCost:workloadBudget:import')

const filterInfoRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'slot', label: '核算科室', showLabel: true, value: 'deptName', event: getList },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('工作量预算导入模板','deptCost:workloadBudget:download'), },
    { type: 'slot', label: '导入', show: proxy.$permission(`${PERMISSION_CODE}:import`), value: 'uploadFile', },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '预算年度', value: 'year' },
    { label: '核算科室编码', value: 'deptCode' },
    { label: '核算科室名称', value: 'deptName' },
    { label: '业务量', value: 'workload', align: 'center' },
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
  title: '工作量预算',
  visible: false,
  fieldList: [
    { label: '预算年度', span: 12, value: 'year', type: 'date', dateType: 'year', valueFormat: 'YYYY' },
    { label: '核算科室', span: 12, value: 'deptName', type: 'slot' },
    { label: '业务量', span: 12, value: 'workload', type: 'number', min: 0 },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
  ],
  rules: {
    year: [{ required: true, message: '请选择预算年度', trigger: 'change' }],
    deptName: [{ required: true, message: '请选择核算科室', trigger: 'change' }],
    workload: [{ required: true, message: '请输入业务量', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: true,
  isLeaf: false,
  mark: null,
  checkList: [],
  api: sectiontree,
  query: {}
})

const { tableParameter, openDialog } = useSelectTableData()
const dialogInfoRef = ref()

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
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    deptName: undefined
  })
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
  dialogInfo.title = row ? '修改工作量预算' : '新增工作量预算'
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

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openDeptSelector(cache, single) {
  deptTreeInfo.checkBox = !single
  deptTreeInfo.visible = true
  deptTreeInfo.cache = cache
  deptTreeInfo.single = !!single
}
function treeCallback(raw) {
  const row = deptTreeInfo.cache
  if (deptTreeInfo.single) {
    row.deptId = raw.id
    row.deptName = raw.name
  } else {
    deptTreeInfo.checkedList = raw;
    row.deptIdIn = raw.map(it => it.id).join(',')
    row.deptName = raw.map(it => it.name).join(',')
  }
}
</script>

<template>
<!-- 工作量预算 -->
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <PageFilter
              ref="filterInfoRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
          >
            <template #filter-deptName>
              <el-input
                  v-model="filterInfo.query.deptName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择核算科室"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openDeptSelector(filterInfo.query)"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </PageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
            <template v-slot:filter-uploadFile>
              <el-upload
                  :headers="uploadInfo.headers"
                  :show-file-list="false"
                  :data="uploadInfo.data"
                  :on-error="uploadError"
                  :on-success="uploadSuccess"
                  :before-upload="beforeUpload"
                  :action="uploadInfo.action"
              >
                <el-button>导入</el-button>
              </el-upload>
            </template>
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
          ref="dialogInfoRef"
          v-model:ref-obj="dialogInfo.refObj"
          :label-width="dialogInfo.labelWidth"
          :data="dialogInfo.row"
          :field-list="dialogInfo.fieldList"
          :rules="dialogInfo.rules"
      >
        <template #form-deptName>
          <el-input
              v-model="dialogInfo.row.deptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector(dialogInfo.row, true)"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="deptTreeInfo.visible"
        v-model:showDialog="deptTreeInfo.visible"
        :title="deptTreeInfo.title"
        :checkStrictly="deptTreeInfo.checkStrictly"
        :isLeaf="deptTreeInfo.isLeaf"
        :query="deptTreeInfo.query"
        :checkBox="deptTreeInfo.checkBox"
        :checkedList="deptTreeInfo.checkedList"
        :api="deptTreeInfo.api"
        :accountAttribute="1"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<style scoped lang="scss">

</style>
