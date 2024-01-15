<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="ミッション名" prop="jobName">
            <el-input
               v-model="queryParams.jobName"
               placeholder="ミッション名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="タスクグループ名" prop="jobGroup">
            <el-select
               v-model="queryParams.jobGroup"
               placeholder="请选择タスクグループ名"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="実行ステータス" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="请选择実行ステータス"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_common_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="実行時間" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="開始日"
               end-placeholder="終了日"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">取り戻し</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:job:remove']"
            > 削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               @click="handleClean"
               v-hasPermi="['monitor:job:remove']"
            >空の</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:job:export']"
            >輸出</el-button>
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

      <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="ログ番号" width="80" align="center" prop="jobLogId" />
         <el-table-column label="ミッション名" align="center" prop="jobName" :show-overflow-tooltip="true" />
         <el-table-column label="タスクグループ名" align="center" prop="jobGroup" :show-overflow-tooltip="true">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column label="ターゲット文字列を呼び出します" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column label="ログ情報" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
         <el-table-column label="実行ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="実行時間" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="動作します" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']">詳細</el-button>
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

      <!-- 调度日志詳細 -->
      <el-dialog title="调度日志詳細" v-model="open" width="700px" append-to-body>
         <el-form :model="form" label-width="100px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="ログ番号番号：">{{ form.jobLogId }}</el-form-item>
                  <el-form-item label="ミッション名：">{{ form.jobName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="タスクグループ：">{{ form.jobGroup }}</el-form-item>
                  <el-form-item label="実行時間：">{{ form.createTime }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="通話方法：">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="ログ情報：">{{ form.jobMessage }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="実行ステータス：">
                     <div v-if="form.status == 0">普通</div>
                     <div v-else-if="form.status == 1">失敗</div>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="異常な情報：" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="open = false">近い 近い</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="JobLog">
import { getJob } from "@/api/monitor/job";
import { listJobLog, delJobLog, cleanJobLog } from "@/api/monitor/jobLog";

const { proxy } = getCurrentInstance();
const { sys_common_status, sys_job_group } = proxy.useDict("sys_common_status", "sys_job_group");

const jobLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);
const route = useRoute();

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined
  }
});

const { queryParams, form, rules } = toRefs(data);

/** クエリスケジューリングログリスト */
function getList() {
  loading.value = true;
  listJobLog(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    jobLogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 戻りボタン
function handleClose() {
  const obj = { path: "/monitor/job" };
  proxy.$tab.closeOpenPage(obj);
}
/** 検索ボタン動作します */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 取り戻しボタン動作します */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
// マルチ選択ボックスはデータを選択します
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.jobLogId);
  multiple.value = !selection.length;
}
/** 詳細ボタン動作します */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/**  削除ボタン動作します */
function handleDelete(row) {
  proxy.$modal.confirm('是否確認 削除调度ログ番号为"' + ids.value + '"データ項目?').then(function () {
    return delJobLog(ids.value);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(" 削除成功");
  }).catch(() => {});
}
/** 空のボタン動作します */
function handleClean() {
  proxy.$modal.confirm("是否確認空の所有调度日志数据项?").then(function () {
    return cleanJobLog();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("空の成功");
  }).catch(() => {});
}
/** 輸出ボタン動作します */
function handleExport() {
  proxy.download("monitor/jobLog/export", {
    ...queryParams.value,
  }, `job_log_${new Date().getTime()}.xlsx`);
}

(() => {
  const jobId = route.params && route.params.jobId;
  if (jobId !== undefined && jobId != 0) {
    getJob(jobId).then(response => {
      queryParams.value.jobName = response.data.jobName;
      queryParams.value.jobGroup = response.data.jobGroup;
      getList();
    });
  } else {
    getList();
  }
})();

getList();
</script>
