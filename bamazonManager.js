var mysql = require ('mysql');
var inquirer = require ('inquirer');
require('console.table');
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
        console.table(result);
        menu();
    });
}
    
function lowInventory(){
    //get list of items from database that have stock_quantity lower than 5
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, result){
        if(err) throw(err);
        console.table(result);
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
        
        var resItem = result.itemUpdate.split(" ");        
            
        var item = items[resItem[0] - 1];
        var itemArr = item.split(" ");
        var currentStock = itemArr[itemArr.length - 1];
        
        console.log(currentStock);
        
        var newStock = parseInt(currentStock) + parseInt(result.addStock);
        
        console.log(newStock);

        connection.query("UPDATE products SET stock_quantity = " + newStock + " WHERE item_id = " + resItem[0], function(err, result){
       if(err) throw(err);
        console.log("Update Complete");
        menu();
        });
    });
    
}

function addProduct(){
    var departmentsArr = [];
    
    connection.query("SELECT department_name FROM departments", function(err, result){
       if(err) throw(err);
        for(var i = 0; i < result.length; i++){
            departmentsArr.push(result[i].department_name);
        }
    });
    //allow manager to add a product not currently in database
    inquirer.prompt([
        {
            type: "input",
            message: "Name: ",
            name: "product_name"
        },
        {
            type: "rawlist",
            message: "Department: ",
            name: "department_name",
            choices: departmentsArr /*["Electronics", "Fashion", "Health", "Instruments", "Media"]*/
        },
        {
            type: "input",
            message: "Price: ",
            name: "price"
        },
        {
            type: "input",
            message: "Quantity: ",
            name: "stock_quantity"
        }
    ]).then(function(result){
       connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + result.product_name + "', '" + result.department_name + "'," + result.price + "," + result.stock_quantity + ")", function(err, result){
           if(err) throw(err);
           console.log("Update Complete.");
           menu();
       }); 
    });
    
}