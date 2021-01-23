/**
 * Fonction executant un update du calcul de la longeur pour toutes les track de la DB
 * @param {Object} MyApp Object contenant les fonction de CoreX
 */
exports.UpdateLengthOfAllTracks= (MyApp) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection
    const Querry = {}
    const Projection = { projection:{}}
    const Sort = {[MongoTracksCollection.Date]: -1}
    Mongo.FindSortPromise(Querry, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
        reponse.forEach(element => {
            let GeoJsonData = element.GeoJsonData
            let id = element._id
            let dist = CalculateTrackLength(GeoJsonData)
            let DataToDb = new Object()
            DataToDb[MongoTracksCollection.Length]=dist
            Mongo.UpdateByIdPromise(id, DataToDb, MongoTracksCollection.Collection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    // Log
                    MyApp.LogAppliError("UpdateTrack Track Id not found: "+ id, "Server", "Server")
                } else {
                    // Log
                    MyApp.LogAppliInfo("Track Updated", "Server", "Server")
                }
            },(erreur)=>{
                MyApp.LogAppliError("UpdateTrack DB error : " + erreur, "Server", "Server")
            })
        });
    },(erreur)=>{
        MyApp.LogAppliError("error: " + erreur)
    })
}

/**
 * Calcule la longeur en Km d'une track
 * @param {GeoJson} GeoJson GeoJson object de la track
 */
function CalculateTrackLength(GeoJson){
    let Turf = require('@turf/length').default
    let distance = Math.round((Turf(GeoJson) + Number.EPSILON) * 1000) / 1000
    return distance
}


exports.AddUserToAlTracks = (MyApp, UserLogin) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection
    const Querry = {}
    const Projection = { projection:{}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=> {
        reponse.forEach(element => {
            let DataToDb = new Object()
            DataToDb[MongoTracksCollection.Owner] = UserLogin
            Mongo.UpdateByIdPromise(element._id, DataToDb, MongoTracksCollection.Collection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    // Log
                    MyApp.LogAppliError("UpdateTrack Track Id not found: "+ element._id, "Server", "Server")
                } else {
                    // Log
                    MyApp.LogAppliInfo("Track Updated", "Server", "Server")
                }
            },(erreur)=>{
                MyApp.LogAppliError("UpdateTrack DB error : " + erreur, "Server", "Server")
            })
        })
    },(erreur)=>{
        MyApp.LogAppliError("error: " + erreur)
    })
}