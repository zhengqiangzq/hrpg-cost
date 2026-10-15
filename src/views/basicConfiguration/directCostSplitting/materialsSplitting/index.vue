<!--  物资数据拆分设置-->
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
        <template #filter-sourceSectionName>
          <el-input
              v-model="filterInfo.query.sourceSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择源科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-targetSectionName>
          <el-input
              v-model="filterInfo.query.targetSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择承担科室"
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
        <template v-slot:form-sourceSectionName>
          <el-input
              v-model="addInfo.data.sourceSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择源科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptCost"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-targetSectionName>
          <el-input
              v-model="addInfo.data.targetSectionName"
              class="not-mongolia"
              type="input"
              placeholder="请选择承担科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSystem"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
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
  </div>
</template>

<script setup name="paySplitting">

import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  directCostSplitRulesuppliesadd,
  directCostSplitRulesuppliesdel,
  directCostSplitRulesuppliesexportExcel,
  directCostSplitRulesuppliespage,
  directCostSplitRulesuppliesupdate
} from "@/api/directCostSplitting";
import {useUpload} from "@/hooks/useUpload";

const PAGE_NAME = 'paySplitting'
const PAGE_DOWNURL = 'directCostSplitRuleTemplate'
const PAGE_DOWNNAME = '物资数据拆分设置'
const PAGE_PATH = '/directCostSplitRule/supplies/importExcel'
const API = {
  page: directCostSplitRulesuppliespage,
  add: directCostSplitRulesuppliesadd,
  update: directCostSplitRulesuppliesupdate,
  delete: directCostSplitRulesuppliesdel,
  export: directCostSplitRulesuppliesexportExcel,
}


const {
  exportData,
} = useUpload(API, PAGE_DOWNNAME, PAGE_PATH, () => getList(), 'materialsSplitting:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'materialsSplitting',
  type: '13015',
  action: '/directCostSplitRule/import/excelRecord',
})




// 过滤相关配置
const filterInfo = ref({
  query: {},
  searchList: [
    { label: '源科室', value: 'sourceSectionName', type: 'slot', showLabel: true, event: search,},
    { type: 'slot', label: '承担科室', value: 'targetSectionName', showLabel: true, event: search, },
    { type: 'select-model', label: '拆分参数', value: 'typeValue', clearable: true, code: 'direct_cost_split_rule_split_type',  checkDefault: false, showLabel: true },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
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
      label: '下载模板',
      event: downloadTemplate,
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
  api: '',
  sectionRows: [],
  data: [],
  fieldList: [
    {label: '源科室编码', value: 'sourceSectionCode'},
    {label: '源科室名称', value: 'sourceSectionName'},
    {label: '承担科室编码', value: 'targetSectionCode'},
    {label: '承担科室名称', value: 'targetSectionName'},
    {label: '拆分参数', value: 'typeValueName'},
    {label: '参数值', value: 'paramValue', align: 'center'},
    {label: '计入方式', value: 'calculateTypeName'},
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
    { label: "源科室", value: "sourceSectionName", span: 12, type: 'slot', required: true, },
    { label: "承担科室", value: "targetSectionName", span: 12, type: 'slot', required: true, },
    { label: '计入方式', value: 'calculateType', span: 12, type: 'select-model', code: 'direct_cost_split_rule_calculate_type', required: true },
    { label: '拆分参数', value: 'typeValue', span: 12, type: 'select-model', disabled: true, checkDefault: false, clearable: true, code: 'direct_cost_split_rule_split_type' },
    { label: "参数值", value: "paramValue", span: 12, type: 'input', disabled: true },
  ],
  rules: {
    sourceSectionName: [{ required: true, message: '请选择源科室', trigger: 'blur' }],
    targetSectionName: [{ required: true, message: '请选择承担科室', trigger: 'blur' }],
    calculateType: [{ required: true, message: '请选择计入方式', trigger: 'blur' }],
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
  filterInfo.value.query = {}
  search()
}

function search() {
  tableInfo.value.api = API.page
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

function SelectChange(row, val) {
  if(row.value === 'calculateType') {
    addInfo.value.fieldList[3].disabled = val === '1';
    addInfo.value.fieldList[4].disabled = val === '0';
    addInfo.value.data.typeValue = ''
    addInfo.value.data.paramValue = ''
  }
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
            search()
          }
        });
      })
      .catch(() => {});
}
// 添加
function addBtn() {
  addInfo.value.data = {}
  addInfo.value.addOrUpdate = API.add;
  addInfo.value.title = '新增物资数据拆分设置';
  addInfo.value.fieldList[3].disabled = false;
  addInfo.value.fieldList[4].disabled = true;
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
    if(addInfo.value.data.calculateType === '0' && !addInfo.value.data.typeValue) return proxy.$message.warning('计算计入时，拆分参数必填')
    if(addInfo.value.data.calculateType === '1' && !addInfo.value.data.paramValue) return proxy.$message.warning('手工录入时，参数值必填')
    addInfo.value.addOrUpdate(addInfo.value.data).then((res) => {
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
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = API.update;
  addInfo.value.title = '修改物资数据拆分设置';
  addInfo.value.fieldList[3].disabled = row.calculateType === '1';
  addInfo.value.fieldList[4].disabled = row.calculateType === '0';
  addInfo.value.visible = true;
}


function downloadTemplate() {
  exportTemplateExcel(PAGE_DOWNURL, 'materialsSplitting:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, PAGE_DOWNNAME)
    }
  })
}

const filterNum = ref(false)

// 承担科室
const treeInfo = ref({
  title: '承担科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  query: {}
})

// filter查询
function openDeptSelector() {
  treeInfo.value.title = "源科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = false;
  treeInfo.value.checkBox = true;
  filterNum.value = true;
}
// filter查询
function openCostDept() {
  treeInfo.value.title = "承担科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = false;
  treeInfo.value.checkBox = true;
  filterNum.value = true;
}
// 源科室
function openDeptCost() {
  treeInfo.value.title = "源科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = true;
  treeInfo.value.checkBox = false;
  filterNum.value = false;
}

// 承担科室
function openDeptSystem() {
  treeInfo.value.title = "承担科室";
  treeInfo.value.visible = true;
  treeInfo.value.isLeaf = true;
  treeInfo.value.checkBox = false;
  filterNum.value = false;
}

function treeCallback(data) {
  treeInfo.value.visible = false
  if(filterNum.value) {
    const datas = data.filter((it) => !it.childList)
    // 外面筛选条件
    if(treeInfo.value.title === '源科室') {
      filterInfo.value.query.sourceSectionName = datas.map(it => it.name);
      filterInfo.value.query.sourceSectionId = datas.map(it => it.id);
      filterInfo.value.query.sourceSectionIdList = datas.map(it => it.id);
    } else {
      filterInfo.value.query.targetSectionName = datas.map(it => it.name);
      filterInfo.value.query.targetSectionId = datas.map(it => it.id);
      filterInfo.value.query.targetSectionIdList = datas.map(it => it.id);
    }
    return
  }
  // 里面新增表单
  if(treeInfo.value.title === '源科室') {
    addInfo.value.data.sourceSectionName = data.name;
    addInfo.value.data.sourceSectionCode = data.code;
    addInfo.value.data.sourceSectionId = data.id;
  } else {
    addInfo.value.data.targetSectionName = data.name;
    addInfo.value.data.targetSectionCode = data.code;
    addInfo.value.data.targetSectionId = data.id;
  }
}


</script>

<style scoped></style>
