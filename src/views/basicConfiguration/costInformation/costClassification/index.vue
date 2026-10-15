<!-- 成本分类 -->
<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">成本分类</span>
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
              :default-expand-all="false"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
        <div class="layui-card-body border-style-bottom firstCard">
          <div class="layui-btn-container">
            <div class="rightContainerTitle">基础信息</div>
            <el-button
                v-if="$permission('costClassification:update')"
                type="primary"
                class="el-button el-button--medium filter-button textRight"
                :disabled="state.saveBtn"
                @click="update"
            >{{ $t("btn_save") }}</el-button
            >
          </div>
          <div class="model-panel">
            <div class="model-panel-body paddingBox order-model-formBox">
              <page-form
                  v-model:ref-obj="formOrgInfo.ref"
                  :data="formOrgInfo.data"
                  :field-list="formOrgInfo.fieldList"
                  :rules="formOrgInfo.rules"
                  :label-width="formOrgInfo.labelWidth"
              >
                <template v-slot:form-parentCode>
                  <el-input
                      class="not-mongolia"
                      type="input"
                      :disabled="state.treeRow?.parentId === '-1' && state.RightBox"
                      placeholder="请选择分类"
                      v-model="formOrgInfo.data.parentCode"
                  >
                    <template #append>
                      <el-icon @click="openCategoryList"><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
              </page-form>
            </div>
          </div>
        </div>
      </div>
      <SelectCostType
          v-if="selectClassification.visible"
          v-model:query="selectClassification.query"
          v-model:show-dialog="selectClassification.visible"
          title="成本分类"
          :checkStrictly="true"
          :check-box="false"
          :isLeaf="false"
          :highlightCurrent="true"
          :checkedKey="selectClassification.checkedKey"
          :saveEmpty="selectClassification.saveEmpty"
          @callback="selectClassificationCallback"
      ></SelectCostType>
    </div>
    <add-edit
        v-if="state.dialogVisible"
        :title="state.title"
        :tableRow="state.treeRow"
        :visible="state.dialogVisible"
        @callback="diaLogeCallback"
    />

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
        @reset="getList"
    ></SelectAllocationOrgDetails>
  </div>
</template>

<script setup name="costClassification">
import PageForm from "@/components/PageForm/index.vue";
import {
  costCategory,
  costCategoryadd,
  costCategorydelete,
  costCategorydetail,
  costCategoryexportExcel,
  costCategoryupdate,
  costCategoryenable,
  costCategorydisable, costCategorycancelAllocationData, costCategoryallocationData
} from "@/api/costInformation";
import AddEdit from './AddEdit.vue'
import {useUpload} from "@/hooks/useUpload";
import {useAllocation} from "@/hooks/useAllocation";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import SelectAllocationOrgDetails from "@/components/SelectAllocationOrg/details.vue";
const { proxy } = getCurrentInstance();


const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: true,
  saveBtn: true,
  addOrUpdate: "",
  RightBox: false,
  dialogVisible: false,
  categoryId: "",
  title: '新增成本分类',
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});

// 过滤相关配置
const filterInfo = reactive({
  query: {
    name: "",
  },
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
} = useAllocation('costCategory', { allocation: costCategoryallocationData, cancel: costCategorycancelAllocationData }, getList)

const {
  downloadTemplate,
  exportData
} = useUpload({
  export: costCategoryexportExcel
}, '成本分类导入模板', '/costCategory/importExcel', () => getList(), 'costClassification:uploadFile')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'costClassification',
  BUTTON_CODE: 'uploadFile',
  type: '13001',
  action: '/costCategory/import/excelRecord'
})
const selectClassification = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

const formOrgInfo = reactive({
  ref: null,
  data: {},
  labelWidth: "120px",
  fieldList: [
    {
      label: "成本分类编码",
      value: "code",
      type: "input",
      required: true,
    },
    {
      label: "成本分类名称",
      value: "name",
      type: "input",
      required: true,
      disabled: false,
    },
    {
      label: "所属上级分类编码",
      value: "parentCode",
      type: "slot",
      required: false,
      disabled: false,
    },
    {
      label: "所属上级分类名称",
      value: "parentName",
      type: "input",
      disabled: true,
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
      type: "input",
    },
  ],
  rules: {
    code: [{ required: true, message: '请填写成本分类编码' }],
    name: [{ required: true, message: '请填写成本分类名称' }],
    parentCode: [{ required: true, message: '请选择上级分类' }],
  },
});

