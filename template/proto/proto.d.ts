declare namespace proto {
    /**该字段指示是否开启缓存池 客户端默认为true 服务端默认为false*/
    let poolenable:boolean
    /**对象自动销毁时间 */
    let destorytime: number
    /**对象销毁检查间隔 */
    let destorychecktime: number
    class Message {
        constructor()
        /**该字段指示是否在消息收发上下文执行后立刻回收 */
        __autorecover__: boolean;
    }
    /**
     * 获取消息体
     * @param clazz 生成的消息体结构定义
     */
    function get<T extends Message>(clazz: { new (): T }): T
    /**
     * 回收消息体
     * @param object 消息体结构对象
     */
    function to<T extends Message>(object: T)
    /**
     * 获取模块Id
     * @param {number} msgid 消息Id 命令Id
     * @param {number} moduleId 默认模块Id为-1
     */
    function getModuleId(msgid: number, moduleId?: number)
    /**获取调试信息 */
    function __debug__();
}
///////////////////////GENERATE-START/////////////////////
declare namespace proto.bag {
    class SAddItem extends proto.Message {
        id: number
        count: number
    }
    class SRemoveItem extends proto.Message {
        ActivityInfo: string
    }
}

declare namespace proto.activity {
    class CAddItem extends proto.Message {
    }
    class CRemoveItem extends proto.Message {
        ActivityInfo: string
    }
}
///////////////////////GENERATE-END/////////////////////