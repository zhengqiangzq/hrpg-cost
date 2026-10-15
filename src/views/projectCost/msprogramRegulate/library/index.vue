<!--  医疗服务项目规范库-->
<template>
  <div class="app-container">
    <div class="app-container-flex" v-show="!detailsInfo.visible && !modifyInfo.visible">
      <div class="left-container">
        <div class="left-container-header">
          <span class="title">医疗服务项目规范库</span>
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
              </NewPageFilter>
            </div>
        <div class="filter-wrapper">
            <!-- 按钮 -->
            <NewPageFilter
                :filterBtn="filterInfo.btnList"
            />
        </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :tab-index="true"
              :handle="tableInfo.handle"
              :query="filterInfo.query"
              :field-list="tableInfo.fieldList"
              @handleEvent="tableHandler"
              :checkBox="true"
              :highlightRow="true"
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
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
  </div>
</template>

<script setup name="library">
import {
    deleteMsProgramRegulateLibrary,
    exportMsProgramRegulateLibrary,
    pageMsProgramRegulateLibrary,
} from "@/api/projectCost/MSProgramRegulateLibrary";
import {treeMSProgramRegulateCatalog} from "@/api/projectCost/MSProgramRegulateCatalog";
import {reactive, getCurrentInstance, onMounted, ref, watch} from "vue";
import {exportTemplateExcel} from "@/api/pub";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {deepClone} from "@/utils";
import Modify from "./modify.vue";
import Details from "./details.vue";
const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'library'
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addOrUpdate: "",
  tableRow: '',
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13058',
  action: '/item/medicalServiceStandardsLib/import/excelRecord',
})

// 过滤相关配置
const filterInfo = ref({
  ref: null,
  query: {
      leftCatalogId: -2,
  },
  searchList: [
    {
      label: "服务项目",
      value: "OrBatchLike#name#code#nameEn",
      type: 'input',
    },
    {
      label: "项目内涵",
      value: "projectConnotationLike",
      type: 'input',
    },
    {
      label: "项目目录",
      value: "catalogKeyword",
      type: 'input',
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
      {
          label: '新增',
          event: () => openModify(),
          show: proxy.$permission(`${PERMISSION_CODE}:add`),
          type: 'button',
      },
      {
          label: '删除',
          event: () => deleteRow(),
          show: proxy.$permission(`${PERMISSION_CODE}:delete`),
          type: 'button',
      },
      {
          label: '下载模版',
          event: downloadTemplate,
          show: proxy.$permission(`${PERMISSION_CODE}:download`),
          type: 'button',
      },
      ...uploadExcelBtns,
      {
          label: '导出Excel',
          event: showExportExcel,
          show: proxy.$permission(`${PERMISSION_CODE}:export`),
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
  api: null,
  data: [],
  fieldList: [
    {label: '项目编码', value: 'code', type: 'slot'},
    {label: '项目名称(中文)', value: 'name'},
    {label: '项目名称(英文)', value: 'nameEn'},
    {label: '项目目录', value: 'catalogName'},
    {label: '项目内涵', value: 'projectConnotation'},
    {label: '必选耗材', value: 'requiredConsumables'},
    {label: '可选耗材', value: 'optionalConsumables'},
    {label: '低值耗材分档', value: 'consumablesClassification'},
    {label: '基本人力消耗及耗时', value: 'manpowerAndTimeConsumption'},
    {label: '项目耗时(分钟)', value: 'timeConsumption'},
    {label: '技术难度', value: 'technicalDifficulty'},
    {label: '风险程度', value: 'riskLevel'},
    {label: '人力资源消耗相对值', value: 'manpowerConsumptionRelativeVal'},
    {label: '计量单位', value: 'measureUnit'},
    {label: '说明', value: 'remark'},
    {label: '特殊情况资源消耗调整系数', value: 'adjustmentCoefficient'},
    {label: '收费票据分类', value: 'billClassification'},
    {label: '会计科目分类', value: 'accountingSubjectsClassification'},
    {label: '病案首页费用分类', value: 'expenseClassification'},
  ],
    sectionRows: [],
    handle: {
        fixed: 'right',
        label: '操作',
        width: '130',
        btList: [
            {
                label: '编辑',
                show: proxy.$permission(`${PERMISSION_CODE}:update`),
                ifRender: (row) => row.builtIn !== '1',
                event: openModify,
            },
            {
                label: '删除',
                show: proxy.$permission(`${PERMISSION_CODE}:delete`),
                ifRender: (row) => row.builtIn !== '1',
                event: deleteRow,
            },
        ]
    },
})


watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const dels = rows?.filter(it => it.builtIn === '1')
  deleteBtn.disabled = rows.length === 0 ? true : dels.length > 0;
}, { immediate: true })


const modifyInfo = ref({
  title: '医疗服务项目',
  visible: false,
})
const detailsInfo = ref({
  id: '',
  visible: false,
})


onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
});

function init() {
  treeMSProgramRegulateCatalog().then((res) => {
    if (res && res.success) {
      let data = res.data;
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '医疗服务项目规范目录',
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


// 导出
function showExportExcel() {
    exportMsProgramRegulateLibrary(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function downloadTemplate() {
    exportTemplateExcel('itemMedicalServiceStandardsLib', `${PERMISSION_CODE}:download`).then((res) => {
        if (res) {
            proxy.$fn.parseExcel(res, '医疗服务项目规范库导入模板')
        }
    })
}

function returnModify(flag) {
  if(!flag) return
  init()
}

// 按钮
function getList() {
  tableInfo.value.api = pageMsProgramRegulateLibrary
  tableInfo.value.refresh = Math.random()
}

function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  getList()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
    if (eventName === 'tableCheck') {
        tableInfo.value.sectionRows = raw
    }
}

// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.treeRow = ''
    clearSearch()
    return;
  }
  state.isAddUpdate = "update";
  state.addOrUpdate = null;
  state.treeRow = node;
  state.categoryId = node.id;
  if (node.id !== "-1") {
    filterInfo.value.query.leftCatalogId = node.id;
    getList();
  }
}

function openModify(row) {
  const cloneRow = row ? deepClone(row) : {}
  modifyInfo.value.id = cloneRow?.id
  if(Object.keys(cloneRow).length === 0) {
    cloneRow.levelNum = Number(state.treeRow?.levelNum || 0) + 1;
    cloneRow.parentId = state.treeRow?.id;
    cloneRow.parentName = state.treeRow?.name;
  }
  modifyInfo.value.tableRow = cloneRow || {}
  modifyInfo.value.title = `${!!cloneRow?.id ? '修改' : '新增'}医疗服务项目规范库`
  modifyInfo.value.visible = true
}

function detail(row) {
  detailsInfo.value.id = row.id
  detailsInfo.value.visible = true
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
        deleteMsProgramRegulateLibrary(ids).then(({ code }) => {
            if (code === 200) {
              proxy.$message.success('删除成功')
              getList()
            }
        })
    })
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
