<script setup name="taskDictionary">
import {onMounted, ref, watch, reactive, getCurrentInstance} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import Modify from "./modify.vue";
import {
  itemjob, itemjobClasstree,
  itemjobdel, itemjobdisable,
  itemjobenable,
  itemjobexportExcel
} from "@/api/projectBase";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'taskDictionary',
  type: '13040',
  action: '/item/job/import/excelRecord',
})
const state = reactive({
  treeRow: {},
});
// 权限树
const treeInfo = reactive({
  data: [],
  query: {
    name: ''
  },
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
});
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  fieldList: [
    {label: '作业编码', value: 'code'},
    {label: '作业名称', value: 'name'},
    {label: '所属作业分类', value: 'itemJobClassName'},
    {label: '是否人工作业', value: 'isPersonConfigName'},
    {label: '是否设备作业', value: 'isEquipmentConfigName'},
    {label: '备注', value: 'remark'},
    {label: '启用状态', value: 'statusName'},
    {label: '创建组织', value: 'createOrgName'},
    {label: '创建人', value: 'createUserName'},
    {label: '创建日期', value: 'createDate'},
    {label: '数据来源', value: 'dataSourceTypeName'},
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('taskDictionary:update'),
        event: (row) => openModify(JSON.parse(JSON.stringify(row))),
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission('taskDictionary:delete'),
        event: (row) => deleteRow(JSON.parse(JSON.stringify(row))),
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const filterInfo = ref({
  query: {
  },
  searchList: [
    { type: 'input', label: '作业信息', value: 'keyword', showLabel: true },
    { type: 'slot', label: '作业分类', value: 'itemJobClassName', showLabel: true },
    { label: "是否人工作业", value: "isPersonConfig", type: 'select-model', code: 'yes_or_no' },
    { label: "是否设备作业", value: "isEquipmentConfig", type: 'select-model', code: 'yes_or_no' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  list: [],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission('taskDictionary:add'), event: () => openModify('') },
    { type: 'button', label: '删除', show: proxy.$permission('taskDictionary:delete'), event: () => deleteRow() },
    { type: 'button', label: '启用', show: proxy.$permission('taskDictionary:enable'), event: () => EnableTab() },
    { type: 'button', label: '停用', show: proxy.$permission('taskDictionary:disable'), event: () => disableTab() },
    { type: 'button', label: '下载模板', show: proxy.$permission('taskDictionary:download'), event: downloadTemplate },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission('taskDictionary:export'), event: exportData },
  ]
})
const dialogInfo = ref({
  visible: false,
  title: '作业字典',
  id: null
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '启用')[0]
  const cancelBtn = btns.filter((it) => it.label === '停用')[0]
  deleteBtn.disabled = !rows.length || rows.filter(row => row.status === '1').length > 0
  confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, {deep: true, immediate: true})

onMounted(() => {
  init()
})

function init() {
  itemjobClasstree({status: 1}).then((res) => {
    if (res && res.success) {
      let data = res.data;
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '作业分类',
          id: '-1'
        }
      ]
      if (treeInfo.query.name) {
        treeInfo.treeData = [];
        getNodeId(data, -1);
      } else {
        treeInfo.treeData = [];
        getNodeId(data, 2);
      }
      handleNodeClick(state.treeRow || treeInfo.data[0])
    }
  });
}
function getNodeId(data, num, count = 0) {
  count++;
  data.forEach((item) => {
    if (count === num) {
      return;
    }
    treeInfo.treeData.push(item.id);
    if (item.children && item.children.length) {
      getNodeId(item.children, num, count);
    }
  });
}
// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.treeRow = {}
    filterInfo.value.query.itemJobClassIds = [];
    clearSearch()
    return;
  }
  state.addOrUpdate = null;
  state.treeRow = node;
  filterInfo.value.query.itemJobClassIds = [node.id];
  filterInfo.value.query.itemJobClassName = node.name;
  getList()
}


