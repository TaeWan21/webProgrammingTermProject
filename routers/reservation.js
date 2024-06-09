// DB 설정
const db = require("../config/mysql.js");
const conn = db.init();

const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // JSON 형태의 데이터를 파싱할 수 있게 설정

const cors = require("cors");
app.use(cors());

// 캠핑장 예약 등록
router.post("/", (req, res) => {
    const {siteId, userNum, adult, child, checkIn, checkOut} = req.body;
    const checkIn1 = checkIn.split("T")[0];
    const checkOut1 = checkOut.split("T")[0];
    console.log(req.body);
    const reservationQuery = "INSERT INTO reservation_info (site_id, user_num, adult, child, check_in, check_out, approval) VALUES (?, ?, ?, ?, ?, ?, ?)";

    conn.query(reservationQuery, [siteId, userNum, adult, child, checkIn1, checkOut1, "wait"], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send('reservation Successfully');
        }
    })
})

// 해당 사이트 예약 조회
router.get("/:siteId", (req, res) => {
    const {siteId} = req.params;
    const query = "SELECT * FROM reservation_info WHERE site_id = ?";
    conn.query(query, [siteId], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send(results);
        }
    })
})

// 유저 예약 조회
router.get("/myPage/:userNum", (req, res) => {
    const {userNum} = req.params;

    const query = "SELECT * FROM reservation_info WHERE user_num = ?";
    conn.query(query, [userNum], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            return res.status(200).send(results);
        }
    })
})

module.exports = router;