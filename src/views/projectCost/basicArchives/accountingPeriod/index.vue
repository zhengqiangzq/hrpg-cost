<template>
<!--  核算期间-->
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          ></NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
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
            ref="filterRef"
            :data="addInfo.data"
            :field-list="addInfo.fieldList"
            :rules="addInfo.rules"
            :label-width="addInfo.labelWidth"
        >
          <template v-slot:form-beginPeriod>
            <el-input
                v-model="addInfo.data.beginPeriod"
                class="not-mongolia"
                type="input"
                placeholder="请选择开始期间"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountingPeriodSelector('开始期间')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template v-slot:form-endPeriod>
            <el-input
                v-model="addInfo.data.endPeriod"
                class="not-mongolia"
                type="input"
                placeholder="请选择结束期间"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openAccountingPeriodSelector('结束期间')"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </PageDialog>
  </div>
</template>

<script setup name="accountingPeriod">
import {useStorage} from "@vueuse/core";
import {getCurrentInstance, onMounted, ref, watch} from "vue";
const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {
  itemaccountingPeriodadd, itemaccountingPerioddel,
  itemaccountingPeriodpage,
  itemaccountingPeriodupdate
} from "@/api/projectBase";

const PERMISSION_CODE = 'accountingPeriod'
const setting = useStorage('setting', {}, sessionStorage)

// 过滤相关配置
const filterInfo = ref({
  query: {

  },
  list: [
    { label: '核算期间', value: 'keyword', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
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
      event: () => deleteData()
    },
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  data: [],
  sectionRows: [],
  fieldList: [
    {label: '核算期间编码', value: 'code'},
    {label: '核算期间名称', value: 'name'},
    {label: '开始会计期间', value: 'beginPeriod' },
    {label: '结束会计期间', value: 'endPeriod' },
    {label: '备注', value: 'remark'},
    {label: '创建人', value: 'createDate'},
    {label: '创建日期', value: 'createUserName'},
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
  fieldList: [
    { label: "核算期间编码", value: "code", span: 12, type: 'input', required: true },
    { label: "核算期间名称", value: "name", span: 12, type: 'input', required: true },
    { label: "开始期间", value: "beginPeriod", span: 12, type: 'slot', required: true },
    { label: "结束期间", value: "endPeriod", span: 12, type: 'slot', required: true },
    { label: "备注", value: "remark", span: 12, type: 'input' },
  ],
  rules: {
    code: [{ required: true, message: '请输入核算期间编码', trigger: 'blur'}],
    name: [{ required: true, message: '请输入核算期间名称', trigger: 'blur'}],
    beginPeriod: [{ required: true, message: '请输入开始期间', trigger: 'blur'}],
    endPeriod: [{ required: true, message: '请输入结束期间', trigger: 'blur'}],
  },
  btList: [
    {type: 'button', show: true, label: '取消', event: goback},
    {type: 'primary', show: true, label: '保存', event: save},
  ],

})
watch(() => tableInfo.value.sectionRows, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  // deleteBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  deleteBtn.disabled = !rows.length
}, {immediate: true})

onMounted(() => {
  tableInfo.value.api = itemaccountingPeriodpage
  getList()
})

function getList() {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}
// 重置查询
function reset() {
  filterInfo.value.query = {}
  getList()
}

// table选择
function SelectionChange(eventName, raw) {
  if (eventName === "tableCheck") {
    tableInfo.value.sectionRows = raw
  }
}

// 添加
function addBtn() {
  addInfo.value.visible = true;
  addInfo.value.data = {}
  addInfo.value.addOrUpdate = itemaccountingPeriodadd;
  addInfo.value.title = '新增核算期间';
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
    type: 0,
    orgId: setting.value.hospitalId,
  }
  addInfo.value.addOrUpdate(fromData).then((res) => {
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
  addInfo.value.visible = true;
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = itemaccountingPeriodupdate;
  addInfo.value.title = '修改核算期间';
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
    itemaccountingPerioddel(ids).then(({code}) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

const filterRef = ref()
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
  tableParameter.value.title = name
  tableParameter.value.checkBox = false
  tableParameter.value.pager = true
  tableParameter.value.type = 'accountingPeriod'
  tableParameter.value.callBack = accountingPeriodCallback
  tableParameter.value.visible = true
  filterRef.value.openDialog(tableParameter.value, 'table')
}

function accountingPeriodCallback(raw) {
  if(tableParameter.value.title === '开始期间') {
    addInfo.value.data.beginPeriodId = raw.id
    addInfo.value.data.beginPeriod = raw.periodYearAndMonth
  } else {
    addInfo.value.data.endPeriodId = raw.id
    addInfo.value.data.endPeriod = raw.periodYearAndMonth
  }
}

</script>

<style scoped></style>
