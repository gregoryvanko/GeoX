const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelTracks = require("../MongooseModel/Model_Tracks")
const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
const MongooseTypes = require("@gregvanko/nanox").Mongoose.Types


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

router.get("/multi/geojson", AuthBasic, (req, res) => {

    const ListOfId = req.query.ListOfTrackId

    if (ListOfId.length > 0){
        let ListOfIdToSearch = []

        ListOfId.forEach(element => {
            ListOfIdToSearch.push(MongooseTypes.ObjectId(element))
        });
    
        const Projection = { GeoJsonData: 1, Color: 1}
        const Querry = {'_id': { $in: ListOfIdToSearch}}
    
        ModelTracks.find(Querry, Projection, (err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`Get multiple geojson db error: ${err}`, req.user)
            } else {
                res.status(200).send(result) 
            }
        })
    } else {
        res.status(500).send("List of id is empty")
        LogError(`Get multiple geojson error: List of id is empty`, req.user)
    }
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

module.exports = router