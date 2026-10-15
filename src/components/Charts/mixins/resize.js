import { debounce } from '@/utils'

export default function () {
  const {proxy} = getCurrentInstance() 
  const elData = reactive({
    $_sidebarElm: null,
    $_resizeHandler: null
  })

  onMounted(() => {
    initListener()
  })
  onActivated(() => {
    if (!elData.$_resizeHandler) {
      initListener()
    }
    resize()
  })

  onBeforeMount(() => {
    destroyListener()
  })

  onDeactivated(() => {
    destroyListener()
  })

  const $_sidebarResizeHandler = (e) => {
    if (e.propertyName === 'width') {
      elData.$_resizeHandler()
    }
  }
  const initListener = () => {
    elData.$_resizeHandler = debounce(() => {
      resize()
    }, 100)
    window.addEventListener('resize', elData.$_resizeHandler)
    elData.$_sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    elData.$_sidebarElm && elData.$_sidebarElm.addEventListener('transitionend', $_sidebarResizeHandler)
  }
  const destroyListener = () => {
    window.removeEventListener('resize', elData.$_resizeHandler)
    elData.$_resizeHandler = null
    elData.$_sidebarElm && elData.$_sidebarElm.removeEventListener('transitionend', $_sidebarResizeHandler)
  }
  const resize = () => {
    const { chart } = proxy
    chart && chart.resize()
  }
  
}
