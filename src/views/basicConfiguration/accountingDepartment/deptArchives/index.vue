<!--  科室档案-->
<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
        <span class="title">科室档案</span>
        <!-- 按钮 -->
        <TreeButtons
            :filterBtn="filterInfo.btnList"
        >
        </TreeButtons>
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
              :clearable="true"
              v-model="treeInfo.query.name"
              placeholder="请输入编码/名称"
              suffix-icon="Search"
              @keyup="handleSearch"
              @clear="handleSearch"
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
              </NewPageFilter>
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
                @pageInfo="pageInfo"
            >
            </table-container>
      </div>
<!--      科室 tree-->
      <SelectDeptArchivesTree
          v-if="selecttreeinfo.visible"
          v-model:showDialog="selecttreeinfo.visible"
          :title="selecttreeinfo.title"
          :checkStrictly="selecttreeinfo.checkStrictly"
          :isLeaf="selecttreeinfo.isLeaf"
          :query="selecttreeinfo.query"
          :checkBox="selecttreeinfo.checkBox"
          :api="selecttreeinfo.api"
          :highlight-current="true"
          @callback="treeCallback" />
      <!--     同步科室-->
      <page-dialog
          title="同步科室"
          v-if="BatchDept.visible"
          v-model:visible="BatchDept.visible"
          :bt-list="BatchDept.btList"
      >
        <page-form
            className="paddingBox formTree flex_wrap_start_start"
            v-model:ref-obj="BatchDept.ref"
            :data="BatchDept.data"
            :field-list="BatchDept.fieldList"
        >
        </page-form>
      </page-dialog>
      <add-edit
          v-if="state.addBtn"
          :id="state.id"
          :title="state.title"
          :tableRow="formOrgInfo.data"
          :visible="state.addBtn"
          @callback="diaLogeCallback"
      />
    </div>
  </div>
</template>

<script setup name="deptArchives">
import PageForm from "@/components/PageForm/index.vue";
import {useStorage} from "@vueuse/core";
import {
  section,
  sectiontree,
  sectiondelete,
  sectionsyncId,
  sectionexportExcel, sectioninitLaunchInnerCode,
} from "@/api/accountingDepartment";
import {useUpload} from "@/hooks/useUpload";
import {watch} from "vue";
import AddEdit from "./AddEdit.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
const { proxy } = getCurrentInstance();
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

const from = ref()

const setting = useStorage('setting', {}, sessionStorage)
const {
  downloadTemplate,
  exportData
} = useUpload({
  export: sectionexportExcel
}, '科室档案导入模板', '/section/importExcel', () => search(), 'deptArchives:uploadFile')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'deptArchives',
  BUTTON_CODE: 'uploadFile',
  type: '13002',
  action: '/section/import/excelRecord'
})
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
      label: '核算属性',
      value: 'accountAttribute',
      code: 'dept_type',
      event: search,
    },
    {
      type: 'select-model',
      label: '科室属性',
      value: 'sectionAttribute',
      code: 'cost_dept_attribute',
      event: search,
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      label: '新增',
      event: addBtn,
      show: proxy.$permission('deptArchives:add'),
      type: 'button',
    },
    {
      label: '删除',
      event: deleteBtn,
      show: proxy.$permission('deptArchives:delete'),
      type: 'button',
    },
    {
      label: '同步',
      show: proxy.$permission('deptArchives:synchro'),
      event: synchronizationDept,
      type: 'button',
    },
    {
      label: '下载模版',
      show: proxy.$permission('deptArchives:downloadTemplate'),
      event: () => downloadTemplate('科室档案导入模板', 'deptArchives:downloadTemplate'),
      type: 'button',
    },
    ...uploadExcelBtns,
    {
      label: '导出Excel',
      show: proxy.$permission('deptArchives:exportExcel'),
      event: showExportExcel,
      type: 'button',
    },
    {
      label: '初始化内部编码',
      show: proxy.$permission('deptArchives:initialization'),
      event: initializationHandle,
      type: 'button',
    },
  ]
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
    { label: '分摊级次', value: 'shareLevelName' },
    { label: '是否向下分摊', value: 'shareStatusName' },
    { label: '是否参与分摊', value: 'deptShareStatusName' },
    { label: '是否末级', value: 'lastFlagName' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('deptArchives:update'),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission('deptArchives:delete'),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: romove,
      },
    ],
  },
})

