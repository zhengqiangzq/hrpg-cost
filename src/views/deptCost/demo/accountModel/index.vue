<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header">
          <span class="title">科目表</span>
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
              v-model="treeInfo.query.name"
              :clearable="true"
              placeholder="请输入科目表编码/名称"
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
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.searchList"
                :filter-btn="filterInfo.filterbtn"
            >
            </NewPageFilter>
          </div>
            <div class="filter-wrapper">
            <!-- 按钮 -->
            <NewPageFilter
                :filterBtn="filterInfo.btnList"
            >
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :tab-index="true"
              :highlightRow="true"
              :query="filterInfo.query"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="SelectionChange"
              :checkBox="true"
              @pageInfo="pageInfo"
          >
          </table-container>
      </div>
    </div>
    <Modify
        v-if="state.addBtn"
        :id="state.id"
        :title="state.title"
        :tableRow="formOrgInfo.data"
        :visible="state.addBtn"
        @callback="diaLogeCallback"
    />
  </div>
</template>

<script setup name="accountModel">
const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'accountModel'
const state = reactive({
  addBtn: false,
  id: null,
  title: '',
  treeRow: '',
});

const multipleSelection = ref([]);
const currentRow = ref({});

const filterInfo = ref({
  query: {
    sort: 'create_time desc,id asc',
  },
  searchList: [
    {
      label: "会计科目",
      value: "accountSubject",
      type: 'slot',
    },
    {
      label: "科目编码",
      value: "code",
      type: 'input',
    },
    {
      label: "科目名称",
      value: "name",
      type: 'input',
    },
    {
      type: 'select-model',
      label: '科目类型',
      value: 'accountType',
      code: 'account_type',
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search },
    { type: 'button', label: '重置', event: clearSearch },
    { type: 'button', label: '查询方案', event: handleQueryPlan },
  ],
  btnList: [
    {
      label: '新增',
      event: addBtn,
      show: proxy.$permission(`${PERMISSION_CODE}:add`),
      type: 'button',
      disabled: true,
    },
    {
      label: '删除',
      event: handleDelete,
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      type: 'button',
    },
    {
      label: '分配',
      event: handleAllocation,
      show: proxy.$permission(`${PERMISSION_CODE}:allocation`),
      type: 'button',
    },
    {
      label: '取消分配',
      event: handleCancelAllocation,
      show: proxy.$permission(`${PERMISSION_CODE}:cancelAllocation`),
      type: 'button',
    },
    {
      label: '账本化',
      event: handleAccountBook,
      show: proxy.$permission(`${PERMISSION_CODE}:accountBook`),
      type: 'button',
    },
    {
      label: '批量设置辅助核算',
      event: handleBatchAuxiliary,
      show: proxy.$permission(`${PERMISSION_CODE}:batchAuxiliary`),
      type: 'button',
    },
    {
      label: '启用/停用',
      event: handleEnableDisable,
      show: proxy.$permission(`${PERMISSION_CODE}:enableDisable`),
      type: 'button',
    },
    {
      label: '导入/导出',
      event: handleImportExport,
      show: proxy.$permission(`${PERMISSION_CODE}:importExport`),
      type: 'button',
    },
    {
      label: '清空设置',
      event: handleClearSetting,
      show: proxy.$permission(`${PERMISSION_CODE}:clearSetting`),
      type: 'button',
    },
  ]
});

const treeInfo = reactive({
  data: [],
  query: {
    name: ''
  },
  nodeKey: "id",
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
  data: [],
  fieldList: [
    { label: '序号', value: 'index', type: 'index' },
    { label: '科目表', value: 'accountTableName' },
    { label: '科目编码', value: 'code' },
    { label: '科目名称', value: 'name' },
    { label: '科目全称', value: 'fullName' },
    { label: '科目类型', value: 'accountTypeName' },
    { label: '现金分类', value: 'cashCategoryName' },
    { label: '科目方向', value: 'directionName' },
    { label: '辅助核算', value: 'auxiliaryAccounting' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '180',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: update,
      },
      {
        label: '停用',
        show: proxy.$permission(`${PERMISSION_CODE}:disable`),
        event: disableRow,
      },
      {
        label: '更多',
        show: true,
        event: moreAction,
      },
    ],
  },
})

const formOrgInfo = reactive({
  data: {},
});

watch(() => multipleSelection.value, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.find((it) => it.label === '删除')
  if (deleteBtn) {
    deleteBtn.disabled = !rows.length
  }
}, { immediate: true })

const page = ref({
  page: true,
  curPage: 1,
  pageSize: 20,
})

function pageInfo(obj) {
  page.value = obj
}

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
});

function init() {
}

function search() {
  tableInfo.value.refresh = Math.random()
}

function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function SelectionChange(val, data) {
  if (val === 'list') return
  if (val === "tableClickRow") {
    currentRow.value = data;
  } else {
    multipleSelection.value = data
  }
}

function handleDelete(row) {
  const selections = row ? [row] : multipleSelection.value
  if (!selections.length) return proxy.$message.warning('请选择要删除的数据')
  
  const message = row ? '是否确认删除该条数据？' : `是否确认删除所选的 ${selections.length} 条数据？`
  
  proxy.$confirm(message, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const ids = selections.map((it) => it.id)
    console.log('删除IDs:', ids)
    proxy.$message.success('删除成功')
    search();
  }).catch(() => {});
}

function addBtn() {
  state.id = null;
  formOrgInfo.data = {
    status: "1",
    accountTableId: state.treeRow?.id,
    accountTableName: state.treeRow?.name,
  };
  state.title = '新增会计科目';
  state.addBtn = true;
}

function update(row) {
  state.addBtn = true;
  state.title = '编辑会计科目';
  formOrgInfo.data = row;
  state.id = row.id;
}

function disableRow(row) {
  proxy.$confirm("是否确认停用该科目？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    console.log('停用ID:', row.id)
    proxy.$message.success('停用成功')
    search();
  }).catch(() => {});
}

function moreAction(row) {
  console.log('更多操作:', row)
}

function diaLogeCallback(flag) {
  if (flag) {
    state.id = null;
    search()
  } else {
    state.addBtn = false
  }
}

function handleNodeClick(node) {
  const btns = filterInfo.value.btnList
  const newBtn = btns.find((it) => it.label === '新增')
  
  if (node && !node.children?.length) {
    if (newBtn) newBtn.disabled = false
    state.treeRow = node
    filterInfo.query.accountTableId = node.id
    filterInfo.query.accountTableName = node.name
    search();
  } else {
    if (newBtn) newBtn.disabled = true
    filterInfo.query.accountTableId = ''
    filterInfo.query.accountTableName = ''
    search();
  }
}

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}

function filterNode(value, data) {
  const filterName = `${data.code || ''}${data.name}`
  return filterName.includes(value);
}

function handleQueryPlan() {}

function handleAllocation() {}

function handleCancelAllocation() {}

function handleAccountBook() {}

function handleBatchAuxiliary() {}

function handleEnableDisable() {}

function handleImportExport() {}

function handleClearSetting() {}
</script>