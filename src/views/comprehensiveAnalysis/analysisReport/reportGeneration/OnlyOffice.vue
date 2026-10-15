<script setup>
import {getCurrentInstance, onMounted} from "vue";

const store = useStore()
const { proxy } = getCurrentInstance()

const props = defineProps({
  option: {
    type: Object,
    default: '',
  },
})

const docEditor = ref(null)
const _option = computed(
    () => props.option,
    () => {
      return props.option
    }
)

watch(
    _option.value,
    (val, oldVal) => {
      proxy.$nextTick(() => {
        setEditor(_option.value)
      })
    },
    {
      immediate: true,
      deep: true,
    }
)
onMounted(() => {
  getMain()
})

const user = ref(store.state.user.userInfo)
function setEditor(option) {
  let config = {
    document: {
      fileType: 'docx',
      key: option.key || Math.floor(Math.random() * 1000) + 1 + '',
      title: option.title,
      codePage: 65001,
      permissions: {
        comment: true,
        download: true,
        modifyContentControl: true,
        modifyFilter: true,
        print: true,
        edit: option.isEdit,
        fillForms: true,
        review: true,
      },
      url: option.url,
    },
    documentType: 'text',
    editorConfig: {
      // 编辑word后保存时回调的地址，这个api需要自己写了，将编辑后的文件通过这个api保存到自己想要的位置
      callbackUrl: option.editUrl,
      lang: 'zh',
      customization: {
        commentAuthorOnly: false,
        comments: true,
        compactHeader: false,
        compactToolbar: true,
        feedback: false,
        plugins: true,
        //强制保存
        forcesave: true,
        // 聊天图标
        chat: false,
        // -2页面自动缩放到和编辑器等宽（不留缝隙） -1适应屏幕 以及1-100缩放比例
        zoom: -2,
        autosave: false,
        // customer和logo等其它属性 非商业版不起作用
        // customer: {
        //   name: 'SLP',
        //   address: '成都市武侯区',
        //   mail: 'email',
        //   www: 'baidu.com',
        //   info: '主要信息',
        // },
      },
      user: {
        id: user.value.id,
        name: user.value.nickName,
      },
      // 是否可以编辑 view edit
      mode: option.mode,
    },
    width: '100%',
    height: '100%',
    token: option.token,
    events: {
      onDocumentReady: onDocumentReady,
      onAppReady: onAppReady,
    },
  }

  try {
    if (docEditor.value) {
      docEditor.value.destroyEditor()
    }
    docEditor.value = new DocsAPI.DocEditor('editorDiv', config)
  } catch (error) {
    console.log(error)
  }
}
function onAppReady() {
}

function onDocumentReady() {
}

function getMain() {

}
</script>

<template>
  <div id="editorDiv"></div>
</template>

<style scoped lang="scss">

</style>
