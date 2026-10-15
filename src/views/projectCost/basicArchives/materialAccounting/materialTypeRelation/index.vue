<template>
  <!--  材料核算类关系-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">材料核算类</span>
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
                ref="pageFormRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.searchList"
                :filterBtn="filterInfo.filterbtn"
            >
              <template #filter-productFinCategoryName>
                <el-input
                    v-model="filterInfo.query.productFinCategoryName"
                    class="not-mongolia"
                    type="input"
                    placeholder="请选择财务分类"
                    :disabled="true"
                >
                  <template #append>
                    <el-icon @click="openSuppliesType"><Search /></el-icon>
                  </template>
                </el-input>
              </template>
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
          >
          </table-container>
        </div>
    </div>
    <SelectSuppliesData
        v-if="suppliesInfo.visible"
        v-model:showDialog="suppliesInfo.visible"
        :query="suppliesInfo.query"
        :title="suppliesInfo.title"
        :api="suppliesInfo.api"
        :pager="suppliesInfo.pager"
        :modelType="suppliesInfo.type"
        :check-box="suppliesInfo.checkBox"
        :fieldList="suppliesInfo.fieldList"
        :checkedList="suppliesInfo.checkedList"
        :filterInfoList="suppliesInfo.filters"
        :checkStrictly="suppliesInfo.checkStrictly"
        :no-search="suppliesInfo.noSearch"
        :dialogClone="false"
        highlight-row
        @callback="suppliesCallback"
    ></SelectSuppliesData>
  </div>
</template>

<script setup name="materialTypeRelation">
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import {itemMaterialCategorytlist} from "@/api/projectCost/materialType";
import {
  itemMaterialCategoryexportRelationExcel, itemMaterialCategoryRelationAdd,
  itemMaterialCategoryRelationDelete,
  itemMaterialCategoryRelationPage
} from "@/api/projectCost/materialTypeRelation";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import {productFinCategorytree} from "@/api/personnelInfo";
const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'materialTypeRelation'

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'materialTypeRelation',
  type: '13043',
  action: '/item/feeRelation/import/excelRecord',
})

const { tableParameter, openDialog } = useSelectTableData()
function downloadTemplate() {
  exportTemplateExcel('itemFeeRelationTemplate', 'materialTypeRelation:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '材料核算类导入模板')
    }
  })
}

const pageFormRef = ref()
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addOrUpdate: "",
  categoryId: "",
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});

const suppliesInfo = ref({
  visible: false,
  query: {},
  checkBox: true,
  checkStrictly: false,
  title: '物资目录',

})

// 过滤相关配置
const filterInfo = ref({
  ref: null,
  query: {
  },
  searchList: [
    {
      label: "物资编码",
      value: "code",
      type: 'input',
    },
    {
      label: "物资名称",
      value: "name",
      type: 'input',
    },
    {
      type: 'slot',
      label: '财务分类',
      showLabel: true,
      value: 'productFinCategoryName',
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      type: 'button',
      label: '引入',
      btType: 'primary',
      show: proxy.$permission(`${PERMISSION_CODE}:introduce`),
      event: () => handleintroduce(),
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      event: () => deleteData(),
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
    {label: '材料核算类', value: 'materialCategoryName'},
    {label: '物资编码', value: 'productCode'},
    {label: '物资名称', value: 'productName'},
    {label: '规格型号', value: 'model'},
    {label: '计量单位', value: 'unit'},
    {label: '财务分类', value: 'productFinCategoryName'},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
      },
    ]
  },
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })

watch(() => state.treeRow, (rows) => {
  const addBtn = filterInfo.value.btnList[0]
  addBtn.disabled = !rows
}, { immediate: true })

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
});

function init() {
  itemMaterialCategorytlist({status: '1'}).then((res) => {
    if (res && res.success) {
      let data = res.data;
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '材料核算类',
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
    itemMaterialCategoryRelationDelete(ids).then(({code}) => {
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
    tableInfo.value.sectionRows = raw
  }
}

function openSuppliesType() {
  tableParameter.title = '财务分类'
  tableParameter.checkBox = true
  tableParameter.saveEmpty = true
  tableParameter.defaultProps = {
    children: 'childList',
    label: 'name',
  }
  tableParameter.api = productFinCategorytree
  tableParameter.query = {}
  tableParameter.callBack = (raw) => {
    console.log('1111111', raw)
    tableParameter.checkedList = raw
    let datas = raw?.filter((it) => !it.childList)
    filterInfo.value.query.productFinCategoryIds = datas?.map((it) => it.id)
    filterInfo.value.query.productFinCategoryName = datas?.map((it) => it.name).join(',')
  }
  openDialog(pageFormRef.value, 'tree')
}


function handleintroduce() {
  suppliesInfo.value.visible = true
  suppliesInfo.value.query = { isCharge: '0', filterUsed: '0' }
}

function suppliesCallback(raw) {
  if(raw.length === 0) return suppliesInfo.value.visible = false
  itemMaterialCategoryRelationAdd({
    materialCategoryId: state.treeRow?.id,
    productIds: raw.map(it => it.id),
  }).then(({code}) => {
    if (code === 200) {
      proxy.$message.success('新增成功')
      suppliesInfo.value.visible = false
      getList()
    }
  })
  // filterInfo.value.query.productFinCategoryIds = raw?.map((it) => it.id)
  // filterInfo.value.query.productFinCategoryName = raw?.map((it) => it.name).json(',')
}

// 导出
function showExportExcel() {
  itemMaterialCategoryexportRelationExcel(filterInfo.value.copyQuery).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

// 按钮
function getList() {
  filterInfo.value.copyQuery = {...filterInfo.value.query}
  tableInfo.value.api = itemMaterialCategoryRelationPage
  tableInfo.value.refresh = Math.random()
}

function clearSearch() {
  filterInfo.value.query = {}
  tableParameter.checkedList = []
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
    state.categoryId = node.id;
    filterInfo.value.query.materialCategoryId = node.id;
    getList();
  }
}

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
