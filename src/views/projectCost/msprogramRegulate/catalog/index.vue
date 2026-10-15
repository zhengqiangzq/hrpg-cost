<!--  医疗服务项目规范目录 -->
<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">医疗服务项目规范目录</span>
          <!-- 按钮 -->
          <TreeButtons
              :filterBtn="buttons"
          >
          </TreeButtons>
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
              v-model="filterInfo.query.name"
              :clearable="true"
              placeholder="请输入编码/名称"
              suffix-icon="Search"
              @keyup.enter="handleSearch"
          ></el-input>
        </div>
        <div class="left-container-main main-flex">
          <el-tree
              ref="menuTree"
              :data="treeInfo.data"
              highlight-current
              :props="treeInfo.defaultProps"
              node-key="id"
              :default-expanded-keys="treeInfo.treeData"
              :default-checked-keys="[treeInfo.checked]"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container" v-show="state.treeRow?.id">
        <div class="layui-card-body border-style-bottom firstCard">
          <div class="layui-btn-container">
            <div class="rightContainerTitle">基础信息</div>
            <el-button
                v-if="$permission(`${PERMISSION_CODE}:update`)"
                type="primary"
                class="el-button el-button--medium filter-button"
                :disabled="state.saveBtn"
                @click="update"
            >{{ $t("btn_save") }}</el-button
            >
          </div>
          <div class="model-panel">
            <div class="model-panel-body paddingBox order-model-formBox">
              <page-form
                  ref="filterRef"
                  v-model:ref-obj="formOrgInfo.ref"
                  :data="formOrgInfo.data"
                  :field-list="formOrgInfo.fieldList"
                  :rules="formOrgInfo.rules"
                  :label-width="formOrgInfo.labelWidth"
              >
                <template #form-parentName>
                  <el-input
                      v-model="formOrgInfo.data.parentName"
                      class="not-mongolia"
                      type="input"
                      placeholder="请选择上级目录"
                      :disabled="true"
                  >
                    <template #append>
                      <el-icon @click="openParentName"><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
              </page-form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SelectAllocationOrg
        v-if="selectAllocationInfo.visible"
        v-model:query="selectAllocationInfo.query"
        v-model:show-dialog="selectAllocationInfo.visible"
        title="选择组织"
        :saveEmpty="true"
        :checkStrictly="true"
        :check-box="true"
        :highlightCurrent="true"
        @callback="selectAllocationCallBack"
    ></SelectAllocationOrg>
    <SelectAllocationOrgDetails
        v-if="selectAllocationDetailInfo.visible"
        v-model:query="selectAllocationDetailInfo.query"
        v-model:show-dialog="selectAllocationDetailInfo.visible"
        :allocationApi="selectAllocationDetailInfo.allocation"
        :cancelApi="selectAllocationDetailInfo.cancel"
        :loids="selectLoids"
        @reset="search"
    ></SelectAllocationOrgDetails>
    <add-edit
        v-if="state.addBtn"
        :tableRow="state.addRow"
        :visible="state.addBtn"
        @callback="diaLogeCallback"
    />
  </div>
</template>

<script setup name="catalog">
import PageForm from "@/components/PageForm/index.vue";
import { exportTemplateExcel } from '@/api/pub.js'
import {getCurrentInstance, onMounted, ref, watch, reactive} from "vue";
import {
  deleteMSProgramRegulateCatalog,
  exportMSProgramRegulateCatalog, medicalServiceStandardsCatalogallocationData,
  medicalServiceStandardsCatalogcalallocationData,
  medicalServiceStandardsCatalogdetail, medicalServiceStandardsCatalogDisable, medicalServiceStandardsCatalogEnable,
  treeMSProgramRegulateCatalog,
  updateMSProgramRegulateCatalog
} from "@/api/projectCost/MSProgramRegulateCatalog";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import AddEdit from "./AddEdit.vue";
import {useAllocation} from "@/hooks/useAllocation";
import SelectAllocationOrgDetails from "@/components/SelectAllocationOrg/details.vue";
import {useSelectTableData} from "@/components/SelectTableData/useSelectTableData";
const { proxy } = getCurrentInstance();

const PERMISSION_CODE = 'catalog'

const { tableParameter, openDialog } = useSelectTableData()
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: false,
  saveBtn: true,
  categoryId: "",
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});

