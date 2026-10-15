import { ElMessage } from 'element-plus'

export function printWithUrl(url) {
  // 设置iframe样式
  let frameKey = 'fremekey-print-base'
  // 如果存在则删除
  if (window.parent.document.getElementById(frameKey)) {
    window.parent.document.body.removeChild(
      window.parent.document.getElementById(frameKey)
    )
  }
  let _iframe = window.parent.document.createElement('iframe')
  _iframe.setAttribute('id', frameKey)
  _iframe.setAttribute('name', frameKey)
  _iframe.setAttribute(
    'style',
    'position:absolute;width:0px;height:0px;left:-500px;top:-500px;'
  )
  window.parent.document.body.appendChild(_iframe)
  const iframe = window.parent.frames[frameKey]
  let fileFrameDom = window.parent.document.getElementById(frameKey)
  let iframeLoadErrow = function () {
    ElMessage.warning('打印失败，请联系管理员')
  }
  let iframeLoad = function (e) {
    try {
      iframe.window.focus()
      iframe.window.print()
    } catch (error) {
      console.log(error)
      iframeLoadErrow()
    }
  }
  if (!fileFrameDom.addEventListener) {
    fileFrameDom.attachEvent('onload', iframeLoad)
  }
  fileFrameDom.addEventListener('load', iframeLoad, true)
  iframe.window.addEventListener('error', iframeLoadErrow, true)
  iframe.window.focus()
  console.log(url)
  iframe.location.href = url
}
