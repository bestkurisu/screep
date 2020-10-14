'use strict'

class Performance{
    constructor(){
        if(!Memory.qos.performance){
            Memory.qos.performance={
                start: Game.time,
                programs: {}
            }
        }
    }

    addProgramStats(name, cpu){
        if(!Memory.qos.performance.programs[name]){
            Memory.qos.performance.programs[name]={
                first: Game.time,
                count: 1,
                cpu: cpu,
                max: cpu
            }
            return
        }
        Memory.qos.performance.programs[name].count++
        Memory.qos.performance.programs[name].cpu += cpu
        if(Memory.qos.performance.programs[name].max < cpu){
            Memory.qos.performance.programs[name].max = cpu
        }
    }

    report(){
        const programs=Object.keys(Memory.qos.performance.programs)
        programs.sort((a, b) => Memory.qos.performance.programs[b].cpu - Memory.qos.performance.programs[a].cpu)
        let report='Program\tAverage\tMax Cpu\t Total Cpu \t Ticks Run\n'
        for(const program of programs){
            const max = Memory.qos.performance.programs[program].max
            const cpu = Memory.qos.performance.programs[program].cpu
            const count = Memory.qos.performance.programs[program].count
            const average = cpu / count
            report += `${program}\t ${average.toFixed(3)}\t${max.toFixed(3)}\t${cpu.toFixed(3)}\t${count}\n`
        }
        Logger.log(report, LOG_WARN, 'performance')
    }

    clear(){
        Memory.qos.performance={
            start: Game.time,
            programs: {}
        }
    }
}

module.exports=Performance