const LogError = require("@gregvanko/nanox").NanoXLogError
const ModelTracks = require("../MongooseModel/Model_Tracks")
const express = require("@gregvanko/nanox").Express
const router = express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

//Get liste of x post based on page number and used in public mode (no auth)
router.get("/public/:page", (req, res) => {
    let Parametres = {Page : req.params.page}
    GetPostOfPage(Parametres, res)
})

// Get liste of x post based on page number
router.get("/", AuthBasic, (req, res) => {
    let Parametres = {Page : req.query.Page, Filter: JSON.parse(req.query.Filter), AllPublicPost: req.query.AllPublicPost}
    GetPostOfPage(Parametres, res, req.user)
})

// Get liste of x marker based on page number
router.get("/marker", AuthBasic, (req, res) => {
    let Parametres = {Page : req.query.Page, Filter: JSON.parse(req.query.Filter), AllPublicPost: req.query.AllPublicPost}
    GetMarkerOfPage(Parametres, res, req.user)
})

async function GetPostOfPage (Parametres, res, user = null){
    let Reponse = []
    let numberofitem = 5
    let cursor = Parametres.Page * numberofitem
    
    let query = {Public: true}
    if (Parametres.AllPublicPost != undefined){
        if(Parametres.AllPublicPost){
            query = (Parametres.Filter)? FilterTracks(Parametres.Filter, user.User, Parametres.AllPublicPost) : {Public: true}
        } else {
            query = (Parametres.Filter)? FilterTracks(Parametres.Filter, user.User, Parametres.AllPublicPost) : {Owner: user.User}
        }
    }

    const projection = { Name:1, Date:1, Length:1, Description:1, InfoElevation:1, Image:1, StartPoint:1}

    ModelTracks.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetPostOfPage db eroor: ${err}`, user)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).limit(numberofitem).skip(cursor).sort({Date: -1})
}

async function GetMarkerOfPage (Parametres, res, user = null){
    let Reponse = []
    let numberofitem = 10
    let cursor = Parametres.Page * numberofitem
    
    let query = {Public: true}
    if (Parametres.AllPublicPost != undefined){
        if(Parametres.AllPublicPost){
            query = (Parametres.Filter)? FilterTracks(Parametres.Filter, user.User, Parametres.AllPublicPost) : {Public: true}
        } else {
            query = (Parametres.Filter)? FilterTracks(Parametres.Filter, user.User, Parametres.AllPublicPost) : {Owner: user.User}
        }
    }

    const projection = {_id: 1, Name:1, Date:1, Length:1, Description:1, InfoElevation:1, StartPoint:1}

    ModelTracks.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetMarkerOfPage db eroor: ${err}`, user)
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