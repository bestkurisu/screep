'use strict'

class Cluster{
    static clean(){
        var clusters=Cluster.listAll()
        for(var clusterName of clusters){
            var cluster=new Cluster(clusterName)
            if(cluster.getClusterSize() <= 0){
                delete Memory.clusters[clusterName]
            }
        }
    }

    static listAll(){
        if(!Memory.clusters){
            return []
        }
        return Object.keys(Memory.clusters)
    }

    constructor(name, room = false){
        this.name=name
        this.room=room
        if(!Memory.clusters){
            Memory.clusters={}
        }
        if(!Memory.clusters[name]){
            Memory.clusters[name]={
                creeps: []
            }
        }
        this.memory=Memory.clusters[name]
        this.creeps=[]
        for(var creepName of this.memory.creeps){
            var creep=Game.creeps[creepName]
            if(creep){
                if(!creep.spawning){
                    creep.cluster=this
                    this.creeps.push(creep)
                }
                continue
            }
            if(room){
                if(!room.isQueued(creepName)){
                    this.memory.creeps.splice(this.memory.creeps.indexOf(creepName), 1)
                }
            }
            else if(!Room.isQueued(creepName)){
                this.memory.creeps.splice(this.memory.creeps.indexOf(creepName), 1)
            }
        }
    }

    getClusterSize(){
        return this.memory.creeps.length
    }

    sizeCluster(role, quantity, options = {}, room = false){
        if(options.respawnAge){
            const creeps=this.getCreeps()
            quantity += _.filter(creeps, function(creep){
                return creep.ticksToLive <= options.respawnAge
            }).length
            delete options.respawnAge
        }
        if(this.memory.creeps.length >= quantity){
            return true
        }
        var spawnRoom=room || this.room
        while(this.memory.creeps.length < quantity){
            this.memory.creeps.push(spawnRoom.queueCreep(role, options))
        }
    }

    getCreeps(){
        return this.creeps
    }

    forEach(creepAction){
        const creeps=this.getCreeps()
        for(const creep of creeps){
            try{
                if(creep.spawning){
                    continue
                }
                creepAction(creep)
            }
            catch(e){
                Logger.log(e, LOG_ERROR)
                if(e.stack){
                    Logger.log(e.stack, LOG_ERROR)
                }
            }
        }
    }
}

module.exports=Cluster