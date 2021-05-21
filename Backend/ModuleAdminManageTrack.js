async function CallGetData(MyApp, Socket, User, UserId){
    // Get all tracks info (but no track data)
    let ReponseAllTracksInfo = await PromiseGetAllTracksInfo(MyApp)
    if(!ReponseAllTracksInfo.Error){
        //Send Data
        let MyReponse = new Object()
        MyReponse.Action = "SetData"
        MyReponse.AppData = ReponseAllTracksInfo.Data
        Socket.emit("AdminManageTrack", MyReponse)
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send Admin User Data`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseAllTracksInfo.ErrorMsg)
    }
}

/**
 * Get Tracks info from DB (promise)
 */
function PromiseGetAllTracksInfo(MyApp){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:null}

        const Querry = {}
        const Projection = { projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Group]: 1, [MongoTracksCollection.Color]: 1, [MongoTracksCollection.Date]: 1, [MongoTracksCollection.ExteriorPoint]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.Center]: 1, [MongoTracksCollection.Public]: 1, [MongoTracksCollection.Owner]: 1}}
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
        Socket.emit("AdminManageTrack", {Action: "SetTrackInfo", Data: ReponseTracksInfo.Data})
        // Log socket action
        MyApp.LogAppliInfo(`SoApi send Admin Track Info Data`, User, UserId)
    } else {
        MyApp.LogAppliError(ReponseTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseTracksInfo.ErrorMsg)
    }
}

module.exports.CallGetData = CallGetData
module.exports.CallGetTrackInfo = CallGetTrackInfo