<template>
  <div class="app-container">
    <div class="flow-task">
      <FlowTitle
        :flowInfo="flowInfo"
        :operationList="operationList"
        :currentPage="currentPage"
        @handlerOperation="handlerOperation"
        @radioChange="radioChange"
        @onClose="onClose"
      />
      <el-form
        ref="form"
        class="full-width-input"
        style="width: 100%"
        label-width="100px"
        size="small"
        label-position="right"
        @submit.native.prevent
      >
        <!-- 表单信息 -->
        <div
          v-show="currentPage === 'formInfo'"
          :key="formKey"
          class="formHeight"
        >
          <!-- 涉及到流程的组件页面请保持一致，统一改造业务单据用ID进行传值，不再使用tableRow,orderId等进行传参 -->
          <component
            v-if="detailInfo.id"
            ref="detailInfoComponent"
            :key="detailInfo.id"
            :is="detailInfo.name"
            :id="detailInfo.id"
            :flowFormType="detailInfo.bussinessType"
            @returnModify="onClose"
          ></component>
        </div>
        <!-- 流程图 -->
        <div v-show="currentPage === 'flowProcess'" class="formHeight noAuto">
          <ProcessViewer
            :xml="processXml"
            :finishedInfo="finishedInfo"
            :allCommentList="flowTaskCommentList"
            :processInstanceId="route.query.processInstanceId"
            style="height: 100%"
          />
        </div>
      </el-form>
    </div>
    <el-dialog draggable
      :title="dialogTitle"
      v-model="dialogVisible"
      append-to-body
      :width="600"
      :before-close="beforeClose"
    >
      <el-form
        :model="formAudit"
        ref="form"
        label-width="80px"
        :rules="formRules"
        style="width: 100%"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              v-if="currentOperation.type === 'reject'"
              label="驳回节点"
              prop="taskKey"
            >
              <el-select
                v-model="formAudit.taskKey"
                placeholder="请选择驳回节点"
              >
                <el-option
                  v-for="item in nodeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <!-- 根据传递过来的数据顺序和字段按照规则依次循环遍历出各个输入框 -->
            <el-form-item label="审批意见" prop="comment">
              <el-input
                v-model.trim="formAudit.comment"
                type="textarea"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="" @click="beforeClose">取消</el-button>
          <el-button type="primary" @click="submitFormObj">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TaskDetails">
import {
  getViewRuntimeTaskInfo,
  submitUserTask,
  getBusinessKeyByProcessInstance,
  getProcessBpmn,
  viewHighlightFlowData,
  listFlowTaskComment,
  getFormComponent,
  getProcessAllTasks,
} from '@/api/flowable'
// 流程头部标题组件
const FlowTitle = defineAsyncComponent(() => import('./flowTitle/index'))
const route = useRoute()
const { proxy } = getCurrentInstance()
const emits = defineEmits()

//明细相关
const detailInfo = ref({
  // 表单ID 通过获取表单ID回显表单具体信息
  id: '',
  // 组件名称
  name: '',
  // 表单不同节点类型
  bussinessType: '',
})
const formKey = new Date().getTime()
const currentPage = ref('formInfo')
// 表单是否允许编辑
const formDisabled = ref(true)
const dialogVisible = ref(false)
const dialogTitle = ref('审核')
const formAudit = ref({
  comment: '',
  taskKey: '',
})
const formRules = ref({
  taskKey: [{ required: true, trigger: 'change', message: '请选择驳回节点' }],
})
const nodeOptions = ref([])
const flowInfo = ref({
  taskName: route.query.taskName,
  processDefinitionName: route.query.processDefinitionName,
  processInstanceInitiator: route.query.processInstanceInitiator,
})
const processXml = ref('')
// 完成节点信息
const finishedInfo = ref({})
// 审批历史
const flowTaskCommentList = ref([])
// 当前任务节点操作列表
const operationList = ref([])
// 当前点击按钮对象
const currentOperation = ref({})
// 请求参数
let formParams = ref({
  processInstanceId: '',
})
// 需传递给后端的额外数据
const variableList = ref([])
// 当前节点
const currentTaskKey = ref('')

watch(
  () => route.query,
  (val) => {
    refreshView()
  },
  {
    deep: true,
    immediate: true,
  }
)

