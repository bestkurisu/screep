'use strict'

var extension={
    /**
    * 获取能量
    * @param useTerminal {Boolean}  
    * @param useStorage {Boolean}  
    * @param useDropped {Boolean}
    * @param id {String || Array}
    * @returns {Number} 0:OK, -5:没找到目标, -6:目标能量不足
    */
    getEnergy:function(useTerminal,useStorage,useDropped,id){
        // 无参数时默认模式
        if(arguments.length === 0){
            var source = this.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: s => (s.structureType === STRUCTURE_CONTAINER ||
                            s.structureType === STRUCTURE_STORAGE) &&
                            s.store['energy'] >= this.store.getFreeCapacity('energy')
            })
            if(source){
                this.goWithdraw(source)
                return OK
            }
            else{
                return ERR_NOT_FOUND
            }
        }
        // 捡垃圾和ruin
        if(useDropped){
            let source = this.room.find(FIND_DROPPED_RESOURCES)
            source.sort((a,b) => b.amount-a.amount)
            if(source.length>0 && source[0].amount>100){
                if(this.pickup(source[0]) === ERR_NOT_IN_RANGE){
                    this.moveTo(source[0])
                }
                return OK
            }
            else{
                source = this.room.find(FIND_RUINS,{
                    filter: r => r.store['energy']>0
                })
                if(source.length>0){
                    this.goWithdraw(source[0])
                    return OK
                }
            }
        }
        // 用storage
        if(useStorage){
            let storage=this.room.storage
            if(storage){
                if(storage.store['energy']>this.store.getFreeCapacity('energy')){
                    this.goWithdraw(storage)
                    return OK
                }
                else{
                    return ERR_NOT_ENOUGH_ENERGY
                }
            }
        }
        // 用terminal
        if(useTerminal){
            let terminal=this.room.terminal
            if(terminal){
                if(terminal.store['energy']>this.store.getFreeCapacity('energy')){
                    this.goWithdraw(terminal)
                    return 0
                }
                else{
                    return ERR_NOT_ENOUGH_ENERGY
                }
            }
        }
        // 从特定容器获取
        if(id){
            let source=getGameObject(id)
            if(source){
                if(source.length ===1){
                    if(source.store['energy']>this.store.getFreeCapacity('energy')){
                        this.goWithdraw(source)
                        return OK
                    }
                    else{
                        return ERR_NOT_ENOUGH_ENERGY
                    }
                }
                if(source.length>1){
                    var target=this.pos.findClosestByRange(source,{
                        filter: s => s.store['energy'] >= this.store.getFreeCapacity()
                    })
                    if(target){
                        this.goWithdraw(target)
                        return OK
                    }
                    else{
                        return ERR_NOT_ENOUGH_ENERGY
                    }
                }
            }
            return ERR_NOT_FOUND
        }
    },

    /**
     * 回收creep
     * @returns {Number} 0:OK, -5:没找到spawn
     */
    recycle:function(){
        let storage=this.room.storage
        if(!storage && this.room.terminal){
            storage=this.room.terminal
        }
        if(this.store.getUsedCapacity()>0){
            if(storage){
                if(this.pos.isNearTo(storage)){
                    this.transferAll(storage)
                }
                else{
                    this.moveTo(storage)
                }
                return 
            }
        }
        const suicidePos=this.room.getSuicidePos()
        if(suicidePos){
            if(this.pos.getRangeTo(suicidePos)>0){
                this.moveTo(suicidePos)
            }
            else{
                const spawn=this.pos.findInRange(this.room.structures[STRUCTURE_SPAWN])
                if(spawn){
                    return spawn.recycleCreep(this)
                }
                else{
                    return ERR_NOT_FOUND
                }
            }
        }
        else{
            return Creep.suicide()
        }
    },

    /**
     * 转移所有资源
     * @param target {Object}
     * @returns {Number} 0:OK, -6:携带资源不足, -9:距离太远
     */
    transferAll:function(){
        if(this.store.getUsedCapacity() <= 0){
            return ERR_NOT_ENOUGH_RESOURCES
        }
        if(!this.pos.isNearTo(target)){
            return ERR_NOT_IN_RANGE
        }
        for(let resource of Object.keys(this.store)){
            if(this.store[resource]>0){
                return this.transfer(target,resource)
            }
        }
    },

    goWithdraw:function(target, resourceType, amount){
        if(amount){
            if(this.withdraw(target, resourceType, amount) === ERR_NOT_IN_RANGE){
                this.moveTo(target)
            }
        }
        else{
            if(this.withdraw(target, resourceType, amount) === ERR_NOT_IN_RANGE){
                this.moveTo(target)
            }
        }
    },

    goTransfer:function(target, resourceType, amount){
        if(amount){
            if(this.transfer(target, resourceType, amount) === ERR_NOT_IN_RANGE){
                this.moveTo(target)
            }
        }
        else{
            if(this.transfer(target, resourceType, amount) === ERR_NOT_IN_RANGE){
                this.moveTo(target)
            }
        }
    }
}
module.exports = function () {
    _.assign(Creep.prototype, extension)
}