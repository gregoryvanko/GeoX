async function CallGetTracksInfo(MyApp, Data, FromCurrentView, Socket, User, UserId){
    let ReponseAllTracksInfo = await PromiseGetAllTracksInfo(MyApp)
    if(!ReponseAllTracksInfo.Error){
        // Select Track only on the map screen
        let TracksToSend = []
        let turf = require('@turf/turf');
        let poly = turf.polygon([[[Data.NW.lat, Data.NW.lng],[Data.NE.lat, Data.NE.lng],[Data.SE.lat, Data.SE.lng],[Data.SW.lat, Data.SW.lng],[Data.NW.lat, Data.NW.lng]]]);
        ReponseAllTracksInfo.Data.forEach(Track => {
            let pt = turf.point([Track.Center.Long , Track.Center.Lat]);
            if(turf.booleanPointInPolygon(pt, poly)){
                TracksToSend.push(Track)
            }
        });

        let reponse = new Object()
        reponse.Action = "SetAllTracksInfo"
        reponse.Data = TracksToSend
        Socket.emit("SearchTracksOnMap", reponse)
    } else {
        MyApp.LogAppliError(ReponseAllTracksInfo.ErrorMsg, User, UserId)
        Socket.emit("GeoXError", "CallGetTracksInfo PromiseGetAllTracksInfo error")
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
        const Projection = { projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Group]: 1, [MongoTracksCollection.Color]: 1, [MongoTracksCollection.Date]: 1, [MongoTracksCollection.ExteriorPoint]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.Center]: 1, [MongoTracksCollection.GeoJsonData]: 1}}
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
            ReponseTracks.ErrorMsg = "CallGetTracksInfo PromiseGetAllTracksInfo error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}

module.exports.CallGetTracksInfo = CallGetTracksInfo