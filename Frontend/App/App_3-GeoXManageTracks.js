class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._ConteneurManageTrack = "ConteneurManageTrack"
        this._ConteneurViewOnMap = "ConteneurViewOnMap"
        this._ConteneurAddTrack = "ConteneurAddTrack"
        this._ConteneurTrackData = "ConteneurTrackData"
        this._ConteneurFollowTrackOnMap = "ConteneurFollowTrackOnMap"
        this._DivListOfMyTracksData = "DivListOfMyTracksData"
        this._DivDataOfOneTrack = "DivDataOfOneTrack"
        this._PageOfPosts = 0

        let me = this
        this._Observer = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetAllMyTracksData()
                    me._Observer.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

        this._StartWithLoadViewManageTrack = true
        this._ShowOnMap = false
        this._WindowScrollY = 0

        this._FollowMyTrack = null
    }

    /**
     * Initiation du module
     * @param {Boolean} StartWithLoadViewManageTrack Start with Load view Manage Track
     */
    Initiation(StartWithLoadViewManageTrack = true){
        this._StartWithLoadViewManageTrack = StartWithLoadViewManageTrack
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // Load Data
        this.LoadView(this._ShowOnMap)
    }

    /**
     * Load view de l'application
     */
    LoadView(ShowOnMap = false){
        this._ShowOnMap = ShowOnMap
        // Clear data
        this._PageOfPosts = 0
        // Clear view
        this._DivApp.innerHTML=""
        // Contener Manage Track
        let ConteneurManageTrack = CoreXBuild.DivFlexColumn(this._ConteneurManageTrack)
        ConteneurManageTrack.style.display = "none"
        this._DivApp.appendChild(ConteneurManageTrack)
        // Contener View on map
        let ConteneurViewOnMap = CoreXBuild.DivFlexColumn(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "none"
        this._DivApp.appendChild(ConteneurViewOnMap)
        // Contener add track
        let ConteneurAddTrack = CoreXBuild.DivFlexColumn(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "none"
        this._DivApp.appendChild(ConteneurAddTrack)
        // Conteneur Track Data
        let ConteneurTrackData = CoreXBuild.DivFlexColumn(this._ConteneurTrackData)
        ConteneurTrackData.style.display = "none"
        this._DivApp.appendChild(ConteneurTrackData)
        // Conteneur Follow track on map
        this._DivApp.appendChild(CoreXBuild.Div(this._ConteneurFollowTrackOnMap, "", "height: 100vh; width: 100%; display: none;")) 
        // Start Load data
        if (this._StartWithLoadViewManageTrack){
            if (this._ShowOnMap){
                this.LoadViewOnMap()
            } else {
                this.LoadViewManageTracks()
            }
        } else {
            this.LoadViewAddTrack()
        }
    }

    /**
     * Load de la vue Manage Track
     */
    LoadViewManageTracks(){
        this._ShowOnMap = false
        // Show ConteneurManageTrack
        let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
        ConteneurManageTrack.style.display = "flex"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide Action Button
        GlobalDisplayAction('On')

        // Titre de l'application
        ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("My Tracks", "", "Titre"))
        // Button view on map
        ConteneurManageTrack.appendChild(CoreXBuild.ButtonLeftAction(this.LoadView.bind(this, true), "ActionLeft",  `<img src="${IconGeoX.GeoXMapIcon()}" alt="icon" width="32" height="32">`))
        // Button Add track
        ConteneurManageTrack.appendChild(CoreXBuild.Button(`<img src="${Icon.Add()}" alt="icon" width="32" height="32">`,this.Initiation.bind(this, false),"ButtonLeftActionSecond","ButtonAddTrack"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        BoxTitre.style.width = "60rem"
        BoxTitre.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(BoxTitre)
        BoxTitre.style.marginTop = "2rem"
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 44%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 29%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 13%;"))
        // Liste despost
        let ListofMyPost = CoreXBuild.DivFlexColumn(this._DivListOfMyTracksData)
        ListofMyPost.style.width = "60rem"
        ListofMyPost.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(ListofMyPost)
        // Ajout d'une ligne
        ListofMyPost.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Waiting text
        ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("Waiting data...","WaitingDataManageTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetAllMyTracksData()
    }

    /**
     * Load de la vue Add Track
     */
    LoadViewAddTrack(){
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurManageTrack).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        let ConteneurAddTrack = document.getElementById(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "flex"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide Action Button
        GlobalDisplayAction('Off')

        // Titre de l'application
        ConteneurAddTrack.appendChild(CoreXBuild.DivTexte("Add Track", "", "Titre"))
        
        // ToDo
    }

    /**
     * Load de la vue Map
     */
    LoadViewOnMap(){
        this._ShowOnMap = true
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurManageTrack).style.display = "none"
        // Show ConteneurViewOnMap
        let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "flex"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
        // Hide Action Button
        GlobalDisplayAction('On')

        // Add button manage my track
        ConteneurViewOnMap.appendChild(CoreXBuild.ButtonLeftAction(this.LoadView.bind(this, false), "ActionLeft",  `<img src="${Icon.Liste()}" alt="icon" width="32" height="32">`))
        // GetData
        // ToDo
    }

    /**
     * Load de la vue Track Data
     * @param {String} TrackId Id of track
     * @param {String} TrackName Name of track
     */
    LoadViewTrackData(TrackId, TrackName){
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurManageTrack).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Show ConteneurTrackData
        let ConteneurTrackData = document.getElementById(this._ConteneurTrackData)
        ConteneurTrackData.style.display = "flex"
        // Hide ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
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
        DivDataOfOneTrack.appendChild(CoreXBuild.DivTexte(`Waiting data of track: ${TrackName}`,"WaitingDataTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))

        // get InfoOnTrack data
        this.GetInfoOnTrack(TrackId)
    }

    /**
     * Get All My Tracks information
     */
    GetAllMyTracksData(){
        let FctData = {Page: this._PageOfPosts}
        GlobalCallApiPromise("ApiGetMyPosts", FctData, "", "").then((reponse)=>{
            this.RenderAllMyTracksDataInViewManageTrack(reponse)
        },(erreur)=>{
            alert("Error: " + erreur)
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
            DivDataOfOneTrack.appendChild(this.BuildDivError(erreur))
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
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "0.7rem"
                BoxTracks.style.marginBottom = "0.7rem"
                document.getElementById(this._DivListOfMyTracksData).appendChild(BoxTracks)
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
                // Ajout d'une ligne
                document.getElementById(this._DivListOfMyTracksData).appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
                // si l'element est l'element milieu
                if (CurrentpointData == MiddlepointData){
                    // ajouter le listener pour declancher le GetPosts
                    this._Observer.observe(BoxTracks)
                }
                CurrentpointData ++
            });
        } else {
            // End of Post
            let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
            ConteneurManageTrack.appendChild(this.BuildDivError("End of posts"))
            // Remove WaitingDataManageTrack
            if (document.getElementById("WaitingDataManageTrack")){
                ConteneurManageTrack.removeChild(document.getElementById("WaitingDataManageTrack"))
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
        let ButtonUpdate = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Pencil(), "Update Data"), this.ClickUpdateTrackData.bind(this, Data._id), "CloseButton", "Update")
        DivButtonAction.appendChild(ButtonUpdate)
        // Button Modify
        let ButtonModify = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.ModifyTrack(), "Modify Track"), this.ClickModifyTrack.bind(this, Data._id), "CloseButton", "Modify")
        DivButtonAction.appendChild(ButtonModify)
        // Button Delete
        let ButtonDelete = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Trash(), "Delete Track"), this.ClickDeleteTrack.bind(this, Data._id), "CloseButton", "Delete")
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
     * Render track to follow on map
     * @param {String} TrackId id of track
     * @param {Object} TrackGeoJson GeoJson Object
     */
    RenderTrackToFollowOnMap(TrackId, TrackGeoJson){
        // Vider le _ConteneurTrackData 
        document.getElementById(this._ConteneurTrackData).innerHTML =""
        // Hide ConteneurManageTrack
        document.getElementById(this._ConteneurManageTrack).style.display = "none"
        // Hide ConteneurViewOnMap
        document.getElementById(this._ConteneurViewOnMap).style.display = "none"
        // Hide ConteneurAddTrack
        document.getElementById(this._ConteneurAddTrack).style.display = "none"
        // Hide ConteneurTrackData
        document.getElementById(this._ConteneurTrackData).style.display = "none"
        // Show ConteneurFollowTrackOnMap
        document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "block"
        // On efface le bouton menu action
        GlobalDisplayAction('Off')

        // Start Follow Track on map
        let TrackData = {TrackId: TrackId, TrackGeoJson: TrackGeoJson}
        this._FollowMyTrack = new FollowTrackOnMap(this._ConteneurFollowTrackOnMap, TrackData)
        this._FollowMyTrack.OnStop = this.ClickStopFollowingTrack.bind(this)
        this._FollowMyTrack.Start()
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
        if (this._ShowOnMap){
            // Hide ConteneurManageTrack
            document.getElementById(this._ConteneurManageTrack).style.display = "none"
            // Show ConteneurViewOnMap
            let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
            ConteneurViewOnMap.style.display = "flex"
            // Hide ConteneurAddTrack
            document.getElementById(this._ConteneurAddTrack).style.display = "none"
            // Hide ConteneurTrackData
            document.getElementById(this._ConteneurTrackData).style.display = "none"
            // Hide ConteneurFollowTrackOnMap
            document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
            // Hide Action Button
            GlobalDisplayAction('Off')
        } else {
            // Show ConteneurManageTrack
            let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
            ConteneurManageTrack.style.display = "flex"
            // Hide ConteneurViewOnMap
            document.getElementById(this._ConteneurViewOnMap).style.display = "none"
            // Hide ConteneurAddTrack
            document.getElementById(this._ConteneurAddTrack).style.display = "none"
            // Hide ConteneurTrackData
            document.getElementById(this._ConteneurTrackData).style.display = "none"
            // Hide ConteneurFollowTrackOnMap
            document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
            // Hide Action Button
            GlobalDisplayAction('On')
            // Scroll
            window.scrollTo(0, this._WindowScrollY)
        }
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

    ClickUpdateTrackData(TrackId){
        // ToDo
    }

    ClickModifyTrack(TrackId){
        // ToDo
    }

    ClickDeleteTrack(TrackId){
        // ToDo
    }

    /**
     * Show link of track
     * @param {String} TrackId Id of track
     */
    ClickGetLinkOfTrack(TrackId){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte(window.location.origin + "/getmap/?trackid=" + TrackId, "", "Text", "margin-top: 2rem; margin-bottom: 2rem; user-select: text;"))
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

        if (this._ShowOnMap){
            // Hide ConteneurManageTrack
            document.getElementById(this._ConteneurManageTrack).style.display = "none"
            // Show ConteneurViewOnMap
            let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
            ConteneurViewOnMap.style.display = "flex"
            // Hide ConteneurAddTrack
            document.getElementById(this._ConteneurAddTrack).style.display = "none"
            // Hide ConteneurTrackData
            document.getElementById(this._ConteneurTrackData).style.display = "none"
            // Hide ConteneurFollowTrackOnMap
            document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
            // Hide Action Button
            GlobalDisplayAction('Off')
        } else {
            // Show ConteneurManageTrack
            let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
            ConteneurManageTrack.style.display = "flex"
            // Hide ConteneurViewOnMap
            document.getElementById(this._ConteneurViewOnMap).style.display = "none"
            // Hide ConteneurAddTrack
            document.getElementById(this._ConteneurAddTrack).style.display = "none"
            // Hide ConteneurTrackData
            document.getElementById(this._ConteneurTrackData).style.display = "none"
            // Hide ConteneurFollowTrackOnMap
            document.getElementById(this._ConteneurFollowTrackOnMap).style.display = "none"
            // Hide Action Button
            GlobalDisplayAction('On')
            // Scroll
            window.scrollTo(0, this._WindowScrollY)
        }

        // Scroll to
        window.scrollTo(0, this._WindowScrollY);
    }

    /**
     * Build HTML div with error message
     * @param {String} MyError Error message
     * @returns HTML element div
     */
    BuildDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerText = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        return diverror
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
        Content.appendChild(CoreXBuild.DivTexte("Waiting data...", "", "text"))
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
}

// Creation de l'application
let MyGeoXManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", IconGeoX.GeoXManageTracks(), MyGeoXManageTracks.Initiation.bind(MyGeoXManageTracks))