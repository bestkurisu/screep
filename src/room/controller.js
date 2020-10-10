'use strict'

var extension={
    getLinkPosition:function(){
        const neighbors=this.pos.getSteppableAdjacent()
        let best = false
        let bestNeighbors=0
        for(let neighbor of neighbors){
            neighbor.adjacent=neighbor.getSteppableAdjacent()
            if(neighbor.adjacent.length>bestNeighbors){
                best=neighbor
                bestNeighbors=neighbor.adjacent.length
            }
        }
        return best.getMostOpenNeighbor(isBuildable = true)
    },

    getLink:function(){
        if(!this.__link){
            this.__link=this.pos.getLink()
        }
        return this.__link
    },

    isTimingOut:function(){
        if(!this.level || ! CONTROLLER_DOWNGRADE[this.level]){
            return false
        }
        return (CONTROLLER_DOWNGRADE[this.level] - this.ticksToDowngrade > 4000 || this.ticksToDowngrade < 4000)
    },

    canSafemode:function(){
        if(!this.level || !this.my || !this.safeModeAvailable || this.safeModeCooldown || this.upgradeBlocked){
            return false
        }
        if(this.ticksToDowngrade && CONTROLLER_DOWNGRADE[this.level] - this.ticksToDowngrade >= 5000){
            return false
        }
        return true
    },

    
}

_assign(StructureController.prototype,extension)