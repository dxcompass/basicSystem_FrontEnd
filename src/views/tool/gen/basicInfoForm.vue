<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="テーブル名" prop="tableName">
          <el-input placeholder="倉庫名を入力してください" v-model="info.tableName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="表の説明" prop="tableComment">
          <el-input placeholder="入ってください" v-model="info.tableComment" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="スポーツ名" prop="className">
          <el-input placeholder="入ってください" v-model="info.className" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="著者" prop="functionAuthor">
          <el-input placeholder="入ってください" v-model="info.functionAuthor" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="述べる" prop="remark">
          <el-input type="textarea" :rows="3" v-model="info.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
defineProps({
  info: {
    type: Object,
    default: null
  }
});

// フォーム検証
const rules = ref({
  tableName: [{ required: true, message: "入ってくださいテーブル名", trigger: "blur" }],
  tableComment: [{ required: true, message: "入ってください表の説明", trigger: "blur" }],
  className: [{ required: true, message: "入ってくださいスポーツ名", trigger: "blur" }],
  functionAuthor: [{ required: true, message: "入ってください著者", trigger: "blur" }]
});
</script>
