<template>
<!--  薪资项目-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header">
          <span class="title">薪资项目</span>
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

<script setup name="salaryItems">
import PageForm from "@/components/PageForm/index.vue";
import {salaryItemtree, salaryItemdetail, salaryItemupdateJoinAccounting} from "@/api/personnelInfo";
const { proxy } = getCurrentInstance();
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: true,
  saveBtn: true,
  addOrUpdate: "",
  RightBox: false,
  categoryId: "",
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
const formOrgInfo = reactive({
  ref: null,
  data: {},
  fieldList: [
    {
      label: "薪资项目编码",
      value: "code",
      type: "input",
      disabled: true,
    },
    {
      label: "薪资项目名称",
      value: "name",
      type: "input",
      disabled: true,
    },
    {
      label: "所属上级编码",
      value: "parentCode",
      type: "input",
      disabled: true,
    },
    {
      label: "所属上级名称",
      value: "parentName",
      type: "input",
      disabled: true,
    },
    {
      label: "是否参与核算",
      value: "joinAccounting",
      type: 'select-model',
      code: 'yes_or_no',
      disabled: false,
    },
    {
      label: "备注",
      value: "remark",
      type: "input",
      disabled: true,
    },
  ],
});


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

onMounted(() => {
  search();
});

function search() {
  salaryItemtree().then((res) => {
    if (res && res.success) {
      let data = res.data;
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          childList: data,
          code: '',
          name: '薪资项目',
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
    if (item.childList && item.childList.length) {
      getNodeId(item.childList, num, count);
    }
  });
}

// 点击树节点
async function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.addBtn = false;
    state.treeRow = '';
    formOrgInfo.data = {};
    state.categoryId = node.id;
    return;
  }
  formOrgInfo.fieldList[0].disabled = true;
  state.addOrUpdate = salaryItemupdateJoinAccounting;
  formOrgInfo.ref.resetFields();
  state.isAddUpdate = "update";
  state.addBtn = false;
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
  await salaryItemdetail(state.categoryId).then((res) => {
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

    state.addOrUpdate({
      id: formOrgInfo.data.id,
      joinAccounting: formOrgInfo.data.joinAccounting
    }).then((res) => {
      if (res.success) {
        proxy.$message.success('保存成功')
        search();
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
  height: calc(100% - 30px) !important;
  .el-tree {
    width: 100%;
    padding: 0 20px 20px;
    overflow-y: auto;
  }
}
</style>
