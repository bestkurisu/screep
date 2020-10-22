var nukes=creep.room.find(FIND_NUKES)
        for(let nuker of nukes){
            const bounds=nuker.pos.getBoundingBoxForRange(range = 5)
            let structures=creep.room.lookForAtArea(LOOK_STRUCTURES, bounds.top, bounds.left, bounds.bottom, bounds.right, true)
            for(pos of structures){
                for(s in pos.structure){

                }
            }
        }