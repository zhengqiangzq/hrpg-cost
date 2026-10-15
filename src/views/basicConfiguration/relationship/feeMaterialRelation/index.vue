<!--  收费物资关系-->
<template>
  <div class="app-container">
    <div>
      <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter
          ref="pageFilterRef"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.searchList"
          :filter-btn="filterInfo.filterbtn"
      >
        <template #filter-feeCategoryName>
          <el-input
              v-model="filterInfo.query.feeCategoryName"
              class="not-mongolia"
              type="input"
              placeholder="请选择收费类别"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openFreeSelector"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template #filter-productFinCategoryName>
          <el-input
              v-model="filterInfo.query.productFinCategoryName"
              class="not-mongolia"
              type="input"
              placeholder="请选择物资分类"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openProduct"><Search /></el-icon>
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
          <template v-slot:form-feeCategoryName>
            <el-input
                v-model="addInfo.data.feeCategoryName"
                class="not-mongolia"
                type="input"
                placeholder="请选择收费类别"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openFreeProject"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template v-slot:form-productFinCategoryName>
            <el-input
                v-model="addInfo.data.productFinCategoryName"
                class="not-mongolia"
                type="input"
                placeholder="请选择物资分类"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSystem"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </page-form>
      </PageDialog>
    <!--    查询物资分类-->
    <SelectMaterialTree
        v-if="materialParameter.visible"
        v-model:showDialog="materialParameter.visible"
        :title="materialParameter.title"
        :checkStrictly="materialParameter.checkStrictly"
        :isLeaf="materialParameter.isLeaf"
        :query="materialParameter.query"
        :checkBox="materialParameter.checkBox"
        :api="materialParameter.api"
        :checkedList="filterNum ? materialParameter.checkedList : []"
        :highlight-current="true"
        @callback="feeMaterCallback" />
  </div>
</template>

<script setup name="feeMaterialRelation">
import {useStorage} from "@vueuse/core";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {exportTemplateExcel} from "@/api/pub";
import {
  chargeProductRelationadd,
  chargeProductRelationdelete, chargeProductRelationexportExcel,
  chargeProductRelationpage,
  chargeProductRelationupdate
} from "@/api/relationship";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'feeMaterialRelation',
  type: '13010',
  action: '/chargeProductRelation/import/excelRecord',
})
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
      label: '收费类别',
      value: 'feeCategoryName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '物资分类',
      value: 'productFinCategoryName',
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
      show: proxy.$permission('feeMaterialRelation:add'),
      event: addBtn,
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission('feeMaterialRelation:delete'),
      event: deleteBtn,
    },
    {
      type: 'button',
      label: '下载模板',
      event: downloadTemplate,
      show: proxy.$permission('feeMaterialRelation:download'),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: showExportExcel,
      show: proxy.$permission('feeMaterialRelation:export'),
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
    {label: '收费类别编码', value: 'feeCategoryCode'},
    {label: '收费类别名称', value: 'feeCategoryName'},
    {label: '物资分类', value: 'productFinCategoryCode'},
    {label: '物资分类', value: 'productFinCategoryName'},
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission('feeMaterialRelation:update'),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission('feeMaterialRelation:delete'),
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
      label: "收费类别",
      value: "feeCategoryName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "物资分类",
      value: "productFinCategoryName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    feeCategoryName: [{ required: true, message: '请选择收费类别', trigger: 'blur' }],
    productFinCategoryName: [{ required: true, message: '请选择物资分类', trigger: 'blur' }],
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
  tableParameter.checkedList = [];
  materialParameter.value.checkedList = [];
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function search() {
  tableInfo.value.api = chargeProductRelationpage
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
        chargeProductRelationdelete(ids).then((res) => {
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
  tableParameter.checkedList = [];
  addInfo.value.addOrUpdate = chargeProductRelationadd;
  addInfo.value.title = '新增收费物资关系';
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
  addInfo.value.addOrUpdate = chargeProductRelationupdate;
  addInfo.value.title = '修改收费物资关系';
}

function romove(row) {
  chargeProductRelationdelete([row.id]).then((res) => {
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
  exportTemplateExcel('收费物资关系导入模板', 'feeMaterialRelation:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '收费物资关系导入模板')
    }
  })
}

const filterNum = ref(false)


// 物资分类
const materialParameter = ref({
  title: '物资分类',
  visible: false,
  checkBox: false,
  checkStrictly: false,
  isLeaf: false,
  api: null,
  checkedList: [],
  query: {status: '1', last: true }
})

const pageFilterRef = ref()

// filter查询收费项目
function openFreeSelector() {
  tableParameter.visible = true
  tableParameter.checkBox = true
  tableParameter.title = '收费类别'
  tableParameter.type = 'feeCategory'
  filterNum.value = true;
  tableParameter.callBack = feeItemCallback
  openDialog(pageFilterRef.value)
}
// 新增查询收费项目
function openFreeProject() {
  tableParameter.visible = true
  tableParameter.checkBox = addInfo.value.title === "新增收费物资关系";
  tableParameter.title = '收费类别'
  tableParameter.type = 'feeCategory'
  filterNum.value = false;
  tableParameter.callBack = feeItemCallback
  openDialog(pageFilterRef.value)
}
function feeItemCallback(raw) {
  tableParameter.checkedList = raw;
  if(filterNum.value) {
    let datas = raw?.filter((it) => !it.childList)
    filterInfo.value.query.feeCategoryIdList = datas?.map((it) => it.id);
    filterInfo.value.query.feeCategoryName = datas?.map((it) => it.name);
  } else {
    if (addInfo.value.title === "新增收费物资关系") {
      let datas = raw?.filter((it) => !it.childList)
      addInfo.value.data.feeCategoryName = datas?.map((it) => it.name);
      addInfo.value.data.feeCategoryIdList = datas?.map((it) => it.id);
    } else {
      addInfo.value.data.feeCategoryId = raw.id;
      addInfo.value.data.feeCategoryName = raw.name;
    }
  }
}

// filter查询
function openProduct() {
  materialParameter.value.visible = true
  filterNum.value = true;
  materialParameter.value.checkBox = true;
}

// 物资分类
function openDeptSystem() {
  materialParameter.value.visible = true
  filterNum.value = false;
  materialParameter.value.checkBox = false;
}
function feeMaterCallback(raw) {
  materialParameter.value.visible = false
  if(filterNum.value) {
    materialParameter.value.checkedList = raw;
    let datas = raw?.filter((it) => !it.childList)
    filterInfo.value.query.productFinCategoryIdList = datas?.map((it) => it.id);
    filterInfo.value.query.productFinCategoryName = datas?.map((it) => it.name);
  } else {
    addInfo.value.data.productFinCategoryName = raw.name;
    addInfo.value.data.productFinCategoryId = raw.id;
  }
}

function pageInfo(obj) {
  page.value = obj
}

function showExportExcel() {
  chargeProductRelationexportExcel(filterInfo.value.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

</script>

<style scoped></style>
