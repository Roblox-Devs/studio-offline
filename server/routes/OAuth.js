const express = require("express")
const path = require("path")
const router = express.Router()

router.get("/.well-known/openid-configuration", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../static/OAuth/openid.json"))
})
router.post("/v1/token", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../static/OAuth/token.json"))
})

router.get("/v1/userinfo", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../static/OAuth/userinfo.json"))
})
router.get("/v1/authorize", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../static/OAuth/authorize.html"));
})

module.exports = router