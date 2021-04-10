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

module.exports.CallGetInitialData = CallGetInitialData
module.exports.CallGetTracksOfGroup = CallGetTracksOfGroup
module.exports.CallUpdateTrack = CallUpdateTrack