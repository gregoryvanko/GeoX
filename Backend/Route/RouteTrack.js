const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const LogStatApi = require("@gregvanko/nanox").NanoXLogStatApi
const ModelTracks = require("../MongooseModel/Model_Tracks")
const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
const MongooseTypes = require("@gregvanko/nanox").Mongoose.Types

const GetElevationOfLatLng = require("./HelperTrack").GetElevationOfLatLng
const GeoJsonToGPX = require("./HelperTrack").GeoJsonToGPX

router.get("/gpx/:id", AuthBasic, (req, res) => {
    let Id = req.params.id
    LogInfo(`Route Track GET gpx: ${JSON.stringify(Id)}`, req.user)
    LogStatApi("track/gpx", "get", req.user)

    //const Projection = { GpxData: 1}
    const Projection = { GeoJsonData: 1, Name:1, Date:1, Description:1}
    
    ModelTracks.findById(Id, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`Get gpx db error: ${err}`, req.user)
        } else {
            if (result != null){
                //res.status(200).send(result) 

                const gpxReponse = GeoJsonToGPX(result.GeoJsonData, result.Name, result.Date, result.Description)
                const reponse = {GpxData: gpxReponse}
                res.status(200).send(reponse) 
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
    LogStatApi("track/geojson", "get", req.user)

    const Projection = { GeoJsonData: 1, Center: 1, ExteriorPoint:1}
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
    LogStatApi("track/multi/geojson", "get", req.user)

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
    LogStatApi("track/mygroups", "get", req.user)

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

router.post("/elavationlatlng", AuthBasic, async (req, res) => {
    LogStatApi("track/elavationlatlng", "get", req.user)

    const LatLng = req.body

    let ReponseElevation = await GetElevationOfLatLng(LatLng)
        if(ReponseElevation.Error){
            let ErrorMsg = "GetElevationOfLatLng error : " + ReponseElevation.ErrorMsg
            res.status(500).send(ErrorMsg)
            LogError(`Get mygroups db error: ${ErrorMsg}`, req.user)
        } else {
            res.json(ReponseElevation.Data)
        }
})

router.get("/tracksofgroup", AuthBasic, (req, res) => {
    LogStatApi("track/tracksofgroup", "get", req.user)

    const Parametres = {Page : req.query.Page, Group: req.query.Group}

    const Projection = { GeoJsonData: 1, Color: 1, Name: 1, Length: 1, _id: 1}
    const Querry = {$and: [{Group: Parametres.Group}, {Owner: req.user.User}]}

    const numberofitem = 5
    const cursor = Parametres.Page * numberofitem

    ModelTracks.find(Querry, Projection, (err, result) => {
        let Reponse = []
        if (err) {
            res.status(500).send(err)
            LogError(`TracksOfGroup db eroor: ${err}`, req.user)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).limit(numberofitem).skip(cursor)

})

module.exports = router