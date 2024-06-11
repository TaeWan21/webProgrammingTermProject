// DB 설정
const db = require("../config/mysql.js");
const conn = db.init();

const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // JSON 형태의 데이터를 파싱할 수 있게 설정

const multer = require("multer");
// multer 이미지 파일 저장 경로
const upload = multer({ dest: 'uploads/' });

router.post("/", (req, res) => {

    const {category, region, checkIn, checkOut } = req.body;

    let query =
        `SELECT c.* FROM campsite c 
            LEFT JOIN site_info si ON c.campsite_num = si.campsite_num 
            LEFT JOIN reservation_info ri ON si.site_id = ri.site_id WHERE 1 = 1 `;

    const queryParams = [];

    if (category) {
        query += `AND si.category = ?`;
        queryParams.push(category);
    }

    if (region) {
        query += `AND c.address LIKE ?`;
        queryParams.push(`%${region}%`);
    }
    if (checkIn && checkOut) {
        query += `AND NOT EXISTS (SELECT 1 FROM reservation_info ri WHERE si.site_id = ri.site_id AND ((ri.check_in <= ? AND ri.check_out >= ?) OR (ri.check_in BETWEEN ? AND ?) OR (ri.check_out BETWEEN ? AND ?)))
        `;
        queryParams.push(checkOut, checkIn, checkIn, checkOut, checkIn, checkOut);
    }



    conn.query(query, queryParams,(err, results) => {
        if (err) {
            console.log(err);
        }

        // 캠핑장별로 그룹화
        const campsites = results.reduce((acc, row) => {
            let campsite = acc.find(c => c.campsite_num === row.campsite_num);
            if (!campsite) {
                campsite = {
                    campsite_num: row.campsite_num,
                    user_num: row.user_num,
                    name: row.name,
                    address: row.address,
                    telephone: row.telephone,
                    content: row.content,
                    enter_time: row.enter_time,
                    exit_time: row.exit_time,
                    manner_time_start: row.manner_time_start,
                    manner_time_end: row.manner_time_end,
                    photo_url: row.photo_url,
                    siteInfos: []
                };
                acc.push(campsite);
            }
            return acc;
        }, []);

        res.status(200).json(campsites);
    })
})

module.exports = router;