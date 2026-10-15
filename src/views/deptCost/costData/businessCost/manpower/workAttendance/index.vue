<!-- 考勤数据 -->
<template>
  <div class="app-container">
    <div v-show="!pullDataLogInfoVisible">
      <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter
          ref="filterRef"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.filterbtn"
      >
        <template #filter-beginPeriodName>
          <el-input
              v-model="filterInfo.query.beginPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择开始期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector('开始')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-endPeriodName>
          <el-input
              v-model="filterInfo.query.endPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择结束期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector('结束')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-deptName>
          <el-input
              v-model="filterInfo.query.deptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择出勤科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector('filter')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-staffName>
          <el-input
              v-model="filterInfo.query.staffName"
              class="not-mongolia"
              type="input"
              placeholder="请选择人员信息"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openStaffSelector('filter')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-technicalTitleName>
          <el-input
              v-model="filterInfo.query.technicalTitleName"
              class="not-mongolia"
              type="input"
              placeholder="请选择技术职称"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="opentechnology('filter')"><Search /></el-icon>
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
          className="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="addInfo.ref"
          :data="addInfo.data"
          :field-list="addInfo.fieldList"
          :rules="addInfo.rules"
          :label-width="addInfo.labelWidth"
          @handleEvent="SelectChange"
      >
        <template v-slot:form-periodName>
          <el-input
              v-model="addInfo.data.periodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择会计期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriodSelector()"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-deptName>
          <el-input
              v-model="addInfo.data.deptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择考勤科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector('')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-staffName>
          <el-input
              v-model="addInfo.data.staffName"
              class="not-mongolia"
              type="input"
              placeholder="请选择人员信息"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openStaffSelector('')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-technicalTitleName>
          <el-input
              v-model="addInfo.data.technicalTitleName"
              class="not-mongolia"
              type="input"
              placeholder="请选择技术职称"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="opentechnology()"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>

    <PullDataLog
        v-if="pullDataLogInfoVisible"
        :businessType="pullDataLogInfoCode"
        @returnBack="pullDataLogInfoVisible = false" />

    <dialog-form :title="collectInfo.title" :btList="collectInfo.btList" v-model:visible="collectInfo.visible">
      <page-form
          ref="collectInfoRef"
          v-model:ref-obj="collectInfo.refObj"
          :label-width="collectInfo.labelWidth"
          :data="collectInfo.data"
          :field-list="collectInfo.fieldList"
          :rules="collectInfo.rules"
      >
        <template #form-periodName>
          <el-input
              v-model="collectInfo.data.periodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openAccountingPeriod('collect')"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </dialog-form>
    <SelectDeptArchivesTree
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
        :checkedList="TechnicalInfo.checkedList"
        :api="TechnicalInfo.api"
        :highlight-current="true"
        @callback="treeTechnicalCallback" />
  </div>
</template>

<script setup name="workAttendance">

import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {useStorage} from "@vueuse/core";
import {useUpload} from "@/hooks/useUpload";
import {
  deptAttendanceRecordadd, deptAttendanceRecordcancel,
  deptAttendanceRecordcollection,
  deptAttendanceRecorddelete,
  deptAttendanceRecordexportExcel,
  deptAttendanceRecordok,
  deptAttendanceRecordpage,
  deptAttendanceRecordupdate
} from "@/api/deptCost/costData/workAttendance";
import {exportTemplateExcel} from "@/api/pub";
import usePullDataLog from "@/components/PullData/pullDataLog/usePullDataLog";
import PullDataLog from "@/components/PullData/pullDataLog/index.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const setting = useStorage('setting', {}, sessionStorage)
const PAGE_NAME = 'workAttendance'
const PAGE_DOWNNAME = '科室考勤数据导入模板'
const PAGE_PATH = '/deptAttendanceRecord/importExcel'
const API = {
  page: deptAttendanceRecordpage,
  add: deptAttendanceRecordadd,
  update: deptAttendanceRecordupdate,
  delete: deptAttendanceRecorddelete,
  collection: deptAttendanceRecordcollection,
  confirm: deptAttendanceRecordok,
  unconfirm: deptAttendanceRecordcancel,
  export: deptAttendanceRecordexportExcel,
  download: exportTemplateExcel,
}


const {
  downloadTemplate,
  exportData,
} = useUpload(API, PAGE_DOWNNAME, PAGE_PATH, () => getList(),'workAttendance:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'workAttendance',
  type: '13026',
  action: '/deptAttendanceRecord/import/excelRecord',
})

