'use strict'

global.SEGMENT_INTEL='room_intel'
sos.lib.vram.markCritical(SEGMENT_INTEL)

const maxScoutDistance=11

global.INTEL_LEVEL='l'
global.INTEL_PRACTICAL_LEVEL='r'
global.INTEL_OWNER='o'
global.INTEL_MINERAL='m'
global.INTEL_SOURCES='s'
global.INTEL_UPDATED='u'
global.INTEL_RESOURCE_POSITIONS='p'
global.INTEL_WALKABILITY='w'
global.INTEL_SWAMPINESS='a'
global.INTEL_BLOCKED_EXITS='b'

// 存储
Room.prototype.saveIntel=function(refresh=false){
    // 写一个memory，不知道干啥
    if (!Memory.intel) {
        Memory.intel = {
            buffer: {},
            targets: {},
            active: {}
        }
    }

    // 放一些缓存，可以接受参数进行刷新
    let roominfo
    if(refresh){
        roominfo={}
    }
    else{
        roominfo=this.getIntel({skipRequest: true})
        if(!roominfo){
            roominfo={}
        }
    }

    // 设置随机数更新时间
    roominfo[INTEL_UPDATED]=Game.time - _.random(0, 10)

    // 有controller的房间，存username、level和可用的出口
    if(this.controller){
        if(this.controller.owner){
            roominfo[INTEL_OWNER]=this.controller.owner.username
        }
        else if(this.controller.reservation){
            roominfo[INTEL_OWNER]=this.controller.reservation.username
        }
        else if(roominfo[INTEL_OWNER]){
            delete roominfo[INTEL_OWNER]
        }
        if(this.controller.level){
            roominfo[[INTEL_LEVEL]] = this.controller.level
        }
        else if(roominfo[INTEL_LEVEL]){
            delete roominfo[INTEL_LEVEL]
            delete roominfo[INTEL_PRACTICAL_LEVEL]
        }

        // 检测出口是否有墙或ram
        const blocked=[]
        if(this.wall || this.rampart){
            const centerish=this.controller.pos
            const exits=_.values(Game.map.describeExits(this.name))
            const name=this.name
            for(const exit of exits){
                const targetPos=new RoomPosition(25, 25, exit)
                const path=PathFinder.search(centerish, {pos: targetPos, range: 24},
                    {
                        swampCost: 1,
                        maxRooms: 2,
                        maxCost: 1000,
                        roomCallback: function(roomName){
                            if(roomName !== name && roomName !== exit){
                                return false
                            }
                            return Room.getCostmatrix(roomName, {
                                ignoreSourceKeepers: true,
                                ignoreCreeps: true,
                                ignoreExits: true,
                                ignoreRoads: true,
                                ignorePortals: true,
                                noCache: true
                            })
                        }
                })
                if(path.incomplete){
                    blocked.push(exit)
                }
            }
        }
        if(blocked.length>0){
            roominfo[INTEL_BLOCKED_EXITS]=blocked
        }
        else if(roominfo[INTEL_BLOCKED_EXITS]){
            delete roominfo[INTEL_BLOCKED_EXITS]
        }
    }

    // 存储能量和矿的位置
    const recordResourceLocation=this.keeperLair !== undefined
    if(recordResourceLocation){
        roominfo[INTEL_RESOURCE_POSITIONS]=[]
    }
    if(!roominfo[INTEL_MINERAL]){
        const minerals=this.find(FIND_MINERALS)
        if(minerals.length>0){
            roominfo[INTEL_MINERAL]=minerals[0].mineralType
            if(recordResourceLocation){
                roominfo[INTEL_RESOURCE_POSITIONS].push(minerals[0].pos.serialize())
            }
        }
    }
    if(!roominfo[INTEL_SOURCES]){
        const sources=this.find(FIND_SOURCES)
        if(sources.length>0){
            roominfo[INTEL_SOURCES]=sources.length
            if(recordResourceLocation){
                for(let source of sources){
                    roominfo[INTEL_RESOURCE_POSITIONS].push(source.pos.serialize())
                }
            }
        }
    }

    // 记录地形和比例
    if(!roominfo[INTEL_SWAMPINESS] || !roominfo[INTEL_WALKABILITY]){
        let walkable=0
        let swamps=0
        let x
        let y
        const terrain=Game.map.getRoomTerrain(this.name)
        for(x=0; x<50; x++){
            for(y=0; y<50; y++){
                if(terrain.isWalkable(x, y)){
                    walkable++
                }
                if(terrain.isSwamp(x, y)){
                    swamps++
                }
            }
        }
        roominfo[INTEL_WALKABILITY]=Math.round((walkable/2500)*1000)/1000
        roominfo[INTEL_SWAMPINESS]=Math.round((swamps/walkable)*1000)/1000
    }

    // 如果是侦查目标就可以移除了
    if(Memory.intel.targets[this.name]){
        delete Memory.intel.targets[this.name]
    }
    if(Memory.intel.active[this.name]){
        delete Memory.intel.active[this.name]
    }

    Memory.intel.buffer[this.name]=roominfo
    return roominfo
}

