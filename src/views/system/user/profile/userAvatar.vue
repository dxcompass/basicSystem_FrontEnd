<template>
  <div class="user-info-head" @click="editCropper()">
    <img :src="options.img" title="クリックしてアバターをアップロードします" class="img-circle img-lg" />
    <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url" :style="options.previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              選ぶ
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">運ぶ 支払う</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import "vue-cropper/dist/index.css";
import { VueCropper } from "vue-cropper";
import { uploadAvatar } from "@/api/system/user";
import useUserStore from "@/store/modules/user";

const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const open = ref(false);
const visible = ref(false);
const title = ref("アバターを変更します");

//画像切断データ
const options = reactive({
  img: userStore.avatar,     // 写真のアドレスをカットします
  autoCrop: true,            // デフォルトでスクリーンショットボックスを生成するかどうか
  autoCropWidth: 200,        // スクリーンショットボックスの幅デフォルト
  autoCropHeight: 200,       // デフォルトでは、スクリーンショットの高さを生成します
  fixedBox: true,            // スクリーンショットボックスのサイズを修正しました 変更が許可されていません
  outputType: "png",         // デフォルトのスクリーンショットはですPNGフォーマット
  filename: 'avatar',        // ファイル名
  previews: {}               //プレビューデータ
});

/** アバターを編集します */
function editCropper() {
  open.value = true;
}
/** ポップアップレイヤーの終わりにコールバックを開きます */
function modalOpened() {
  visible.value = true;
}
/** デフォルトのアップロード動作をカバーします */
function requestUpload() {}
/** 左に回転します */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft();
}
/** 右に回転します */
function rotateRight() {
  proxy.$refs.cropper.rotateRight();
}
/** 画像ズーム */
function changeScale(num) {
  num = num || 1;
  proxy.$refs.cropper.changeScale(num);
}
/** 事前処理をアップロードします */
function beforeUpload(file) {
  if (file.type.indexOf("image/") == -1) {
    proxy.$modal.msgError("文件フォーマット错误，画像タイプをアップロードしてください,のように：JPG，PNGファイルファイル。");
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      options.img = reader.result;
      options.filename = file.name;
    };
  }
}
/** 画像をアップロードします */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob(data => {
    let formData = new FormData();
    formData.append("avatarfile", data, options.filename);
    uploadAvatar(formData).then(response => {
      open.value = false;
      options.img = import.meta.env.VITE_APP_BASE_API + response.imgUrl;
      userStore.avatar = options.img;
      proxy.$modal.msgSuccess("正常に変更されました");
      visible.value = false;
    });
  });
}
/** REAL -TIMEプレビュー */
function realTime(data) {
  options.previews = data;
}
/** 窓を閉めて */
function closeDialog() {
  options.img = userStore.avatar;
  options.visible = false;
}
</script>

<style lang='scss' scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: "+";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>