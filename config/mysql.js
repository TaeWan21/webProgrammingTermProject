var mysql = require("mysql2");
var db_info = {
    host: "pxy.ajb.kr",
    port: "3306",
    user: "airbnb",
    password: "airbnb3296",
    database: "airbnb",
};

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function (conn) {
        conn.connect(function (err) {
            if (err) console.error("mysql connection error : " + err);
            else console.log("mysql is connected successfully!");
        });
    },
};