const {
  selectAllocationInfo,
  selectAllocationDetailInfo,
  selectLoids,
  allocation,
  allocationDataType,
  selectAllocationCallBack,
  allocationDetail,
  cancelAllocation
} = useAllocation('catalog', { allocation: medicalServiceStandardsCatalogallocationData, cancel: medicalServiceStandardsCatalogcalallocationData }, search)


// 过滤相关配置
const filterInfo = reactive({
  query: {
    name: "",
  },
});
const filterRef = ref()
const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '13057',
  action: '/item/medicalServiceStandardsCatalog/import/excelRecord',
})

const formOrgInfo = reactive({
  ref: null,
  data: {},
  fieldList: [
    {
      label: "目录编码",
      value: "code",
      type: "input",
      required: true,
    },
    {
      label: "目录名称",
      value: "name",
      type: "input",
      required: true,
      disabled: false,
    },
    {
      label: "所属上级目录",
      value: "parentName",
      type: "slot",
      required: false,
      disabled: false,
    },
    {
      label: "启用状态",
      value: "status",
      type: 'select-model',
      code: 'enabled_type',
      disabled: true,
    },
    {
      label: "备注",
      value: "remark",
      type: "textarea",
    },
  ],
  rules: {
    code: [{ required: true, message: '请填写目录编码' }],
    name: [{ required: true, message: '请填写目录名称' }],
  },
});

// 按钮配置
const buttons = ref([
  {
    label: '新增',
    event: addClass,
    show: proxy.$permission(`${PERMISSION_CODE}:add`),
    type: 'button',
  },
  {
    label: '删除',
    event: deleteClass,
    show: proxy.$permission(`${PERMISSION_CODE}:delete`),
    type: 'button',
  },
  {
    label: '启用',
    show: proxy.$permission(`${PERMISSION_CODE}:enable`),
    event: Enable,
    type: 'button',
  },
  {
    label: '停用',
    event: Deactivate,
    show: proxy.$permission(`${PERMISSION_CODE}:disEnable`),
    type: 'button',
  },
  {
    label: '分配',
    show: proxy.$permission(`${PERMISSION_CODE}:allocation`) && proxy.$fn.getControl(allocationDataType),
    event: allocation,
    type: 'button',
  },
  {
    label: '取消全部分配',
    event: cancelAllocation,
    show: proxy.$permission(`${PERMISSION_CODE}:callallocation`) && proxy.$fn.getControl(allocationDataType),
    type: 'button',
  },
  {
    label: '分配详情',
    event: allocationDetail,
    show: proxy.$permission(`${PERMISSION_CODE}:allocationDetail`) && proxy.$fn.getControl(allocationDataType),
    type: 'button',
  },
  {
    label: '下载模版',
    event: downloadTemplate,
    show: proxy.$permission(`${PERMISSION_CODE}:download`),
    type: 'button',
  },
  ...uploadExcelBtns,
  {
    label: '导出Excel',
    event: showExportExcel,
    show: proxy.$permission(`${PERMISSION_CODE}:export`),
    type: 'button',
  },
]);

// 权限树
const treeInfo = reactive({
  data: [],
  nodeKey: "code",
  treeData: [],
  checked: [],
  defaultProps: {
    children: "children",
    label: function (data, node) {
      if (data.code) {
        return data.code + " " + data.name;
      } else {
        return data.name;
      }
    },
  },
});


watch(() => formOrgInfo.data, (rows) => {
  const delBtn = buttons.value.filter(it => it.label === '删除')[0]
  const EnableBtn = buttons.value.filter(it => it.label === '启用')[0]
  const DeactivateBtn = buttons.value.filter(it => it.label === '停用')[0]
  const allocationBtn = buttons.value.filter(it => it.label === '分配')[0]
  const disallocationBtn = buttons.value.filter(it => it.label === '取消全部分配')[0]
  const allocationDetail = buttons.value.filter(it => it.label === '分配详情')[0]
  delBtn.disabled = state.treeRow ? rows.status === '1' : true
  EnableBtn.disabled = state.treeRow ? rows.status === '1' : true
  DeactivateBtn.disabled = state.treeRow ? rows.status !== '1' : true
  allocationBtn.disabled = !state.treeRow
  disallocationBtn.disabled = !state.treeRow
  allocationDetail.disabled = !state.treeRow
}, { immediate: true })

onMounted(() => {
  search();
});

