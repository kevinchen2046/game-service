<template>
  <div>
    <el-card
      class="box-card"
      shadow="hover"
      :style="{ width: width, height: height + 'px' }"
    >
      <div style="float:center;margin-top:15px">
        <el-tooltip
          class="item"
          effect="dark"
          content="清空日志"
          placement="top"
        >
          <el-button
            type="warning"
            icon="el-icon-delete"
            size="mini"
            @click="clear()"
            >清空日志</el-button
          >
        </el-tooltip>
      </div>
      <br />
      <textarea
        ref="textarea"
        rows="3"
        cols="20"
        :style="{
          marginRight: '10px',
          resize: 'none',
          outline: 'none',
          border: 'solid 1px #fff',
          width: width,
          height: height * 0.92 + 'px',
        }"
        readonly="readonly"
        v-model="logger"
      ></textarea>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Logger",
  data: function () {
    return {
      width: "96%",
      height: window.screen.height * 0.84,
      logger: "",
    };
  },
  methods: {
    add(content) {
      this.logger += decodeURI(content) + "\n";
      this.$refs.textarea.scrollTop = this.$refs.textarea.scrollHeight;
    },
    clear() {
      this.logger = "";
    },
  },
};
</script>