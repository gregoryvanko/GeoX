const fs = require('fs')
const path = require('path')
const { TileSet } = require("node-hgt")
var togpx = require('togpx')

// creation du folder si il n'existe pas encore
var dir = path.resolve(__dirname, "TempHgt")
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    console.log("TempHgt folder created")
} else {
    console.log("TempHgt folder exist")
}


/**
 * Calcul les lat et long min et max d'une track contenue dans un object GeoJson
 * @param {geojson object} geojson Object GeaoJson d'une track
 */
function MinMaxGeoJsonTrack(geojson){
    let reponse = new Object()
    reponse.IsError = false
    reponse.ErrorMsg = "no error"
    reponse.Data = null
    const listofcoordonate = geojson.features[0].geometry.coordinates
    const LineType = geojson.features[0].geometry.type
    let MinLat1 = null
    let MaxLat1 = null
    let MinLong1 = null
    let MaxLong1 = null
    if (LineType == "LineString"){
        listofcoordonate.forEach(element => {
            if(MinLat1 == null){
                MinLat1 = element[0]
            } else {
                if(element[0] < MinLat1){MinLat1 = element[0]}
            }
            if(MaxLat1 == null){
                MaxLat1 = element[0]
            } else {
                if(element[0] > MaxLat1){MaxLat1 = element[0]}
            }
            if(MinLong1 == null){
                MinLong1 = element[1]
            } else {
                if(element[1] < MinLong1){MinLong1 = element[1]}
            }
            if(MaxLong1 == null){
                MaxLong1 = element[1]
            } else {
                if(element[1] > MaxLong1){MaxLong1 = element[1]}
            }
        });
    } else if (LineType == "MultiLineString"){
        listofcoordonate.forEach(OneListe => {
            OneListe.forEach(element => {
                if(MinLat1 == null){
                    MinLat1 = element[0]
                } else {
                    if(element[0] < MinLat1){MinLat1 = element[0]}
                }
                if(MaxLat1 == null){
                    MaxLat1 = element[0]
                } else {
                    if(element[0] > MaxLat1){MaxLat1 = element[0]}
                }
                if(MinLong1 == null){
                    MinLong1 = element[1]
                } else {
                    if(element[1] < MinLong1){MinLong1 = element[1]}
                }
                if(MaxLong1 == null){
                    MaxLong1 = element[1]
                } else {
                    if(element[1] > MaxLong1){MaxLong1 = element[1]}
                }
            });
        });
    } else {
        reponse.IsError = true
        reponse.ErrorMsg = "LineType not know in GeoJson file"
    }
    reponse.Data = {MinLat:MinLat1, MaxLat:MaxLat1, MinLong:MinLong1, MaxLong:MaxLong1}
    return reponse
}

function CalculateTrackLength(GeoJson){
    let distance = 0
    let Coord = GeoJson.features[0].geometry.coordinates
    const { getDistance } = require("geolib")
    for (let i = 1; i < Coord.length; i++){
        const [prelng, prelat] = Coord[i - 1]
        const [lng, lat] = Coord[i]
        // Get distance from first point
        let DistBetweenTwoPoint = getDistance(
            { latitude: prelat, longitude: prelng },
            { latitude: lat, longitude: lng }
        )
        distance += DistBetweenTwoPoint
    }
    return distance/1000
}

