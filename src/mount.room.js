const whiteList = require('whitelist')
const createTransportList = require('transportlist')
const produce = require('factory')
const runLab = require('lab')
const runTerminal = require('terminal')
const roomManager = require('roommanager')
const highwayRoom = {
    W29N4:['W30N3','W30N4','W30N5','W30N6','W30N7','W30N8'],
}
module.exports = function () {
    _.assign(Room.prototype, roomExtension)
}

const roomExtension = {
    work: function(){
        const startCpu = Game.cpu.getUsed()
        if(!this.memory) this.memory={}
        createTransportList(this)
        produce(this)
        runLab(this)
        runTerminal(this)
        this.power()
        if(Game.time%3===0){
            this.linkTrans()
        }
        else if(Game.time%5===0){
            this.findEnemy()
            this.findRepairTarget()
        }
        else if(Game.time%20===0){
            this.findNuke()
            this.observe()
        }
        const elapsed = Game.cpu.getUsed() - startCpu
        this.memory.CPUused=elapsed
    },

    /**
    * 找敌人
    * @write Memory.rooms.warState {number}
    * @write Memory.rooms.enemys {creepObjectArray}
    */
    findEnemy: function(){
        // 主房设置战争状态
        if(this.controller.my){
            const startCpu = Game.cpu.getUsed()
            var enemys = this.find(FIND_HOSTILE_CREEPS)
            if(enemys.length>0){
                var playerEnemys = this.find(FIND_HOSTILE_CREEPS,{
                    filter: creep => creep.owner.username !== 'Invader' &&
                            whiteList.indexOf(creep.owner.username) !== -1
                })
                if(playerEnemys.length>0){
                    this.memory.warState=2
                }
                else{
                    this.memory.warState=1
                    this.memory.enemys=enemys
                }
            }
            else{
                this.memory.warState=0
            }
            const elapsed = Game.cpu.getUsed() - startCpu
            // console.log(this.name+'_findEnemy:'+elapsed)
        }
        // 外矿房仅针对npc
        else if(this.controller.reservation){
            var enemys = this.find(FIND_HOSTILE_CREEPS,{
                filter: creep => creep.owner.username === 'Invader'
            })
            if(enemys.length>0){
                this.memory.enemys=enemys
            }
        }
        // 战时监控提前预警
        else if(this.memory.observe){
            return
        }
    },

    /**
    * 找要修的建筑
    * @write Memory.rooms.repairTarget {id}
    */
    findRepairTarget: function(){
        if(this.controller.my){
            const startCpu = Game.cpu.getUsed()
            if(!this.memory.repairTarget){
                var target = this.find(FIND_STRUCTURES,{
                    filter: s => s.hits<1000 && s.structureType == STRUCTURE_RAMPART
                })
                if(target.length>0){
                    this.memory.repairTarget = target[0].id
                }
                else{
                    target = this.find(FIND_STRUCTURES,{
                        filter: s => s.hits<s.hitsMax &&
                        s.structureType != STRUCTURE_WALL &&
                        s.structureType != STRUCTURE_RAMPART
                    })
                    if(target.length>0){
                        target.sort((a,b) => a.hits - b.hits);
                        this.memory.repairTarget = target[0].id
                    }
                }
            }
            const elapsed = Game.cpu.getUsed() - startCpu
            // console.log(this.name+'_findRepairTarget:'+elapsed)
        }
    },

    /**
    * 能量传输
    * @write Memory.rooms.linkState {boolean}
    * @read Memory.rooms.linkForUse {idArray}
    * @read Memory.rooms.linkForSource {idArray}
    * @read Memory.rooms.linkCenter {id}
    */
    linkTrans: function(){
        if(this.controller.my){
            const startCpu = Game.cpu.getUsed()
            var linkForSource = _.forEach(this.memory.linkForSource, (id) => {
                Game.getObjectById(id)
            });
            var linkForUse = _.forEach(this.memory.linkForUse, (id) => {
                Game.getObjectById(id)
            });
            var linkCenter = Game.getObjectById(this.memory.linkCenter)
            var fill = true
            if(linkForUse.length>0){
                let used=true
                for(let i=0;i<linkForUp.length;i++){
                    if(linkForUse[i].store['energy']<400){
                        fill = false
                        if(linkForSource.length>0){
                            for(let j=0;j<linkForSource.length;j++){
                                if(linkForSource[j].store['energy']>400){
                                    if(linkForSource[j].transferEnergy(linkForUse[i]) === 0){
                                        used=false
                                    }
                                }
                            }
                        }
                        if(used){
                            if(linkCenter){
                                if(linkCenter.store['energy']>400){
                                    linkCenter.transferEnergy(linkForUse)
                                }
                                else{
                                    this.memory.linkState=1
                                }
                            }
                        }
                    }
                }
            }
            if(fill){
                if(linkForSource.length>0){
                    for(let i=0;i<linkForSource.length;i++){
                        if(linkForSource[i].store['energy']>600){
                            if(linkCenter.store['energy']<200){
                                linkForSource[j].transferEnergy(linkForUse[i])
                            }
                            else{
                                this.memory.linkState=0
                            }
                        }
                    }
                }
            }
            const elapsed = Game.cpu.getUsed() - startCpu
            // console.log(this.name+'_linkTrans:'+elapsed)
        }
    },

    /**
    * ob
    *@read highwayRoom {Object{mainRoom:highwayRoomArray}}
    */
    observe: function(){
        if(this.name in highwayRoom){
            var ob=Game.getObjectById(this.memory.observe)
            if(ob){
                ob.observeRoom(highwayRoom[this.name][Math.floor(Math.random()*(highwayRoom[this.name].length));])
            }
        }
    },

    /**
    * 搜索过道资源
    *@read highwayRoom {Object{mainRoom:highwayRoomArray}}
    */
    findSource: function(){
        for(key in highwayRoom){
            if(highwayRoom[key].indexOf(this.name) !== -1){
                const startCpu = Game.cpu.getUsed()
                // 搜索deposit
                var depo=this.find(FIND_DEPOSITS)
                if(depo&&depo.length>0){
                    for(let i=0;i<depo.length;i++){
                        var flag = this.lookForAt(LOOK_FLAGS,depo[i].pos)
                        if(flag.length === 0){
                            for(let j=0;j<5;j++){
                                if(!Game.flags[key+'_depo'+j]){
                                    var flagName=Game.flags[key+'_depo'+j]
                                    break
                                }
                            }
                            if(flagName&&depo[i].lastCooldown<90){
                                this.createFlag(depo[i].pos,flagName,COLOR_PURPLE)
                                Memory.flags[flagName] = {
                                    source: depo[i].id,
                                    lastCooldown: depo[i].lastCooldown,
                                }
                            }
                        }
                        else{
                            if(!flag[0].memory){
                                flag[0].memory={
                                    source: depo[i].id,
                                    lastCooldown: depo[i].lastCooldown,
                                }
                            }
                        }
                    }
                }

                // 搜索powerbank
                if(this.name!='W30N8'){
                    var pb = this.find(FIND_STRUCTURES,{
                        filter: s => s.structureType == STRUCTURE_POWER_BANK &&
                            s.power>4000 && s.ticksToDecay>4000
                    })
                }
                if(pb&&pb.length>0){
                    for(let i=0;i<pb.length;i++){
                        var flag = this.lookForAt(LOOK_FLAGS,pb[i].pos)
                        if(flag.length === 0){
                            if(!Game.flags[key+'_pb1']) var flagName = 'pb1'
                            if(!Game.flags[key+'_pb0']) var flagName = 'pb0'
                            if(flagName){
                                this.createFlag(pb[i].pos,flagName,COLOR_RED)
                                Memory.flags[flag] = {
                                    source: pb[i].id,
                                    amount:Math.floor(pb[i].power / 1600)+1,
                                    state:0,
                                }
                            }
                        }
                        else{
                            if(!flag[0].memory){
                                flag[0].memory = {
                                    source: pb[i].id,
                                    amount:Math.floor(pb[i].power / 1600)+1,
                                    state:0,
                                }
                            }
                        }
                    }
                }
                const elapsed = Game.cpu.getUsed() - startCpu
                // console.log(this.name+'_findSource:'+elapsed)
            }
        }
    },

    /**
    * 核弹警报
    */
    findNuke: function(){
        if(this.controller.my){
            var nuke = this.find(FIND_NUKES)
            if(nuke.length>0){
                console.log(this.name+'原子弹来啦')
            }
        }
    },

    /**
    * 烧抛瓦
    */
    power: function(){
        if(this.memory.powerspawn){
            var ps = Game.getObjectById(this.memory.powerspawn)
            if(ps) ps.processPower()
        }
    },
}
