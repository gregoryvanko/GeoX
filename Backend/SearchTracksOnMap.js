async function CallGetUserGroup(MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseUserGroup = await Shared.PromiseGetUserGroup(MyApp, User)
    if(!ReponseUserGroup.Error){
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetUserGroup"
        MyReponse.Data = ReponseUserGroup.Data
        Socket.emit("SearchTracksOnMap", MyReponse)
    } else {
        MyApp.LogAppliError(ReponseUserGroup.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUserGroup.ErrorMsg)
    }
}

async function CallGetMarkers(Filter, MyApp, Socket, User, UserId){
    let ReponseAllTracksInfo = await PromiseGetAllMarkers(Filter, MyApp, User)
    if(!ReponseAllTracksInfo.Error){
        // Delete identical tracks
        let UniqueMarkers = ReponseAllTracksInfo.Data.filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t.StartPoint) === JSON.stringify(v.StartPoint)))===i)
        // Sort By Distance
        UniqueMarkers.sort((a,b)=>{
            if (a.Length <= b.Length) return -1;
            if (a.Length > b.Length) return 1;
        })
        // Send Reponse
        let reponse = new Object()
        reponse.Action = "SetAllMarkers"
        reponse.Data = UniqueMarkers
        Socket.emit("SearchTracksOnMap", reponse)
    } else {
        MyApp.LogAppliError("CallGetMarkers PromiseGetAllMarkers error: " + ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallGetMarkers PromiseGetAllMarkers error")
    }
}

function PromiseGetAllMarkers(Filter, MyApp, User){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:null}

        let Querry = {[MongoTracksCollection.Public]: true}
        if (Filter != null){
            if (Filter.HideMyTrack){
                Querry = {$and:[{[MongoTracksCollection.Public]: true}, {[MongoTracksCollection.Owner]: { $ne: User }}, {[MongoTracksCollection.Length]: { $gte: parseInt(Filter.MinKm) }}, {[MongoTracksCollection.Length]: { $lte: parseInt(Filter.MaxKm) }}]}
            } else {
                Querry = {$and:[{[MongoTracksCollection.Public]: true}, {[MongoTracksCollection.Length]: { $gte: parseInt(Filter.MinKm) }}, {[MongoTracksCollection.Length]: { $lte: parseInt(Filter.MaxKm) }}]}
            }
        }
        const Projection = { projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.StartPoint]: 1}}
        Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
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
            ReponseTracks.ErrorMsg = "CallGetMarkers PromiseGetAllMarkers error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}

async function CallSaveTrack(TrackId, Name, Group, Public, MyApp, Socket, User, UserId){
    let ReponseSaveTrack = await PromiseSaveTrack(TrackId, Name, Group, Public, MyApp, User)
    if (ReponseSaveTrack.Error) {
        MyApp.LogAppliError("CallSaveTrack error: " + ReponseSaveTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallSaveTrack error: " + ReponseSaveTrack.ErrorMsg)
    } else {
        MyApp.LogAppliInfo("New track saved from an existing track", User, UserId)
    }
}

function PromiseSaveTrack(TrackId, Name, Group, Public, MyApp, User){
    return new Promise (resolve =>{``
        let MongoObjectId = require('@gregvanko/corex').MongoObjectId
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseSaveTrack = {Error: true, ErrorMsg:"InitError"}

        // Query Mongodb
        const Querry = {'_id': new MongoObjectId(TrackId)}
        const Projection = {}
        Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 1){
                let TrackData = new Object()
                TrackData.Name = Name
                TrackData.Group = Group
                TrackData.Color = "#0000FF"
                TrackData.Date = new Date()
                TrackData.Owner = User
                TrackData.ExteriorPoint = reponse[0].ExteriorPoint
                TrackData.GeoJsonData = reponse[0].GeoJsonData
                TrackData.GpxData = reponse[0].GpxData
                TrackData.Length = reponse[0].Length
                TrackData.Center = reponse[0].Center
                TrackData.Public = Public
                TrackData.StartPoint = reponse[0].StartPoint
                Mongo.InsertOnePromise(TrackData, MongoTracksCollection.Collection).then((reponseCreation)=>{
                    ReponseSaveTrack.Error = false
                    resolve(ReponseSaveTrack)
                },(erreur)=>{
                    ReponseSaveTrack.Error = true
                    ReponseSaveTrack.ErrorMsg = erreur
                    resolve(ReponseSaveTrack)
                })
            } else {
                ReponseSaveTrack.Error = true
                ReponseSaveTrack.ErrorMsg = "Track id not found"
                resolve(ReponseSaveTrack)
            }
        },(erreur)=>{
            ReponseSaveTrack.Error = true
            ReponseSaveTrack.ErrorMsg = erreur
            resolve(ReponseSaveTrack)
        })
    })
}

function CallGetTrack(TrackId, MyApp, Socket, User, UserId){
    let MongoObjectId = require('@gregvanko/corex').MongoObjectId
    let MongoR = require('@gregvanko/corex').Mongo
    Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    MongoTracksCollection = MongoConfig.TracksCollection
    // Query Mongodb
    const Querry = {'_id': new MongoObjectId(TrackId)}
    const Projection = { projection:{[MongoTracksCollection.GpxData]: 0, [MongoTracksCollection.Color]: 0, [MongoTracksCollection.Group]: 0, [MongoTracksCollection.Date]: 0, [MongoTracksCollection.Owner]: 0, [MongoTracksCollection.Public]: 0}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
        if(reponse.length == 1){
            // Send Reponse
            let Clientreponse = new Object()
            Clientreponse.Action = "SetTrack"
            Clientreponse.Data = reponse[0]
            Socket.emit("SearchTracksOnMap", Clientreponse)
        } else {
            MyApp.LogAppliError("CallGetTrack error: Track not found", User, UserId)
            Socket.emit("GeoXError", "CallGetTrack error: Track not found")
        }
    },(erreur)=>{
        MyApp.LogAppliError("CallGetTrack error: " + erreur, User, UserId)
        Socket.emit("GeoXError", "CallGetTrack error: " + erreur)
    })
}

module.exports.CallGetUserGroup = CallGetUserGroup
module.exports.CallGetMarkers = CallGetMarkers
module.exports.CallSaveTrack = CallSaveTrack
module.exports.CallGetTrack = CallGetTrack