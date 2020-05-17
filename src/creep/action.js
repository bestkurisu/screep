var extension={
    /**
    * 获取能量
    * @param useTerminal {Boolean}  
    * @param useStorage {Boolean}  
    * @param useDropped {Boolean}
    * @param id {String || Array}
    * @returns {Number} 0:OK, -1:没找到目标, -2:目标能量不足, -3:未知错误
    */
    getEnergy: function(useTerminal,useStorage,useDropped,id){
        // 无参数时默认模式
        if(arguments.length === 0){
            var source = this.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: s => (s.structureType === STRUCTURE_CONTAINER ||
                            s.structureType === STRUCTURE_STORAGE) &&
                            s.store['energy'] >= this.store.getFreeCapacity('energy')
            })
            if(source){
                this.goWithdraw(source)
                return 0
            }
            else{
                return -1
            }
        }
        // 捡垃圾和ruin
        if(useDropped){
            var source = this.room.find(FIND_DROPPED_RESOURCES)
            source.sort((a,b) => b.amount-a.amount)
            if(source.length>0 && source[0].amount>100){
                if(this.pickup(source[0]) === ERR_NOT_IN_RANGE){
                    this.moveTo(source[0])
                }
                return 0
            }
            else{
                source = this.room.find(FIND_RUINS,{
                    filter: r => r.store['energy']>0
                })
                if(source.length>0){
                    this.goWithdraw(source[0])
                    return 0
                }
            }
        }
        // 用storage
        if(useStorage){
            var storage=this.room.storage
            if(storage){
                if(storage.store['energy']>this.store.getFreeCapacity('energy')){
                    this.goWithdraw(storage)
                    return 0
                }
                else{
                    return -2
                }
            }
        }
        // 用terminal
        if(useTerminal){
            var terminal=this.room.terminal
            if(terminal){
                if(terminal.store['energy']>this.store.getFreeCapacity('energy')){
                    this.goWithdraw(terminal)
                    return 0
                }
                else{
                    return -2
                }
            }
        }
        // 从特定容器获取
        if(id){
            var source=getGameObject(id)
            if(source){
                if(source.length ===1){
                    if(source.store['energy']>this.store.getFreeCapacity('energy')){
                        this.goWithdraw(source)
                        return 0
                    }
                    else{
                        return -2
                    }
                }
                if(source.length>1){
                    var target=this.pos.findClosestByRange(source,{
                        filter: s => s.store['energy'] >= this.store.getFreeCapacity()
                    })
                    if(target){
                        this.goWithdraw(target)
                        return 0
                    }
                    else{
                        return -2
                    }
                }
            }
            return -1
        }
        return -3
    }
}
module.exports = function () {
    _.assign(Creep.prototype, extension)
}