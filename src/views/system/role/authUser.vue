
<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
         <el-form-item label="ユーザー名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザー名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="電話番号" prop="phonenumber">
            <el-input
               v-model="queryParams.phonenumber"
               placeholder="電話番号を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">取り戻し</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="openSelectUser"
               v-hasPermi="['system:role:add']"
            >ユーザーを追加する</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="CircleClose"
               :disabled="multiple"
               @click="cancelAuthUserAll"
               v-hasPermi="['system:role:remove']"
            >バッチキャンセル許可</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button 
               type="warning" 
               plain 
               icon="Close"
               @click="handleClose"
            >閉鎖</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="ユーザー名" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column label="ユーザーのニックネーム" prop="nickName" :show-overflow-tooltip="true" />
         <el-table-column label="郵便" prop="email" :show-overflow-tooltip="true" />
         <el-table-column label="携帯電話" prop="phonenumber" :show-overflow-tooltip="true" />
         <el-table-column label="ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="作成時間" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="動作します" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)" v-hasPermi="['system:role:remove']">承認をキャンセルします</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
      <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
   </div>
</template>

<script setup name="AuthUser">
import selectUser from "./selectUser";
import { allocatedUserList, authUserCancel, authUserCancelAll } from "@/api/system/role";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId,
  userName: undefined,
  phonenumber: undefined,
});

/** 認定ユーザーのクエリリスト */
function getList() {
  loading.value = true;
  allocatedUserList(queryParams).then(response => {
    userList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 戻りボタン
function handleClose() {
  const obj = { path: "/system/role" };
  proxy.$tab.closeOpenPage(obj);
}
/** 検索ボタン動作します */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
/** 取り戻しボタン動作します */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
// マルチ選択ボックスはデータを選択します
function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId);
  multiple.value = !selection.length;
}
/** 承認されたユーザーテーブルポップアップウィンドウを開きます */
function openSelectUser() {
  proxy.$refs["selectRef"].show();
}
/** 承認をキャンセルしますボタン動作します */
function cancelAuthUser(row) {
  proxy.$modal.confirm('ユーザーをキャンセルすることを確認してください"' + row.userName + '"キャラクターですか？？').then(function () {
    return authUserCancel({ userId: row.userId, roleId: queryParams.roleId });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("承認をキャンセルします成功");
  }).catch(() => {});
}
/** バッチキャンセル許可ボタン動作します */
function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(",");
  proxy.$modal.confirm("選択したユーザー認定データ項目をキャンセルするかどうか?").then(function () {
    return authUserCancelAll({ roleId: roleId, userIds: uIds });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("承認をキャンセルします成功");
  }).catch(() => {});
}

getList();
</script>
