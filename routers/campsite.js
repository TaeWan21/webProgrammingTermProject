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

// 캠핑장 전체 등록
router.post("/", upload.fields([{ name : 'photoUrl', maxCount : 1}]), function (req, res) {
    const { userNum, name, address, telephone, content, enterTime, exitTime,
        mannerTimeStart,mannerTimeEnd, facilities } = req.body;

    console.log(req.body);

    const photoUrl = req.files['photoUrl'][0].path;

    // 캠핑장 등록
    const campsiteQuery = "INSERT INTO campsite (user_num, name, address, telephone, content, enter_time, exit_time, manner_time_start, manner_time_end, photo_url) VALUES (?, ?, ?, ?, ?, ?, ? ,? ,?, ?)";

    conn.query(campsiteQuery, [userNum, name, address, telephone, content, enterTime, exitTime,
        mannerTimeStart,mannerTimeEnd, photoUrl],(err, result) => {
        if (err) {
            console.log(err);
        }
        const campsiteId = result.insertId;

        // 캠핑장 시설 등록
        facilities.map(facility => {
            const facilityQuery = "INSERT INTO facility_info (campsite_num, facility) VALUES (?, ?)";
            conn.query(facilityQuery, [campsiteId, facility.facility], (err, result) => {
                console.log(err);
            })
        })
        res.status(200).send('Data Inserted Successfully');
    })
})

// userNum 으로 내 캠핑장 조회
router.get("/:userNum", (req, res) => {
    // URL에서 userNum 파라미터를 추출합니다.
    const userNum = req.params.userNum;

    // user_num을 기준으로 캠핑장 정보를 조회하는 SQL 쿼리문입니다.
    const campsiteQuery = "SELECT * FROM campsite WHERE user_num = ?";

    // SQL 쿼리를 실행합니다.
    conn.query(campsiteQuery, [userNum], (err, results) => {
        if (err) {
            // 에러가 발생하면 클라이언트에 에러 메시지를 반환합니다.
            console.error(err);
            res.status(500).send('Server Error');
            return;
        }

        if (results.length > 0) {
            // 조회된 결과가 있으면 JSON 형식으로 변환하여 반환합니다.
            res.json(results);
        } else {
            // 조회된 결과가 없으면 적절한 메시지와 함께 응답합니다.
            res.status(404).send('Campsite not found');
        }
    });
});

// 캠핑장 Detail 조회
router.get("/detail/:campsiteNum", function (req, res) {
    const campsiteNum = req.params.campsiteNum;

    if (!campsiteNum) {
        return res.status(400).send('campsiteNum query parameter is required');
    }

    // 캠핑장 기본 정보 조회
    const campsiteQuery = "SELECT * FROM campsite WHERE campsite_num = ?";
    conn.query(campsiteQuery, [campsiteNum], (err, campsiteResult) => {
        if (err) return res.status(500).send('Error fetching campsite information');

        if (campsiteResult.length === 0) {
            return res.status(404).send('Campsite not found');
        }

        const campsiteInfo = campsiteResult[0];

        // 캠핑장 시설 정보 조회
        const facilityQuery = "SELECT facility FROM facility_info WHERE campsite_num = ?";
        conn.query(facilityQuery, [campsiteNum], (facilityErr, facilitiesResult) => {
            if (facilityErr) return res.status(500).send('Error fetching facilities');

            const facilities = facilitiesResult.map(f => f.facility);

            // 캠핑장 사이트 정보 조회
            const siteQuery = "SELECT * FROM site_info WHERE campsite_num = ?";
            conn.query(siteQuery, [campsiteNum], (siteErr, sitesResult) => {
                if (siteErr) return res.status(500).send('Error fetching sites');

                const sites = sitesResult;

                // 모든 정보를 포함한 객체 생성
                const response = {
                    ...campsiteInfo,
                    facilities,
                    sites
                };

                // 클라이언트에게 응답
                res.status(200).send(response);
            });
        });
    });
});

// 캠핑장 업데이트
router.put("/", function (req, res) {
    // 업데이트할 캠핑장의 ID와 업데이트할 정보
    const {campsiteNum, name, address, telephone, content, enterTime, exitTime,
        mannerTimeStart, mannerTimeEnd, facilities} = req.body;

    console.log(req.body);
    // 캠핑장 정보 업데이트
    const updateCampsiteQuery = "UPDATE campsite SET name = ?, address = ?, telephone = ?, content = ?, enter_time = ?, exit_time = ?, manner_time_start = ?, manner_time_end = ? WHERE campsite_num = ?";

    conn.query(updateCampsiteQuery, [name, address, telephone, content, enterTime, exitTime,
        mannerTimeStart, mannerTimeEnd, campsiteNum], (err, result) => {
        if (err) {
            console.error(err);
        }
    });
    // 캠핑장 facility 수정
    const deleteFacilitiesQuery = "DELETE FROM facility_info WHERE campsite_num = ?";
    conn.query(deleteFacilitiesQuery, [campsiteNum], (err, result) => {
        if (err) {
            console.error(err);
        }
    })
    facilities.map(facility => {
        const facilityQuery = "INSERT INTO facility_info (campsite_num, facility) VALUES (?, ?)";
        conn.query(facilityQuery, [campsiteNum, facility], (err, result) => {
            if (err) {
                console.error(err);
            }
        })
    })
    res.status(200).send('Data Updated Successfully');
})

// 모든 캠핑장 조회
router.get("/", (req, res) => {
    const allCampsite = "SELECT * FROM campsite"; // 실제 사용 시, 필요한 컬럼만 명시하는 것이 좋습니다.
    conn.query(allCampsite, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('서버 에러가 발생했습니다.'); // 에러 응답 추가
        } else {
            if (results.length > 0) {
                return res.status(200).send(results);
            } else {
                return res.status(404).send('데이터가 없습니다.'); // 데이터가 없을 때의 처리
            }
        }
    })
})

module.exports = router;

