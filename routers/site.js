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

// 'uploads' 디렉토리를 정적 파일로 제공
app.use('/uploads', express.static('uploads'));

const multer = require("multer");
// multer 이미지 파일 저장 경로
const upload = multer({ dest: 'uploads/' });

// 사이트 등록
router.post("/", upload.fields([{ name : 'sitePhotoUrl', maxCount : 1}]), function (req, res) {
    const {campsiteNum, siteName, charge, pCapacity, category} = req.body;
    const sitePhotoUrl = req.files['sitePhotoUrl'][0].path;

    const siteQuery = "INSERT INTO site_info (campsite_num, site_name, charge, capacity, site_photo_url, category) VALUES (?, ?, ?, ?, ?, ?)";
    conn.query(siteQuery, [campsiteNum, siteName, charge, pCapacity, sitePhotoUrl, category], (err) => {
        if (err) {
            return res.status(500).send('Error updating site information');
        }
        else {
            return res.status(200).send('Site information Registration success!');
        }
    });
})

// 사이트 업데이트
router.put("/:siteId", function (req, res) {
    const { siteId } = req.params;
    const { siteName, charge, pCapacity, sitePhotoUrl, category } = req.body;

    const updateQuery = "UPDATE site_info SET site_name = ?, charge = ?, capacity = ?, site_photo_url = ?, category = ? WHERE site_id = ?";

    conn.query(updateQuery, [siteName, charge, pCapacity, sitePhotoUrl, category, siteId], (err, result) => {
        if (err) {
            return res.status(500).send('Error updating site information');
        }
        return res.status(200).send('Site information updated successfully');
    });
});

// 사이트 삭제
router.delete("/:siteId", function (req, res) {
    const { siteId } = req.params;

    const deleteQuery = "DELETE FROM site_info WHERE site_id = ?";

    conn.query(deleteQuery, [siteId], (err, result) => {
        if (err) {
            return res.status(500).send('Error deleting site');
        }
        return res.status(200).send('Site deleted successfully');
    });
});

// 사이트 조회
router.get("/:siteId" , (req, res) => {
    const { siteId } = req.params;
    const getQuery = "SELECT * FROM site_info WHERE site_id = ?";

    conn.query(getQuery, [siteId], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            return res.status(200).send(results);
        }
    })
})

// 마이페이지 조회
router.get("/myPage/:siteId", (req, res) => {
    const { siteId } = req.params;
    const getSiteQuery = "SELECT * FROM site_info WHERE site_id = ?";

    conn.query(getSiteQuery, [siteId], (err, siteResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error occurred.');
        }

        if (siteResults.length === 0) {
            return res.send('Site not found.');
        }

        const campsiteNum = siteResults[0].campsite_num;
        const getCampsiteQuery = "SELECT * FROM campsite WHERE campsite_num = ?";

        conn.query(getCampsiteQuery, [campsiteNum], (err, campsiteResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error occurred.');
            }

            const response = {
                siteInfo: siteResults[0],
                campsiteInfo: campsiteResults[0] || null  // 캠핑장 정보가 없을 수 있으므로 대비
            };

            return res.status(200).send(response);
        });
    });
});

module.exports = router;