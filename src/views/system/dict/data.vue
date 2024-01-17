<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="辞書名" prop="dictType">
            <el-select v-model="queryParams.dictType" style="width: 200px">
               <el-option
                  v-for="item in typeOptions"
                  :key="item.dictId"
                  :label="item.dictName"
                  :value="item.dictType"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="辞書ラベル" prop="dictLabel">
            <el-input
               v-model="queryParams.dictLabel"
               placeholder="辞書ラベルを入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="数据ステータス" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">選ぶり戻し</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:dict:add']"
            >増加</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:dict:edit']"
            >改訂</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:dict:remove']"
            >取り除く去</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:dict:export']"
            >出力</el-button>
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

      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="辞書" align="center" prop="dictCode" />
         <el-table-column label="辞書ラベル" align="center" prop="dictLabel">
            <template #default="scope">
               <span v-if="(scope.row.listClass == '' || scope.row.listClass == 'default') && (scope.row.cssClass == '' || scope.row.cssClass == null)">{{ scope.row.dictLabel }}</span>
               <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass" :class="scope.row.cssClass">{{ scope.row.dictLabel }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="辞書のキー値" align="center" prop="dictValue" />
         <el-table-column label="辞書" align="center" prop="dictSort" />
         <el-table-column label="ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="述べる" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column label="作成時間" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="動作します" align="center" width="160" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">改訂</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">取り除く去</el-button>
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
         <el-form ref="dataRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="辞書">
               <el-input v-model="form.dictType" :disabled="true" />
            </el-form-item>
            <el-form-item label="データラベル" prop="dictLabel">
               <el-input v-model="form.dictLabel" placeholder="データラベルを入力してください" />
            </el-form-item>
            <el-form-item label="データキー" prop="dictValue">
               <el-input v-model="form.dictValue" placeholder="データキーを入力してください" />
            </el-form-item>
            <el-form-item label="スタイル属性" prop="cssClass">
               <el-input v-model="form.cssClass" placeholder="スタイル属性を入力してください" />
            </el-form-item>
            <el-form-item label="ソートを表示します" prop="dictSort">
               <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="明らかにされたスタイル" prop="listClass">
               <el-select v-model="form.listClass">
                  <el-option
                     v-for="item in listClassOptions"
                     :key="item.value"
                     :label="item.label + '(' + item.value + ')'"
                     :value="item.value"
                  ></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="ステータス" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="述べる" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="コンテンツを入力してください"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確かに 確かに</el-button>
               <el-button @click="cancel">選ぶ 取り除く</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Data">
import useDictStore from '@/store/modules/dict'
import { optionselect as getDictOptionselect, getType } from "@/api/system/dict/type";
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const dataList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const defaultDictType = ref("");
const typeOptions = ref([]);
const route = useRoute();
// データラベル明らかにされたスタイル
const listClassOptions = ref([
  { value: "default", label: "デフォルト" }, 
  { value: "primary", label: "主要" }, 
  { value: "success", label: "成功" },
  { value: "info", label: "情報" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危険" }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictType: undefined,
    dictLabel: undefined,
    status: undefined
  },
  rules: {
    dictLabel: [{ required: true, message: "データラベル不能为空", trigger: "blur" }],
    dictValue: [{ required: true, message: "データキー不能为空", trigger: "blur" }],
    dictSort: [{ required: true, message: "データ注文は空にすることはできません", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询辞書详细 */
function getTypes(dictId) {
  getType(dictId).then(response => {
    queryParams.value.dictType = response.data.dictType;
    defaultDictType.value = response.data.dictType;
    getList();
  });
}

/** 查询辞書列表 */
function getTypeList() {
  getDictOptionselect().then(response => {
    typeOptions.value = response.data;
  });
}
/** クエリ辞書データリスト */
function getList() {
  loading.value = true;
  listData(queryParams.value).then(response => {
    dataList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 選ぶ取り除くボタン */
function cancel() {
  open.value = false;
  reset();
}
/** 表单選ぶり戻し */
function reset() {
  form.value = {
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: "default",
    dictSort: 0,
    status: "0",
    remark: undefined
  };
  proxy.resetForm("dataRef");
}
/** 検索ボタン動作します */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 返回ボタン動作します */
function handleClose() {
  const obj = { path: "/system/dict" };
  proxy.$tab.closeOpenPage(obj);
}
/** 選ぶり戻しボタン動作します */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.dictType = defaultDictType.value;
  handleQuery();
}
/** 増加ボタン動作します */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "辞書データを追加します";
  form.value.dictType = queryParams.value.dictType;
}
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.dictCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 改訂ボタン動作します */
function handleUpdate(row) {
  reset();
  const dictCode = row.dictCode || ids.value;
  getData(dictCode).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "カスタマイズされた辞書データ";
  });
}
/** 提交ボタン */
function submitForm() {
  proxy.$refs["dataRef"].validate(valid => {
    if (valid) {
      if (form.value.dictCode != undefined) {
        updateData(form.value).then(response => {
          useDictStore().removeDict(queryParams.value.dictType);
          proxy.$modal.msgSuccess("改訂成功");
          open.value = false;
          getList();
        });
      } else {
        addData(form.value).then(response => {
          useDictStore().removeDict(queryParams.value.dictType);
          proxy.$modal.msgSuccess("増加成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 取り除く去ボタン動作します */
function handleDelete(row) {
  const dictCodes = row.dictCode || ids.value;
  proxy.$modal.confirm('是否確かに认取り除く去辞書为"' + dictCodes + '"データ項目？').then(function() {
    return delData(dictCodes);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取り除く去成功");
    useDictStore().removeDict(queryParams.value.dictType);
  }).catch(() => {});
}
/** 出力ボタン動作します */
function handleExport() {
  proxy.download("system/dict/data/export", {
    ...queryParams.value
  }, `dict_data_${new Date().getTime()}.xlsx`);
}

getTypes(route.params && route.params.dictId);
getTypeList();
</script>
