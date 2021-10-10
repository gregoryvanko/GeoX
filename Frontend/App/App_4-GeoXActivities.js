class GeoXActivities {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
    }

    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Add action
        GlobalAddActionInList("Add Track", this.GoToAddTrack.bind(this))
        GlobalAddActionInList("Create Track", this.GoToCreateTrack.bind(this))
        GlobalAddActionInList("Manage Track", this.GoToManageTrack.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        // Load Start view
        this.LoadStartView()
    }

    /**
     * Action pour aller au module de creation de track
     */
     GoToCreateTrack(){
        GlobalReset()
        MyGeoXCreateTrack.Initiation()
    }

    /**
     * Action pour aller au module de modification des track
     */
    GoToManageTrack(){
        GlobalReset()
        MyGeoXManageTracks.Initiation(true)
    }

    /**
     * Action pour aller au module d'ajout de track
     */
    GoToAddTrack(){
        GlobalReset()
        MyGeoXManageTracks.Initiation(false)
    }

    LoadStartView(){
        // Clear view
        this._DivApp.innerHTML=""
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("Activities", "", "Titre"))
    }
    
}

// Creation de l'application
//let MyGeoXActivities = new GeoXActivities(GlobalCoreXGetAppContentId())
// Ajout de l'application
//GlobalCoreXAddApp("Activities", Icon.GeoXMapIcon(), MyGeoXActivities.Initiation.bind(MyGeoXActivities), true)