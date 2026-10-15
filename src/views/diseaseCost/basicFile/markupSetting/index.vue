<!-- 加成率设置 -->
<script setup name="diseaseCostMarkupSetting">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {
  addMarkupSetting,
  deleteMarkupSetting, exportMarkupSetting,
  pageMarkupSetting,
  updateMarkupSetting
} from "@/api/diseaseCostMarkupSetting";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostMarkupSetting'
const API = {
  query: pageMarkupSetting,
  add: addMarkupSetting,
  update: updateMarkupSetting,
  delete: deleteMarkupSetting,
  download: exportTemplateExcel,
  export: exportMarkupSetting
}
const TEMPLATE_NAME = '病种成本-收费项目加成率导入模板'
const UPLOAD_PATH = '/disease/chargeItemRate/import/excel'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13067',
  action: '/disease/chargeItemRate/import/excelRecord',
})
const filterInfoRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'slot', label: '收费项目', showLabel: true, value: 'chargeItemName' },
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
    { label: '收费项目编码', value: 'chargeItemCode' },
    { label: '收费项目名称', value: 'chargeItemName' },
    { label: '收费类别编码', value: 'feeCategoryCode' },
    { label: '收费类别名称', value: 'feeCategoryName' },
    { label: '加成率', value: 'addRate', align: 'center' },
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
  title: '加成率设置',
  visible: false,
  fieldList: [
    { label: '收费项目编码', span: 12, value: 'chargeItemCode', type: 'slot' },
    { label: '收费项目名称', span: 12, value: 'chargeItemName', type: 'input', disabled: true },
    { label: '收费类别编码', span: 12, value: 'feeCategoryCode', type: 'input', disabled: true },
    { label: '收费类别名称', span: 12, value: 'feeCategoryName', type: 'input', disabled: true },
    { label: '加成率', span: 12, value: 'addRate', type: 'number', precision: '4', min: -1 },
  ],
  rules: {
    chargeItemCode: [{ required: true, message: '请选择收费项目', trigger: 'change' }],
    addRate: [{ required: true, message: '请输入加成率', trigger: 'blur' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: saveData }
  ]
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
    chargeItemName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  tableParameter.checkedList = [];
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  dialogInfo.row = row ? cloneDeep(row) : {}
  dialogInfo.title = `${!!row?.id ? '修改' : '新增'}加成率设置`
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
  API.download(TEMPLATE_NAME, `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, TEMPLATE_NAME)
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

function openFeeItemSelector(mark) {
  tableParameter.title = '收费项目'
  tableParameter.checkBox = !!mark
  tableParameter.pager = true
  tableParameter.query = { status: 1, feeAttribute: '1' }
  tableParameter.type = 'feeItem'
  tableParameter.callBack = (raw) => {
    if (tableParameter.mark === 'query') {
      tableParameter.checkedList = raw;
      filterInfo.query.itemIdIn = raw?.map((it) => it.id).join(',');
      filterInfo.query.chargeItemName = raw?.map((it) => it.name).join(',');
    } else {
      dialogInfo.row.itemId = raw.id
      dialogInfo.row.chargeItemCode = raw.code
      dialogInfo.row.chargeItemName = raw.name
      dialogInfo.row.feeCategoryCode = raw.feeCategoryCode
      dialogInfo.row.feeCategoryName = raw.feeCategoryName
    }
  }
  tableParameter.visible = true
  tableParameter.mark = mark
  openDialog(mark === 'query' ? filterInfoRef.value : dialogInfoRef.value)
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterInfoRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-chargeItemName>
              <el-input
                  v-model="filterInfo.query.chargeItemName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择费用项目"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openFeeItemSelector('query')"><Search /></el-icon>
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
        <template #form-chargeItemCode>
          <el-input
              v-model="dialogInfo.row.chargeItemCode"
              class="not-mongolia"
              type="input"
              placeholder="请选择费用项目"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openFeeItemSelector('')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
  </div>
</template>

<style scoped lang="scss">

</style>
