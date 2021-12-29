class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._DivConteneur = "DivConteneur"
        this._DivConteneurTrackData = "DivConteneurTrackData"
        this._DivListOfMyTracksData = "DivListOfMyTracksData"
        this._DivDataOfOneTrack = "DivDataOfOneTrack"

        this._PageOfPosts = 0
        this._FiltrePost = {DistanceMin: 1, DistanceMax: 200}

        let me = this
        this._ObserverListOfTrack = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetAllMyTracksData()
                    me._ObserverListOfTrack.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

        this._WindowScrollY = 0

        //this._AppData = null
    }

    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // Clear data
        this._PageOfPosts = 0
        // Contener
        this._DivApp.appendChild(CoreXBuild.DivFlexColumn(this._DivConteneur))
        // Contener Track Data
        let ConteneurTrackData = CoreXBuild.DivFlexColumn(this._DivConteneurTrackData)
        ConteneurTrackData.style.display = "none"
        this._DivApp.appendChild(ConteneurTrackData)
        // Load Data
        this.LoadViewTable()
    }

    /**
     * Load des Data de l'application
     */
    LoadViewTable(){
        let Conteneur = document.getElementById(this._DivConteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("All Tracks", "", "Titre"))
        // Add Button filter
        Conteneur.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnFilter.bind(this), "ActionLeftBack",  `<img src="${Icon.Filter()}" alt="icon" width="32" height="32">`))

        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        BoxTitre.style.width = "60rem"
        BoxTitre.style.maxWidth = "90%"
        Conteneur.appendChild(BoxTitre)
        BoxTitre.style.marginTop = "3rem"
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 44%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 28%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Owner","","TextBoxTitre", "width: 24%;"))
        // Liste des post
        let ListofMyPost = CoreXBuild.DivFlexColumn(this._DivListOfMyTracksData)
        ListofMyPost.style.width = "60rem"
        ListofMyPost.style.maxWidth = "90%"
        Conteneur.appendChild(ListofMyPost)
        // Ajout d'une ligne
        ListofMyPost.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Waiting text
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting data...","WaitingDataListTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetAllMyTracksData()

    }

    /**
     * Load de la vue Track Data
     * @param {String} TrackId Id of track
     * @param {String} TrackName Name of track
     */
    LoadViewTrackData(TrackId, TrackName){
        // Hide DivConteneur
        document.getElementById(this._DivConteneur).style.display = "none"
        // Show ConteneurTrackData
        let ConteneurTrackData = document.getElementById(this._DivConteneurTrackData)
        ConteneurTrackData.style.display = "flex"

        // Hide Action Button
        GlobalDisplayAction('Off')

        // Add Button Back
        ConteneurTrackData.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnBackFromTrackData.bind(this), "ActionLeftBack",  `<img src="${Icon.LeftArrow()}" alt="icon" width="32" height="32">`))
        // Div Data of track
        let DivDataOfOneTrack = CoreXBuild.DivFlexColumn(this._DivDataOfOneTrack)
        DivDataOfOneTrack.style.width = "45rem"
        DivDataOfOneTrack.style.maxWidth = "100%"
        DivDataOfOneTrack.style.marginTop = "3rem"
        ConteneurTrackData.appendChild(DivDataOfOneTrack)
        // Waiting text
        if (TrackName){
            DivDataOfOneTrack.appendChild(CoreXBuild.DivTexte(`Waiting data of track: ${TrackName}`,"WaitingDataTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        } else {
            DivDataOfOneTrack.appendChild(CoreXBuild.DivTexte(`Waiting data of track`,"WaitingDataTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        }
        // get InfoOnTrack data
        this.GetInfoOnTrack(TrackId)
    }

    /**
     * Get All My Tracks information
     */
    GetAllMyTracksData(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiAdminGetAllTracks", FctData, "", "").then((reponse)=>{
            this.RenderAllMyTracksDataInViewManageTrack(reponse)
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Get Data of one track
     * @param {String} TrackId Id of track
     */
    GetInfoOnTrack(TrackId){
        let FctData = {PostId: TrackId}
        GlobalCallApiPromise("ApiAdminGetPostData", FctData, "", "").then((reponse)=>{
            this.RenderInfoOnTrackInViewTrackData(reponse)
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Afficher all my tracks data dans la vue Manage my tracks
     * @param {Array} Data liste of track data
     */
    RenderAllMyTracksDataInViewManageTrack(Data){
        if (Data.length != 0){
            let MiddlepointData = Math.ceil(Data.length / 2)-1
            let CurrentpointData = 0
            Data.forEach(element => {
                // Construction du BoxTracks
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "0.7rem"
                BoxTracks.style.marginBottom = "0.7rem"
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Name,"","Text", "width: 44%; margin-left:1%; padding:0.2rem;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Group,"","TextSmall", "width: 28%; padding:0.2rem;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Owner,"","TextSmall", "width: 24%; padding:0.2rem;"))
                if (! element.Public){
                    BoxTracks.style.color = "red"
                }
                BoxTracks.style.cursor = "pointer"
                BoxTracks.onclick = this.ClickOnTrackData.bind(this, element._id, element.Name)
                // si l'element est l'element milieu
                if (CurrentpointData == MiddlepointData){
                    // ajouter le listener pour declancher le GetPosts
                    this._ObserverListOfTrack.observe(BoxTracks)
                }
                CurrentpointData ++
                // si _DivListOfMyTracksData existe on ajout les BoxTracks et une ligne
                if (document.getElementById(this._DivListOfMyTracksData)){
                    // Ajout du BoxTracks
                    document.getElementById(this._DivListOfMyTracksData).appendChild(BoxTracks)
                    // Ajout d'une ligne
                    document.getElementById(this._DivListOfMyTracksData).appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
                }
            });
        } else {
            // End of Post
            let ConteneurManageTrack = document.getElementById(this._DivConteneur)
            ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("End of tracks", "", "Text", "color:red; margin-top: 1rem; margin-bottom: 1rem;"))
            // Remove WaitingDataListTrack
            if (document.getElementById("WaitingDataListTrack")){
                ConteneurManageTrack.removeChild(document.getElementById("WaitingDataListTrack"))
            }
        }
    }

    /**
     * Affiche un object GeoxActvies dans la vue TrackData
     * @param {Object} Data Data of track for GeoXActivities view
     */
    RenderInfoOnTrackInViewTrackData(Data){
        let DivDataOfOneTrack = document.getElementById(this._DivDataOfOneTrack)
        // Add InfoOnTrack view
        let InfoTrackView = new InfoOnTrack(Data, this._DivDataOfOneTrack)
        // Empty
        DivDataOfOneTrack.appendChild(this.BuildEmptySpace())
    }

    /**
     * Click on track data
     * @param {String} TrackId Id of track
     * @param {String} Name Name of track
     */
    ClickOnTrackData(TrackId, Name){
        this._WindowScrollY = window.scrollY
        this.LoadViewTrackData(TrackId, Name)
    }

    /**
     * Click on Back arrow of Track Data View
     */
    ClickOnBackFromTrackData(){
        let ConteneurTrackData = document.getElementById(this._DivConteneurTrackData)
        ConteneurTrackData.innerHTML = ""
        ConteneurTrackData.style.display = "none"
        // show DivConteneur
        document.getElementById(this._DivConteneur).style.display = "flex"
        // Show Action Button
        GlobalDisplayAction('On')
        // Scroll
        window.scrollTo(0, this._WindowScrollY)
    }

    /**
     * Open filter box
     */
    ClickOnFilter(){
        let FilterView = new FilterBox(this._FiltrePost)
        FilterView.Save = this.SetFilter.bind(this)
    }

    /**
     * Show window with error message
     * @param {String} Error Error message
     */
    ShowErrorMessage(Error){
        let Content = CoreXBuild.DivFlexColumn("")
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Texte waiting
        Content.appendChild(CoreXBuild.DivTexte(Error, "", "Text", "color:red;"))
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Show window
        CoreXWindow.BuildWindow(Content)
    }

    /**
     * Build empty space
     * @returns HTML element div
     */
    BuildEmptySpace(){
        let divempty = document.createElement('div')
        divempty.style.height = "2rem"
        return divempty
    }

    /**
     * Apply filter
     * @param {Object} Filter Object filter
     */
    SetFilter(Filter){
        this._FiltrePost = Filter
        this.Initiation()
    }
}

// Creation de l'application
let MyManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", IconGeoX.GeoXManageTracks(), MyManageTracks.Initiation.bind(MyManageTracks))