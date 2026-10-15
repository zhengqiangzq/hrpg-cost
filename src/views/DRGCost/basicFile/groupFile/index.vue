<!-- DRG组档案 -->
<script setup name="DRGCostGroupFile">
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {addGroupFile, deleteGroupFile, exportGroupFile, pageGroupFile, updateGroupFile} from "@/api/DRGCostGroupFile";
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DRGCostGroupFile'
const API = {
  query: pageGroupFile,
  add: addGroupFile,
  update: updateGroupFile,
  delete: deleteGroupFile,
  download: exportTemplateExcel,
  export: exportGroupFile
}
const TEMPLATE_NAME = 'drgDefinitionTemplate'
const UPLOAD_PATH = '/base/drgDefinition/import/excel'
const {
  downloadTemplate, exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), 'DRGCostGroupFile:import')
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DRGCostGroupFile',
  type: '13084',
  action: '/base/drgDefinition/import/excelRecord',
})

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'input', label: 'DRG组编码', value: 'codeLike' },
    { type: 'input', label: 'DRG组名称', value: 'nameLike' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('DRG组档案导入模板','DRGCostGroupFile:download') },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: 'DRG组编码', value: 'code' },
    { label: 'DRG组名称', value: 'name' },
    { label: '支付标准', value: 'payStandard', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.payStandard) },
    { label: 'RW', value: 'rw', align: 'right' },
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
        ifRender: (row) => row.sysFlag != '1',
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        ifRender: (row) => row.sysFlag != '1',
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const dialogInfo = reactive({
  refObj: null,
  row: {},
  title: 'DRG组档案',
  visible: false,
  fieldList: [
    { label: 'DRG组编码', span: 12, value: 'code', type: 'input' },
    { label: 'DRG组名称', span: 12, value: 'name', type: 'input' },
    { label: '支付标准', span: 12, value: 'payStandard', type: 'money' },
    { label: 'RW', span: 12, value: 'rw', type: 'number', precision: 2 },
  ],
  rules: {
    code: [{ required: true, message: '请输入DRG组编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入DRG组名称', trigger: 'blur' }],
    payStandard: [{ required: true, message: '请输入支付标准', trigger: 'blur' }, { type: 'number', min: 0, message: '支付标准不能小于0', trigger: 'blur' }],
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
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}DRG组档案`
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
          ></PageFilter>
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
