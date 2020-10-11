'use strict'

StructureTerminal.prototype.canReceive=function(resource=false){
    const buffer=this.store.getFreeCapacity()
    if(buffer < 30000){
        if(buffer > 5000){
            if(resource === 'energy' && this.store['energy'] < 5000){
                return true
            }
        }
        return false
    }
    return true
}

StructureTerminal.prototype.work=function(){
    if(!this.memory){
        this.memory={
            task:{}
        }
        return false
    }
    var task=this.memory.task
    if(task.length <= 0){
        return false
    }
    if(this.cooldown){
        return ERR_BUSY
    }
    task.sort((a, b) => b.priority - a.priority)
    if(task[0].type === 'deal'){
        if(Game.market.deal(task[0].id, task[0].amount, task[0].roomName) === OK){
            task.shift()
            return OK
        }
        else{
            return Game.market.deal(task[0].id, task[0].amount, task[0].roomName)
        }
    }
}

if(!StructureTerminal.prototype.__send){
    StructureTerminal.prototype.__send=StructureTerminal.prototype.send
    StructureTerminal.prototype.send=function(resourceType, amount, destination, description){
        const ret=this.__send(resourceType, amount, destination, description)
        if(ret === OK){
            let log=`Terminal in ${this.room.name} sent ${amount} ${resourceType} to ${destination}`
            if (description) {
                log += `: ${description}`
            }
            Logger.log(log, LOG_INFO)
        }
        else{
            const log=`Terminal in ${this.room.name} failed to send ${amount} ${resourceType} to ${destination} due to error ${ret}`
            Logger.log(log, LOG_ERROR)
        }
    }
}