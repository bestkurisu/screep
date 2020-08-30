'use strict'

var whitelist=require('whitelist')
var extension={
    /**
    * 搜索房间敌人
    * @returns {Array}
    * @returns {Number} 0:任务已完成, -1:无任务
    */
    getHostileCreep=function(){
        var creep=this.find(FIND_HOSTILE_CREEPS,{
            filter: c => !(c.owner.username in whitelist) &&
                        c.owner.username !== 'Invader' 
        })
        var npc=this.find(FIND_HOSTILE_CREEPS,{
            filter: c => c.owner.username === 'Invader'
        })
    }
}


_.assign(Room.prototype, extension)