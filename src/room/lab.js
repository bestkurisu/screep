var extension={
    /**
    * 获取底物lab
    * @returns {[firstLab:{Object}, secondLab:{Object}]}
    * @returns {Number} -1:目标错误, -2:lab不足,
    * 建议定时清除重新检查
    */
    getFeederLabs=function(){
        if(!!this.memory.feederLabs){
            var feederlabs=getGameObject(this.memory.feederLabs)
            if(feederLabs.length === 2){
                return [feederLabs[0],feederLabs[1]]
            }
            else{
                return -1
            }
        }
        const labs=this.find(FIND_STRUCTURES,{
            filter: s => s.strutureType === STRUCTURE_LAB
        })
        if(!labs || labs.length<3){
            return -2
        }
        const labDistances = {}
        for (const lab of labs) {
            labDistances[lab.id] = 0
            for (const labCheck of labs) {
            labDistances[lab.id] += labCheck.pos.getRangeTo(lab)
            }
        }
        labs.sort(function (a, b) {
            return labDistances[a.id] - labDistances[b.id]
        })
        this.memory.feederLabs=setGameID([labs[0],labs[1]])
        return [labs[0],labs[1]]
    },

    /**
    * 获取底物lab
    * @returns {ObjectArray}
    * @returns {Number} -1:目标错误, -2:lab不足,
    * 建议定时清除重新检查
    */
    getVatLabs=function(){
        var feederLabs=this.getFeederLabs()
        if(!feederlabs){
            return -1
        }
        if(!!this.memory.vatLabs){
            var vatlabs=getGameObject(this.memory.vatLabs)
            if(vatLabs.length>0){
                return getGameObject(vatLabs)
            }
            else{
                return -1
            }
        }
        const lab=this.find(FIND_STRUCTURES,{
            filter: s => s.strutureType === STRUCTURE_LAB
        })
        const vatLabs=[]
        for(const lab of labs){
            if(feederLabs[0].id === lab.id || feederLabs[1].id === lab.id){
                continue
            }
            vatLabs.push(lab.id)
        }
        this.memory.vatLabs=setGameID(vatLabs)
        return getGameObject(vatLabs)
    }
}
module.exports = function () {
    _.assign(Room.prototype, extension)
}