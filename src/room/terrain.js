Room.Terrain.prototype.isWalkable = function (x, y) {
    return !(this.get(x, y) & TERRAIN_MASK_WALL)
}
Room.Terrain.prototype.isSwamp = function (x, y) {
    return (this.get(x, y) === TERRAIN_MASK_SWAMP)
}
