<!-- 收费项目关系 -->
<script setup name="diseaseCostChargeItemRelationship">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import axios from "axios";
import {ElLoading} from "element-plus";
import {allServiceUnit} from "@/api/diseaseCostServiceUnit";
import {
  addChargeItemRelationship,
  batchAddChargeItemRelationship, deleteChargeItemRelationship, exportChargeItemRelationship,
  pageChargeItemRelationship, updateChargeItemRelationship
} from "@/api/diseaseCostChargeItemRelationship";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'diseaseCostChargeItemRelationship'
const API = {
  query: pageChargeItemRelationship,
  add: addChargeItemRelationship,
  batchAdd: batchAddChargeItemRelationship,
  update: updateChargeItemRelationship,
  delete: deleteChargeItemRelationship,
  download: exportTemplateExcel,
  export: exportChargeItemRelationship
}
const TEMPLATE_NAME = '收费项目关系导入模板'
const UPLOAD_PATH = '/methodService/serviceChargeShip/import/excel'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13079',
  action: '/methodService/serviceChargeShip/import/excelRecord',
})

const { tableParameter, openDialog } = useSelectTableData()
const treeInfo = reactive({
  query: {},
  data: [],
  buttons: [
  ],
  nodeKey: "code",
  treeData: [],
  checked: [],
  defaultProps: {
    children: "children",
    label: function (data, node) {
      if (data.code) {
        return data.code + " " + data.name;
      } else {
        return data.name;
      }
    },
  },
  currentNode: null
});
const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '收费项目', value: 'feeItemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '批量新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openDeptSelectorForBatchAdd() },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '收费项目编码', value: 'feeItemCode' },
    { label: '收费项目名称', value: 'feeItemName' },
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
  refObj: null,
  row: {},
  title: '收费项目关系',
  btList: [
    { type: 'primary', label: '保存', event: saveData }
  ],
  fieldList: [
    { label: '服务单元编码', span: 12, value: 'serviceUnitCode', type: 'input', disabled: true },
    { label: '服务单元名称', span: 12, value: 'serviceUnitName', type: 'input', disabled: true },
    { label: '收费项目编码', span: 12, value: 'feeItemCode', type: 'slot' },
    { label: '收费项目名称', span: 12, value: 'feeItemName', type: 'input', disabled: true },
  ],
  rules: {
    feeItemCode: [{ required: true, message: '请选择收费项目', trigger: 'change' }]
  },
  visible: false
})

const dialogInfoRef = ref()


watch(() => filterInfo.query.serviceId, (serviceId) => {
  const btns = filterInfo.btnList
  const addBtn = btns.find(btn => btn.label === '新增'), batchAddBtn = btns.find(btn => btn.label === '批量新增')
  addBtn.disabled = batchAddBtn.disabled = !serviceId || serviceId == '-1'
}, { immediate: true, deep: true })
watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  loadTreeData()
  getList()
})

