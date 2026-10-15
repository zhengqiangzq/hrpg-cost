<template>
<!--  科室档案-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <!-- 按钮 -->
        <NewPageFilter
            :filterBtn="filterInfo.btnList"
        >
        </NewPageFilter>
        <div class="left-container-header border-style-bottom">
          <span class="title">核算科室</span>
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
            <PageFilter
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.searchList"
            >
            </PageFilter>
          </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :tab-index="true"
              :query="filterInfo.query"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="SelectionChange"
              :checkBox="false"
              :highlightRow="true"
          >
          </table-container>
      </div>
    </div>
  </div>
</template>

<script setup name="DRGCostAccountingDept">
import {
  section,
  sectiontree,
} from "@/api/accountingDepartment";
const { proxy } = getCurrentInstance();

// 过滤相关配置
const filterInfo = ref({
  ref: null,
  query: {
    sort: 'create_time desc,id asc',
  },
  searchList: [
    {
      label: "科室编码/名称",
      value: "name",
      type: 'input',
      event: search,
    },
    {
      type: 'select-model',
      label: '科室属性',
      value: 'sectionAttribute',
      code: 'cost_dept_attribute',
      onlyShowOption: ['2', '3'],
      event: search,
    },
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', btType: 'primary', event: clearSearch, },
  ],
  btnList: []
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
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  data: [],
  fieldList: [
    { label: '科室编码', value: 'code' },
    { label: '科室名称', value: 'name' },
    { label: '上级科室编码', value: 'parentCode' },
    { label: '上级科室名称', value: 'parentName' },
    { label: '科室属性', value: 'sectionAttributeName' },
    { label: '核算属性', value: 'accountAttributeName' },
    { label: '是否病种核算', value: 'diseaseAccountStatusName' },
  ],
  handle: null,
})

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
});
function init() {
  sectiontree().then((res) => {
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
    nextTick(function () {
      handleSearch()
      handleNodeClick(treeInfo.data[0])
    })
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

// 按钮
function search() {
  tableInfo.value.api = section
  filterInfo.value.query = { ...filterInfo.value.query, accountAttribute: 1, diseaseAccountStatus: 1, sectionAttributeNotEq: 1 }
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = { sort: 'create_time desc,id asc', }
  search()
}

// table选择
function SelectionChange(data) {
}

// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    clearSearch()
    return;
  }
  if (node.id !== "-1") {
    filterInfo.value.query.deptId = node.id;
    search();
  }
}

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}
function filterNode(value, data) {
  return (data.code.includes(value) || data.name.includes(value)) && data.accountAttribute == 1 && data.diseaseAccountStatus == 1 && data.sectionAttribute != 1;
}
</script>

<style lang="scss" scoped>
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