// 按钮配置
const buttons = ref([
  {
    label: '新增',
    event: addClass,
    show: proxy.$permission('costClassification:add'),
    type: 'button',
  },
  {
    label: '删除',
    event: deleteClass,
    show: proxy.$permission('costClassification:delete'),
    type: 'button',
  },
  {
    label: '启用',
    show: proxy.$permission('costClassification:enable'),
    event: Enable,
    type: 'button',
  },
  {
    label: '停用',
    event: Deactivate,
    show: proxy.$permission('costClassification:enable'),
    type: 'button',
  },
  {
    type: 'button',
    label: '分配',
    event: () => allocation(),
    show: proxy.$permission('costClassification:list') && proxy.$fn.getControl(allocationDataType),
  },
  {
    type: 'button',
    label: '分配详情',
    event: () => allocationDetail(),
    show: proxy.$permission('costClassification:list') && proxy.$fn.getControl(allocationDataType),
  },
  {
    label: '下载模版',
    event: () => downloadTemplate('成本分类导入模板', 'costClassification:downloadTemplate'),
    show: proxy.$permission('costClassification:downloadTemplate'),
    type: 'button',
  },
  ...uploadExcelBtns,
  {
    label: '导出Excel',
    event: showExportExcel,
    show: proxy.$permission('costClassification:exportExcel'),
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

watch(
    () => treeInfo.data,
    () => {
      state.RightBox = false;
      state.addBtn = true;
      // state.saveBtn = true;
    },
    {
      deep: true,
    }
);

watch(() => formOrgInfo.data, (rows) => {
  const addBtn = buttons.value[0]
  const delBtn = buttons.value[1]
  const EnableBtn = buttons.value[2]
  const DeactivateBtn = buttons.value[3]
  addBtn.disabled = !state.treeRow
  delBtn.disabled = !state.treeRow || state.treeRow.sysFlag === '1'
  EnableBtn.disabled = state.treeRow ? rows.status === '1' : true
  DeactivateBtn.disabled = state.treeRow ? rows.status !== '1' : true
  formOrgInfo.fieldList[1].disabled = state.treeRow.parentId === '-1' && rows.parentId === state.treeRow.parentId;
  formOrgInfo.fieldList[2].disabled = state.treeRow.parentId === '-1' && rows.parentId === state.treeRow.parentId;
}, { immediate: true })

initRules();
onMounted(() => {
  getList();
});

function getList() {
  costCategory().then((res) => {
    if (res && res.success) {
      let data = res.data;
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '成本分类',
          id: '-1'
        }
      ]
      if (filterInfo.query.name) {
        treeInfo.treeData = [];
        getNodeId(data, -1);
      } else {
        treeInfo.treeData = [];
        getNodeId(data, 2);
      }
      if(state.treeRow) {
        handleNodeClick(state.treeRow)
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
// 初始化校验规则
function initRules() {
  formOrgInfo.rules = proxy.$initRules(formOrgInfo.fieldList);
}
function addClass() {
  state.addOrUpdate = costCategoryadd;
  state.RightBox = false;
  state.dialogVisible = true
}

// 导出
function showExportExcel() {
  exportData({name: filterInfo.query.name})
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
        costCategorydelete(state.treeRow.id).then((res) => {
          if (res.success) {
            getList();
            state.isAddUpdate = "add";
            formOrgInfo.data.name = "";
            formOrgInfo.data.code = "";
          }
        });
      })
      .catch(() => {});
}
function openCategoryList() {
  if(state.treeRow.parentId === '-1' && state.RightBox) return
  selectClassification.value.visible = true
}

function selectClassificationCallback(data) {
  if (data) {
    formOrgInfo.data.parentId = data.id
    formOrgInfo.data.parentCode = data.code
    formOrgInfo.data.parentName = data.name
  } else {
    formOrgInfo.data.parentId = ''
    formOrgInfo.data.parentCode = ''
    formOrgInfo.data.parentName = ''
  }
  selectClassification.value.visible = false
}
function diaLogeCallback(flag) {
  state.dialogVisible = false
  if (flag) {
    getList()
  }
}
// 启用
async function Enable() {
  if(!state.treeRow) return
  const { data, success } = await costCategoryenable([state.treeRow.id])
    if (success) {
      proxy.$message.success('启用成功')
      await handleNodeClick(state.treeRow)
    }
}
// 停用
async function Deactivate() {
  if(!state.treeRow) return
  const { data, success } = await costCategorydisable([state.treeRow.id])
    if (success) {
      proxy.$message.success('停用成功')
      await handleNodeClick(state.treeRow)
    }
}

// 点击树节点
async function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.addBtn = false;
    state.treeRow = '';
    state.categoryId = node.id;
    buttons.value[0].disabled = true;
    buttons.value[1].disabled = true;
    buttons.value[2].disabled = true;
    buttons.value[3].disabled = true;
    formOrgInfo.data = {};
    return;
  }
  formOrgInfo.fieldList[0].disabled = true;

  formOrgInfo.ref.resetFields();
  state.isAddUpdate = "update";
  state.addBtn = false;
  state.addOrUpdate = costCategoryupdate;
  state.categoryId = node.id;
  state.treeRow = node;
  formOrgInfo.data = {};
  if (node.id !== "-1") {
    state.saveBtn = false;
    state.categoryId = node.id;
    await getDetail();
    state.RightBox = true;
  }
}
async function getDetail() {
  if (["-1"].includes(state.traceId)) {
    return;
  }
  await costCategorydetail(state.categoryId).then((res) => {
    formOrgInfo.data = res.data;
    state.saveBtn = res.data.sysFlag === '1';
  });
}
async function update() {
  let flag = 0;
  await formOrgInfo.ref.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    if(state.treeRow.parentId !== '-1' && state.treeRow.parentId !== '-2') {
      if(!formOrgInfo.data.parentCode) return proxy.$message.warning('请选择所属上级分类编码')
    }
    state.addOrUpdate(formOrgInfo.data).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        getList();
      }
    });
  }
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