// 过滤相关配置
const filterInfo = ref({
  query: {},
  copyQuery: {},
  searchList: [
    { label: '开始期间', value: 'beginPeriodName', showLabel: true, type: 'slot' },
    { label: '结束期间', value: 'endPeriodName', showLabel: true, type: 'slot' },
    { label: '出勤科室', value: 'deptName', type: 'slot', showLabel: true},
    { label: '人员信息', value: 'staffName', showLabel: true, type: 'slot' },
    { label: '技术职称', value: 'technicalTitleName', showLabel: true, type: 'slot' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status', showLabel: true },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      type: 'button',
      label: '新增',
      show: proxy.$permission(`${PAGE_NAME}:add`),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission(`${PAGE_NAME}:delete`),
      event: () => deleteData(),
    },
    {
      type: 'button',
      label: '采集',
      show: proxy.$permission(`${PAGE_NAME}:collect`),
      event: () => openCollectData(),
    },
    {
      type: 'button',
      label: '拉取日志查询',
      show: proxy.$permission(`${PAGE_NAME}:collect`),
      event: () => { pullDataLogInfoVisible.value = true },
    },
    {
      type: 'button',
      label: '确认',
      show: proxy.$permission(`${PAGE_NAME}:confirm`),
      event: () => enableData(1),
    },
    {
      type: 'button',
      label: '取消确认',
      show: proxy.$permission(`${PAGE_NAME}:unconfirm`),
      event: () => enableData(0),
    },
    {
      type: 'button',
      label: '下载模板',
      event: () => downloadTemplate('', 'workAttendance:download'),
      show: proxy.$permission(`${PAGE_NAME}:download`),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: () => exportData(filterInfo.value.query),
      show: proxy.$permission(`${PAGE_NAME}:export`),
    },
  ],
})

// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: null,
  ref: null,
  sectionRows: [],
  data: [],
  fieldList: [
    {label: '会计期间', value: 'periodName'},
    {label: '出勤科室编码', value: 'deptCode'},
    {label: '出勤科室名称', value: 'deptName'},
    {label: '人员编码', value: 'staffCode'},
    {label: '人员名称', value: 'staffName'},
    {label: '人员类别名称', value: 'userTypeName'},
    {label: '技术职称编码', value: 'technicalTitleCode'},
    {label: '技术职称名称', value: 'technicalTitleName'},
    {label: '出勤天数', value: 'day', align: 'center'},
    {label: '确认状态', value: 'statusName'},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PAGE_NAME}:update`),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PAGE_NAME}:delete`),
        event: deleteData,
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
    { label: "会计期间", span: 12, value: "periodName", type: 'slot', required: true, },
    { label: "考勤科室", span: 12, value: "deptName", type: 'slot', required: true, },
    { label: "人员名称", span: 12, value: "staffName", type: 'slot', required: true, },
    { label: "人员类别", span: 12, value: "userTypeName", type: 'input', disabled: true },
    { label: "技术职称", span: 12, value: "technicalTitleName", type: 'slot', required: true, },
    { label: "出勤天数", span: 12, value: "day", type: 'number' },
  ],
  rules: {
    periodName: [{ required: true, message: '请选择会计期间', trigger: 'blur' }],
    deptName: [{ required: true, message: '请选择考勤科室', trigger: 'blur' }],
    staffName: [{ required: true, message: '请选择人员名称', trigger: 'blur' }],
    day: [{ required: true, type: 'number', min: 0, message: '出勤天数不能小于零', trigger: 'blur' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})


const filterRef = ref()

const collectInfoRef = ref()
const collectInfo = reactive({
  refObj: null,
  title: '采集',
  visible: false,
  data: {
    orgId: setting.value.hospitalId,
    hospitalName: setting.value.hospitalName
  },
  fieldList: [
    { label: '会计期间', span: 12, value: 'periodName', type: 'slot' },
  ],
  rules: {
    periodName: [{ required: true, message: '请选择会计期间', trigger: 'change' }],
  },
  btList: [
    { type: 'primary', label: '确认', event: collectData }
  ]
})
const {
  visible: pullDataLogInfoVisible,
  code: pullDataLogInfoCode
} = usePullDataLog('科室考勤数据')

watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '确认')[0]
  const cancelBtn = btns.filter((it) => it.label === '取消确认')[0]
  deleteBtn.disabled = confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })


onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  getList()
})

function clearSearch() {
  filterInfo.value.query = {}
  getList()
}

function getList() {
  tableInfo.value.api = API.page
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

function SelectChange(row, val) {

}

// table选择
function SelectionChange(val,data) {
  if (val === "tableCheck") {
    tableInfo.value.sectionRows = data
  }
}

// 删除
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) return
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        API.delete(ids).then((res) => {
          if (res.success) {
            proxy.$message.success('删除成功')
            getList()
          }
        });
      })
      .catch(() => {});
}
// 添加
function addBtn() {
  addInfo.value.data = {}
  addInfo.value.addOrUpdate = API.add;
  addInfo.value.title = '新增考勤数据';
  addInfo.value.visible = true;
}

