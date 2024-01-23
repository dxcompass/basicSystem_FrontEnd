<template>
   <div class="app-container">
      <h4 class="form-header h4">基本情報</h4>
      <el-form :model="form" label-width="80px">
         <el-row>
            <el-col :span="8" :offset="2">
               <el-form-item label="ユーザーのニックネーム" prop="nickName">
                  <el-input v-model="form.nickName" disabled />
               </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
               <el-form-item label="ログインアカウント" prop="userName">
                  <el-input v-model="form.userName" disabled />
               </el-form-item>
            </el-col>
         </el-row>
      </el-form>

      <h4 class="form-header h4">ロール情報</h4>
      <el-table v-loading="loading" :row-key="getRowKey" @row-click="clickRow" ref="roleRef" @selection-change="handleSelectionChange" :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)">
         <el-table-column label="シリアルナンバー" width="55" type="index" align="center">
            <template #default="scope">
               <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
         <el-table-column label="番号" align="center" prop="roleId" />
         <el-table-column label="ロール名" align="center" prop="roleName" />
         <el-table-column label="ロール" align="center" prop="roleKey" />
         <el-table-column label="作成時間" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />

      <el-form label-width="100px">
         <div style="text-align: center;margin-left:-120px;margin-top:30px;">
            <el-button type="primary" @click="submitForm()">提出する</el-button>
            <el-button @click="close()">戻る</el-button>
         </div>
      </el-form>
   </div>
</template>

<script setup name="AuthRole">
import { getAuthRole, updateAuthRole } from "@/api/system/user";

const route = useRoute();
const { proxy } = getCurrentInstance();

const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const roleIds = ref([]);
const roles = ref([]);
const form = ref({
  nickName: undefined,
  userName: undefined,
  userId: undefined
});

/** 選択したデータをクリックします */
function clickRow(row) {
  proxy.$refs["roleRef"].toggleRowSelection(row);
};
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  roleIds.value = selection.map(item => item.roleId);
};
/** 選択したデータ番号を保存します */
function getRowKey(row) {
  return row.roleId;
};
/** 閉じるボタン */
function close() {
  const obj = { path: "/system/user" };
  proxy.$tab.closeOpenPage(obj);
};
/** 提出するボタン */
function submitForm() {
  const userId = form.value.userId;
  const rIds = roleIds.value.join(",");
  updateAuthRole({ userId: userId, roleIds: rIds }).then(response => {
    proxy.$modal.msgSuccess("成功した承認");
    close();
  });
};

(() => {
  const userId = route.params && route.params.userId;
  if (userId) {
    loading.value = true;
    getAuthRole(userId).then(response => {
      form.value = response.user;
      roles.value = response.roles;
      total.value = roles.value.length;
      nextTick(() => {
        roles.value.forEach(row => {
          if (row.flag) {
            proxy.$refs["roleRef"].toggleRowSelection(row);
          }
        });
      });
      loading.value = false;
    });
  }
})();
</script>
