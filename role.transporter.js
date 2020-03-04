var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity() > 0) {
	        var dropedResorce = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(dropedResorce) {
                if(creep.pickup(dropedResorce) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropedResorce, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_STORAGE
                });
                if(targets.length > 0) {
                    if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_EXTENSION && i.store[RESOURCE_ENERGY] < 50) || (i.structureType == STRUCTURE_SPAWN && i.store[RESOURCE_ENERGY] < 300) || (i.structureType == STRUCTURE_TOWER && i.store[RESOURCE_ENERGY] < 1000)
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	} 
};

module.exports = roleTransporter;
