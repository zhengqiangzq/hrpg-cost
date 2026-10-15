<template>
  <div class="page-filter newFilter" :class="className">
    <div
        v-for="(item, index) in showFilterList"
        v-show="index < hideNum"
        :key="item.value || index"
        class="filter-item filter-search-item"
    >
      <!-- max-width 100  -->
      <!-- solt -->
      <template v-if="item.type === 'slot'">
        <label v-if="item.showLabel" class="filter-label" :class="{required: item.required, labelClass: index === 0 && showFilterList.length < 3  ? 'labelAuto' : item.labelClass}">
          {{item.label}}</label>
        <span v-if="item.showLabel">：</span>
        <slot :name="'filter-' + item.value" />
      </template>
      <!-- 输入框 -->
      <template v-else>
        <label
            class="filter-label"
            :class="{ required: item.required, labelClass: index === 0 && showFilterList.length < 3  ? 'labelAuto' : item.labelClass }"
            v-if="item.label && item.type != 'button'"
        >{{ item.label }}</label
        >
        <span v-if="item.label && item.type != 'button'" class="colon">：</span>
        <el-input
            v-if="item.type === 'input'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.type}`"
            :disabled="item.disabled ? item.disabled : false"
            :clearable="item.clearable === false ? item.clearable : true"
            @keyup.enter="item.event || (() => {})"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
        />
        <el-input
            v-if="item.type === 'textarea'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.type}`"
            :disabled="item.disabled ? item.disabled : false"
            :clearable="item.clearable === false ? item.clearable : true"
            @keyup.enter="item.event || (() => {})"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
        />
        <!-- 查询框 -->
        <el-input
            v-if="item.type === 'search'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.type}`"
            :disabled="item.disabled ? item.disabled : false"
            @keyup.enter="item.event || (() => {})"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
        >
          <el-button
              slot="append"
              :icon="Search"
              @click="item.event"
          ></el-button>
        </el-input>
        <el-checkbox
            v-if="item.type === 'checkbox'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.type}`"
            :disabled="item.disabled"
            @change="item.event"
        ></el-checkbox>
        <!-- 选择框 -->
        <el-select
            v-if="item.type === 'select'"
            v-model="searchQuery[item.asValue ? item.asValue : item.value]"
            :class="`filter-${item.type}`"
            :disabled="item.disabled"
            :multiple="item.multiple"
            :clearable="item.clearable === false ? item.clearable : true"
            filterable
            @visible-change="visibleChange($event, item.list)"
            :filterMethod="filterMethod"
            collapse-tags
            @change="item.event"
        >
          <el-option
              v-for="(childItem, childIndex) in listTypeOptionsInfo[item.list]"
              :key="childItem.key"
              :label="
              childItem.key.length > 20
                ? childItem.key.substring(0, 20) + '...'
                : childItem.key
            "
              :value="childItem.value"
          />
        </el-select>

        <!-- 自定义下拉框 -->
        <slip-select
            v-if="item.componentType === 'slip-select'"
            v-model:modelValue="
            searchQuery[item.asValue ? item.asValue : item.value]
          "
            :class="`filter-${item.componentType}`"
            value-key="value"
            :api="item.api"
            :query="item.query"
            :default-value="item.defaultValue"
            :key-field="item.keyField"
            :value-field="item.valueField"
            :isArrays="item.isArrays"
            :keyNameField="item.keyNameField"
            :divisionName="item.divisionName"
            :accountAttribute="item.accountAttribute"
            :sectionAttributeNot="item.sectionAttributeNot"
            :diseaseAccountStatus="item.diseaseAccountStatus"
            :clearable="item.clearable === false ? item.clearable : true"
            :filterable="item.filterable === false ? item.filterable : true"
            :disabled="item.disabled"
            :multiple="item.multiple"
            :clear-type="clearType"
            :isMaterialDrug="isMaterialDrug"
            :slip-select-request="slipSelectRequest"
            @changeValue="item.event"
        />

        <!--字典选择框-->
        <select-model
            v-if="item.type === 'select-model'"
            v-model:modelValue="
            searchQuery[item.asValue ? item.asValue : item.value]
          "
            :class="`filter-${item.type}`"
            :type-code="item.code"
            :disabled="item.disabled"
            :clearable="item.clearable === false ? item.clearable : true"
            :check-default="item.checkDefault ? item.checkDefault : false"
            :only-show-option="item.onlyShowOption"
            :multiple="item.multiple"
            @change="item.event"
        />

        <!-- 时间选择框 -->
        <el-time-select
            v-if="item.type === 'time'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.type}`"
            :disabled-date="
            item.TimePickerOptions && item.TimePickerOptions.disabledDate
          "
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
        />
        <!-- 日期选择框 -->
        <el-date-picker
          v-if="item.type === 'date'"
          v-model="searchQuery[item.value]"
          :class="`filter-${item.type}`"
          :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
          type="date"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="item.event"
        />
        <el-date-picker
          v-if="item.type === 'daterange'"
          v-model="timeInfo[item.value]"
          :class="`filter-${item.type}`"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="至"
          :shortcuts="$fn.pickerOptionsFn()"
          align="right"
          :start-placeholder="item.label + '开始日期'"
          :end-placeholder="item.label + '结束日期'"
          @change="timeChange($event, item.value, item.timeArr)"
        ></el-date-picker>
        <el-date-picker
            v-if="item.type === 'dateTime'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.type}`"
            :disabled-date="
            item.datePickerOptions && item.datePickerOptions.disabledDate
          "
            type="datetime"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="item.defaultTime"
            @change="item.event"
        />
        <el-date-picker
          v-if="item.componentType === 'datetimerange'"
          v-model="timeInfo[item.value]"
          :class="`filter-${item.componentType}`"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          :shortcuts="$fn.pickerOptionsFn()"
          align="right"
          :default-time="[
            new Date(2000, 1, 1, 0, 0, 0),
            new Date(2000, 1, 1, 23, 59, 59),
          ]"
          :start-placeholder="item.label + '开始日期'"
          :end-placeholder="item.label + '结束日期'"
          @change="timeChange($event, item.value, item.timeArr)"
        ></el-date-picker>
        <el-input
          v-if="item.componentType === 'select-user'"
          v-model="userInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #suffix>
            <el-icon @click="checkUser(item)"><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-supplier'"
          v-model="supplierInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkSupplier(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-product'"
          v-model="productInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkProduct(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-use-status'"
          v-model="selectUseStatusInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkUserStatus(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-dept'"
          v-model="selectDeptInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkDept(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-device-type'"
          v-model="selectDeviceTypeInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkDevice(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-finance-type'"
          v-model="selectFinanceTypeInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #suffix>
            <el-icon @click="checkFinance(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-asset-classify-type'"
          v-model="selectAssetClassifyTypeInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkClassify(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-patrol-route'"
          v-model="selectPatrolRouteInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkPatrolRoute(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-maintenance'"
          v-model="selectMaintenanceInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkMaintenance(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-repair-user'"
          v-model="selectRepairUserInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkRepairUser(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-maintenance-user'"
          v-model="selectMaintenanceUserInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkMaintenanceUser(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-shelf-no'"
          v-model="selectCargoSpaceInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkShelfNo(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-product-class'"
          v-model="productClassificationInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkProductClass(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="item.componentType === 'select-tree-data'"
          v-model="selectTreeDataInfo.data[item.value]"
          class="not-mongolia"
          type="input"
          :required="true"
          :disabled="true"
        >
          <template #append>
            <el-icon @click="checkMaterialFinancialClassify(item)">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </template>
    </div>
    <div class="filter-btn" :style="{ marginLeft: !showFilterList?.length ? 0 : 'auto' }">
      <div
          v-for="(item, index) in getConfigList('btn')"
          :key="index"
          class="filter-item"
      >
        <template v-if="item.type === 'slot'">
          <slot :name="'filter-' + item.value" />
        </template>
        <!-- 按钮 -->
        <el-button
            v-else-if="item.type === 'button'"
            :class="[
            `filter-${item.type}`,
            item.label === '删除' ? 'deleteBtnLight' : '',
          ]"
            :type="getItemType(item)"
            :icon="iconMap[item.label] || item.icon"
            :disabled="setBtnDisabled(item.disabled)"
            @click="item.event"
        >{{ item.label }}</el-button
        >
      </div>
      <span v-if="showFilterList.length > custom_search_box_num" class="defaultSize curPointer" @click="moreFilterList">更多</span>
      <el-icon
          v-if="showFilterList.length > custom_search_box_num"
          class="slip-edit defaultSize"
          @click="moreFilterList"
      >
        <ArrowDown v-if="hideNum === custom_search_box_num" />
        <ArrowUp v-else />
      </el-icon>
    </div>
    <slot name="modelTips" />
    <!-- <el-icon
      v-if="getConfigList('search').length > 7"
      class="slip-edit"
      :class="hideNum === 7 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
      @click="moreFilterList"
    > -->

  </div>
  <SelectTableData
      v-if="tableInfo.visible"
      v-model:showDialog="tableInfo.visible"
      :query="tableInfo.query"
      :title="tableInfo.title"
      :api="tableInfo.api"
      :pager="tableInfo.pager"
      :modelType="tableInfo.type"
      :check-box="tableInfo.checkBox"
      :fieldList="tableInfo.fieldList"
      :checkedList="tableInfo.checkedList"
      :filterInfoList="tableInfo.filters"
      :no-search="tableInfo.noSearch"
      highlight-row
      @callback="tableCallback"
  ></SelectTableData>
  <!--  公用tree弹框-->
  <SelectTreeData
      v-if="treeInfo.visible"
      v-model:showDialog="treeInfo.visible"
      :title="treeInfo.title"
      :checkStrictly="treeInfo.checkStrictly"
      :isLeaf="treeInfo.isLeaf"
      :query="treeInfo.query"
      :str="treeInfo.str"
      :checkBox="treeInfo.checkBox"
      :saveEmpty="treeInfo.saveEmpty"
      :defaultProps="treeInfo.defaultProps"
      :checkedList="treeInfo.checkedList"
      :api="treeInfo.api"
      :highlight-current="true"
      @callback="treeCallback"
  />
  <SelectTreeTableData
      v-if="periodInfo.visible"
      v-model:showDialog="periodInfo.visible"
      @callback="periodCallback"
  ></SelectTreeTableData>
  <page-dialog
    v-show="dialogFilterVisible"
    :title="dialogInfo.title"
    v-model:visible="dialogFilterVisible"
    :width="dialogInfo.width"
    :bt-list="dialogInfo.btList"
  >
    <div class="page-filter" :class="className">
      <div
        v-for="(item, index) in showFilterList"
        :key="item.value || index"
        class="filter-item && filter-item-width"
      >
        <!-- max-width 100  -->
        <label
          class="filter-label"
          v-if="item.type !== 'button' && item.label"
          >{{ item.label }}</label
        >
        <span v-if="item.label">：</span>
        <!-- solt -->
        <template v-if="item.slot">
          <slot :name="'filter-' + item.value" />
        </template>
        <!-- 输入框 -->
        <template v-else>
          <el-input
            v-if="item.componentType === 'input'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled ? item.disabled : false"
            :clearable="item.clearable === false ? item.clearable : true"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
          />
          <el-input
            v-if="item.componentType === 'textarea'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled ? item.disabled : false"
            :clearable="item.clearable === false ? item.clearable : true"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
          />
          <!-- 查询框 -->
          <el-input
            v-if="item.componentType === 'search'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled ? item.disabled : false"
            @input="(e) => (searchQuery[item.value] = validSe(e))"
          >
            <el-button slot="append" :icon="Search"></el-button>
          </el-input>
          <!-- 选择框 -->
          <el-select
            v-if="item.componentType === 'select'"
            v-model="searchQuery[item.asValue ? item.asValue : item.value]"
            :class="`filter-${item.componentType}`"
            :disabled="item.disabled"
            :multiple="item.multiple"
            :clearable="item.clearable === false ? item.clearable : true"
            :filterable="item.filterable === false ? item.filterable : true"
            @visible-change="visibleChange($event, item.list)"
            :filterMethod="filterMethod"
          >
            <el-option
              v-for="(childItem, childIndex) in listTypeOptionsInfo[item.list]"
              :key="childItem.key"
              :label="
                childItem.key.length > 20
                  ? childItem.key.substring(0, 20) + '...'
                  : childItem.key
              "
              :value="childItem.value"
            />
          </el-select>
          <!-- 时间选择框 -->
          <el-time-select
            v-if="item.componentType === 'time'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
          />
          <!-- 日期选择框 -->
          <el-date-picker
            v-if="item.componentType === 'date'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="date"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
          <el-date-picker
            v-if="item.componentType === 'month'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="month"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
          <el-date-picker
            v-if="item.componentType === 'daterange'"
            v-model="timeInfo[item.value]"
            :class="`filter-${item.componentType}`"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="至"
            :shortcuts="$fn.pickerOptionsFn()"
            align="right"
            :start-placeholder="item.label + '开始日期'"
            :end-placeholder="item.label + '结束日期'"
            @change="timeChange($event, item.value, item.timeArr)"
          ></el-date-picker>
          <el-date-picker
            v-if="item.componentType === 'dateTime'"
            v-model="searchQuery[item.value]"
            :class="`filter-${item.componentType}`"
            :disabled-date="
              item.datePickerOptions && item.datePickerOptions.disabledDate
            "
            type="datetime"
            :clearable="item.clearable === false ? item.clearable : true"
            :disabled="item.disabled"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="item.defaultTime"
          />
          <el-date-picker
            v-if="item.componentType === 'datetimerange'"
            v-model="timeInfo[item.value]"
            :class="`filter-${item.componentType}`"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            :shortcuts="$fn.pickerOptionsFn()"
            align="right"
            :default-time="[
              new Date(2000, 1, 1, 0, 0, 0),
              new Date(2000, 1, 1, 23, 59, 59),
            ]"
            :start-placeholder="item.label + '开始日期'"
            :end-placeholder="item.label + '结束日期'"
            @change="timeChange($event, item.value, item.timeArr)"
          ></el-date-picker>
          <el-input
            v-if="item.componentType === 'select-user'"
            v-model="userInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkUser(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-supplier'"
            v-model="supplierInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkSupplier(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-product'"
            v-model="productInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkProduct(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-use-status'"
            v-model="selectUseStatusInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkUserStatus(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-dept'"
            v-model="selectDeptInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkDept(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-device-type'"
            v-model="selectDeviceTypeInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkDevice(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-finance-type'"
            v-model="selectFinanceTypeInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #suffix>
              <el-icon @click="checkFinance(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-asset-classify-type'"
            v-model="selectAssetClassifyTypeInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkClassify(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-patrol-route'"
            v-model="selectPatrolRouteInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkPatrolRoute(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-maintenance'"
            v-model="selectMaintenanceInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkMaintenance(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-repair-user'"
            v-model="selectRepairUserInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkRepairUser(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-maintenance-user'"
            v-model="selectMaintenanceUserInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkMaintenanceUser(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-shelf-no'"
            v-model="selectCargoSpaceInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkShelfNo(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-product-class'"
            v-model="productClassificationInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkProductClass(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-input
            v-if="item.componentType === 'select-tree-data'"
            v-model="selectTreeDataInfo.data[item.value]"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
          >
            <template #append>
              <el-icon @click="checkMaterialFinancialClassify(item)">
                <Search />
              </el-icon>
            </template>
          </el-input>

        </template>
      </div>

    </div>
  </page-dialog>
