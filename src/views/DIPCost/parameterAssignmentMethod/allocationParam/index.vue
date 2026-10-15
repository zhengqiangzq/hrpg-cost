<!-- 分摊参数 -->
<script setup name="DIPCostAllocationParam">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {useUpload} from "@/hooks/useUpload";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addAllocationParam,
  deleteAllocationParam, disableAllocationParam,
  enableAllocationParam,
  exportAllocationParam,
  pageAllocationParam, updateAllocationParam
} from "@/api/DIPCost/DIPCostAllocationParam";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostAllocationParam'
const API = {
  query: pageAllocationParam,
  add: addAllocationParam,
  update: updateAllocationParam,
  delete: deleteAllocationParam,
  enable: enableAllocationParam,
  disable: disableAllocationParam,
  download: exportTemplateExcel,
  export: exportAllocationParam
}
const TEMPLATE_NAME = 'DIP分摊参数-参数分配法导入模板'
const UPLOAD_PATH = '/dip/apportion/import/excel'

const {
  downloadTemplate,
  exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), 'DIPCostAllocationParam:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DIPCostAllocationParam',
  type: '13105',
  action: '/dip/apportion/import/excelRecord',
})
const { tableParameter, openDialog } = useSelectTableData()
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '分摊参数编码', value: 'codeLike', type: 'input' },
    { label: '分摊参数名称', value: 'nameLike', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(), },
    { type: 'button', label: '停用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => disableData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('', 'DIPCostAllocationParam:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '分摊参数编码', value: 'code' },
    { label: '分摊参数名称', value: 'name' },
    { label: '启用状态', value: 'statusName' },
    { label: '系统预置', value: 'sysFlagName' },
    { label: 'sql', value: 'executeQuerySql' },
    { label: '备注', value: 'remark' },
  ],
  summaryFieldList: [
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
        ifRender: (row) => row.status === '0'
      },
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
const dialogInfoRef = ref()
const dialogInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '分摊参数',
  visible: false,
  fieldList: [
    { label: '分摊参数编码', span: 12, value: 'code', type: 'input' },
    { label: '分摊参数名称', span: 12, value: 'name', type: 'input' },
    { label: '备注', span: 12, value: 'remark', type: 'input' },
    { label: 'sql', labelTip: '查询参数字段别名为 科室主键deptId，住院号hospitalAdmissionNumber，患者姓名patientName(非必填)，参数值value，条件参数为组织：@orgId，核算期间@intervalMth', value: 'executeQuerySql', span: 24, type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请输入分摊参数编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入分摊参数名称', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '启用')
  const disableBtn = btns.find(btn => btn.label === '停用')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status == 1 || it.sysFlag == 1)
  enableBtn.disabled = !rows.length || !!rows.find(it => it.status == 1 || it.sysFlag == 1)
  disableBtn.disabled = !rows.length || !!rows.find(it => it.status == 0 || it.sysFlag == 1)
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
  dialogInfo.row = row || {}
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}分摊参数`
  dialogInfo.visible = true
}

async function saveData() {
  let isValid = true
  await dialogInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const api = !dialogInfo.row.id ? API.add : API.update
  api(dialogInfo.row).then(res => {
    if (res.success) {
      proxy.$message.success('保存成功')
      dialogInfo.visible = false
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

function enableData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  API.enable(ids).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function disableData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  API.disable(ids).then(res => {
    if (res.success) {
      proxy.$message.success('操作成功')
      getList()
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
      </page-form>
    </dialog-form>
  </div>
</template>

<style scoped lang="scss">

</style>
