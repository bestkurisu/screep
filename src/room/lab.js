var extension={
    /**
    * 获取底物lab，设置底物lab状态为1
    * @returns {[firstLab:{Object}, secondLab:{Object}]}
    * @returns {Number} -1:目标错误, -2:lab不足,
    * 建议定时清除重新检查
    */
    getFeederLabs=function(){
        if(!!this.memory.feederLabs){
            var feederlabs=getGameObject(this.memory.feederLabs)
            if(feederlabs.length === 2){
                if(!feederlabs[0].memory || !feederlabs[0].memory.state){
                    feederlabs[0].memory={state:1}
                }
                if(!feederlabs[1].memory || !feederlabs[1].memory.state){
                    feederlabs[1].memory={state:1}
                }
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
        if(!labs[0].memory || !labs[0].memory.state){
            labs[0].memory={state:1}
        }
        if(!labs[1].memory || !labs[1].memory.state){
            labs[1].memory={state:1}
        }
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
            var labs=getGameObject(this.memory.vatLabs)
            if(labs.length>0){
                for(let i=0;i<labs.length;i++){
                    if(!labs[i].memory || labs[i].memory){
                        labs[i].memory={state:0}
                    }
                }
                return getGameObject(vatLabs)
            }
            else{
                return -1
            }
        }
        const vatlabs=this.find(FIND_STRUCTURES,{
            filter: s => s.strutureType === STRUCTURE_LAB &&
                    (!s.memory || s.memory.state === 0)
        })
        this.memory.vatLabs=setGameID(vatlabs)
        return getGameObject(vatlabs)
    },

    /**
    * 获取当前反应
    * @returns {Object}
    * @returns {Number} -1:目标错误, -2:lab不足,
    * 建议定时清除重新检查
    */
    getActiveReaction=function(){
        const reaction=this.memory.reaction
        if(!reaction){
            return -1
        }
        var target=reaction.compound
        mid=REACTION[target]
        
    }
}
module.exports = function () {
    _.assign(Room.prototype, extension)
}