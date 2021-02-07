function PromiseAddTrack(Track, MyApp, User){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseAddTracks = {Error: true, ErrorMsg:"InitError", Data:null}

        let GeoJson = ConvertGpxToGeoJson(Track.FileContent)
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
        let TrackData = new Object()
        TrackData.Name = Track.Name
        TrackData.Group = Track.Group
        TrackData.Color = "#0000FF"
        TrackData.Date = new Date()
        TrackData.Owner = User
        let ReponseMinMaxGeoJsonTrack = MinMaxGeoJsonTrack(GeoJson)
        if (ReponseMinMaxGeoJsonTrack.IsError){
            ReponseAddTracks.Error = true
            ReponseAddTracks.ErrorMsg = "MinMaxGeoJsonTrack :" + ReponseMinMaxGeoJsonTrack.ErrorMsg
            ReponseAddTracks.Data = null
            resolve(ReponseAddTracks)
        } else {
            TrackData.ExteriorPoint = ReponseMinMaxGeoJsonTrack.Data
            TrackData.GeoJsonData = GeoJson
            TrackData.GpxData = Track.FileContent
            TrackData.Length = CalculateTrackLength(GeoJson)
            // Calcul du center point
            let CenterPoint = new Object()
            CenterPoint.Lat = (TrackData.ExteriorPoint.MinLat + TrackData.ExteriorPoint.MaxLat)/2
            CenterPoint.Long = (TrackData.ExteriorPoint.MinLong + TrackData.ExteriorPoint.MaxLong)/2
            TrackData.Center = CenterPoint
            TrackData.Public = Track.Public
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
 * Convertir un fichier GPX en GeoJson
 * @param {String} FilePathandName path et name du fichier Gpx
 */
function ConvertGpxToGeoJson(FileContent){
    var tj = require('@mapbox/togeojson')
    var DOMParser = require('xmldom').DOMParser
    var Mygpx = new DOMParser().parseFromString(FileContent)
    var converted = tj.gpx(Mygpx)
    return converted
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

/**
 * Calcule la longeur en Km d'une track
 * @param {GeoJson} GeoJson GeoJson object de la track
 */
function CalculateTrackLength(GeoJson){
    var Turf = require('@turf/length').default
    let distance = Math.round((Turf(GeoJson) + Number.EPSILON) * 1000) / 1000
    return distance
}

function PromiseGetUserGroup(MyApp, User){
    return new Promise(resolve => {
        let ReponseUserGroup = {Error: true, ErrorMsg:"InitError", Data:null}

        let MongoObjectId = require('@gregvanko/corex').MongoObjectId
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection
        // Querry
        const Querry = {[MongoTracksCollection.Owner]: User}
        const Projection = { projection:{[MongoTracksCollection.Group]: 1}}
        const Sort = {[MongoTracksCollection.Date]: -1}
        Mongo.FindSortPromise(Querry, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
            let DataToSend = []
            // Find all different group
            if (reponse.length > 0){
                DataToSend = [...new Set(reponse.map(item => item.Group))] 
            }
            ReponseUserGroup.Error = false
            ReponseUserGroup.ErrorMsg = null
            ReponseUserGroup.Data = DataToSend
            resolve(ReponseUserGroup)
        },(erreur)=>{
            ReponseUserGroup.Error = true
            ReponseUserGroup.ErrorMsg = "PromiseGetAllMarkers error: " + erreur
            ReponseUserGroup.Data = []
            resolve(ReponseUserGroup)
        })
    })
}

function PromiseUpdateTrack(Track, MyApp){
    return new Promise(resolve => {
        let ReponseUpdateTrack = {Error: true, ErrorMsg:"InitError", Data:null}

        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection
    
        let DataToDb = new Object()
        if(Track.Name){DataToDb[MongoTracksCollection.Name]= Track.Name}
        if(Track.Group){DataToDb[MongoTracksCollection.Group]= Track.Group}
        if(Track.Public != undefined){DataToDb[MongoTracksCollection.Public]= Track.Public}
        if (Track.Color){DataToDb[MongoTracksCollection.Color]= Track.Color}
        
        Mongo.UpdateByIdPromise(Track.Id, DataToDb, MongoTracksCollection.Collection).then((reponse)=>{
            if (reponse.matchedCount == 0){
                ReponseUpdateTrack.Error = true
                ReponseUpdateTrack.ErrorMsg = "GeoXServerApi PromiseUpdateTrack Track Id not found: "
                ReponseUpdateTrack.Data = []
            } else {
                ReponseUpdateTrack.Error = false
                ReponseUpdateTrack.ErrorMsg = ""
                ReponseUpdateTrack.Data = []
            }
            resolve(ReponseUpdateTrack)
        },(erreur)=>{
            ReponseUpdateTrack.Error = true
            ReponseUpdateTrack.ErrorMsg = "GeoXServerApi PromiseUpdateTrack error: " + erreur
            ReponseUpdateTrack.Data = []
            resolve(ReponseUpdateTrack)
        })
    })
}

/**
 * Get Tracks Data from DB (promise)
 */
function PromiseGetTracksData(MyApp, GroupName, User){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = new Object()
        ReponseTracks.Error = true
        ReponseTracks.ErrorMsg = ""
        ReponseTracks.Data = null
        const Querry = {$and: [{[MongoTracksCollection.Group]: GroupName},{[MongoTracksCollection.Owner]: User}]}
        const Projection = { projection:{[MongoTracksCollection.GpxData]: 0}}
        const Sort = {[MongoTracksCollection.Date]: -1}
        Mongo.FindSortPromise(Querry, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                ReponseTracks.Error = false
                ReponseTracks.ErrorMsg = null
                ReponseTracks.Data = []
            } else {
                ReponseTracks.Error = false
                ReponseTracks.ErrorMsg = null
                ReponseTracks.Data = reponse
            }
            resolve(ReponseTracks)
        },(erreur)=>{
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetTracksData error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}

/**
 * Get Tracks info from DB for one User (promise)
 */
function PromiseGetAllTracksInfo(MyApp, User){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:null}

        const Querry = {[MongoTracksCollection.Owner]: User}
        const Projection = { projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Group]: 1, [MongoTracksCollection.Color]: 1, [MongoTracksCollection.Date]: 1, [MongoTracksCollection.ExteriorPoint]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.Center]: 1, [MongoTracksCollection.Public]: 1}}
        const Sort = {[MongoTracksCollection.Date]: -1}
        Mongo.FindSortPromise(Querry, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                ReponseTracks.Error = false
                ReponseTracks.ErrorMsg = null
                ReponseTracks.Data = []
            } else {
                ReponseTracks.Error = false
                ReponseTracks.ErrorMsg = null
                ReponseTracks.Data = reponse
            }
            resolve(ReponseTracks)
        },(erreur)=>{
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetAllTracksInfo error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}

module.exports.PromiseAddTrack = PromiseAddTrack
module.exports.PromiseGetUserGroup = PromiseGetUserGroup
module.exports.PromiseUpdateTrack = PromiseUpdateTrack
module.exports.PromiseGetTracksData = PromiseGetTracksData
module.exports.PromiseGetAllTracksInfo = PromiseGetAllTracksInfo