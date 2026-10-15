<template>
<!--  收费项目关系 项目-->
  <div class="app-container">
    <div>
      <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter
          ref="pageFormRef"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.filterbtn"
      >
        <template #filter-orderDeptName>
          <el-input
              v-model="filterInfo.query.orderDeptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择开单科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-executeDeptName>
          <el-input
              v-model="filterInfo.query.executeDeptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择执行科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openCostDept"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-feeItemName>
          <el-input
              v-model="filterInfo.query.feeItemName"
              class="not-mongolia"
              type="input"
              placeholder="请选择收费项目"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openFeeItemSelector(true)"><Search /></el-icon>
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
            className="paddingBox order-model-formBox flex_wrap_start_start"
            v-model:ref-obj="addInfo.ref"
            :data="addInfo.data"
            :field-list="addInfo.fieldList"
            :rules="addInfo.rules"
            :label-width="addInfo.labelWidth"
        >
          <template v-slot:form-orderDeptName>
            <el-input
                v-model="addInfo.data.orderDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择开单科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptCost"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template v-slot:form-executeDeptName>
            <el-input
                v-model="addInfo.data.executeDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择执行科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSystem"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template v-slot:form-feeItemName>
            <el-input
                v-model="addInfo.data.feeItemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择收费项目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openFeeItemSelector(false)"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </PageDialog>
    <!--计算-->
    <PageDialog
        :title="addcountInfo.title"
        :visible="addcountInfo.visible"
        :btList="addcountInfo.btList"
        @reset="goback"
    >
      <!-- 条件栏 -->
      <page-form
          ref="filterRef"
          className="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="addcountInfo.ref"
          :data="addcountInfo.data"
          :field-list="addcountInfo.fieldList"
          :rules="addcountInfo.rules"
          :label-width="addcountInfo.labelWidth"
      >
        <template v-slot:form-itemAccountingPeriodName>
          <el-input
              v-model="addcountInfo.data.itemAccountingPeriodName"
              class="not-mongolia"
              type="input"
              placeholder="请选择核算期间"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openPeriodSelector(false)"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </page-form>
    </PageDialog>
    <!--    查询开单科室-->
    <SelectProDeptTree
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
  </div>
</template>

<script setup name="feeItemRelation">
import {useStorage} from "@vueuse/core";
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  sectiontree,
} from "@/api/accountingDepartment";
import {
  itemfeeRelation,
  itemfeeRelationadd, itemfeeRelationcollection,
  itemfeeRelationdel,
  itemfeeRelationexportExcel,
  itemfeeRelationupdate
} from "@/api/relation";
import {getCurrentInstance} from "vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const {proxy} = getCurrentInstance()

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'feeItemRelation',
  type: '13043',
  action: '/item/feeRelation/import/excelRecord',
})
const advancedSearchInfo = ref({
  visible: false,
  data: {},
})


const setting = useStorage('setting', {}, sessionStorage)

