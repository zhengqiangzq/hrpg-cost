<!--  核算科室关系-->
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
          <template #filter-itemDeptName>
            <el-input
                v-model="filterInfo.query.itemDeptName"
                class="not-mongolia"
                type="input"
                placeholder="请选择项目核算科室"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="openDeptSelector"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #filter-baseDeptName>
            <el-input
                v-model="filterInfo.query.baseDeptName"
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
          ref="pageFromRef"
          v-model:ref-obj="addInfo.ref"
          :data="addInfo.data"
          :field-list="addInfo.fieldList"
          :rules="addInfo.rules"
          :label-width="addInfo.labelWidth"
      >
        <template v-slot:form-itemDeptName>
          <el-input
              v-model="addInfo.data.itemDeptName"
              class="not-mongolia"
              type="input"
              placeholder="请选择科室科室"
              :disabled="true"
          >
            <template #append>
              <el-icon @click="openDeptCost"><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <template v-slot:form-baseDeptName>
          <el-input
              v-model="addInfo.data.baseDeptName"
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
    <!--    查询项目核算科室-->
<!--    <SelectDeptArchivesTree-->
<!--        v-if="depttreeInfo.visible"-->
<!--        v-model:showDialog="depttreeInfo.visible"-->
<!--        :title="depttreeInfo.title"-->
<!--        :checkStrictly="depttreeInfo.checkStrictly"-->
<!--        :isLeaf="depttreeInfo.isLeaf"-->
<!--        :query="depttreeInfo.query"-->
<!--        :checkBox="depttreeInfo.checkBox"-->
<!--        :checkedList="depttreeInfo.checkedList"-->
<!--        :api="depttreeInfo.api"-->
<!--        :highlight-current="true"-->
<!--        @callback="treeCallback" />-->
<!--    <SelectDeptTree-->
<!--        v-if="treeInfo.visible"-->
<!--        v-model:showDialog="treeInfo.visible"-->
<!--        :title="treeInfo.title"-->
<!--        :checkStrictly="treeInfo.checkStrictly"-->
<!--        :isLeaf="treeInfo.isLeaf"-->
<!--        :query="treeInfo.query"-->
<!--        :checkBox="treeInfo.checkBox"-->
<!--        :checkedList="treeInfo.checkedList"-->
<!--        :api="treeInfo.api"-->
<!--        :highlight-current="true"-->
<!--        @callback="treeCallback" />-->
  </div>
</template>

<script setup name="accountingDeptRelationship">
import {getCurrentInstance, onMounted, ref, watch} from "vue";

const {proxy} = getCurrentInstance()
import PageForm from "@/components/PageForm/index.vue";
import PageDialog from "@/components/PageDialog/index.vue";

import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {
  itemsectionRelationAdd,
  itemsectionRelationDelete,
  itemsectionRelationexportExcel,
  itemsectionRelationPage, itemsectionRelationUpdate
} from "@/api/projectCost/accountingDeptRelationship";
import {deepClone} from "@/utils";
import {itemsectiontree} from "@/api/projectCost/accountingDept";
import {sectiontree} from "@/api/accountingDepartment";

const {
  downloadTemplate,
  exportData
} = useUpload({
  export: itemsectionRelationexportExcel
}, '项目核算科室关系导入模板', '/sectionRelation/importExcel', () => search(), 'costDeptRelation:import')

const PERMISSION_CODE = 'accountingDeptRelationship'
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'costDeptRelation',
  BUTTON_CODE: 'uploadFile',
  type: '13003',
  action: '/sectionRelation/import/excelRecord',
})


