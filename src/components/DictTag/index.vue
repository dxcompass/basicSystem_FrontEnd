<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.value)">
        <span
          v-if="(item.elTagType == 'default' || item.elTagType == '') && (item.elTagClass == '' || item.elTagClass == null)"
          :key="item.value"
          :index="index"
          :class="item.elTagClass"
        >{{ item.label + " " }}</span>
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.value + ''"
          :index="index"
          :type="item.elTagType === 'primary' ? '' : item.elTagType"
          :class="item.elTagClass"
        >{{ item.label + " " }}</el-tag>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      {{ unmatchArray | handleArray }}
    </template>
  </div>
</template>

<script setup>
// 不健康なアイテムを記録します
const unmatchArray = ref([]);

const props = defineProps({
  // データ
  options: {
    type: Array,
    default: null,
  },
  // 現在の価値
  value: [Number, String, Array],
  // 当未找到匹配的データ时，見せるvalue
  showValue: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: String,
    default: ",",
  }
});

const values = computed(() => {
  if (props.value === null || typeof props.value === 'undefined' || props.value === '') return [];
  return Array.isArray(props.value) ? props.value.map(item => '' + item) : String(props.value).split(props.separator);
});

const unmatch = computed(() => {
  unmatchArray.value = [];
  // いいえvalue不見せる
  if (props.value === null || typeof props.value === 'undefined' || props.value === '' || props.options.length === 0) return false
  // エントリ値は配列です
  let unmatch = false // ロゴを追加して、不満があるかどうかを判断する
  values.value.forEach(item => {
    if (!props.options.some(v => v.value === item)) {
      unmatchArray.value.push(item)
      unmatch = true // マッチングがない場合，フラグをに設定しますtrue
    }
  })
  return unmatch // ロゴの価値に戻ります
});

function handleArray(array) {
  if (array.length === 0) return "";
  return array.reduce((pre, cur) => {
    return pre + " " + cur;
  });
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
