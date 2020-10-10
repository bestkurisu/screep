'use strict'

Room.Terrain.prototype.isWalkable=function(x, y){
    return !(this.get(x, y) & TERRAIN_MASK_WALL)
}
Room.Terrain.prototype.isSwamp=function(x, y){
    return (this.get(x, y) === TERRAIN_MASK_SWAMP)
}
// Memory.territory
Room.getCities=function(){
    // 初始化Memory.territory
    if(!Memory.territory || Object.keys(Memory.territory).length <= 0){
        Memory.territory={}
        for(const roomName of Object.keys(Game.rooms)){
            const room=Game.rooms[roomName]
            if(room.controller && room.controller.my){
                Memory.territory[roomName] = {}
            }
        }
    }
    return Object.keys(Memory.territory)
  }
  
Room.addCity=function(roomName){
    if(!Memory.territory[roomName]){
        const mineOwner=Room.getMineOwner(roomName)
        if(mineOwner && Game.rooms[mineOwner]){
            Game.rooms[mineOwner].removeMine(roomName)
        }
        Memory.territory[roomName]={}
        Logger.log(`Adding city ${roomName}`)
        qlib.events.recordEvent('addcity')
        qlib.notify.send(`Adding city ${roomName} to empire`)
    }
}
  
Room.removeCity=function(roomName){
    if(Memory.territory && Memory.territory[roomName]){
        delete Memory.territory[roomName]
        Logger.log(`Removing city ${roomName}`)
        qlib.notify.send(`Removing city ${roomName} from empire`)
    }
}
  
Room.isCity=function(roomName){
    return Boolean(Memory.territory[roomName])
}
  
Room.prototype.getMines=function(){
    if(!Memory.territory || !Memory.territory[this.name]){
        return []
    }
    if(!Memory.territory[this.name].mines){
      return []
    }
    return Memory.territory[this.name].mines
}
  
Room.prototype.addMine=function(mine){
    if (!Memory.territory || !Memory.territory[this.name]) {
        return false
    }
    if (!Memory.territory[this.name].mines) {
        Memory.territory[this.name].mines = []
    }
    Memory.territory[this.name].mines.push(mine)
    Logger.log(`Adding mine from ${this.name} to ${mine}`)
    qlib.events.recordEvent('addmine')
    qlib.notify.send(`Adding mine from ${this.name} to ${mine}`)
}
  
Room.prototype.removeMine=function(mine){
    const id = this.getMineId(mine)
    if (!id || id < 0) {
        return
    }
  
    Logger.log(`Removing mine ${mine} from ${this.name}`)
    qlib.events.recordEvent('removemine')
    qlib.notify.send(`Removing mine ${mine} from ${this.name}`)
    Memory.territory[this.name].mines.splice(id, 1)
}
  
Room.prototype.getMineId = function (mine) {
    const id = Memory.territory[this.name].mines.indexOf(mine)
    return id >= 0 ? id : false
}
  
Room.getMineOwner=function(mine){
    if(!Memory.territory){
        return false
    }
    if(!this.mineMap){
        this.mineMap = {}
    } 
    else if(this.mineMap[mine]){
        return this.mineMap[mine]
    }
    const roomNames=Object.keys(Memory.territory)
    for(let roomName of roomNames){
        if(!Memory.territory[roomName] || !Memory.territory[roomName].mines){
            continue
        }
        if(Memory.territory[roomName].mines.indexOf(mine) >= 0){
            this.mineMap[mine]=roomName
            return roomName
        }
    }
    this.mineMap[mine] = false
    return false
}
  
// 设置选择外矿的权重
const MINE_WEIGHTS_SOURCES=5
const MINE_WEIGHTS_SWAMPINESS=-1
const MINE_WEIGHTS_WALKABILITY=0
const MINE_WEIGHTS_DISTANCE=-3
const MINE_MAX_DISTANCE=2
  
Room.prototype.selectNextMine=function(){
    const existing=this.getMines()
    const candidates=Room.getRoomsInRange(this.name, existing.length <= 0 ? 1 : 2)
    let candidate
    let currentScore = -Infinity
    let currentBestRoom = false
    for (candidate of candidates) {
        if (candidate === this.name) {
            continue
        }
        if (existing.indexOf(candidate) >= 0) {
            continue
        }
        const testScore = this.getMineScore(candidate)
        if (testScore === false) {
            continue
        }
        if (testScore > currentScore) {
            currentScore = testScore
            currentBestRoom = candidate
        }
    }
    return currentBestRoom
}
  
