const ModelTracks = require("../MongooseModel/Model_Tracks")
const express = require("@gregvanko/nanox").Express
const router = express.Router()

// Get Map
// https://dev.gregvanko.com/getmap/?trackid=5fc12c5ebe87dc3b01725bd1&trackid=5fc12c0abe87dc3b01725bcb
router.get("/", (req, res) => {
    // ToDo
})


module.exports = router