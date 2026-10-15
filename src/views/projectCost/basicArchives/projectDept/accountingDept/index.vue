<template>
  <!--  科室档案-->
  <div class="app-container">
    <div class="app-container-flex" v-show="!detailsInfo.visible && !modifyInfo.visible">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">项目核算科室</span>
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
                :filterBtn="filterInfo.filterbtn"
                :listTypeInfo="filterInfo.options"
            >
            </NewPageFilter>
          </div>
        <!-- 条件栏 -->
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :tab-index="true"
              :checkBox="true"
              :highlightRow="true"
              :query="filterInfo.copyQuery"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
              @pageInfo="info => tableInfo.pageInfo = info"
          >
            <template #col-code="{ row }">
              <span class="slip-edit" @click="detail(row)">{{ row.code }}</span>
            </template>
          </table-container>
        </div>
    </div>
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :params="modifyInfo.tableRow"
        :title="modifyInfo.title"
        @returnModify="returnModify"
    />
    <Details
        v-if="detailsInfo.visible"
        :params="detailsInfo.tableRow"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
  </div>
</template>

<script setup name="accountingDept">
import {
  itemsectiontree,
  itemsectionPage,
  itemsectionDelete,
  itemsectionexportExcel,
  itemsectionEnable, itemsectionDisable, itemsectionSync
} from "@/api/projectCost/accountingDept";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import customModelDialog from "@/components/TransferTabDialog/customModelDialog";
import {getCurrentInstance, onMounted, ref, reactive} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {useStore} from "vuex";
import Details from "./details.vue";
import Modify from "./modify.vue";
import {deepClone} from "@/utils";
const store = useStore()
const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'accountingDept'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'accountingDept',
  type: '13043',
  action: '/item/feeRelation/import/excelRecord',
})
const { customBtns } = customModelDialog({
  PERMISSION_CODE: PERMISSION_CODE,
  title: '',
  categoryId: '',
  apiExport: itemsectionexportExcel,
  bizType: '14015',
  disabled: false,
  // 点击「自定义导出」时实时获取列表接口的查询参数（getList 组装后的参数）
  query: () => ({ ...filterInfo.value.copyQuery }),
  // 勾选数据：当前表格勾选的 id
  idIn: () => tableInfo.value.sectionRows.map(it => it.id).join(),
  // 分页参数：由 table-container 的 pageInfo 事件同步
  page: () => ({ ...tableInfo.value.pageInfo }),
})

function downloadTemplate() {
  exportTemplateExcel('itemFeeRelationTemplate', 'accountingDept:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '项目核算科室导入模板')
    }
  })
}


const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addOrUpdate: "",
  categoryId: "",
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});

const modifyInfo = ref({
  visible: false,
  title: '核算科室'
})
const detailsInfo = ref({
  visible: false,
})
// 过滤相关配置
const filterInfo = ref({
  ref: null,
  query: {
  },
  options: {
    accountList: []
  },
  searchList: [
    {
      label: "科室信息",
      value: "keyword",
      type: 'input',
    },
    {
      type: 'select',
      label: '核算属性',
      value: 'accountAttribute',
      list: 'accountList',
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      show: proxy.$permission(`${PERMISSION_CODE}:add`),
      event: () => openModify(),
    },
    {
      type: 'button',
      label: '同步',
      show: proxy.$permission(`${PERMISSION_CODE}:synchronization`),
      event: () => synchronization(),
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission(`${PERMISSION_CODE}:download`),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission(`${PERMISSION_CODE}:export`),
    },
    ...customBtns,
    // {
    //   type: 'button',
    //   label: '自定义导入模板',
    //   event: () => custUploadTemp('IMPORT'),
    //   show: proxy.$permission(`${PERMISSION_CODE}:export`),
    // },
    // {
    //   type: 'button',
    //   label: '自定义导出',
    //   event: () => custExport('EXPORT'),
    //   show: proxy.$permission(`${PERMISSION_CODE}:export`),
    // },

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
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  data: [],
  sectionRows: [],
  fieldList: [
    {label: '科室编码', value: 'code', type: 'slot'},
    {label: '科室名称', value: 'name'},
    {label: '所属上级科室编码', value: 'parentCode'},
    {label: '所属上级科室名称', value: 'parentName'},
    {label: '科室级次', value: 'levelNum'},
    {label: '核算属性', value: 'accountAttributeName'},
    {label: '备注', value: 'remark'},
    {label: '启用状态', value: 'statusName'},
    {label: '创建人', value: 'createDate'},
    {label: '创建日期', value: 'createUserName'},
  ],
  pageInfo: {},
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '启用',
        show: proxy.$permission(`${PERMISSION_CODE}:enable`),
        event: handleEnable,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '停用',
        show: proxy.$permission(`${PERMISSION_CODE}:disEnable`),
        event: handleDisEnable,
        ifRender: (row) => row.status === '1'
      },
    ]
  },
})

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
});

function init() {
  itemsectiontree().then((res) => {
    if (res && res.success) {
      let data = res.data;
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '项目核算档案',
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

function deleteData(row) {
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    itemsectionDelete(row.id).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        init()
        state.treeRow = ''
      }
    })
  })
}
// 添加
function openModify(row) {
  const cloneRow = row ? deepClone(row) : {}
  modifyInfo.value.id = cloneRow?.id
  if(Object.keys(cloneRow).length === 0) {
    cloneRow.levelNum = Number(state.treeRow?.levelNum || 0) + 1;
    cloneRow.parentId = state.treeRow?.id;
    cloneRow.parentName = state.treeRow?.name;
  }
  modifyInfo.value.tableRow = cloneRow || {}
  modifyInfo.value.title = `${!!cloneRow?.id ? '修改' : '新增'}核算科室`
  modifyInfo.value.visible = true
}

function detail(row) {
  detailsInfo.value.tableRow = row
  detailsInfo.value.visible = true
}
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.value.sectionRows = raw
  }
}

function synchronization() {
  itemsectionSync().then(({code}) => {
    if (code === 200) {
      proxy.$message.success('同步成功')
      getList()
    }
  })
}

function handleEnable(row) {
  itemsectionEnable(row.id).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('启用成功')
      getList()
    }
  })
}
function handleDisEnable(row) {
  itemsectionDisable(row.id).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('停用成功')
      getList()
    }
  })
}

// 导出
function showExportExcel() {
  itemsectionexportExcel(filterInfo.value.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function returnModify(flag) {
  if(!flag) return
  init()
}

// 按钮
function getList() {
  filterInfo.value.copyQuery = {...filterInfo.value.query}
  tableInfo.value.api = itemsectionPage
  tableInfo.value.refresh = Math.random()
}

function clearSearch() {
  filterInfo.value.query = {}
  getList()
}

// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.categoryId = node.id;
    state.treeRow = ''
    clearSearch()
    return;
  }
  state.isAddUpdate = "update";
  state.addOrUpdate = null;
  state.treeRow = node;
  state.categoryId = node.id;
  if (node.id !== "-1") {
    filterInfo.value.query.itemDeptId = node.id;
    getList();
  }
}

function formatterValue() {
  const source = store.state.permission.dict['dept_type']
  if(!source) return ''
  filterInfo.value.options.accountList = []
  source.forEach((it) => {
    if(it.code === '1' || it.code === '2') {
      filterInfo.value.options.accountList.push({
        key: it.name,
        value: it.code
      })
    }
  })
}

formatterValue()

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}

function filterNode(value, data) {
  const filterName = `${data.code}${data.name}`
  return filterName.includes(value);
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
