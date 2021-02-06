async function CallGetUserData(MyApp, Socket, User, UserId){
    let Data = {AppData: null, AppGroup: null, AppInitMapData: null}
    // Get all tracks info (but no track data)
    let ReponseAllTracksInfo = await PromiseGetAllTracksInfo(MyApp, User)
    if(!ReponseAllTracksInfo.Error){
        Data.AppData = ReponseAllTracksInfo.Data

        // Find all different group
        if (Data.AppData.length > 0){
            Data.AppGroup= [...new Set(Data.AppData.map(item => item.Group))] 
        } else {
            Data.AppGroup=[]
        }

        // Build Tracks Data
        Data.AppInitMapData = new Object()
        Data.AppInitMapData.ListOfTracks = []
        Data.AppInitMapData.CenterPoint = {Lat:50.709446, Long:4.543413}
        Data.AppInitMapData.Zoom = 8
        Data.AppInitMapData.FitBounds = null
        
        // Find all track data of the first group
        if (Data.AppGroup.length > 0){
            // Get Tracks
            let ReponseListOfTracks = await PromiseGetTracksData(MyApp, Data.AppGroup[0], User)
            if(!ReponseListOfTracks.Error){
                Data.AppInitMapData.ListOfTracks = ReponseListOfTracks.Data
            } else {
                MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
                Socket.emit("GeoXError", "GeoXServerApi PromiseGetTracksData error")
            }
            // Calcul des point extérieur et du centre de toutes les tracks
            if (Data.AppInitMapData.ListOfTracks.length != 0){
                let MinMax = MinMaxOfTracks(Data.AppInitMapData.ListOfTracks)
                Data.AppInitMapData.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
                Data.AppInitMapData.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
                Data.AppInitMapData.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
            }
        } 
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetUserData"
        MyReponse.Data = Data
        Socket.emit("ShowTracksOnMap", MyReponse)
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send User Data`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "GeoXServerApi CallGetUserData error: " + ReponseAllTracksInfo.ErrorMsg)
    }
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
 * Calcul le lat et long min et max de toutes les tracks
 * @param {Array} ListOfTracks liste de toutes les tracks
 */
function MinMaxOfTracks(ListOfTracks){
    let reponse = new Object()
    reponse.MinLat = null
    reponse.MaxLat = null
    reponse.MinLong = null
    reponse.MaxLong = null
    ListOfTracks.forEach(element => {
        if(reponse.MinLat == null){
            reponse.MinLat = element.ExteriorPoint.MinLat
        } else {
            if(element.ExteriorPoint.MinLat < reponse.MinLat){reponse.MinLat = element.ExteriorPoint.MinLat}
        }
        if(reponse.MaxLat == null){
            reponse.MaxLat = element.ExteriorPoint.MaxLat
        } else {
            if(element.ExteriorPoint.MaxLat > reponse.MaxLat){reponse.MaxLat = element.ExteriorPoint.MaxLat}
        }
        if(reponse.MinLong == null){
            reponse.MinLong = element.ExteriorPoint.MinLong
        } else {
            if(element.ExteriorPoint.MinLong < reponse.MinLong){reponse.MinLong = element.ExteriorPoint.MinLong}
        }
        if(reponse.MaxLong == null){
            reponse.MaxLong = element.ExteriorPoint.MaxLong
        } else {
            if(element.ExteriorPoint.MaxLong > reponse.MaxLong){reponse.MaxLong = element.ExteriorPoint.MaxLong}
        }
    });
    return reponse
}

async function CallGetMapData(GroupName, MyApp, Socket, User, UserId){
    // Build Tracks Data
    let Data = new Object()
    Data.ListOfTracks = []
    Data.CenterPoint = {Lat:50.709446, Long:4.543413}
    Data.Zoom = 8
    // Get Tracks
    let ReponseListOfTracks = await PromiseGetTracksData(MyApp, GroupName, User)
    if(!ReponseListOfTracks.Error){
        Data.ListOfTracks = ReponseListOfTracks.Data
        // Calcul des point extérieur et du centre de toutes les tracks
        if (Data.ListOfTracks.length != 0){
            let MinMax = MinMaxOfTracks(Data.ListOfTracks)
            Data.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
            Data.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
            Data.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
        }
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetMapData"
        MyReponse.Data = Data
        Socket.emit("ShowTracksOnMap", MyReponse)
        // Log socket action
        MyApp.LogAppliInfo("SoApi send Map Data", User, UserId)
    } else {
        MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseListOfTracks.ErrorMsg)
    }
}

async function CallUpdateTrack(Track, MyApp, Socket, User, UserId){
    let ManageTrack = require("./ManageTrack")
    let ReponseUpdateTrack = await ManageTrack.PromiseUpdateTrack(Track, MyApp)
    if(ReponseUpdateTrack.Error){
        MyApp.LogAppliError(ReponseUpdateTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUpdateTrack.ErrorMsg)
    } else {
        MyApp.LogAppliError(ReponseUpdateTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUpdateTrack.ErrorMsg)
    }
}

module.exports.CallGetUserData = CallGetUserData
module.exports.PromiseGetTracksData = PromiseGetTracksData
module.exports.CallGetMapData = CallGetMapData
module.exports.CallUpdateTrack = CallUpdateTrack