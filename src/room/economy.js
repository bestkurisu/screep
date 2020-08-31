'use strict'

global.ECONOMY_CRASHED = 0
global.ECONOMY_FALTERING = 1
global.ECONOMY_DEVELOPING = 2
global.ECONOMY_STABLE = 3
global.ECONOMY_SURPLUS = 4
global.ECONOMY_BURSTING = 5

// 标准设置
const economySettings = {
    SUPPLY_TERMINAL: ECONOMY_FALTERING,
    MAINTAIN_STRUCTURES: ECONOMY_FALTERING,
    REMOTE_MINES: ECONOMY_FALTERING,

    EXPAND_FROM: ECONOMY_DEVELOPING,
    BUILD_STRUCTURES: ECONOMY_DEVELOPING,

    EXTRACT_MINERALS: ECONOMY_STABLE,
    UPGRADE_CONTROLLERS: ECONOMY_STABLE,
    WALLBUILDERS: ECONOMY_STABLE,

    EXTRA_UPGRADERS: ECONOMY_SURPLUS,
    SHARE_ENERGY: ECONOMY_SURPLUS,

    EXTRA_WALLBUILDERS: ECONOMY_BURSTING,
    MORE_EXTRA_UPGRADERS: ECONOMY_BURSTING,
    DUMP_ENERGY: ECONOMY_BURSTING
}

// 8级后设置
const economySettingsLevel8 = {
    EXTRA_UPGRADERS: false,
    MORE_EXTRA_UPGRADERS: false,

    FILL_NUKER: ECONOMY_STABLE,
    FILL_POWER_SPAWN: ECONOMY_STABLE,

    UPGRADE_CONTROLLERS: ECONOMY_SURPLUS,
    EXTRA_WALLBUILDERS: ECONOMY_SURPLUS
}

// 要求支援的状态
const economyNegativeSettings = {
    REQUEST_ENERGY: ECONOMY_FALTERING
}

Room.prototype.isEconomyCapable=function(key){
    if(this.controller.level === 8){
        if(typeof economySettingsLevel8[key] !== 'undefined'){
            if(Number.isInteger(economySettingsLevel8[key])){
                return this.getEconomyLevel() >= economySettingsLevel8[key]
            } 
            else{
                return false
            }
        }
    }
    if(Number.isInteger(economySettings[key])){
        return this.getEconomyLevel() >= economySettings[key]
    }
    if(Number.isInteger(economyNegativeSettings[key])){
        return this.getEconomyLevel() <= economyNegativeSettings[key]
    }
    return false
}

Room.prototype.getEconomyLevel=function(){
    if (this.getPracticalRoomLevel()<4){
        return ECONOMY_STABLE
    }
    const desiredBuffer=this.getDesiredEnergyBuffer()
    const energy=this.getEnergyAmount()
    if(energy<20000){
        return ECONOMY_CRASHED
    }
    // 20,000到200,000之间
    if(energy<(desiredBuffer-100000)){
        return ECONOMY_FALTERING
    }
    // 200000到300000之间
    if(energy<(desiredBuffer)){
        return ECONOMY_DEVELOPING
    }
    // 300000到320000之间
    if(energy<(desiredBuffer+20000)){
        return ECONOMY_STABLE
    }
    // storage快满的时候
    if (_.sum(this.storage.storage)>this.storage.storeCapacity*0.9) {
        return ECONOMY_BURSTING
    }
    // 320000以上
    return ECONOMY_SURPLUS
}

Room.prototype.getEnergyAmount = function () {
    let energy=0
    if (this.storage && this.storage.store[RESOURCE_ENERGY]) {
        energy += this.storage.store[RESOURCE_ENERGY]
    }
    if (this.terminal && this.terminal.store[RESOURCE_ENERGY]) {
        energy += this.terminal.store[RESOURCE_ENERGY]
    }
    return energy
}

Room.prototype.getDesiredEnergyBuffer=function(){
    const roomLevel=this.getPracticalRoomLevel()
    if(roomLevel<4){
        return 0
    }
    if(this.name === 'sim'){
        return 40000
    }
    return Math.max(Math.min((roomLevel-3)*100000, 300000), 150000)
}
// 对link进行排序
Room.prototype.getSinkLinks=function(){
    if(this.__linksinks){
        return this.__linksinks
    }
    const links=this.link
    const storageLink=this.storage ? this.storage.getLink() : false
    const sources=this.find(FIND_SOURCES)
    const sinks=[]
    for(const link of links){
        if(storageLink && storageLink.id === link.id){
            continue
        }
        if(link.pos.getRangeTo(sources[0]) <= 2){
            continue
        }
        if(sources.length>1 && link.pos.getRangeTo(sources[1].getMiningPosition()) <= 1){
            continue
        }
        if((link.energyCapacity-link.energy)<50){
            continue
        }
        sinks.push(link)
    }
    sinks.sort((a, b) => a.energy-b.energy)
    if (storageLink) {
        sinks.push(storageLink)
    }
    this.__linksinks = sinks
    return sinks
}
