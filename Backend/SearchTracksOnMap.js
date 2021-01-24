async function CallGetCenterOfTracks(MyApp, Data, FromCurrentView, Socket, User, UserId){
    let ReponseAllTracksInfo = await PromiseGetAllTracksInfo(MyApp)
    if(!ReponseAllTracksInfo.Error){
        let reponse = new Object()
        reponse.Action = "SetAllTracksInfo"
        reponse.Data = ReponseAllTracksInfo.Data
        Socket.emit("SearchTracksOnMap", reponse)
    } else {
        MyApp.LogAppliError(ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallGetCenterOfTracks PromiseGetAllTracksInfo error")
    }
}

function PromiseGetAllTracksInfo(MyApp){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:null}

        const Querry = {}
        const Projection = { projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Group]: 1, [MongoTracksCollection.Color]: 1, [MongoTracksCollection.Date]: 1, [MongoTracksCollection.ExteriorPoint]: 1, [MongoTracksCollection.Length]: 1}}
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
            ReponseTracks.ErrorMsg = "CallGetCenterOfTracks PromiseGetAllTracksInfo error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}



module.exports.CallGetCenterOfTracks = CallGetCenterOfTracks