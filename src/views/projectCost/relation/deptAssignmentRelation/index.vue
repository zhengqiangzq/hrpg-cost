<template>
<!--  科室作业关系-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header">
          <span class="title">科室作业关系</span>
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
              v-model="treeInfo.query.name"
              :disabled="state.addBtn"
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
              :default-expand-all="true"
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
            ref="filterRef"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.searchList"
            :filter-btn="filterInfo.filterbtn"
        >
        </NewPageFilter>
          </div>
        <!-- 条件栏 -->
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
            :tab-index="true"
            :query="filterInfo.query"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            :checkBox="true"
            :pager="false"
            @handleEvent="SelectionChange"
            :row-class-name="tableRowClassName"
        >
        </table-container>
      </div>
    </div>
  </div>
</template>

<script setup name="deptAssignmentRelation">
import {useStorage} from "@vueuse/core";
import {
  itemdeptWorkRelation,
  itemdeptWorkRelationadd,
  itemdeptWorkRelationdel, itemdeptWorkRelationexportExcel,
  itemdeptWorkRelationupdate
} from "@/api/relation";
import {exportTemplateExcel} from "@/api/pub";
import {itemsectiontree} from "@/api/projectCost/accountingDept";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {getCurrentInstance} from "vue";

const {proxy} = getCurrentInstance()
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'deptAssignmentRelation',
  type: '13044',
  action: '/item/deptWorkRelation/import/excelRecord',
})
const advancedSearchInfo = ref({
  visible: false,
  data: {},
})


const setting = useStorage('setting', {}, sessionStorage)

const clearType = ref(true)
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: false,
  addOrUpdate: "",
  categoryId: "",
  tableRow: '',
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});
// 过滤相关配置
const filterInfo = ref({
  query: {},
  searchList: [
    {
      type: 'input',
      label: '作业名称',
      value: 'itemJobName',
      showLabel: true,
      event: search,
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      show: proxy.$permission('deptAssignmentRelation:add'),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('deptAssignmentRelation:delete'),
      event: deleteBtn,
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission('deptAssignmentRelation:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('deptAssignmentRelation:export'),
    },
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  data: [],
  fieldList: [
    {label: '作业字典编码', value: 'itemJobCode'},
    {label: '作业字典名称', value: 'itemJobName'},
  ],
  sectionRows: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('deptAssignmentRelation:update'),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission('deptAssignmentRelation:delete'),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: romove,
      },
    ],
  },
})

// 新增参数
const addInfo = ref({
  addOrUpdate: null,
  data: {},
})


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })

watch(() => state.treeRow, (rows) => {
  const btns = filterInfo.value.btnList
  const addBtn = btns.filter((it) => it.label === '新增')[0]
  addBtn.disabled = !state.treeRow.id
}, { immediate: true })

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
})

function init() {
  itemsectiontree().then((res) => {
    if (res && res.success) {
      let data = res.data;
      treeInfo.data = [
        {
          childList: data,
          code: '',
          name: '科室档案',
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
    if (item.childList && item.childList.length) {
      getNodeId(item.childList, num, count);
    }
  });
}
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.copyQuery = {
    deptId: state.treeRow.id,
  }
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function search() {
  tableInfo.value.api = itemdeptWorkRelation
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

// table选择
function SelectionChange(val,data) {
  if (val === 'tableCheck') {
    tableInfo.value.sectionRows = data
  }
}

// 删除
function deleteBtn() {
  if(tableInfo.value.sectionRows.length === 0) return proxy.$message.warning('请勾选数据')
  const ids = tableInfo.value.sectionRows.map((it) => it.id)
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        itemdeptWorkRelationdel(ids).then((res) => {
          if (res.success) {
            proxy.$message.success('删除成功')
            search()
          }
        });
      })
      .catch(() => {});
}
// 添加
function addBtn() {
  addInfo.value.data = {
    deptId: state.treeRow.id,
  }
  addInfo.value.addOrUpdate = itemdeptWorkRelationadd;
  openDeptSystem()
}

async function save() {
  addInfo.value.addOrUpdate(addInfo.value.data).then((res) => {
    if (res.success) {
      proxy.$message.success('保存成功')
      search();
    }
  });
}

function update(row) {
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = itemdeptWorkRelationupdate;
  openDeptSystem()
}

function romove(row) {
  itemdeptWorkRelationdel([row.id]).then((res) => {
    if (res && res.success) {
      proxy.$message.success('删除成功')
      search()
    }
  })
}

function tableRowClassName({row}) {
  let rowId = sessionStorage.getItem('storeRowId')
  if (rowId && row.id === Number(rowId)) {
    return 'check-row'
  }
  return ''
}

function downloadTemplate() {
  exportTemplateExcel('itemDeptWorkRelationTemplate', 'deptAssignmentRelation:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '科室作业关系导入模板')
    }
  })
}

const filterNum = ref(false)

// 作业字典
const jobInfo = ref({
  visible: false,
  type: 'itemjob',
  title: '作业字典',
  checkBox: false,
  pager: true,
  callback: null,
  fieldList: [],
  query: {}
})
const filterRef = ref()
// filter查询作业字典
function openDeptSelector() {
  jobInfo.value.visible = true;
  jobInfo.value.checkBox = false;
  jobInfo.value.callBack = accountingPeriodCallback
  filterRef.value.openDialog(jobInfo.value, 'table')
  filterNum.value = true;
}

// 新增 查询作业字典
function openDeptSystem() {
  jobInfo.value.visible = true;
  jobInfo.value.title = !!addInfo.value.data.id ? '修改科室作业关系' : '新增科室作业关系'
  jobInfo.value.checkBox = !addInfo.value.data.id;
  jobInfo.value.query = {
    itemJobIdList: tableInfo.value.data.map(it => it.itemJobId)
  }
  jobInfo.value.callBack = accountingPeriodCallback
  filterRef.value.openDialog(jobInfo.value, 'table')
  filterNum.value = false;
}

function accountingPeriodCallback(data) {
  console.log('选择的参数-----------', data)
  if(filterNum.value) {
    filterInfo.value.query.itemJobName = data.name;
    filterInfo.value.query.itemJobId = data.id;
  } else {
    if(jobInfo.value.checkBox) {
      if(!data) {
        return
      }
      addInfo.value.data.itemJobIdList = data?.map((it) => it.id);
    } else {
      addInfo.value.data.itemJobId = data.id;
    }
    save()
  }
}

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
    children: "childList",
    label: function (data, node) {
      if (data.code) {
        return data.code + " " + data.name;
      } else {
        return data.name;
      }
    },
  },
});

// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.categoryId = node.id;
    state.treeRow = ''
    return;
  }
  state.isAddUpdate = "update";
  state.addOrUpdate = null;
  state.treeRow = node;
  state.categoryId = node.id;
  if (node.id !== "-1") {
    state.categoryId = node.id;
    filterInfo.value.query.deptId = node.id;
    search();
  }
}

function filterNode(value, data) {
  const filterName = `${data.code}${data.name}`
  return filterName.includes(value);
}

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}

function showExportExcel() {
  itemdeptWorkRelationexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

</script>

<style scoped>
.left-container {
  min-width: 350px;
  .left-container-header {
    display: flex;
    justify-content: flex-start;
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