</template>

<script setup name="NewPageFilter">
import { Search } from '@element-plus/icons-vue'
import pinyin from 'js-pinyin'
import { watch } from 'vue'
import SelectModel from '../SelectModel/index'
import SlipSelect from '../SlipSelect/index'
// import {selectSlip} from "@/common/js/fieldfList";
const dialogFilterVisible = ref(false)
const dialogInfo = ref({
  title: '搜索条件',
  btLoading: false,
  width: '1000',
  btList: [
    {
      label: '重置',
      type: 'primary',
      event: clearSearch,
      show: true,
    },
    {
      label: '确定',
      type: 'primary',
      event: save,
      show: true,
    },
  ],
})
function close() {
  dialogFilterVisible.value = false
}
function clearSearch() {
  dialogFilterVisible.value = false
  props.filterBtn.find((item) => {
    if (item.label === '重置') {
      item.event && item.event()
    }
  })
}
function save() {
  dialogFilterVisible.value = false
  props.filterBtn.find((item) => {
    if (item.label === '查询') {
      item.event && item.event()
    }
  })
}
const { proxy } = getCurrentInstance()
const emits = defineEmits()
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
    default: '',
  },
  tableRow: {
    type: Object,
    default: () => {
      return {}
    },
  }, // 相关列表
  listTypeInfo: {
    type: Object,
    default: () => {
      return {}
    },
  },
  // 过滤器列表
  filterList: {
    type: Array,
    default: () => {
      return []
    },
  },
  // 过滤器列表
  filterBtn: {
    type: Array,
    default: () => {
      return []
    },
  },
  queryMoreJson: {
    type: Boolean,
    default: false,
  },
  // 是列表还是弹窗打开的搜索 如果是弹窗就不打开新弹框 直接下拉展开搜索条件 如果是列表就弹框
  isFromDialog: {
    type: Boolean,
    default: false,
  },
  slipSelectRequest: {
    //slip-select重新请求
    type: Boolean,
    default: true,
  },
  clearType: {
    type: Boolean,
    default: true,
  },
  // 参数
  query: {
    type: Object,
    default: () => {
      return {}
    },
  },
  isMaterialDrug: {
    //是否物资药品同时支持
    type: Boolean,
    default: false,
  },
})
const tableInfo = ref({})
const treeInfo = ref({})
const periodInfo = ref({})
const list = ref('')
const listTypeOptionsInfo = ref({})
const copyListTypeInfo = ref({})
// 时间相关设置
const datePickerOptions = ref({
  disabledDate(time) {
    // 大于当前的时间都不能选 (+十分钟让点击此刻的时候可以选择到当前时间)
    return time.getTime() > +new Date() + 1000 * 600 * 1
  },
})
const iconMap = ref({
  // 新增: 'Plus',
  // 编辑: 'Edit',
  // 删除: 'Delete',
  // 查询: 'Search',
  // 返回: 'CircleClose',
  // 保存: 'Document',
})

