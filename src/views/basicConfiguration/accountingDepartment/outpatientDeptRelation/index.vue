<!--  门诊执行科室关系-->
<template>
  <div class="app-container">
    <div>
      <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.filterbtn"
      >
        <template #filter-accountSectionName>
          <el-input
              v-model="filterInfo.query.accountSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-sysSectionName>
          <el-input
              v-model="filterInfo.query.sysSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择系统科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openCostDept"><Search /></el-icon>
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
          @handleEvent="SelectionChange"
          :row-class-name="tableRowClassName"
          @pageInfo="pageInfo"
      >
      </table-container>
    </div>
    <!--    新增-->
    <PageDialog
        :title="addInfo.title"
        :visible="addInfo.visible"
        :btList="addInfo.btList"
        class="model-panel-body paddingBox order-model-formBox"
        @reset="goback"
    >
      <!-- 条件栏 -->
      <page-form
          v-model:ref-obj="addInfo.ref"
          :data="addInfo.data"
          :field-list="addInfo.fieldList"
          :rules="addInfo.rules"
          :label-width="addInfo.labelWidth"
      >
        <template v-slot:form-accountSectionName>
          <el-input
              v-model="addInfo.data.accountSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptCost"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-sysSectionName>
          <el-input
              v-model="addInfo.data.sysSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择系统科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSystem"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
    <!--    查询核算科室-->
    <SelectDeptArchivesTree
        v-if="depttreeInfo.visible"
        v-model:showDialog="depttreeInfo.visible"
        :title="depttreeInfo.title"
        :checkStrictly="depttreeInfo.checkStrictly"
        :isLeaf="depttreeInfo.isLeaf"
        :query="depttreeInfo.query"
        :checkBox="depttreeInfo.checkBox"
        :checkedList="depttreeInfo.checkedList"
        :api="depttreeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
    <SelectDeptTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :checkedList="treeInfo.checkedList"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<script setup name="outpatientDeptRelation">
import {useStorage} from "@vueuse/core";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  sectionRelationpage,
  sectionRelationadd,
  sectionRelationupdate,
  sectiontree,
  sectionRelationdelete,
  sectionRelationexportExcel,
} from "@/api/accountingDepartment";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const PERMISSION_CODE = 'outpatientDeptRelation'
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'outpatientDeptRelation',
  BUTTON_CODE: 'uploadFile',
  type: '1300402',
  action: '/sectionRelation/import/excelRecord',
})
const advancedSearchInfo = ref({
  visible: false,
  data: {},
})

const multipleSelection = ref([]);
const currentRow = ref({});

const setting = useStorage('setting', {}, sessionStorage)

const clearType = ref(true)
// 过滤相关配置
const filterInfo = ref({
  query: {
    type: 2,
    sort: 'create_time desc,id asc',
  },
  searchList: [
    {
      type: 'slot',
      label: '核算科室',
      value: 'accountSectionName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '系统科室',
      value: 'sysSectionName',
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
      show: proxy.$permission(`${PERMISSION_CODE}:add`),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      event: deleteBtn,
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission(`${PERMISSION_CODE}:downloadTemplate`),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission(`${PERMISSION_CODE}:exportExcel`),
    },
  ],
})
//由pageInfo更新
const page = ref({
  page: true,
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})

// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  data: [],
  fieldList: [
    {label: '核算科室编码', value: 'accountSectionCode'},
    {label: '核算科室名称', value: 'accountSectionName'},
    {label: '系统科室编码', value: 'sysSectionCode'},
    {label: '系统科室名称', value: 'sysSectionName'},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: romove,
      },
    ],
  },
})

