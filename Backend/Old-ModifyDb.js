
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

exports.CalculCenterofAlTracks = (MyApp) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection

    const Querry = {}
    const Projection = { projection:{}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=> {
        reponse.forEach(element => {
            // Calcul du center point
            let CenterPoint = new Object()
            CenterPoint.Lat = (element.ExteriorPoint.MinLat + element.ExteriorPoint.MaxLat)/2
            CenterPoint.Long = (element.ExteriorPoint.MinLong + element.ExteriorPoint.MaxLong)/2
            // Add du center point
            let DataToDb = new Object()
            DataToDb[MongoTracksCollection.Center] = CenterPoint
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

exports.AddPublicToAlTracks = (MyApp) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection
    const Querry = {}
    const Projection = { projection:{_id: 1}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=> {
        reponse.forEach(element => {
            let DataToDb = new Object()
            DataToDb[MongoTracksCollection.Public] = true
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

exports.AddStartPointToAlTracks = (MyApp) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection
    const Querry = {}
    const Projection = { projection:{_id: 1, [MongoTracksCollection.GeoJsonData]: 1}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=> {
        reponse.forEach(element => {
            let beg = null
            if (element.GeoJsonData.features[0].geometry.type == "LineString"){
                beg = element.GeoJsonData.features[0].geometry.coordinates[0];
            } else {
                if (element.GeoJsonData.features[0].geometry.coordinates[0][0]){
                    beg = element.GeoJsonData.features[0].geometry.coordinates[0][0];
                }
            }
            if (beg != null){
                let latleng = new Object()
                latleng.Lat = beg[1]
                latleng.Lng = beg[0]
                let DataToDb = new Object()
                DataToDb[MongoTracksCollection.StartPoint] = latleng
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
            } else {
                MyApp.LogAppliError("Girst point not found for track: " + element.Name, "Server", "Server")
            }
        })
    },(erreur)=>{
        MyApp.LogAppliError("error: " + erreur)
    })
}

async function AddElevationToAlTracks (MyApp){
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection
    let Shared = require("./ManageTrack")

    let ReponseAllData = await PromiseGetAllGeojson(Mongo, MongoTracksCollection)
    if(!ReponseAllData.Error){
        let Total = ReponseAllData.Data.length
        let Current = 0
        console.log("Start AddElevationToAlTracks")
        for (let index = 0; index < ReponseAllData.Data.length; index++) {
            //const element = ReponseAllData.Data[1]
            const element = ReponseAllData.Data[index]
            Current +=1
            let Id = element._id
           
            if (element.GeoJsonData.features[0].geometry.type == "LineString"){
                const dist = Shared.CalculateTrackLength(element.GeoJsonData)
                const ElevationData = await Shared.GetElevationOfGeoJson(element.GeoJsonData)
                let DataToDb = new Object()
                DataToDb[MongoTracksCollection.Elevation] = ElevationData.AllElevation
                DataToDb[MongoTracksCollection.InfoElevation] = ElevationData.InfoElevation
                DataToDb[MongoTracksCollection.Description] = ""
                DataToDb[MongoTracksCollection.Length] = dist
                let ReponseUpdate = await PromiseUpdateDataInDb (Id, DataToDb, Mongo,  MongoTracksCollection)
                if(ReponseUpdate.Error){
                    console.log(ReponseUpdate.ErrorMsg)
                } else {
                    console.log(Current+ "/" + Total + " done" + " dist="+ dist)
                }
            } else {
                console.log("error Id= " + element._id + " is not a LineString")
            }
        }
    }else {
        console.log("AddElevationToAlTracks error: " + ReponseAllData.ErrorMsg)
    }
    console.log("==> End of AddElevationToAlTracks")
}

function PromiseGetAllGeojson(Mongo, MongoTracksCollection){
    return new Promise(resolve => {
        let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:[]}

        const Querry = {}
        const Projection = { projection:{_id: 1, [MongoTracksCollection.GeoJsonData]: 1}}
        Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
                ReponseTracks.Error = false
                ReponseTracks.ErrorMsg = null
            if(reponse.length == 0){
                ReponseTracks.Data = []
            } else {
                ReponseTracks.Data = reponse
            }
            resolve(ReponseTracks)
        },(erreur)=>{
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = "PromiseGetAllGeojson error: " + erreur
            ReponseTracks.Data = []
            resolve(ReponseTracks)
        })
    })
}


// async function FetchElevation(data){
//     let reponse ={Valide: false, Data: []}
//     try {
//         const fetch = require('node-fetch')
//         const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
//             method: 'POST',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(data)
//         })
//         reponse.Data = await response.json();
//         reponse.Valide = true
//         return reponse;
//     } catch (e) {
//         reponse.Data = e
//         return reponse;
//     }   
// }

function PromiseUpdateDataInDb (Id, Data, Mongo, MongoTracksCollection){
    return new Promise(resolve => {
        let ReponseUpdate = {Error: true, ErrorMsg:"InitError"}
        Mongo.UpdateByIdPromise(Id, Data, MongoTracksCollection.Collection).then((reponse)=>{
            if (reponse.matchedCount == 0){
                ReponseUpdate.Error = true
                ReponseUpdate.ErrorMsg = "Track Id not found: " + Id
            } else {
                ReponseUpdate.Error = false
                ReponseUpdate.ErrorMsg = null
            }
            resolve(ReponseUpdate)
        },(erreur)=>{
            ReponseUpdate.Error = true
            ReponseUpdate.ErrorMsg = "UpdateTrack DB error : " + erreur
            resolve(ReponseUpdate)
        })
    })
}

exports.GetGpx = (MyApp, Id, Socket) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection
    let MongoObjectId = require('@gregvanko/corex').MongoObjectId
    const Querry = {'_id': new MongoObjectId(Id)}
    const Projection = { projection:{_id: 1, [MongoTracksCollection.GpxData]: 1}}
    Mongo.FindPromise(Querry, Projection, MongoTracksCollection.Collection).then((reponse)=>{
        if(reponse.length == 0){
            console.Log("Error: id not found")
        } else {
            Socket.emit("AdminManageTrack", {Action: "ModifyDB", Data: {SubAction: "ConvertGpxToImg", Gpx : reponse[0]}})
        }
    },(erreur)=>{
        console.Log("Error DB: " + erreur)
    })
}

exports.SaveImg = (MyApp, Id, Img, Socket) => {
    let MongoR = require('@gregvanko/corex').Mongo
    let Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
    let MongoConfig = require("./MongoConfig.json")
    let MongoTracksCollection = MongoConfig.TracksCollection

    let DataToDb = new Object()
    DataToDb[MongoTracksCollection.Image]= Img

    Mongo.UpdateByIdPromise(Id, DataToDb, MongoTracksCollection.Collection).then((reponse)=>{
        if (reponse.matchedCount == 0){
            console.log("Error, Id not found")
        } else {
            console.log("Img Saved for id: " + Id)
            Socket.emit("AdminManageTrack", {Action: "ModifyDB", Data: {SubAction: "Next"}})
        }
    },(erreur)=>{
        console.Log("Error DB: " + erreur)
    })
}

module.exports.AddElevationToAlTracks = AddElevationToAlTracks