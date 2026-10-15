<template>
  <!--  服务单元-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">服务单元</span>
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
                  v-model:ref-obj="formOrgInfo.ref"
                  :data="formOrgInfo.data"
                  :field-list="formOrgInfo.fieldList"
                  :rules="formOrgInfo.rules"
                  :label-width="formOrgInfo.labelWidth"
              >
              </page-form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <add-edit
        v-if="state.addBtn"
        :tableRow="state.treeRow"
        :visible="state.addBtn"
        @callback="diaLogeCallback"
    />
  </div>
</template>

<script setup name="DIPCostServiceUnit">
import PageForm from "@/components/PageForm/index.vue";
import { exportTemplateExcel } from '@/api/pub.js'
import {
  addServiceUnit,
  allServiceUnit, deleteServiceUnit,
  exportServiceUnit,
  oneServiceUnit,
  updateServiceUnit
} from "@/api/DIPCost/DIPCostServiceUnit";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import AddEdit from "./AddEdit.vue";

const PERMISSION_CODE = 'DIPCostServiceUnit'
const { proxy } = getCurrentInstance();
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: false,
  saveBtn: true,
  treeRow: '',
  isAddUpdate: "add",
});

// 过滤相关配置
const filterInfo = reactive({
  query: {
    name: "",
  },
});

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: 'DIPCostServiceUnit',
  type: '13108',
  action: '/dip/methodService/serviceUnit/import/excelRecord',
})

const formOrgInfo = reactive({
  ref: null,
  data: {},
  fieldList: [
    {
      label: "服务单元编码",
      value: "code",
      type: "input",
      required: true,
    },
    {
      label: "服务单元名称",
      value: "name",
      type: "input",
      required: true,
      disabled: false,
    },
    {
      label: "备注",
      value: "remark",
      type: "input",
    },
    {
      label: "启用状态",
      value: "status",
      type: 'select-model',
      code: 'enabled_type',
      disabled: false,
    },
  ],
  rules: {
    code: [{ required: true, message: '请填写服务单元编码' }],
    name: [{ required: true, message: '请填写服务单元名称' }],
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
  const delBtn = buttons.value[1]
  delBtn.disabled = !state.treeRow
}, { immediate: true })

initRules();
onMounted(() => {
  search();
});

function search() {
  allServiceUnit({
  }).then((res) => {
    if (res && res.success) {
      let data = res.data || [];
      data = data.sort((a, b) => a.code.localeCompare(b.code))
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          children: data,
          code: '',
          name: '服务单元',
          id: '-1'
        }
      ]
      state.treeRow = ''
      if (filterInfo.query.name) {
        treeInfo.treeData = [];
        getNodeId(data, -1);
      } else {
        treeInfo.treeData = [];
        getNodeId(data, 2);
      }
      handleNodeClick({ id: '-1' })
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
  state.isAddUpdate = "add";
  state.addBtn = true;
  state.treeRow = {
    status: '1',
  };
}

// 导出
function showExportExcel() {
  exportServiceUnit({name: filterInfo.query.name}).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function downloadTemplate() {
  exportTemplateExcel('服务单元导入模板','DIPCostServiceUnit:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '服务单元导入模板')
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
        deleteServiceUnit([state.treeRow.id]).then((res) => {
          if (res.success) {
            search();
            state.isAddUpdate = "add";
            formOrgInfo.data.name = "";
            formOrgInfo.data.code = "";
          }
        });
      })
      .catch(() => {});
}

// 点击树节点
async function handleNodeClick(node) {
  formOrgInfo.data = {};
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.treeRow = '';
    state.id = node.id;
    buttons.value[1].disabled = true;
    return;
  }

  formOrgInfo.ref.resetFields();
  state.isAddUpdate = "update";
  state.treeRow = node;
  state.saveBtn = false;
  state.id = node.id;
  await getDetail();
}
async function getDetail() {
  if (["-1"].includes(state.traceId)) {
    return;
  }
  await oneServiceUnit(state.id).then((res) => {
    formOrgInfo.data = res.data;
    formOrgInfo.fieldList[0].disabled = true;
    formOrgInfo.fieldList[1].disabled = formOrgInfo.fieldList[2].disabled = res.data.status === '1';
  });
}

function diaLogeCallback(flag) {
  if (flag) {
    state.id = null;
    search()
  } else {
    state.addBtn = false
  }
}
async function update() {
  formOrgInfo.ref.validate((valid) => {
    if (valid) {
      updateServiceUnit(formOrgInfo.data).then((res) => {
        if (res.success) {
          proxy.$message.success('保存成功')
          search();
        }
      });
    }
  });
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
