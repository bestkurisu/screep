'use strict'

const MetaRole=require("roles_meta")

class Builder extends MetaRole{
    getBuild(room, options){
        this.setBuildDefaults(room, options)
        return Creep.buildFromTemplate(options.template, options.energy)
    }

    manageCreep(creep){
        if(creep.memory.state){
            switch(creep.memory.state){
                case 0:
                    Builder.normal(creep)
                case 1:
                    Builder.antiNuker(creep)
                case 2:
                    Builder.support(creep)
                case 3:
                    Builder.defense(creep)
                default:
                    Builder.normal(creep)
            }
        }
        else{
            Builder.normal(creep)
        }
    }

    normal(creep){
        if(creep.ticksToLive < 50){
            return creep.recycle()
        }
        if(creep.store['energy'] <= 0){
            creep.memory.recharge=true
        }
        if(creep.store['energy'] > creep.store.getCapacity() * 0.8){
            delete creep.memory.recharge
        }
        if(creep.memory.recharge){
            return creep.getEnergy()
        }

        if(!creep.memory.target || Game.time%10 === 0){
            var target=creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES)
            if(target){
                creep.memory.target=target.id
            }
            else{
                target=creep.room.find(FIND_STRUCTURES, {
                    filter: s => s.hits < s.hitsMax * 0.5 &&
                                s.structureType !== STRUCTURE_WALL &&
                                s.structureType !== STRUCTURE_RAMPART
                })
                if(target.length > 0){
                    target.sort((a,b) => a.hits - b.hits)
                    creep.memory.target=target[0].id
                }
                else{
                    // 闲的时候刷墙交给其他地方来判断
                    target=creep.room.memory.target
                }
            }
            if(creep.memory.target){
                var target=Game.getObjectByID(creep.memory.target)
                if(creep.pos.getRangeTo(target) > 3){
                    creep.moveTo(target)
                }
                else{
                    if(target.hits){
                        creep.repair(target)
                    }
                    else{
                        creep.build(target)
                    }
                }
            }
        }
    }

    antiNuker(creep){
        
    }

    support(creep){
        if(creep.store['energy'] <= 0){
            creep.memory.recharge=true
        }
        if(creep.store['energy'] > creep.store.getCapacity() * 0.8){
            delete creep.memory.recharge
        }
        if(creep.memory.recharge){
            if(creep.room.controller.my){
                return creep.getEnergy()
            }
            else{
                var source=creep.room.find(FIND_STRUCTURES, {
                    filter: s => s.store && s.store['energy'] >= 100 &&
                        s.structureType !== STRUCTURE_NUKER
                })
                for(s of source){
                    
                }
                if(creep.room.name !== creep.memory.chargeRoom)(
                    creep.moveTo(new RoomPosition(25,25,creep.memory.chargeRoom))
                )
                else{
                    creep.moveInRoom()
                    source=creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
                    if(source){
                        if(creep.harvest(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target)
                        }
                        return
                    }
                }
            }
        }
        if(creep.room.name !== creep.memory.targetRoom){
            creep.moveTo(new RoomPosition(25,25,creep.memory.targetRoom))
        }
    }
}