function search() {
  return treeMSProgramRegulateCatalog().then((res) => {
    if (res && res.success) {
      let data = res.data;
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '医疗服务项目规范目录',
          id: '-1'
        }
      ]
      if(state.treeRow) {
        handleNodeClick(state.treeRow)
      }
      if (filterInfo.query.name) {
        treeInfo.treeData = [];
        getNodeId(data, -1);
      } else {
        treeInfo.treeData = [];
        getNodeId(data, 2);
      }
    }
  });
}
function getNodeId(data, num, count = 0) {
  count++;
  if(!data) return
  data.forEach((item) => {
    if (count === num) {
      return;
    }
    treeInfo.treeData.push(item.id);
    if (item.children && item.children.length) {
      getNodeId(item.children, num, count);
    }
  });
}

function addClass() {
  state.isAddUpdate = "add";
  state.addBtn = true;
  state.addRow = {
    status: "1",
    parentId: formOrgInfo.data.id || '',
    parentName: formOrgInfo.data.name || '',
  };
}

// 导出
function showExportExcel() {
  exportMSProgramRegulateCatalog().then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function downloadTemplate() {
  exportTemplateExcel('itemMedicalServiceStandardsCatalogTemplate', `${PERMISSION_CODE}:download`).then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '医疗服务项目规范目录导入模板')
    }
  })
}
// 删除分类
function deleteClass() {
  if(!state.treeRow) return
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        deleteMSProgramRegulateCatalog(state.treeRow.id).then((res) => {
          if (res.success) {
            search();
            state.treeRow = ''
            state.isAddUpdate = "add";
            formOrgInfo.data = {}
          }
        });
      })
      .catch(() => {});
}

function diaLogeCallback(flag) {
  if (flag) {
    state.id = null;
    state.addRow = null
    search()
  } else {
    state.addBtn = false
  }
}

// 启用
async function Enable() {
  if(!state.treeRow) return
  const { data, success } = await medicalServiceStandardsCatalogEnable(state.treeRow.id)
  if (success) {
    proxy.$message.success('启用成功')
    await handleNodeClick(state.treeRow)
  }
}
// 停用
async function Deactivate() {
  if(!state.treeRow) return
  const { data, success } = await medicalServiceStandardsCatalogDisable(state.treeRow.id)
  if (success) {
    proxy.$message.success('停用成功')
    await handleNodeClick(state.treeRow)
  }
}

// 点击树节点
async function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.treeRow = '';
    state.categoryId = '';
    formOrgInfo.data = {}
    selectLoids.value = []
    return;
  }
  formOrgInfo.fieldList[0].disabled = true;
  console.log('点击树节点', node)

  formOrgInfo.ref.resetFields();
  state.isAddUpdate = "update";
  state.categoryId = node.id;
  state.treeRow = node;
  selectLoids.value = [node.id]
  formOrgInfo.data = JSON.parse(JSON.stringify(node));
  state.saveBtn = false;
  await getDetail();
}
async function getDetail() {
  await medicalServiceStandardsCatalogdetail(state.categoryId).then((res) => {
    formOrgInfo.data = res.data;
    state.saveBtn = res.data.status === '1';
  });
}
async function update() {
  await formOrgInfo.ref.validate((valid) => {
    if (valid) {
      updateMSProgramRegulateCatalog(formOrgInfo.data).then(async (res) => {
        if (res.success) {
          proxy.$message.success('保存成功')
          await search();
        }
      });
    }
  });
}
function openParentName () {
  tableParameter.title = '服务项目规范目录'
  tableParameter.saveEmpty = true
  tableParameter.api = treeMSProgramRegulateCatalog
  tableParameter.callBack = (raw) => {
    formOrgInfo.data.parentId = raw?.id
    formOrgInfo.data.parentName = raw?.name
  }
  openDialog(filterRef.value, 'tree')
}


function handleSearch() {
  proxy.$refs.menuTree.filter(filterInfo.query.name);
}
function filterNode(value, data) {
  const filterName = `${data.code}${data.name}`
  return filterName.includes(value);
}
</script>

<style lang="scss" scoped>
.left-container {
  min-width: 350px;
  .left-container-header {
    display: flex;
    justify-content: flex-start;
    padding: 5px 0;
    box-sizing: border-box;
  }
  .border-style-bottom {
    margin-bottom: 0;
  }
}
.main-flex {
  flex-grow: 1;
  display: flex;
  flex-wrap: nowrap;
  height: calc(100% - 120px);
  .el-tree {
    width: 100%;
    padding: 0 20px 20px;
    overflow-y: auto;
  }
}
</style>
