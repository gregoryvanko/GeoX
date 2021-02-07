async function CallGetUserData(MyApp, Socket, User, UserId){
    let Data = {AppData: null, AppGroup: null, AppInitMapData: null}
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

        // Build Tracks Data
        Data.AppInitMapData = new Object()
        Data.AppInitMapData.ListOfTracks = []
        Data.AppInitMapData.CenterPoint = {Lat:50.709446, Long:4.543413}
        Data.AppInitMapData.Zoom = 8
        Data.AppInitMapData.FitBounds = null
        
        // Find all track data of the first group
        if (Data.AppGroup.length > 0){
            // Get Tracks
            let Shared = require("./Shared")
            let ReponseListOfTracks = await Shared.PromiseGetTracksData(MyApp, Data.AppGroup[0], User)
            if(!ReponseListOfTracks.Error){
                Data.AppInitMapData.ListOfTracks = ReponseListOfTracks.Data
            } else {
                MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
                Socket.emit("GeoXError", ReponseListOfTracks.ErrorMsg)
            }
            // Calcul des point extérieur et du centre de toutes les tracks
            if (Data.AppInitMapData.ListOfTracks.length != 0){
                let MinMax = Shared.MinMaxOfTracks(Data.AppInitMapData.ListOfTracks)
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

async function CallGetMapData(GroupName, MyApp, Socket, User, UserId){
    // Build Tracks Data
    let Data = new Object()
    Data.ListOfTracks = []
    Data.CenterPoint = {Lat:50.709446, Long:4.543413}
    Data.Zoom = 8
    // Get Tracks
    let Shared = require("./Shared")
    let ReponseListOfTracks = await Shared.PromiseGetTracksData(MyApp, GroupName, User)
    if(!ReponseListOfTracks.Error){
        Data.ListOfTracks = ReponseListOfTracks.Data
        // Calcul des point extérieur et du centre de toutes les tracks
        if (Data.ListOfTracks.length != 0){
            let MinMax = Shared.MinMaxOfTracks(Data.ListOfTracks)
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
    let Shared = require("./Shared")
    let ReponseUpdateTrack = await Shared.PromiseUpdateTrack(Track, MyApp)
    if(ReponseUpdateTrack.Error){
        MyApp.LogAppliError(ReponseUpdateTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUpdateTrack.ErrorMsg)
    }
}

module.exports.CallGetUserData = CallGetUserData
module.exports.CallGetMapData = CallGetMapData
module.exports.CallUpdateTrack = CallUpdateTrack