// 刷新页面
function refreshView() {
  if (route.query.processInstanceId) {
    formParams.value.processInstanceId = route.query.processInstanceId
    // 获得流程实例审批路径
    viewHighlightFlowData(formParams.value).then((res) => {
      finishedInfo.value = res.data
    })
    // 获取流程实例审批历史
    listFlowTaskComment(formParams.value).then((res) => {
      flowTaskCommentList.value = res.data
    })
    getFormComponent({
      processInstanceId: route.query.processInstanceId,
      taskId: route.query.taskId,
    }).then((res) => {
      const pcRouter = res.data.pcRouter
      const obj = proxy.$fn.getComponentsData(pcRouter)
      detailInfo.value.name = obj.name
      detailInfo.value.bussinessType = obj.bussinessType || 'defaultFlowType'
    })
    // 获取表单ID
    getBusinessKeyByProcessInstance(formParams.value).then((res) => {
      detailInfo.value.id = res.data
    })
  }
  if (route.query.processDefinitionId) {
    //  获得流程XML
    getProcessBpmn({
      processDefinitionId: route.query.processDefinitionId,
    }).then((res) => {
      processXml.value = res.data
    })
  }
  // 待办任务页面进入
  if (route.query.taskId) {
    const params = {
      processInstanceId: route.query.processInstanceId,
      processDefinitionId: route.query.processDefinitionId,
      taskId: route.query.taskId,
    }
    // 获取操作按钮
    getViewRuntimeTaskInfo(params).then((res) => {
      currentTaskKey.value = res.data.taskKey
      operationList.value = res.data.operationList
      formDisabled.value = res.data.readOnly
      variableList.value = res.data.variableList || []
    })
  }
}
// 头部tab栏点击
function radioChange(data) {
  currentPage.value = data
}
// 自定义操作按钮执行事项
async function handlerOperation(val) {
  let tempBool = true
  console.log(val.type)
  if (val.type === 'agree') {
    tempBool = proxy.$refs.detailInfoComponent.submitForm
      ? await proxy.$refs.detailInfoComponent.submitForm()
      : true
  }
  if (!tempBool) {
    proxy.$message.warning('请按照提示填写所有数据')
    return
  }
  currentOperation.value = val
  if (val.type === 'reject') {
    //  获得已审批节点
    getProcessAllTasks({
      processInstanceId: route.query.processInstanceId,
      taskId: route.query.taskId,
    }).then((res) => {
      nodeOptions.value = res.data
      if (nodeOptions.value?.length > 0) {
        formAudit.value.taskKey = nodeOptions.value[0].id
      }
    })
  } else if (val.type === 'save' || val.type === 'submit') {
    submitRejectForm(val.type)
    return
  }
  dialogTitle.value = val.label
  dialogVisible.value = true
}
// 点击操作按钮执行方法(非保存和提交按钮)
function submitFormObj() {
  proxy.$refs.form.validate(async (valid) => {
    if (valid) {
      const formInfoData = (await proxy.$refs.detailInfoComponent
        .getFlowFormInfo)
        ? await proxy.$refs.detailInfoComponent.getFlowFormInfo()
        : null
      const params = {
        flowTaskCommentDto: {
          approvalType: currentOperation.value.type,
          comment: formAudit.value.comment,
          taskKey: formAudit.value.taskKey,
        },
        processInstanceId: route.query.processInstanceId,
        taskId: route.query.taskId,
        orderData: formInfoData,
      }
      submitUserTask(params).then((res) => {
        if (res.success) {
          proxy.$message.success('提交成功')
          beforeClose()
          onClose()
        }
      })
    }
  })
}
// 点击操作按钮执行方法(保存和提交按钮)
async function submitRejectForm(btnType) {
  const params = {
    processInstanceId: route.query.processInstanceId,
    taskId: route.query.taskId,
  }
  if (btnType === 'save') {
    if (!proxy.$refs.detailInfoComponent.save) {
      proxy.$message.warning('请检查流程设计表单绑定是否正确，该表单无保存方法')
      return
    }
    proxy.$refs.detailInfoComponent.save()
  } else if (btnType === 'submit') {
    if (!proxy.$refs.detailInfoComponent.saveAndSubmit) {
      proxy.$message.warning('请检查流程设计表单绑定是否正确，该表单无提交方法')
      return
    }
    proxy.$refs.detailInfoComponent.saveAndSubmit(params)
  }
}
function beforeClose() {
  proxy.$refs.form?.resetFields()
  dialogVisible.value = false
}
function onClose() {
  emits('onClose')
}
</script>

<style scoped>
.flow-task {
  position: relative;
}
.formHeight {
  height: calc(100vh - 164px);
  overflow: auto;
}
.formHeight.noAuto {
  overflow: hidden;
}
</style>
