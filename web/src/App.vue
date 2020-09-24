<template>
    <el-container>
        <el-container>
            <el-main>
                <Title/>
                <br/>
                <font face="微软雅黑" color="gray" size="4" style="font-weight:550;">配置</font>
                <el-divider content-position="right">
                    <el-tooltip class="item" effect="dark" content="开始构建" placement="top" style="font-size:150%">
                        <el-button type="primary" :icon="task.config.isbuild?'el-icon-loading':'el-icon-sugar'"
                            :disabled="disabled" @click="buildconfig()" round>Build</el-button>
                    </el-tooltip>
                </el-divider>

                <el-steps :active="task.config.phase" simple style="margin-top: 20px">
                    <el-step title="更新XLS"></el-step>
                    <el-step title="更新Client"></el-step>
                    <el-step title="更新Server"></el-step>
                    <el-step title="导出表"></el-step>
                    <el-step title="提交到客户端"></el-step>
                    <el-step title="提交到服务端"></el-step>
                    <el-step title="结束"></el-step>
                </el-steps>
                <br/>
                <font face="微软雅黑" color="gray" size="4" style="font-weight:550;">协议</font>
                <el-divider content-position="right">
                    <el-tooltip class="item" effect="dark" content="开始构建" placement="top" style="font-size:150%">
                        <el-button type="success" :icon="task.proto.isbuild?'el-icon-loading':'el-icon-grape'"
                            :disabled="disabled" @click="buildproto()" round>Build</el-button>
                    </el-tooltip>
                </el-divider>

                <el-steps :active="task.proto.phase" simple style="margin-top: 20px">
                    <el-step title="更新Protos"></el-step>
                    <el-step title="更新Client"></el-step>
                    <el-step title="更新Server"></el-step>
                    <el-step title="生成"></el-step>
                    <el-step title="提交到客户端"></el-step>
                    <el-step title="提交到服务端"></el-step>
                    <el-step title="结束"></el-step>
                </el-steps>
                <br/>
                <font face="微软雅黑" color="gray" size="4" style="font-weight:550;">客户端</font>
                <el-divider content-position="right">
                    <el-tooltip class="item" effect="dark" content="开始构建" placement="top" style="font-size:150%">
                        <el-button type="primary" :icon="task.client.isbuild?'el-icon-loading':'el-icon-grape'"
                            :disabled="disabled" @click="buildclient()" round>Build</el-button>
                    </el-tooltip>
                </el-divider>

                <el-steps :active="task.client.phase" simple style="margin-top: 20px">
                    <el-step title="更新Client"></el-step>
                    <el-step title="编译"></el-step>
                    <el-step title="结束"></el-step>
                </el-steps>
                <br/>
                <font face="微软雅黑" color="gray" size="4" style="font-weight:550;">服务端 </font>
                <el-divider content-position="right">
                    <el-tooltip class="item" effect="dark" content="开始构建" placement="top" style="font-size:150%">
                        <el-button type="success" :icon="task.server.isbuild?'el-icon-loading':'el-icon-apple'"
                            :disabled="disabled" @click="buildserver()" round>Build</el-button>
                    </el-tooltip>
                </el-divider>

                <el-steps :active="task.server.phase" simple style="margin-top: 20px">
                    <el-step title="更新Server"></el-step>
                    <el-step title="编译"></el-step>
                    <el-step title="结束"></el-step>
                </el-steps>
                <br/>
                <font face="微软雅黑" color="gray" size="4" style="font-weight:550;">全部构建</font>
                <el-divider content-position="right">
                    <el-tooltip class="item" effect="dark" content="开始构建" placement="top" style="font-size:150%">
                        <el-button type="primary" :icon="task.all.isbuild?'el-icon-loading':'el-icon-cold-drink'"
                            :disabled="disabled" @click="buildall()" round>Build</el-button>
                    </el-tooltip>
                </el-divider>

                <el-steps :active="task.all.phase" simple style="margin-top: 20px">
                    <el-step title="更新XLS"></el-step>
                    <el-step title="更新Client"></el-step>
                    <el-step title="更新Server"></el-step>
                    <el-step title="导出表"></el-step>
                    <el-step title="提交到Client"></el-step>
                    <el-step title="提交到Server"></el-step>
                    <el-step title="编译Client"></el-step>
                    <el-step title="编译Server"></el-step>
                    <el-step title="结束"></el-step>
                </el-steps>
            </el-main>

            <el-footer style="text-align: center;color: #888888;">
                <WordLamp/>
            </el-footer>
        </el-container>
        <el-aside width="500px">
            <Logger/>
        </el-aside>
    </el-container>
