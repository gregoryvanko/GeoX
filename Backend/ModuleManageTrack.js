async function CallUpdateTrack(Track, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseUpdateTrack = await Shared.PromiseUpdateTrack(Track, MyApp)
    if(!ReponseUpdateTrack.Error){
        CallGetUserData(MyApp, Socket, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseUpdateTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUpdateTrack.ErrorMsg)
    }
}

async function CallGetUserData(MyApp, Socket, User, UserId){
    let Data = {AppData: null, AppGroup: null}
    // Get all tracks info (but no track data)
    let Shared = require("./Shared")
    let ReponseAllTracksInfo = await Shared.PromiseGetAllTracksInfo(MyApp, User)
    if(!ReponseAllTracksInfo.Error){
        Data.AppData = ReponseAllTracksInfo.Data
        // Find all different group
        if (Data.AppData.length > 0){
            Data.AppGroup= [...new Set(Data.AppData.map(item => item.Group))] 
        } else {
            Data.AppGroup=[]
        }
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetUserData"
        MyReponse.Data = Data
        Socket.emit("ManageTrack", MyReponse)
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send User Data`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseAllTracksInfo.ErrorMsg)
    }
}

function CallDownloadTrack(Value, MyApp, Socket, User, UserId){
    let MongoR = require('@gregvanko/corex').Mongo
    Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    MongoTracksCollection = MongoConfig.TracksCollection
    let MongoObjectId = require('@gregvanko/corex').MongoObjectId

    let Projection = {}
    if (Value.Type == "gpx"){
        Projection = { projection:{[MongoTracksCollection.GpxData]: 1}}
    } else {
        Projection = { projection:{[MongoTracksCollection.GeoJsonData]: 1}}
    }
    const Sort = {[MongoTracksCollection.Date]: -1}
    const Querry = {'_id': new MongoObjectId(Value.Id)}
    Mongo.FindSortPromise(Querry, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
        if(reponse.length == 0){
            MyApp.LogAppliError("CAllDownloadTrack Track Id not found", User, UserId)
            Socket.emit("GeoXError", "CAllDownloadTrack Track Id not found")
        } else {
            let Data = new Object()
            Data.Type = Value.Type
            if (Value.Type == "gpx"){
                Data.File = reponse[0][MongoTracksCollection.GpxData]
            } else {
                Data.File = JSON.stringify(reponse[0][MongoTracksCollection.GeoJsonData])
            }
            //Send Data
            let MyReponse = new Object()
            MyReponse.Action = "SetDownloadedFile"
            MyReponse.Data = Data
            Socket.emit("ManageTrack", MyReponse)
            // Log
            MyApp.LogAppliInfo("Track Downloaded", User, UserId)
        }
    },(erreur)=>{
        MyApp.LogAppliError("CAllDownloadTrack DB error : " + erreur, User, UserId)
        Socket.emit("GeoXError", "CAllDownloadTrack DB error")
    })
}

/**
* Delete d'une track
* @param {string} Id {Id of track to delete}
* @param {Socket} Socket SocketIO
* @param {String} User Nom du user
* @param {String} UserId Id du user
*/
function CallDeleteTrack(Id, MyApp, Socket, User, UserId){

    let MongoR = require('@gregvanko/corex').Mongo
    Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    MongoTracksCollection = MongoConfig.TracksCollection
    Mongo.DeleteByIdPromise(Id, MongoTracksCollection.Collection).then((reponse)=>{
        CallGetUserData(MyApp, Socket, User, UserId)
        // Log
        MyApp.LogAppliInfo("Track deleted", User, UserId)
    },(erreur)=>{
        MyApp.LogAppliError("CallDeleteTrack DB error : " + erreur, User, UserId)
        Socket.emit("GeoXError", "CallDeleteTrack error")
    })
}

/**
 * 
 * @param {Object} Track Track to add
 * @param {Socket} Socket SocketIO
 * @param {String} User Nom du user
 * @param {String} UserId Id du user
 */
function CallAddTrack(Track, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseAddTrack = Shared.PromiseAddTrack(Track, MyApp, User)
    if(ReponseAddTrack.Error){
        MyApp.LogAppliError(ReponseAddTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseAddTrack.ErrorMsg)
    } else {
        CallGetUserData(MyApp, Socket, User, UserId)
        MyApp.LogAppliInfo("New track saved from a Added track", User, UserId)
    }
}

/**
* Delete d'une track
* @param {string} Id {Id of track}
* @param {Socket} Socket SocketIO
* @param {String} User Nom du user
* @param {String} UserId Id du user
*/
async function CallGetTrackInfo(Id, MyApp, Socket, User, UserId){
    // Get all tracks info (but no track data)
    let Shared = require("./Shared")
    let ReponseTracksInfo = await Shared.PromiseGetTracksInfo(Id, MyApp, User)
    if(!ReponseTracksInfo.Error){
        //Send Data
        Socket.emit("ManageTrack", {Action: "SetTrackInfo", Data: ReponseTracksInfo.Data})
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send Track Info Data`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseTracksInfo.ErrorMsg)
    }
}

module.exports.CallUpdateTrack = CallUpdateTrack
module.exports.CallGetUserData = CallGetUserData
module.exports.CallDownloadTrack = CallDownloadTrack
module.exports.CallDeleteTrack = CallDeleteTrack
module.exports.CallAddTrack = CallAddTrack
module.exports.CallGetTrackInfo = CallGetTrackInfo