Room.prototype.getMineScore=function(roomName){
    if (Room.isSourcekeeper(roomName)) {
        return false
    }
    const route = qlib.map.findRoute(this.name, roomName, { avoidHostileRooms: true })
    if (route === ERR_NO_PATH) {
        return false
    }
  
    const distance = route.length
    if (distance > MINE_MAX_DISTANCE) {
        return false
    }
    const intel = Room.getIntel(roomName)
    if (!intel || !intel[INTEL_SOURCES]) {
        return false
    }
  
    if (intel[INTEL_OWNER]) {
        return false
    }
  
    if (Room.getMineOwner(roomName)) {
        return false
    }
  
    if (!intel[INTEL_WALKABILITY] || !intel[INTEL_WALKABILITY]) {
        Room.requestIntel(roomName)
        return false
    }
  
    let score = 0
    score += (intel[INTEL_SOURCES] / 3) * MINE_WEIGHTS_SOURCES
    score += intel[INTEL_WALKABILITY] * MINE_WEIGHTS_WALKABILITY
    score += intel[INTEL_SWAMPINESS] * MINE_WEIGHTS_SWAMPINESS
    score += (distance / MINE_MAX_DISTANCE) * MINE_WEIGHTS_DISTANCE
    return score
}
  
  
// 总共40点
  
// 资源 - 24 - 60% 分数
// 没惩罚的
const CITY_WEIGHTS_TWO_SOURCES=9 
const CITY_WEIGHTS_MINERAL_MARKET=3
const CITY_WEIGHTS_MINERAL_EMPIRE_NEED=3
const CITY_WEIGHTS_MINERAL_CATALYST=3
const CITY_WEIGHTS_REGION_RESOURCES=2
const CITY_WEIGHTS_NEIGHBOR_SOURCES=4
  
// 地形 - 4 - 10% 分数
// 最多5点惩罚
const CITY_WEIGHTS_SWAMPINESS=-5
const CITY_WEIGHTS_WALKABILITY=4
  
// 出口个数
const CITY_WEIGHTS_DEFENSIBILITY=0
  
// 位置 - 12 - 30% 分数
// 最多12点惩罚
  
// 过道，角落，靠近中心的
const CITY_WEIGHTS_ROOMTYPE=2
  
// 有多少可以支援他的房间
const CITY_WEIGHTS_EMPIRE_DEFENSE=5
  
// 离最近的房间有多远，相邻为0
const CITY_WEIGHT_CITY_DISTANCE=5
  
// 区域内有多少有主的
const CITY_WEIGHTS_REGION_DENSITY=-8
  
// 根据附近的房间？
const CITY_WEIGHTS_EMPIRE_CLUTTERED=-4
  
// 其他设置
  
// 太多沼泽就算了
const CITY_MIN_WALKABILITY=0.4
  
// 最远能到的
const CITY_MAX_REACHABILITY_DISTANCE=Math.floor(CREEP_CLAIM_LIFE_TIME / 50)
  
// 这个……没啥用
const CITY_MINIMUM_CITIES_BEFORE_ONE_SOURCE = 5
  
Room.getCityScore=function(roomName){
    if(!Room.isClaimable(roomName)){
        return false
    }
  
    const intel=Room.getIntel(roomName)
  
    if (!intel || !intel[INTEL_SOURCES]) {
        return false
    }
  
    if (intel[INTEL_OWNER]) {
        return false
    }
  
    if (Game.rooms[roomName] && Game.rooms[roomName].controller && Game.rooms[roomName].controller.my) {
        return false
    }
  
    if (intel[INTEL_WALKABILITY] < CITY_MIN_WALKABILITY) {
        return false
    }
  
    if (intel[INTEL_SOURCES] < 2 && Room.getCities().length < CITY_MINIMUM_CITIES_BEFORE_ONE_SOURCE) {
        return false
    }
  
    let score=0
    score += (intel[INTEL_SOURCES] - 1) * CITY_WEIGHTS_TWO_SOURCES
    score += intel[INTEL_WALKABILITY] * CITY_WEIGHTS_WALKABILITY
    score += intel[INTEL_SWAMPINESS] * CITY_WEIGHTS_SWAMPINESS
    score += getMineralMarketScore(intel[INTEL_MINERAL]) * CITY_WEIGHTS_MINERAL_MARKET
    score += getMineralEmpireNeedsScore(intel[INTEL_MINERAL]) * CITY_WEIGHTS_MINERAL_EMPIRE_NEED
    score += intel[INTEL_MINERAL] === RESOURCE_CATALYST ? CITY_WEIGHTS_MINERAL_CATALYST : 0
    score += getDefensibilityScore(roomName) * CITY_WEIGHTS_DEFENSIBILITY
    score += getRoomTypeScore(roomName) * CITY_WEIGHTS_ROOMTYPE
    score += getEmpireClutterScore(roomName) * CITY_WEIGHTS_EMPIRE_CLUTTERED
    score += getEmpireDefenseScore(roomName) * CITY_WEIGHTS_EMPIRE_DEFENSE
    score += getRegionResourcesScore(roomName, 2) * CITY_WEIGHTS_REGION_RESOURCES
    score += getNeighborSourcesScore(roomName) * CITY_WEIGHTS_NEIGHBOR_SOURCES
    score += getRegionDensityScore(roomName, 2) * CITY_WEIGHTS_REGION_DENSITY
    score += getCityDistanceScore(roomName) * CITY_WEIGHT_CITY_DISTANCE
    return score
}
  