</template>

<script>
import Title from './components/Title.vue'
import Logger from './components/Logger.vue'
import WordLamp from './components/WordLamp.vue'
// import Util from './js/utils';
import dataconfig from '@/static/web.config.json';

export default {
  name: 'App',
  components: {
    Title,Logger,WordLamp
  },
  data:function(){return {
        disabled: true,
        curtask: null,
        task: {
            config: {
                maxtask: 7,
                isbuild: false,
                phase: 0
            },
            proto: {
                maxtask: 7,
                isbuild: false,
                phase: 0
            },
            client: {
                maxtask: 3,
                isbuild: false,
                phase: 0
            },
            server: {
                maxtask: 3,
                isbuild: false,
                phase: 0
            },
            all: {
                maxtask: 9,
                isbuild: false,
                phase: 0
            },
        },
        ws: null
    }},
    mounted: function () {
        this.ws = new WebSocket(`ws://${dataconfig.host}:${dataconfig.port}`);
        this.ws.onopen = () => {
            console.log('Connection to server opened');
            this.ws.send(JSON.stringify({ build: 'state' }));
        }
        this.ws.onmessage = (msg) => {
            var data = JSON.parse(msg.data);
            switch (data.type) {
                case 'state':
                    this.update(data);
                    break;
                case 'log':
                    this.updatelog(data.content);
                    break;
            }
        }
    },
    methods: {
        update: function (data) {
            console.log(data);
            this.disabled = false;
            this.task.config.isbuild = data.task.config.isrun;
            this.task.config.phase = data.task.config.phase;
            this.task.proto.isbuild = data.task.proto.isrun;
            this.task.proto.phase = data.task.proto.phase;
            this.task.client.isbuild = data.task.client.isrun;
            this.task.client.phase = data.task.client.phase;
            this.task.server.isbuild = data.task.server.isrun;
            this.task.server.phase = data.task.server.phase;
            this.task.all.isbuild = data.task.all.isrun;
            this.task.all.phase = data.task.all.phase;
        },
        updatelog(content) {
            this.logger += '\n' + decodeURI(content);
        },
        buildconfig: function () {
            if (this.isbuild()) {
                this.$notify({ message: '请等待任务构建完成...', type: 'warning' });
                return;
            }
            this.$notify({ message: '开始构建配置', type: 'success' });
            this.ws.send(JSON.stringify({ build: 'config' }));
        },
        buildproto: function () {
            if (this.isbuild()) {
                this.$notify({ message: '请等待任务构建完成...', type: 'warning' });
                return;
            }
            this.$notify({ message: '开始构建协议', type: 'success' });
            this.ws.send(JSON.stringify({ build: 'proto' }));
        },
        buildclient: function () {
            if (this.isbuild()) {
                this.$notify({ message: '请等待任务构建完成...', type: 'warning' });
                return;
            }
            this.$notify({ message: '开始构建客户端', type: 'warning' });
            this.ws.send(JSON.stringify({ build: 'client' }));
        },
        buildserver: function () {
            if (this.isbuild()) {
                this.$notify({ message: '请等待任务构建完成...', type: 'warning' });
                return;
            }
            this.$notify({ message: '开始构建服务器', type: 'warning' });
            this.ws.send(JSON.stringify({ build: 'server' }));
        },
        buildall: function () {
            if (this.isbuild()) {
                this.$notify({ message: '请等待任务构建完成...', type: 'warning' });
                return;
            }
            this.$notify({ message: '开始全部构建', type: 'warning' });
            this.ws.send(JSON.stringify({ build: 'all' }));
        },
        isbuild: function () {
            return this.task.config.isbuild || this.task.client.isbuild || this.task.server.isbuild || this.task.all.isbuild
        }
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
