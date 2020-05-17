/**
* 获取游戏对象
* @param id {String || Array}
* @returns {ObjectArray} 
*/
global.getGameObject=function(id){
    if(arguments.length === 1){
        var array=[]
        if(Array.isArray(id)){
            for(let i=0;i<id.length;i++){
                let object=Game.getObjectById(id[i])
                if(object){
                    array.push(object)
                }
            }
            return array
        }
        else if(typeof id === 'string'){
            if(id.indexOf(',') === -1){
                let object=Game.getObjectById(id)
                return array
            }
            else{
                id=id.split(',')
                for(let i=0;i<id.length;i++){
                    let object=Game.getObjectById(id[i])
                    if(object){
                        array.push(object)
                    }
                }
                return array
            }
        }
        else{
            return -1
        }
    }
}

/**
* 获取游戏对象
* @param id {String || Array}
* @returns {ObjectArray} 
*/
global.setGameID=function(ob){
    var id=[]
    if(Array.isArray(ob)){
        if(typeof ob[0] === 'string'){
            var id=ob.join(',')
            return id
        }
        if(ob[0].id){
            ob.forEach(o => id.push(o.id))
            id=id.join(',')
            return id
        }
        return -1
    }
    if(typeof ob === 'string'){
        return ob
    }
    if(ob.id){
        return ob.id
    }
    return -2
}