const LogError = require("@gregvanko/nanox").NanoXLogError
const ModelTracks = require("../MongooseModel/Model_Tracks")

const MinMaxGeoJsonTrack = require("./HelperTrack").MinMaxGeoJsonTrack
const CalculateTrackLength = require("./HelperTrack").CalculateTrackLength
const GetElevationOfGeoJson = require("./HelperTrack").GetElevationOfGeoJson

async function GetPostOfPage (Parametres, res, user = null){
    let Reponse = []
    let numberofitem = (Parametres.ViewPost)? 5 : 10
    let cursor = Parametres.Page * numberofitem
    
    let query = {Public: true}
    if (Parametres.AllPublicPost != undefined){
        if(Parametres.AllPublicPost){
            query = (Parametres.Filter)? FilterTracks(Parametres.Filter, user.User, Parametres.AllPublicPost) : {Public: true}
        } else {
            query = (Parametres.Filter)? FilterTracks(Parametres.Filter, user.User, Parametres.AllPublicPost) : {Owner: user.User}
        }
    }

    const projection =(Parametres.ViewPost)? { Name:1, Date:1, Length:1, Description:1, InfoElevation:1, Image:1, StartPoint:1, Public:1, Group:1, Color:1} : { Name:1, Group:1, Length:1, Public:1} 

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

function AddPostPromise(Track, User){
    return new Promise(async(resolve) => {
        let ReponseAddTracks = {Error: true, ErrorMsg:"InitError", Data:null}

        // Convert GPX to GeoJson
        //let GeoJson = ConvertGpxToGeoJson(Track.FileContent)
        let GeoJson = Track.GeoJson

        // Si on a un GeoJson avec plusieurs line pour une track on le modifie
        if ((Track.MultiToOneLine) && (GeoJson.features[0].geometry.type == "MultiLineString")){
            // Changer le type en LineString
            GeoJson.features[0].geometry.type = "LineString"
            // Fusionner les coodronnee
            const listofcoordonate = GeoJson.features[0].geometry.coordinates
            let NewListofcoordonate = []
            listofcoordonate.forEach(OneListe => {
                OneListe.forEach(element => {
                    NewListofcoordonate.push(element)
                });
            });
            GeoJson.features[0].geometry.coordinates = NewListofcoordonate
        }

        // Create track data
        let TrackData = new Object()
        TrackData.Name = Track.Name
        TrackData.Group = Track.Group
        TrackData.Color = (Track.Color) ? Track.Color : "#0000FF"
        TrackData.Date = new Date()
        TrackData.Owner = User
        TrackData.Description = Track.Description
        TrackData.GeoJsonData = GeoJson
        TrackData.GpxData = Track.FileContent
        TrackData.Public = Track.Public
        TrackData.Image = Track.Image

        // Calculate exterior point
        let ReponseMinMaxGeoJsonTrack = MinMaxGeoJsonTrack(GeoJson)
        if (ReponseMinMaxGeoJsonTrack.IsError){
            ReponseAddTracks.Error = true
            ReponseAddTracks.ErrorMsg = "MinMaxGeoJsonTrack :" + ReponseMinMaxGeoJsonTrack.ErrorMsg
            ReponseAddTracks.Data = null
            return resolve(ReponseAddTracks)
        }
        TrackData.ExteriorPoint = ReponseMinMaxGeoJsonTrack.Data
        
        // Calculate track lenght
        TrackData.Length = CalculateTrackLength(GeoJson)

        // Calcul du center point
        let CenterPoint = new Object()
        CenterPoint.Lat = (TrackData.ExteriorPoint.MinLat + TrackData.ExteriorPoint.MaxLat)/2
        CenterPoint.Long = (TrackData.ExteriorPoint.MinLong + TrackData.ExteriorPoint.MaxLong)/2
        TrackData.Center = CenterPoint
        
        // Add Start Point
        let beg = null
        if (TrackData.GeoJsonData.features[0].geometry.type == "LineString"){
            beg = TrackData.GeoJsonData.features[0].geometry.coordinates[0];
        } else {
            if (TrackData.GeoJsonData.features[0].geometry.coordinates[0][0]){
                beg = TrackData.GeoJsonData.features[0].geometry.coordinates[0][0];
            }
        }
        let latleng = new Object()
        if (beg != null){
            latleng.Lat = beg[1]
            latleng.Lng = beg[0]
        }
        TrackData.StartPoint = latleng

        let ReponseElevation = await GetElevationOfGeoJson(GeoJson)
        if(ReponseElevation.Error){
            ReponseAddTracks.Error = true
            ReponseAddTracks.ErrorMsg = "GetElevationOfGeoJson error : " + ReponseElevation.ErrorMsg
            ReponseAddTracks.Data = null
            return resolve(ReponseAddTracks)
        }

        TrackData.Elevation = ReponseElevation.Data.AllElevation
        TrackData.InfoElevation = ReponseElevation.Data.InfoElevation

        // Si il faut inserer une nouvelle track en DB
        if (Track.Id != null){
            // Update de la track existante
            let DataToDb = new Object()
            DataToDb.ExteriorPoint= TrackData.ExteriorPoint
            DataToDb.GeoJsonData= TrackData.GeoJsonData
            DataToDb.GpxData= TrackData.GpxData
            DataToDb.Length= TrackData.Length
            DataToDb.Center= TrackData.Center
            DataToDb.StartPoint= TrackData.StartPoint
            DataToDb.Elevation= TrackData.Elevation
            DataToDb.InfoElevation= TrackData.InfoElevation
            DataToDb.Description= TrackData.Description
            DataToDb.Image= TrackData.Image

            ModelTracks.findByIdAndUpdate(Track.Id, DataToDb, (err, result) => {
                if (err) {
                    ReponseAddTracks.Error = true
                    ReponseAddTracks.ErrorMsg = "AddPostPromise update in db error: " + err
                    ReponseAddTracks.Data = null
                } else {
                    ReponseAddTracks.Error = false
                    ReponseAddTracks.ErrorMsg = null
                    ReponseAddTracks.Data = "ok"
                }
                resolve(ReponseAddTracks)
            })
        } else {
            // Insert new track
            const NewTrack = new ModelTracks(TrackData)
            NewTrack.save((err, result) => {
                if (err) {
                    ReponseAddTracks.Error = true
                    ReponseAddTracks.ErrorMsg = "AddPostPromise error: " + err
                    ReponseAddTracks.Data = null
                    
                } else {
                    ReponseAddTracks.Error = false
                    ReponseAddTracks.ErrorMsg = null
                    ReponseAddTracks.Data = "ok"
                }
                resolve(ReponseAddTracks)
            })
        }
    })
}

module.exports.GetPostOfPage = GetPostOfPage
module.exports.GetMarkerOfPage = GetMarkerOfPage
module.exports.AddPostPromise = AddPostPromise