async function CallGetUserGroup(MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseUserGroup = await Shared.PromiseGetUserGroup(MyApp, User)
    if(!ReponseUserGroup.Error){
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetUserGroup"
        MyReponse.Data = ReponseUserGroup.Data
        Socket.emit("CreateTracksOnMap", MyReponse)
    } else {
        MyApp.LogAppliError(ReponseUserGroup.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUserGroup.ErrorMsg)
    }
}

async function CallGetMapData(GroupName, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseListOfTracks = await Shared.PromiseGetTracksData(MyApp, GroupName, User)
    if(ReponseListOfTracks.Error){
        MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseListOfTracks.ErrorMsg)
    } else {
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetMapData"
        MyReponse.Data = ReponseListOfTracks.Data
        Socket.emit("CreateTracksOnMap", MyReponse)
    }
}

async function CallSaveTrack(Track, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseAddTrack = await Shared.PromiseAddTrack(Track, MyApp, User)
    if(ReponseAddTrack.Error){
        MyApp.LogAppliError(ReponseAddTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseAddTrack.ErrorMsg)
    } else {
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "TrackSaved"
        MyReponse.Data = null
        Socket.emit("CreateTracksOnMap", MyReponse)
        if ((Track.Id != null) && (Track.ModifyExistingTrack)){
            MyApp.LogAppliInfo("Track updated from a created track", User, UserId)
        } else {
            MyApp.LogAppliInfo("New track saved from a created track", User, UserId)
        }
    }
}

async function CallGetTrackData(TrackID, MyApp,  Socket, User, UserId){
    let ReponseGetTrackData = await PromiseGetTrackData(TrackID, MyApp, User)
    if(ReponseGetTrackData.Error){
        MyApp.LogAppliError(ReponseGetTrackData.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseGetTrackData.ErrorMsg)
    } else {
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetTrackFromGeoJson"
        MyReponse.Data = new Object()
        MyReponse.Data.GeoJson = ReponseGetTrackData.Data.GeoJsonData
        MyReponse.Data.Center = ReponseGetTrackData.Data.Center
        MyReponse.Data.ExteriorPoint = ReponseGetTrackData.Data.ExteriorPoint
        Socket.emit("CreateTracksOnMap", MyReponse)
        MyApp.LogAppliInfo("Send GeoJson data to be modified", User, UserId)
    }
}

function PromiseGetTrackData(TrackID, MyApp, User){
    return new Promise (resolve =>{``
    let MongoObjectId = require('@gregvanko/corex').MongoObjectId
    let MongoR = require('@gregvanko/corex').Mongo
    Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    MongoTracksCollection = MongoConfig.TracksCollection

    let ReponseTrackData = {Error: true, ErrorMsg:"InitError", Data: null}

    // Query Mongodb
    const Querry = {'_id': new MongoObjectId(TrackID)}
    const Projection = { projection:{[MongoTracksCollection.GpxData]: 0}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
        if(reponse.length == 1){
            let TrackData = new Object()
            TrackData.Name = reponse[0].Name
            TrackData.Group = reponse[0].Group
            TrackData.Color = reponse[0].Color
            TrackData.Date = reponse[0].Date
            TrackData.Owner = reponse[0].Owner
            TrackData.ExteriorPoint = reponse[0].ExteriorPoint
            TrackData.GeoJsonData = reponse[0].GeoJsonData
            TrackData.Length = reponse[0].Length
            TrackData.Center = reponse[0].Center
            TrackData.Public = reponse[0].Public
            TrackData.StartPoint = reponse[0].StartPoint

            ReponseTrackData.Error = false
            ReponseTrackData.ErrorMsg = ""
            ReponseTrackData.Data = TrackData
            resolve(ReponseTrackData)
        } else {
            ReponseTrackData.Error = true
            ReponseTrackData.ErrorMsg = "Track id not found"
            resolve(ReponseTrackData)
        }
    },(erreur)=>{
        ReponseTrackData.Error = true
        ReponseTrackData.ErrorMsg = erreur
        resolve(ReponseTrackData)
    })
})
}

module.exports.CallGetUserGroup = CallGetUserGroup
module.exports.CallGetMapData = CallGetMapData
module.exports.CallSaveTrack = CallSaveTrack
module.exports.CallGetTrackData = CallGetTrackData