<!--  药品分类关系-->
<template>
  <div class="app-container">
    <div>
      <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter
          ref="filterRef"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.filterbtn"
      >
        <template #filter-drugFinCategoryName>
          <el-input
              v-model="filterInfo.query.drugFinCategoryName"
              class="not-mongolia"
              type="input"
              placeholder="请选择药品分类"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openSalaryPro"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-costItemName>
          <el-input
              v-model="filterInfo.query.costItemName"
              class="not-mongolia"
              type="input"
              placeholder="请选择成本项目"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openCostPro"><Search /></el-icon>
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
        @reset="goback"
    >
      <!-- 条件栏 -->
      <page-form
          ref="filterRef"
          className="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="addInfo.ref"
          :data="addInfo.data"
          :field-list="addInfo.fieldList"
          :rules="addInfo.rules"
          :label-width="addInfo.labelWidth"
      >
        <template v-slot:form-drugFinCategoryName>
          <el-input
              v-model="addInfo.data.drugFinCategoryName"
              class="not-mongolia"
              type="input"
              placeholder="请选择药品分类"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDialogPro"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-costItemName>
          <el-input
              v-model="addInfo.data.costItemName"
              class="not-mongolia"
              type="input"
              placeholder="请选择成本项目"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDialogCostPro"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
    <!--    查询药品分类-->
    <SelectDrugTree
        v-if="depttreeInfo.visible"
        v-model:showDialog="depttreeInfo.visible"
        :title="depttreeInfo.title"
        :checkStrictly="depttreeInfo.checkStrictly"
        :isLeaf="depttreeInfo.isLeaf"
        :query="depttreeInfo.query"
        :checkBox="depttreeInfo.checkBox"
        :api="depttreeInfo.api"
        :checkedList="filterNum ? depttreeInfo.checkedList : addInfo.checkedList"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<script setup name="drugSortRelation">
import {useStorage} from "@vueuse/core";
const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  drugCategoryItemRelationadd,
  drugCategoryItemRelationdelete, drugCategoryItemRelationexportExcel,
  drugCategoryItemRelationpage, drugCategoryItemRelationupdate,
} from "@/api/relationship";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'drugSortRelation',
  type: '13009',
  action: '/drugCategoryItemRelation/import/excelRecord',
})
const advancedSearchInfo = ref({
  visible: false,
  data: {},
})


const setting = useStorage('setting', {}, sessionStorage)

const clearType = ref(true)
// 过滤相关配置
const filterInfo = ref({
  query: {},
  searchList: [
    {
      type: 'slot',
      label: '药品分类',
      value: 'drugFinCategoryName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '成本项目',
      value: 'costItemName',
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
      show: proxy.$permission('drugSortRelation:add'),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('drugSortRelation:delete'),
      event: deleteBtn,
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission('drugSortRelation:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('drugSortRelation:export'),
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
    {label: '药品分类编码', value: 'drugFinCategoryCode'},
    {label: '药品分类名称', value: 'drugFinCategoryName'},
    {label: '成本项目编码', value: 'costItemCode'},
    {label: '成本项目名称', value: 'costItemName'},
  ],
  sectionRows: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('drugSortRelation:update'),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission('drugSortRelation:delete'),
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
  checkedList: [],
  labelWidth: "100px",
  fieldList: [
    {
      label: "药品分类",
      value: "drugFinCategoryName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "成本项目",
      value: "costItemName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    drugFinCategoryName: [{ required: true, message: '请选择药品分类', trigger: 'blur' }],
    costItemName: [{ required: true, message: '请选择成本项目', trigger: 'blur' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})


watch(() => tableInfo.value.sectionRows, (rows) => {
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
  addInfo.value.checkedList = [];
  depttreeInfo.value.checkedList = [];
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function search() {
  tableInfo.value.api = drugCategoryItemRelationpage
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

// table选择
function SelectionChange(val,data) {
  if (val === "tableCheck") {
    tableInfo.value.sectionRows = data;
  }
}

// 删除成本项目
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
        drugCategoryItemRelationdelete(ids).then((res) => {
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
  addInfo.value.checkedList = []
  addInfo.value.addOrUpdate = drugCategoryItemRelationadd;
  addInfo.value.title = '新增药品分类关系';
}

async function save() {
  let flag = 0;
  await addInfo.value.ref.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    const fromData = {
      ...addInfo.value.data,
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
  addInfo.value.addOrUpdate = drugCategoryItemRelationupdate;
  addInfo.value.title = '修改药品分类关系';
}

function romove(row) {
  drugCategoryItemRelationdelete([row.id]).then((res) => {
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
  exportTemplateExcel('药品分类关系导入模板', 'drugSortRelation:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '药品分类关系导入模板')
    }
  })
}

const filterNum = ref(false)

// 药品分类
const depttreeInfo = ref({
  title: '药品分类',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  checkedList: [],
  query: {status: '1',last: true}
})
// 成本项目
const costProInfo = ref({
  visible: false,
  type: 'costItem',
  title: '成本项目',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [
    { type: 'input', label: '编码/名称', value: 'name' }
  ],
  fieldList: [],
  query: {status: '1',last: true, costCategoryCode: '03' }
})

const filterRef = ref()

// filter查询
function openSalaryPro() {
  depttreeInfo.value.visible = true;
  depttreeInfo.value.isLeaf = false;
  depttreeInfo.value.checkBox = true;
  filterNum.value = true;
}
// filter  成本项目查询
function openCostPro() {
  costProInfo.value.visible = true;
  costProInfo.value.callBack = accountingPeriodCallback
  filterRef.value.openDialog(costProInfo.value, 'table')
  filterNum.value = true;
}
// 药品分类
function openDialogPro() {
  depttreeInfo.value.visible = true;
  depttreeInfo.value.isLeaf = true;
  depttreeInfo.value.checkBox = addInfo.value.title === "新增药品分类关系";
  filterNum.value = false;
}

// 成本项目查询
function openDialogCostPro() {
  costProInfo.value.visible = true;
  costProInfo.value.callBack = accountingPeriodCallback
  filterRef.value.openDialog(costProInfo.value, 'table')
  filterNum.value = false;
}
function accountingPeriodCallback(data) {
  if(filterNum.value) {
    filterInfo.value.query.costItemName = data.name;
    filterInfo.value.query.costItemId = data.id;
  } else {
    addInfo.value.data.costItemName = data.name;
    addInfo.value.data.costItemId = data.id;
  }
}

function treeCallback(data) {
  depttreeInfo.value.visible = false
  if(filterNum.value) {
    depttreeInfo.value.checkedList = data;
    let datas = data?.filter((it) => !it.childList)
    filterInfo.value.query.drugFinCategoryName = datas?.map((it) => it.name);
    filterInfo.value.query.drugFinCategoryId = datas?.map((it) => it.id);
    filterInfo.value.query.drugFinCategoryIdList = datas?.map((it) => it.id);
  } else {
    if (addInfo.value.title === "新增药品分类关系") {
      addInfo.value.checkedList = data;
      let datas = data?.filter((it) => !it.childList)
      addInfo.value.data.drugFinCategoryName = datas?.map((it) => it.name);
      addInfo.value.data.drugFinCategoryId = datas?.map((it) => it.id);
      addInfo.value.data.drugFinCategoryIdList = datas?.map((it) => it.id);
    } else {
      addInfo.value.data.drugFinCategoryName = data.name;
      addInfo.value.data.drugFinCategoryId = data.id;
    }
  }
}

function pageInfo(obj) {
  page.value = obj
}

function showExportExcel() {
  drugCategoryItemRelationexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

</script>

<style scoped></style>
