<template>
  <!--  技术职称薪资-->
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
        <template #filter-checkPeriodName>
          <el-input
              v-model="filterInfo.query.checkPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-deptName>
          <el-input
              v-model="filterInfo.query.deptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openCostDept"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-techTitlesSalaryName>
          <el-input
              v-model="filterInfo.query.techTitlesSalaryName"
              class="not-mongolia"
              type="input"
              placeholder="请选择技术职称"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="opentechnology"><Search /></el-icon>
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
          :summary="true"
          :summaryFieldList="tableInfo.summaryFieldList"
          :query="filterInfo.query"
          :field-list="tableInfo.fieldList"
          :checkBox="false"
          @handleEvent="SelectionChange"
          :row-class-name="tableRowClassName"
      >
        <template #col-technicalTitleCode="{ row }">
          <span class="slip-edit" @click="detail(row)">{{ row.technicalTitleCode }}</span>
        </template>
      </table-container>
    </div>
    <!--    计算-->
    <PageDialog
        :title="addInfo.title"
        :visible="addInfo.visible"
        :btList="addInfo.btList"
        @reset="goback"
    >
      <!-- 条件栏 -->
      <page-form
          className="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="addInfo.ref"
          :data="addInfo.data"
          :field-list="addInfo.fieldList"
          :rules="addInfo.rules"
          :label-width="addInfo.labelWidth"
      >
        <template v-slot:form-checkPeriodName>
          <el-input
              v-model="addInfo.data.checkPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openPeriodSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
    <!--    技术职称-->
    <PageDialog
        :title="projectInfo.title"
        :visible="projectInfo.visible"
        :btList="projectInfo.btList"
        @reset="goproback"
    >
      <DialogTable
          :refresh="projectInfo.refresh"
          :init-curpage="projectInfo.initCurpage"
          v-model:data="projectInfo.data"
          :api="projectInfo.api"
          row-key="id"
          :tab-index="true"
          :summary="true"
          :pager="false"
          :summaryFieldList="projectInfo.summaryFieldList"
          :query="projectInfo.query"
          :field-list="projectInfo.fieldList"
          :checkBox="false"
      />
    </PageDialog>
    <SelectProDeptTree
        v-if="treeInfo.visible"
        v-model:showDialog="treeInfo.visible"
        :title="treeInfo.title"
        :checkStrictly="treeInfo.checkStrictly"
        :isLeaf="treeInfo.isLeaf"
        :query="treeInfo.query"
        :checkBox="treeInfo.checkBox"
        :api="treeInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
    <SelectTechnicalTitleTree
        v-if="TechnicalInfo.visible"
        v-model:showDialog="TechnicalInfo.visible"
        :title="TechnicalInfo.title"
        :checkStrictly="TechnicalInfo.checkStrictly"
        :isLeaf="TechnicalInfo.isLeaf"
        :query="TechnicalInfo.query"
        :checkBox="TechnicalInfo.checkBox"
        :api="TechnicalInfo.api"
        :highlight-current="true"
        @callback="treeCallback" />
  </div>
</template>

<script setup name="technicalSalary">
import {useStorage} from "@vueuse/core";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {
  itemTechTitlesSalarycompute, itemTechTitlesSalaryDetailqueryDetailListByMainId, itemTechTitlesSalaryexportExcel,
  itemTechTitlesSalarygetListByPage
} from "@/api/technicalSalary";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
import DialogTable from "@/components/DialogTable/index.vue";

const advancedSearchInfo = ref({
  visible: false,
  data: {},
})

const multipleSelection = ref([]);
const currentRow = ref({});

const setting = useStorage('setting', {}, sessionStorage)

const { tableParameter, openDialog } = useSelectTableData()
const clearType = ref(true)
// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc,id asc',
  },
  searchList: [
    {
      type: 'slot',
      label: '核算期间',
      value: 'checkPeriodName',
      showLabel: true,
      required: true,
      event: search,
    },
    {
      type: 'slot',
      label: '核算科室',
      value: 'deptName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '技术职称',
      value: 'techTitlesSalaryName',
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
      label: '计算',
      btType: 'primary',
      show: proxy.$permission('technicalSalary:count'),
      event: count,
    },
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('technicalSalary:export'),
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
    {label: '核算期间编码', value: 'checkPeriodCode'},
    {label: '开始核算期间', value: 'beginPeriodName'},
    {label: '结束核算期间', value: 'endPeriodName'},
    {label: '科室编码', value: 'deptCode'},
    {label: '科室名称', value: 'deptName'},
    {label: '技术职称编码', value: 'technicalTitleCode', type: 'slot' },
    {label: '技术职称名称', value: 'technicalTitleName'},
    {label: '人数', value: 'num', align: 'center'},
    {label: '总薪资', value: 'totalMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.totalMoney)},
    {label: '平均薪资', value: 'avgMoney', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.avgMoney)},
  ],
  summaryFieldList: [
    { value: 'num', formatter: proxy.$fn.TripartiteMethod },
    { value: 'totalMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'avgMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
})


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
  if(!filterInfo.value.query.checkPeriodName) {
      return proxy.$message.warning('请选择核算期间')
  }
  tableInfo.value.api = itemTechTitlesSalarygetListByPage
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