function getList() {
  filterInfo.value.copyQuery = {...filterInfo.value.query}
  tableInfo.value.api = itemjob
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = {}
  selectClassification.value.checkedList = []
  getList()
}



// 启用
async function EnableTab() {
  const { code } = await itemjobenable(tableInfo.value.sectionRows.map((it) => it.id))
  if (code === 200) {
    proxy.$message.success('启用成功')
    getList()
  }
}

// 停用
async function disableTab() {
  const { code } = await itemjobdisable(tableInfo.value.sectionRows.map((it) => it.id))
  if (code === 200) {
    proxy.$message.success('停用成功')
    getList()
  }
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function diaLogeCallback(flag) {
  dialogInfo.value.visible = false
  if (flag) {
    getList()
  }
}

function openModify(row) {
  dialogInfo.value.id = row?.id
  if(!row) {
    dialogInfo.value.tableRow = {
      itemJobClassName: state.treeRow?.name,
      itemJobClassId: state.treeRow?.id,
      itemJobClassCode: state.treeRow?.code,
    }
    dialogInfo.value.tableRow.itemJobClassName = state.treeRow?.name
    dialogInfo.value.tableRow.itemJobClassId = state.treeRow?.id
    dialogInfo.value.tableRow.itemJobClassCode = state.treeRow?.code
  } else {
    dialogInfo.value.tableRow = JSON.parse(JSON.stringify(row))
  }
  dialogInfo.value.title = `${!!row?.id ? '修改' : '新增'}作业字典`
  dialogInfo.value.visible = true
}


function downloadTemplate() {
  exportTemplateExcel('itemJobTemplate', 'taskDictionary:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '作业字典导入模板')
    }
  })
}

// 导出Excel
function exportData() {
  itemjobexportExcel(filterInfo.value.query).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res)
    }
  })
}


function deleteRow(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemjobdel(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}


const selectClassification = ref({
  visible: false,
  saveEmpty: true,
  checkBox: true,
  query: {
    status: '1'
  },
  checkedKey: {},
  checkedList: []
})

function openCategoryList() {
  selectClassification.value.visible = true

}

function selectClassificationCallback(data) {
  selectClassification.value.checkedList = data
  const datas = data.filter((it) => it.children.length === 0)
  filterInfo.value.query.itemJobClassIds = datas.map(it => it.id);
  filterInfo.value.query.itemJobClassName = datas.map(it => it.name).join(',');
  selectClassification.value.visible = false
}

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}

function filterNode(value, data) {
  const filterName = `${data.code}${data.name}`
  return filterName.includes(value);
}

</script>

<template>
<!--  作业字典-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">作业分类</span>
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
              ref="menuTree"
              :data="treeInfo.data"
              highlight-current
              :props="treeInfo.defaultProps"
              node-key="id"
              :default-expanded-keys="treeInfo.treeData"
              :default-checked-keys="[treeInfo.checked]"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.searchList"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-itemJobClassName>
              <el-input
                  v-model="filterInfo.query.itemJobClassName"
                  class="not-mongolia"
                  type="input"
                  placeholder="请选择"
                  :disabled="true"
              >
                <template #append>
                  <el-icon @click="openCategoryList"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
          <div class="filter-wrapper">
            <NewPageFilter :filter-btn="filterInfo.btnList">
            </NewPageFilter>
        </div>
        <!-- 表格 -->
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :pager="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <Modify
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :id="dialogInfo.id"
        :tableRow="dialogInfo.tableRow"
        @callback="diaLogeCallback"
    />
    <SelectTaskType
        v-if="selectClassification.visible"
        v-model:query="selectClassification.query"
        v-model:show-dialog="selectClassification.visible"
        title="作业分类"
        :checkStrictly="false"
        :check-box="true"
        :isLeaf="false"
        :highlightCurrent="true"
        :checkedKey="selectClassification.checkedKey"
        :checkedList="selectClassification.checkedList"
        :saveEmpty="selectClassification.saveEmpty"
        @callback="selectClassificationCallback"
    ></SelectTaskType>
  </div>
</template>

<style scoped lang="scss">

</style>
