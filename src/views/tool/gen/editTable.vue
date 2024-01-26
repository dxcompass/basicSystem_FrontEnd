<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本情報" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="フィールド情報" name="columnInfo">
        <el-table ref="dragTable" :data="columns" row-key="columnId" :max-height="tableHeight">
          <el-table-column label="シリアルナンバー" type="index" min-width="5%"/>
          <el-table-column
            label="フィールド名"
            prop="columnName"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="フィールド説明" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="物理タイプ"
            prop="columnType"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Javaタイプ" min-width="11%">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java属性" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="入れる" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="編集" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="リスト" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="お問い合わせください" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="お問い合わせください方式" min-width="10%">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="持つ必要があります" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isRequired"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="显示タイプ" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="テキストボックス" value="input" />
                <el-option label="テキストドメイン" value="textarea" />
                <el-option label="ドロップダウンボックス" value="select" />
                <el-option label="シングルボックス" value="radio" />
                <el-option label="チェックボックス" value="checkbox" />
                <el-option label="日付制御" value="datetime" />
                <el-option label="写真をアップロードする" value="imageUpload" />
                <el-option label="ファイルアップロード" value="fileUpload" />
                <el-option label="豊富なテキストコントロール" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典タイプ" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable placeholder="を選んでください">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType">
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
              </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="情報を生成します" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <div style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="submitForm()">提出する</el-button>
        <el-button @click="close()">戻る</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup name="GenEdit">
import { getGenTable, updateGenTable } from "@/api/tool/gen";
import { optionselect as getDictOptionselect } from "@/api/system/dict/type";
import basicInfoForm from "./basicInfoForm";
import genInfoForm from "./genInfoForm";

const route = useRoute();
const { proxy } = getCurrentInstance();

const activeName = ref("columnInfo");
const tableHeight = ref(document.documentElement.scrollHeight - 245 + "px");
const tables = ref([]);
const columns = ref([]);
const dictOptions = ref([]);
const info = ref({});

/** 提出するボタン */
function submitForm() {
  const basicForm = proxy.$refs.basicInfo.$refs.basicInfoForm;
  const genForm = proxy.$refs.genInfo.$refs.genInfoForm;
  Promise.all([basicForm, genForm].map(getFormPromise)).then(res => {
    const validateResult = res.every(item => !!item);
    if (validateResult) {
      const genTable = Object.assign({}, info.value);
      genTable.columns = columns.value;
      genTable.params = {
        treeCode: info.value.treeCode,
        treeName: info.value.treeName,
        treeParentCode: info.value.treeParentCode,
        parentMenuId: info.value.parentMenuId
      };
      updateGenTable(genTable).then(res => {
        proxy.$modal.msgSuccess(res.msg);
        if (res.code === 200) {
          close();
        }
      });
    } else {
      proxy.$modal.msgError("フォーム検証は渡されません，请重新检查提出する内容");
    }
  });
}
function getFormPromise(form) {
  return new Promise(resolve => {
    form.validate(res => {
      resolve(res);
    });
  });
}
function close() {
  const obj = { path: "/tool/gen", query: { t: Date.now(), pageNum: route.query.pageNum } };
  proxy.$tab.closeOpenPage(obj);
}

(() => {
  const tableId = route.params && route.params.tableId;
  if (tableId) {
    // テーブルの詳細を取得します
    getGenTable(tableId).then(res => {
      columns.value = res.data.rows;
      info.value = res.data.info;
      tables.value = res.data.tables;
    });
    /** お問い合わせください字典下拉リスト */
    getDictOptionselect().then(response => {
      dictOptions.value = response.data;
    });
  }
})();
</script>
