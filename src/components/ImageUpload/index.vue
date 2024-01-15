<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon class="avatar-uploader-icon"><plus /></el-icon>
    </el-upload>
    <!-- プロンプトをアップロードします -->
    <div class="el-upload__tip" v-if="showTip">
      アップロードしてください
      <template v-if="fileSize">
        サイズは超えません <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        フォーマット <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      書類
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="プレビュー"
      width="800px"
      append-to-body
    >
      <img
        :src="dialogImageUrl"
        style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";

const props = defineProps({
  modelValue: [String, Object, Array],
  // 限られた画像量
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
    default: () => ["png", "jpg", "jpeg"],
  },
  // プロンプトを表示するかどうか
  isShowTip: {
    type: Boolean,
    default: true
  },
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadImgUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // アップロードされた画像サーバーアドレス
const headers = ref({ Authorization: "Bearer " + getToken() });
const fileList = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, val => {
  if (val) {
    // 最初に値を配列に変えます
    const list = Array.isArray(val) ? val : props.modelValue.split(",");
    // 次に、配列をオブジェクト配列に変えます
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        if (item.indexOf(baseUrl) === -1) {
          item = { name: baseUrl + item, url: baseUrl + item };
        } else {
          item = { name: item, url: item };
        }
      }
      return item;
    });
  } else {
    fileList.value = [];
    return [];
  }
},{ deep: true, immediate: true });

// アップロードする前loading負荷
function handleBeforeUpload(file) {
  let isImg = false;
  if (props.fileType.length) {
    let fileExtension = "";
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
    }
    isImg = props.fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true;
      if (fileExtension && fileExtension.indexOf(type) > -1) return true;
      return false;
    });
  } else {
    isImg = file.type.indexOf("image") > -1;
  }
  if (!isImg) {
    proxy.$modal.msgError(
      `ファイル形式が正しくありません, アップロードしてください${props.fileType.join("/")}画像形式ファイル!`
    );
    return false;
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`アバターの画像サイズをアップロードすることはできません ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy.$modal.loading("写真をアップロードします，お待ちください...");
  number.value++;
}

// ファイルの数が超えています
function handleExceed() {
  proxy.$modal.msgError(`アップロードファイルの数はそれ以上を超えることはできません ${props.limit} 個々!`);
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
    proxy.$refs.imageUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

// 写真を削除します
function handleDelete(file) {
  const findex = fileList.value.map(f => f.name).indexOf(file.name);
  if (findex > -1 && uploadList.value.length === number.value) {
    fileList.value.splice(findex, 1);
    emit("update:modelValue", listToString(fileList.value));
    return false;
  }
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

// アップロードに失敗しました
function handleUploadError() {
  proxy.$modal.msgError("写真をアップロードしました。失敗しました");
  proxy.$modal.closeLoading();
}

// プレビュー
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
}

// オブジェクトは、指定された文字列分離に変換されます
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (undefined !== list[i].url && list[i].url.indexOf("blob:") !== 0) {
      strs += list[i].url.replace(baseUrl, "") + separator;
    }
  }
  return strs != "" ? strs.substr(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 追加の番号パーツを制御します
:deep(.hide .el-upload--picture-card) {
    display: none;
}
</style>