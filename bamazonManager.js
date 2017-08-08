var mysql = require ('mysql');
var inquirer = require ('inquirer');
var items = [];

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
    getItems();
    menu();
});

function menu(){
    var menuItems = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"];
    
    inquirer.prompt([
        {
            type: "list", 
            message: "Choose a menu option",
            name: "menuOption",
            choices: menuItems
        }
    ]).then(function(result){
        var choice = result.menuOption;
        
        if(choice === "View Products for Sale"){
            viewItems();
        }else if(choice === "View Low Inventory"){
            lowInventory();
        }else if(choice === "Add to Inventory"){
            addInventory();
        }else if(choice === "Add New Product"){
            addProduct();
        }else if(choice === "Exit"){
            console.log("Goodbye!");
            connection.end();
        }
    });
}

function getItems(){
    connection.query("SELECT * FROM products", function(err, result){
        
        if(err) throw(err);

        for(var i = 0; i < result.length; i++){
            items.push(result[i].item_id + " " + result[i].product_name + " " + result[i].price + " " + result[i].stock_quantity);
        }
        
    });
}

function viewItems(){
    //get list of items from database 
    connection.query("SELECT * FROM products", function(err, result){
        
        if(err) throw(err);

        for(var i = 0; i < result.length; i++){            
            console.log("Id: " + result[i].item_id + " | Product: " + result[i].product_name + " | Price: " + result[i].price + " | Quantity: " + result[i].stock_quantity);
        }
        menu();
    });
}
    
function lowInventory(){
    //get list of items from database that have stock_quantity lower than 5
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, result){
        if(err) throw(err);
        for(var i = 0; i < result.length; i++){
            console.log("Id: " + result[i].item_id + " | Product: " + result[i].product_name + " | Price: " + result[i].price + " | Quantity: " + result[i].stock_quantity);
        }
        menu();
    });
}

function addInventory(){
    //allow manager to add additional stock to any item currently in database
    inquirer.prompt([
        {
            type:"list",
            message: "Choose an item to update",
            name:"itemUpdate",
            choices: items
            
        }, 
        {
            type: "input",
            message: "How much do you want to add to the inventory?",
            name: "addStock"
        }
        
    ]).then(function(result){
        
        var item = items[result.itemUpdate[0] - 1];
        var newStock = parseInt(item[item.length - 1]) + parseInt(result.addStock);
        
        
        connection.query("UPDATE products SET stock_quantity = " + newStock + " WHERE item_id = " + item[0], function(err, result){
       if(err) throw(err);
        console.log("Update Complete");
        menu();
    });
    });
    
}

function addProduct(){
    //allow manager to add a product not currently in database
    
}