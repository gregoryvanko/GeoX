const LogError = require("@gregvanko/nanox").NanoXLogError
//const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const LogStatApi = require("@gregvanko/nanox").NanoXLogStatApi
const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
const francejson = require('../Data/fance2025.json');
const francejsondata = francejson.data

const axios = require('axios')

router.post("/", AuthBasic, async (req, res) => {
    LogStatApi("externalapi", "post", req.user)

    const Data = req.body
    if (JSON.stringify(Data) != "{}"){
        if(Data.Api == "www.odwb.be"){
            axios.get(`https://www.odwb.be/api/records/1.0/search/?dataset=code-postaux-belge&q=${Data.Input}`)
            .then((response) => {
                res.json(response.data)
            })
            .catch((error) => {
                let ErrorMsg = `Route /externalapi POST www.odwb.be error: ${error}`
                res.status(500).send(ErrorMsg)
                LogError(ErrorMsg, req.user)
            })
        } else if (Data.Api == "francejson"){
            let resultfrance = francejsondata.filter(ville => ville.nom_standard.startsWith(Data.Input))
            let longeur = resultfrance.length
            if (resultfrance.length > 10){
                longeur = 10
            }
            let result = []
            for (let index = 0; index < longeur; index++) {
                const element = resultfrance[index];
                let reponse = new Object
                reponse.nom_standard = element.nom_standard
                //reponse.lat = element.latitude_centre
                reponse.lat = element.latitude_mairie
                //reponse.long = element.longitude_centre
                reponse.long = element.longitude_mairie
                result.push(reponse)
            }
            res.json(result)
            
        } else if (Data.Api == "datanova.laposte.fr"){
            axios.get(`https://datanova.laposte.fr/api/records/1.0/search/?dataset=laposte_hexasmal&q=${Data.Input}`)
            .then((response) => {
                res.json(response.data)
            })
            .catch((error) => {
                let ErrorMsg = `Route /externalapi POST datanova.laposte.fr error: ${error}`
                res.status(500).send(ErrorMsg)
                LogError(ErrorMsg, req.user)
            })
        } else if (Data.Api == "routing.openstreetmap.de"){
            const url = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${Data.Input.PointA.lng},${Data.Input.PointA.lat};${Data.Input.PointB.lng},${Data.Input.PointB.lat}?steps=true&geometries=geojson`
            //const url = `http://router.project-osrm.org/route/v1/foot/${Data.Input.PointA.lng},${Data.Input.PointA.lat};${Data.Input.PointB.lng},${Data.Input.PointB.lat}?steps=true&geometries=geojson`
            axios.get(url)
            .then((response) => {
                res.json(response.data)
            })
            .catch((error) => {
                let ErrorMsg = `Route /externalapi POST routing.openstreetmap.de error: ${error}`
                res.status(500).send(ErrorMsg)
                LogError(ErrorMsg, req.user)
            })
        } else {
            let ErrorMsg = `Route /externalapi POST unknown API`
            res.status(500).send(ErrorMsg)
            LogError(ErrorMsg, req.user)
        }
    } else {
        const TheError = `Route /externalapi POST error: Data not found in req`
        res.status(500).send(TheError)
        LogError(TheError, req.user)
    }
})

module.exports = router