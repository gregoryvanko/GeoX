async function CallGetInitialData(MyApp, Socket, User, UserId){
    let Data = {UserGroup: null, InitialTracks:null, InitialMapData: null}
    // Get all groups of user
    let Shared = require("./Shared")
    let ReponseUserGroup = await Shared.PromiseGetUserGroup(MyApp, User)
    if(!ReponseUserGroup.Error){
        Data.UserGroup = ReponseUserGroup.Data

        // Si le user possède au moins un group
        if (Data.UserGroup.length > 0){
            // Get All track of first group
            let ReponseTracksOfGroup = await Shared.PromiseGetTracksData(MyApp, Data.UserGroup[0], User)
            if(!ReponseTracksOfGroup.Error){
                Data.InitialTracks = ReponseTracksOfGroup.Data
                Data.InitialMapData = {CenterPoint:{Lat:50.709446, Long:4.543413}, Zoom:8}
                let MinMax = Shared.MinMaxOfTracks(Data.InitialTracks)
                Data.InitialMapData.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
                Data.InitialMapData.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
                Data.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
            } else {
                MyApp.LogAppliError(ReponseTracksOfGroup.ErrorMsg, User, UserId)
                Socket.emit("GeoXError", "CallGetInitialData GetGroupTrack error: " + ReponseTracksOfGroup.ErrorMsg)
            }
        }

        // Find all different group
        // if (Data.UserGroup.length > 0){
        //     Data.UserGroup= [...new Set(Data.UserGroup.map(item => item.Group))] 
        // } else {
        //     Data.AppGroup=[]
        // }

        // Build Tracks Data
        // Data.AppInitMapData = new Object()
        // Data.AppInitMapData.ListOfTracks = []
        // Data.AppInitMapData.CenterPoint = {Lat:50.709446, Long:4.543413}
        // Data.AppInitMapData.Zoom = 8
        // Data.AppInitMapData.FitBounds = null
        
        // Find all track data of the first group
        // if (Data.AppGroup.length > 0){
        //     // Get Tracks
        //     let Shared = require("./Shared")
        //     let ReponseListOfTracks = await Shared.PromiseGetTracksData(MyApp, Data.AppGroup[0], User)
        //     if(!ReponseListOfTracks.Error){
        //         Data.AppInitMapData.ListOfTracks = ReponseListOfTracks.Data
        //     } else {
        //         MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
        //         Socket.emit("GeoXError", ReponseListOfTracks.ErrorMsg)
        //     }
        //     // Calcul des point extérieur et du centre de toutes les tracks
        //     if (Data.AppInitMapData.ListOfTracks.length != 0){
        //         let MinMax = Shared.MinMaxOfTracks(Data.AppInitMapData.ListOfTracks)
        //         Data.AppInitMapData.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
        //         Data.AppInitMapData.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
        //         Data.AppInitMapData.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
        //     }
        // } 
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetInitialData"
        MyReponse.Data = Data
        Socket.emit("GeoX", MyReponse)
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send Initial Data`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseUserGroup.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallGetInitialData GetAllGroup error: " + ReponseUserGroup.ErrorMsg)
    }
}

async function CallGetTracksOfGroup(Group, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseTracksOfGroup = await Shared.PromiseGetTracksData(MyApp, Group, User)
    if(!ReponseTracksOfGroup.Error){
        let MyReponse = new Object()
        MyReponse.Action = "SetTracksOfGroup"
        MyReponse.Data = ReponseTracksOfGroup.Data
        Socket.emit("GeoX", MyReponse)
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send Tracks of group`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseTracksOfGroup.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallGetTracksOfGroup error: " + ReponseTracksOfGroup.ErrorMsg)
    }
}

async function CallUpdateTrack(Track, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseUpdateTrack = await Shared.PromiseUpdateTrack(Track, MyApp)
    if(ReponseUpdateTrack.Error){
        MyApp.LogAppliError(ReponseUpdateTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUpdateTrack.ErrorMsg)
    }
}

async function CallGetMarkers(MyApp, Socket, User, UserId){
    let ReponseAllTracksInfo = await PromiseGetAllMarkers(MyApp, User)
    if(!ReponseAllTracksInfo.Error){
        // Delete identical tracks
        let UniqueMarkers = ReponseAllTracksInfo.Data.filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t.StartPoint) === JSON.stringify(v.StartPoint)))===i)
        // Send Reponse
        let reponse = new Object()
        reponse.Action = "SetAllMarkers"
        reponse.Data = UniqueMarkers
        Socket.emit("GeoX", reponse)
    } else {
        MyApp.LogAppliError("CallGetMarkers PromiseGetAllMarkers error: " + ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallGetMarkers PromiseGetAllMarkers error")
    }
}

function PromiseGetAllMarkers(MyApp, User){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:[]}

        let Querry = {$and:[{[MongoTracksCollection.Public]: true}, {[MongoTracksCollection.Owner]: { $ne: User }}]}
        const Projection = { projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.StartPoint]: 1, [MongoTracksCollection.Date]: 1}}
        Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
                ReponseTracks.Error = false
                ReponseTracks.ErrorMsg = null
            if(reponse.length == 0){
                ReponseTracks.Data = []
            } else {
                reponse.forEach(element => {
                    element.Group = "GeoX"
                    ReponseTracks.Data.push(element)
                });
            }
            resolve(ReponseTracks)
        },(erreur)=>{
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = "CallGetMarkers PromiseGetAllMarkers error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}

function CallGetTrack(Data, MyApp, Socket, User, UserId){
    let MongoObjectId = require('@gregvanko/corex').MongoObjectId
    let MongoR = require('@gregvanko/corex').Mongo
    Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    MongoTracksCollection = MongoConfig.TracksCollection
    // Query Mongodb
    const Querry = {'_id': new MongoObjectId(Data.TrackId)}
    const Projection = { projection:{[MongoTracksCollection.GpxData]: 0, [MongoTracksCollection.Color]: 0, [MongoTracksCollection.Group]: 0, [MongoTracksCollection.Date]: 0, [MongoTracksCollection.Owner]: 0, [MongoTracksCollection.Public]: 0}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
        if(reponse.length == 1){
            // Send Reponse
            let Clientreponse = new Object()
            Clientreponse.Action = "SetTrack"
            Clientreponse.Data = reponse[0]
            Clientreponse.WithBound = Data.WithBound
            Socket.emit("GeoX", Clientreponse)
        } else {
            MyApp.LogAppliError("CallGetTrack error: Track not found", User, UserId)
            Socket.emit("GeoXError", "CallGetTrack error: Track not found")
        }
    },(erreur)=>{
        MyApp.LogAppliError("CallGetTrack error: " + erreur, User, UserId)
        Socket.emit("GeoXError", "CallGetTrack error: " + erreur)
    })
}

module.exports.CallGetInitialData = CallGetInitialData
module.exports.CallGetTracksOfGroup = CallGetTracksOfGroup
module.exports.CallUpdateTrack = CallUpdateTrack
module.exports.CallGetMarkers = CallGetMarkers
module.exports.CallGetTrack = CallGetTrack