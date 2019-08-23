var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Hearthstone5174",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayProduct();
});

var displayProduct = function () {
    console.log("Here is the current product that we have: \n")
    readTable();
}

var readTable = function () {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        for (let i = 0; i < res.length; i++) {
            console.log("Id: " + res[i].id + ", Product Name: " + res[i].product_name + ", Price: $" + res[i].price + "\n");
        }
    });
}
//   The app should then prompt users with two messages.
var askUser = function () {
    inquirer
        // The first should ask them the ID of the product they would like to buy.
        .prompt([
            {
                type: "input",
                message: "Which product would you like to buy? (ID)",
                name: "buy"
            },
            // The second message should ask how many units of the product they would like to buy.
            {
                type: "input",
                message: "How many units of the product would you like to buy?",
                name: "quantity"
            }
        ])
    // Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
        .then(function(res){
            
        })
    // If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
    // However, if your store does have enough of the product, you should fulfill the customer's order.

    // This means updating the SQL database to reflect the remaining quantity.
    // Once the update goes through, show the customer the total cost of their purchase.
}