const searchQuery = ref({})
const flag = ref('inner') // 内 inner  外outside
const searchObj = ref({})
const oldQuery = ref({})
const timeInfo = ref({})
const hideNum = ref(12)
const inputSectionMin = ref(0)
const inputSectionMax = ref(0)
const userInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
  query: {},
})
const supplierInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const productInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectUseStatusInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectDeptInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectDeviceTypeInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectFinanceTypeInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectAssetClassifyTypeInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectFiscalPeriodInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectPatrolRouteInfo = ref({
  visible: false,
  row: {},
  data: {},
  checked: {},
})
const selectMaintenanceInfo = ref({
  visible: false,
  row: {},
  data: {},
  checked: {},
})
const selectRepairUserInfo = ref({
  visible: false,
  row: {},
  data: {},
  checked: {},
})
const selectMaintenanceUserInfo = ref({
  title: '请选择维修人员',
  visible: false,
  row: {},
  data: {},
  checked: {},
})
const selectCargoSpaceInfo = ref({
  visible: false,
  row: {},
  data: {},
  checked: {},
})
const productClassificationInfo = ref({
  visible: false,
  api: null,
  row: {},
  data: {},
  checked: {},
})
const selectTreeDataInfo = ref({
  visible: false,
  row: {},
  data: {},
  checked: {},
})
const showFilterList = ref([])
const custom_search_box_num = computed(
    () => proxy.$store.state.permission.systemConfig?.custom_search_box_num
)
watch(
    () => searchQuery.value,
    (val) => {
      // 传入参数修改，不派发
      if (flag.value === 'outside') {
        flag.value = 'inner'
        return
      }
      if (props.queryMoreJson) {
        for (let key in searchObj.value) {
          searchObj.value[key] ? (searchObj.value[key].value = val[key]) : ''
        }
        let obj = {}
        if (Object.keys(searchObj.value).length) {
          obj = searchObj.value
        } else {
          obj = props.query
        }
        // 修改传入进来的参数
        emits('update:query', { ...obj })
      } else {
        emits('update:query', { ...props.query, ...val })
      }
    },
    {
      deep: true, // 深度监听
    }
)
watch(
    () => props.query,
    (val) => {
      flag.value = 'outside' // 标识为传入参数修改
      if (props.queryMoreJson) {
        let obj = {}
        for (let key in val) {
          obj[key] = val[key].value
        }
        searchObj.value = val
        searchQuery.value = obj
      } else {
        searchQuery.value = val
      }
      props.filterList.forEach((item) => {
        if (
            item.type === 'daterange' ||
            item.type === 'datetimerange' ||
            item.type === 'monthrange'
        ) {
          if (
              val &&
              val[item.value] &&
              !proxy.$fn.isEmptyString(val[item.value])
          ) {
            proxy.$nextTick(() => {
              let arr = proxy.$fn.splitArr(val[item.value])
              timeInfo.value[item.value] = Array.from(arr)
            })
          } else {
            proxy.$nextTick(() => {
              timeInfo.value[item.value] = []
            })
          }
        }
      })
    },
    {
      deep: true,
      immediate: true,
    }
)
watch(
    () => props.listTypeInfo,
    (val) => {
      listTypeOptionsInfo.value = proxy.$fn.deepClone(val)
      copyListTypeInfo.value = proxy.$fn.deepClone(listTypeOptionsInfo.value)
    },
    {
      immediate: true,
      deep: true,
    }
)
watch(
  () => props.clearType,
  (val) => {
    timeInfo.value = {}
    userInfo.value.data = {}
    selectUseStatusInfo.value.data = {}
    selectDeptInfo.value.data = {}
    selectDeviceTypeInfo.value.data = {}
    selectFinanceTypeInfo.value.data = {}
    selectAssetClassifyTypeInfo.value.data = {}
    selectFiscalPeriodInfo.value.data = {}
    selectPatrolRouteInfo.value.data = {}
    selectMaintenanceInfo.value.data = {}
    selectCargoSpaceInfo.value.data = {}
    supplierInfo.value.data = {}
    productInfo.value.data = {}
    productClassificationInfo.value.data = {}
    selectTreeDataInfo.value.data = {}
    userInfo.value.checked = {}
    selectUseStatusInfo.value.checked = {}
    selectDeptInfo.value.checked = {}
    selectDeviceTypeInfo.value.checked = {}
    selectFinanceTypeInfo.value.checked = {}
    selectAssetClassifyTypeInfo.value.checked = {}
    selectFiscalPeriodInfo.value.checked = {}
    selectPatrolRouteInfo.value.checked = {}
    selectMaintenanceInfo.value.checked = {}
    selectRepairUserInfo.value.checked = {}
    selectMaintenanceUserInfo.value.checked = {}
    selectCargoSpaceInfo.value.checked = {}
    supplierInfo.value.checked = {}
    productInfo.value.checked = {}
    productClassificationInfo.value.checked = {}
    selectTreeDataInfo.value.checked = {}
  }
)
watch(
    () => props.filterList,
    (val) => {
      if (val && val.length) {
        showFilterList.value = props.filterList.filter(
            (item) =>
                !item.hasOwnProperty('show') ||
                (item.hasOwnProperty('show') && item.show)
        )
        // showFilterList.value = items.map(it => {
        //   let item = it
        //   if(it.componentType === 'slip-select') {
        //     item = {
        //       ...it,
        //       ...selectSlip(it.componentName)
        //     }
        //   }
        //   return { ...item }
        // })
        if (hideNum.value > custom_search_box_num.value) {
          hideNum.value = showFilterList.value.length
        }
      } else {
        showFilterList.value = []
      }
    },
    {
      immediate: true,
      deep: true,
    }
)
watch(
  () => props.slipSelectRequest,
  () => {
    echoFun()
  },
  {
    immediate: true,
    deep: true,
  }
)
function echoFun() {
  let filterList = proxy.$fn.deepClone(props.filterList)
  if (filterList.length) {
    filterList.forEach((item) => {
      let searchDefaultValue = item.searchDefaultValue
      let type = Object.prototype.toString.call(searchDefaultValue)
      if (item.componentType === 'select-user') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            userInfo.value.checked[item.value] = searchDefaultValue.key
          }
          userInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          userInfo.value.checked[item.value] = ''
          userInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-supplier') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            supplierInfo.value.checked[item.value] = searchDefaultValue.key
          }
          supplierInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          supplierInfo.value.checked[item.value] = ''
          supplierInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-product') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            productInfo.value.checked[item.value] = searchDefaultValue.key
          }
          productInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          productInfo.value.checked[item.value] = ''
          productInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-use-status') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectUseStatusInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectUseStatusInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          selectUseStatusInfo.value.checked[item.value] = ''
          selectUseStatusInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-dept') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectDeptInfo.value.checked[item.value] = searchDefaultValue.key
          }
          selectDeptInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          selectDeptInfo.value.checked[item.value] = ''
          selectDeptInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-device-type') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectDeviceTypeInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectDeviceTypeInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          selectDeviceTypeInfo.value.checked[item.value] = ''
          selectDeviceTypeInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-finance-type') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectFinanceTypeInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectFinanceTypeInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          selectFinanceTypeInfo.value.checked[item.value] = ''
          selectFinanceTypeInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-asset-classify-type') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectAssetClassifyTypeInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectAssetClassifyTypeInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          selectAssetClassifyTypeInfo.value.checked[item.value] = ''
          selectAssetClassifyTypeInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-fiscal-period') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectFiscalPeriodInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectFiscalPeriodInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          selectFiscalPeriodInfo.value.checked[item.value] = ''
          selectFiscalPeriodInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-patrol-route') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectPatrolRouteInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectPatrolRouteInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          selectPatrolRouteInfo.value.checked[item.value] = ''
          selectPatrolRouteInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-maintenance') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectMaintenanceInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectMaintenanceInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          selectMaintenanceInfo.value.checked[item.value] = ''
          selectMaintenanceInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-repair-user') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectRepairUserInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectRepairUserInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          selectRepairUserInfo.value.checked[item.value] = ''
          selectRepairUserInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-maintenance-user') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectMaintenanceUserInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectMaintenanceUserInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          selectMaintenanceUserInfo.value.checked[item.value] = ''
          selectMaintenanceUserInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-shelf-no') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            selectCargoSpaceInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          selectCargoSpaceInfo.value.data[item.value] = searchDefaultValue.value
        } else {
          selectCargoSpaceInfo.value.checked[item.value] = ''
          selectCargoSpaceInfo.value.data[item.value] = ''
        }
      } else if (item.componentType === 'select-product-class') {
        if (
          type === '[object Object]' &&
          searchDefaultValue.key &&
          searchDefaultValue.key.length
        ) {
          if (item.checkBox) {
            productClassificationInfo.value.checked[item.value] =
              searchDefaultValue.key
          }
          productClassificationInfo.value.data[item.value] =
            searchDefaultValue.value
        } else {
          productClassificationInfo.value.checked[item.value] = ''
          productClassificationInfo.value.data[item.value] = ''
        }
      }
    })
  }
}
function clearFiscalPeriod() {
  //清除
  let data = selectFiscalPeriodInfo.value.row
  searchQuery.value[data.asValue] = ''
  selectFiscalPeriodInfo.value.data[data.value] = ''
  selectFiscalPeriodInfo.value.checked[data.value] = []
}

