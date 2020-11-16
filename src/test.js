var roomlist=[]
if(Game.time % 10 === 0){
    var room=Game.rooms[name]
    if(room.controller.level == 8){
        if(room.terminal && room.terminal.store['energy']>25000){
            var orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_ENERGY})
            if(orders.length>0){
                for(let i=0;i<orders.length;i++){
                    orders[i].realPrice=orders[i].amount*orders[i].price/(orders[i].amount+Game.market.calcTransactionCost(orders[i].amount, room.name, orders[i].roomName))
                    if(roomlist.indexOf(orders[i].roomName) !== -1){
                        orders[i].realPrice = orders[i].realPrice * 2
                    }
                }
                orders.sort((a,b)=>b.realPrice-a.realPrice)
                Game.market.deal(orders[0].id,Math.min(15000,orders[0].amount),room.name)
            }
        }
    }
}