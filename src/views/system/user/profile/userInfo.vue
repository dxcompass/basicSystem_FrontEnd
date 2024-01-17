<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="ユーザーのニックネーム" prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="電話番号" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item label="郵便" prop="email">
         <el-input v-model="form.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="性別">
         <el-radio-group v-model="form.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女性</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">閉鎖</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const form = ref({});
const rules = ref({
  nickName: [{ required: true, message: "ユーザーのニックネーム不能为空", trigger: "blur" }],
  email: [{ required: true, message: "郵便アドレスを空にすることはできません", trigger: "blur" }, { type: "email", message: "正しい郵便住所", trigger: ["blur", "changeを入力してください"] }],
  phonenumber: [{ required: true, message: "電話番号を空にすることはできません", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい電話番号", trigger: "blurを入力してください" }],
});

/** [提案します]ボタン */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("正常に変更されました");
        props.user.phonenumber = form.value.phonenumber;
        props.user.email = form.value.email;
      });
    }
  });
};

/** 閉鎖ボタン */
function close() {
  proxy.$tab.closePage();
};

// 現在のログインユーザー情報に戻ります
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex };
  }
},{ immediate: true });
</script>
