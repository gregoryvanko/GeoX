class GeoX{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
        // App en full screen 
        this._DivApp.style.padding = "0%"
        this._DivApp.style.margin = "0% AUTO"
        // const
        this._NameLoadViewMap = "LoadViewMap"
        this._NameLoadViewManageTracks = "LoadViewManageTracks"
        this._NameLoadViewCreateTrack = "LoadViewCreateTrack"
        this._NameLoadViewSearchTracksOnMap = "LoadViewSearchTracksOnMap"
        // Current view
        this._CurrentView = this._NameLoadViewMap
        // App Data
        this._GeoXData = []
        // Welcome Screen
        this._WelcomeScreen = null
        // Map
        this._MyGeoXMap = null
        // Manage Tracks
        this._MyGeoXManageTracks = null
        // Create Track
        this._MyGeoXCreateTrack  = null
        // Search Tracks On Map
        this._MyGeoXSearchTracksOnMap = null
    }

    /** Initiation de l'application */
    Initiation(){
        // Create WelcomeScreen
        this._WelcomeScreen = new GeoXWelcome(this._DivApp)
        // Create map
        this._MyGeoXMap = new GeoXMap(this._DivApp)
        // Create GeoXManageTracks
        this._MyGeoXManageTracks = new GeoXManageTracks(this._DivApp)
        // Create GeoXCreateTrack
        this._MyGeoXCreateTrack = new GeoXCreateTrack(this._DivApp)
        // Create GeoXSearchTracksOnMap
        this._MyGeoXSearchTracksOnMap = new GeoXSearchTracksOnMap(this._DivApp)
        // SocketIo Listener
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('StartApp', (Value) => {
            this._GeoXData = Value.Data
            if(this._GeoXData.AppData.length == 0){
                // Show Welcome screen
                this.LoadWelcomeScreen()
            } else {
                // Show App
                if (Value.StartView == this._NameLoadViewMap){
                    this.LoadViewMap()
                } else if (Value.StartView == this._NameLoadViewManageTracks){
                    this.LoadViewManageTracks()
                } else if (Value.StartView == this._NameLoadViewCreateTrack){
                    this.LoadViewCreateTracks()
                } else {
                    this.Error("Start view not find: " + Value.StartView)
                }
            }
        })
        SocketIo.on('ModifyTracksOnMap', (Value) => {
            this.ModifyTracksOnMap(Value)
        })
        SocketIo.on('DownloadFile', (Value) => {
            var link = document.createElement('a')
            link.download = 'Track.' + Value.Type
            var blob = new Blob([Value.File], {typde: 'text/plain'})
            link.href = window.URL.createObjectURL(blob)
            link.click()
        })
        SocketIo.on('SearchTracksOnMap', (Value) => {this._MyGeoXSearchTracksOnMap.MessageRecieved(Value)})

        // Build view Get App Data
        this.LoadViewGetAppData()
        //this.LoadViewSearchTracksOnMap()
    }
    
    /** Clear view */
    ClearView(){
        // Delete map if existe on MyGeoXMap
        if (this._MyGeoXMap){
            this._MyGeoXMap.DeleteMap()
        }
        // Delete map if existe on MyGeoXCreateTrack
        if (this._MyGeoXCreateTrack){
            this._MyGeoXCreateTrack.DeleteMap()
        }
        // Delete map if existe on MyGeoXSearchTracksOnMap
        if (this._MyGeoXSearchTracksOnMap){
            this._MyGeoXSearchTracksOnMap.DeleteMap()
        }
        // Clear Global action
        GlobalClearActionList()
        GlobalAddActionInList("Find tracks in GeoX", this.LoadViewSearchTracksOnMap.bind(this))
        GlobalAddActionInList("View My Tracks", this.LoadViewGetAppData.bind(this))
        GlobalAddActionInList("Manage My Tracks", this.LoadViewManageTracks.bind(this))
        GlobalAddActionInList("Add Track form file", this.LoadViewAddTracks.bind(this))
        GlobalAddActionInList("Create Track", this.LoadViewCreateTracks.bind(this))
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear view
        this._DivApp.innerHTML=""
    }

    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
    Error(ErrorMsg){
        // Clear view
        this.ClearView()
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red"))
    }

    /** Load des Data de l'application */
    LoadViewGetAppData(){
        this.ClearView()
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center; margin-top: 10vh;"))
        // Send status to serveur
        GlobalSendSocketIo("GeoX", "LoadAppData", this._NameLoadViewMap )
    }

    LoadWelcomeScreen(){
        this.ClearView()
        // Load view Welcome screen
        this._WelcomeScreen.LoadWelcomeView(this.LoadViewSearchTracksOnMap.bind(this), this.LoadViewAddTracks.bind(this), this.LoadViewCreateTracks.bind(this))
    }

    /** Ouvre la vue Map */
    LoadViewMap(){
        this._CurrentView = this._NameLoadViewMap
        // Clear view
        this.ClearView()
        // Load view map
        this._MyGeoXMap.LoadViewMap(this._GeoXData)
    }

    /** Ouvre la vue Map avec des data*/
    ModifyTracksOnMap(Data){
        if (this._CurrentView == this._NameLoadViewMap){
            // change view map
            this._MyGeoXMap.ModifyTracksOnMap(Data)
        } else if (this._CurrentView == this._NameLoadViewCreateTrack){
            // change view create track
            this._MyGeoXCreateTrack.ModifyTracksOnMap(Data)
        } else {
            this.Error("ModifyTracksOnMap view not find: " + this._CurrentView)
        }
    }

    /** Ouvre la vue Manage track */
    LoadViewManageTracks(){
        this._CurrentView = this._NameLoadViewManageTracks
        // Clear view
        this.ClearView()
        // Build view
        this._MyGeoXManageTracks.LoadViewManageTracks(this._GeoXData, this._CurrentView)
    }

    /** Ouverture de la vue Add Track */
    LoadViewAddTracks(){
        this._CurrentView = this._NameLoadViewMap
        // Clear view
        this.ClearView()
        // Build view waiting data of manage track
        this._MyGeoXManageTracks.LoadViewAddTrack(this._GeoXData.AppGroup, this._CurrentView)
    }

    LoadViewCreateTracks(){
        this._CurrentView = this._NameLoadViewCreateTrack
        // Clear view
        this.ClearView()
        // Load view map
        this._MyGeoXCreateTrack.Start(this._GeoXData)
    }

    LoadViewSearchTracksOnMap(){
        this._CurrentView = this._NameLoadViewSearchTracksOnMap
        // Clear view
        this.ClearView()
        // Build view 
        this._MyGeoXSearchTracksOnMap.LoadView(this._CurrentView)
    }

    /** Get Titre de l'application */
    GetTitre(){return "GeoX"}
    /** Get Img Src de l'application */
    GetImgSrc(){
    return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNjQwLjAwMDAwMHB0IiBoZWlnaHQ9IjEyODAuMDAwMDAwcHQiIHZpZXdCb3g9IjAgMCA2NDAuMDAwMDAwIDEyODAuMDAwMDAwIgogcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+CjxtZXRhZGF0YT4KQ3JlYXRlZCBieSBwb3RyYWNlIDEuMTUsIHdyaXR0ZW4gYnkgUGV0ZXIgU2VsaW5nZXIgMjAwMS0yMDE3CjwvbWV0YWRhdGE+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDEyODAuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNMzA3MyAxMDk1NyBsLTI5MTIgLTE4NDIgLTEgLTgwIDAgLTgwIDM3MSAtNjQ1IGMyMDMgLTM1NSA0NTQgLTc5MAo1NTYgLTk2OCBsMTg1IC0zMjMgNDQyIDIyNSBjMzc2IDE5MSAxMzE1IDY2NCAxMzM5IDY3NCA0IDIgNyAtMTc3OSA3IC0zOTU3CmwwIC0zOTYxIDEwMyAwIGM2NCAwIDE5NiAxMyAzNDggMzUgMjQzIDM0IDcwOCAxMDAgMTUxOSAyMTQgMjM0IDMzIDU4NyA4Mwo3ODUgMTExIDE5OCAyNyAzNzUgNTIgMzkzIDU1IGwzMiA2IDAgNjE4OSAwIDYxOTAgLTEyNyAtMSAtMTI4IC0xIC0yOTEyCi0xODQxeiIvPgo8L2c+Cjwvc3ZnPgo="
    }
}
// Creation de l'application
let MyClientApp = new GeoX(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp(MyClientApp.GetTitre(), MyClientApp.GetImgSrc(), MyClientApp.Initiation.bind(MyClientApp))