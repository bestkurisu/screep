'use strict'

var extension={
    /**
    * 获取底物lab，设置底物lab状态为1
    * @returns {[firstLab:{Object}, secondLab:{Object}]}
    * @returns {Number} -7:目标错误
    */
    getFeederLabs:function(){
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
                return ERR_INVALID_TARGET
            }
        }
        const labs=this.lab
        if(!labs || labs.length<3){
            return false
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
    * 获取产物lab
    * @returns {ObjectArray}
    * @returns {Number} -7:目标错误, -2:lab不足,
    * 建议定时清除重新检查
    */
    getVatLabs:function(){
        var feederLabs=this.getFeederLabs()
        if(!feederlabs){
            return ERR_INVALID_TARGET
        }
        if(!!this.memory.vatLabs){
            var labs=getGameObject(this.memory.vatLabs)
            if(labs.length>0){
                for(let i=0;i<labs.length;i++){
                    if(!labs[i].memory || labs[i].memory){
                        labs[i].memory={state:2}
                    }
                }
                return getGameObject(vatLabs)
            }
            else{
                return false
            }
        }
        const vatlabs=this.find(FIND_STRUCTURES,{
            filter: s => s.strutureType === STRUCTURE_LAB &&
                    (!s.memory || s.memory.state === 2)
        })
        this.memory.vatLabs=setGameID(vatlabs)
        return getGameObject(vatlabs)
    },

    /**
    * 获取当前反应
    * @returns {Array}
    * @returns {Number} 0:任务已完成, -1:无任务
    */
    getActiveReaction:function(){
        const reaction=this.memory.reaction
        if(!reaction){
            return false
        }
        const target=reaction.compound
        const amount=reaction.amount
        const count=reaction.count
        if(!reaction.ready){
            this.memory.reaction.labState=0
            this.memory.reaction.ready=true
        }
        mid=REACTION[target]
        var queue=[]
        var length=1
        queue.push([target,mid])
        for(let i=0;i<mid.length;i++){
            if(mid[i] in REACTION && mid[i] !== 'G'){
                length=2
                var target1=mid[i]
                var mid1=REACTION[target1]
                queue.push([target1,mid1])
                for(let j=0;j<mid1.length;j++){
                    if(mid1[i] in REACTION && mid1[i] !== 'G'){
                        length=3
                        var target2=mid1[i]
                        var mid2=REACTION[target2]
                        queue.push([target2,mid2])
                    }
                }
            }
        }
        queue.reverse()
        if(count>=amount){
            this.memory.reaction.count=0
            if(this.memory.reaction.labState<queue.length){
                this.memory.reaction.labState++
            }
            else{
                this.memory.reaction=undefined
                return OK
            }
        }
        return queue[this.memory.labState]
    },

    /**
    * 设置boostlab，注意lab状态需要creep boost完成后修改
    * @returns {Number} 0:任务已完成
    */
    setBoostLab:function(){
        var boostTask=this.memory.boostTask
        if(!boostTask || boostTask.length === 0){
            return
        }
        var i=0
        var labs=this.getVatLabs()
        if(!labs || labs.length === 0){
            return
        }
        while(i<labs.length){
            if(boostTask.length>0){
                labs[i].memory={
                    state:3,
                    compound:boostTask.shift()
                }
            }
            else{
                break
            }
        }
        return OK
    },
}


_.assign(Room.prototype, extension)