async function GetElevationOfGeoJson(GeoJson){
    return new Promise (async (resolve) => {
        let Reponse = {Error: true, ErrorMsg:"InitError GetElevationOfGeoJson", Data:null}

        let Coord = GeoJson.features[0].geometry.coordinates
        let ElevationMin = 0
        let ElevationMax = 0
        let ElevationCumulP = 0
        let ElevationCumulM = 0
        let ElevationPrevious = 0
    
        let AllElevation = []
        let distance = 0
        let IntermediereDist = 0
        const MinDistBetweenTwoPoint = 50
        const [lng, lat] = Coord[0]

        let ReponseGetElevation = await PromiseGetElevation({ lat, lng })
        if(ReponseGetElevation.Error){
            Reponse.Error = true
            Reponse.ErrorMsg = "GetElevation error : " + ReponseGetElevation.ErrorMsg
            Reponse.Data = null
            return resolve(Reponse)
        }
        let ele = parseInt(ReponseGetElevation.Data)
        AllElevation.push({ x: distance, y: ele, coord:{lat:lat, long: lng}})
    
        ElevationMin = ele
        ElevationMax = ele
        ElevationCumulP = 0
        ElevationCumulM = 0
        ElevationPrevious = ele
        
        
        const { getDistance } = require("geolib")
        for (let i = 1; i < Coord.length; i++){
            const [prelng, prelat] = Coord[i - 1]
            const [lng, lat] = Coord[i]
            // Get distance from first point
            let DistBetweenTwoPoint = getDistance(
                { latitude: prelat, longitude: prelng },
                { latitude: lat, longitude: lng }
            )
            distance += DistBetweenTwoPoint
            IntermediereDist += DistBetweenTwoPoint
    
            if ((IntermediereDist > MinDistBetweenTwoPoint) || (i == Coord.length -1)){
                IntermediereDist = 0
                // Get elevation
                let ReponseGetElevationInterm = await PromiseGetElevation({ lat, lng })
                if(ReponseGetElevationInterm.Error){
                    Reponse.Error = true
                    Reponse.ErrorMsg = "GetElevation error : " + ReponseGetElevation.ErrorMsg
                    Reponse.Data = null
                    return resolve(Reponse)
                }
                let eleP = parseInt(ReponseGetElevationInterm.Data)


                // Add Elevation point
                AllElevation.push({ x: distance, y: eleP, coord:{lat:lat, long: lng}})
                // Get ElevationMin
                if (eleP < ElevationMin){
                    ElevationMin = eleP
                }
                // Get ElevationMax
                if (eleP > ElevationMax){
                    ElevationMax = eleP
                }
                // Get ElevationCumulP ElevationCumulM
                const Delta = eleP - ElevationPrevious
                if ((Delta)>0){
                    ElevationCumulP += Delta
                } else {
                    ElevationCumulM += Delta
                }
                ElevationPrevious = eleP
            }
        }
        Reponse.Error= false
        Reponse.ErrorMsg= null
        Reponse.Data= {AllElevation: AllElevation, InfoElevation: {ElevMax:ElevationMax, ElevMin:ElevationMin, ElevCumulP:ElevationCumulP, ElevCumulM:Math.abs(ElevationCumulM)}}
        resolve(Reponse)
    })
}

