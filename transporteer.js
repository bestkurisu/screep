var roleTransporteer = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store[RESOURCE_ENERGY] < 50) {
	        var dropedResorce = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if(0) {
                if(creep.pickup(dropedResorce) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropedResorce, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (i) => i.id == '5e5f6c33ea09a695a34fb7ed'
                });
                if(targets.length > 0) {
                    if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }
        else {
            var targets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_EXTENSION && i.store[RESOURCE_ENERGY] < 50) || (i.structureType == STRUCTURE_SPAWN && i.store[RESOURCE_ENERGY] < 300) || (i.structureType == STRUCTURE_TOWER && i.store[RESOURCE_ENERGY] < 600)
            });
            if (targets == null) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (i) => (i.id == '5e606de0e4c9ff6ef3b1dca5' || i.id == '5e5ff70811a570efde5aa774') && i.store[RESOURCE_ENERGY] < 2000
                });
                targets = targets[0]
            }
            if (targets == null) {
                targets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (i) => (i.structureType == STRUCTURE_STORAGE)
                })
            }
            if(targets) {
                if(creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	} 
};

module.exports = roleTransporteer;
