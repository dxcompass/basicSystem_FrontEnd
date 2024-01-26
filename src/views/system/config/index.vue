<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="160px">
         <el-form-item label="パラメーター名" prop="configName">
            <el-input
               v-model="queryParams.configName"
               placeholder="パラメーター名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="パラメーターキー名" prop="configKey">
            <el-input
               v-model="queryParams.configKey"
               placeholder="パラメーターキー名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="bulit-in" prop="configType">
            <el-select v-model="queryParams.configType" placeholder="bulit-in" clearable>
               <el-option
                  v-for="dict in sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="作成時間" style="width: 308px;">
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
               v-hasPermi="['system:config:add']"
            >増加</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:config:edit']"
            >改訂</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:config:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:config:export']"
            >出力</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Refresh"
               @click="handleRefreshCache"
               v-hasPermi="['system:config:remove']"
            >キャッシュを更新します</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="パラメーターメインキー" align="center" prop="configId" />
         <el-table-column label="パラメーター名" align="center" prop="configName" :show-overflow-tooltip="true" />
         <el-table-column label="パラメーターキー名" align="center" prop="configKey" :show-overflow-tooltip="true" />
         <el-table-column label="パラメーターキー値" align="center" prop="configValue" :show-overflow-tooltip="true" />
         <el-table-column label="bulit-in" align="center" prop="configType">
            <template #default="scope">
               <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
            </template>
         </el-table-column>
         <el-table-column label="備考" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column label="作成時間" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="アクション" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']" >改訂</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']">削除</el-button>
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

      <!-- [パラメーター構成]ダイアログボックスを追加または変更します -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="configRef" :model="form" :rules="rules" label-width="160px">
            <el-form-item label="パラメーター名" prop="configName">
               <el-input v-model="form.configName" placeholder="パラメーター名を入力してください" />
            </el-form-item>
            <el-form-item label="パラメーターキー名" prop="configKey">
               <el-input v-model="form.configKey" placeholder="パラメーターキー名を入力してください" />
            </el-form-item>
            <el-form-item label="パラメーターキー値" prop="configValue">
               <el-input v-model="form.configValue" placeholder="パラメーターキー値を入力してください" />
            </el-form-item>
            <el-form-item label="bulit-in" prop="configType">
               <el-radio-group v-model="form.configType">
                  <el-radio
                     v-for="dict in sys_yes_no"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="備考" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="コンテンツを入力してください" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確認</el-button>
               <el-button @click="cancel">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Config">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config";

const { proxy } = getCurrentInstance();
const { sys_yes_no } = proxy.useDict("sys_yes_no");

const configList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined
  },
  rules: {
    configName: [{ required: true, message: "パラメーター名不能为空", trigger: "blur" }],
    configKey: [{ required: true, message: "パラメーターキー名不能为空", trigger: "blur" }],
    configValue: [{ required: true, message: "パラメーターキー値不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** クエリパラメーターリスト */
function getList() {
  loading.value = true;
  listConfig(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    configList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 選ぶ取り除くボタン */
function cancel() {
  open.value = false;
  reset();
}
/** 表单再読み込み */
function reset() {
  form.value = {
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
  };
  proxy.resetForm("configRef");
}
/** 検索ボタンアクション */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 再読み込みボタンアクション */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 増加ボタンアクション */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "パラメーターを追加します";
}
/** 改訂ボタンアクション */
function handleUpdate(row) {
  reset();
  const configId = row.configId || ids.value;
  getConfig(configId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "パラメーター設定";
  });
}
/** [提案します]ボタン */
function submitForm() {
  proxy.$refs["configRef"].validate(valid => {
    if (valid) {
      if (form.value.configId != undefined) {
        updateConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("改訂成功");
          open.value = false;
          getList();
        });
      } else {
        addConfig(form.value).then(response => {
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
  const configIds = row.configId || ids.value;
  proxy.$modal.confirm('是否確かに认削除参数编号为"' + configIds + '"データ項目？').then(function () {
    return delConfig(configIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
}
/** 出力ボタンアクション */
function handleExport() {
  proxy.download("system/config/export", {
    ...queryParams.value
  }, `config_${new Date().getTime()}.xlsx`);
}
/** キャッシュを更新しますボタンアクション */
function handleRefreshCache() {
  refreshCache().then(() => {
    proxy.$modal.msgSuccess("キャッシュを更新します成功");
  });
}

getList();
</script>
