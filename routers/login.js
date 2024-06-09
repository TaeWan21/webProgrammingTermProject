// DB 설정
const db = require("../config/mysql.js");
const conn = db.init();



const express = require('express');
const app = express();

const cors = require("cors");
app.use(cors());

const router = express.Router();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // JSON 형태의 데이터를 파싱할 수 있게 설정

// const cors = require("cors");
// app.use(cors());

// 로그인
router.post("/", (req, res) => {
    const { id, password } = req.body;

    const loginQuery = "SELECT * FROM users WHERE id = ? AND password = ?";
    conn.query(loginQuery, [id, password], (err, results) => {
        if (err) {
            console.error(err);
        }
        res.status(200).send(results);
        // res.json(results);
        console.log(results);
    })
})

module.exports = router;

