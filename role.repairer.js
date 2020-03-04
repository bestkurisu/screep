var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.repaireing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repaireing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.repaireing && creep.store.getFreeCapacity() == 0) {
	        creep.memory.repaireing = true;
	        //creep.say('⚡ upgrade');
	        creep.say('🛠 repair')
	    }
	    
	    const targets = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });

        targets.sort((a,b) => a.hits - b.hits);


	    if(creep.memory.repaireing) {
            if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleRepairer;
