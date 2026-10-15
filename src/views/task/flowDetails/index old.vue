<template>
  <Details @onClose="onClose" />
</template>

<script setup name="flowDetails">
import Details from '../components/details.vue'
const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()

function onClose() {
  proxy.$fn.setFlowPath(proxy)
}
</script>
