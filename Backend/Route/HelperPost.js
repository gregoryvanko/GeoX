const LogError = require("@gregvanko/nanox").NanoXLogError
const ModelTracks = require("../MongooseModel/Model_Tracks")

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
        //TrackData.GeoJsonData = GeoJson
        TrackData.GeoJsonData = Track.GeoJson
        TrackData.GpxData = Track.FileContent
        TrackData.Public = Track.Public
        TrackData.Image = Track.Image

        // Calculate exterior point
        let ReponseMinMaxGeoJsonTrack = MinMaxGeoJsonTrack(GeoJson)
        if (ReponseMinMaxGeoJsonTrack.IsError){
            ReponseAddTracks.Error = true
            ReponseAddTracks.ErrorMsg = "MinMaxGeoJsonTrack :" + ReponseMinMaxGeoJsonTrack.ErrorMsg
            ReponseAddTracks.Data = null
            resolve(ReponseAddTracks)
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

        // Add elevation
        const ElevationData = await GetElevationOfGeoJson(GeoJson)
        TrackData.Elevation = ElevationData.AllElevation
        TrackData.InfoElevation = ElevationData.InfoElevation
        
        // Si il faut inserer une nouvelle track en DB
        if (Track.Id != null){
            // Update de la track existante
            let DataToDb = new Object()
            DataToDb[MongoTracksCollection.ExteriorPoint]= TrackData.ExteriorPoint
            DataToDb[MongoTracksCollection.GeoJsonData]= TrackData.GeoJsonData
            DataToDb[MongoTracksCollection.GpxData]= TrackData.GpxData
            DataToDb[MongoTracksCollection.Length]= TrackData.Length
            DataToDb[MongoTracksCollection.Center]= TrackData.Center
            DataToDb[MongoTracksCollection.StartPoint]= TrackData.StartPoint
            DataToDb[MongoTracksCollection.Elevation]= TrackData.Elevation
            DataToDb[MongoTracksCollection.InfoElevation]= TrackData.InfoElevation
            DataToDb[MongoTracksCollection.Description]= TrackData.Description
            DataToDb[MongoTracksCollection.Image]= TrackData.Image
            
            Mongo.UpdateByIdPromise(Track.Id, DataToDb, MongoTracksCollection.Collection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    ReponseAddTracks.Error = true
                    ReponseAddTracks.ErrorMsg = "GeoXServerApi PromiseAddTrack Track Id not found: "
                    ReponseAddTracks.Data = []
                } else {
                    ReponseAddTracks.Error = false
                    ReponseAddTracks.ErrorMsg = ""
                    ReponseAddTracks.Data = []
                }
                resolve(ReponseAddTracks)
            },(erreur)=>{
                ReponseAddTracks.Error = true
                ReponseAddTracks.ErrorMsg = "GeoXServerApi PromiseAddTrack error: " + erreur
                ReponseAddTracks.Data = []
                resolve(ReponseAddTracks)
            })
        } else {
            // Insert new track
            Mongo.InsertOnePromise(TrackData, MongoTracksCollection.Collection).then((reponseCreation)=>{
                ReponseAddTracks.Error = false
                ReponseAddTracks.ErrorMsg = ""
                ReponseAddTracks.Data = null
                resolve(ReponseAddTracks)
            },(erreur)=>{
                ReponseAddTracks.Error = true
                ReponseAddTracks.ErrorMsg = "PromiseAddTrack error: " + erreur
                ReponseAddTracks.Data = null
                resolve(ReponseAddTracks)
            })
        }
    })
}

/**
 * Calcul les lat et long min et max d'une track contenue dans un object GeoJson
 * @param {geojson object} geojson Object GeaoJson d'une track
 */
 function MinMaxGeoJsonTrack(geojson){
    let reponse = new Object()
    reponse.IsError = false
    reponse.ErrorMsg = "no error"
    reponse.Data = null
    const listofcoordonate = geojson.features[0].geometry.coordinates
    const LineType = geojson.features[0].geometry.type
    let MinLat1 = null
    let MaxLat1 = null
    let MinLong1 = null
    let MaxLong1 = null
    if (LineType == "LineString"){
        listofcoordonate.forEach(element => {
            if(MinLat1 == null){
                MinLat1 = element[0]
            } else {
                if(element[0] < MinLat1){MinLat1 = element[0]}
            }
            if(MaxLat1 == null){
                MaxLat1 = element[0]
            } else {
                if(element[0] > MaxLat1){MaxLat1 = element[0]}
            }
            if(MinLong1 == null){
                MinLong1 = element[1]
            } else {
                if(element[1] < MinLong1){MinLong1 = element[1]}
            }
            if(MaxLong1 == null){
                MaxLong1 = element[1]
            } else {
                if(element[1] > MaxLong1){MaxLong1 = element[1]}
            }
        });
    } else if (LineType == "MultiLineString"){
        listofcoordonate.forEach(OneListe => {
            OneListe.forEach(element => {
                if(MinLat1 == null){
                    MinLat1 = element[0]
                } else {
                    if(element[0] < MinLat1){MinLat1 = element[0]}
                }
                if(MaxLat1 == null){
                    MaxLat1 = element[0]
                } else {
                    if(element[0] > MaxLat1){MaxLat1 = element[0]}
                }
                if(MinLong1 == null){
                    MinLong1 = element[1]
                } else {
                    if(element[1] < MinLong1){MinLong1 = element[1]}
                }
                if(MaxLong1 == null){
                    MaxLong1 = element[1]
                } else {
                    if(element[1] > MaxLong1){MaxLong1 = element[1]}
                }
            });
        });
    } else {
        reponse.IsError = true
        reponse.ErrorMsg = "LineType not know in GeoJson file"
    }
    reponse.Data = {MinLat:MinLat1, MaxLat:MaxLat1, MinLong:MinLong1, MaxLong:MaxLong1}
    return reponse
}

