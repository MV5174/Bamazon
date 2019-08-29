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
    displayCommands();
});

var displayCommands = function(){
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View Product Sales by Department", "Create New Department"],
                name: "command"
            }
        ])
        .then(function (answer) {
            switch (answer.command) {
                case "View Product Sales by Department":
                    viewProductSales();
                    break;
                case "Create New Department":
                    newDepartment();
                    break;
                default:
                    console.log("No command was chosen");
            }
})
}
//     SELECT column_name AS alias_name
// FROM table_name; thats how to make an alias (total costs)
var viewProductSales = function(){
    console.log("Selecting all products...\n");
    connection.query("SELECT department_id AS id, departments.department_name, over_head_costs, SUM(products.product_sales) AS product_sales FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY department_name",
    function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
            res.forEach(row => {
                row.total_costs = row.product_sales - row.over_head_costs;               
            });
            console.table(res);
        displayCommands();
    });
};

var newDepartment = function(){
    inquirer
    .prompt([
        {
            name: "department",
            type: "input",
            message: "What is the department you would like to submit?"
        },
        {
            name: "costs",
            type: "input",
            message: "What are the over-head costs?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ])
    .then(function (answer) {
        // when finished prompting, insert a new item into the db with that info
        connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: answer.department,
                over_head_costs: answer.costs
            },
            function (err) {
                if (err) throw err;
                console.log("Your department was added successfully!");
                // re-prompt the user for if they want to bid or post
                displayCommands();
            }
        );
    });
};