function loadTreeData() {
  allServiceUnit().then(res => {
    if (res.success) {
      const data = res.data
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '服务单元',
          id: '-1'
        }
      ]
    }
  })
}

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    shipIdIn: filterInfo.query.shipIdIn,
    serviceId: filterInfo.query.serviceId
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
  modifyInfo.row = row ? cloneDeep(row) : {
    serviceId: filterInfo.query.serviceId,
    serviceUnitCode: treeInfo.currentNode.code,
    serviceUnitName: treeInfo.currentNode.name
  }
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}收费项目关系`
  modifyInfo.visible = true
}

function openDeptSelectorForBatchAdd() {
  openFeeItemSelector('batch')
}

function saveData() {
  modifyInfo.refObj.validate(flag => {
    if (flag) {
      const api = modifyInfo.row.id ? API.update: API.add
      api(modifyInfo.row).then(res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          modifyInfo.visible = false
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

function beforeUpload(file) {
  //发生请求时打开加载动画
  uploadInfo.loading = ElLoading.service({
    fullscreen: true,
    background: 'rgba(255,255,255,.4)',
  })
  console.log(uploadInfo.loading)
  let fileType = ['xlsx']
  let fileSize = proxy.$store.state.permission.systemConfig.max_file_size
  let isFileType = fileType.some(
      (type) => file.name.split('.')[file.name.split('.').length - 1] === type
  )
  const isLt = file.size / 1024 / 1024 < fileSize
  if (!isFileType) {
    proxy.$message.error({
      message: `文件格式不正确, 请上传 ${fileType.join(' / ')} 格式文件!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.loading.close()
    return false
  }
  if (!isLt) {
    proxy.$message.error({
      message: `上传文件大小不能超过 ${fileSize} MB!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.loading.close()
    return false
  }
  return isFileType && isLt
}

function uploadSuccess(resp) {
  console.log(resp)
  uploadInfo.loading.close()
  if (resp && resp.success) {
    proxy.$message.success({
      duration: 3000,
      showClose: true,
      message: resp.msg,
    })
    getList()
  } else {
    proxy.$message.error({
      message: resp.msg,
      duration: 3000,
      showClose: true,
    })
  }
}
function uploadError(err) {
  if (err) {
    proxy.$message.error({
      message: JSON.parse(err.message).msg || '系统错误',
      duration: 3000,
      showClose: true,
    })
  }
  uploadInfo.loading.close()
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

function handleSearch() {
  proxy.$refs.tree.filter(treeInfo.query.name);
}
function filterNode(value, data) {
  return data.code.includes(value) || data.name.includes(value);
}
function handleNodeClick(node) {
  filterInfo.query.serviceId = node.id == '-1' ? undefined : node.id
  treeInfo.currentNode = node
  getList()
}

function openFeeItemSelector(mark) {
  tableParameter.type = 'feeItem'
  tableParameter.title = '收费项目'
  tableParameter.query = {
    status: 1,
    accountingStatus: 1
  }
  tableParameter.mark = mark
  tableParameter.checkBox = mark === 'batch' || mark === 'query'
  tableParameter.callBack = feeItemCallback
  tableParameter.visible = true
  const ref = mark === 'batch' || mark === 'query' ? filterRef.value : dialogInfoRef.value
  openDialog(ref)
}
function feeItemCallback(raw) {
  if (tableParameter.mark === 'batch') {
    console.log(raw)
    const data = raw.map(row => {
      return {
        serviceId: treeInfo.currentNode.id,
        shipId: row.id
      }
    })
    API.batchAdd(data).then(res => {
      if (res.success) {
        proxy.$message.success('保存成功')
        modifyInfo.visible = false
        getList()
      }
    })
  } else if (tableParameter.mark === 'query') {
    tableParameter.checkedList = raw;
    filterInfo.query.shipIdIn = raw.map((it) => it.id).join(',')
    filterInfo.query.feeItemName = raw.map((it) => it.name).join(',')
  } else {
    modifyInfo.row.shipId = raw.id
    modifyInfo.row.feeItemCode = raw.code
    modifyInfo.row.feeItemName = raw.name
  }
}
</script>

<template>
  <div className="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">收费项目关系</span>
        <!-- 按钮 -->
        <TreeButtons
            :filterBtn="treeInfo.buttons"
        >
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
              <div class="dropdownSlotCss">导入</div>
            </el-upload>
          </template>
        </TreeButtons>
          </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
              v-model="treeInfo.query.name"
              :clearable="true"
              placeholder="请输入编码/名称"
              suffix-icon="Search"
              @keyup.enter="handleSearch"
          ></el-input>
        </div>
        <div class="left-container-main main-flex">
          <el-tree
              ref="tree"
              :data="treeInfo.data"
              highlight-current
              :props="treeInfo.defaultProps"
              node-key="id"
              :default-expanded-keys="treeInfo.treeData"
              :default-checked-keys="[treeInfo.checked]"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :filter-btn="filterInfo.filterbtn"
            >
              <template #filter-feeItemName>
                <el-input
                    v-model="filterInfo.query.feeItemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择收费项目"
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
    </div>
    <dialog-form :title="modifyInfo.title" :btList="modifyInfo.btList" v-model:visible="modifyInfo.visible">
      <page-form
          ref="dialogInfoRef"
          v-model:ref-obj="modifyInfo.refObj"
          :label-width="modifyInfo.labelWidth"
          :data="modifyInfo.row"
          :field-list="modifyInfo.fieldList"
          :rules="modifyInfo.rules"
      >
        <template #form-feeItemCode>
          <el-input
              v-model="modifyInfo.row.feeItemCode"
              class="not-mongolia"
              type="input"
              placeholder="请选择收费项目"
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
.left-container {
  min-width: 350px;
  .left-container-header {
    display: flex;
    justify-content: flex-start;
    padding: 5px 0;
    box-sizing: border-box;
  }
  .border-style-bottom {
    margin-bottom: 0;
  }
}
</style>
