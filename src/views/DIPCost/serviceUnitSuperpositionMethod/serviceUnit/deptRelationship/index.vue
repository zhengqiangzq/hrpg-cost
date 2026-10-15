<!-- 科室关系 -->
<script setup name="DIPCostDeptRelationship">
import {getCurrentInstance, onMounted, reactive, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import {allServiceUnit} from "@/api/DIPCost/DIPCostServiceUnit";
import {
  addDeptRelationship, batchAddDeptRelationship,
  deleteDeptRelationship, exportDeptRelationship,
  pageDeptRelationship,
  updateDeptRelationship
} from "@/api/DIPCost/DIPCostDeptRelationship";
import {sectiontree} from "@/api/accountingDepartment";
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'DIPCostDeptRelationship'
const API = {
  query: pageDeptRelationship,
  add: addDeptRelationship,
  batchAdd: batchAddDeptRelationship,
  update: updateDeptRelationship,
  delete: deleteDeptRelationship,
  download: exportTemplateExcel,
  export: exportDeptRelationship
}
const TEMPLATE_NAME = '科室关系导入模板'
const UPLOAD_PATH = '/dip/methodService/serviceDeptShip/import/excel'

const {
  exportData, downloadTemplate
} = useUpload(API, TEMPLATE_NAME, UPLOAD_PATH, () => getList(),'DIPCostDeptRelationship:import')

const { uploadExcelBtns } = useUploadExcel({
  excludeCode: ['3'],
  PERMISSION_CODE: 'DIPCostDeptRelationship',
  type: '13109',
  action: '/dip/methodService/serviceDeptShip/import/excelRecord',
})
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
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '住院科室', value: 'deptName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '批量新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openDeptSelectorForBatchAdd() },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('','DIPCostDeptRelationship:download'), },
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
    { label: '住院科室编码', value: 'deptCode' },
    { label: '住院科室名称', value: 'deptName' },
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
    { label: '住院科室编码', span: 12, value: 'deptCode', type: 'slot' },
    { label: '住院科室名称', span: 12, value: 'deptName', type: 'input', disabled: true },
  ],
  rules: {
    deptCode: [{ required: true, message: '请填写住院科室编码', trigger: 'blur' }],
  },
  visible: false
})


// 核算科室
const deptTreeInfo = reactive({
  title: '核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  mark: null,
  api: sectiontree,
  query: {},
  checkedList: []
})

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
  allServiceUnit({status: 1}).then(res => {
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
  modifyInfo.row = row ? cloneDeep(row) : {
    serviceId: filterInfo.query.serviceId,
    serviceUnitCode: treeInfo.currentNode.code,
    serviceUnitName: treeInfo.currentNode.name
  }
  modifyInfo.title = `${!!row?.id ? '修改' : '新增'}科室关系`
  modifyInfo.visible = true
}

function openDeptSelectorForBatchAdd() {
  deptTreeInfo.mark = 'batch'
  deptTreeInfo.checkBox = true
  deptTreeInfo.visible = true
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

function openDeptSelector(mark) {
  deptTreeInfo.checkBox = !!mark
  deptTreeInfo.isLeaf = !mark
  deptTreeInfo.mark = mark
  deptTreeInfo.visible = true
}
function treeCallback(raw) {
  if (deptTreeInfo.mark == 'batch') {
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
  } else if (deptTreeInfo.mark === 'query') {
    let datas = raw?.filter((it) => !it.childList && checkPropCondition(it))
    filterInfo.query.shipIdIn = datas?.map((it) => it.id).join(',');
    filterInfo.query.deptName = datas?.map((it) => it.name).join(',');
  } else {
    modifyInfo.row.shipId = raw.id
    modifyInfo.row.deptCode = raw.code
    modifyInfo.row.deptName = raw.name
  }
}
function checkPropCondition(it) {
  return (it.accountAttribute == 1) && (it.diseaseAccountStatus == 1) && (it.sectionAttribute != 1)
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">科室关系</span>
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
              suffix-icon="Search"
              placeholder="请输入编码/名称"
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
              <template #filter-deptName>
                <el-input
                    v-model="filterInfo.query.deptName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择住院科室"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openDeptSelector('query')"><Search /></el-icon>
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
        <template #form-deptCode>
          <el-input
              v-model="modifyInfo.row.deptCode"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector('')"><Search /></el-icon>
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
        :api="deptTreeInfo.api"
        :accountAttribute="1"
        :diseaseAccountStatus="1"
        :sectionAttributeNot="1"
        :highlight-current="true"
        @callback="treeCallback" />
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
