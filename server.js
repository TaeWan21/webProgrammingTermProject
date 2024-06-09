const express = require("express");
const app = express();
const port = 3000;

var server= require('http').createServer(app);
const multer = require("multer");

// multer 이미지 파일 저장 경로
const upload = multer({ dest: 'uploads/' });

// DB 설정
const db = require("./config/mysql.js");
const conn = db.init();

const cors = require("cors");
app.use(cors());

const fs = require("fs");

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // JSON 형태의 데이터를 파싱할 수 있게 설정

// 'uploads' 디렉토리를 정적 파일로 제공
app.use('/uploads', express.static('uploads'));

// 라우터 경로
const login = require("./routers/login");
const campsite = require("./routers/campsite");
const site = require("./routers/site");
const reservation = require("./routers/reservation");
const review = require("./routers/review");
// 로그인
app.use("/login", login);
// 캠핑장
app.use("/campsite", campsite);
// 사이트
app.use("/site", site);
// 예약
app.use("/reservation", reservation);
// 리뷰
app.use("/review", review);


server.listen(port);

