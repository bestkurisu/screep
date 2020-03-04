var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleTransporter = require('role.transporter');

var expectedBuilders = 0;
var expectedHarvestors = 2;
var expectedRepairers = 2;
var expectedTransporters = 1;
var expectedUpgraders = 2;

module.exports.loop = function () {
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var transporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    
    console.log('Creeps: ' + (builders.length + harvesters.length + repairers.length + transporters.length + upgraders.length) + 
            '    Builders: ' + builders.length + '(' + expectedBuilders + ')' + 
            '    Harvesters: ' + harvesters.length  + '(' + expectedHarvestors + ')' + 
            '    Repairers: ' + repairers.length + '(' + expectedRepairers + ')' + 
            '    Transporters: ' + transporters.length + '(' + expectedTransporters + ')' + 
            '    Upgraders: ' + upgraders.length + '(' + expectedUpgraders + ')'
            );
    
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
	for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'transporter') {
            roleTransporter.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
    }
    if(harvesters.length < expectedHarvestors) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new Harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'harvester'}});
    }
    if(upgraders.length < expectedUpgraders) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new Upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    }
    if(builders.length < expectedBuilders) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new Builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
        {memory: {role: 'builder'}});
    }
    if(repairers.length < expectedRepairers) {
        var newName = 'Repairers' + Game.time;
        console.log('Spawning new Repairers: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'repairer'}});
    }
}
