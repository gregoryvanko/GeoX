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

    ApiGetAllPost(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllPost: " + JSON.stringify(Data), User, UserId)

        let numberofitem = 5
        let cursor = Data.Page * numberofitem

        let Query = (Data.Filter)? this.FilterForPublicTracks(Data.Filter, User) : {[this._MongoTracksCollection.Public]: true}
        const Projection = {projection:{[this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection.Description]: 1, [this._MongoTracksCollection.InfoElevation]: 1, [this._MongoTracksCollection.Image]: 1, [this._MongoTracksCollection.StartPoint]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data:reponse})
            }
        },(erreur)=>{
            let ErrorMessage = "ApiGetAllPost error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMessage, Data: []})
            this._MyApp.LogAppliError(ErrorMessage, User, UserId)
        })
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
        }

        const Sort = {[this._MongoTracksCollection.Date]: -1}

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
                }
            }
        },(erreur)=>{
            this._MyApp.LogAppliError("ApiGetTrackData DB error : " + erreur, User, UserId)
            Res.json({Error: true, ErrorMsg: "ApiGetTrackData DB error ", Data: ""})
        })
    }

    ApiCopyTrack(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiCopyTrack: " + JSON.stringify(Data), User, UserId)

        let MongoObjectId = require('@gregvanko/corex').MongoObjectId

        const Querry = {'_id': new MongoObjectId(Data.TrackId)}
        const Projection = {projection:{_id: 0}}

        this._Mongo.FindPromise(Querry, Projection, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 1){
                // Copy de la track
                let TrackData = reponse[0]
                // Modification de la track
                TrackData.Name = Data.Name
                TrackData.Group = Data.Group
                TrackData.Public = Data.Public
                TrackData.Description = Data.Description
                TrackData.Color = "#0000FF"
                TrackData.Date = new Date()
                TrackData.Owner = User
                this._Mongo.InsertOnePromise(TrackData, this._MongoTracksCollection.Collection).then((reponseCreation)=>{
                    Res.json({Error: false, ErrorMsg: "", Data:"Done"})
                    this._MyApp.LogAppliInfo("ApiCopyTrack: Track:" + Data.TrackId + " is saved", User, UserId)
                },(erreur)=>{
                    Res.json({Error: true, ErrorMsg: "ApiCopyTrack inster track error", Data: ""})
                    this._MyApp.LogAppliError("ApiCopyTrack inster track error: " + erreur, User, UserId)
                })
            } else {
                this._MyApp.LogAppliError("ApiCopyTrack Track id not found", User, UserId)
                Res.json({Error: true, ErrorMsg: "ApiCopyTrack Track id not found", Data: ""})
            }
        },(erreur)=>{
            this._MyApp.LogAppliError("ApiCopyTrack get track data error: " + erreur, User, UserId)
            Res.json({Error: true, ErrorMsg: "ApiCopyTrack get track data error", Data: ""})
        })
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

        let Query = (Data.Filter)? this.FilterForPublicTracks(Data.Filter, User) : {[this._MongoTracksCollection.Public]: true}
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

        let Query = (Data.Filter)? this.FilterForMyTracks(Data.Filter, User) : {[this._MongoTracksCollection.Owner]: User}
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

    ApiGetAllMyTracksMarkers(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllMyTracksMarkers " + JSON.stringify(Data), User, UserId)

        let numberofitem = 10
        let cursor = Data.Page * numberofitem

        let Query = (Data.Filter)? this.FilterForMyTracks(Data.Filter, User) : {[this._MongoTracksCollection.Owner]: User}
        const Projection = {projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection.Description]: 1, [this._MongoTracksCollection.InfoElevation]: 1, [this._MongoTracksCollection.StartPoint]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "", Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: "", Data:reponse})
            }
        },(erreur)=>{
            let ErrorMsg = "ApiGetAllMyTracksMarkers error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        })
    }

    ApiGetAllMyPost(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllMyPost " + JSON.stringify(Data), User, UserId)

        let numberofitem = 5
        let cursor = Data.Page * numberofitem

        let Query = (Data.Filter)? this.FilterForMyTracks(Data.Filter, User) : {[this._MongoTracksCollection.Owner]: User}
        const Projection = {projection:{[this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.Length]: 1, [this._MongoTracksCollection.Description]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.InfoElevation]: 1, [this._MongoTracksCollection.Image]: 1, [this._MongoTracksCollection.StartPoint]: 1, [this._MongoTracksCollection.Public]: 1, [this._MongoTracksCollection.Color]: 1}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "", Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: "", Data:reponse})
            }
        },(erreur)=>{
            let ErrorMsg = "ApiGetAllMyPost error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        })
    }

    async ApiManageTrack (Data, Res, User, UserId){
        let Shared = require("./Shared")
        if (Data.Action == "Add"){
            let ReponseAddTrack = await Shared.PromiseAddTrack(Data.TrackData, this._MyApp, User)
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
            let ReponseModifyTrack = await Shared.PromiseUpdateTrack(Data.TrackData, this._MyApp, User)
            if(ReponseModifyTrack.Error){
                this._MyApp.LogAppliError(ReponseModifyTrack.ErrorMsg, User, UserId)
                Res.status("500").json(ReponseModifyTrack)
            } else {
                Res.status("200").json(ReponseModifyTrack)
                this._MyApp.LogAppliInfo("Track data updated", User, UserId)
            }
        } else if (Data.Action == "Delete"){
            this._MyApp.LogAppliInfo("ApiManageTrack: " + JSON.stringify(Data), User, UserId)
            let ReponseDelTrack = await Shared.PromiseDeleteTrack(Data.TrackId, this._MyApp, User)
            if(ReponseDelTrack.Error){
                this._MyApp.LogAppliError(ReponseDelTrack.ErrorMsg, User, UserId)
                Res.status("500").json(ReponseDelTrack)
            } else {
                Res.status("200").json(ReponseDelTrack)
                this._MyApp.LogAppliInfo("Track Deleted", User, UserId)
            }
        } else {
            Res.status("500").json("ApiManageTrack => Action not found: " + Data.Action)
        }
    }

    FilterForMyTracks(Filter, User){
        // Query de base
        let Query = {$and:[
            {[this._MongoTracksCollection.Owner]: User}
        ]}

        // DistanceMin
        if (Filter.DistanceMin){
            Query.$and.push({[this._MongoTracksCollection.Length]:{$gte: Filter.DistanceMin}})
        }
        // DistanceMax
        if (Filter.DistanceMax){
            Query.$and.push({[this._MongoTracksCollection.Length]:{$lte: Filter.DistanceMax}})
        }

        // DistanceMax
        if ((Filter.Group != undefined) && (Filter.Group != "")){
            Query.$and.push({[this._MongoTracksCollection.Group]: Filter.Group})
        }

        return Query 
    }

    FilterForPublicTracks(Filter, User){
        // Query de base
        let Query = {$and:[
            {[this._MongoTracksCollection.Public]: true}
        ]}

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
        return Query 
    }

    async ApiGetElavation(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetElavation", User, UserId)
        const ElevationData = await this.GetElevationOfLatLng(Data)
        Res.json({Error: false, ErrorMsg: null, Data:ElevationData})
    }

    ApiGetAllGeoJsonOfGroup(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllGeoJsonOfGroup " + JSON.stringify(Data), User, UserId)

        const Querry = {$and: [{[this._MongoTracksCollection.Group]: Data},{[this._MongoTracksCollection.Owner]: User}]}
        const Projection = { projection:{[this._MongoTracksCollection.GpxData]: 0}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}

        this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: true, ErrorMsg: "Group exist but without one track", Data:""})
            } else {
                Res.json({Error: false, ErrorMsg: "", Data:reponse})
            }
        },(erreur)=>{
            let ErrorMsg = "ApiGetAllGeoJsonOfGroup error: " + erreur
            Res.json({Error: true, ErrorMsg: ErrorMsg, Data: ""})
            this._MyApp.LogAppliError(ErrorMsg, User, UserId)
        })
    }

    // Admin
    ApiAdminGetAllMyTracks(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiAdminGetAllMyTracks: " + JSON.stringify(Data), User, UserId)

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
            let ErrorMsg = "ApiAdminGetAllMyTracks error: " + erreur
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
}
module.exports.GeoXServer = GeoXServer