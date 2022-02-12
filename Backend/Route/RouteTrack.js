const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelTracks = require("../MongooseModel/Model_Tracks")
//const express = require("@gregvanko/nanox").Express
//const router = express.Router()
const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

router.get("/onetrack/:id", AuthBasic, (req, res) => {
    let Id = req.params.id
    LogInfo(`Route Track GET onetrack: ${JSON.stringify(Id)}`, req.user)

    const Projection = { GpxData: 0}
    ModelTracks.findById(Id, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetTrackData db error: ${err}`, req.user)
        } else {
            if (result != null){
                res.status(200).send(result) 
            } else {
                let errormsg = "Track Id not found"
                res.status(500).send(errormsg)
                LogError(`GetTrackData error: ${errormsg}`, req.user)
            }
        }
    })
})

router.get("/gpx/:id", AuthBasic, (req, res) => {
    let Id = req.params.id
    LogInfo(`Route Track GET gpx: ${JSON.stringify(Id)}`, req.user)

    const Projection = { GpxData: 1}
    ModelTracks.findById(Id, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`Get gpx db error: ${err}`, req.user)
        } else {
            if (result != null){
                res.status(200).send(result) 
            } else {
                let errormsg = "Track Id not found"
                res.status(500).send(errormsg)
                LogError(`Get gpx error: ${errormsg}`, req.user)
            }
        }
    })
})

router.get("/geojson/:id", AuthBasic, (req, res) => {
    let Id = req.params.id
    LogInfo(`Route Track GET geojson: ${JSON.stringify(Id)}`, req.user)

    const Projection = { GeoJsonData: 1}
    ModelTracks.findById(Id, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`Get geojson db error: ${err}`, req.user)
        } else {
            if (result != null){
                res.status(200).send(result) 
            } else {
                let errormsg = "Track Id not found"
                res.status(500).send(errormsg)
                LogError(`Get geojson error: ${errormsg}`, req.user)
            }
        }
    })
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
        //CopyTrack(CopyTrackData, res, req.user)
        const Projection = {_id: 0}
        ModelTracks.findById(CopyTrackData.TrackId, Projection, (err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`CopyTrack db error: ${err}`, req.user)
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
                    TrackData.Owner = req.user.User

                    const NewTrack = new ModelTracks(TrackData)
                    NewTrack.save((err, result) => {
                        if (err) {
                            res.status(500).send(err)
                            LogError(`CopyTrack db error: ${err}`, req.user)
                        } else {
                            res.status(200).send("Ok")
                        }
                    })

                } else {
                    let errormsg = "Track Id not found"
                    res.status(500).send(errormsg)
                    LogError(`CopyTrack error: ${errormsg}`, req.user)
                }
            }
        })
    } else {
        LogError(`Route Track CopyTrack Post error: Data not found in req`, req.user)
    }
})


module.exports = router