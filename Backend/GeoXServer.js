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
        this._MyApp.LogAppliInfo("SoApi GeoXServer Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "LoadData":
                this.LoadData(Data.Value, Socket, User, UserId)
                break
            default:
                this._MyApp.LogAppliError(`Api GeoXServer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("GeoXError", `Api GeoXServer error, Action ${Data.Action} not found`)
            break
        }
    }

    async LoadData(Value, Socket, User, UserId){
        // Build Tracks Data
        let Data = new Object()
        Data.ListOfTracks = []
        Data.CenterPoint = {Lat:50.709446, Long:4.543413}
        Data.Zoom = 8

        // Test save track in db
        //this.SaveTrackInDb("Rixensart",__dirname + '/Temp/2020-09-20-Rixensart.gpx',Socket, User, UserId)

        // Test Get Tracks
        //Data.ListOfTracks = this.GetTracksStatic()

        // Get Tracks
        let ReponseListOfTracks = await this.PromiseGetTracksFromDb()
        if(!ReponseListOfTracks.Error){
            Data.ListOfTracks = ReponseListOfTracks.Data
        } else {
            this._MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi PromiseGetTracksFromDb error")
        }

        // Calcul des point extérieur et du centre de toutes les tracks
        if (Data.ListOfTracks.length != 0){
            let MinMax = this.MinMaxOfTracks(Data.ListOfTracks)
            Data.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
            Data.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
            Data.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
        }
        // Send tracks
        Socket.emit("StartApp", Data)
        // Log socket action
        this._MyApp.LogAppliInfo("SoApi send StartApp", User, UserId)
    }

    /**
     * Calcul le lat et long min et max de toutes les tracks
     * @param {Array} ListOfTracks liste de toutes les tracks
     */
    MinMaxOfTracks(ListOfTracks){
        let reponse = new Object()
        reponse.MinLat = null
        reponse.MaxLat = null
        reponse.MinLong = null
        reponse.MaxLong = null
        ListOfTracks.forEach(element => {
            if(reponse.MinLat == null){
                reponse.MinLat = element.ExteriorPoint.MinLat
            } else {
                if(element.ExteriorPoint.MinLat < reponse.MinLat){reponse.MinLat = element.ExteriorPoint.MinLat}
            }
            if(reponse.MaxLat == null){
                reponse.MaxLat = element.ExteriorPoint.MaxLat
            } else {
                if(element.ExteriorPoint.MaxLat > reponse.MaxLat){reponse.MaxLat = element.ExteriorPoint.MaxLat}
            }
            if(reponse.MinLong == null){
                reponse.MinLong = element.ExteriorPoint.MinLong
            } else {
                if(element.ExteriorPoint.MinLong < reponse.MinLong){reponse.MinLong = element.ExteriorPoint.MinLong}
            }
            if(reponse.MaxLong == null){
                reponse.MaxLong = element.ExteriorPoint.MaxLong
            } else {
                if(element.ExteriorPoint.MaxLong > reponse.MaxLong){reponse.MaxLong = element.ExteriorPoint.MaxLong}
            }
        });
        return reponse
    }

    /**
     * Calcul les lat et long min et max d'une track contenue dans un object GeoJson
     * @param {geojson object} geojson Object GeaoJson d'une track
     */
    MinMaxGeoJsonTrack(geojson){
        let listofcoordonate = geojson.features[0].geometry.coordinates
        let MinLat1 = null
        let MaxLat1 = null
        let MinLong1 = null
        let MaxLong1 = null
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
        return {MinLat:MinLat1, MaxLat:MaxLat1, MinLong:MinLong1, MaxLong:MaxLong1}
    }

    /**
     * Sauve une track en DB a partir d'un fichier GPX
     * @param {String} TrackName Nom de la track
     * @param {String} FilePathandName Path et name du fichier GPX 
     * @param {Socket} Socket Socket
     * @param {String} User User
     * @param {String} UserId UserId
     */
    SaveTrackInDb(TrackName, FilePathandName, Socket, User, UserId){
        let GeoJson = this.ConvertGpxToGeoJson(FilePathandName)
        let TrackData = new Object()
        TrackData.Name = TrackName
        TrackData.ExteriorPoint = this.MinMaxGeoJsonTrack(GeoJson)
        TrackData.GeoJsonData = GeoJson
        TrackData.Date = new Date()

        //let DataToMongo = { [this._MongoTracksCollection.Track]: TrackData}
        let DataToMongo = TrackData
        this._Mongo.InsertOnePromise(DataToMongo, this._MongoTracksCollection.Collection).then((reponseCreation)=>{
            // ToDo Delete temp file
        },(erreur)=>{
            this._MyApp.LogAppliError("GeoXServerApi SaveTrackInDb DB error : " + erreur, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi SaveTrackInDb DB error")
        })
    }

    /**
     * Convertir un fichier GPX en GeoJson
     * @param {String} FilePathandName path et name du fichier Gpx
     */
    ConvertGpxToGeoJson(FilePathandName){
        var tj = require('@mapbox/togeojson')
        var fs = require('fs')
        var DOMParser = require('xmldom').DOMParser
        var Mygpx = new DOMParser().parseFromString(fs.readFileSync(FilePathandName, 'utf8'))
        var converted = tj.gpx(Mygpx)
        return converted
    }

    /**
     * Get Tracks from DB
     */
    PromiseGetTracksFromDb(){
        return new Promise(resolve => {
            let ReponseTracks = new Object()
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = ""
            ReponseTracks.Data = null
            const Querry = {}
            const Projection = { projection:{}}
            this._Mongo.FindPromise(Querry, Projection, this._MongoTracksCollection.Collection).then((reponse)=>{
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
                ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetTracksFromDb error: " + erreur
                ReponseTracks.Data = []
                resolve(ReponseTracks)
            })
        })
    }

    // Test
    // GetTracksStatic(){
    //     let ListOfTracks = []

    //     let GeoJson = this.ConvertGpxToGeoJson(__dirname + '/Temp/2020-09-20-Rixensart.gpx')
    //     let track1 = new Object()
    //     track1.Name = "Rix"
    //     track1.ExteriorPoint = this.MinMaxGeoJsonTrack(GeoJson)
    //     track1.GeoJsonData = GeoJson
    //     ListOfTracks.push(track1)

    //     var geojson2 = {
    //         "type": "FeatureCollection",
    //         "name": "routes",
    //         "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    //         "features": [{ 
    //             "type": "Feature", 
    //             "properties": { 
    //                 "name": "Chateau de la Hulpe", 
    //                 "type": "Route", 
    //                 "gpx_style_line": "<gpx_style:color>0000ff<\/gpx_style:color>" 
    //             }, 
    //             "geometry": { 
    //                 "type": "LineString", 
    //                 "coordinates": [ [ 4.543312, 50.709529 ], [ 4.543202, 50.709554 ], [ 4.543145, 50.709266 ], [ 4.542521, 50.709138 ], [ 4.541694, 50.709124 ], [ 4.540902, 50.708812 ], [ 4.539258, 50.709388 ], [ 4.539305, 50.709485 ], [ 4.539954, 50.709828 ], [ 4.539894, 50.709928 ], [ 4.539598, 50.71014 ], [ 4.538838, 50.711027 ], [ 4.538507, 50.711632 ], [ 4.537731, 50.711619 ], [ 4.537425, 50.711678 ], [ 4.53684, 50.712723 ], [ 4.536083, 50.713405 ], [ 4.535911, 50.713801 ], [ 4.535877, 50.714439 ], [ 4.534965, 50.714796 ], [ 4.534177, 50.714858 ], [ 4.533084, 50.714834 ], [ 4.53323, 50.715222 ], [ 4.533097, 50.715599 ], [ 4.532165, 50.716433 ], [ 4.53161, 50.717183 ], [ 4.531371, 50.717346 ], [ 4.531058, 50.717427 ], [ 4.531027, 50.718256 ], [ 4.531465, 50.720992 ], [ 4.530103, 50.720716 ], [ 4.52996, 50.720784 ], [ 4.529296, 50.721674 ], [ 4.529057, 50.722171 ], [ 4.529008, 50.722597 ], [ 4.528827, 50.722769 ], [ 4.527822, 50.723293 ], [ 4.527524, 50.72385 ], [ 4.525783, 50.72609 ], [ 4.524191, 50.727113 ], [ 4.524043, 50.727151 ], [ 4.523763, 50.727062 ], [ 4.523012, 50.726656 ], [ 4.521776, 50.726864 ], [ 4.520631, 50.727496 ], [ 4.518537, 50.728441 ], [ 4.516546, 50.729071 ], [ 4.514528, 50.729305 ], [ 4.514233, 50.729253 ], [ 4.51405, 50.729088 ], [ 4.513008, 50.729269 ], [ 4.512529, 50.729436 ], [ 4.512365, 50.72943 ], [ 4.511965, 50.729095 ], [ 4.511788, 50.729118 ], [ 4.509839, 50.730085 ], [ 4.508921, 50.73031 ], [ 4.508639, 50.730249 ], [ 4.508293, 50.730007 ], [ 4.507981, 50.730074 ], [ 4.506039, 50.731217 ], [ 4.503404, 50.731775 ], [ 4.501868, 50.731741 ], [ 4.501257, 50.731597 ], [ 4.496919, 50.731045 ], [ 4.494995, 50.730867 ], [ 4.491996, 50.729778 ], [ 4.490037, 50.729369 ], [ 4.489121, 50.729577 ], [ 4.488512, 50.729636 ], [ 4.485964, 50.72974 ], [ 4.485344, 50.729693 ], [ 4.48448, 50.729512 ], [ 4.483991, 50.729528 ], [ 4.4836, 50.7294 ], [ 4.482806, 50.729315 ], [ 4.482653, 50.729357 ], [ 4.482167, 50.729917 ], [ 4.482229, 50.730429 ], [ 4.482077, 50.730741 ], [ 4.481497, 50.731247 ], [ 4.480512, 50.73234 ], [ 4.479939, 50.732696 ], [ 4.478199, 50.733482 ], [ 4.476302, 50.734919 ], [ 4.474798, 50.735884 ], [ 4.473161, 50.73708 ], [ 4.472863, 50.737167 ], [ 4.472512, 50.737393 ], [ 4.472016, 50.737899 ], [ 4.471638, 50.737738 ], [ 4.469186, 50.735959 ], [ 4.467854, 50.735659 ], [ 4.466899, 50.734717 ], [ 4.466185, 50.734398 ], [ 4.465291, 50.734141 ], [ 4.463309, 50.733393 ], [ 4.461831, 50.733221 ], [ 4.460765, 50.733395 ], [ 4.460061, 50.73365 ], [ 4.459908, 50.733821 ], [ 4.459863, 50.734732 ], [ 4.459858, 50.73381 ], [ 4.460428, 50.733453 ], [ 4.461226, 50.733303 ], [ 4.462206, 50.733301 ], [ 4.46397, 50.733676 ], [ 4.466954, 50.734799 ], [ 4.467659, 50.735588 ], [ 4.468223, 50.735818 ], [ 4.469048, 50.735998 ], [ 4.469839, 50.736421 ], [ 4.47188, 50.737957 ], [ 4.471765, 50.738556 ], [ 4.472043, 50.738925 ], [ 4.473532, 50.739246 ], [ 4.474363, 50.739293 ], [ 4.474897, 50.739519 ], [ 4.47695, 50.740019 ], [ 4.477582, 50.740076 ], [ 4.479352, 50.740588 ], [ 4.480177, 50.740649 ], [ 4.481601, 50.740975 ], [ 4.482101, 50.740994 ], [ 4.482907, 50.740799 ], [ 4.484357, 50.739758 ], [ 4.484656, 50.739672 ], [ 4.485281, 50.7398 ], [ 4.485984, 50.73982 ], [ 4.486514, 50.740016 ], [ 4.488456, 50.740229 ], [ 4.489263, 50.740129 ], [ 4.491539, 50.739572 ], [ 4.491881, 50.739553 ], [ 4.493849, 50.739924 ], [ 4.49435, 50.739904 ], [ 4.494634, 50.739793 ], [ 4.496387, 50.738303 ], [ 4.49684, 50.738022 ], [ 4.497326, 50.738083 ], [ 4.497486, 50.738246 ], [ 4.497269, 50.738515 ], [ 4.497678, 50.738318 ], [ 4.499445, 50.736738 ], [ 4.500217, 50.736792 ], [ 4.500499, 50.736701 ], [ 4.508589, 50.733256 ], [ 4.509661, 50.733483 ], [ 4.5123, 50.732262 ], [ 4.513917, 50.731955 ], [ 4.514216, 50.731708 ], [ 4.513854, 50.730765 ], [ 4.515122, 50.730559 ], [ 4.518161, 50.730519 ], [ 4.519337, 50.7304 ], [ 4.521308, 50.729943 ], [ 4.522325, 50.729608 ], [ 4.524504, 50.729229 ], [ 4.524783, 50.729103 ], [ 4.52507, 50.72873 ], [ 4.524836, 50.728336 ], [ 4.524167, 50.727827 ], [ 4.523, 50.727398 ], [ 4.522598, 50.726945 ], [ 4.522659, 50.726761 ], [ 4.522905, 50.726658 ], [ 4.523475, 50.727027 ], [ 4.524096, 50.727194 ], [ 4.524343, 50.727113 ], [ 4.526061, 50.726061 ], [ 4.527121, 50.726466 ], [ 4.529642, 50.725843 ], [ 4.529719, 50.72575 ], [ 4.528879, 50.72466 ], [ 4.52849, 50.723811 ], [ 4.527858, 50.723107 ], [ 4.529378, 50.722554 ], [ 4.532204, 50.721311 ], [ 4.534013, 50.721652 ], [ 4.538848, 50.722765 ], [ 4.543059, 50.723624 ], [ 4.543788, 50.723836 ], [ 4.54409, 50.723842 ], [ 4.544006, 50.723553 ], [ 4.543347, 50.722721 ], [ 4.541583, 50.720989 ], [ 4.538807, 50.717964 ], [ 4.538332, 50.716888 ], [ 4.537752, 50.714727 ], [ 4.537846, 50.714441 ], [ 4.537757, 50.71407 ], [ 4.538331, 50.713616 ], [ 4.538923, 50.712361 ], [ 4.539606, 50.711959 ], [ 4.539214, 50.711813 ], [ 4.538877, 50.711873 ], [ 4.538782, 50.7118 ], [ 4.538864, 50.711531 ], [ 4.539331, 50.711288 ], [ 4.539736, 50.711205 ], [ 4.54069, 50.710837 ], [ 4.541316, 50.710798 ], [ 4.54222, 50.710937 ], [ 4.542517, 50.710707 ] ] 
    //             } 
    //         }]
    //     }
    //     let track2 = new Object()
    //     track2.Name = "course2"
    //     track2.ExteriorPoint = this.MinMaxGeoJsonTrack(geojson2)
    //     track2.GeoJsonData = geojson2
    //     ListOfTracks.push(track2)
    //     return ListOfTracks
    // }
  }
  
module.exports.GeoXServer = GeoXServer