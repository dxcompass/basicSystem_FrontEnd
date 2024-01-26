<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" label-width="180px">
      <el-form-item label="以前のパスワード" prop="oldPassword">
         <el-input v-model="user.oldPassword" placeholder="以前のパスワード" type="passwordを入力してください" show-password />
      </el-form-item>
      <el-form-item label="新しいパスワード" prop="newPassword">
         <el-input v-model="user.newPassword" placeholder="新しいパスワード" type="passwordを入力してください" show-password />
      </el-form-item>
      <el-form-item label="パスワードを認証する" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" placeholder="请確認新しいパスワード" type="password" show-password/>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">閉鎖</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserPwd } from "@/api/system/user";

const { proxy } = getCurrentInstance();

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("2つの入力のパスワードは一貫性がありません"));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: "以前のパスワード不能为空", trigger: "blur" }],
  newPassword: [{ required: true, message: "新しいパスワード不能为空", trigger: "blur" }, { min: 6, max: 20, message: "長さ 6 到着 20 個々々のキャラクター", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "パスワードを認証する不能为空", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

/** [提案します]ボタン */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess("正常に変更されました");
      });
    }
  });
};
/** 閉鎖ボタン */
function close() {
  proxy.$tab.closePage();
};
</script>
