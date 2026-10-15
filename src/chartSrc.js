insertChartJs('/Chart.bundle.min.js')
setTimeout(() => {
  insertChartJs('/chartjs-plugin-datalabels.min.js')
}, 200)
function insertChartJs(_src) {
  var head =
    document.head ||
    document.getElementsByTagName('head')[0] ||
    document.documentElement

  var JS3 = document.createElement('script')
  JS3.src = _src
  head.insertBefore(JS3, head.firstChild)
}
