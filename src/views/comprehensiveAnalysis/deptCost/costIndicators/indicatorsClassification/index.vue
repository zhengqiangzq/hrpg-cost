<template>
<!-- 指标分类 -->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header border-style-bottom">
          <span class="title">指标分类</span>
          <!-- 按钮 -->
          <TreeButtons
              :filterBtn="buttons"
          >
            <template v-slot:filter-uploadFile>
              <el-upload
                  :headers="uploadInfo.headers"
                  :show-file-list="false"
                  :on-success="uploadSuccess"
                  v-model:file-list="uploadInfo.fileList"
                  :on-error="uploadError"
                  :before-upload="beforeUpload"
                  :action="uploadInfo.action"
              >
                <div class="dropdownSlotCss">导入</div>
              </el-upload>
            </template>
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
      <div class="right-container" v-show="!state.saveBtn">
        <div class="layui-card-body">
          <div class="layui-btn-container border-style-bottom">
            <el-button
                v-if="$permission(`${PERMISSION_CODE}:update`)"
                type="primary"
                class="el-button el-button--medium filter-button"
                :disabled="state.saveBtn || formOrgInfo.data.builtIn === '1'"
                @click="update"
            >{{ $t("btn_save") }}</el-button
            >
          </div>
          <div class="model-panel">
            <div class="model-panel-title">
              <p>基础信息</p>
            </div>
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
  </div>
</template>

<script setup>
import PageForm from "@/components/PageForm/index.vue";
import { exportTemplateExcel } from '@/api/pub.js'
import {ElLoading} from "element-plus";
import {getToken} from "@/utils/auth";
import {
  addIndicatorsClassification,
  deleteIndicatorsClassification,
  exportIndicatorsClassification,
  treeIndicatorsClassification,
  updateIndicatorsClassification
} from "@/api/deptCost/indicatorsClassification";
import {deepClone} from "@/utils";

const PERMISSION_CODE = 'deptCost:indicatorsClassification'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance();
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: true,
  saveBtn: true,
  addOrUpdate: "",
  RightBox: false,
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
const subsysAndUrl = ref(proxy.$fn.getSubsysAndUrl())
//导入相关配置
const uploadInfo = ref({
  action:
      import.meta.env.VITE_APP_BASE_API + '/deptCost/deptIndicatorsClassification/import/excel',
  headers: {
    Authorization: getToken(),
    'x-auth-token': getToken(),
    btnCode: 'deptCost:indicatorsClassification:import',
    'systemName': subsysAndUrl.value?.systemName || -2,
    'systemCode': subsysAndUrl.value?.systemCode || -2,
    'routeCode': subsysAndUrl.value?.routeCode || -2,
  },
  loading: {},
})

const formOrgInfo = reactive({
  ref: null,
  data: {},
  fieldList: [
    {
      label: "指标分类编码",
      value: "code",
      type: "input",
      required: true,
    },
    {
      label: "指标分类名称",
      value: "name",
      type: "input",
      required: true,
      disabled: false,
    },
    {
      label: "所属上级分类编码",
      value: "parentCode",
      type: "input",
      disabled: true,
    },
    {
      label: "所属上级分类名称",
      value: "parentName",
      type: "input",
      disabled: true,
    },
    {
      label: "备注",
      value: "remark",
      type: "input",
    },
    {
      label: "启用状态",
      value: "enabledStatus",
      type: 'select-model',
      code: 'enabled_type',
      disabled: true,
    },
  ],
  rules: {
    code: [{ required: true, message: '请填写指标分类编码' }],
    name: [{ required: true, message: '请填写指标分类名称' }],
    parentCode: [{ required: true, message: '请选择上级分类' }],
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
    show: proxy.$permission(`${PERMISSION_CODE}:enable`),
    type: 'button',
  },
  {
    label: '下载模版',
    event: downloadTemplate,
    show: proxy.$permission(`${PERMISSION_CODE}:download`),
    type: 'button',
  },
  {
    type: 'slot',
    value: 'uploadFile',
    show: proxy.$permission(`${PERMISSION_CODE}:import`),
  },
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
    children: "childList",
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
  const delBtn = buttons.value[1]
  const EnableBtn = buttons.value[2]
  const DeactivateBtn = buttons.value[3]
  delBtn.disabled = !state.treeRow || state.treeRow.builtIn === '1'
  EnableBtn.disabled = state.treeRow ? rows.enabledStatus === '1' : true
  DeactivateBtn.disabled = state.treeRow ? rows.enabledStatus !== '1' : true
  formOrgInfo.fieldList[1].disabled = state.treeRow.parentId === '-1' && rows.parentId === state.treeRow.parentId;
}, { immediate: true })

initRules();
onMounted(() => {
  search();
});