const filterRef = ref()
const pageFromRef = ref()
// 过滤相关配置
const filterInfo = ref({
  query: {

  },
  searchList: [
    {
      type: 'slot',
      label: '项目核算科室',
      value: 'itemDeptName',
      showLabel: true,
      event: search,
    },
    {
      type: 'slot',
      label: '基础核算科室',
      value: 'baseDeptName',
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
      event: () => openModify(),
    },
    {
      type: 'button',
      label: '删除',
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      event: () => deleteData(),
    },
    {
      type: 'button',
      label: '下载模板',
      event: () => downloadTemplate('核算科室关系导入模板', `${PERMISSION_CODE}:download`),
      show: proxy.$permission(`${PERMISSION_CODE}:download`),
    },
    ...uploadExcelBtns,
    {
      type: 'button',
      label: '导出Excel',
      event: () => exportData(filterInfo.copyQuery),
      show: proxy.$permission(`${PERMISSION_CODE}:export`),
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
    {label: '项目核算科室编码', value: 'itemDeptCode'},
    {label: '项目核算科室名称', value: 'itemDeptName'},
    {label: '基础核算科室编码', value: 'baseDeptCode'},
    {label: '基础核算科室名称', value: 'baseDeptName'},
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
  labelWidth: "100px",
  fieldList: [
    {
      label: "项目核算科室",
      value: "itemDeptName",
      type: 'slot',
      span: 12,
      required: true,
    },
    {
      label: "基础核算科室",
      value: "baseDeptName",
      type: 'slot',
      span: 12,
      required: true,
    },
  ],
  rules: {
    itemDeptName: [{ required: true, message: '请选择项目核算科室' }],
    baseDeptName: [{ required: true, message: '请选择基础核算科室' }],
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
  treeInfo.value.checkedList = [];
  depttreeInfo.value.checkedList = [];
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

function search() {
  tableInfo.value.api = itemsectionRelationPage
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}

// table选择
function SelectionChange(eventName, raw) {
  if (eventName === "tableCheck") {
    tableInfo.value.sectionRows = raw
  }
}

// 删除
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.value.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        itemsectionRelationDelete(ids).then((res) => {
          if (res.success) {
            proxy.$message.success('删除成功')
            search()
          }
        });
      })
      .catch(() => {});
}
// 添加
function openModify() {
  addInfo.value.visible = true;
  addInfo.value.data = {}
  treeInfo.value.checkedList = [];
  addInfo.value.addOrUpdate = itemsectionRelationAdd;
  addInfo.value.title = '新增核算科室关系';
}

function update(row) {
  addInfo.value.visible = true;
  addInfo.value.data = deepClone(row);
  treeInfo.value.checkedList = [];
  addInfo.value.addOrUpdate = itemsectionRelationUpdate;
  addInfo.value.title = '修改核算科室关系';
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


// 核算科室
const depttreeInfo = ref({
  title: '项目核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  saveEmpty: true,
  api: itemsectiontree,
  query: {},
  checkedList: [],
})
// 系统科室
const treeInfo = ref({
  title: '基础核算科室',
  visible: false,
  checkBox: true,
  checkStrictly: false,
  isLeaf: false,
  saveEmpty: true,
  api: sectiontree,
  query: {},
  defaultProps: {
    children: "childList",
    label: 'name',
  },
  checkedList: [],
})

// filter查询
function openDeptSelector() {
  depttreeInfo.value.visible = true;
  depttreeInfo.value.checkBox = true;
  depttreeInfo.value.callBack = (data) => {
    depttreeInfo.value.checkedList = data;
    let datas = data?.filter((it) => !it.children.length)
    filterInfo.value.query.itemDeptName = datas?.map((it) => it.name).join(',');
    filterInfo.value.query.itemDeptIds = datas?.map((it) => it.id);
  }
  filterRef.value.openDialog(depttreeInfo.value, 'tree')
}
// filter查询
function openCostDept() {
  treeInfo.value.visible = true;
  treeInfo.value.callBack = (data) => {
    treeInfo.value.checkedList = data;
    let datas = data?.filter((it) => !it.childList)
    filterInfo.value.query.baseDeptName = datas?.map((it) => it.name).join(',');
    filterInfo.value.query.baseDeptIds = datas?.map((it) => it.id);
  }
  filterRef.value.openDialog(treeInfo.value, 'tree')
}
// 核算科室
function openDeptCost() {
  depttreeInfo.value.visible = true;
  depttreeInfo.value.checkBox = false;
  depttreeInfo.value.callBack = (data) => {
    addInfo.value.data.itemDeptName = data.name;
    addInfo.value.data.itemDeptId = data.id;
  }
  pageFromRef.value.openDialog(depttreeInfo.value, 'tree')
}

// 系统科室
function openDeptSystem() {
  treeInfo.value.visible = true;
  treeInfo.value.callBack = (data) => {
    treeInfo.value.checkedList = data;
    let datas = data?.filter((it) => !it.childList)
    addInfo.value.data.baseDeptName = datas?.map((it) => it.name).join(',');
    addInfo.value.data.baseDeptIds = datas?.map((it) => it.id);
  }
  pageFromRef.value.openDialog(treeInfo.value, 'tree')
}

</script>

<style scoped></style>