const formOrgInfo = reactive({
  ref: null,
  data: {},
  fieldList: [],
  rules: {},
});
watch(
    () => treeInfo.data,
    () => {
      state.addBtn = false;
    },
    {
      deep: true,
    }
);

watch(() => formOrgInfo.data.accountAttribute, (accountAttribute) => {
  formOrgInfo.rules.sectionAttribute = accountAttribute == 1 ? [{ required: true, message: '请选择科室属性', trigger: 'blur' }] : []
}, { immediate: true, deep: true })

//由pageInfo更新
const page = ref({
  page: true,
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})
function pageInfo(obj) {
  page.value = obj
}

// 同步科室
const BatchDept = ref({
  visible: false,
  data: {
    orgId: setting.value.hospitalId,
    orgName: setting.value.hospitalName,
  },
  fieldList: [
    {
      type: 'input',
      value: 'orgName',
      label: '业务单元',
      disabled: true
    },
    {
      type: 'select-model',
      label: '采集模式',
      value: 'method',
      code: 'collection_method',
    },
  ],
  btList: [
    { label: '保存', event: saveSetting },
    { label: '取消', event: callSetting },
  ],
})

// 同步基础服务科室
async function synchronizationDept () {
  // BatchDept.value.visible = true;
  const { data, code, msg } = await sectionsyncId(setting.value.hospitalId)
  if( code === 200 ) {
    proxy.$message.success('同步成功')
    init();
  }
}


function saveSetting () {

}

function callSetting () {
  BatchDept.value.visible = false;
}
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


// 导出
function showExportExcel() {
  exportData(filterInfo.value.query)
}

// 按钮
function search() {
  tableInfo.value.api = section
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

// table选择
function SelectionChange(val, data) {
  state.tableRow = data;
}
// 新增
function addBtn() {
  state.id = null;
  state.addBtn = true;
  state.title = '新增科室档案';
  formOrgInfo.data = {
    status: '1',
    shareStatus: '0',
    deptShareStatus: '1',
    itemAccountStatus: '0',
    diseaseAccountStatus: '0',
    parentCode: state.treeRow?.code,
    parentName: state.treeRow?.name,
    parentId: state.treeRow?.id,
  };
}

// 点击编辑
async function update(row) {
  state.addBtn = true;
  state.title = '修改科室档案';
  formOrgInfo.data = row;
  state.id = row.id;
}


const selecttreeinfo = ref({
  title: '上级科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  query: {}
})

function openCategoryList() {
  selecttreeinfo.value.visible = true
}

function treeCallback(raw) {
  formOrgInfo.data.parentId = raw.id
  formOrgInfo.data.parentCode = raw.code
  formOrgInfo.data.parentName = raw.name
  selecttreeinfo.value.visible = false
}


function diaLogeCallback(flag) {
  if (flag) {
    state.id = null;
    init()
  } else {
    state.addBtn = false
  }
}

// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.categoryId = node.id;
    state.treeRow = ''
    clearSearch()
    return;
  }
  // if (node) {
  //   disableDelBtn.value = node.children?.length > 0 ? true : false;
  // } else {
  //   disableDelBtn.value = true;
  // }

  state.isAddUpdate = "update";
  state.treeRow = node;
  state.categoryId = node.id;
  if (node.id !== "-1") {
    state.categoryId = node.id;
    filterInfo.value.query.deptId = node.id;
    search();
  }
}

// 删除
function deleteBtn() {
  if(!state.tableRow?.id) return proxy.$message.warning('请选择数据')
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        romove(state.tableRow)
      })
      .catch(() => {});
}
// 点击删除
async function romove(row) {
  sectiondelete(row.id).then((res) => {
    if (res && res.success) {
      proxy.$message.success('删除成功')
      init()
    }
  })
}

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}
function filterNode(value, data) {
  const filterName = `${data.code}${data.name}`
  return filterName.includes(value);
}

function initializationHandle() {
  proxy
      .$confirm("是否初始化v3.5.201版本及之前已上线的系统科室档案、成本分类、成本项目内部编码？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        initializationCode()
      })
      .catch(() => {});
}

async function initializationCode() {
  const {code} = await sectioninitLaunchInnerCode()
    if (code === 200) {
      proxy.$message.success('初始化成功')
      init()
    }
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