function CalculateTrackLength(GeoJson){
    let distance = 0
    let Coord = GeoJson.features[0].geometry.coordinates
    const { getDistance } = require("geolib")
    for (let i = 1; i < Coord.length; i++){
        const [prelng, prelat] = Coord[i - 1]
        const [lng, lat] = Coord[i]
        // Get distance from first point
        let DistBetweenTwoPoint = getDistance(
            { latitude: prelat, longitude: prelng },
            { latitude: lat, longitude: lng }
        )
        distance += DistBetweenTwoPoint
    }
    return distance/1000
}

async function GetElevationOfGeoJson(GeoJson){
    let Coord = GeoJson.features[0].geometry.coordinates
    let ElevationMin = 0
    let ElevationMax = 0
    let ElevationCumulP = 0
    let ElevationCumulM = 0
    let ElevationPrevious = 0

    let AllElevation = []
    let distance = 0
    let IntermediereDist = 0
    const MinDistBetweenTwoPoint = 50
    const [lng, lat] = Coord[0]
    let ele = await PromiseGetElevation({ lat, lng })
    ele = parseInt(ele)
    AllElevation.push({ x: distance, y: ele, coord:{lat:lat, long: lng}})

    ElevationMin = ele
    ElevationMax = ele
    ElevationCumulP = 0
    ElevationCumulM = 0
    ElevationPrevious = ele
    
    
    const { getDistance } = require("geolib")
    for (let i = 1; i < Coord.length; i++){
        const [prelng, prelat] = Coord[i - 1]
        const [lng, lat] = Coord[i]
        // Get distance from first point
        let DistBetweenTwoPoint = getDistance(
            { latitude: prelat, longitude: prelng },
            { latitude: lat, longitude: lng }
        )
        distance += DistBetweenTwoPoint
        IntermediereDist += DistBetweenTwoPoint

        if ((IntermediereDist > MinDistBetweenTwoPoint) || (i == Coord.length -1)){
            IntermediereDist = 0
            // Get elevation
            let eleP = await PromiseGetElevation({lat, lng})
            eleP = parseInt(eleP)
            // Add Elevation point
            AllElevation.push({ x: distance, y: eleP, coord:{lat:lat, long: lng}})
            // Get ElevationMin
            if (eleP < ElevationMin){
                ElevationMin = eleP
            }
            // Get ElevationMax
            if (eleP > ElevationMax){
                ElevationMax = eleP
            }
            // Get ElevationCumulP ElevationCumulM
            const Delta = eleP - ElevationPrevious
            if ((Delta)>0){
                ElevationCumulP += Delta
            } else {
                ElevationCumulM += Delta
            }
            ElevationPrevious = eleP
        }
    }
    return {AllElevation: AllElevation, InfoElevation: {ElevMax:ElevationMax, ElevMin:ElevationMin, ElevCumulP:ElevationCumulP, ElevCumulM:Math.abs(ElevationCumulM)}}
}

/**
 * Get Elevation of a point
 */
 function PromiseGetElevation({ lat, lng }){
    return new Promise ((resolve, reject) => {
        const path = require('path')
        let fs = require('fs')
        var dir = path.resolve(__dirname, "TempHgt")
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            console.log("create")
        }
        const { TileSet } = require("node-hgt")
        const tileset = new TileSet(path.resolve(__dirname, "TempHgt"))
        tileset.getElevation([lat, lng], (err, ele) => {
            if (!err){
                resolve(ele.toFixed(0))
            } else {
                console.log(err)
                reject(err)
            }
        })
    })
}


/**
 * Convertir un fichier GPX en GeoJson
 * @param {String} FilePathandName path et name du fichier Gpx
 */
// function ConvertGpxToGeoJson(FileContent){
//     var tj = require('@mapbox/togeojson')
//     var DOMParser = require('xmldom').DOMParser
//     var Mygpx = new DOMParser().parseFromString(FileContent)
//     var converted = tj.gpx(Mygpx)
//     return converted
// }

module.exports.GetPostOfPage = GetPostOfPage
module.exports.GetMarkerOfPage = GetMarkerOfPage
module.exports.AddPostPromise = AddPostPromise