// 新增参数
const addInfo = ref({
  visible: false,
  ref: null,
  title: '计算',
  addOrUpdate: null,
  data: {
    orgName: setting.value.hospitalName,
    orgId: setting.value.hospitalId,
  },
  fieldList: [
    {
      label: "业务单元",
      value: "orgName",
      type: 'input',
      span: 12,
      disabled: true,
    },
    {
      label: "核算期间",
      value: "checkPeriodName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    checkPeriodName: [{ required: true, message: '请选择核算期间', trigger: 'blur' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],
})

// 查询薪资项目
const projectInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  query: {},
  title: '明细',
  data: [],
  fieldList: [
    {label: '薪资项目编码', value: 'salaryItemCode'},
    {label: '薪资项目期间', value: 'salaryItemName'},
    {label: '资金来源', value: 'fundSourceName'},
    {label: '金额', value: 'money'},
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  btList: [
    {type: 'button', show: true, label: '返回', event: goproback},
    {type: 'button', show: false, label: '取消'},
  ],
})

const isFilters = ref(false)
// 计算
function count() {
  addInfo.value.data = {
    orgName: setting.value.hospitalName,
    orgId: setting.value.hospitalId,
  }
  addInfo.value.visible = true;
}

function goback() {
  addInfo.value.visible = false;
}
// 查询技术职称
function detail(row) {
  projectInfo.value.query.id = row.id;
  projectInfo.value.visible = true;
  projectInfo.value.data = []
  itemTechTitlesSalaryDetailqueryDetailListByMainId({mainId: row.id}).then(({code, data}) => {
    if (code === 200) {
      projectInfo.value.data = data;
    }
  });
}

function goproback() {
  projectInfo.value.visible = false;
}

function openPeriodSelector() {
  isFilters.value = false;
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value, 'table')
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
    }
    itemTechTitlesSalarycompute(fromData).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        search();
        addInfo.value.visible = false;
      }
    });
  }
}

function tableRowClassName({row}) {
  let rowId = sessionStorage.getItem('storeRowId')
  if (rowId && row.id === Number(rowId)) {
    return 'check-row'
  }
  return ''
}

// 系统科室
const treeInfo = ref({
  title: '系统科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  query: {},
  checkedList: []
})
const filterRef = ref()
// filter查询
function openDeptSelector() {
  isFilters.value = true;
  tableParameter.title = '核算期间'
  tableParameter.type = 'itemaccountingPeriod'
  tableParameter.query = {}
  tableParameter.callBack = accountingPeriodCallback
  openDialog(filterRef.value, 'table')
}
function accountingPeriodCallback(raw) {
  if(isFilters.value) {
    filterInfo.value.query.checkPeriodId = raw.id
    filterInfo.value.query.checkPeriodName = raw.name
  } else {
    addInfo.value.data.checkPeriodId = raw.id
    addInfo.value.data.checkPeriodName = raw.name
  }

}
const TechnicalInfo = ref({
  title: '技术职称',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  query: {},
  checkedList: []
})
// filter查询
function openCostDept() {
  treeInfo.value.title = "核算科室";
  treeInfo.value.visible = true;
}

function opentechnology() {
  TechnicalInfo.value.title = "技术职称";
  treeInfo.value.title = "技术职称";
  TechnicalInfo.value.visible = true;
}

function treeCallback(raw) {
  treeInfo.value.visible = false
    // 外面筛选条件
    if(treeInfo.value.title === '核算科室') {
      treeInfo.value.checkedList = raw;
      let datas = raw?.filter((it) => !it.childList)
      filterInfo.value.query.deptName = datas?.map((it) => it.name);
      filterInfo.value.query.deptId = datas?.map((it) => it.id);
      filterInfo.value.query.deptIdList = datas?.map((it) => it.id);
    } else {
      let datas = raw?.filter((it) => !it.children)
      TechnicalInfo.value.checkedList = raw;
      filterInfo.value.query.techTitlesSalaryName = datas?.map((it) => it.name);
      filterInfo.value.query.techTitlesSalaryId = datas?.map((it) => it.id);
      filterInfo.value.query.techTitlesSalaryIdList = datas?.map((it) => it.id);
    }
}

function showExportExcel() {
  itemTechTitlesSalaryexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}
</script>

<style scoped></style>
