<!--  科室档案-->
<template>
  <div class="app-container">
    <div class="app-container-flex"  v-show="!detailsInfo.visible">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">报告生成</span>
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
              default-expand-all
              :default-expand-all="false"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
        <div class="layui-card-body">
          <div class="model-panel-body">
            <div class="filter-wrapper">
              <!-- 条件栏 -->
              <NewPageFilter
                  v-model:query="filterInfo.query"
                  :filter-list="filterInfo.searchList"
                  :filter-btn="filterInfo.filterbtn"
                  :listTypeInfo="filterInfo.options"
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
                  :query="filterInfo.query"
                  :field-list="tableInfo.fieldList"
                  :handle="tableInfo.handle"
                  @handleEvent="SelectionChange"
                  :checkBox="true"
                  :highlightRow="true"
              >
              </table-container>
          </div>
        </div>
      </div>
    </div>
    <Modify
        v-if="detailsInfo.visible"
        v-model:visible="detailsInfo.visible"
        :id="detailsInfo.id"
        :title="detailsInfo.params.title"
        :params="detailsInfo.params"
        @returnModify="callbackmodify"
    />
  </div>
</template>

<script setup name="reportGeneration">
import {useStorage} from "@vueuse/core";
import {basicanalysisreport, analysisreportfilepage, analysisreportfilebyDelete, analysisreportutilgenerate} from "@/api/reportGeneration";
import {periodyearList} from "@/api/base";
import Modify from "./modify.vue";
const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'reportGeneration'
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: false,
  addOrUpdate: "",
  categoryId: "",
  treeRow: '',
  flag: true,
});

const detailsInfo = ref({
  title: '',
  params: {},
  visible: false,
})

const setting = useStorage('setting', {}, sessionStorage)

// 过滤相关配置
const filterInfo = ref({
  ref: null,
  query: {
    type: 'queryAll',
    pageNo: 1,
    pageSize: 100,
    periodId: '',
    reportCode: ''
  },
  api: '',
  options: {
    costType: []
  },
  searchList: [
    {
      type: 'select',
      label: '年份',
      value: 'periodId',
      clearable: false,
      required: true,
      list: 'costType',
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      label: '报告生成',
      value: 'flowDate',
      event: handlereport,
      show: proxy.$permission(`${PERMISSION_CODE}:report`),
      type: 'button',
      btType: 'primary',
      disabled: true,
    },
    {
      label: '删除',
      value: 'flowDate',
      event: deleteBtn,
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      type: 'button',
      disabled: true,
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
  currentRow: '',
  sectionRows: [],
  data: [],
  fieldList: [
    { label: "报告名称", value: "name" },
    { label: "创建人", value: "createUserName" },
    { label: "创建组织", value: "orgName" },
    { label: "创建日期", value: "createTime" },
    { label: "备注", value: "remark" },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '预览',
        show: proxy.$permission(`${PERMISSION_CODE}:preview`),
        event: preview,
      },
      {
        label: '下载',
        show: proxy.$permission(`${PERMISSION_CODE}:download`),
        event: download,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteBtn,
      },
    ],
  },
})

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })

watch(() => state.treeRow, (row) => {
  const btns = filterInfo.value.btnList
  const generate = btns.filter((it) => it.label === '报告生成')[0]
  generate.disabled = !row
}, { immediate: true })


function handlereport() {
  analysisreportutilgenerate({
    code: state.treeRow?.code,
    pk_org: setting.value.hospitalId,
    periodId: filterInfo.value.query.periodId
  }).then((res) => {
    if(res.code === 200) {
      detailsInfo.value.visible = true
      detailsInfo.value.params = {
        title: res.data.name,
        name: '报告生成',
        editUrl: res.data.filePath,
        reportCode: state.treeRow?.code,
        url: getPath(res.data.filePath)
      }
    }
  })
}

// 删除
function deleteBtn(row) {
  if (!row && tableInfo.value.sectionRows.length === 0) {
    proxy.$message.warning('请选择需要删除的数据')
    return
  }
  const rows = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        analysisreportfilebyDelete(rows).then((res) => {
          if (res.code === 200) {
            getList()
          }
        })
      })
      .catch(() => {});
}

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
  getYear()
});
async function getYear() {
  periodyearList().then((res) => {
    filterInfo.value.options.costType = res.data && res.data.map(it => {
      return {
        key: it.periodYear,
        value: it.id,
      }
    })
    let year = new Date().getFullYear()
    const val = res.data.filter(it => it.periodYear === year)[0]
    filterInfo.value.query.periodId = val.id;
  });
}
function init() {
  basicanalysisreport({
    pageNo: 1,
    pageSize: 100,
    subSystemIds: '1780129154924122114'
  }).then((res) => {
    if (res.code === 200) {
      let data = res.data;
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '报告生成',
          id: '-1'
        }
      ]
      handleNodeClick(state.treeRow || treeInfo.data[0])
    }
  });
}

function preview(row) {
  detailsInfo.value.params = {
    title: row.name,
    name: '生成报告详情',
    editUrl: row.filePath,
    reportCode: state.treeRow?.code,
    url: getPath(row.filePath)
  }
  detailsInfo.value.visible = true
}

function download(row) {
  const _path = getPath(row.filePath)
  downloadFile(_path, `${row.name}.docx`)

}
function getPath(path) {
  let url = path
  const isDev = import.meta.env.VITE_APP_ENV === 'development'
  if (isDev) {
    url = import.meta.env.VITE_APP_FILE_URL + path
  } else {
    url = window.location.origin + import.meta.env.VITE_APP_FILE_URL + path
  }
  return url
}
async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = filename; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('下载失败:', error);
  }
}

function callbackmodify(data) {
  detailsInfo.value.visible = false
  if(data) {
    getList()
  }
}

// 按钮
function getList() {
  tableInfo.value.api = analysisreportfilepage
  tableInfo.value.data = []
  if(!state.treeRow) return
  filterInfo.value.query.reportCode = state.treeRow?.code
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  getList()
}

// table选择
function SelectionChange(val, data) {
  if (val === "tableCheck") {
    tableInfo.value.sectionRows = data
  }
}

// 点击树节点
function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.categoryId = node.id;
    state.treeRow = ''
    tableInfo.value.data = []
    return;
  }
  state.treeRow = node;
  state.categoryId = node.id;
  if (node.id !== "-1") {
    state.categoryId = node.id;
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
