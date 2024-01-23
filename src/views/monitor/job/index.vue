<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="ミッション名" prop="jobName">
            <el-input
               v-model="queryParams.jobName"
               placeholder="入ってくださいミッション名"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="タスクグループ名" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" placeholder="選んでくださいタスクグループ名" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="ミッションステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="選んでくださいミッションステータス" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">再読み込み</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['monitor:job:add']"
            >増加</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['monitor:job:edit']"
            >改訂</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:job:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:job:export']"
            >出力</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Operation"
               @click="handleJobLog"
               v-hasPermi="['monitor:job:query']"
            >ログ</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="タスク番号" width="100" align="center" prop="jobId" />
         <el-table-column label="ミッション名" align="center" prop="jobName" :show-overflow-tooltip="true" />
         <el-table-column label="タスクグループ名" align="center" prop="jobGroup">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column label="ターゲット文字列を呼び出します" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column label="cron急行" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
         <el-table-column label="ステータス" align="center">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="アクション" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="改訂" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['monitor:job:edit']"></el-button>
               </el-tooltip>
               <el-tooltip content="削除" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:job:remove']"></el-button>
               </el-tooltip>
               <el-tooltip content="1回実行します" placement="top">
                  <el-button link type="primary" icon="CaretRight" @click="handleRun(scope.row)" v-hasPermi="['monitor:job:changeStatus']"></el-button>
               </el-tooltip>
               <el-tooltip content="詳細なタスク" placement="top">
                  <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
               <el-tooltip content="调度ログ" placement="top">
                  <el-button link type="primary" icon="Operation" @click="handleJobLog(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
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

      <!-- 添加或改訂確かに时任务对话框 -->
      <el-dialog :title="title" v-model="open" width="820px" append-to-body>
         <el-form ref="jobRef" :model="form" :rules="rules" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="ミッション名" prop="jobName">
                     <el-input v-model="form.jobName" placeholder="入ってくださいミッション名" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="タスクグループ" prop="jobGroup">
                     <el-select v-model="form.jobGroup" placeholder="選んでください">
                        <el-option
                           v-for="dict in sys_job_group"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item prop="invokeTarget">
                     <template #label>
                        <span>
                           通話方法
                           <el-tooltip placement="top">
                              <template #content>
                                 <div>
                                    Beanコール例：ryTask.ryParams('ry')
                                    <br />Class类コール例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                                    <br />パラメーターの説明：文字列をサポートします，ブール，長期的な完全性，フローティング - ポイントタイプ，積分
                                 </div>
                              </template>
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                        </span>
                     </template>
                     <el-input v-model="form.invokeTarget" placeholder="入ってくださいターゲット文字列を呼び出します" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="cronパフォーマンス" prop="cronExpression">
                     <el-input v-model="form.cronExpression" placeholder="入ってくださいcron急行">
                        <template #append>
                           <el-button type="primary" @click="handleShowCron">
                              生成パフォーマンス
                              <i class="el-icon-time el-icon--right"></i>
                           </el-button>
                        </template>
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.jobId !== undefined">
                  <el-form-item label="ステータス">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_job_status"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="執行戦略" prop="misfirePolicy">
                     <el-radio-group v-model="form.misfirePolicy">
                        <el-radio-button label="1">すぐに実行します</el-radio-button>
                        <el-radio-button label="2">1回実行します</el-radio-button>
                        <el-radio-button label="3">実行を放棄します</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="同時かどうか" prop="concurrent">
                     <el-radio-group v-model="form.concurrent">
                        <el-radio-button label="0">許可する</el-radio-button>
                        <el-radio-button label="1">禁止するする</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確かに 確かに</el-button>
               <el-button @click="cancel">選ぶ 取り除く</el-button>
            </div>
         </template>
      </el-dialog>

     <el-dialog title="Cronパフォーマンス生成器" v-model="openCron" append-to-body destroy-on-close>
       <crontab ref="crontabRef" @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
     </el-dialog>

      <!-- 任务ログ详细 -->
      <el-dialog title="詳細なタスク" v-model="openView" width="700px" append-to-body>
         <el-form :model="form" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="タスク番号：">{{ form.jobId }}</el-form-item>
                  <el-form-item label="ミッション名：">{{ form.jobName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="タスクグループ：">{{ jobGroupFormat(form) }}</el-form-item>
                  <el-form-item label="作成時間：">{{ form.createTime }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="cronパフォーマンス：">{{ form.cronExpression }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="次の実行時間：">{{ parseTime(form.nextValidTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="ターゲットメソッドを呼び出します：">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ミッションステータス：">
                     <div v-if="form.status == 0">普通</div>
                     <div v-else-if="form.status == 1">停止</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="同時かどうか：">
                     <div v-if="form.concurrent == 0">許可する</div>
                     <div v-else-if="form.concurrent == 1">禁止するする</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="執行戦略：">
                     <div v-if="form.misfirePolicy == 0">デフォルトの戦略</div>
                     <div v-else-if="form.misfirePolicy == 1">すぐに実行します</div>
                     <div v-else-if="form.misfirePolicy == 2">1回実行します</div>
                     <div v-else-if="form.misfirePolicy == 3">実行を放棄します</div>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="openView = false">近い 近い</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Job">
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job";
import Crontab from '@/components/Crontab'
const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_job_group, sys_job_status } = proxy.useDict("sys_job_group", "sys_job_status");

const jobList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const openView = ref(false);
const openCron = ref(false);
const expression = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  },
  rules: {
    jobName: [{ required: true, message: "ミッション名不能为空", trigger: "blur" }],
    invokeTarget: [{ required: true, message: "ターゲット文字列を呼び出します不能为空", trigger: "blur" }],
    cronExpression: [{ required: true, message: "cron空にすることはできません", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询確かに时任务列表 */
function getList() {
  loading.value = true;
  listJob(queryParams.value).then(response => {
    jobList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** タスクグループ名字典翻译 */
function jobGroupFormat(row, column) {
  return proxy.selectDictLabel(sys_job_group.value, row.jobGroup);
}
/** 選ぶ取り除くボタン */
function cancel() {
  open.value = false;
  reset();
}
/** 表单再読み込み */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: "0"
  };
  proxy.resetForm("jobRef");
}
/** 検索ボタンアクション */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 再読み込みボタンアクション */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
// マルチ選択ボックスはデータを選択します
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.jobId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
// 更多アクション触发
function handleCommand(command, row) {
  switch (command) {
    case "handleRun":
      handleRun(row);
      break;
    case "handleView":
      handleView(row);
      break;
    case "handleJobLog":
      handleJobLog(row);
      break;
    default:
      break;
  }
}
// ミッションステータス改訂
function handleStatusChange(row) {
  let text = row.status === "0" ? "開いてください" : "停止";
  proxy.$modal.confirm('確かに认要"' + text + '""' + row.jobName + '"タスクですか？?').then(function () {
    return changeJobStatus(row.jobId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/* すぐに1回実行します */
function handleRun(row) {
  proxy.$modal.confirm('確かに认要すぐに1回実行します"' + row.jobName + '"タスクですか？?').then(function () {
    return runJob(row.jobId, row.jobGroup);
  }).then(() => {
    proxy.$modal.msgSuccess("実行は成功します");})
  .catch(() => {});
}
/** 詳細なタスク信息 */
function handleView(row) {
  getJob(row.jobId).then(response => {
    form.value = response.data;
    openView.value = true;
  });
}
/** cronパフォーマンスボタンアクション */
function handleShowCron() {
  expression.value = form.value.cronExpression;
  openCron.value = true;
}
/** 確かに確かに后回传值 */
function crontabFill(value) {
  form.value.cronExpression = value;
}
/** 任务ログ列表查询 */
function handleJobLog(row) {
  const jobId = row.jobId || 0;
  router.push('/monitor/job-log/index/' + jobId)
}
/** 増加ボタンアクション */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "タスクを追加します";
}
/** 改訂ボタンアクション */
function handleUpdate(row) {
  reset();
  const jobId = row.jobId || ids.value;
  getJob(jobId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "再注文タスク";
  });
}
/** [提案します]ボタン */
function submitForm() {
  proxy.$refs["jobRef"].validate(valid => {
    if (valid) {
      if (form.value.jobId != undefined) {
        updateJob(form.value).then(response => {
          proxy.$modal.msgSuccess("改訂成功");
          open.value = false;
          getList();
        });
      } else {
        addJob(form.value).then(response => {
          proxy.$modal.msgSuccess("増加成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 削除ボタンアクション */
function handleDelete(row) {
  const jobIds = row.jobId || ids.value;
  proxy.$modal.confirm('是否確かに认削除確かに时タスク番号为"' + jobIds + '"データ項目?').then(function () {
    return delJob(jobIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
}
/** 出力ボタンアクション */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `job_${new Date().getTime()}.xlsx`);
}

getList();
</script>