// 同步到别的地方？
Room.flushIntelToSegment=function(){
    if(!Memory.intel || !Memory.intel.buffer){
        return
    }
    const rooms=Object.keys(Memory.intel.buffer)
    if(rooms.length <= 0){
        return
    }
    const intelmap=sos.lib.vram.getData(SEGMENT_INTEL)
    sos.lib.vram.markDirty(SEGMENT_INTEL)
    let roomname
    for (roomname in Memory.intel.buffer){
        intelmap[roomname]=Memory.intel.buffer[roomname]
        delete Memory.intel.buffer[roomname]
    }
}

// 取得信息
Room.prototype.getIntel=function(opts={}){
    if(Memory.intel && Memory.intel.buffer[this.name]){
        return Memory.intel.buffer[this.name]
    }
    const intelmap=sos.lib.vram.getData(SEGMENT_INTEL)
    if(intelmap[this.name]){
        return intelmap[this.name]
    }
    if(Game.rooms[this.name]){
        Game.rooms[this.name].saveIntel(true)
        if(Memory.intel && Memory.intel.buffer[this.name]){
            return Memory.intel.buffer[this.name]
        }
    }
    else if(qlib.map.getDistanceToEmpire(this.name, 'manhattan') <= 18){
        Room.requestIntel(this.name)
    }
    return false
}

Room.getResourcesPositions=function(roomname){
    const roominfo=Room.getIntel(roomname)
    if(!roominfo[INTEL_RESOURCE_POSITIONS]){
        return false
    }
    const positions=[]
    let serializedPosition
    for(serializedPosition of roominfo[INTEL_RESOURCE_POSITIONS]){
        positions.push(RoomPosition.deserialize(serializedPosition))
    }
    return positions
}

Room.requestIntel=function(roomname){
    if(Game.rooms[roomname]){
        Game.rooms[roomname].saveIntel()
        return
    }
    if(!Game.map.isRoomAvailable(roomname)){
        return
    }
    if(!qlib.map.reachableFromEmpire(roomname, 'manhattan')){
        return
    }
    if(!Memory.intel){
        Memory.intel={
            buffer: {},
            targets: {},
            active: {}
        }
    }

    // 限制最大目标数
    const current=Object.keys(Memory.intel.targets)
    if(current.length >= MAX_INTEL_TARGETS){
        return
    }
    if(!Memory.intel.targets[roomname]){
        Memory.intel.targets[roomname]=Game.time
    }
}

Room.getScoutTarget=function(creep){
    let target=false
    let targetRooms=!Memory.intel?[]:_.shuffle(Object.keys(Memory.intel.targets))
    const assignedRooms=!Memory.intel?[]:Object.keys(Memory.intel.active)

    // 又清除一遍
    if(targetRooms.length>(MAX_INTEL_TARGETS*2)){
        Memory.intel.targets={}
        targetRooms=[]
    }

    if(targetRooms.length>0){
        let oldest=false
        let testRoom
        for(testRoom of targetRooms){
            if(!Game.map.isRoomAvailable(testRoom)){
                continue
            }
            // 已经安排过的
            if(assignedRooms.indexOf(testRoom) >= 0){
                if(Game.creeps[Memory.intel.active[testRoom]]){
                    continue
                }
                else{
                    delete Memory.intel.active[testRoom]
                }
            }
            if(Game.map.getRoomLinearDistance(creep.room.name, testRoom)>maxScoutDistance){
                continue
            }
            if(!oldest || oldest > Memory.intel.targets[testRoom]){
                oldest=Memory.intel.targets[testRoom]
                target=testRoom
            }
        }
    }
    if(Game.rooms[target]){
        target = false
    }
    if(!target){
        const adjacent=_.shuffle(_.values(Game.map.describeExits(creep.room.name)))
        target=adjacent[0]
        let oldest=0
        let testRoom
        for(testRoom of adjacent){
            if(!Game.map.isRoomAvailable(testRoom)){
                continue
            }
            const roominfo=Room.getIntel(testRoom)
            let age
            if(!roominfo){
                age=Infinity
            }
            else{
                age=assignedRooms.indexOf(testRoom) >= 0?0:Game.time-roominfo[INTEL_UPDATED]
                age=Math.floor(age/10000)*10000
            }
            if(target && oldest === age){
                if(Math.random() >= 0.5){
                    target=testRoom
                }
            }
            else if(oldest<age){
                oldest=age
                target=testRoom
            }
        }
    }
    creep.memory.starget=target
    Memory.intel.active[target]=creep.name
    return target
}
