var mysql = require ('mysql');
var inquirer = require ('inquirer');
var items = [];
var fullItems = [];

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

connection.connect(function(err){
    if(err){
        console.log(err);
    }
    console.log("Connected as id: " + connection.threadId);
    populateItems();
});

function populateItems(){
    //get list of items from database 
    connection.query("SELECT * FROM products", function(err, result){
        
        if(err){
            console.log(err);
        }
        for(var i = 0; i < result.length; i++){
            items.push(result[i].item_id + " " + result[i].product_name + " " + result[i].price);
            fullItems.push(result[i]);
        }

        //console.log(items);
        start();
    });
    
}

function start(){
    //get user to select an item
    inquirer.prompt([
        {
            type: "list",
            name: "buying",
            message: "Please choose an item you wish to buy",
            choices: items
        },
        {
            type: "rawlist",
            name: "quantity",
            message: "How many would you like to buy?",
            choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        }
    ]).then(function(result){
        var itemBuying = fullItems[result.buying[0] - 1];
        console.log(itemBuying);
        var itemQuantity = result.quantity;
        if(itemQuantity > itemBuying.stock_quantity) {
            console.log("Insufficient Quantity: Try again.");
            start();
        }else {
            var endQuantity = itemBuying.stock_quantity - itemQuantity;
            var total = itemQuantity * itemBuying.price;
            connection.query("UPDATE products set stock_quantity = " + endQuantity + " WHERE item_id = " + itemBuying.item_id, function(err, result){
                if(err) throw err;
                console.log("Total Purchase: $" + total);
            });
        }
    });
}