<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip class="item" effect="dark" :content="showSearch ? '隠された検索' : '検索を表示します'" placement="top" v-if="search">
        <el-button circle icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="リフレッシュします" placement="top">
        <el-button circle icon="Refresh" @click="refresh()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="隠されたリスト" placement="top" v-if="columns">
        <el-button circle icon="Menu" @click="showColumn()" v-if="showColumnsType == 'transfer'"/>
        <el-dropdown trigger="click" :hide-on-click="false" style="padding-left: 12px" v-if="showColumnsType == 'checkbox'">
          <el-button circle icon="Menu" />
          <template #dropdown>
            <el-dropdown-menu>
              <template v-for="item in columns" :key="item.key">
                <el-dropdown-item>
                  <el-checkbox :checked="item.visible" @change="checkboxChange($event, item.label)" :label="item.label" />
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </el-row>
    <el-dialog :title="title" v-model="open" append-to-body>
      <el-transfer
        :titles="['見せる', '隠れる']"
        v-model="value"
        :data="columns"
        @change="dataChange"
      ></el-transfer>
    </el-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  /* 是否見せる检索条件 */
  showSearch: {
    type: Boolean,
    default: true,
  },
  /* 隠されたリスト信息 */
  columns: {
    type: Array,
  },
  /* 是否見せる检索图标 */
  search: {
    type: Boolean,
    default: true,
  },
  /* 隠されたリスト类型（transferシャトル、checkboxチェックボックス） */
  showColumnsType: {
    type: String,
    default: "checkbox",
  },
  /* 右側の距離 */
  gutter: {
    type: Number,
    default: 10,
  },
})

const emits = defineEmits(['update:showSearch', 'queryTable']);

// データ
const value = ref([]);
// ポップアップレイヤータイトル
const title = ref("見せる/隠れる");
// 是否見せる弹出层
const open = ref(false);

const style = computed(() => {
  const ret = {};
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`;
  }
  return ret;
});

// 検索
function toggleSearch() {
  emits("update:showSearch", !props.showSearch);
}

// リフレッシュします
function refresh() {
  emits("queryTable");
}

// 右側のリスト要素の変更
function dataChange(data) {
  for (let item in props.columns) {
    const key = props.columns[item].key;
    props.columns[item].visible = !data.includes(key);
  }
}

// 打开隠されたリストdialog
function showColumn() {
  open.value = true;
}

if (props.showColumnsType == 'transfer') {
  // 隠されたリスト初始默认隠れる列
  for (let item in props.columns) {
    if (props.columns[item].visible === false) {
      value.value.push(parseInt(item));
    }
  }
}

// チェック
function checkboxChange(event, label) {
  props.columns.filter(item => item.label == label)[0].visible = event;
}

</script>

<style lang='scss' scoped>
:deep(.el-transfer__button) {
  border-radius: 50%;
  display: block;
  margin-left: 0px;
}
:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}
:deep(.el-dropdown-menu__item) {
  line-height: 30px;
  padding: 0 17px;
}
</style>
