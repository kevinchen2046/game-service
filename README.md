# game-service
游戏自动化构建服务

## 配置(package.json)
```json
{
    "workpath": {
        /**客户端路径*/
        "client": "E:/project/xxj_dev/client",
        /**服务端路径*/
        "server": "E:/project/xxj_dev/server",
        /**策划表路径*/
        "excel": "E:/project/xxj_dev/xls",
        /**客户端配置输出路径*/
        "client-config": "E:/project/xxj_dev/client/resource/config",
        /**服务端配置输出路径*/
        "server-config": "E:/project/xxj_dev/server_build/conftab",
        /**服务端配置发布输出路径*/
        "server-release-config": "C:/Users/Administrator/AppData/MixE/xxj_dev/game_version/conftab",
        /**协议路径*/
        "proto":"E:/project/xxj_dev/proto",
        /**客户端协议输出路径*/
        "client-proto":"E:/project/xxj_dev/client/libs/proto",
        /**服务端协议输出路径*/
        "server-proto":"E:/project/xxj_dev/server/src/lib/proto"
    },
    "template": {
        /**协议默认模板文件路径*/
        "proto": "template/proto"
    },
    "appport": {
        /**客户端访问服务端口*/
        "client-service": 7888,
        /**控制台前端服务端口*/
        "console-service": 9888,
        /**控制台后端服务端口*/
        "build-service": 14739
    }
}
```

## 技术说明
- 客户端访问服务
  - http-server 
- 控制台访问页面
  - vue2.0 脚手架
  - element-ui
- 控制台后端服务
  - websocket
## 启动 
```
npm run start
```