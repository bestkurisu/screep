module.exports=function(){
    if(Game.time%10==0){
        var order = Game.market.getAllOrders(order =>
            order.resourceType == RESOURCE_ENERGY && order.type == ORDER_BUY)
        order.sort((a,b)=>b.price-a.price)
        var price = Math.min(0.07,order[0].price)
        var deal=false
        if(Game.rooms['W59N31].storage.store['energy']<400000){
            var order = Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY &&
                order.type == ORDER_SELL && order.amount>30000)
            for(let j=0;j<order.length;j++){
                order[j].realPrice=order[j].amount*order[j].price/(order[j].amount-Game.market.calcTransactionCost(order[j].amount, 'W29N5', order[j].roomName))
            }
            if(order.length>0){
                order.sort((a,b)=>a.realPrice-b.realPrice)
                if(order[0].realPrice<price){
                    if(Game.market.deal(order[0].id,30000,'W59N31')==0){
                        console.log('W59N31'+'买了'+(30000-Game.market.calcTransactionCost(30000,'W59N31', order[0].roomName))+ '能量')
                    }
                    else{
                        deal=true
                    }
                }
            }
        }
    }
}