function visibleChange(val, _list) {
  //下拉框出现/隐藏时触发
  list.value = _list
  if (!val) {
    listTypeOptionsInfo.value[_list] = copyListTypeInfo.value[_list]
  }
}
function filterMethod(value) {
  // 自定义查询方法
  if (value && list.value) {
    let result = []
    copyListTypeInfo.value[list.value].forEach((item) => {
      pinyin.setOptions({ checkPolyphone: false, charCase: 1 })
      const resultEng = pinyin.getCamelChars(item.key).toUpperCase()
      const matchResult =
          item.key.indexOf(value) !== -1 ||
          resultEng.indexOf(value.toUpperCase()) !== -1
      // let matchResult = PinYinMatch.match(item.key, value)
      if (matchResult) {
        result.push(item)
      }
    })
    listTypeOptionsInfo.value[list.value] = result
  } else {
    listTypeOptionsInfo.value[list.value] = copyListTypeInfo.value[list.value]
  }
}
function initParams() {
  const obj = {}
  for (const key in props.query) {
    if (props.query[key]) {
      obj[key] = proxy.$fn.deepClone(props.query[key])
    }
  }
  // searchQuery.value = obj
}
function moreFilterList() {
  let list = props.filterList.filter(
      (item) =>
          !item.hasOwnProperty('show') || (item.hasOwnProperty('show') && item.show)
  )
  if (!props.isFromDialog) {
    dialogFilterVisible.value = true
  } else {
    if (hideNum.value !== custom_search_box_num.value) {
      hideNum.value = custom_search_box_num.value
    } else {
      hideNum.value = list.length
    }
    proxy.$store.dispatch('app/toggleOpenFilter')
  }
}
// 获取列表
function getConfigList(str) {
  if (str === 'btn' && props.filterBtn) {
    return props.filterBtn.filter(
        (item) =>
            !item.hasOwnProperty('show') ||
            (item.hasOwnProperty('show') && item.show)
    )
  }
}
function timeChange(val, str, timeArr) {
  if (val && val.length) {
    searchQuery.value[str] = val[0] + ',' + val[1]
    if (timeArr && timeArr.length > 0) {
      searchQuery.value[timeArr[0]] = val[0]
      searchQuery.value[timeArr[1]] = val[1]
    }
  } else {
    searchQuery.value[str] = null
    if (timeArr && timeArr.length > 0) {
      searchQuery.value[timeArr[0]] = null
      searchQuery.value[timeArr[1]] = null
    }
  }
}
function checkUser(item) {
  userInfo.value.visible = true
  userInfo.value.row = item
  userInfo.value.query = item.query
}
function checkSupplier(item) {
  supplierInfo.value.visible = true
  supplierInfo.value.row = item
}
function checkProduct(item) {
  productInfo.value.visible = true
  productInfo.value.row = item
}

