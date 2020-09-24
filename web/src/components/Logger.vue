<template>
  <div>
    <el-divider content-position="center">
      日志
      <el-tooltip class="item" effect="dark" content="清空日志" placement="top">
        <el-button
          type="warning"
          icon="el-icon-delete"
          style="margin-right:0px"
          size="mini"
          @click="clear()"
          circle
        ></el-button>
      </el-tooltip>
    </el-divider>

    <textarea
      rows="3"
      cols="20"
      style="margin-right:10px;width:96%;height:860px;resize: none;outline:none;border:solid 1px #ccc;"
      readonly="readonly"
      v-model="logger"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: "Logger",
  data: function () {
    return {
      logger: "....",
    };
  },
  methods: {
    clear(){
      this.logger = "";
    }
  }
};
</script>