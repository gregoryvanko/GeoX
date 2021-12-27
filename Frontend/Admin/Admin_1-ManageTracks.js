class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._DivConteneur = "Conteneur"
        this._DivListOfMyTracksData = "DivListOfMyTracksData"

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
        // Load Data
        this.LoadViewGetAppData()
    }

    /**
     * Action a realiser lorsque l'on recoit un message
     * @param {Object} Value Object du message : {Action, Data}
     */
    // MessageRecieved(Value){
    //     if (Value.Action == "SetData"){
    //         this._AppData = Value.AppData
    //         this.LoadViewManageTracks()
    //     } else if (Value.Action == "SetTrackInfo" ){
    //         // Load Info Track view
    //         let InfoTrackView = new InfoOnTrack(Value.Data, "ContentInfoTrack")
    //     } else {
    //         console.log("error, Action not found: " + Value.Action)
    //     }
    // }

    /**
     * Load des Data de l'application
     */
    LoadViewGetAppData(){
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn(this._DivConteneur)
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("All Tracks", "", "Titre"))

        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        BoxTitre.style.width = "60rem"
        BoxTitre.style.maxWidth = "90%"
        Conteneur.appendChild(BoxTitre)
        BoxTitre.style.marginTop = "3rem"
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 44%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 28%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Owner","","TextBoxTitre", "width: 23%;"))
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
     * Get All My Tracks information
     */
    GetAllMyTracksData(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiAdminGetAllMyTracks", FctData, "", "").then((reponse)=>{
            this.RenderAllMyTracksDataInViewManageTrack(reponse)
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
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Owner,"","TextSmall", "width: 12%; padding:0.2rem;"))
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
     * Click on track data
     * @param {String} TrackId Id of track
     * @param {String} Name Name of track
     */
    ClickOnTrackData(TrackId, Name){
        this._WindowScrollY = window.scrollY
        //this.LoadViewTrackData(TrackId, Name)
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

    // LoadViewManageTracks(){
    //     // Clear view
    //     this._DivApp.innerHTML = ""
    //     // Contener
    //     let Contener = CoreXBuild.DivFlexColumn("Conteneur")
    //     this._DivApp.appendChild(Contener)
    //     // Titre
    //     Contener.appendChild(CoreXBuild.DivTexte("Manage GeoX Tracks", "", "Titre", "margin-bottom:0%"))
    //     // Conteneur de la liste des tracks
    //     let AppConteneur = CoreXBuild.Div("AppConteneur", "AppConteneur", "")
    //     Contener.appendChild(AppConteneur)
    //     // Div pour le titre des colonnes
    //     let BoxTitre = CoreXBuild.DivFlexRowStart("")
    //     BoxTitre.style.marginTop = "4vh"
    //     AppConteneur.appendChild(BoxTitre)
    //     // Titre des colonnes
    //     BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 33%; margin-left:1%;"))
    //     BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 20%;"))
    //     BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 15%;"))
    //     BoxTitre.appendChild(CoreXBuild.DivTexte("Owner","","TextBoxTitre", "width: 21%;"))
    //     // Ajout d'une ligne
    //     AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
    //     // Ajout des lignes des tracks
    //     if (this._AppData.length == 0){
    //         let BoxTracks = CoreXBuild.DivFlexRowStart("")
    //         AppConteneur.appendChild(BoxTracks)
    //         BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh; width: 100%; text-align: center;"))
    //     } else {
    //         this._AppData.forEach(Track => {
    //             let BoxTracks = CoreXBuild.DivFlexRowStart("")
    //             BoxTracks.style.marginTop = "1vh"
    //             BoxTracks.style.marginBottom = "1vh"
    //             if (!Track.Public){
    //                 BoxTracks.style.color = "red"
    //             }
    //             AppConteneur.appendChild(BoxTracks)
    //             BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 33%; margin-left:1%;"))
    //             BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","TextSmall", "width: 20%;"))
    //             BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(Track.Date),"","TextSmall", "width: 15%;"))
    //             BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Owner,"","TextSmall", "width: 21%;"))
    //             let DivButton = CoreXBuild.Div("", "", "margin-left:auto;")
    //             BoxTracks.appendChild(DivButton)
    //             DivButton.appendChild(CoreXBuild.Button(`<img src="${Icon.Information()}" alt="icon" width="30" height="30">`, this.LoadViewInfoTrack.bind(this,Track._id), "ButtonIcon"))
                
    //             // Ajout d'une ligne
    //             AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
    //         });
    //     }
    // }

    // LoadViewInfoTrack(TrackId){
    //     // Clear Conteneur
    //     this._DivApp.innerHTML = ""
    //     // Contener
    //     let Contener = CoreXBuild.DivFlexColumn("Conteneur")
    //     Contener.style.width = "90%"
    //     Contener.style.marginLeft = "auto"
    //     Contener.style.marginRight = "auto"
    //     Contener.style.maxWidth = "900px"
    //     this._DivApp.appendChild(Contener)
    //     // Content Info Track
    //     let ContentInfoTrack = CoreXBuild.DivFlexColumn("ContentInfoTrack")
    //     Contener.appendChild(ContentInfoTrack)
    //     // waitinf data txt
    //     ContentInfoTrack.appendChild(CoreXBuild.DivTexte("Waiting track data...","","Text", "text-align: center; margin-top: 10vh;"))
    //     // Button select file
    //     Contener.appendChild(CoreXBuild.Button("Go to manage track",this.LoadViewManageTracks.bind(this),"Text Button", "GoToManageTrack"))
    //     // Blank div
    //     Contener.appendChild(CoreXBuild.Div("","","height: 6vh;"))
    //     // Send status to serveur
    //     GlobalSendSocketIo("GeoX", "AdminManageTrack", {Action: "GetTrackInfo", Data: TrackId})
    // }
}

// Creation de l'application
let MyManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", IconGeoX.GeoXManageTracks(), MyManageTracks.Initiation.bind(MyManageTracks))