const clearType = ref(true)
// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc,id asc',
  },
  searchList: [
    {
      type: 'slot',
      label: '开单科室',
      value: 'orderDeptName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '执行科室',
      value: 'executeDeptName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '收费项目',
      value: 'feeItemName',
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
      show: proxy.$permission('feeItemRelation:add'),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('feeItemRelation:delete'),
      event: deleteBtn,
    },{
      type: 'button',
      label: '计算',
      btType: 'primary',
      show: proxy.$permission('feeItemRelation:count'),
      event: countBtn,
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission('feeItemRelation:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('feeItemRelation:export'),
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
    {label: '收费项目编码', value: 'feeItemCode'},
    {label: '收费项目名称', value: 'feeItemName'},
    {label: '开单科室编码', value: 'orderDeptCode'},
    {label: '开单科室名称', value: 'orderDeptName'},
    {label: '执行科室编码', value: 'executeDeptCode'},
    {label: '执行科室名称', value: 'executeDeptName'},
  ],
  sectionRows: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('feeItemRelation:update'),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission('feeItemRelation:delete'),
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
      label: "收费项目",
      value: "feeItemName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "开单科室",
      value: "orderDeptName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "执行科室",
      value: "executeDeptName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    feeItemName: [{ required: true, message: '请选择收费项目', trigger: 'blur' }],
    orderDeptName: [{ required: true, message: '请选择开单科室', trigger: 'blur' }],
    executeDeptName: [{ required: true, message: '请选择执行科室', trigger: 'blur' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})

// 新增参数
const addcountInfo = ref({
  visible: false,
  ref: null,
  title: '计算',
  addOrUpdate: null,
  data: {},
  labelWidth: "100px",
  fieldList: [
    {
      label: "核算期间",
      value: "itemAccountingPeriodName",
      type: 'slot',
      required: true,
    },
  ],
  rules: {
    itemAccountingPeriodName: [{ required: true, message: '请选择核算期间' }],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'button', show: true, label: '保存', event: saveAccountingPeriod},
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
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function search() {
  tableInfo.value.api = itemfeeRelation
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

// table选择
function SelectionChange(val,data) {
  if (val === 'tableCheck') {
    tableInfo.value.sectionRows = data
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
        itemfeeRelationdel(ids).then((res) => {
          if (res.success) {
            proxy.$message.success('删除成功')
            search()
          }
        });
      })
      .catch(() => {});
}

// 计算
function countBtn() {
  addcountInfo.value.visible = true;
}
// 添加
function addBtn() {
  addInfo.value.visible = true;
  addInfo.value.data = {}
  addInfo.value.addOrUpdate = itemfeeRelationadd;
  addInfo.value.title = '新增收费项目关系';
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
  addcountInfo.value.visible = false;
}


async function saveAccountingPeriod() {
  let flag = 0;
  await addcountInfo.value.ref.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    itemfeeRelationcollection(addcountInfo.value.data.itemAccountingPeriodId).then((res) => {
      if (res.success) {
        proxy.$message.success('计算成功')
        search();
        addcountInfo.value.visible = false;
      }
    });
  }
}

function update(row) {
  addInfo.value.visible = true;
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = itemfeeRelationupdate;
  addInfo.value.title = '修改收费项目关系';
}

function romove(row) {
  itemfeeRelationdel([row.id]).then((res) => {
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
  exportTemplateExcel('itemFeeRelationTemplate', 'feeItemRelation:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '收费项目关系导入模板')
    }
  })
}

const filterNum = ref(false)

const spurceDept = ref([])
const bearDept = ref([])
// 开单科室
const depttreeInfo = ref({
  title: '开单科室',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  api: sectiontree,
  query: {}
})

const tableParameter = ref({
  visible: false,
  type: 'feeItem',
  title: '收费项目',
  callback: null,
  checkBox: true,
  pager: true,
  filters: [
    {
      type: 'input',
      label: '编码/名称',
      value: 'keyword',
    }
  ],
  fieldList: [],
  query: {status: 1, feeAttribute: '0', accountingStatus: '1'},
  checkedList: []
})

const pageFormRef=ref()

// filter查询
function openDeptSelector() {
  depttreeInfo.value.title = "开单科室";
  depttreeInfo.value.visible = true;
  depttreeInfo.value.checkBox = true;
  depttreeInfo.value.checkedList = spurceDept.value;
  depttreeInfo.value.isLeaf = false;
  filterNum.value = true;
}
// filter查询
function openCostDept() {
  depttreeInfo.value.title = "执行科室";
  depttreeInfo.value.visible = true;
  depttreeInfo.value.checkBox = true;
  depttreeInfo.value.checkedList = bearDept.value;
  depttreeInfo.value.isLeaf = false;
  filterNum.value = true;
}
// 开单科室
function openDeptCost() {
  depttreeInfo.value.title = "开单科室";
  depttreeInfo.value.visible = true;
  depttreeInfo.value.checkBox = false;
  depttreeInfo.value.isLeaf = true;
  filterNum.value = false;
}

// 执行科室
function openDeptSystem() {
  depttreeInfo.value.title = "执行科室";
  depttreeInfo.value.visible = true;
  depttreeInfo.value.checkBox = false;
  depttreeInfo.value.isLeaf = true;
  filterNum.value = false;
}

function treeCallback(data) {
  depttreeInfo.value.visible = false
  if(filterNum.value) {
    let datas = data?.filter((it) => !it.childList)
    // 外面筛选条件
    if(depttreeInfo.value.title === '开单科室') {
      spurceDept.value = data
      filterInfo.value.query.orderDeptName = datas?.map((it) => it.name);
      filterInfo.value.query.orderDeptIdList = datas?.map((it) => it.id);
    } else {
      bearDept.value = data
      filterInfo.value.query.executeDeptName = datas?.map((it) => it.name);
      filterInfo.value.query.executeDeptIdList = datas?.map((it) => it.id);
    }
    return
  }
  // 里面新增表单
  if(depttreeInfo.value.title === '开单科室') {
    addInfo.value.data.orderDeptName = data.name;
    addInfo.value.data.orderDeptCode = data.code;
    addInfo.value.data.orderDeptId = data.id;
  } else {
    addInfo.value.data.executeDeptName = data.name;
    addInfo.value.data.executeDeptCode = data.code;
    addInfo.value.data.executeDeptId = data.id;
  }
}

function openFeeItemSelector(filter) {
  filterNum.value = filter;
  tableParameter.value.visible = true
  tableParameter.value.checkBox = filter
  tableParameter.value.callBack = feeItemCallback
  pageFormRef.value.openDialog(tableParameter.value, 'table')
}
function feeItemCallback(raw) {
  if(filterNum.value) {
    tableParameter.value.checkedList = raw
    filterInfo.value.query.feeItemIdList = raw.map((it) => it.id)
    filterInfo.value.query.feeItemName = raw.map((it) => it.name).join(',')
  } else {
    addInfo.value.data.feeItemId = raw.id
    addInfo.value.data.feeItemCode = raw.code
    addInfo.value.data.feeItemName = raw.name
  }
}
const filterRef = ref()

const PeriodParameter = ref({
  visible: false,
  type: 'itemaccountingPeriod',
  title: '会计期间',
  checkBox: false,
  pager: true,
  callback: null,
  filters: [],
  fieldList: [],
  query: {
    sort: 'begin_date desc'
  }
})
function openPeriodSelector() {
  PeriodParameter.value.visible = true
  PeriodParameter.value.callBack = accountingPeriodCallback
  filterRef.value.openDialog(PeriodParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  addcountInfo.value.data.itemAccountingPeriodId = raw.id
  addcountInfo.value.data.itemAccountingPeriodName = raw.name
}

function pageInfo(obj) {
  page.value = obj
}

function showExportExcel() {
  itemfeeRelationexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

</script>

<style scoped></style>
