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
    password: "Hearthstone5174",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    viewCommands();
});
var viewCommands = function () {
    // List a set of menu options:
    inquirer
        .prompt([
            {
                type: "list",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                message: "What would you like to do?",
                name: "command"
            }
        ])
        .then(function (answer) {
            switch (answer.command) {
                case "View Products for Sale":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    viewLow();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    newProduct();
                    break;
                case "Exit":
                    connection.end();
                    break;
                default:
                    console.log("No command was chosen");
            }
        })
}


// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
function viewProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
            console.table(res);
        viewCommands();
    });
}
// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
function viewLow() {
    console.log("Selecting all products with a low count...\n");
    connection.query("SELECT * FROM products WHERE stock_quantity <=?", [50], function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        viewCommands();
    });
}
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
function addInventory() {
    var chosenItem;
    connection.query("SELECT * FROM products ", function (err, res) {
        inquirer
            .prompt([
                {
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "Which one of these items would you like to add more to?",
                    name: "choice"
                },
                {
                    type: "input",
                    message: "How many more units would you like to add?",
                    name: "add"
                }
            ])
            .then(function (ans) {
                
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name === ans.choice) {
                        chosenItem = res[i];
                    }
                }
                connection.query("UPDATE products SET ? WHERE ?",
                    [{
                        stock_quantity: (chosenItem.stock_quantity + parseInt(ans.add))
                    },
                    {
                        id: chosenItem.id
                    }
                    ], function (err) {
                        if (err) throw err;
                    }
                )
            }).then(function () {
                console.log("\nNew stock: " + chosenItem.stock_quantity);
                viewCommands();
            })

    })
}
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
function newProduct() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item you would like to submit?"
            },
            {
                name: "department",
                type: "input",
                message: "What category would you like to place your auction in?"
            },
            {
                name: "price",
                type: "input",
                message: "What would you like the price to be?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "stock",
                message: "How many units would you like to initialize?",
                type: "input"
            }
        ])
        .then(function (answer) {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.price || 0,
                    stock_quantity: answer.stock || 0
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your item was created successfully!");
                    // re-prompt the user for if they want to bid or post
                    viewCommands();
                }
            );
        });
}