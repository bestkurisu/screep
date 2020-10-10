'use strict'

StructureObserver.monitor=function(room, ttm = 5){
    if(!Memory.observers){
        Memory.observers={}
    }
    if(!Memory.observers.monitor){
        Memory.observers.monitor={}
    }
    if(!Memory.observers.monitor[room]){
        Memory.observers.monitor[room]={
            c: Game.time
        }
    }
    Memory.observers.monitor[room].lr=Game.time
    Memory.observers.monitor[room].ttm=ttm
}

StructureObserver.prototype.getActiveTarget=function(){
    if(!Memory.observers || !Memory.observers.monitor){
        return false
    }
    const targets=_.shuffle(Object.keys(Memory.observers.monitor))
    if(this.effects){
        return targets
    }
    else{
        const observerRoom=this.room.name
        const target=_.find(target,function(room){
            return Game.map.getRoomLinearDistance(room, observerRoom) <= 10
        })
    }
}

if(!StructureObserver.prototype.__observeRoom){
    StructureObserver.prototype.__observeRoom=StructureObserver.prototype.observeRoom
    StructureObserver.prototype.observeRoom=function(roomName){
        if(Memory.observers && Memory.observers,monitor && Memory.observers.monitor[roomName]){
            Memory.observers.monitor[roomName].ttm--
            if(Memory.observers.monitor[roomName].ttm < 1){
                delete Memory.observers.monitor[roomName]
            }
        }
        const ret=this.__observeRoom(roomName)
        if(ret === OK){
            Logger.log('Observing room ${roomName} from ${this.room.name}', LOG_INFO)
        }
        return ret
    }
}