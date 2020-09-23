/**添加物品*/
class SAddItem{
    __cmd__:1234
    /**ID*/
    id:number
    /**名字*/
    name:string
}
/**移除物品*/
class SRemoveItem{
    __cmd__:1235
    /**ID*/
    id:number
    /**名字*/
    name:string
    /**复杂对象*/
    item:SAddItem
    /**数组对象 */
    list:number[]
}