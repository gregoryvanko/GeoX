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

function CallSaveTrack(Track, MyApp, Socket, User, UserId){
    let Shared = require("./Shared")
    let ReponseAddTrack = Shared.PromiseAddTrack(Track, MyApp, User)
    if(ReponseAddTrack.Error){
        MyApp.LogAppliError(ReponseAddTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseAddTrack.ErrorMsg)
    } else {
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "MapSaved"
        MyReponse.Data = null
        Socket.emit("CreateTracksOnMap", MyReponse)
        MyApp.LogAppliInfo("New track saved from a created track", User, UserId)
    }
}

module.exports.CallGetUserGroup = CallGetUserGroup
module.exports.CallGetMapData = CallGetMapData
module.exports.CallSaveTrack = CallSaveTrack