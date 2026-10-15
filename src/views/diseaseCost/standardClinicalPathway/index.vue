<!-- 标准临床路径 -->
<script setup name="diseaseCostStandardClinicalPathway">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {
    deleteStandardClinicalPathway,
    exportStandardClinicalPathway,
    pageStandardClinicalPathway
} from "@/api/diseaseCost/standardClinicalPathway";
import Modify from "./modify.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import Detail from "./detail.vue";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostStandardClinicalPathway'
const API = {
  query: pageStandardClinicalPathway,
  delete: deleteStandardClinicalPathway,
  download: exportTemplateExcel,
  export: exportStandardClinicalPathway
}
const TEMPLATE_NAME = '标准临床路径导入模板'
const { tableParameter, openDialog } = useSelectTableData()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13071',
  action: '/base/diseaseClinicalPathways/import/excelRecord',
})
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { type: 'input', label: '临床路径编码', value: 'wayCodeLike' },
    { type: 'input', label: '临床路径名称', value: 'wayNameLike' },
    { type: 'slot', showLabel: true, label: '所属病种', value: 'diseaseDefinitionName' },
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
    { label: '临床路径编码', value: 'wayCode', type: 'slot' },
    { label: '临床路径名称', value: 'wayName' },
    { label: '标准住院床日', value: 'standardBedDays' },
    { label: '所属病种', value: 'diseaseDefinitionName' },
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

const modifyInfo = reactive({
    id: null,
    title: '标准临床路径',
    batch: false,
    visible: false
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
  filterInfo.copyQuery = {
      ...filterInfo.query,
      diseaseDefinitionName: undefined
  }
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
  modifyInfo.id = row?.id
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}标准临床路径`
  modifyInfo.visible = true
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
      proxy.$fn.parseExcel(res, '标准临床路径导入模板')
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

function openDiseaseDefinitionSelector() {
    tableParameter.title = '病种'
    tableParameter.type = 'diseaseDefinition'
    tableParameter.query = {}
    tableParameter.visible = true
    tableParameter.callBack = diseaseDefinitionCallback
    openDialog(filterRef.value)
}
function diseaseDefinitionCallback(raw) {
    filterInfo.query.diseaseDefinitionId = raw.id
    filterInfo.query.diseaseDefinitionName = raw.name
}

const detailInfo = reactive({
  visible: false
})
function detail(row) {
  detailInfo.id = row.id
  detailInfo.visible = true
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailInfo.visible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
              <template #filter-diseaseDefinitionName>
                  <el-input
                      v-model="filterInfo.query.diseaseDefinitionName"
                      class="not-mongolia"
                      type="input"
                      placeholder="请选择病种"
                      :disabled="true"
                  >
                      <template #append>
                          <el-icon @click="openDiseaseDefinitionSelector"><Search /></el-icon>
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
        <template #col-wayCode="{ row }">
          <span class="slip-edit" @click="detail(row)">{{ row.wayCode }}</span>
        </template>
      </table-container>
    </div>
      <Modify
          v-if="modifyInfo.visible"
          v-model:visible="modifyInfo.visible"
          :id="modifyInfo.id"
          :batch="modifyInfo.batch"
          :title="modifyInfo.title"
          @returnModify="getList"
      />
    <Detail
        v-if="detailInfo.visible"
        :id="detailInfo.id"
        v-model:visible="detailInfo.visible"
        @returnBack="getList"
    ></Detail>
  </div>
</template>

<style scoped lang="scss">

</style>