async function GetElevationOfLatLng(LatLng){
    return new Promise (async (resolve) => {
        let Reponse = {Error: true, ErrorMsg:"InitError GetElevationOfGeoJson", Data:null}
        let ElevationMin = 0
        let ElevationMax = 0
        let ElevationCumulP = 0
        let ElevationCumulM = 0
        let ElevationPrevious = 0

        let AllElevation = []
        let distance = 0
        let IntermediereDist = 0
        const MinDistBetweenTwoPoint = 50
        let LatLngnull = LatLng[0]
        let lat = LatLngnull.lat
        let lng = LatLngnull.lng
        let ReponseGetElevationInterm = await PromiseGetElevation({ lat, lng })
        if(ReponseGetElevationInterm.Error){
            Reponse.Error = true
            Reponse.ErrorMsg = "GetElevation error : " + ReponseGetElevationInterm.ErrorMsg
            Reponse.Data = null
            return resolve(Reponse)
        }
        let ele = parseInt(ReponseGetElevationInterm.Data)
        
        AllElevation.push({ x: distance, y: ele, coord:{lat:lat, long: lng}})

        ElevationMin = ele
        ElevationMax = ele
        ElevationCumulP = 0
        ElevationCumulM = 0
        ElevationPrevious = ele
        
        const { getDistance } = require("geolib")
        for (let i = 1; i < LatLng.length; i++){
            let LatLngMinusOne = LatLng[i - 1]
            let prelat = LatLngMinusOne.lat
            let prelng =LatLngMinusOne.lng

            let LatLngI = LatLng[i]
            let lat = LatLngI.lat
            let lng = LatLngI.lng

            // Get distance from first point
            let DistBetweenTwoPoint = getDistance(
                { latitude: prelat, longitude: prelng },
                { latitude: lat, longitude: lng }
            )
            distance += DistBetweenTwoPoint
            IntermediereDist += DistBetweenTwoPoint

            if ((IntermediereDist > MinDistBetweenTwoPoint) || (i == LatLng.length -1)){
                IntermediereDist = 0
                // Get elevation
                let ReponseGetElevationInterm = await PromiseGetElevation({ lat, lng })
                if(ReponseGetElevationInterm.Error){
                    Reponse.Error = true
                    Reponse.ErrorMsg = "GetElevation error : " + ReponseGetElevation.ErrorMsg
                    Reponse.Data = null
                    return resolve(Reponse)
                }
                let eleP = parseInt(ReponseGetElevationInterm.Data)

                AllElevation.push({ x: distance, y: eleP, coord:{lat:lat, long: lng}})
                // Get ElevationMin
                if (eleP < ElevationMin){
                    ElevationMin = eleP
                }
                // Get ElevationMax
                if (eleP > ElevationMax){
                    ElevationMax = eleP
                }
                // Get ElevationCumulP ElevationCumulM
                const Delta = eleP - ElevationPrevious
                if ((Delta)>0){
                    ElevationCumulP += Delta
                } else {
                    ElevationCumulM += Delta
                }
                ElevationPrevious = eleP
            }
        }
        Reponse.Error = false
        Reponse.ErrorMsg = null
        Reponse.Data = {AllElevation: AllElevation, InfoElevation: {ElevMax:ElevationMax, ElevMin:ElevationMin, ElevCumulP:ElevationCumulP, ElevCumulM:Math.abs(ElevationCumulM)}}
        return resolve(Reponse)
    })
}

/**
 * Get Elevation of a point
 */
function PromiseGetElevation({ lat, lng }){
    return new Promise ((resolve) => {
        let Reponse = {Error: true, ErrorMsg:"InitError PromiseGetElevation", Data:null}
        
        const tileset = new TileSet(path.resolve(__dirname, "TempHgt"))
        tileset.getElevation([lat, lng], (err, ele) => {
            if (!err){
                Reponse.Error = false
                Reponse.ErrorMsg = null
                Reponse.Data = ele.toFixed(0)
            } else {
                Reponse.Error = true
                Reponse.ErrorMsg = "PromiseGetElevation error : " + err
                Reponse.Data = null
            }
            resolve(Reponse)
        })
    })
}

function GeoJsonToGPX(GeoJsonData = null, Name= "Name", TheDate = Date.now(), Description = ""){
    let gpx = null
    
    GeoJsonData.features[0].properties.name = Name
    GeoJsonData.features[0].properties.desc = Description
    GeoJsonData.features[0].properties.time = TheDate
    gpx = togpx(GeoJsonData, 
        {
        creator: "GVK", 
        metadata: {name: Name, time: TheDate, desc: Description},
        featureTitle : ()=>{return Name}, 
        featureDescription : ()=>{return Description}
        })
    return (gpx)
}

module.exports.MinMaxGeoJsonTrack = MinMaxGeoJsonTrack
module.exports.CalculateTrackLength = CalculateTrackLength
module.exports.GetElevationOfGeoJson = GetElevationOfGeoJson
module.exports.GetElevationOfLatLng = GetElevationOfLatLng
module.exports.GeoJsonToGPX = GeoJsonToGPX