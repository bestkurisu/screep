'use strict'

var extension={
    getAverragePrice:function(resource, orderType){
        var orders=Game.market.getOrdersByType(resource, orderType)
        if(orders.length <= 0){
            return false
        }
        if(orderType === ORDER_BUY){
            orders.sort((a, b) => b.price-a.price)
        }
        else{
            orders.sort((a, b) => a.price-b.price)
        }
        if(orders.length > 5){
            var price=sum(orders.slice(0, 4).price)/5
        }
        else{
            var price=sum(orders.price)/orders.length
        }
        return price
    },

    getOrdersByType:function(resource, orderType){
        try{
            return Game.market.getAllOrders({type: orderType, resourceType: resource})
        }
        catch(e){
            return []
        }
    },

    dealAtOnce:function(resource, amount, orderType, room){
        if(resource !== 'pixel' && resource !== 'cpuUnlock' && resource !== 'accessKey'){
            if(!room.name){
                if(Game.rooms[room]){
                    room=Game.rooms[room]
                }
                else{
                    return ERR_INVALID_TARGET
                }
            }
            if(!room.terminal){
                return ERR_INVALID_TARGET
            }
            if(room.terminal.cooldown){
                return ERR_BUSY
            }
            const orders=Game.market.getOrdersByType(resource, orderType)
            if(orderType === ORDER_BUY){
                orders.sort((a, b) => b.price-a.price)
            }
            else{
                orders.sort((a, b) => a.price-b.price)
            }
            for(const order of orders){
                if(room.terminal.memory){
                    room.terminal.memory={
                        task: {}
                    }
                }
                if(RESOURCE_COMMODITY.indexOf(resource) > 0){
                    if(order.amount > amount){
                        let task={
                            id: order.id,
                            amount: amount,
                            roomName: room.name,
                            priority: 5
                        }
                        room.memory.task.push(task)
                        return OK
                    }
                    else{
                        amount -= order.amount
                        let task={
                            id: order.id,
                            amount: order.amount,
                            roomName: room.name,
                            priority: 5
                        }
                        room.memory.task.push(task)
                        continue
                    }
                }
                else{
                    if(order.amount > TERMINAL_MIN_SEND){
                        if(order.amount > amount){
                            let task={
                                id: order.id,
                                amount: amount,
                                roomName: room.name,
                                priority: 5
                            }
                            room.memory.task.push(task)
                            return OK
                        }
                        else{
                            amount -= order.amount
                            let task={
                                id: order.id,
                                amount: order.amount,
                                roomName: room.name,
                                priority: 5
                            }
                            room.memory.task.push(task)
                            continue
                        }
                    }
                    else{
                        continue
                    }
                }
            }
        }
    },
}