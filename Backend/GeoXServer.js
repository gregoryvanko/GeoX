class GeoXServer{
    constructor(MyApp){
        this._MyApp = MyApp

        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)

        let MongoConfig = require("./MongoConfig.json")
        this._MongoTracksCollection = MongoConfig.TracksCollection
    }

    /**
     * Fonction executee lors d'un appel a la route GET PageOfPost
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetPageOfPost(req, res){
        let MyRouteGetPageOfPost = require("./RouteGetPageOfPost")
        MyRouteGetPageOfPost.CallRouteGetPageOfPost(req, res, this._MyApp)
    }

    /**
     * Fonction executee lors d'un appel a la route GET Home
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetHome(req, res){
        let MyRouteGetHome = require("./RouteGetHome")
        MyRouteGetHome.CallRouteGetHome(req, res, this._MyApp)
    }

    /**
     * Fonction executee lors d'un appel a la route GET getmap
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetMap(req, res){
        // https://dev.gregvanko.com/getmap/?trackid=5fc12c5ebe87dc3b01725bd1&trackid=5fc12c0abe87dc3b01725bcb
        let MyRouteGetMap = require("./RouteGetMap")
        MyRouteGetMap.CallRouteGetMap(req, res, this._MyApp)
    }

    /**
     * Fonction executee lors de l'action de delete d'un user   
     * @param {String} DeleteUsesrId Id du user que l'on suppprime
     * @param {String} DeleteUserLogin Login du user que l'on delete
     * @param {String} User Login du user qui execute l'action
     * @param {String} UserId Id du user qui execute l'action
     */
    OnDeleteUser(DeleteUsesrId, DeleteUserLogin, User, UserId){
        return new Promise((resolve, reject) => {
            let Query = { [this._MongoTracksCollection.Owner]: DeleteUserLogin }
            this._Mongo.DeleteByQueryPromise(Query, this._MongoTracksCollection.Collection).then((reponse)=>{
                this._MyApp.LogAppliInfo(`delete action done for the user with id: ${DeleteUsesrId} and login:${DeleteUserLogin}`, User, UserId)
                resolve()
            },(erreur)=>{
                this._MyApp.LogAppliError("Error during deleting track of the user: " + erreur, User, UserId)
                reject()
            })           
        })
    }

    GetSplashScreen(){
        let fs = require('fs')
        let HtmlString = fs.readFileSync(__dirname + "/SplashScreen.html", 'utf8')
        HtmlString = HtmlString.replace(/\r?\n|\r/g, " ")
        return HtmlString
    }
    
    ApiGetPostData(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetPostData " + JSON.stringify(Data), User, UserId)

        let MongoObjectId = require('@gregvanko/corex').MongoObjectId

        const Query = {'_id': new MongoObjectId(Data.PostId)}
        const Projection = { projection:{[this._MongoTracksCollection.GpxData]: 0, [this._MongoTracksCollection.Owner]: 0}}
        const Sort = {[this._MongoTracksCollection.Image]: -1}

        this._Mongo.FindSortPromise(Query, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data: reponse[0]})
            }
        },(erreur)=>{
            let ErrorMessage = "ApiGetPostData error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMessage, Data: []})
            this._MyApp.LogAppliError(ErrorMessage, User, UserId)
        })
    }

    ApiGetTrackData(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetTrackData: " + JSON.stringify(Data), User, UserId)

        let MongoObjectId = require('@gregvanko/corex').MongoObjectId

        let Pagination = false

        let Projection = {}
        let Querry = {}
        if (Data.GetData == "GPX"){
            Projection = { projection:{[this._MongoTracksCollection.GpxData]: 1}}
            Querry = {'_id': new MongoObjectId(Data.TrackId)}
        } else if (Data.GetData == "GeoJSon"){
            Projection = { projection:{[this._MongoTracksCollection.GeoJsonData]: 1}}
            Querry = {'_id': new MongoObjectId(Data.TrackId)}
        } else if (Data.GetData == "MultipleGeoJSon"){
            Projection = { projection:{[this._MongoTracksCollection.GeoJsonData]: 1, [this._MongoTracksCollection.Color]: 1}}
            Querry = {$or:[]}
            Data.ListOfTrackId.forEach(element => {
                Querry.$or.push({'_id':new MongoObjectId(element)})
            });
        } else if (Data.GetData  == "DrawTrack"){
            Projection = { projection:{[this._MongoTracksCollection.GeoJsonData]: 1, [this._MongoTracksCollection.Center]: 1, [this._MongoTracksCollection.ExteriorPoint]: 1}}
            Querry = {'_id': new MongoObjectId(Data.TrackId)}
        } else if (Data.GetData  == "AllGeoJsonOfOneGroup"){
            Projection = { projection:{[this._MongoTracksCollection.GeoJsonData]: 1, [this._MongoTracksCollection.Color]: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection._id]: 1}}
            Querry = {$and: [{[this._MongoTracksCollection.Group]: Data.Group},{[this._MongoTracksCollection.Owner]: User}]}
            Pagination = true
        }

        const Sort = {[this._MongoTracksCollection.Date]: -1}

        if (Pagination){
            let numberofitem = 5
            let cursor = Data.Page * numberofitem

            this._Mongo.FindSortLimitSkipPromise(Querry, Projection, Sort, numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
                if (Data.GetData  == "AllGeoJsonOfOneGroup"){
                    if(reponse.length == 0){
                        Res.json({Error: false, ErrorMsg: "", Data:[]})
                        this._MyApp.LogAppliInfo("AllGeoJsonOfOneGroup send to user", User, UserId)
                    } else {
                        Res.json({Error: false, ErrorMsg: "", Data:reponse})
                        this._MyApp.LogAppliInfo("AllGeoJsonOfOneGroup partially send to user", User, UserId)
                    }
                } else {
                    Res.json({Error: true, ErrorMsg: "GetData option not found", Data:""})
                }
            },(erreur)=>{
                let ErrorMsg = "ApiGetTrackData error: " + erreur
                Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
                this._MyApp.LogAppliError(ErrorMsg, User, UserId)
            })
        } else {
            this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
                if(reponse.length == 0){
                    this._MyApp.LogAppliError("ApiGetTrackData Track Id not found", User, UserId)
                    Res.json({Error: true, ErrorMsg: "ApiGetTrackData Track Id not found", Data: ""})
                } else {
                    if (Data.GetData == "GPX"){
                        Res.json({Error: false, ErrorMsg: "", Data: reponse[0][this._MongoTracksCollection.GpxData]})
                        this._MyApp.LogAppliInfo("GPX send to user", User, UserId)
                    } else if (Data.GetData == "GeoJSon"){
                        Res.json({Error: false, ErrorMsg: "", Data: reponse[0][this._MongoTracksCollection.GeoJsonData]})
                        this._MyApp.LogAppliInfo("GeoJSon send to user", User, UserId)
                    } else if (Data.GetData == "MultipleGeoJSon"){
                        Res.json({Error: false, ErrorMsg: "", Data: reponse})
                        this._MyApp.LogAppliInfo("MultipleGeoJSon send to user", User, UserId)
                    } else if (Data.GetData  == "DrawTrack"){
                        Res.json({Error: false, ErrorMsg: "", Data: reponse[0]})
                        this._MyApp.LogAppliInfo("DrawTrack send to user", User, UserId)
                    } else {
                        Res.json({Error: true, ErrorMsg: "GetData option not found", Data:""})
                    }
                }
            },(erreur)=>{
                this._MyApp.LogAppliError("ApiGetTrackData DB error : " + erreur, User, UserId)
                Res.json({Error: true, ErrorMsg: "ApiGetTrackData DB error ", Data: ""})
            })
        }
        
    }

    ApiGetAllGroups(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllGroups", User, UserId)

        const Querry = {[this._MongoTracksCollection.Owner]: User}
        const Projection = { projection:{[this._MongoTracksCollection.Group]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
            let DataToSend = []
            // Find all different group
            if (reponse.length > 0){
                DataToSend = [...new Set(reponse.map(item => item.Group))] 
            }
            Res.json({Error: false, ErrorMsg: null, Data: DataToSend})
        },(erreur)=>{
            let ErrorMessage = "ApiGetAllGroups error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMessage, Data: []})
            this._MyApp.LogAppliError(ErrorMessage, User, UserId)
        })
    }

    ApiGetAllPostMarkers(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllPostMarkers " + JSON.stringify(Data), User, UserId)

        let numberofitem = 10
        let cursor = Data.Page * numberofitem

        let Query = null
        if(Data.AllPublicPost){
            console.log("activites")
            Query = (Data.Filter)? this.FilterTracks(Data.Filter, User, Data.AllPublicPost) : {[this._MongoTracksCollection.Public]: true}
        } else {
            console.log("my tracks")
            Query = (Data.Filter)? this.FilterTracks(Data.Filter, User, Data.AllPublicPost) : {[this._MongoTracksCollection.Owner]: User}
        }

        const Projection = {projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection.Description]: 1, [this._MongoTracksCollection.InfoElevation]: 1, [this._MongoTracksCollection.StartPoint]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}
        
        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "", Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: "", Data:reponse})
            }
        },(erreur)=>{
            Res.json({Error: true, ErrorMsg: "ApiGetAllPostMarkers error: " + erreur, Data: ""})
            this._MyApp.LogAppliError("ApiGetAllPostMarkers error: " + erreur, User, UserId)
        })
    }

    ApiGetAllMyTracks(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllMyTracks: " + JSON.stringify(Data), User, UserId)

        let numberofitem = 10
        let cursor = Data.Page * numberofitem

        let Query = (Data.Filter)? this.FilterTracks(Data.Filter, User, false) : {[this._MongoTracksCollection.Owner]: User}
        const Projection = { projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection.Public]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort,numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data:reponse})
            }
        },(erreur)=>{
            let ErrorMsg = "ApiGetAllMyTracks error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        })
    }

    ApiGetAllPost(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllPost " + JSON.stringify(Data), User, UserId)

        let numberofitem = 5
        let cursor = Data.Page * numberofitem

        let Query = null
        if(Data.AllPublicPost){
            Query = (Data.Filter)? this.FilterTracks(Data.Filter, User, Data.AllPublicPost) : {[this._MongoTracksCollection.Public]: true}
        } else {
            Query = (Data.Filter)? this.FilterTracks(Data.Filter, User, Data.AllPublicPost) : {[this._MongoTracksCollection.Owner]: User}
        }
        const Projection = {projection:{[this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection.Description]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.InfoElevation]: 1, [this._MongoTracksCollection.Image]: 1, [this._MongoTracksCollection.StartPoint]: 1, [this._MongoTracksCollection.Public]: 1, [this._MongoTracksCollection.Color]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "", Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: "", Data:reponse})
            }
        },(erreur)=>{
            let ErrorMsg = "ApiGetAllPost error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        })
    }

    async ApiManageTrack (Data, Res, User, UserId){
        let ManageTrack = require("./ManageTrack")
        if (Data.Action == "Add"){
            let ReponseAddTrack = await ManageTrack.PromiseAddTrack(Data.TrackData, this._MyApp, User)
            if(ReponseAddTrack.Error){
                this._MyApp.LogAppliError(ReponseAddTrack.ErrorMsg, User, UserId)
                Res.status("500").json(ReponseAddTrack)
            } else {
                Res.status("200").json(ReponseAddTrack)
                if (Data.TrackData.Id != null){
                    this._MyApp.LogAppliInfo("Track updated from a created track", User, UserId)
                } else {
                    this._MyApp.LogAppliInfo("New track saved", User, UserId)
                }
            }
        } else if (Data.Action == "Modify"){
            this._MyApp.LogAppliInfo("ApiManageTrack: " + JSON.stringify(Data), User, UserId)
            let ReponseModifyTrack = await ManageTrack.PromiseUpdateTrack(Data.TrackData, this._MyApp, User)
            if(ReponseModifyTrack.Error){
                this._MyApp.LogAppliError(ReponseModifyTrack.ErrorMsg, User, UserId)
                Res.status("500").json(ReponseModifyTrack)
            } else {
                Res.status("200").json(ReponseModifyTrack)
                this._MyApp.LogAppliInfo("Track data updated", User, UserId)
            }
        } else if (Data.Action == "Delete"){
            this._MyApp.LogAppliInfo("ApiManageTrack: " + JSON.stringify(Data), User, UserId)
            let ReponseDelTrack = await ManageTrack.PromiseDeleteTrack(Data.TrackId, this._MyApp, User)
            if(ReponseDelTrack.Error){
                this._MyApp.LogAppliError(ReponseDelTrack.ErrorMsg, User, UserId)
                Res.status("500").json(ReponseDelTrack)
            } else {
                Res.status("200").json(ReponseDelTrack)
                this._MyApp.LogAppliInfo("Track Deleted", User, UserId)
            }
        } else if (Data.Action == "CopyTrack"){
            this._MyApp.LogAppliInfo("ApiManageTrack: " + JSON.stringify(Data), User, UserId)
            let ReponseCopyTrack = await ManageTrack.PromiseCopyTrack(Data.CopyTrackData, this._MyApp, User)
            if(ReponseCopyTrack.Error){
                this._MyApp.LogAppliError(ReponseCopyTrack.ErrorMsg, User, UserId)
                Res.status("500").json(ReponseCopyTrack)
            } else {
                Res.status("200").json(ReponseCopyTrack)
                this._MyApp.LogAppliInfo("Track Copied", User, UserId)
            }
        } else {
            Res.status("500").json("ApiManageTrack => Action not found: " + Data.Action)
        }
    }

    FilterTracks(Filter, User, AllPublicPost){
        // Query de base
        let Query = null
        if (AllPublicPost){
            Query = {$and:[
                {[this._MongoTracksCollection.Public]: true}
            ]}
        } else {
            Query = {$and:[
                {[this._MongoTracksCollection.Owner]: User}
            ]}
        }

        // DistanceMin
        if (Filter.DistanceMin){
            Query.$and.push({[this._MongoTracksCollection.Length]:{$gte: Filter.DistanceMin}})
        }
        // DistanceMax
        if (Filter.DistanceMax){
            Query.$and.push({[this._MongoTracksCollection.Length]:{$lte: Filter.DistanceMax}})
        }
        // HideMyTrack
        if (Filter.HideMyTrack){
            Query.$and.push({[this._MongoTracksCollection.Owner]: { $ne: User }})
        }
        // Group
        if ((Filter.Group != undefined) && (Filter.Group != "")){
            Query.$and.push({[this._MongoTracksCollection.Group]: Filter.Group})
        }

        return Query 
    }

    async ApiGetElavation(Data, Res, User, UserId){
        //this._MyApp.LogAppliInfo("ApiGetElavation", User, UserId)
        const ElevationData = await this.GetElevationOfLatLng(Data)
        Res.json({Error: false, ErrorMsg: null, Data:ElevationData})
    }

    ApiGetDataFromApi(Data, Res, User, UserId){
        let me = this
        const axios = require('axios')
        //this._MyApp.LogAppliInfo("ApiGetDataFromApi " + JSON.stringify(Data), User, UserId)
        if(Data.Api == "www.odwb.be"){
            axios.get(`https://www.odwb.be/api/records/1.0/search/?dataset=code-postaux-belge&q=${Data.Input}`)
            .then((response) => {
                Res.json({Error: false, ErrorMsg: "", Data:response.data})
            })
            .catch((error) => {
                let ErrorMsg = `ApiGetDataFromApi error: ${error}`
                Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
                me._MyApp.LogAppliError(ErrorMsg, User, UserId)
            })
        } else if (Data.Api == "datanova.laposte.fr"){
            axios.get(`https://datanova.laposte.fr/api/records/1.0/search/?dataset=laposte_hexasmal&q=${Data.Input}`)
            .then((response) => {
                Res.json({Error: false, ErrorMsg: "", Data:response.data})
            })
            .catch((error) => {
                let ErrorMsg = `ApiGetDataFromApi error: ${error}`
                Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
                me._MyApp.LogAppliError(ErrorMsg, User, UserId)
            })
        } else if (Data.Api == "routing.openstreetmap.de"){
            axios.get(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${Data.Input.PointA.lng},${Data.Input.PointA.lat};${Data.Input.PointB.lng},${Data.Input.PointB.lat}?steps=true&geometries=geojson`)
            .then((response) => {
                Res.json({Error: false, ErrorMsg: "", Data:response.data})
            })
            .catch((error) => {
                let ErrorMsg = `ApiGetDataFromApi error: ${error}`
                Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
                me._MyApp.LogAppliError(ErrorMsg, User, UserId)
            })
        } else {
            let ErrorMsg = `ApiGetDataFromApi error: unknown API ${Data.Api}`
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        }
    }

    // Admin
    ApiAdminGetAllTracks(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiAdminGetAllTracks: " + JSON.stringify(Data), User, UserId)

        let numberofitem = 10
        let cursor = Data.Page * numberofitem

        let Query = (Data.Filter)? this.FilterForAdminTracks(Data.Filter) : {}
        const Projection = { projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.Owner]: 1, [this._MongoTracksCollection.Public]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort,numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data:reponse})
            }
        },(erreur)=>{
            let ErrorMsg = "ApiAdminGetAllTracks error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        })
    }

    ApiAdminGetPostData(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiAdminGetPostData " + JSON.stringify(Data), User, UserId)

        let MongoObjectId = require('@gregvanko/corex').MongoObjectId

        const Query = {'_id': new MongoObjectId(Data.PostId)}
        const Projection = { projection:{[this._MongoTracksCollection.GpxData]: 0, [this._MongoTracksCollection.Owner]: 0}}
        const Sort = {[this._MongoTracksCollection.Image]: -1}

        this._Mongo.FindSortPromise(Query, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data: reponse[0]})
            }
        },(erreur)=>{
            let ErrorMessage = "ApiAdminGetPostData error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMessage, Data: []})
            this._MyApp.LogAppliError(ErrorMessage, User, UserId)
        })
    }

    FilterForAdminTracks(Filter){
        // Query de base
        let Query = {$and:[]}

        // DistanceMin
        if (Filter.DistanceMin){
            Query.$and.push({[this._MongoTracksCollection.Length]:{$gte: Filter.DistanceMin}})
        }
        // DistanceMax
        if (Filter.DistanceMax){
            Query.$and.push({[this._MongoTracksCollection.Length]:{$lte: Filter.DistanceMax}})
        }
        return Query 
    }

    // Common function

    async GetElevationOfLatLng(LatLng){
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
        let ele = await this.PromiseGetElevation({ lat, lng })
        ele = parseInt(ele)
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
                let eleP = await this.PromiseGetElevation({lat, lng})
                eleP = parseInt(eleP)
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
        return {AllElevation: AllElevation, InfoElevation: {ElevMax:ElevationMax, ElevMin:ElevationMin, ElevCumulP:ElevationCumulP, ElevCumulM:Math.abs(ElevationCumulM)}}
    }

    /**
     * Get Elevation of a point
     */
    PromiseGetElevation({ lat, lng }){
        return new Promise ((resolve, reject) => {
            const path = require('path')
            let fs = require('fs')
            var dir = path.resolve(__dirname, "TempHgt")
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
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
}
module.exports.GeoXServer = GeoXServer