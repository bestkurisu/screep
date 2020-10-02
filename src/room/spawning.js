'use strict'

const SPAWN_DEFAULT_PRIORITY=4

Room.prototype.queueCreep=function(role, name, option={}){
    if(!option.priority){
        option.priority=SPAWN_DEFAULT_PRIORITY
    }
    if(!Memory.spawnqueue){
        Memory.spawnqueue={}
    }
    if(!Memory.spawnqueue.index){
        Memory.spawnqueue.index={}
    }
    if(!Memory.spawnqueue.index[this.name]){
        Memory.spawnqueue.index[this.name]={}
    }
    option.role=role
    Memory.spawnqueue.index[this.name][name]=options
    return name
}

Room.prototype.clearSpawnQueue=function(){
    Room.clearSpawnQueue(this.name)
}
Room.clearSpawnQueue=function(roomName){
    if(!Memory.spawnqueue){
        return
    }
    if(Memory.spawnqueue[roomName]){
        delete Memory.spawnqueue[roomName]
        return
    }
}

Room.prototype.getQueuedCreep=function(){
    if(!Memory.spawnqueue || !Memory.spawnqueue.index || !Memory.spawnqueue.index[this.name]){
        return false
    }
    const creeps=Object.keys(Memory.spawnqueue.index[this.name])
    const that = this
    creeps.sort(function (a, b){
        const aP = Memory.spawnqueue.index[that.name][a].priority ? Memory.spawnqueue.index[that.name][a].priority : SPAWN_DEFAULT_PRIORITY
        const bP = Memory.spawnqueue.index[that.name][b].priority ? Memory.spawnqueue.index[that.name][b].priority : SPAWN_DEFAULT_PRIORITY
        return aP - bP
    })
    const options = Memory.spawnqueue.index[this.name][creeps[0]]
    const role = Creep.getRole(options.role)
    const build = role.getBuild(this, options)
    if(Creep.getCost(build)>this.energyAvailable){
        return false
    }
    options.build=build
    options.name=creeps[0]
    if(!this.queued){
        this.queued=[]
    }
    this.queued.push(options.name)
    delete Memory.spawnqueue.index[this.name][creeps[0]]
    return options
}

Room.prototype.isQueued=function(name){
    if(!Memory.spawnqueue || !Memory.spawnqueue.index || !Memory.spawnqueue.index[this.name]){
        return false
    }
    if(Memory.spawnqueue.index[this.name][name]){
        return true
    }
    return !!this.queued && this.queued.indexOf(name) >= 0
}
Room.isQueued = function (name){
    if(!Memory.spawnqueue || !Memory.spawnqueue.index || !Memory.spawnqueue.index[this.name]){
        return false
    }
    const spawnrooms = Object.keys(Memory.spawnqueue.index)
    for(let room of spawnrooms){
        if(Game.rooms[room] && Game.rooms[room].isQueued(name)){
            return true
        }
    }
    return false
}