Room.testRoomScore=function(roomName){
    const intel=Room.getIntel(roomName)
    Logger.highlightData(intel)
  
    Logger.highlight(`Two Sources: ${(intel[INTEL_SOURCES] - 1)}`)
    Logger.highlight(`Two Sources: ${(intel[INTEL_SOURCES] - 1) * CITY_WEIGHTS_TWO_SOURCES}`)
  
    Logger.highlight(`Walkability: ${intel[INTEL_WALKABILITY]}`)
    Logger.highlight(`Walkability: ${intel[INTEL_WALKABILITY] * CITY_WEIGHTS_WALKABILITY}`)
  
    Logger.highlight(`Swampiness: ${intel[INTEL_SWAMPINESS]}`)
    Logger.highlight(`Swampiness: ${intel[INTEL_SWAMPINESS] * CITY_WEIGHTS_SWAMPINESS}`)
  
    Logger.highlight(`Mineral Market: ${getMineralMarketScore(intel[INTEL_MINERAL])}`)
    Logger.highlight(`Mineral Market: ${getMineralMarketScore(intel[INTEL_MINERAL]) * CITY_WEIGHTS_MINERAL_MARKET}`)
  
    Logger.highlight(`Mineral Empire: ${getMineralEmpireNeedsScore(intel[INTEL_MINERAL])}`)
    Logger.highlight(`Mineral Empire: ${getMineralEmpireNeedsScore(intel[INTEL_MINERAL]) * CITY_WEIGHTS_MINERAL_EMPIRE_NEED}`)
  
    Logger.highlight(`Defensibility: ${getDefensibilityScore(roomName)}`)
    Logger.highlight(`Defensibility: ${getDefensibilityScore(roomName) * CITY_WEIGHTS_DEFENSIBILITY}`)
  
    Logger.highlight(`Room Type: ${getRoomTypeScore(roomName)}`)
    Logger.highlight(`Room Type: ${getRoomTypeScore(roomName) * CITY_WEIGHTS_ROOMTYPE}`)
  
    Logger.highlight(`Empire Clutter: ${getEmpireClutterScore(roomName)}`)
    Logger.highlight(`Empire Clutter: ${getEmpireClutterScore(roomName) * CITY_WEIGHTS_EMPIRE_CLUTTERED}`)
  
    Logger.highlight(`Empire Defense: ${getEmpireDefenseScore(roomName)}`)
    Logger.highlight(`Empire Defense: ${getEmpireDefenseScore(roomName) * CITY_WEIGHTS_EMPIRE_DEFENSE}`)
  
    Logger.highlight(`Region Resources: ${getRegionResourcesScore(roomName, 2)}`)
    Logger.highlight(`Region Resources: ${getRegionResourcesScore(roomName, 2) * CITY_WEIGHTS_REGION_RESOURCES}`)
  
    Logger.highlight(`Region Density: ${getRegionDensityScore(roomName, 2)}`)
    Logger.highlight(`Region Density: ${getRegionDensityScore(roomName, 2) * CITY_WEIGHTS_REGION_DENSITY}`)
  
    Logger.highlight(`City Distance: ${getCityDistanceScore(roomName)}`)
    Logger.highlight(`City Distance: ${getCityDistanceScore(roomName) * CITY_WEIGHT_CITY_DISTANCE}`)
  
    Logger.highlight(`Total Score: ${Room.getCityScore(roomName)}`)
}
  
function getMineralMarketScore(mineral){
    const max = qlib.market.getHighestMineralValue()
    const cost = qlib.market.getAveragePrice(mineral, ORDER_SELL)
    return cost / max || 0
}
  
