<template>
<!--  作业分类-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">作业分类</span>
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
                v-if="$permission('taskClassify:update')"
                type="primary"
                :disabled="formOrgInfo.data.status === '1'"
                class="el-button el-button--medium filter-button textRight"
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
                <template v-slot:form-parentName>
                  <el-input
                      type="input"
                      :disabled="state.treeRow?.parentId === '-1'"
                      placeholder="请选择分类"
                      v-model="formOrgInfo.data.parentName"
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
      <SelectTaskType
          v-if="selectClassification.visible"
          v-model:query="selectClassification.query"
          v-model:show-dialog="selectClassification.visible"
          title="作业分类"
          :checkStrictly="true"
          :check-box="false"
          :isLeaf="false"
          :highlightCurrent="true"
          :checkedKey="selectClassification.checkedKey"
          :saveEmpty="selectClassification.saveEmpty"
          @callback="selectClassificationCallback"
      ></SelectTaskType>
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

<script setup name="taskClassify">
import PageForm from "@/components/PageForm/index.vue";
import { exportTemplateExcel } from '@/api/pub.js'
import {
  itemjobClassallocationDetail, itemjobClasscallallocation,
  itemjobClassdel,
  itemjobClassdetail, itemjobClassdisable, itemjobClassenable,
  itemjobClassexportExcel, itemjobClasstree, itemjobClassupdate
} from "@/api/projectBase";
import { ref, getCurrentInstance, reactive, watch, onMounted } from "vue";
import AddEdit from "./AddEdit.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {useAllocation} from "@/hooks/useAllocation";
import SelectAllocationOrgDetails from "@/components/SelectAllocationOrg/details.vue";
const { proxy } = getCurrentInstance();
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: false,
  saveBtn: true,
  categoryId: "",
  treeRow: {},
  fromRow: '',
  isAddUpdate: "add",
  flag: true,
});

// 过滤相关配置
const filterInfo = reactive({
  query: {
    name: "",
  },
});

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'taskClassify',
  type: '13039',
  action: '/item/jobClass/import/excelRecord',
})
const selectClassification = ref({
  visible: false,
  saveEmpty: true,
  query: {},
  checkedKey: {},
})

const {
  selectAllocationInfo,
  selectAllocationDetailInfo,
  selectLoids,
  allocation,
  allocationDataType,
  selectAllocationCallBack,
  allocationDetail,
  cancelAllocation
} = useAllocation('itemJobClass', { allocation: itemjobClasscallallocation, cancel: itemjobClassallocationDetail }, search)



const formOrgInfo = reactive({
  ref: null,
  data: {},
  labelWidth: "120px",
  fieldList: [
    {
      label: "作业分类编码",
      value: "code",
      type: "input",
      required: true,
      disabled: true,
    },
    {
      label: "作业分类名称",
      value: "name",
      type: "input",
      required: true,
      disabled: false,
    },
    {
      label: "所属上级分类名称",
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
      label: "创建组织",
      value: "createOrgName",
      type: "input",
      disabled: true,
    },
    {
      label: "数据来源类型",
      value: "dataSourceTypeName",
      type: "input",
      disabled: true,
    },
    {
      label: "备注",
      value: "remark",
      type: "input",
    },
  ],
  rules: {
    code: [{ required: true, message: '请填写作业分类编码' }],
    name: [{ required: true, message: '请填写作业分类名称' }],
  },
});

// 按钮配置
const buttons = ref([
  {
    label: '新增',
    event: addClass,
    show: proxy.$permission('taskClassify:add'),
    type: 'button',
  },
  {
    label: '删除',
    event: deleteClass,
    show: proxy.$permission('taskClassify:delete'),
    type: 'button',
  },
  {
    label: '启用',
    show: proxy.$permission('taskClassify:enable'),
    event: Enable,
    type: 'button',
  },
  {
    label: '停用',
    event: Deactivate,
    show: proxy.$permission('taskClassify:enable'),
    type: 'button',
  },
  {
    label: '分配',
    show: proxy.$permission(`taskClassify:allocation`) && proxy.$fn.getControl(allocationDataType),
    event: allocation,
    type: 'button',
  },
  {
    label: '取消全部分配',
    event: cancelAllocation,
    show: proxy.$permission(`taskClassify:callallocation`) && proxy.$fn.getControl(allocationDataType),
    type: 'button',
  },
  {
    label: '分配详情',
    event: allocationDetail,
    show: proxy.$permission(`taskClassify:allocationDetail`) && proxy.$fn.getControl(allocationDataType),
    type: 'button',
  },
  {
    label: '下载模版',
    event: downloadTemplate,
    show: proxy.$permission('taskClassify:download'),
    type: 'button',
  },
  ...uploadExcelBtns,
  {
    label: '导出Excel',
    event: showExportExcel,
    show: proxy.$permission('taskClassify:export'),
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
  console.log('单行数据 rows',rows,state.treeRow)
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

async function search() {
  await itemjobClasstree().then((res) => {
    if (res && res.success) {
      let data = res.data;
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '作业分类',
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
  state.saveBtn = false;
  state.addRow = {
    parentId: state.treeRow?.id === '-1' ? '' : state.treeRow?.id,
    parentCode: state.treeRow?.id === '-1' ? '' : state.treeRow?.code,
    parentName: state.treeRow?.id === '-1' ? '' : state.treeRow?.name,
    status: "1",
  };
}

// 导出
function showExportExcel() {
  itemjobClassexportExcel().then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function downloadTemplate() {
  exportTemplateExcel('itemJobClassTemplate', 'taskClassify:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '作业分类导入模板')
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
        console.log('删除数据', state.treeRow)
        itemjobClassdel(state.treeRow.id).then((res) => {
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
function openCategoryList() {
  if(state.treeRow.parentId === '-1') return
  selectClassification.value.visible = true

}

function selectClassificationCallback(data) {
    formOrgInfo.data.parentId = formOrgInfo.data.id === data.id ? -2 : data.id || -2
    formOrgInfo.data.parentCode = data.code
    formOrgInfo.data.parentName = data.name
  selectClassification.value.visible = false
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
  const { code } = await itemjobClassenable(state.treeRow.id)
    if (code === 200) {
      proxy.$message.success('启用成功')
      await handleNodeClick(state.treeRow)
    }
}
// 停用
async function Deactivate() {
  if(!state.treeRow) return
  const { code } = await itemjobClassdisable(state.treeRow.id)
    if (code === 200) {
      proxy.$message.success('停用成功')
      await handleNodeClick(state.treeRow)
    }
}

// 点击树节点
async function handleNodeClick(node) {
  console.log(1111111111111, node)
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.treeRow = '';
    state.categoryId = node.id;
    formOrgInfo.data = {}
    selectLoids.value = []
    return;
  }

  formOrgInfo.ref.resetFields();
  state.isAddUpdate = "update";
  state.categoryId = node.id;
  state.treeRow = node;
  selectLoids.value = []
  formOrgInfo.data = JSON.parse(JSON.stringify(node));
  state.saveBtn = false;
  await getDetail();
}
async function getDetail() {
  if(!state?.categoryId) return
  await itemjobClassdetail(state.categoryId).then((res) => {
    formOrgInfo.data = res.data;
    state.saveBtn = res.data.flag === '1';
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
    itemjobClassupdate(formOrgInfo.data).then(async (res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        await search()
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
