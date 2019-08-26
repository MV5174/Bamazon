var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "1234",
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
        console.table(res);
        askUser();
    });
}
var updateTable = function (quantity, id) {
    connection.query("UPDATE products SET ? WHERE ?",
        [{
            stock_quantity: quantity
        },
        {
            id: id
        }
        ], function (err) {
            if (err) throw err;
        }
    )
}
//   The app should then prompt users with two messages.
var askUser = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
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
            .then(function (answer) {
                //make sure to put NaN for answer.buy and answer.quantity
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].id === parseInt(answer.buy)) {
                        chosenItem = res[i];
                    }
                }
                // If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
                // However, if your store does have enough of the product, you should fulfill the customer's order.
                if (chosenItem.stock_quantity < answer.quantity) {
                    console.log("Sorry we don't have enough units to sell you")
                } else {
                    console.log("Current stock: " + chosenItem.stock_quantity);
                    // This means updating the SQL database to reflect the remaining quantity.
                    var newQuantity = chosenItem.stock_quantity - parseInt(answer.quantity);
                    updateTable(newQuantity, parseInt(answer.buy));
                    console.log("Item(s) bought!!!\nNew Quantity: " + chosenItem.stock_quantity);
                    // Once the update goes through, show the customer the total cost of their purchase.
                    console.log("\nTotal cost of purchase: $" + (chosenItem.price * parseInt(answer.quantity)));
                }
                connection.end();

            })



    })
}

