<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="ログインIP" prop="ipaddr">
            <el-input
               v-model="queryParams.ipaddr"
               placeholder="ログインIPを入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ユーザー名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザー名を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">取り戻し</el-button>
         </el-form-item>
      </el-form>
      <el-table
         v-loading="loading"
         :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
         style="width: 100%;"
      >
         <el-table-column label="シリアルナンバー" width="50" type="index" align="center">
            <template #default="scope">
               <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="セッション番号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン名" align="center" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column label="関連部門" align="center" prop="deptName" :show-overflow-tooltip="true" />
         <el-table-column label="ホスト" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
         <el-table-column label="オペレーティング·システム" align="center" prop="os" :show-overflow-tooltip="true" />
         <el-table-column label="ブラウザ" align="center" prop="browser" :show-overflow-tooltip="true" />
         <el-table-column label="時間" align="center" prop="loginTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="動作します" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">力</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
   </div>
</template>

<script setup name="Online">
import { forceLogout, list as initData } from "@/api/monitor/online";

const { proxy } = getCurrentInstance();

const onlineList = ref([]);
const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

const queryParams = ref({
  ipaddr: undefined,
  userName: undefined
});

/** クエリログインログリスト */
function getList() {
  loading.value = true;
  initData(queryParams.value).then(response => {
    onlineList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 検索ボタン動作します */
function handleQuery() {
  pageNum.value = 1;
  getList();
}
/** 取り戻しボタン動作します */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 力ボタン動作します */
function handleForceLogout(row) {
    proxy.$modal.confirm('電源名を確認するかどうか"' + row.userName + '"ユーザー?').then(function () {
  return forceLogout(row.tokenId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除されました");
  }).catch(() => {});
}

getList();
</script>
