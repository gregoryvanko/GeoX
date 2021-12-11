class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._ConteneurListTrack = "ConteneurListTrack"
        this._ConteneurPosts = "ConteneurPosts"
        this._ConteneurViewOnMap = "ConteneurViewOnMap"
        this._ConteneurAddTrack = "ConteneurAddTrack"
        this._ConteneurTrackData = "ConteneurTrackData"
        this._ConteneurFollowTrackOnMap = "ConteneurFollowTrackOnMap"
        this._DivListOfMyTracksData = "DivListOfMyTracksData"
        this._DivListOfMyPostsData = "DivListOfMyPostsData"
        this._DivDataOfOneTrack = "DivDataOfOneTrack"
        this._DivMapAddTrack = "DivMapAddTrack"
        this._IdDivMap = "mapidActivites"
        this._IdDivTrackDataOnMap = "DivTrackDataOnMap"

        this._ViewAddModifyTrack = "ViewAddModifyTrack"
        this._ViewPost = "ViewPost"
        this._ViewMap = "ViewMap"
        this._ViewListOfTrack = "ViewListOfTrack"
        this._ViewCurrent = this._ViewPost

        this._PageOfPosts = 0
        this._PageOfMarkers = 0
        this._AllMarkers = []

        let me = this
        this._Observer = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetAllMyPosts()
                    me._Observer.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

        this._ObserverListOfTrack = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetAllMyTracksData()
                    me._ObserverListOfTrack.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

        this._StartWithLoadViewManageTrack = true
        //this._ShowOnMap = false
        this._WindowScrollY = 0

        this._Map = null
        this._FollowMyTrack = null
        this._UserGroup = null

        this.GeoXCreateTrackView = MyGeoXCreateTrack

        this._FiltrePost = {DistanceMin: 1, DistanceMax: 200}
    }

    /**
     * Initiation du module
     * @param {Boolean} StartWithLoadViewManageTrack Start with Load view Manage Track
     */
    Initiation(StartWithLoadViewManageTrack = true){
        this._StartWithLoadViewManageTrack = StartWithLoadViewManageTrack
        // Definir la vue a charger
        if (!this._StartWithLoadViewManageTrack){
            this._ViewCurrent = this._ViewAddModifyTrack
        }
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Add action
        GlobalAddActionInList("List View", this.LoadListView.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        // Load view
        this.LoadView(this._ViewCurrent)
    }

    /**
     * Load view de l'application
     */
    LoadView(Viewtoload = this._ViewCurrent){
        this._ViewCurrent = Viewtoload
        // Get All group
        this.GetMyGroups()
        // Clear data
        this._PageOfPosts = 0
        this._PageOfMarkers = 0
        this._AllMarkers = []
        // si on avait affiché la carte on la supprime
        if (this._Map){
            this._Map.RemoveMap()
            this._Map = null
        }
        // Clear view
        this._DivApp.innerHTML=""
        // Contener Post
        let ConteneurPost = CoreXBuild.DivFlexColumn(this._ConteneurPosts)
        ConteneurPost.style.display = "none"
        this._DivApp.appendChild(ConteneurPost)
        // Contener View on map
        let ConteneurViewOnMap = CoreXBuild.DivFlexColumn(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "none"
        this._DivApp.appendChild(ConteneurViewOnMap)
        // Contener add track
        let ConteneurAddTrack = CoreXBuild.DivFlexColumn(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "none"
        this._DivApp.appendChild(ConteneurAddTrack)
        // Contener Track Data
        let ConteneurTrackData = CoreXBuild.DivFlexColumn(this._ConteneurTrackData)
        ConteneurTrackData.style.display = "none"
        this._DivApp.appendChild(ConteneurTrackData)
        // Contener Follow track on map
        this._DivApp.appendChild(CoreXBuild.Div(this._ConteneurFollowTrackOnMap, "", "height: 100vh; width: 100%; display: none;")) 
        // Contener List of track
        let ConteneurListTrack = CoreXBuild.DivFlexColumn(this._ConteneurListTrack)
        ConteneurListTrack.style.display = "none"
        this._DivApp.appendChild(ConteneurListTrack)
        
        
        // Start Load view
        switch (this._ViewCurrent ) {
            case this._ViewPost:
                this.LoadViewMyPosts()
                break;
            case this._ViewMap:
                this.LoadViewOnMap()
                break;
            case this._ViewAddModifyTrack:
                this.LoadViewAddTrack()
                break;
            default:
                this.LoadViewMyPosts()
                break;
        }
    }

    /**
     * Load de la vue Post
     */
    LoadViewMyPosts(){
        this._ViewCurrent = this._ViewPost
        // Show ConteneurManageTrack
        let ConteneurMyPost = document.getElementById(this._ConteneurPosts)
        ConteneurMyPost.style.display = "flex"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide ConteneurListTrack
        document.getElementById(this._ConteneurListTrack).style.display = "none"
        
        // Hide Action Button
        GlobalDisplayAction('On')

        // Titre de l'application
        ConteneurMyPost.appendChild(CoreXBuild.DivTexte("My Tracks", "", "Titre"))
        // Button view on map
        ConteneurMyPost.appendChild(CoreXBuild.ButtonLeftAction(this.LoadView.bind(this, this._ViewMap), "ActionLeft",  `<img src="${IconGeoX.GeoXMapIcon()}" alt="icon" width="32" height="32">`))
        // Button Filter
        ConteneurMyPost.appendChild(CoreXBuild.Button(`<img src="${Icon.Filter()}" alt="icon" width="32" height="32">`,this.ClickOnFilter.bind(this),"ButtonLeftActionSecond","ButtonFilter"))
        // Button Add track
        ConteneurMyPost.appendChild(CoreXBuild.Button(`<img src="${Icon.Add()}" alt="icon" width="32" height="32">`,this.LoadViewAddTrack.bind(this),"ButtonRightActionSecond","ButtonAddTrack"))
        // Liste des post
        let ListofMyPost = CoreXBuild.Div(this._DivListOfMyPostsData, "DivPostApp", "")
        ConteneurMyPost.appendChild(ListofMyPost)
        // Waiting text
        ConteneurMyPost.appendChild(CoreXBuild.DivTexte("Waiting data...","WaitingDataManageTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetAllMyPosts()
    }

    /**
     * Load de la vue List
     */
    LoadListView(){
        this._ViewCurrent = this._ViewListOfTrack
        // Clear data
        this._PageOfPosts = 0
        this._PageOfMarkers = 0
        this._AllMarkers = []
        // si on avait affiché la carte on la supprime
        if (this._Map){
            this._Map.RemoveMap()
            this._Map = null
        }
        // Load View list of track
        this.LoadViewListOfTracks()
    }

    /**
     * Load de la vue Manage Track
     */
    LoadViewListOfTracks(){
        // Hide ConteneurPosts
        document.getElementById(this._ConteneurPosts).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Show Conteneur List of track
        let ConteneurManageTrack = document.getElementById(this._ConteneurListTrack)
        ConteneurManageTrack.style.display = "flex"

        GlobalDisplayAction('Off')
        // Clear Action List
        GlobalClearActionList()

        // Add Button Back
        ConteneurManageTrack.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnBackFromListTrack.bind(this), "ActionLeftBack",  `<img src="${Icon.LeftArrow()}" alt="icon" width="32" height="32">`))
        // Button Filter
        ConteneurManageTrack.appendChild(CoreXBuild.Button(`<img src="${Icon.Filter()}" alt="icon" width="32" height="32">`,this.ClickOnFilter.bind(this),"ButtonLeftActionSecond","ButtonFilter"))

        // Titre de l'application
        //ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("My Tracks", "", "Titre"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        BoxTitre.style.width = "60rem"
        BoxTitre.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(BoxTitre)
        BoxTitre.style.marginTop = "3rem"
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 44%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 29%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 13%;"))
        // Liste des post
        let ListofMyPost = CoreXBuild.DivFlexColumn(this._DivListOfMyTracksData)
        ListofMyPost.style.width = "60rem"
        ListofMyPost.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(ListofMyPost)
        // Ajout d'une ligne
        ListofMyPost.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Waiting text
        ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("Waiting data...","WaitingDataListTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetAllMyTracksData()
    }

    /**
     * Load de la vue Add Track
     */
    LoadViewAddTrack(IsAddTrack = true, TrackData = null){
        // Save WindowScrollY
        if (IsAddTrack){
            this._WindowScrollY = window.scrollY
        }
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurPosts).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        let ConteneurAddTrack = document.getElementById(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "flex"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide ConteneurListTrack
        document.getElementById(this._ConteneurListTrack).style.display = "none"

        // Hide Action Button
        GlobalDisplayAction('Off')

        // Titre
        if (IsAddTrack){
            // Titre de l'application
            ConteneurAddTrack.appendChild(CoreXBuild.DivTexte("Add Track", "", "Titre"))
        } else {
            // Titre de l'application
            ConteneurAddTrack.appendChild(CoreXBuild.DivTexte("Modify Track", "", "Titre"))
        }
        this.RenderAddModifyTrackData(IsAddTrack, TrackData)
    }

    /**
     * Load de la vue Map
     */
    LoadViewOnMap(){
        this._ViewCurrent = this._ViewMap
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurPosts).style.display = "none"
        // Show ConteneurViewOnMap
        let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "flex"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide ConteneurListTrack
        document.getElementById(this._ConteneurListTrack).style.display = "none"

        // show Action Button
        GlobalDisplayAction('On')

        // Add button manage my post
        ConteneurViewOnMap.appendChild(CoreXBuild.ButtonLeftAction(this.LoadView.bind(this, this._ViewPost), "ActionLeft",  `<img src="${Icon.Liste()}" alt="icon" width="32" height="32">`))
        // Button Filter
        ConteneurViewOnMap.appendChild(CoreXBuild.Button(`<img src="${Icon.Filter()}" alt="icon" width="32" height="32">`,this.ClickOnFilter.bind(this),"ButtonLeftActionSecond","ButtonFilter"))
        // Ajout du div qui va contenir la map
        ConteneurViewOnMap.appendChild(CoreXBuild.Div(this._IdDivMap, "", "height: 100vh; width: 100%;"))
        this._Map = new GeoXMap(this._IdDivMap) 
        this._Map.RenderMap()
        this._Map.AddMarkersClusterGroup()
        this._Map.OnClickOnMarker = this.ClickOnMarker.bind(this)
        // Get All marker by page
        this.GetAllMarkersByPage()
    }

    /**
     * Load de la vue Track Data
     * @param {String} TrackId Id of track
     * @param {String} TrackName Name of track
     */
    LoadViewTrackData(TrackId, TrackName){
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurPosts).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Show ConteneurTrackData
        let ConteneurTrackData = document.getElementById(this._ConteneurTrackData)
        ConteneurTrackData.style.display = "flex"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide ConteneurListTrack
        document.getElementById(this._ConteneurListTrack).style.display = "none"

        // Hide Action Button
        GlobalDisplayAction('Off')

        // Add Button Back
        ConteneurTrackData.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnBackFromTrackData.bind(this), "ActionLeftBack",  `<img src="${Icon.LeftArrow()}" alt="icon" width="32" height="32">`))
        // Div Data of track
        let DivDataOfOneTrack = CoreXBuild.DivFlexColumn(this._DivDataOfOneTrack)
        DivDataOfOneTrack.style.width = "45rem"
        DivDataOfOneTrack.style.maxWidth = "90%"
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
     * Get all my post
     */
    GetAllMyPosts(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiGetAllMyPost", FctData, "", "").then((reponse)=>{
            this.RenderPosts(reponse)
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Get All My Tracks information
     */
    GetAllMyTracksData(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiGetAllMyTracks", FctData, "", "").then((reponse)=>{
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
        GlobalCallApiPromise("ApiGetPostData", FctData, "", "").then((reponse)=>{
            this.RenderInfoOnTrackInViewTrackData(reponse)
        },(erreur)=>{
            let DivDataOfOneTrack = document.getElementById(this._DivDataOfOneTrack)
            DivDataOfOneTrack.innerHTML =""
            DivDataOfOneTrack.appendChild(CoreXBuild.DivTexte(erreur, "", "Text", "color:red;"))
        })
    }

    /**
     * Get All groups of user
     */
    GetMyGroups(){
        GlobalCallApiPromise("ApiGetAllGroups", "", "", "").then((reponse)=>{
            this._UserGroup = reponse
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Get makers of all tracks of GeoX by page
     */
    GetAllMarkersByPage(){
        let FctData = {Page: this._PageOfMarkers, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiGetAllMyTracksMarkers", FctData, "", "").then((reponse)=>{
            if (reponse.length != 0){
                if (this._Map){
                    this.RenderMarkersOnMap(reponse)
                    this._PageOfMarkers ++
                    this.GetAllMarkersByPage()
                }
            }
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Render Posts
     * @param {Object} Data Data of post
     */
    RenderPosts (Data){
        if (Data.length != 0){
            let MiddlepointData = Math.ceil(Data.length / 2)-1
            let CurrentpointData = 0
            Data.forEach(element => {
                // Creation du post
                let TempGeoxPsot = new HtmlElemGeoxPost(element, true)
                TempGeoxPsot.OnClickPost = this.ClickOnTrackData.bind(this, element._id, element.Name)

                TempGeoxPsot.OnClickGoTo = this.ClickGoToStart.bind(this, element.StartPoint)
                TempGeoxPsot.OnClickFollow = this.ClickFollowTrackFromPost.bind(this, element._id)
                TempGeoxPsot.OnClickUpdate = this.ClickUpdateTrackData.bind(this, element)
                TempGeoxPsot.OnClickGpx = this.ClickDownloadGPX.bind(this, element._id, element.Name)
                

                TempGeoxPsot.style.width = "100%"
                
                // si l'element est l'element milieu
                if (CurrentpointData == MiddlepointData){
                    // ajouter le listener pour declancher le GetPosts
                    this._Observer.observe(TempGeoxPsot)
                }
                CurrentpointData ++
                if (document.getElementById(this._DivListOfMyPostsData)){
                    document.getElementById(this._DivListOfMyPostsData).appendChild(TempGeoxPsot)
                }
            });
        } else {
            // End of Post
            let ConteneurMyPost = document.getElementById(this._ConteneurPosts)
            ConteneurMyPost.appendChild(CoreXBuild.DivTexte("End of tracks", "", "Text", "color:red; margin-top: 1rem; margin-bottom: 1rem;"))
            // Remove WaitingDataManageTrack
            if (document.getElementById("WaitingDataManageTrack")){
                ConteneurMyPost.removeChild(document.getElementById("WaitingDataManageTrack"))
            }
        }
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
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Group,"","TextSmall", "width: 29%; padding:0.2rem;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(element.Date),"","TextSmall", "width: 13%; padding:0.2rem;"))
                if (! element.Public){
                    let DivPublic = CoreXBuild.Div("", "", "width: 6%;")
                    DivPublic.style.textAlign = "right"
                    BoxTracks.appendChild(DivPublic)
                    DivPublic.appendChild(CoreXBuild.Image64(Icon.Key(),"", "IconeInList", ""))
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
            let ConteneurManageTrack = document.getElementById(this._ConteneurListTrack)
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
        // Add button
        let DivButtonAction = CoreXBuild.DivFlexRowAr("ButtonAction")
        DivDataOfOneTrack.appendChild(DivButtonAction)
        // Button Go To Start
        let ButtonGo = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.StartFlag(), "Go to start"), this.ClickGoToStart.bind(this, Data.StartPoint), "CloseButton", "GoToStart")
        DivButtonAction.appendChild(ButtonGo)
        // Button Follow track
        let ButtonFollow = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Follow(), "Follow Track"), this.ClickFollowTrack.bind(this, Data._id), "CloseButton", "FollowTrack")
        DivButtonAction.appendChild(ButtonFollow)
        // Button Update
        let ButtonUpdate = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Pencil(), "Update Data"), this.ClickUpdateTrackData.bind(this, Data), "CloseButton", "Update")
        DivButtonAction.appendChild(ButtonUpdate)
        // Button Modify
        let ButtonModify = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.ModifyTrack(), "Modify Track"), this.ClickModifyTrack.bind(this, Data._id, Data.Name, Data.Group, Data.Public, Data.Description), "CloseButton", "Modify")
        DivButtonAction.appendChild(ButtonModify)
        // Button Delete
        let ButtonDelete = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Trash(), "Delete Track"), this.ClickDeleteTrack.bind(this, Data._id, Data.Name), "CloseButton", "Delete")
        DivButtonAction.appendChild(ButtonDelete)
        // Button Link
        let ButtonLink = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Link(), "Get link"), this.ClickGetLinkOfTrack.bind(this, Data._id), "CloseButton", "Link")
        DivButtonAction.appendChild(ButtonLink)
        // Button download GPX
        let ButtonGPX = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Download(), "GPX"), this.ClickDownloadGPX.bind(this, Data._id, Data.Name), "CloseButton", "GPX")
        DivButtonAction.appendChild(ButtonGPX)

        // Empty
        DivDataOfOneTrack.appendChild(this.BuildEmptySpace())
    }

    /**
     * Render view track to follow on map
     * @param {String} TrackId id of track
     * @param {Object} TrackGeoJson GeoJson Object
     */
    RenderTrackToFollowOnMap(TrackId, TrackGeoJson){
        // Vider le _ConteneurTrackData 
        document.getElementById(this._ConteneurTrackData).innerHTML =""
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurPosts).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Show ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "block"
        // Hide ConteneurListTrack
        document.getElementById(this._ConteneurListTrack).style.display = "none"

        // On efface le bouton menu action
        GlobalDisplayAction('Off')

        // Start Follow Track on map
        let TrackData = {TrackId: TrackId, TrackGeoJson: TrackGeoJson}
        this._FollowMyTrack = new FollowTrackOnMap(this._ConteneurFollowTrackOnMap, TrackData)
        this._FollowMyTrack.OnStop = this.ClickStopFollowingTrack.bind(this)
        this._FollowMyTrack.Start()
    }

    /**
     * Render view Add or Modify track data
     * @param {Boolean} IsAddTrack Show Add Track or Modify Track
     * @param {Object} Data Data on track to modify
     */
    RenderAddModifyTrackData(IsAddTrack, Data){
        let Id = (Data == null) ? "" : Data._id
        let Name = (Data == null) ? "" : Data.Name
        let Group = (Data == null) ? "" : Data.Group
        let Description = (Data == null) ? "" : Data.Description
        let Public = (Data == null) ? true : Data.Public
        let Color = (Data == null) ? "#0000FF" : Data.Color

        let ConteneurAddTrack = document.getElementById(this._ConteneurAddTrack)
        // Input Name
        ConteneurAddTrack.appendChild(CoreXBuild.InputWithLabel("InputBox", "Name:", "Text", "InputTrackName",Name, "Input Text", "text", "Name",))
        // Input `Group
        ConteneurAddTrack.appendChild(CoreXBuild.InputWithLabel("InputBox", "Group:", "Text", "InputTrackGroup",Group, "Input Text", "text", "Group",))
        // Add AutoComplete
        let me = this
        document.getElementById("InputTrackGroup").setAttribute("autocomplete", "off")
        autocomplete({
            input: document.getElementById("InputTrackGroup"),
            minLength: 1,
            emptyMsg: 'No suggestion',
            fetch: function(text, update) {
                text = text.toLowerCase();
                var GroupFiltred = me._UserGroup.filter(n => n.toLowerCase().startsWith(text))
                var suggestions = []
                GroupFiltred.forEach(element => {
                    var MyObject = new Object()
                    MyObject.label = element
                    suggestions.push(MyObject)
                });
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item.label;
            }
        });
        // Description
        let DivDescription = CoreXBuild.Div("", "InputBox Text", "")
        ConteneurAddTrack.appendChild(DivDescription)
        DivDescription.appendChild(CoreXBuild.DivTexte("Description", "", "Text", ""))
        let DivContDesc = CoreXBuild.Div("DivContDesc", "DivContentEdit TextSmall", "")
        DivContDesc.innerText = Description
        DivContDesc.contentEditable = "True"
        DivDescription.appendChild(DivContDesc)
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        ConteneurAddTrack.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", Public))
        // Color
        if (!IsAddTrack){
            let divColor = CoreXBuild.Div("", "InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center; flex-wrap: wrap;")
            let TextColor = CoreXBuild.DivTexte("Color:", "", "Text", "")
            divColor.appendChild(TextColor)
            let inputcolor = document.createElement("input")
            divColor.appendChild(inputcolor)
            inputcolor.setAttribute("id","SelectColor")
            inputcolor.setAttribute("type","color")
            inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; height: 2rem; border: 1px solid black;")
            inputcolor.value = Color
            ConteneurAddTrack.appendChild(divColor)
        }
        // Div Button
        let DivBoxButton = CoreXBuild.Div("", "InputBox", "")
        ConteneurAddTrack.appendChild(DivBoxButton)
        let DivButton = CoreXBuild.DivFlexRowAr("")
        DivBoxButton.appendChild(DivButton)
        if (IsAddTrack){
            // Button Add
            DivButton.appendChild(CoreXBuild.Button("Select GPX",this.ClickSendAddTrack.bind(this),"Text Button ButtonWidth30", "SelectAndSend"))
            //Input file
            var Input = document.createElement("input")
            Input.setAttribute("type","file")
            Input.setAttribute("name","FileSelecteur")
            Input.setAttribute("id","FileSelecteur")
            Input.setAttribute("accept", '.gpx')
            Input.setAttribute("style","display: none;")
            Input.addEventListener("change", ()=>{
                // Change button to waiting
                document.getElementById("SelectAndSend").innerHTML="Build..."
                document.getElementById("SelectAndSend").disabled = true

                var fichierSelectionne = document.getElementById('FileSelecteur').files[0]
                var reader = new FileReader();
                let me = this
                reader.readAsText(fichierSelectionne, "UTF-8");
                reader.onload = function (evt) {
                    let parser = new DOMParser();
                    me.ConvertGpxToImg(evt.target.result)
                }
                reader.onerror = function (evt) {
                    alert("Error reading file");
                }
            }, false)
            DivButton.appendChild(Input)
        } else {
            // Button Update
            DivButton.appendChild(CoreXBuild.Button("Update Track",this.ClickSendUpdateTrack.bind(this, Id),"Text Button ButtonWidth30", "SelectAndSend"))
        }
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.ClickCancelAddModifyTrack.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        ConteneurAddTrack.appendChild(this.BuildEmptySpace())
        // Div Map
        if (IsAddTrack){
            let DivMapAddTrack = CoreXBuild.Div(this._DivMapAddTrack, "", "")
            ConteneurAddTrack.appendChild(DivMapAddTrack)
        }
    }

    /**
     * Affiche les marker sur la carte
     * @param {Array} Markers Array af Marker elements
     */
    RenderMarkersOnMap(Markers){
        // Add each marker on map
        Markers.forEach(element => {
            this._Map.AddMarker(element)
        });
        // Save marker
        this._AllMarkers.push(...Markers)
    }

    /**
     * Render Box with track data on map
     * @param {String} TrackId Id of track
     */
    RenderTrackDataOnMap(TrackId){
        // Get Track data
        let TrackData =  this._AllMarkers.find(x => x._id === TrackId)
        // Build div track data on map
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap == null){
            DivTrackDataOnMap = CoreXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap", "")
            document.getElementById(this._ConteneurViewOnMap).appendChild(DivTrackDataOnMap)
            DivTrackDataOnMap.addEventListener("click", this.ClickOnTrackData.bind(this, TrackId, null))
        } else {
            document.getElementById(this._ConteneurViewOnMap).removeChild(DivTrackDataOnMap)
            DivTrackDataOnMap = CoreXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap", "")
            document.getElementById(this._ConteneurViewOnMap).appendChild(DivTrackDataOnMap)
            DivTrackDataOnMap.addEventListener("click", this.ClickOnTrackData.bind(this, TrackId, null))
        }
        // Name and close buttion
        let divNameAndClose = CoreXBuild.Div("", "", "width: 100%; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center;")
        DivTrackDataOnMap.appendChild(divNameAndClose)
        // Add track name
        let divname = document.createElement('div')
        divname.innerHTML = TrackData.Name
        divname.style.width ="100%"
        divname.style.fontWeight ="bold"
        divname.style.textAlign ="left"
        divname.style.marginBottom ="0.5rem"
        divname.style.marginLeft ="0.5rem"
        divname.classList.add("Text")
        divNameAndClose.appendChild(divname)
        // Add button
        let button = document.createElement('button')
        button.classList.add("ButtonX");
        button.style.borderWidth = "2px"
        button.style.zIndex = "100"
        button.style.fontSize = "1rem"
        button.style.padding = "1px 5px"
        button.style.marginBottom = "0rem"
        button.onclick = this.RemoveTrackDataOnMap.bind(this)
        divNameAndClose.appendChild(button)

        // Add track info
        let conteneur = document.createElement('div')
        conteneur.setAttribute("style","width: 100%; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center;")
        conteneur.appendChild(InfoOnTrack.DrawDataInfo(TrackData.Length, "Km", CommonIcon.Lenght()))
        conteneur.appendChild(InfoOnTrack.DrawVerticalLine())
        conteneur.appendChild(InfoOnTrack.DrawDataInfo(TrackData.InfoElevation.ElevCumulP, "m", CommonIcon.ElevationPlus()))
        conteneur.appendChild(InfoOnTrack.DrawVerticalLine())
        conteneur.appendChild(InfoOnTrack.DrawDataInfo(TrackData.InfoElevation.ElevCumulM, "m", CommonIcon.ElevationMoins()))
        conteneur.appendChild(InfoOnTrack.DrawVerticalLine())
        conteneur.appendChild(InfoOnTrack.DrawDataInfo(TrackData.InfoElevation.ElevMax, "m", CommonIcon.ElevationMax()))
        conteneur.appendChild(InfoOnTrack.DrawVerticalLine())
        conteneur.appendChild(InfoOnTrack.DrawDataInfo(TrackData.InfoElevation.ElevMin, "m", CommonIcon.ElevationMin()))
        DivTrackDataOnMap.appendChild(conteneur)
    }

    /**
     * Remove Box track data on map
     */
    RemoveTrackDataOnMap(){
        event.stopPropagation()

        // Remove all track on map
        this._Map.RemoveAllTracks()
        // Remove track data
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap != null){
            document.getElementById(this._ConteneurViewOnMap).removeChild(DivTrackDataOnMap)
        }
    }

    /**
     * Render track point on map
     * @param {Object} Map Map on view
     * @param {String} TrackId Id of track
     */
    RenderTrackGeoJSonOnMap(Map, TrackId){
        let FctData = {TrackId: TrackId, GetData: "GeoJSon"}
        GlobalCallApiPromise("ApiGetTrackData", FctData, "", "").then((reponse)=>{
            Map.RemoveAllTracks()
            Map.AddTrackOnMap(TrackId, reponse, false)        
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
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
        let ConteneurTrackData = document.getElementById(this._ConteneurTrackData)
        ConteneurTrackData.innerHTML = ""
        // Reset view
        this.RestoreView()
    }

    /**
     * Click on Back arrow of list View
     */
    ClickOnBackFromListTrack(){
        this.Initiation()
    }

    /**
     * Go to Start position
     * @param {Object} StartPoint StartPoint coordonate
     */
    ClickGoToStart(StartPoint){
        if ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPad") != -1) || (navigator.platform.indexOf("iPod") != -1)){
            window.open(`maps://maps.google.com/maps?daddr=${StartPoint.Lat},${StartPoint.Lng}&amp;ll=`);
        } else {
            window.open(`https://maps.google.com/maps?daddr=${StartPoint.Lat},${StartPoint.Lng}&amp;ll=`)
        }
    }

    /**
     * Show track to follox (from Post click)
     * @param {String} TrackId Id of track
     */
    ClickFollowTrackFromPost(TrackId){
        this._WindowScrollY = window.scrollY
        this.ClickFollowTrack(TrackId)
    }

    /**
     * Show track to follow on map
     * @param {String} TrackId Id of track
     */
    ClickFollowTrack(TrackId){
        // Add wainting box
        this.BuildWaitingBox()
        // Get Track Data
        let FctData = {TrackId: TrackId, GetData: "GeoJSon"}
        GlobalCallApiPromise("ApiGetTrackData", FctData, "", "").then((reponse)=>{
            this.RemoveWaitingBox()
            this.RenderTrackToFollowOnMap(TrackId, reponse)
        },(erreur)=>{
            this.RemoveWaitingBox()
            alert(erreur)
        })
    }

    /**
     * Show view Add Modify Track
     * @param {Object} Data Data of track to update
     */
    ClickUpdateTrackData(Data){
        document.getElementById(this._ConteneurTrackData).innerHTML = ""
        this.LoadViewAddTrack(false, Data)
    }

    /**
     * Open the module bulid track to modify the track
     * @param {String} TrackId Id of track do modify with track builder
     * @param {String} TrackName Name of track to modify
     * @param {String} TrackGroup Group of trakc to modify
     * @param {Boolean} Public Is track public
     * @param {String} Description Description of track
     */
    ClickModifyTrack(TrackId, TrackName, TrackGroup, Public, Description){
        GlobalReset()
        this.GeoXCreateTrackView.InitiationModifyMyTrack(this._UserGroup, TrackId, TrackName, TrackGroup, Public, Description)
    }

    /**
     * Delete a track
     * @param {String} TrackId Id of track to delete
     * @param {String} TrackName Name of track to delete
     */
    ClickDeleteTrack(TrackId, TrackName){
        if (confirm(`Do you want to delete track : ${TrackName}?`)){
            let FctData = {Action: "Delete", TrackId : TrackId}
            GlobalCallApiPromise("ApiManageTrack", FctData, "", "").then((reponse)=>{
                this.LoadView()
            },(erreur)=>{
                this.ShowErrorMessage(erreur)
            })
        }
    }

    /**
     * Show link of track
     * @param {String} TrackId Id of track
     */
    ClickGetLinkOfTrack(TrackId){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte(window.location.origin + "/getmap/?trackid=" + TrackId, "", "Text", "margin-top: 2rem; margin-bottom: 2rem; user-select: text; -webkit-user-select: text;"))
        CoreXWindow.BuildWindow(HTMLContent)
    }

    /**
     * Download GPX file
     * @param {String} TrackId Id of track
     * @param {String} Name Name of track
     */
    ClickDownloadGPX(TrackId, Name){
        let FctData = {TrackId: TrackId, GetData: "GPX"}
        GlobalCallApiPromise("ApiGetTrackData", FctData, "", "").then((reponse)=>{
            var link = document.createElement('a')
            link.download = `${Name}.gpx`
            var blob = new Blob([reponse], {typde: 'text/plain'})
            link.href = window.URL.createObjectURL(blob)
            link.click()
        },(erreur)=>{
            alert(erreur)
        })
    }

    /**
     * Hide conteneur follow on track and show previous conteneur
     */
    ClickStopFollowingTrack(){
        // Vider DivMapFollow
        document.getElementById(this._ConteneurFollowTrackOnMap).innerHTML = ""

        // Stop Follow Track
        this._FollowMyTrack = null

        this.RestoreView()
    }

    /**
     * Send data of new track
     */
    ClickSendAddTrack(){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            var fileCmd = "FileSelecteur.click()"
            eval(fileCmd)
        } else {
            this.ShowErrorMessage("Enter a name and a group before selecting and sending your file")
        }
    }

    /**
     * Send updated data of track
     * @param {String} TrackId Id of track to update
     */
    ClickSendUpdateTrack(TrackId){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            document.getElementById("SelectAndSend").innerHTML="Send..."
            document.getElementById("SelectAndSend").disabled = true
            let Track = new Object()
            Track.Name = document.getElementById("InputTrackName").value 
            Track.Group = document.getElementById("InputTrackGroup").value 
            Track.Public = document.getElementById("TogglePublic").checked 
            Track.MultiToOneLine = true
            Track.FileContent = null
            Track.GeoJson = null
            Track.Image = null
            Track.Id = TrackId
            Track.Description = document.getElementById("DivContDesc").innerText
            Track.Color = (document.getElementById("SelectColor")) ? document.getElementById("SelectColor").value : "#0000FF"
            // Data to send
            let FctData = {Action: "Modify", TrackData : Track}
            GlobalCallApiPromise("ApiManageTrack", FctData, "", "").then((reponse)=>{
                this.Initiation()
            },(erreur)=>{
                // changer le nom du boutton
                document.getElementById("SelectAndSend").innerHTML="Error"
                // Show error
                this.ShowErrorMessage(erreur)
            })
        } else {
            this.ShowErrorMessage("Enter a name and a group before selecting and sending your file")
        }
    }

    /**
     * Cancel Add or Modify track
     */
    ClickCancelAddModifyTrack(){
        document.getElementById(this._ConteneurAddTrack).innerHTML = ""
        if (!this._StartWithLoadViewManageTrack){
            this._StartWithLoadViewManageTrack = true
            this.LoadView(this._ViewPost)
        } else {
            this.RestoreView()
        }
    }

    /**
     * executee lors d'un click sur un marker
     * @param {String} TrackId Track id of the clicked marker
     */
    ClickOnMarker(TrackId){
        this.RenderTrackDataOnMap(TrackId)
        this.RenderTrackGeoJSonOnMap(this._Map, TrackId)
    }

    /**
     * Click on Filter button
     */
    ClickOnFilter(){
        alert("ToDo")
    }

    /**
     * Restore current view
     */
    RestoreView(){
        switch (this._ViewCurrent ) {
            case this._ViewPost:
                // Show ConteneurManageTrack
                document.getElementById(this._ConteneurPosts).style.display = "flex"
                // Hide ConteneurViewOnMap
                document.getElementById(this._ConteneurViewOnMap).style.display = "none"
                // Hide ConteneurAddTrack
                document.getElementById(this._ConteneurAddTrack).style.display = "none"
                // Hide ConteneurTrackData
                document.getElementById(this._ConteneurTrackData).style.display = "none"
                // Hide ConteneurFollowTrackOnMap
                document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
                // Hide ConteneurListTrack
                document.getElementById(this._ConteneurListTrack).style.display = "none"

                // Scroll
                window.scrollTo(0, this._WindowScrollY)
                break;
            case this._ViewMap:
                // Hide ConteneurManageTrack
                document.getElementById(this._ConteneurPosts).style.display = "none"
                // Show ConteneurViewOnMap
                document.getElementById(this._ConteneurViewOnMap).style.display = "flex"
                // Hide ConteneurAddTrack
                document.getElementById(this._ConteneurAddTrack).style.display = "none"
                // Hide ConteneurTrackData
                document.getElementById(this._ConteneurTrackData).style.display = "none"
                // Hide ConteneurFollowTrackOnMap
                document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
                // Hide ConteneurListTrack
                document.getElementById(this._ConteneurListTrack).style.display = "none"

                break;
            case this._ViewListOfTrack:
                // Show ConteneurManageTrack
                document.getElementById(this._ConteneurPosts).style.display = "none"
                // Hide ConteneurViewOnMap
                document.getElementById(this._ConteneurViewOnMap).style.display = "none"
                // Hide ConteneurAddTrack
                document.getElementById(this._ConteneurAddTrack).style.display = "none"
                // Hide ConteneurTrackData
                document.getElementById(this._ConteneurTrackData).style.display = "none"
                // Hide ConteneurFollowTrackOnMap
                document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
                // Hide ConteneurListTrack
                document.getElementById(this._ConteneurListTrack).style.display = "flex"

                // Scroll
                window.scrollTo(0, this._WindowScrollY)
                break;
            default:
                // Show ConteneurManageTrack
                document.getElementById(this._ConteneurPosts).style.display = "flex"
                // Hide ConteneurViewOnMap
                document.getElementById(this._ConteneurViewOnMap).style.display = "none"
                // Hide ConteneurAddTrack
                document.getElementById(this._ConteneurAddTrack).style.display = "none"
                // Hide ConteneurTrackData
                document.getElementById(this._ConteneurTrackData).style.display = "none"
                // Hide ConteneurFollowTrackOnMap
                document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
                // Hide ConteneurListTrack
                document.getElementById(this._ConteneurListTrack).style.display = "none"

                // Scroll
                window.scrollTo(0, this._WindowScrollY)
                break;
        }
        // show Action Button
        GlobalDisplayAction('On')
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
     * Build content of a "image + text" button
     * @param {src} Image src image value of the button
     * @param {string} Text text of the button
     * @returns 
     */
    BuildImageAndTextButtonContent(Image, Text){
        return `<div style="display: flex;justify-content: center; align-content: center; align-items: center;"><img src="${Image}" alt="icon" width="20" height="20"> <div style="margin-left: 0.5vw;">${Text}</div></div>`
    }

    /**
     * Build wainting Box
     */
    BuildWaitingBox(){
        // Add WaitingBox
        let Content = CoreXBuild.DivFlexColumn("")
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Texte waiting
        Content.appendChild(CoreXBuild.DivTexte("Waiting data...", "", "Text"))
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Show window
        CoreXWindow.BuildWindow(Content)
    }

    /**
     * Hide wainting Box
     */
    RemoveWaitingBox(){
        CoreXWindow.DeleteWindow()
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
     * Convertir un GPX en une image de la track
     * @param {string} GPX Gpx data
     */
    async ConvertGpxToImg(GPX){
        let Div = document.getElementById(this._DivMapAddTrack )
        let MyGpxToImg = new GpxToImg(GPX, Div)
        let ReponseGpxToImg = await MyGpxToImg.Convert()
        if (ReponseGpxToImg.Error){
            // changer le nom du boutton
            document.getElementById("SelectAndSend").innerHTML="Error"
            this.ShowErrorMessage(ReponseGpxToImg.ErrorMsg)
        } else {
            this.SendAddTrack(GPX, ReponseGpxToImg.Img, ReponseGpxToImg.GeoJson)
        }
    }

    /**
     * Send data of new or existing track to the server
     * @param {String} TrackId Id of track to modify
     * @param {String} Gpx GPX data
     * @param {Src} Image Image de la track
     * @param {String} GeoJson GeoJson de la track
     */
    SendAddTrack(Gpx = null, Image = null, GeoJson = null){
        document.getElementById("SelectAndSend").innerHTML="Send..."
        let Track = new Object()
        Track.Name = document.getElementById("InputTrackName").value 
        Track.Group = document.getElementById("InputTrackGroup").value 
        Track.Public = document.getElementById("TogglePublic").checked 
        Track.MultiToOneLine = true
        Track.FileContent = Gpx
        Track.GeoJson = GeoJson
        Track.Image = Image
        Track.Id = null
        Track.Description = document.getElementById("DivContDesc").innerText
        Track.Color = (document.getElementById("SelectColor")) ? document.getElementById("SelectColor").value : "#0000FF"
        // Data to send
        let FctData = {Action: "Add", TrackData : Track}
        GlobalCallApiPromise("ApiManageTrack", FctData, "", "").then((reponse)=>{
            this.ClickCancelAddModifyTrack()
            this.GetMyGroups()
        },(erreur)=>{
            // changer le nom du boutton
            document.getElementById("SelectAndSend").innerHTML="Error"
            // Show error
            this.ShowErrorMessage(erreur)
        })
    }
}

// Creation de l'application
let MyGeoXManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("My Tracks", IconGeoX.GeoXManageTracks(), MyGeoXManageTracks.Initiation.bind(MyGeoXManageTracks))