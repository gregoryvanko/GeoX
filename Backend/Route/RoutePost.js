const ModelTracks = require("../MongooseModel/Model_Tracks")

const express = require("@gregvanko/nanox").Express
const router = express.Router()

// Get liste of x public post based on page number
router.get("/public/:page", (req, res) => {
    //console.log(req.params.page)
    GetPostOfPage(req.params.page, res)
})

async function GetPostOfPage (Page, res){
    let Reponse = {Error: true, ErrorMsg : "No error message", Data: []}
    let numberofitem = 5
    let cursor = Page * numberofitem

    const query = {Public: true}
    const projection = { Name:1, Date:1, Length:1, Description:1, InfoElevation:1, Image:1, StartPoint:1}

    ModelTracks.find(query, projection, (err, result) => {
        if (err) {
            Reponse.ErrorMsg = err
            res.status(500).send(Reponse);
        } else {
            Reponse.Error = false
            Reponse.ErrorMsg = null
            if (result.length != 0){
                Reponse.Data = result
            }
            res.status(200).send(Reponse);
        }
      }).limit(numberofitem).skip(cursor).sort({Date: -1})
}


module.exports = router