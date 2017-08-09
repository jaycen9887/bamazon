var mysql = require ('mysql');
var inquirer = require ('inquirer');
require('console.table');

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
    menu();
});

function menu(){
    
    inquirer.prompt([
        {
            type: "list", 
            message: "Choose a menu option",
            name: "menuOption",
            choices: ["View Product Sales by Deparment", "Create New Department", "Exit"]
        }
    ]).then(function(result){
        var choice = result.menuOption;
        
        if(choice === "View Product Sales by Deparment"){
            viewSales();
        }else if(choice === "Create New Department"){
            newDepartment();
        }else if(choice === "Exit"){
            console.log("Goodbye!");
            connection.end();
        }
    });
}

function viewSales(){
   var departments = [];
    connection.query("SELECT department_id, department_name, over_head_costs, product_sales, product_sales - over_head_costs as total_profit FROM departments", function(err, result){
       if(err) throw(err);
        console.table(result);
        menu();
    });
}


function newDepartment(){
    inquirer.prompt([
        {
            type: "input",
            message: "Department Name: ",
            name: "department_name"
        },
        {   
            type: "input",
            message: "Over Head Costs: ",
            name: "over_head_costs"
        },
        {   
            type: "input",
            message: "Product Sales: ",
            name: "product_sales"
        }
    ]).then(function(result){        
        connection.query("INSERT INTO departments(department_name, over_head_costs, product_sales) VALUES ('" + result.department_name + "', '" + result.over_head_costs + "', '" + result.product_sales + "')", function(err, result){
            if(err) throw(err);
            console.log("Update Complete.");
        });
        menu();
    });
}