function getMineralEmpireNeedsScore(mineral){
    return 1 - Mineral.getEmpireRatio()[mineral]
}
  
function getDefensibilityScore(room){
    let score=0
    const totalEdge=48 * 4
    const exits=Game.map.describeExits(room)
    const exitIds=Object.keys(exits)
  
    for(const exitId of exitIds){
        const exitRoom=exits[exitId]
        if(Room.isCuldesac(exitRoom)){
            delete exits[exitId]
        }
    }
  
    const terrain=Game.map.getRoomTerrain(room)
    for(let i = 1; i < 49; i++){
        // Top
        if(exits['1']){
            score += terrain.isWalkable(i, 0) ? 1 : 0
        }
        // Right
        if(exits['3']){
            score += terrain.isWalkable(49, i) ? 1 : 0
        }
        // Bottom
        if(exits['5']){
            score += terrain.isWalkable(i, 49) ? 1 : 0
        }
        // Left
        if(exits['7']){
            score += terrain.isWalkable(0, i) ? 1 : 0
        }
    }
    if(score === totalEdge){
        return 0
    }
    return (totalEdge - score) / totalEdge
}
   
function getRoomTypeScore(room){
    const coords=Room.getCoordinates(room)
    const normX=coords.x % 10
    const normY=coords.y % 10
  
    if((normX === 1 || normX === 9) && (normY === 1 || normY === 9)){
        return 1
    }
  
    if(normX === 1 || normX === 9 || normY === 1 || normY === 9){
        if(Game.shard){
            return 0.6
        } 
        else{
            return 0.8
        }
    }
  
    if(normX >= 3 && normX <= 7 && normY >= 3 && normY <= 7){
        if((normX === 3 || normX === 7) && (normY === 3 || normY === 7)){
            return 0.3
        }
        return 0.5
    }
  
    return 0
}
  
function getRegionResourcesScore(centerRoomName, range){
    const regionRoomCount=Math.pow((range * 2) + 1, 2) - 1
    const rooms=Room.getRoomsInRange(centerRoomName, range)
    let sourceCount=0
    for(const roomName of rooms){
        const intel=Room.getIntel(roomName)
        if(!intel || !intel[INTEL_SOURCES]){
            continue
        }
        if(intel[INTEL_OWNER]){
            continue
        }
        if(intel[INTEL_SOURCES]){
            sourceCount += intel[INTEL_SOURCES]
        }
    }
    if(sourceCount < 1){
        return 0
    }
    return sourceCount / (regionRoomCount * 2)
}
  
function getNeighborSourcesScore(room){
    const neighbors=_.values(Game.map.describeExits(room))
    let twoSource=0
    for(const neighbor of neighbors){
        const neighborIntel=Room.getIntel(neighbor)
        if(neighborIntel[INTEL_SOURCES] >= 2){
            twoSource++
        }
    }
    return twoSource / 4
}
  
function getEmpireClutterScore(room){
    const cities=Room.getCities()
    const maxInRange=5
    let inRange=0
    for(const city of cities){
        if(Room.getManhattanDistance(room, city) <= CITY_MAX_REACHABILITY_DISTANCE){
            inRange++
        }
        if((inRange - 1) >= maxInRange){
            return 1
        }
    }
    if(inRange <= 1){
        return 0
    }
    return (inRange - 1) / maxInRange
  }
  
function getEmpireDefenseScore(room){
    const cities=Room.getCities()
    const target=cities.length < 4 ? cities.length : 4
    let closeCount=0
    for(const city of cities){
        if(Room.getManhattanDistance(room, city) <= CITY_MAX_REACHABILITY_DISTANCE){
            closeCount++
            if(closeCount >= target){
                return 1
            }
        }
    }
    return closeCount / target
}
  
function getRegionDensityScore(room, range){
    const regionRoomCount=Math.pow((range * 2) + 1, 2) - 1
    const rooms=Room.getRoomsInRange(room, range)
    let owned=0
    for(const room of rooms){
        const intel=Room.getIntel(room)
        if (intel[INTEL_OWNER]) {
            owned++
        }
    }
    if(owned === 0){
        return 0
    }
    return owned / regionRoomCount
  }
  
function getCityDistanceScore(room){
    const cities=Room.getCities()
    const max=CITY_MAX_REACHABILITY_DISTANCE - 2
    let min=Infinity
    for(const city of cities){
        const distance = Room.getManhattanDistance(room, city)
        if(distance < min){
            min=distance
        }
    }
    if(min >= max){
        return 1
    }
    if(min === 1){
        return 0
    }
    return (min - 1) / max
}