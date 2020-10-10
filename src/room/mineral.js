'use strict'

Mineral.getEmpireRatio=function(){
    if(this.mineralRatio && Game.time === this.mineralRatioSave){
        return this.mineralRatio
    }
    const rooms=Room.getCities()
    const resources={}
    let max=0
    for(const room of rooms){
        const roomIntel=Room.getIntel(room)
        if(!roomIntel[INTEL_MINERAL]){
            continue
        }
        const resourceType=roomIntel[INTEL_MINERAL]
        if(!resources[resourceType]){
            resources[resourceType]=0
        }
        else{
            resources[resourceType] += 1
        }
        if(resources[resourceType] > max){
            max=resources[resourceType]
        }
    }
    const ratio={}
    for(const resourceType of RESOURCE_MINE){
        if(!resources[resourceType]){
            ratio[resourceType]=0
        }
        else{
            ratio[resourceType]=resources[resourceType]/max
        }
    }
    this.mineralRatio=ratio
    this.mineralRatioSave=Game.time
    return this.mineralRatio
}

Mineral.getResourceType=function(resource){
    if(RESOURCE_MINE.indexOf(resource)>0){
        return 'mine'
    }
    if(RESOURCE_DEPOSIT.indexOf(resource)>0){
        return 'deposit'
    }
    if(RESOURCE_MID.indexOf(resource)>0){
        return 'mid'
    }
    if(RESOURCE_BAR.indexOf(resource)>0){
        return 'bar'
    }
    if(RESOURCE_COMMODITY.indexOf(resource)>0){
        return 'commodity'
    }
    switch(resource){
        case 'energy':
            return 'energy'
        case 'power':
            return 'power'
        case 'G':
            return 'G'
        case 'ops':
            return 'ops'
    }
    switch(resource.length){
        case 2:
            return 't1'
        case 4:
            return 't2'
        case 5:
            return 't3'
    }
}