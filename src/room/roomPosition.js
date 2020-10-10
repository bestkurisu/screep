'use strict'

createBoundingBoxForRange=function(x,y,range){
    const absRange=Math.abs(range)
    const left=Math.min(Math.max(x - absRange, 0), 49)
  const right=Math.max(Math.min(x + absRange, 49), 0)
  const top=Math.min(Math.max(y - absRange, 0), 49)
  const bottom=Math.max(Math.min(y + absRange, 49), 0)
  return {left, right, top, bottom}
}

var extension={
    getAdjacent:function(){
        const results=[]
        const room=Game.rooms[this.roomName]

        if(this.y - 1 >= 0){
            if(this.x - 1 >= 0){
                results.push(room.getPositionAt(this.x - 1, this.y - 1))
            }
            results.push(room.getPositionAt(this.x, this.y - 1))
            if(this.x + 1 <= 49){
                results.push(room.getPositionAt(this.x + 1, this.y - 1))
            }
        }
        if(this.x - 1 >= 0){
            results.push(room.getPositionAt(this.x - 1, this.y))
        }
        if(this.x + 1 <= 49){
            results.push(room.getPositionAt(this.x + 1, this.y))
        }
        if(this.y + 1 <= 49){
            if(this.x - 1 >= 0){
                results.push(room.getPositionAt(this.x - 1, this.y + 1))
            }
            results.push(room.getPositionAt(this.x, this.y + 1))
            if(this.x + 1 <= 49){
                results.push(room.getPositionAt(this.x + 1, this.y + 1))
            }
        }
        return results
    },

    getSteppableAdjacent:function(includeCreep = false, includeStructures = true){
        return _.filter(this.getAdjacent(), function(pos){
            return pos.isSteppable(includeCreep, includeStructures)
        })
    },

    isSteppable:function(includeCreep = fallse, includeStructures = true){
        if(this.getTerrainAt() === 'wall'){
            return false
        }
        if(includeStructures){
            const structures = this.lookFor(LOOK_STRUCTURES)
            for(let structure of structures){
                if(OBSTACLE_OBJECT_TYPES.indexOf(structure.structureType) >= 0){
                    return false
                }
            }
        }
        if(includeCreep){
            if(this.lookFor(LOOK_CREEPS).length > 0){
                return false
            }
        }
        return true
    },

    getAdjacentInRange:function(range = 1){
        const bounds=createBoundingBoxForRange(this.x, this.y, range)
        const positions=[]
        for(let x=bounds.left; x <= bounds.right; x++){
            for(let y=bounds.top; y<= bounds.bottom; y++){
                positions.push(new RoomPosition(x, y, this.roomName))
            }
        }
        return positions
    },

    getSteppableAdjacentInRange:function(range = 1){
        return _.filter(this.getAdjacentInRange(range), function(pos){
            return pos.isSteppable()
        })
    },

    getLink:function(range=2){
        if(this.__link){
            return this.__link
        }
        const room=Game.rooms[this.roomName]
        if(!room || !room.link){
            return false
        }
        const pos=this
        const links=_.filter(room.link, a => pos.getRangeTo(a) <= range)
        if(links.length < 1){
            return false
        }
        this.__link=links[0]
        return this.__link
    },

    getActiveLink:function(){
        const link=this.getLink()
        if(!link){
            return false
        }
        if(this.__linkActive){
            return link
        }
        if(typeof this.__linkActive === 'undefined'){
            this.__linkActive=Game.rooms[this.roomName].controller.level === 8 || link.isActive()
        }
        return (this.__linkActive) ? link : false
    },

    getMostOpenNerghbor:function(isBuildable = false, includeStructures = true){
        const steppable=this.getSteppableAdjacent()
        let pos
        let best
        let score=0
        for(pos of steppable){
            if(isBuildable){
                if(pos.inFrontOfExit()||pos.isEdge()){
                    continue
                }
            }
            const posScore=pos.getSteppableAdjacent(false, includeStructures).length
            if (posScore > score) {
                score = posScore
                best = pos
            }
        }
        return best
    },

    isEdge:function(){
        return this.x === 49 || this.x === 0 || this.y === 49 || this.y === 0
    },

    isExit:function(){
        return this.isEdge() && this.getTerrainAt() !== 'wall'
    },

    inFrontOfExit:function(){
        if(this.isEdge()){
            return false
        }
        const neighbors=this.getAdjacent()
        for(let neighbor of neighbors){
            if(neighbor.isExit()){
                return true
            }
        }
        return false
    },
    
    getTerrainAt:function(){
        switch(Game.map.getRoomTerrain(this.roomName).get(this.x, this.y)){
            case 0:
                return 'plain'
            case 1:
                return 'wall'
            case 2:
                return 'swamp'
        }
    },

    getManhattanDistance:function(pos){
        return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y)
    },

    serialize:function(){
        Room.serializeName(this.roomName) + String.fromCharCode(((this.x * 100) + this.y) + 200)
    },

    deserialize:function(string){
        const roomname=Room.deserializeName(string.slice(0, -1))
        const coordraw=(string.charCodeAt(string.length - 1) - 200)
        const x=Math.floor(coordraw / 100)
        const y=coordraw % 50
        return new RoomPosition(x, y, roomname)
    },

    lookAroundFor:function(type, range = 1){
        if(!Game.rooms[roomName]){
            return ERR_INVALID_TARGET
        }
        const room=Game.rooms[roomName]
        const bounds=createBoundingBoxForRange(this.x,this.y,range)
        return room.lookForAtArea(type, bounds.top, bounds.left, bounds.bottom, bounds.right, true)
    },

    lookAround:function(range = 1){
        if(!Game.rooms[roomName]){
            return ERR_INVALID_TARGET
        }
        const room=Game.rooms[roomName]
        const bounds=createBoundingBoxForRange(this.x,this.y,range)
        return room.lookAtArea(bounds.top, bounds.left, bounds.bottom, bounds.right, true)
    },

    getBoundingBoxForRange:function(range){
        return createBoundingBoxForRange(this.x, this.y, range)
    },
}

_assign(RoomPosition.prototype,extension)
