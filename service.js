//---------- import -----------
const express = require("express");
const multer = require("multer");
// const bcrypt = require('bcrypt');
const app = express();
const path = require("path");
const upload = require('./uploadConfig.js');

const bcrypt = require("bcrypt");

//---- mysql -----
const mysql = require("mysql");
const config = require("./dbConfig.js");
const e = require("express");
const { database, password } = require("./dbConfig.js");
const con = mysql.createConnection(config);

//middleware is .use
app.use(express.static(path.join(__dirname, "js")))
app.use(express.static(path.join(__dirname, "css")))
app.use(express.static(path.join(__dirname, "img")))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ****** Page Routes ******
// ----- root service -----
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./index.html"))
});

app.get("/admindashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "./adminDashboard.html"))
});

app.get("/addpromotion", (req, res) => {
    res.sendFile(path.join(__dirname, "./adminMypromotion.html"))
});

app.get("/adminstatic", (req, res) => {
    res.sendFile(path.join(__dirname, "./adminBusinessInsight.html"))
});

app.get("/adminprofile", (req, res) => {
    res.sendFile(path.join(__dirname, "./profileAdmin.html"))
});

app.get("/explore", (req, res) => {
    res.sendFile(path.join(__dirname, "./explore.html"))
});

app.get("/findgroup", (req, res) => {
    res.sendFile(path.join(__dirname, "./Findsp.html"))
});

app.get("/contactus", (req, res) => {
    res.sendFile(path.join(__dirname, "./contactus.html"))
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "./login1.html"))
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "./registerNew.html"))
});

app.get("/userindex", (req, res) => {
    res.sendFile(path.join(__dirname, "./indexafterlogin.html"))
});

app.get("/mypurchasestatus", (req, res) => {
    res.sendFile(path.join(__dirname, "./MyPurchaseStatus.html"))
});

app.get("/mypurchase", (req, res) => {
    res.sendFile(path.join(__dirname, "./MyPurchase.html"))
});

app.get("/changepass", function (req, res) {
    res.sendFile(path.join(__dirname, "./changepass.html"));
});

app.get("/userAccount", function (req, res) {
    res.sendFile(path.join(__dirname, "./myaccount.html"));
});

app.get("/test", function (req, res) {
    res.sendFile(path.join(__dirname, "./testNewIndex.html"));
});

app.get("/loginIndex", function (req, res) {
    res.sendFile(path.join(__dirname, "./indexafterlogin.html"))
});

// ============= Login ==============
app.post("/logins", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const sql = "SELECT username, password FROM user WHERE username=?";

    con.query(sql, [username], function (err, result, fields) {

        if (err) {
            console.log(err);
            res.status(500).send("Database server error.");
        } else {
            if (result.length != 1) {
                console.log("Username error!");
                res.status(500).send("User not found or repeated users.");

            } else {
                // const hash = result[0].password;
                //console.log(username, result[0].password);
                bcrypt.compare(password, result[0].password, function (err, same) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Authen server error");
                    } else {
                        if (same) {
                            // raw == hash
                            if ((result[0].username == 'Orawan021') || (result[0].username == 'Prinnada027') || (result[0].username == 'Thiti007')) {
                                res.send("/admindashboard");
                            } else {
                                res.send("/loginIndex");
                            }
                        } else {
                            res.status(400).send("Wrong password!");
                        }
                    }
                });
            }

        }

    });

    // console.log(username, password);
});

//---- register ----
app.post("/registers", (req, res) => {
    const username = req.body.username;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const gender = req.body.gender;
    const passworduser = req.body.passworduser;

    bcrypt.hash(passworduser, 10, function (err, hash) {
        if (err) {
            console.log(err);
            res.status(500).send("Hash error");
        } else {
            //get hashed password
            //insert to DB
            //console.log(hash)
            const sql = 'INSERT INTO user (username, first_name, last_name, gender, password ,email) VALUE (?, ?, ?, ?, ?, ?)';

            con.query(sql, [username, first_name, last_name, gender, hash, email], function (err, result) {

                if (err) {
                    console.log(err);
                    res.status(500).send("Database server error.");
                } else {
                    if (result.affectedRows == 1) {
                        res.send("New promotion has been added.");
                    } else {
                        res.status(501).send("Error while adding new user.");
                    }
                }
            });
        }
    })

});

//=========== Set Password (Bo part)============
app.post("/changepass", function (req, res) {

    const oldpass = req.body.oldpass;
    const newpass = req.body.newpass;

    const sql = "UPDATE user SET password=? WHERE password=?";
    con.query(sql, [newpass, oldpass], function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).end("Server error");
        }
    });
});

//---- get user ----
app.get("/getuserinfo", (req, res) => {
    const sql = "SELECT username, first_name, last_name, email, gender, password FROM user";
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error");
        } else {
            res.json(result);
        }
    });
});

//---- Get user info where username already login
app.post("/getuserInfo", (req, res) => {

    const userKey = req.body.userKey;
    //console.log(userKey);

    const sql = "SELECT first_name, last_name, email, gender, password FROM user WHERE username ='$userKey'";
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error");
        } else {
            res.json(result);
        }
    });
});

//---Get the promotion
app.get("/promotion", (req, res) => {
    const sql = "SELECT proCode, proName, proType, peoplePerPro, oriPrice, salePrice, startDate, endDate, proDetail, proImg, proLocation FROM promotion";
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error");
        } else {
            res.json(result);
        }
    });
});

//test
app.get("/showImg", function (req, res) {
    const sql = "SELECT proImg FROM promotion";
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error");
        } else {
            res.send(result);
        }
    });
});


//check row in table for display at dashboard
app.get("/prolength", (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM promotion";
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error");
        } else {
            // console.log(result);
            res.json(result);
        }
    });
});

app.get("/memberlength", (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM user";
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error");
        } else {
            // console.log(result);
            res.json(result);
        }
    });
});

//Check current time
app.get("/currentDate", function (req, res) {
    const today = new Date().toLocaleDateString();
    res.status(200).send(today);
});


//--- Add promotion -----
app.post("/addpromotions", function (req, res) {

    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send("Upload error");
        } else {
            //upload data to database
            const proName = req.body.proName;
            const oriPrice = req.body.oriPrice;
            const salePrice = req.body.salePrice;
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;
            const peoplePerPro = req.body.peoplePerPro;
            const proDetail = req.body.proDetail;
            const proType = req.body.proType;
            const proLocation = req.body.proLocation;
            const proImg = req.file.filename;

            console.log("New promotion: ", proName, proType, oriPrice, salePrice, startDate, endDate, peoplePerPro, proDetail, proImg, proLocation);

            const sql = `INSERT INTO promotion (proName, proType, peoplePerPro, oriPrice, salePrice, startDate, endDate, proDetail, proImg, proLocation) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            con.query(sql, [proName, proType, peoplePerPro, oriPrice, salePrice, startDate, endDate, proDetail, proImg, proLocation], function (err, result, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send("Database server error.");
                } else {
                    if (result.affectedRows == 1) {
                        res.send("New promotion has been added.");
                    } else {
                        res.status(501).send("Error while adding new user.");
                    }
                }
            });
        }
    })

});

//--start server--
const PORT = 3000;
app.listen(PORT, (req, res) => {
    console.log("Server is running at " + PORT);
});
