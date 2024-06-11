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

const multer = require("multer");
// multer 이미지 파일 저장 경로
const upload = multer({ dest: 'uploads/' });

// 리뷰 등록
router.post("/", upload.fields([{ name : 'reviewPhoto', maxCount : 1}]), (req, res) => {
    const {campsiteNum, userNum, reviewPost, reviewStar} = req.body;

    const reviewPhoto = req.files['reviewPhoto'][0].path;

    const reviewQuery = "INSERT INTO review_info(campsite_num, user_num, review_photo, review_post, review_star) VALUES (?, ?, ?, ?, ?)";

    conn.query(reviewQuery, [campsiteNum, userNum,  reviewPhoto, reviewPost, reviewStar], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error');
        } else {
            res.status(200).send('review upload Successfully');
        }
    })
})

// 리뷰 조회
router.get("/:campsiteNum", (req, res) => {
    const { campsiteNum } = req.params;
    const reviewQuery = "SELECT * FROM review_info WHERE campsite_num = ?";
    conn.query(reviewQuery, [campsiteNum], (err, results) => {
        if (err) {
            return res.status(500).send('Error');
        } else {
            return res.status(200).send(results);
        }
    })
})

module.exports = router;