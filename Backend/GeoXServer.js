class GeoXServer{
    constructor(MyApp){
        this._MyApp = MyApp

        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)

        let MongoConfig = require("./MongoConfig.json")
        this._MongoTracksCollection = MongoConfig.TracksCollection
    }
  
    /**
    * Socket API de la page TheWhatsBook
    * @param {Object} Data Object envoyé par SocketIO : Data.Action, Data.Value
    * @param {Socket} Socket SocketIO
    * @param {String} User Nom du user
    * @param {String} UserId Id du user
    */
    Api(Data, Socket, User, UserId){
        // On Log tout sauve quand on fait un Add Track
        if ((Data.Value.Action != "SaveTrack") && (Data.Value.Action != "Add") && (Data.Value.Action != "GetElevation") && (Data.Value.Action != "ModifyDB")){
            this._MyApp.LogAppliInfo("SoApi Data: " + JSON.stringify(Data), User, UserId)
        } else {
            this._MyApp.LogAppliInfo(`SoApi Data: {"Action":"${Data.Action}","Value":{"Action":"${Data.Value.Action}"}}`, User, UserId)
        }
        switch (Data.Action) {
            case "CreateTracksOnMap":
                let CreateTracksOnMap = require('./ModuleCreateTracksOnMap.js')
                if (Data.Value.Action == "GetUserGroup"){
                    CreateTracksOnMap.CallGetUserGroup(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetMapData"){
                    CreateTracksOnMap.CallGetMapData(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "SaveTrack"){
                    CreateTracksOnMap.CallSaveTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTrackData"){
                    CreateTracksOnMap.CallGetTrackData(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetElevation"){
                    CreateTracksOnMap.CallGetElevation(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`)
                }
                break
            default:
                this._MyApp.LogAppliError(`Api GeoXServer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("GeoXError", `Api GeoXServer error, Action ${Data.Action} not found`)
            break
        }
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

    async ApiGetAllGroups(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllGroups", User, UserId)

        let Shared = require("./Shared")
        let ReponseUserGroup = await Shared.PromiseGetUserGroup(this._MyApp, User)
        if(!ReponseUserGroup.Error){
            Res.json({Error: false, ErrorMsg: "", Data:ReponseUserGroup.Data})
        } else {
            Res.json({Error: true, ErrorMsg: "ApiGetAllGroups error: " + ReponseUserGroup.ErrorMsg, Data: ""})
            this._MyApp.LogAppliError("ApiGetAllGroups error: " + ReponseUserGroup.ErrorMsg, User, UserId)
        }
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
                this._MyApp.LogAppliInfo("New track saved from a Added track", User, UserId)
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
}
module.exports.GeoXServer = GeoXServer