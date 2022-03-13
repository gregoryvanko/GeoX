class GeoXManageTracks {
    constructor(){
        this._DivApp = NanoXGetDivApp()
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
        this._ViewPrevious = this._ViewPost

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
        this._WindowScrollY = 0

        this._Map = null
        this._FollowMyTrack = null
        this._UserGroup = null

        this.GeoXCreateTrackView = MyGeoXCreateTrack

        this._FiltrePost = {DistanceMin: 1, DistanceMax: 200, Group: "", AllGroups: null}

        this._PointerRenderAllTrack = 0
        this._CancelLoadingRenderAllTrack = false
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
        let ConteneurPost = NanoXBuild.DivFlexColumn(this._ConteneurPosts, null, "width: 100%;")
        ConteneurPost.style.display = "none"
        this._DivApp.appendChild(ConteneurPost)
        // Contener View on map
        let ConteneurViewOnMap = NanoXBuild.DivFlexColumn(this._ConteneurViewOnMap, null, "width: 100%;")
        ConteneurViewOnMap.style.display = "none"
        this._DivApp.appendChild(ConteneurViewOnMap)
        // Contener add track
        let ConteneurAddTrack = NanoXBuild.DivFlexColumn(this._ConteneurAddTrack, null, "width: 100%;")
        ConteneurAddTrack.style.display = "none"
        this._DivApp.appendChild(ConteneurAddTrack)
        // Contener Track Data
        let ConteneurTrackData = NanoXBuild.DivFlexColumn(this._ConteneurTrackData, null, "width: 100%;")
        ConteneurTrackData.style.display = "none"
        this._DivApp.appendChild(ConteneurTrackData)
        // Contener Follow track on map
        this._DivApp.appendChild(NanoXBuild.Div(this._ConteneurFollowTrackOnMap, null, "height: 100vh; width: 100%; display: none;")) 
        // Contener List of track
        let ConteneurListTrack = NanoXBuild.DivFlexColumn(this._ConteneurListTrack, null, "width: 100%;")
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
                this.LoadViewAddModifyTrack()
                break;
            case this._ViewListOfTrack:
                this.LoadListView()
                break;
            default:
                this.LoadViewMyPosts()
                break;
        }
        // Log serveur load view Post
        NanoXApiPostLog("User Load module My Tracks, view " + this._ViewCurrent)
    }

    /**
     * Load de la vue Post
     */
    LoadViewMyPosts(){
        this._ViewCurrent = this._ViewPost
        this._ViewPrevious = this._ViewCurrent
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

        // Titre de l'application
        ConteneurMyPost.appendChild(NanoXBuild.DivText("My Tracks", null, "Titre"))

        // Add Button
        this.AddButtonViewMyPosts()

        // Liste des post
        let ListofMyPost = NanoXBuild.Div(this._DivListOfMyPostsData, "DivPostApp")
        ConteneurMyPost.appendChild(ListofMyPost)
        // Waiting text
        ConteneurMyPost.appendChild(NanoXBuild.DivText("Waiting data...","WaitingDataManageTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetAllMyPosts()
    }

    AddButtonViewMyPosts(){
        //Show Menu Bar
        NanoXShowMenuBar(true)
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // Clear Right button
        NanoXClearMenuButtonRight()

        // Set menu bar not translucide
        NanoXSetMenuBarTranslucide(false)
        // show name in menu bar
        NanoXShowNameInMenuBar(true)
        
        // Button Filter
        NanoXAddMenuButtonRight("ButtonFilter", "Filter", Icon.Filter(NanoXGetColorIconMenuBar()), this.ClickOnFilter.bind(this))
        // Button view on map
        NanoXAddMenuButtonRight("ButtonMapOrPost", "Map or Post", IconGeoX.GeoXMapIcon(NanoXGetColorIconMenuBar()), this.LoadView.bind(this, this._ViewMap))
        // Button Listview
        NanoXAddMenuButtonRight("ButtonListView", "List View", null, this.LoadView.bind(this, this._ViewListOfTrack))
        // Button Add track
        NanoXAddMenuButtonRight("ButtonAddTrack", "Add Track", Icon.Add(NanoXGetColorIconMenuBar()), this.LoadViewAddModifyTrack.bind(this))
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

        // Add button
        this.AddButtonViewList()

        // Div pour le titre des colonnes
        let BoxTitre = NanoXBuild.DivFlexRowStart(null, null, "width: 100%;")
        BoxTitre.style.width = "60rem"
        BoxTitre.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(BoxTitre)
        BoxTitre.style.marginTop = "3rem"
        // Titre des colonnes
        BoxTitre.appendChild(NanoXBuild.DivText("Name",null,"TextBoxTitre", "width: 44%; margin-left:1%;"))
        BoxTitre.appendChild(NanoXBuild.DivText("Group",null,"TextBoxTitre", "width: 28%;"))
        BoxTitre.appendChild(NanoXBuild.DivText("Distance",null,"TextBoxTitre", "width: 21%; text-align: right;"))
        // Liste des post
        let ListofMyPost = NanoXBuild.DivFlexColumn(this._DivListOfMyTracksData)
        ListofMyPost.style.width = "60rem"
        ListofMyPost.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(ListofMyPost)
        // Ajout d'une ligne
        let line = NanoXBuild.Line()
        line.style.opacity = "0.5"
        line.style.margin = "1% 0% 0% 0%"
        ListofMyPost.appendChild(line)
        // Waiting text
        ConteneurManageTrack.appendChild(NanoXBuild.DivText("Waiting data...","WaitingDataListTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetAllMyTracksData()
    }

    AddButtonViewList(){
        //Show Menu Bar
        NanoXShowMenuBar(true)
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // Clear Right button
        NanoXClearMenuButtonRight()

        // Set menu bar not translucide
        NanoXSetMenuBarTranslucide(false)
        // show name in menu bar
        NanoXShowNameInMenuBar(true)

        // Button Filter
        NanoXAddMenuButtonRight("ButtonFilter", "Filter", Icon.Filter(NanoXGetColorIconMenuBar()), this.ClickOnFilter.bind(this))
        // Button view post
        NanoXAddMenuButtonRight("ButtonPostView", "Post View", Icon.Post(NanoXGetColorIconMenuBar()), this.LoadView.bind(this, this._ViewPost))
        // Button Add track
        NanoXAddMenuButtonRight("ButtonAddTrack", "Add Track", Icon.Add(NanoXGetColorIconMenuBar()), this.LoadViewAddModifyTrack.bind(this))
    }

    /**
     * Load de la vue Add Track
     */
    LoadViewAddModifyTrack(IsAddTrack = true, TrackData = null){
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

        // Hide Menu Bar
        NanoXShowMenuBar(false)

        // Titre
        if (IsAddTrack){
            // Titre de l'application
            ConteneurAddTrack.appendChild(NanoXBuild.DivText("Add Track", null, "Titre"))
        } else {
            // Titre de l'application
            ConteneurAddTrack.appendChild(NanoXBuild.DivText("Modify Track", null, "Titre"))
        }
        this.RenderAddModifyTrackData(IsAddTrack, TrackData)
    }

    /**
     * Load de la vue Map
     */
    LoadViewOnMap(){
        this._ViewCurrent = this._ViewMap
        this._ViewPrevious = this._ViewCurrent
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

        // Add button
        this.AddButtonViewOnMap()
        
        // Ajout du div qui va contenir la map
        ConteneurViewOnMap.appendChild(NanoXBuild.Div(this._IdDivMap, null, "height: 100vh; width: 100%;"))
        this._Map = new GeoXMap(this._IdDivMap) 
        this._Map.RenderMap()
        this._Map.AddMarkersClusterGroup()
        this._Map.OnClickOnMarker = this.ClickOnMarker.bind(this)
        // Get All marker by page
        this.GetAllMarkersByPage()
    }

    AddButtonViewOnMap(ShowAllTrack = true){
        //Show Menu Bar
        NanoXShowMenuBar(true)
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // Clear Right button
        NanoXClearMenuButtonRight()

        // Set menu bar not translucide
        NanoXSetMenuBarTranslucide(true)
        // show name in menu bar
        NanoXShowNameInMenuBar(true)
        
        // Button Filter
        NanoXAddMenuButtonRight("ButtonFilter", "Filter", Icon.Filter(NanoXGetColorIconMenuBar()), this.ClickOnFilter.bind(this))
        // Button view post
        NanoXAddMenuButtonRight("ButtonPostView", "Post View", Icon.Post(NanoXGetColorIconMenuBar()), this.LoadView.bind(this, this._ViewPost))
        // Button view all tracks
        if (ShowAllTrack){
            NanoXAddMenuButtonRight("ButtonRenderAllTracks", "Show all tracks", Icon.ShowAllTrack(NanoXGetColorIconMenuBar()), this.RenderAllTracksLinesOnMap.bind(this, this._ViewPost))
        } else {
            NanoXAddMenuButtonRight("ButtonPostView", "Post View", Icon.HideAllTrack(NanoXGetColorIconMenuBar()), this.HideAllTracksLinesOnMap.bind(this, this._ViewPost))
        }
        
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

        // Add Button
        this.AddButtonViewTrackData()
        
        // Div Data of track
        let DivDataOfOneTrack = NanoXBuild.DivFlexColumn(this._DivDataOfOneTrack)
        DivDataOfOneTrack.style.width = "45rem"
        DivDataOfOneTrack.style.maxWidth = "100%"
        DivDataOfOneTrack.style.marginTop = "1rem"
        ConteneurTrackData.appendChild(DivDataOfOneTrack)
        // Waiting text
        if (TrackName){
            DivDataOfOneTrack.appendChild(NanoXBuild.DivText(`Waiting data of track: ${TrackName}`,"WaitingDataTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem; overflow-wrap: break-word;"))
        } else {
            DivDataOfOneTrack.appendChild(NanoXBuild.DivText(`Waiting data of track`,"WaitingDataTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        }

        // get InfoOnTrack data
        this.GetInfoOnTrack(TrackId)
        // Log serveur load view Post
        NanoXApiPostLog("User Load module My Tracks, view TrackData")
    }

    AddButtonViewTrackData(){
        //Show Menu Bar
        NanoXShowMenuBar(true)
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // Clear Right button
        NanoXClearMenuButtonRight()

        // Set menu bar translucide
        NanoXSetMenuBarTranslucide(true)
        // hide name in menu bar
        NanoXShowNameInMenuBar(false)

        // Add menu button left
        NanoXAddMenuButtonLeft("ActionLeftBack", "Back", Icon.LeftArrow(NanoXGetColorIconMenuBar()), this.ClickOnBackFromTrackData.bind(this))
    }

    /**
     * Get all my post
     */
    GetAllMyPosts(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost, AllPublicPost: false, ViewPost: true}
        NanoXApiGet("/post/", FctData).then((reponse)=>{
            this.RenderPosts(reponse)
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Get All My Tracks information
     */
    GetAllMyTracksData(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost, AllPublicPost: false, ViewPost: false}
        NanoXApiGet("/post/", FctData).then((reponse)=>{
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
        NanoXApiGet("/post/onepost/" + TrackId).then((reponse)=>{
            this.RenderInfoOnTrackInViewTrackData(reponse)
        },(erreur)=>{
            let DivDataOfOneTrack = document.getElementById(this._DivDataOfOneTrack)
            DivDataOfOneTrack.innerHTML =""
            DivDataOfOneTrack.appendChild(NanoXBuild.DivText(erreur, null, "Text", "color:red;"))
        })
    }

    /**
     * Get All groups of user
     */
    GetMyGroups(){
        // Get all group of user
        NanoXApiGet("/track/mygroups").then((reponse)=>{
            this._UserGroup = reponse
            this._FiltrePost.AllGroups = reponse
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Get makers of all tracks by page
     */
    GetAllMarkersByPage(){
        let FctData = {Page: this._PageOfMarkers, Filter: this._FiltrePost, AllPublicPost: false}
        NanoXApiGet("/post/marker/", FctData).then((reponse)=>{
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
     * Render tracks for all markers on map
     */
    GetAndRenderAllTrackGeoJsonOnMap(){
        let ListOfIdToRender = []
        let StartIndex = this._PointerRenderAllTrack * 5
        let EndIndex = ((this._PointerRenderAllTrack + 1) * 5) - 1
        if (EndIndex >= this._AllMarkers.length){EndIndex = this._AllMarkers.length - 1}
        for (let index = StartIndex; index <= EndIndex; index++) {
            ListOfIdToRender.push(this._AllMarkers[index]["_id"])
        }        
        const FctData = {ListOfTrackId: ListOfIdToRender}
        NanoXApiGet("/track/multi/geojson/", FctData).then((reponse)=>{
            // Afficher la porgression
            let prog = Math.floor((EndIndex / (this._AllMarkers.length - 1)) * 100)
            if (document.getElementById("MyProgressRing")){
                document.getElementById("MyProgressRing").setAttribute('progress', prog);
            }
            // Afficher les track
            reponse.forEach(element => {
                this._Map.AddTrackOnMap(element._id, element.GeoJsonData, false, element.Color)
            }); 
            // Vérifier si il faut continuer
            if ((EndIndex != this._AllMarkers.length - 1) &&(this._CancelLoadingRenderAllTrack == false) ){
                // On a continue a chager les track
                this._PointerRenderAllTrack += 1
                this.GetAndRenderAllTrackGeoJsonOnMap()
            } else {
                setTimeout(function(){document.body.removeChild(document.getElementById("InfoBox"))}, 500);
            } 
        },(erreur)=>{
            if (document.getElementById("InfoBox")){document.body.removeChild(document.getElementById("InfoBox"))}
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
            ConteneurMyPost.appendChild(NanoXBuild.DivText("End of tracks", null, "Text", "color:red; margin-top: 1rem; margin-bottom: 1rem;"))
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
                let BoxTracks = NanoXBuild.DivFlexRowStart(null, null, "width: 100%;")
                BoxTracks.style.marginTop = "0.7rem"
                BoxTracks.style.marginBottom = "0.7rem"
                BoxTracks.appendChild(NanoXBuild.DivText(element.Name,null,"TextSmall", "width: 44%; margin-left:1%; padding:0.2rem;"))
                BoxTracks.appendChild(NanoXBuild.DivText(element.Group,null,"TextSmall", "width: 28%; padding:0.2rem;"))
                BoxTracks.appendChild(NanoXBuild.DivText(element.Length + " Km",null,"TextSmall", "width: 21%; padding:0.2rem;     text-align: right;"))
                if (! element.Public){
                    let DivPublic = NanoXBuild.Div(null, null, "width: 6%;")
                    DivPublic.style.textAlign = "right"
                    BoxTracks.appendChild(DivPublic)
                    DivPublic.appendChild(NanoXBuild.Image64(Icon.Key(),"", "IconeInList", ""))
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
                    let line = NanoXBuild.Line()
                    line.style.opacity = "0.5"
                    document.getElementById(this._DivListOfMyTracksData).appendChild(line)
                }
            });
        } else {
            // End of Post
            let ConteneurManageTrack = document.getElementById(this._ConteneurListTrack)
            ConteneurManageTrack.appendChild(NanoXBuild.DivText("End of tracks", null, "Text", "color:red; margin-top: 1rem; margin-bottom: 1rem;"))
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
        let DivButtonAction = NanoXBuild.DivFlexRowSpaceAround("ButtonAction", null, "width: 100%")
        DivDataOfOneTrack.appendChild(DivButtonAction)
        // Button Go To Start
        let ButtonGo = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.StartFlag(), "Go to start"), this.ClickGoToStart.bind(this, Data.StartPoint), "GoToStart", "CloseButton")
        DivButtonAction.appendChild(ButtonGo)
        // Button Follow track
        let ButtonFollow = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Follow(), "Follow Track"), this.ClickFollowTrack.bind(this, Data._id), "FollowTrack", "CloseButton")
        DivButtonAction.appendChild(ButtonFollow)
        // Button Update
        let ButtonUpdate = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Pencil(), "Update Data"), this.ClickUpdateTrackData.bind(this, Data),"Update", "CloseButton")
        DivButtonAction.appendChild(ButtonUpdate)
        // Button Modify
        let ButtonModify = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.ModifyTrack(), "Modify Track"), this.ClickModifyTrack.bind(this, Data._id, Data.Name, Data.Group, Data.Public, Data.Description), "Modify", "CloseButton")
        DivButtonAction.appendChild(ButtonModify)
        // Button Delete
        let ButtonDelete = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Trash(), "Delete Track"), this.ClickDeleteTrack.bind(this, Data._id, Data.Name), "Delete", "CloseButton")
        DivButtonAction.appendChild(ButtonDelete)
        // Button Link
        let ButtonLink = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Link(), "Get link"), this.ClickGetLinkOfTrack.bind(this, Data._id), "Link", "CloseButton")
        DivButtonAction.appendChild(ButtonLink)
        // Button download GPX
        let ButtonGPX = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Download(), "GPX"), this.ClickDownloadGPX.bind(this, Data._id, Data.Name), "GPX", "CloseButton")
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

        // Add Button
        this.AddButtonViewTrackToFollowOnMap()

        // Start Follow Track on map
        let TrackData = {TrackId: TrackId, TrackGeoJson: TrackGeoJson}
        this._FollowMyTrack = new FollowTrackOnMap(this._ConteneurFollowTrackOnMap, TrackData)
        this._FollowMyTrack.OnStop = this.ClickStopFollowingTrack.bind(this)
        this._FollowMyTrack.Start()
    }

    AddButtonViewTrackToFollowOnMap(){
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // Clear Right button
        NanoXClearMenuButtonRight()

        // Hide menu bar
        NanoXShowMenuBar(false)
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
        ConteneurAddTrack.appendChild(NanoXBuild.InputWithLabel("InputBox", "Name:", "Text", "InputTrackName",Name, "Input Text", "text", "Name", null, true))
        // Input `Group
        ConteneurAddTrack.appendChild(NanoXBuild.InputWithLabel("InputBox", "Group:", "Text", "InputTrackGroup",Group, "Input Text", "text", "Group"))
        // Add AutoComplete
        let me = this
        document.getElementById("InputTrackGroup").setAttribute("autocomplete", "off")
        autocomplete({
            input: document.getElementById("InputTrackGroup"),
            minLength: 0,
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
        let DivDescription = NanoXBuild.Div(null, "InputBox Text")
        ConteneurAddTrack.appendChild(DivDescription)
        DivDescription.appendChild(NanoXBuild.DivText("Description", null, "Text", ""))
        let DivContDesc = NanoXBuild.Div("DivContDesc", "DivContentEdit")
        DivContDesc.innerText = Description
        DivContDesc.contentEditable = "True"
        DivContDesc.style.fontSize = "1rem"
        DivDescription.appendChild(DivContDesc)
        // Toggle Public
        let DivTooglePublic = NanoXBuild.Div(null,"Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        ConteneurAddTrack.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(NanoXBuild.DivText("Public:"))
        DivTooglePublic.appendChild(NanoXBuild.ToggleSwitch({Id: "TogglePublic",Checked: Public, HeightRem: 2}))
        // Color
        let divColor = NanoXBuild.Div(null, "InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center; flex-wrap: wrap;")
        let TextColor = NanoXBuild.DivText("Color:", null, "Text")
        divColor.appendChild(TextColor)
        let inputcolor = document.createElement("input")
        divColor.appendChild(inputcolor)
        inputcolor.setAttribute("id","SelectColor")
        inputcolor.setAttribute("type","color")
        inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; height: 2rem; border: 1px solid black;")
        inputcolor.value = Color
        ConteneurAddTrack.appendChild(divColor)
        // Div Button
        let DivBoxButton = NanoXBuild.Div(null, "InputBox")
        ConteneurAddTrack.appendChild(DivBoxButton)
        let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
        DivBoxButton.appendChild(DivButton)
        if (IsAddTrack){
            // Button Add
            DivButton.appendChild(NanoXBuild.Button("Select GPX",this.ClickSendAddTrack.bind(this), "SelectAndSend","Text Button ButtonWidth30"))
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
            DivButton.appendChild(NanoXBuild.Button("Update Track",this.ClickSendUpdateTrack.bind(this, Id), "SelectAndSend","Text Button ButtonWidth30"))
        }
        // Button cancel
        DivButton.appendChild(NanoXBuild.Button("Cancel",this.ClickCancelAddModifyTrack.bind(this), "Cancel","Text Button ButtonWidth30"))
        // Empty space
        ConteneurAddTrack.appendChild(this.BuildEmptySpace())
        // Div Map
        if (IsAddTrack){
            let DivMapAddTrack = NanoXBuild.Div(this._DivMapAddTrack)
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
    RenderTrackDataOnMap(TrackId, FromMarker = true){
        // Get Track data
        let TrackData =  this._AllMarkers.find(x => x._id === TrackId)
        // Build div track data on map
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap != null){
            document.getElementById(this._ConteneurViewOnMap).removeChild(DivTrackDataOnMap)
        }
        DivTrackDataOnMap = NanoXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap")
        document.getElementById(this._ConteneurViewOnMap).appendChild(DivTrackDataOnMap)
        DivTrackDataOnMap.addEventListener("click", this.ClickOnTrackData.bind(this, TrackId, TrackData.Name))
        // Name and close buttion
        let divNameAndClose = NanoXBuild.Div(null, null, "width: 100%; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center;")
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
        button.onclick = this.RemoveTrackDataOnMap.bind(this, FromMarker)
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
    RemoveTrackDataOnMap(FromMarker = true){
        event.stopPropagation()

        // Remove all track on map
        if (FromMarker){this._Map.RemoveAllTracks()}
        
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
        Map.RemoveAllTracks()
        NanoXApiGet("/track/geojson/" + TrackId).then((reponse)=>{
            Map.AddTrackOnMap(TrackId, reponse.GeoJsonData, false, null)        
        },(erreur)=>{
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Show all track line on track
     */
    RenderAllTracksLinesOnMap(){
        let MaxTrack = 60
        if (this._AllMarkers.length > MaxTrack){
            // Show message box to download all track
            let InfoBox = NanoXBuild.Div("InfoBox", "InfoBox", "width: 20rem;")
            // Texte
            InfoBox.appendChild(NanoXBuild.DivText(`Sorry, not possible to load more than ${MaxTrack} tracks...`, null, null, "width: 80%; margin-left: auto; margin-right: auto; margin-bottom: 2rem; margin-top: 1rem;"))
            // Button Close
            let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
            InfoBox.appendChild(DivButton)
            DivButton.appendChild(NanoXBuild.Button("Cancel",this.ClickCloseInfox.bind(this), "Cancel","Text Button ButtonWidth30"))
            // Add InfoBox to body
            document.body.appendChild(InfoBox)
        } else {
            // Show message box to download all track
            let InfoBox = NanoXBuild.Div("InfoBox", "InfoBox", "width: 20rem;")
            // Texte
            InfoBox.appendChild(NanoXBuild.DivText("Load all tracks on map", null, null, "width: 80%; margin-left: auto; margin-right: auto; margin-bottom: 2rem; margin-top: 1rem;"))
            // Pourcentage
            let DivProgressRing = NanoXBuild.Div(null, null, "display: flex; flex-direction:column; justify-content:flex-start;")
            InfoBox.appendChild(DivProgressRing)
            DivProgressRing.appendChild(NanoXBuild.ProgressRing({Id:"MyProgressRing", FillColor: "#F5F5F5", Radius:60, RadiusMobile:30, TextColor:"black", ProgressColor:"var(--NanoX-appcolor)"}))
            // Button Cancel
            let DivButton = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
            InfoBox.appendChild(DivButton)
            DivButton.appendChild(NanoXBuild.Button("Cancel",this.ClickCancelRenderAllTracksLinesOnMap.bind(this), "Cancel","Text Button ButtonWidth30"))
            // Add InfoBox to body
            document.body.appendChild(InfoBox)

            // Reset data
            this._PointerRenderAllTrack = 0
            this._CancelLoadingRenderAllTrack = false
            this._Map.RemoveAllTracks()
            this._Map.RemoveAllMarkers()
            this._Map.OnClickOnTrack = this.ClickOnTrack.bind(this)
            this._Map.OnClickOnTrackMarker = this.ClickOnTrack.bind(this)
            // change Button
            this.AddButtonViewOnMap(false)
            // Start downlaod track
            this.GetAndRenderAllTrackGeoJsonOnMap()
            // Log serveur
            NanoXApiPostLog("User load all tracks on map in module My Tracks")
        }
    }

    /**
     * Hide all tracks on map
     */
    HideAllTracksLinesOnMap(){
        // change Button
        this.AddButtonViewOnMap(true)
        // remove all tracks
        this._Map.RemoveAllTracks()
        this._Map.OnClickOnTrack = null
        this._Map.OnClickOnTrackMarker = null
        this.RemoveTrackDataOnMap(false)
        // Add all markers
        this._AllMarkers.forEach(element => {
            this._Map.AddMarker(element)
        });
        // Log serveur
        NanoXApiPostLog("User hide all tracks on map in module My Tracks")
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
        NanoXApiGet("/track/geojson/" + TrackId).then((reponse)=>{
            this.RemoveWaitingBox()
            this.RenderTrackToFollowOnMap(TrackId, reponse.GeoJsonData)
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
        this.LoadViewAddModifyTrack(false, Data)
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
        this.GeoXCreateTrackView.InitiationModifyMyTrack(this._UserGroup, TrackId, TrackName, TrackGroup, Public, Description)
    }

    /**
     * Delete a track
     * @param {String} TrackId Id of track to delete
     * @param {String} TrackName Name of track to delete
     */
    ClickDeleteTrack(TrackId, TrackName){
        if (confirm(`Do you want to delete track : ${TrackName}?`)){
            NanoXApiDelete("/post/" + TrackId).then((reponse)=>{
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
        let HTMLContent = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
        HTMLContent.appendChild(NanoXBuild.DivText(window.location.origin + "/getmap/?trackid=" + TrackId, null, "Text", "margin-top: 2rem; margin-bottom: 2rem; user-select: text; -webkit-user-select: text;"))
        NanoXBuild.PopupCreate(HTMLContent)
    }

    /**
     * Download GPX file
     * @param {String} TrackId Id of track
     * @param {String} Name Name of track
     */
    ClickDownloadGPX(TrackId, Name){
        NanoXApiGet("/track/gpx/" + TrackId).then((reponse)=>{
            var link = document.createElement('a')
            link.download = `${Name}.gpx`
            var blob = new Blob([reponse.GpxData], {type: 'text/plain'})
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
            NanoXApiPatch("/post", Track).then((reponse)=>{
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
        this.RenderTrackDataOnMap(TrackId, true)
        this.RenderTrackGeoJSonOnMap(this._Map, TrackId)
    }

    /**
     * executee lors d'un click sur une track
     * @param {String} TrackId Track id
     */
    ClickOnTrack(TrackId){
        this.RenderTrackDataOnMap(TrackId, false)
    }

    /**
     * Open filter box
     */
    ClickOnFilter(){
        let FilterView = new FilterBox(this._FiltrePost)
        FilterView.Save = this.SetFilter.bind(this)
    }

    /**
     * Cancel render all tracks line on map
     */
    ClickCancelRenderAllTracksLinesOnMap(){
        this._CancelLoadingRenderAllTrack = true
    }

    /**
     * Close Info Box
     */
    ClickCloseInfox(){
        document.body.removeChild(document.getElementById("InfoBox"))
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

                this.AddButtonViewMyPosts()

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

                this.AddButtonViewOnMap()

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

                this.AddButtonViewList()

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

                this.AddButtonViewMyPosts()

                // Scroll
                window.scrollTo(0, this._WindowScrollY)
                break;
        }
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
        let Content = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Texte waiting
        Content.appendChild(NanoXBuild.DivText("Waiting data...", null, "Text"))
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Show window
        NanoXBuild.PopupCreate(Content)
    }

    /**
     * Hide wainting Box
     */
    RemoveWaitingBox(){
        NanoXBuild.PopupDelete()
    }

    /**
     * Show window with error message
     * @param {String} Error Error message
     */
    ShowErrorMessage(Error){
        let Content = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Texte waiting
        Content.appendChild(NanoXBuild.DivText(Error, null, "Text", "color:red;"))
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Show window
        NanoXBuild.PopupCreate(Content)
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
        NanoXApiPost("/post", Track).then((reponse)=>{
            document.getElementById(this._ConteneurAddTrack).innerHTML = ""
            this._StartWithLoadViewManageTrack = true
            this.LoadView(this._ViewPost)
            this.GetMyGroups()
        },(erreur)=>{
            // changer le nom du boutton
            document.getElementById("SelectAndSend").innerHTML="Error"
            // Show error
            this.ShowErrorMessage(erreur)
        })
    }

    /**
     * Apply filter
     * @param {Object} Filter Object filter
     */
    SetFilter(Filter){
        this._FiltrePost = Filter
        // Log serveur load view Post
        NanoXApiPostLog("User change filter")
        // Relaod view
        this.LoadView(this._ViewCurrent)
    }
}

// Creation de l'application
let MyGeoXManageTracks = new GeoXManageTracks()
// Ajout de l'application
NanoXAddModule("My Tracks", IconGeoX.GeoXManageTracks(), MyGeoXManageTracks.Initiation.bind(MyGeoXManageTracks))