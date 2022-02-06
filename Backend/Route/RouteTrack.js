const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelTracks = require("../MongooseModel/Model_Tracks")
const express = require("@gregvanko/nanox").Express
const router = express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

router.get("/onetrack/:id", AuthBasic, (req, res) => {
    let Parametres = {Id : req.params.id}
    LogInfo(`Route Track GET: ${JSON.stringify(Parametres)}`, req.user)
    GetTrackAllData(Parametres, res, req.user)
})

router.get("/mygroups", AuthBasic, (req, res) => {
    const Querry = {Owner: req.user.User}
    const Projection = {Group: 1}
    ModelTracks.find(Querry, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`Get mygroups db error: ${err}`, req.user)
        } else {
            let DataToSend = []
            if (result.length > 0){
                DataToSend = [...new Set(result.map(item => item.Group))] 
            }
            res.status(200).send(DataToSend) 
        }
    }).sort({Group: 1})
})

router.post("/CopyTrack", AuthBasic, (req, res) => {
    let CopyTrackData = req.body
    if (JSON.stringify(CopyTrackData) != "{}"){
        LogInfo(`Route Track CopyTrack Post: ${JSON.stringify(CopyTrackData)}`, req.user)
        CopyTrack(CopyTrackData, res, req.user)
    } else {
        LogError(`Route Track CopyTrack Post error: Post data not found in req`, req.user)
    }
})

function GetTrackAllData(Parametres, res, User = null){
    const Projection = { GpxData: 0}
    ModelTracks.findById(Parametres.Id, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetTrackData db error: ${err}`, User)
        } else {
            if (result != null){
                res.status(200).send(result) 
            } else {
                let errormsg = "Track Id not found"
                res.status(500).send(errormsg)
                LogError(`GetTrackData eroor: ${errormsg}`, User)
            }
        }
    })
}

function CopyTrack(CopyTrackData, res, User = null){
    const Projection = {_id: 0}
    ModelTracks.findById(CopyTrackData.TrackId, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`CopyTrack db error: ${err}`, User)
        } else {
            if (result != null){
                // Copy de la track
                let TrackData = JSON.parse(JSON.stringify(result))
                // Modification de la track
                TrackData.Name = CopyTrackData.Name
                TrackData.Group = CopyTrackData.Group
                TrackData.Public = CopyTrackData.Public
                TrackData.Description = CopyTrackData.Description
                TrackData.Color = "#0000FF"
                TrackData.Date = new Date()
                TrackData.Owner = User.User

                const NewTrack = new ModelTracks(TrackData)
                NewTrack.save((err, result) => {
                    if (err) {
                        res.status(500).send(err)
                        LogError(`CopyTrack db error: ${err}`, User)
                    } else {
                        res.status(200).send("Ok")
                    }
                })

            } else {
                let errormsg = "Track Id not found"
                res.status(500).send(errormsg)
                LogError(`CopyTrack eroor: ${errormsg}`, User)
            }
        }
    })
}


module.exports = router