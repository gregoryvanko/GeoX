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

    let ReponseAllData = await PromiseGetAllGeojson(Mongo, MongoTracksCollection)
    if(!ReponseAllData.Error){
        let Total = ReponseAllData.Data.length
        let Current = 0

        for (let index = 0; index < ReponseAllData.Data.length; index++) {
            //const element = ReponseAllData.Data[0]

            const element = ReponseAllData.Data[index]
            Current +=1
            let Id = element._id
            console.log("Start AddElevationToAlTracks")

            if (element.GeoJsonData.features[0].geometry.type == "LineString"){
                let Coord = element.GeoJsonData.features[0].geometry.coordinates

                let AllElevation = []
                let distance = 0
                const [lng, lat] = Coord[0]
                const ele = await PromiseGetElevation({ lat, lng })
                AllElevation.push({ x: distance, y: ele, coord:{lat:lat, long: lng}})

                const { getDistance } = require("geolib")
                for (let i = 1; i < Coord.length; i++){
                    const [prelng, prelat] = Coord[i - 1]
                    const [lng, lat] = Coord[i]
                    const ele = await PromiseGetElevation({lat, lng})
                    distance += getDistance(
                        { latitude: prelat, longitude: prelng },
                        { latitude: lat, longitude: lng }
                    )
                    AllElevation.push({ x: distance, y: ele, coord:{lat:lat, long: lng}})
                }
                let DataToDb = new Object()
                DataToDb[MongoTracksCollection.Elevation] = AllElevation
                let ReponseUpdate = await PromiseUpdateDataInDb (Id, DataToDb, Mongo,  MongoTracksCollection)
                if(ReponseUpdate.Error){
                    console.log(ReponseUpdate.ErrorMsg)
                } else {
                    console.log(Current+ "/" + Total + " done")
                }
    
                // let locations = []
                // Coord.forEach(OneCoord => {
                //     let lat = OneCoord[1]
                //     let long = OneCoord[0]
                //     let latlong = {"latitude": lat,"longitude": long}
                //     locations.push(latlong)
                // });
                // let data = {"locations":locations}
                // let reponse = await FetchElevation(data)
                // if (reponse.Valide){
                //     let DataToDb = new Object()
                //     DataToDb[MongoTracksCollection.Elevation] = reponse.Data
                //     MyApp.LogAppliInfo("OK", "Server", "Server")
                // } else {
                //     MyApp.LogAppliError("error Id= " + element._id + " => Fetch elevation error: " + reponse.Data, "Server", "Server")
                // }

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

function PromiseGetElevation({ lat, lng }){
    return new Promise ((resolve, reject) => {
        const path = require('path')
        let fs = require('fs')
        var dir = path.resolve(__dirname, "TempHgt")
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            console.log("create")
        }
        const { TileSet } = require("node-hgt")
        const tileset = new TileSet(path.resolve(__dirname, "TempHgt"))
        tileset.getElevation([lat, lng], (err, ele) => {
            if (!err){
                resolve(ele.toFixed(0))
            } else {
                console.log(err)
                reject(err)
            }
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

module.exports.AddElevationToAlTracks = AddElevationToAlTracks