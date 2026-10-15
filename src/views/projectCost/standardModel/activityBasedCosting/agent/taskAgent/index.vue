<template>
  <!--  作业动因-->
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.searchList"
              :filter-btn="filterInfo.filterbtn"
          >
          </NewPageFilter>
        </div>
        <!-- 条件栏 -->
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
          :pager="false"
          :query="filterInfo.query"
          :field-list="tableInfo.fieldList"
          :handle="tableInfo.handle"
          :checkBox="true"
          @handleEvent="SelectionChange"
          :row-class-name="tableRowClassName"
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
      </page-form>
    </PageDialog>
  </div>
</template>

<script setup name="taskAgent">
import {useStorage} from "@vueuse/core";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  itemdriveractivity,
  itemdriveractivityadd, itemdriveractivitydel,
  itemdriveractivityexportExcel, itemdriveractivityupdate,
} from "@/api/agent";
import {ref} from "vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'taskAgent',
  type: '13042',
  action: '/item/driver/import/excelRecord',
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
    type: 'activity',
    sort: 'create_time desc,id asc',
  },
  searchList: [
    {
      type: 'input',
      label: '作业动因编码',
      value: 'code',
      showLabel: true,
    },
    {
      type: 'input',
      label: '作业动因名称',
      value: 'name',
      showLabel: true,
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
      show: proxy.$permission('taskAgent:add'),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('taskAgent:delete'),
      event: deleteBtn,
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission('taskAgent:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('taskAgent:export'),
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
    {label: '作业动因编码', value: 'code'},
    {label: '作业动因名称', value: 'name'},
    {label: '是否内置', value: 'isSysValue'},
    { label: 'sql', value: 'executeQuerySql' },
    {label: '备注', value: 'remark'},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('taskAgent:update'),
        event: update,
        ifRender: (row) => row.isSys !== '1'
      },
      {
        label: '删除',
        show: proxy.$permission('taskAgent:delete'),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: romove,
        ifRender: (row) => row.isSys !== '1'
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
    {
      label: "作业动因编码",
      value: "code",
      type: 'input',
      span: 12,
      disabled: false,
      required: true,
    },
    {
      label: "作业动因名称",
      value: "name",
      type: 'input',
      span: 12,
      required: true,
    },
    {
      label: "备注",
      value: "remark",
      type: 'input',
      span: 12,
      required: true,
    },
    { label: 'sql', labelTip: '查询参数字段别名为 科室主键deptId，收费项目主键feeItemId，作业主键itemJobId，参数值value，条件参数为组织：@orgId,核算期间@intervalMth', value: 'executeQuerySql', span: 24, type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写作业动因编码', trigger: 'blur' }],
    name: [{ required: true, message: '请填写作业动因名称', trigger: 'blur' }],
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
  filterInfo.value.query = {}
  search()
}

function search() {
  tableInfo.value.api = itemdriveractivity
  filterInfo.value.copyQuery = {
    ...filterInfo.value.query,
    type: 'activity',
  }
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

// 删除
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
        itemdriveractivitydel(ids).then((res) => {
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
  addInfo.value.fieldList[0].disabled = false;
  addInfo.value.visible = true;
  addInfo.value.data = {}
  addInfo.value.addOrUpdate = itemdriveractivityadd;
  addInfo.value.title = '新增作业动因';
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
  addInfo.value.fieldList[0].disabled = true;
  addInfo.value.visible = true;
  addInfo.value.data = JSON.parse(JSON.stringify(row));
  addInfo.value.addOrUpdate = itemdriveractivityupdate;
  addInfo.value.title = '修改作业动因';
}

function romove(row) {
  itemdriveractivitydel([row.id]).then((res) => {
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
  exportTemplateExcel('itemActivityDriverTemplate', 'taskAgent:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '作业动因导入模板')
    }
  })
}

function showExportExcel() {
  itemdriveractivityexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

</script>

<style scoped></style>
