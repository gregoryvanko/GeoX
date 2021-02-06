async function CallUpdateTrack(Track, MyApp, Socket, User, UserId){
    let ReponseUpdateTrack = await PromiseUpdateTrack(Track, MyApp)
    if(!ReponseUpdateTrack.Error){
        // ToDo send data
    } else {
        MyApp.LogAppliError(ReponseUpdateTrack.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", ReponseUpdateTrack.ErrorMsg)
    }
}

function PromiseUpdateTrack(Track, MyApp){
    return new Promise(resolve => {
        let ReponseUpdateTrack = {Error: true, ErrorMsg:"InitError", Data:null}

        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection
    
        let DataToDb = new Object()
        if(Track.Name){DataToDb[MongoTracksCollection.Name]= Track.Name}
        if(Track.Group){DataToDb[MongoTracksCollection.Group]= Track.Group}
        if(Track.Public != undefined){DataToDb[MongoTracksCollection.Public]= Track.Public}
        if (Track.Color){DataToDb[MongoTracksCollection.Color]= Track.Color}
        
        Mongo.UpdateByIdPromise(Track.Id, DataToDb, MongoTracksCollection.Collection).then((reponse)=>{
            if (reponse.matchedCount == 0){
                ReponseUpdateTrack.Error = true
                ReponseUpdateTrack.ErrorMsg = "GeoXServerApi PromiseUpdateTrack Track Id not found: "
                ReponseUpdateTrack.Data = []
            } else {
                ReponseUpdateTrack.Error = false
                ReponseUpdateTrack.ErrorMsg = ""
                ReponseUpdateTrack.Data = []
            }
            resolve(ReponseUpdateTrack)
        },(erreur)=>{
            ReponseUpdateTrack.Error = true
            ReponseUpdateTrack.ErrorMsg = "GeoXServerApi PromiseUpdateTrack error: " + erreur
            ReponseUpdateTrack.Data = []
            resolve(ReponseUpdateTrack)
        })
    })
}

module.exports.CallUpdateTrack = CallUpdateTrack
module.exports.PromiseUpdateTrack = PromiseUpdateTrack