async function save() {
  let flag = 0;
  await addInfo.value.ref.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    addInfo.value.addOrUpdate(addInfo.value.data).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        getList();
        addInfo.value.visible = false;
      }
    });
  }
}

function goback() {
  addInfo.value.visible = false;
}

function update(row) {
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = API.update;
  addInfo.value.title = '修改考勤数据';
  addInfo.value.visible = true;
}


// function downloadTemplate() {
//   exportTemplateExcel(PAGE_DOWNURL).then((res) => {
//     if (res) {
//       proxy.$fn.parseExcel(res, PAGE_DOWNNAME)
//     }
//   })
// }

const { tableParameter: useTableParameter, openDialog } = useSelectTableData()
function openCollectData() {
  collectInfo.visible = true
}

function collectData() {
  collectInfo.refObj.validate(flag => {
    if (flag) {
      API.collection(collectInfo.data).then(res => {
        if (res.success) {
          proxy.$message.success('采集成功')
          collectInfo.data = {}
          collectInfo.visible = false
          getList()
        }
      })
    }
  })
}
const tableParameter = ref({
  visible: false,
  type: '',
  title: '会计期间',
  checkBox: false,
  pager: false,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})
function openAccountingPeriodSelector(name) {
  tableParameter.value.title = name ? `${name}期间` : '会计期间'
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterNum.value = !!name;
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  if(filterNum.value) {
    if(tableParameter.value.title === '开始期间') {
      filterInfo.value.query.beginPeriodId = raw.id
      filterInfo.value.query.beginPeriodName = raw.periodYearAndMonth
    } else {
      filterInfo.value.query.endPeriodId = raw.id
      filterInfo.value.query.endPeriodName = raw.periodYearAndMonth
    }
  } else {
    addInfo.value.data.periodName = raw.periodYearAndMonth;
    addInfo.value.data.periodId = raw.id;
  }
}


const filterNum = ref(false)

// 出勤科室
const treeInfo = ref({
  title: '出勤科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  query: {}
})

// filter查询
function openDeptSelector(flag) {
  treeInfo.value.title = flag ? "出勤科室" : "考勤科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = !flag;
  treeInfo.value.checkBox = !!flag;
  filterNum.value = !!flag;
}

function treeCallback(data) {
  treeInfo.value.visible = false
  if(filterNum.value) {
    const datas = data.filter((it) => !it.childList)
    filterInfo.value.query.deptName = datas.map(it => it.name);
    filterInfo.value.query.deptId = datas.map(it => it.id);
    filterInfo.value.query.deptIdList = datas.map(it => it.id);
  } else {
    addInfo.value.data.deptName = data.name;
    addInfo.value.data.deptCode = data.code;
    addInfo.value.data.deptId = data.id;
  }
}

const staffInfo = ref({
  visible: false,
  type: 'staff',
  title: '人员信息',
  checkBox: false,
  pager: true,
  callback: null,
  fieldList: [],
  query: {}
})
function openStaffSelector(flag) {
  staffInfo.value.visible = true
  filterNum.value = !!flag;
  staffInfo.value.callBack = staffCallback
  filterRef.value.openDialog(staffInfo.value, 'table')
}
function staffCallback(raw) {
  if(filterNum.value) {
    filterInfo.value.query.staffId = raw.id
    filterInfo.value.query.staffName = raw.name
  } else {
    addInfo.value.data.staffName = raw.name;
    addInfo.value.data.staffId = raw.id;
    addInfo.value.data.userTypeName = raw.userTypeName;
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

function opentechnology(flag) {
  TechnicalInfo.value.title = "技术职称";
  TechnicalInfo.value.visible = true;
  TechnicalInfo.value.checkBox = !!flag;
  filterNum.value = !!flag;
}
function treeTechnicalCallback(raw) {
  TechnicalInfo.value.visible = false
  if(filterNum.value) {
    const datas = raw.filter((it) => !it.childList)
    filterInfo.value.query.technicalTitleName = datas.map(it => it.name);
    filterInfo.value.query.technicalTitleId = datas.map(it => it.id);
    filterInfo.value.query.technicalTitleIdList = datas.map(it => it.id);
  } else {
    addInfo.value.data.technicalTitleName = raw.name;
    addInfo.value.data.technicalTitleId = raw.id;
  }
}

function enableData(status) {
  const ids = tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  const api = status === 1 ? API.confirm : API.unconfirm
  api(ids).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      getList()
    }
  })
}

function openAccountingPeriod(mark) {
  useTableParameter.type = 'accountingPeriod'
  useTableParameter.query = {}
  useTableParameter.mark = mark
  useTableParameter.callBack = (raw) => {
    collectInfo.data.periodId = raw.id
    collectInfo.data.periodName = raw.periodYearAndMonth
    collectInfo.data.periodMonth = raw.periodYearAndMonth
  }
  openDialog(collectInfoRef.value)
}
</script>

<style scoped></style>
