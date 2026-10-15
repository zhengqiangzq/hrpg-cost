<template>
<!--  技术职称-->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header">
          <span class="title">技术职称</span>
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
        <div class="layui-card-body border-style-bottom firstCard">
          <div class="layui-btn-container">
            <div class="rightContainerTitle">基础信息</div>
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

<script setup name="technicalTitle">
import PageForm from "@/components/PageForm/index.vue";
import {
  salaryItemupdateJoinAccounting,
  technicalTitletree, technicalTitledetail
} from "@/api/personnelInfo";
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
      label: "技术职称编码",
      value: "code",
      type: "input",
      disabled: true,
    },
    {
      label: "技术职称名称",
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
  technicalTitletree().then((res) => {
    if (res && res.success) {
      let data = res.data;
      formOrgInfo.data = {};
      treeInfo.data = [
        {
          childList: data,
          code: '',
          name: '技术职称',
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

// 点击树节点
async function handleNodeClick(node) {
  if (["-1"].includes(node.id)) {
    state.saveBtn = true;
    state.addBtn = false;
    state.treeRow = '';
    state.categoryId = node.id;
    return;
  }
  formOrgInfo.fieldList[0].disabled = true;
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
  } else {
    state.saveBtn = true;
    state.RightBox = false;
  }
}
async function getDetail() {
  await technicalTitledetail(state.categoryId).then((res) => {
    formOrgInfo.data = res.data;
    state.saveBtn = res.data.flag === '1';
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
  height: calc(100% - 30px) !important;
  .el-tree {
    width: 100%;
    padding: 0 20px 20px;
    overflow-y: auto;
  }
}
</style>