function search() {
  treeIndicatorsClassification().then((res) => {
    if (res && res.success) {
      let data = res.data;
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          childList: data,
          code: '',
          name: '指标分类',
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
    if (item.childList && item.childList.length) {
      getNodeId(item.childList, num, count);
    }
  });
}
// 初始化校验规则
function initRules() {
  formOrgInfo.rules = proxy.$initRules(formOrgInfo.fieldList);
}
function addClass() {
  state.addOrUpdate = addIndicatorsClassification;
  state.isAddUpdate = "add";
  state.RightBox = false;
  formOrgInfo.data = {};
  let parent = proxy.$refs.menuTree.getCurrentNode() || {};
  state.saveBtn = false;
  formOrgInfo.data = {
    parentId: parent.id === '-1' ? '' : parent.id,
    parentCode: parent.id === '-1' ? '' : parent.code,
    parentName: parent.id === '-1' ? '' : parent.name,
    enabledStatus: '1'
  };
  formOrgInfo.fieldList[0].disabled = false;
}

// 导出
function showExportExcel() {
  exportIndicatorsClassification({name: filterInfo.query.name}).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
}

function downloadTemplate() {
  exportTemplateExcel('indicatorsClassificationTemplate','deptCost:indicatorsClassification:download').then((res) => {
    if (res) {
      proxy.$fn.parseExcel(res, '指标分类导入模板')
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
        deleteIndicatorsClassification([state.treeRow.id]).then((res) => {
          if (res.success) {
            search();
            proxy.$refs.menuTree.setCurrentKey(null)
            state.isAddUpdate = "add";
            formOrgInfo.data = {
              enabledStatus: '1'
            };
          }
        });
      })
      .catch(() => {});
}

// 启用
async function Enable() {
  if(!state.treeRow) return
  const { data, success } = await updateIndicatorsClassification({ ...state.treeRow, enabledStatus: '1' })
    if (success) {
      proxy.$message.success('启用成功')
      search()
      handleNodeClick({ id: '-1' })
    }
}
// 停用
async function Deactivate() {
  if(!state.treeRow) return
  const { data, success } = await updateIndicatorsClassification({ ...state.treeRow, enabledStatus: '0' })
    if (success) {
      proxy.$message.success('停用成功')
      search()
      handleNodeClick({ id: '-1' })
    }
}

// 点击树节点
async function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.addBtn = false;
    state.treeRow = '';
    buttons.value[1].disabled = true;
    buttons.value[2].disabled = true;
    buttons.value[3].disabled = true;
    return;
  }
  formOrgInfo.fieldList[0].disabled = true;

  formOrgInfo.ref.resetFields();
  state.isAddUpdate = "update";
  state.addBtn = false;
  state.addOrUpdate = updateIndicatorsClassification;
  state.treeRow = node;
  formOrgInfo.data = {};
  if (node.id !== "-1") {
    state.saveBtn = false;
    formOrgInfo.data = deepClone(node)
    state.RightBox = true;
  } else {
    state.saveBtn = true;
    state.RightBox = false;
  }
}
async function update() {
  let flag = 0;
  await formOrgInfo.ref.validate((valid) => {
    if (valid) {
      flag++;
    }
  });
  if (flag == 1) {
    state.addOrUpdate(formOrgInfo.data).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        search();
      }
    });
  }
}



function beforeUpload(file) {
  //发生请求时打开加载动画
  uploadInfo.value.loading = ElLoading.service({
    fullscreen: true,
    background: 'rgba(255,255,255,.4)',
  })
  let fileType = ['xlsx']
  let fileSize = proxy.$store.state.permission.systemConfig.max_file_size
  let isFileType = fileType.some(
      (type) => file.name.split('.')[file.name.split('.').length - 1] === type
  )
  const isLt = file.size / 1024 / 1024 < fileSize
  if (!isFileType) {
    proxy.$message.error({
      message: `文件格式不正确, 请上传 ${fileType.join(' / ')} 格式文件!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.value.loading.close()
    return false
  }
  if (!isLt) {
    proxy.$message.error({
      message: `上传文件大小不能超过 ${fileSize} MB!`,
      showClose: true,
      duration: 3500,
    })
    uploadInfo.value.loading.close()
    return false
  }
  return isFileType && isLt
}
function uploadSuccess(resp) {
  uploadInfo.value.loading.close()
  if (resp && resp.success) {
    proxy.$message.success({
      duration: 3000,
      showClose: true,
      message: '操作成功',
    })
    search();
  } else {
    proxy.$message.error({
      message: resp.msg,
      duration: 3000,
      showClose: true,
    })
  }
}
function uploadError(err) {
  if (err) {
    proxy.$message.error({
      message: JSON.parse(err.message).msg || '系统错误',
      duration: 3000,
      showClose: true,
    })
  }
  uploadInfo.value.loading.close()
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
