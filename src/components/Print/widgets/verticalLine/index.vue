<template>
	<div
	  class="widgets"
	  v-html="val.value"
	  :contenteditable="!!val.isEdit"
	  :style="{
	    position:'absolute',
		left: val.left + 'px' ,
		top:  val.top + 'px',
	    width: 1 + 'px',
	    minHeight: val.height + 'px',
	    zIndex: val.style.zIndex,
	    background: '#000000'
	  }"
	></div>
</template>

<script>
	const WIDGET_NAME = 'braid-verticalLine'
	export default{
		name: WIDGET_NAME,
		setting: {
		  type: WIDGET_NAME,
		  isEdit: true,
		  dragable: true, // 是否可拖拽
		  resizable: true, // 尺寸是否可变
		  width: 2,
		  height: 100,
		  left: 50,
		  top: 0,
		  title: '竖线',
		  value: '',
		  defaultValue: '',
		  name: '',
		  style: {
		    zIndex: 0,
		  },
		},
		props: [
		  'val', // 文本对象
		],
	}
</script>

<style>
</style>
