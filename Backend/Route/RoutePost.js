const LogError = require("@gregvanko/nanox").NanoXLogError
const ModelTracks = require("../MongooseModel/Model_Tracks")
const express = require("@gregvanko/nanox").Express
const router = express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

// Public Get liste of x public post based on page number
router.get("/public/", (req, res) => {
    GetPostOfPage(req.query, res)
})

// Get liste of x public post based on page number and used in app
router.get("/", AuthBasic, (req, res) => {
    GetPostOfPage(req.query, res, req.user)
})

async function GetPostOfPage (ReqQuery, res, user = null){
    let Reponse = []
    let numberofitem = 5
    let cursor = ReqQuery.Page * numberofitem
    
    let query = {Public: true}
    if (ReqQuery.AllPublicPost != undefined){
        if(ReqQuery.AllPublicPost){
            query = (ReqQuery.Filter)? FilterTracks(JSON.parse(ReqQuery.Filter), user.User, ReqQuery.AllPublicPost) : {Public: true}
        } else {
            query = (ReqQuery.Filter)? FilterTracks(JSON.parse(ReqQuery.Filter), user.User, ReqQuery.AllPublicPost) : {Owner: user.User}
        }
    }

    const projection = { Name:1, Date:1, Length:1, Description:1, InfoElevation:1, Image:1, StartPoint:1}

    ModelTracks.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetPostOfPage db eroor: ${err}`)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
      }).limit(numberofitem).skip(cursor).sort({Date: -1})
}

function FilterTracks(Filter, User, AllPublicPost){
    // Query de base
    let Query = null
    if (AllPublicPost){
        Query = {$and:[
            {Public: true}
        ]}
    } else {
        Query = {$and:[
            {Owner: User}
        ]}
    }

    // DistanceMin
    if (Filter.DistanceMin){
        Query.$and.push({Length:{$gte: Filter.DistanceMin}})
    }
    // DistanceMax
    if (Filter.DistanceMax){
        Query.$and.push({Length:{$lte: Filter.DistanceMax}})
    }
    // HideMyTrack
    if (Filter.HideMyTrack){
        Query.$and.push({Owner: { $ne: User }})
    }
    // Group
    if ((Filter.Group != undefined) && (Filter.Group != "")){
        Query.$and.push({Group: Filter.Group})
    }

    return Query 
}


module.exports = router