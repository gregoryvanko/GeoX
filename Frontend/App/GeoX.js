class GeoX{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
        // App en full screen 
        this._DivApp.style.width = "99%"
        this._DivApp.style.padding = "0%"
        this._DivApp.style.margin = "0.5%"
        // Variable
        this._MyMap = null
    }

    /** Start de l'application */
    Start(){
        // Create map une fois (attention au refresh)
        this._MyMap = new GeoXMap()
        this.LoadData()
    }

    LoadData(){
        // Clear view
        this.ClearView()
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center;"))
        // SocketIo Listener
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('StartGeoXApp', (Value) => {this.StartGeoXApp(Value)})

        // Send status to serveur
        GlobalSendSocketIo("GeoX", "Start", "")
    }
    /** Clear view */
    ClearView(){
        // Clear Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.LoadData.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        // Clear socket
        let SocketIo = GlobalGetSocketIo()
        if(SocketIo.hasListeners('GeoXError')){SocketIo.off('GeoXError')}
        if(SocketIo.hasListeners('StartGeoXApp')){SocketIo.off('StartGeoXApp')}
    }
    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
    Error(ErrorMsg){
        this.ClearView()
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red"))
    }

    /** Load de la carte, des track et des bouttons de commandes */
    StartGeoXApp(Data){
        // Get Conteneur
        let Conteneur = document.getElementById("Conteneur")
        Conteneur.innerHTML = ""
        // Ajout du div qui va contenir la map
        Conteneur.appendChild(CoreXBuild.Div("mapid", "", "height: 98vh; width: 100%"))
        this._MyMap.MapId = "mapid"
        // If receive no data from server
        if (Data.ListOfTracks.length == 0){
            this._MyMap.CreateMap()
        } else {
            this._MyMap.CreateMap(Data.CenterPoint, Data.Zoom, Data.FitBounds)
            Data.ListOfTracks.forEach(Track => {
                this._MyMap.AddTrack(Track.Name, Track.GeoJsonData)
            });
        }
        this.BuildCommandButton()
    }

    BuildCommandButton(){
        console.log("ToDo")
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
GlobalCoreXAddApp(MyClientApp.GetTitre(), MyClientApp.GetImgSrc(), MyClientApp.Start.bind(MyClientApp))