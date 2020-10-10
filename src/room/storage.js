'use strict'

const needs={
    base: 10000,
}

StructureStorage.prototype.getLink=function(){
    if(!this.__link){
        this.__link=this.pos.getLink()
    }
    return this.__link
}

StructureStorage.prototype.getResourceNeed=function(resource){
    if(!needs[resource]){
        return 0
    }
    if(!this.store[resource]){
        return needs[resource]
    }
    return needs[resource] - this.store[resource]
}

StructureStorage.prototype.getContentsByType=function(){
    const contents=Object.keys(this.store)
    const byType={}
    for(const resource of contents){
        if(!byType[resource]){
            byType[resource]=[]
        }
        byType[resource].push(resource)
    }
    return byType
}