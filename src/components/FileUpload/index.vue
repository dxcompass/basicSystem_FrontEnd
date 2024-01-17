<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <!-- アップロードボタン -->
      <el-button type="primary">ファイルを選ぶ</el-button>
    </el-upload>
    <!-- プロンプトをアップロードします -->
    <div class="el-upload__tip" v-if="showTip">
      アップロードしてください
      <template v-if="fileSize"> サイズは超えません <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> フォーマット <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      書類
    </div>
    <!-- ファイルリスト -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="`${baseUrl}${file.url}`" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger"> 削除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";

const props = defineProps({
  modelValue: [String, Object, Array],
  // 定量的制限
  limit: {
    type: Number,
    default: 5,
  },
  // サイズ制限(MB)
  fileSize: {
    type: Number,
    default: 5,
  },
  // ファイルの種類, 例えば['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ["doc", "xls", "ppt", "txt", "pdf"],
  },
  // プロンプトを表示するかどうか
  isShowTip: {
    type: Boolean,
    default: true
  }
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // ファイルサーバーアドレスをアップロードします
const headers = ref({ Authorization: "Bearer " + getToken() });
const fileList = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, val => {
  if (val) {
    let temp = 1;
    // 最初に値を配列に変えます
    const list = Array.isArray(val) ? val : props.modelValue.split(',');
    // 次に、配列をオブジェクト配列に変えます
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        item = { name: item, url: item };
      }
      item.uid = item.uid || new Date().getTime() + temp++;
      return item;
    });
  } else {
    fileList.value = [];
    return [];
  }
},{ deep: true, immediate: true });

// 以前の学校の検査の形式とサイズをアップロードする
function handleBeforeUpload(file) {
  // 校检ファイルの種類
  if (props.fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = fileName[fileName.length - 1];
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy.$modal.msgError(`ファイル形式が正しくありません, アップロードしてください${props.fileType.join("/")}フォーマットファイル!`);
      return false;
    }
  }
  // 学校検査文書のサイズ
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`アップロードファイルのサイズを超えることはできません ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy.$modal.loading("ファイルをアップロードします，お待ちください...");
  number.value++;
  return true;
}

// ファイルの数が超えています
function handleExceed() {
  proxy.$modal.msgError(`アップロードファイルの数はそれ以上を超えることはできません ${props.limit} 個々々!`);
}

// アップロードに失敗しました
function handleUploadError(err) {
  proxy.$modal.msgError("ファイルの障害をアップロードします");
}

// 正常にアップロードします
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.fileName });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$modal.closeLoading();
    proxy.$modal.msgError(res.msg);
    proxy.$refs.fileUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

//  削除文件
function handleDelete(index) {
  fileList.value.splice(index, 1);
  emit("update:modelValue", listToString(fileList.value));
}

// エンディングをアップロードします
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit("update:modelValue", listToString(fileList.value));
    proxy.$modal.closeLoading();
  }
}

// ファイル名を取得します
function getFileName(name) {
  // の場合url次に、姓を取ります 直接戻っていない場合
  if (name.lastIndexOf("/") > -1) {
    return name.slice(name.lastIndexOf("/") + 1);
  } else {
    return name;
  }
}

// オブジェクトは、指定された文字列分離に変換されます
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (list[i].url) {
      strs += list[i].url + separator;
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : '';
}
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>
