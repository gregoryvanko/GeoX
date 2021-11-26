class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._AppData = null
        this._AppGroup = null
        this.GeoXCreateTrackView = MyGeoXCreateTrack
        this._StartWithLoadViewManageTrack = true
        this._GPX = null
        this._GeoJson = null
        this._ImageTrack = null
        this._WindowScrollY = 0
    }

    Initiation(StartWithLoadViewManageTrack = true){
        this._StartWithLoadViewManageTrack = StartWithLoadViewManageTrack
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // Load Data
        this.LoadViewGetAppData()
    }

    /** Load des Data de l'application */
    LoadViewGetAppData(){
        // Clear view
        this._DivApp.innerHTML=""
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center; margin-top: 10vh;"))
        // GetUserData
        
    }
}

// Creation de l'application
let MyGeoXManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", Icon.GeoXManageTracks(), MyGeoXManageTracks.Initiation.bind(MyGeoXManageTracks))