var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.id == '5e606de0e4c9ff6ef3b1dca5' || s.id == '5e5ff70811a570efde5aa774') &&
                             s.store[RESOURCE_ENERGY] > 0
            });
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(container);
                }
            }
            else{
                creep.say('warning');
                //var sources = creep.room.find(FIND_SOURCES);
                //if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                //    creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
                //}
            }
        }
    }
}

module.exports = roleUpgrader;