function checkUserStatus(item) {
  selectUseStatusInfo.value.visible = true
  selectUseStatusInfo.value.row = item
}
function checkDept(item) {
  selectDeptInfo.value.visible = true
  selectDeptInfo.value.row = item
}
function checkDevice(item) {
  selectDeviceTypeInfo.value.visible = true
  selectDeviceTypeInfo.value.row = item
}
function checkFinance(item) {
  selectFinanceTypeInfo.value.visible = true
  selectFinanceTypeInfo.value.row = item
}
function checkClassify(item) {
  selectAssetClassifyTypeInfo.value.visible = true
  selectAssetClassifyTypeInfo.value.row = item
}
function checkFiscalPeriod(item) {
  selectFiscalPeriodInfo.value.visible = true
  selectFiscalPeriodInfo.value.row = item
}
function checkPatrolRoute(item) {
  selectPatrolRouteInfo.value.visible = true
  selectPatrolRouteInfo.value.row = item
}
function checkMaintenance(item) {
  selectMaintenanceInfo.value.visible = true
  selectMaintenanceInfo.value.row = item
}
function checkRepairUser(item) {
  selectRepairUserInfo.value.visible = true
  selectRepairUserInfo.value.row = item
}
function checkMaintenanceUser(item) {
  selectMaintenanceUserInfo.value.visible = true
  selectMaintenanceUserInfo.value.row = item
}
function checkShelfNo(item) {
  selectCargoSpaceInfo.value.visible = true
  selectCargoSpaceInfo.value.row = item
}
function checkProductClass(item) {
  productClassificationInfo.value.visible = true
  productClassificationInfo.value.row = item
}
function checkMaterialFinancialClassify(item) {
  console.log(item)
  selectTreeDataInfo.value.visible = true
  selectTreeDataInfo.value.row = item
  console.log(selectTreeDataInfo.value.row.extraFieldList)
}
function setBtnDisabled(btnDisabled) {
  if (typeof btnDisabled === 'string' || typeof btnDisabled === 'boolean') {
    return btnDisabled
  } else if (btnDisabled && typeof btnDisabled === 'function') {
    return btnDisabled()
  }
}
function getItemType(item) {
  if(item.btType) {
    return item.btType
  }
  const primaryArr = ['新增', '查询', '保存', '导出Excel', '保存新增', '采集']
  if(primaryArr.includes(item.label)) {
    return 'primary'
  }
  return 'default'
}
// // 绑定的相关事件
// handleEvent(evnet) {
//     emits('handleEvent', evnet)
// },
// // 派发按钮点击事件
// handleClick(event, data) {
//     emits('handleClick', event, data)
// }

onMounted(() => {
  oldQuery.value = Object.assign(oldQuery.value, props.query)
  initParams()
})
onUnmounted(() => {
  emits('update:query', { ...oldQuery.value })
})
// table确定弹框
function tableCallback(data) {
  tableInfo.value.callBack(data)
}
// tree确定弹框
function treeCallback(data) {
  treeInfo.value.callBack(data)
}
// 期间确定弹框
function periodCallback(data) {
  periodInfo.value.callBack(data)
}
// 打开弹框
function openDialog(data, type) {
  if (type === 'tree') {
    treeInfo.value = data
    return
  }
// 会计期间
  if(data.type === 'accountingPeriod') {
    tableInfo.value = [];
    periodInfo.value = data;
  } else {
    periodInfo.value = [];
    tableInfo.value = data;
  }
}

// 暴露属性，否则在父组件获取不到子组件内的方法
defineExpose({
  openDialog,
  clearFiscalPeriod,
})
</script>

<style lang="scss" scoped>
.page-filter {
  width: 100%;
}
</style>
