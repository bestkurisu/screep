Object.defineProperty(Structure.prototype,'memory',{
    get(){
        return this.room.memory.objects[this.id]=this.room.memory.objects[this.id] || {}
    }
})