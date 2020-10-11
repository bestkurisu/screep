'use strict'

const needs=this.room.needs

StructureStorage.prototype.getLink=function(){
    if(!this.__link){
        this.__link=this.pos.getLink()
    }
    return this.__link
}

StructureStorage.prototype.getResourceNeed=function(resource){
    const type=Mineral.getResourceType(resource)
    if(!needs[type] || !needs[type][resource]){
        return 0
    }
    if(!this.store[resource]){
        return needs[type][resource]
    }
    return needs[type][resource] - this.store[resource]
}

StructureStorage.prototype.getContentsByType=function(){
    const contents=Object.keys(this.store)
    const byType={}
    for(const resource of contents){
        const type=Mineral.getResourceType(resource)
        if(!byType[type]){
            byType[type]=[]
        }
        byType[type].push(resource)
    }
    return byType
}