// 新增参数
const addInfo = ref({
  visible: false,
  ref: null,
  title: '',
  addOrUpdate: null,
  data: {},
  labelWidth: "100px",
  fieldList: [
    {
      label: "核算科室",
      value: "accountSectionName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "系统科室",
      value: "sysSectionName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    accountSectionName: [{ required: true, message: '请选择核算科室' }],
    sysSectionName: [{ required: true, message: '请选择系统科室' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})

watch(() => multipleSelection.value, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  search()
})

function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function search() {
  tableInfo.value.api = sectionRelationpage
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

// table选择
function SelectionChange(val,data) {
  if(val === 'list') return
  if (val === "tableClickRow") {
    currentRow.value = data;
  } else {
    multipleSelection.value = data
  }
}

// 删除成本项目
function deleteBtn() {
  if(multipleSelection.value.length === 0) return proxy.$message.warning('请勾选数据')
  const ids = multipleSelection.value.map((it) => it.id)
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        sectionRelationdelete(ids).then((res) => {
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
  addInfo.value.visible = true;
  addInfo.value.data = {}
  addInfo.value.addOrUpdate = sectionRelationadd;
  addInfo.value.title = '新增门诊执行科室关系';
}

async function save() {
  let flag = 0;
  await addInfo.value.ref.validate((valid) => {
    console.log(valid);
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    const fromData = {
      ...addInfo.value.data,
      type: 2,
      orgId: setting.value.hospitalId,
    }
    addInfo.value.addOrUpdate(fromData).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        search();
        addInfo.value.visible = false;
      }
    });
  }
}

function goback() {
  addInfo.value.visible = false;
}

function update(row) {
  addInfo.value.visible = true;
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = sectionRelationupdate;
  addInfo.value.title = '修改门诊执行科室关系';
}

function romove(row) {
  sectionRelationdelete([row.id]).then((res) => {
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
  exportTemplateExcel('门诊执行科室关系导入模板', `${PERMISSION_CODE}:downloadTemplate`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '门诊执行科室关系导入模板')
    }
  })
}

const filterNum = ref(false)

// 核算科室
const depttreeInfo = ref({
  title: '核算科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  api: sectiontree,
  query: {},
  checkedList: [],
})
// 系统科室
const treeInfo = ref({
  title: '系统科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: true,
  api: null,
  query: {},
  checkedList: [],
})

// filter查询
function openDeptSelector() {
  treeInfo.value.title = "核算科室";
  depttreeInfo.value.visible = true;
  depttreeInfo.value.isLeaf = false;
  depttreeInfo.value.checkBox = true;
  filterNum.value = true;
}
// filter查询
function openCostDept() {
  treeInfo.value.title = "系统科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = false;
  treeInfo.value.checkBox = true;
  filterNum.value = true;
}
// 核算科室
function openDeptCost() {
  treeInfo.value.title = "核算科室";
  depttreeInfo.value.visible = true;
  depttreeInfo.value.isLeaf = true;
  depttreeInfo.value.checkBox = false;
  filterNum.value = false;
}

// 系统科室
function openDeptSystem() {
  treeInfo.value.title = "系统科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = false;
  treeInfo.value.checkBox = false;
  filterNum.value = false;
}

function treeCallback(data) {
  treeInfo.value.visible = false
  depttreeInfo.value.visible = false
  if(filterNum.value) {
    // 外面筛选条件
    if(treeInfo.value.title === '核算科室') {
      depttreeInfo.value.checkedList = data;
      let datas = data?.filter((it) => !it.childList)
      filterInfo.value.query.accountSectionName = datas?.map((it) => it.name);
      filterInfo.value.query.accountSectionId = datas?.map((it) => it.id);
      filterInfo.value.query.accountSectionIdList = datas?.map((it) => it.id);
    } else {
      treeInfo.value.checkedList = data;
      filterInfo.value.query.sysSectionName = data?.map((it) => it.name);
      filterInfo.value.query.sysSectionId = data?.map((it) => it.id);
      filterInfo.value.query.sysSectionIdList = data?.map((it) => it.id);
    }
    return
  }
  // 里面新增表单
  if(treeInfo.value.title === '核算科室') {
    addInfo.value.data.accountSectionName = data.name;
    addInfo.value.data.accountSectionCode = data.code;
    addInfo.value.data.accountSectionId = data.id;
  } else {
    addInfo.value.data.sysSectionName = data.name;
    addInfo.value.data.sysSectionCode = data.code;
    addInfo.value.data.sysSectionId = data.id;
  }
}

function pageInfo(obj) {
  page.value = obj
}

function showExportExcel() {
  sectionRelationexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

</script>

<style scoped></style>
