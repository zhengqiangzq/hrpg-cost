<!-- 成本项目关系 -->
<script setup name="DRGCostItemRelationship">
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {allServiceUnit} from "@/api/DRGCostServiceUnit";
import {
  addCostItemRelationship,
  batchAddCostItemRelationship, deleteCostItemRelationship, exportCostItemRelationship,
  pageCostItemRelationship, updateCostItemRelationship
} from "@/api/DRGCostItemRelationship";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DRGCostItemRelationship'
const API = {
  query: pageCostItemRelationship,
  add: addCostItemRelationship,
  batchAdd: batchAddCostItemRelationship,
  update: updateCostItemRelationship,
  delete: deleteCostItemRelationship,
  download: exportTemplateExcel,
  export: exportCostItemRelationship
}
const TEMPLATE_NAME = '成本项目关系导入模板'
const UPLOAD_PATH = '/drg/serviceItemShip/import/excel'

const {
  downloadTemplate, exportData
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(), 'DRGCostItemRelationship:import')

const { uploadExcelBtns } = useUploadExcel({
  excludeCode: ['3'],
  PERMISSION_CODE: 'DRGCostItemRelationship',
  type: '13094',
  action: '/drg/serviceItemShip/import/excelRecord',
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
    { label: '成本项目', value: 'itemName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '批量新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openDeptSelectorForBatchAdd() },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('','DRGCostItemRelationship:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '服务单元编码', value: 'serviceUnitCode' },
    { label: '服务单元名称', value: 'serviceUnitName' },
    { label: '成本项目编码', value: 'itemCode' },
    { label: '成本项目名称', value: 'itemName' },
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
  title: '科室关系',
  btList: [
    { type: 'primary', label: '保存', event: saveData }
  ],
  fieldList: [
    { label: '服务单元编码', span: 12, value: 'serviceUnitCode', type: 'input', disabled: true },
    { label: '服务单元名称', span: 12, value: 'serviceUnitName', type: 'input', disabled: true },
    { label: '成本项目编码', span: 12, value: 'itemCode', type: 'slot' },
    { label: '成本项目名称', span: 12, value: 'itemName', type: 'input', disabled: true },
  ],
  rules: {
    itemCode: [{ required: true, message: '请选择成本项目', trigger: true }]
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
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}成本项目关系`
  modifyInfo.visible = true
}

function openDeptSelectorForBatchAdd() {
  openCostItemSelector('batch')
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

function openCostItemSelector(mark) {
  tableParameter.type = 'costItem'
  tableParameter.title = '成本项目'
  tableParameter.query = {
    status: '1',
    last: true,
    diseaseAccountStatus: 1
  }
  tableParameter.mark = mark
  tableParameter.checkBox = !!mark
  tableParameter.callBack = costItemCallback
  tableParameter.visible = true
  const ref = mark === 'query' ? filterRef.value : mark === 'batch' ? filterRef.value : dialogInfoRef.value
  openDialog(ref)
}
function costItemCallback(raw) {
  if (tableParameter.mark === 'batch') {
    console.log(raw)
    if(raw?.length === 0) return
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
    filterInfo.query.shipIdIn = raw?.map((it) => it.id).join(',');
    filterInfo.query.itemName = raw?.map((it) => it.name).join(',');
  } else {
    modifyInfo.row.shipId = raw.id
    modifyInfo.row.itemCode = raw.code
    modifyInfo.row.itemName = raw.name
  }
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">成本项目关系</span>
        <!-- 按钮 -->
        <TreeButtons
            :filterBtn="treeInfo.buttons"
        >
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
              <template #filter-itemName>
                <el-input
                    v-model="filterInfo.query.itemName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择成本项目"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openCostItemSelector('query')"><Search /></el-icon>
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
        <template #form-itemCode>
          <el-input
              v-model="modifyInfo.row.itemCode"
              class="not-mongolia"
              type="input"
              placeholder="请选择成本项目"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openCostItemSelector('')"><Search /></el-icon>
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
.main-flex {
  flex-grow: 1;
  display: flex;
  flex-wrap: nowrap;
  height: calc(100% - 120px);
  .el-tree {
    width: 100%;
    padding: 0 20px 20px;
    overflow-y: auto;
  }
}
</style>
