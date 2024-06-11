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

// 주인의 캠핑장 예약 승인 할수있게 모두 조회
router.get("/admin/:userNum", async (req, res) => {
    const { userNum } = req.params;
    // 주인의 모든 캠핑장 가져오기
    const getCampsite = "SELECT * FROM campsite WHERE user_num = ?";

    conn.query(getCampsite, [userNum], (err, campsites) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error occurred.');
        }

        if (campsites.length === 0) {
            return res.send('No campsites found for this user.');
        }

        // 캠핑장에 대한 모든 site_info 가져오기
        const siteInfosPromises = campsites.map((campsite) =>
            new Promise((resolve, reject) => {
                const getSiteInfo = "SELECT * FROM site_info WHERE campsite_num = ?";
                conn.query(getSiteInfo, [campsite.campsite_num], (err, siteInfos) => {
                    if (err) {
                        return reject(err);
                    }
                    campsite.siteInfos = siteInfos; // 캠핑장 객체에 siteInfos 추가
                    resolve();
                });
            })
        );

        Promise.all(siteInfosPromises)
            .then(() => {
                // site_info에 대한 모든 reservationInfo 가져오기
                const reservationInfoPromises = campsites.flatMap((campsite) =>
                    campsite.siteInfos.map((siteInfo) =>
                        new Promise((resolve, reject) => {
                            const getReservationInfo = "SELECT * FROM reservation_info WHERE site_id = ?";
                            conn.query(getReservationInfo, [siteInfo.site_id], (err, reservationInfos) => {
                                if (err) {
                                    return reject(err);
                                }
                                siteInfo.reservationInfos = reservationInfos; // siteInfo 객체에 reservationInfos 추가
                                resolve();
                            });
                        })
                    )
                );

                Promise.all(reservationInfoPromises)
                    .then(() => {
                        // 예약 정보가 있는 캠핑장, 사이트, 예약 정보만 필터링하여 응답으로 보내기
                        const filteredCampsites = campsites.filter(campsite =>
                            campsite.siteInfos.some(siteInfo =>
                                siteInfo.reservationInfos.length > 0
                            )
                        ).map(campsite => {
                            // 예약 정보가 있는 사이트만 필터링
                            campsite.siteInfos = campsite.siteInfos.filter(siteInfo =>
                                siteInfo.reservationInfos.length > 0
                            );
                            return campsite;
                        });

                        res.status(200).json(filteredCampsites);
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send('Server error occurred while fetching reservation information.');
                    });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Server error occurred while fetching site information.');
            });
    });
});

// 예약 승인
router.post("/approve/:reservationId", (req, res) => {
    const {reservationId} = req.params;
    const query = "UPDATE reservation_info SET approval = ? WHERE reservation_id = ?";
    conn.query(query, ["approve", reservationId], (err, results) => {
        if (err) {
            console.error(err);
        } else {
            res.status(200).send("reservation approved successfully.");
        }
    })
})

// 예약 거절
router.post("/refuse/:reservationId", (req, res) => {
    const {reservationId} = req.params;
    const query = "UPDATE reservation_info SET approval = ? WHERE reservation_id = ?";
    conn.query(query, ["refuse", reservationId], (err, results) => {
        if (err) {
            console.error(err);
        } else {
            res.status(200).send("reservation approved successfully.");
        }
    })
})
module.exports = router;