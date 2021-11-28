class GeoXActivities {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)

        this._IdDivApp = "divapp"
        this._IdDivTrackInfo = "DivTrackInfo"
        this._IdDivContentTrackInfo = "DivContentTrackInfo"
        this._IdDivMap = "mapidActivites"
        this._IdDivTrackDataOnMap = "DivTrackDataOnMap"
        this._IdDivMapFollow = "mapidFollow"

        this._WindowScrollY = 0
        this._PageOfPosts = 0
        let me = this
        this._Observer = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetPosts()
                    me._Observer.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

        this._UserGroup = null
        this._IsPostPresentation = true

        this._Map = null
        this._FollowMyTrack = null
        this._PageOfMarkers = 0
        this._AllMarkers = []

        this._FiltrePost = {DistanceMin: 1, DistanceMax: 200, HideMyTrack: false}
    }

    Initiation(){
        // Reset page
        this._WindowScrollY = 0
        this._PageOfPosts = 0
        this._UserGroup = null
        this._IsPostPresentation = true
        this._Map = null
        this._FollowMyTrack = null
        this._PageOfMarkers = 0
        this._AllMarkers = []
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

        // si on prensente la vue sous forme de post
        if (this._IsPostPresentation){
            // si on avait affiché la carte on la supprime
            if (this._Map){
                this._Map.RemoveMap()
                this._Map = null
                this._PageOfMarkers = 0
                this._AllMarkers = []
            }
            // Button Map
            Conteneur.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnToogleMapPost.bind(this), "ActionMap",  `<img src="${IconGeoX.GeoXMapIcon()}" alt="icon" width="32" height="32">`))
            // Button Filter
            Conteneur.appendChild(CoreXBuild.Button(`<img src="${Icon.Filter()}" alt="icon" width="32" height="32">`,this.ClickOnFilter.bind(this),"ButtonLeftActionSecond","ButtonFilter"))
            // Titre de l'application
            Conteneur.appendChild(CoreXBuild.DivTexte("Activities", "TitreActivities", "Titre"))
            // DivApp
            let divapp = CoreXBuild.Div(this._IdDivApp, "DivPostApp", "")
            Conteneur.appendChild(divapp)
            // Div Waiting
            let divwaiting = CoreXBuild.DivTexte("Waiting...", "DivWaitingPost", "Texte", "margin-bottom: 2rem;")
            Conteneur.appendChild(divwaiting)
            // Get Posts
            this.GetPosts()
        // Si on presente la vue Map
        } else {
            // Button Post
            Conteneur.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnToogleMapPost.bind(this), "ActionMap",  `<img src="${Icon.Liste()}" alt="icon" width="32" height="32">`))
            // Button Filter
            Conteneur.appendChild(CoreXBuild.Button(`<img src="${Icon.Filter()}" alt="icon" width="32" height="32">`,this.ClickOnFilter.bind(this),"ButtonLeftActionSecond","ButtonFilter"))
            // Ajout du div qui va contenir la map
            Conteneur.appendChild(CoreXBuild.Div(this._IdDivMap, "", "height: 100vh; width: 100%;"))
            this._Map = new GeoXMap(this._IdDivMap) 
            this._Map.RenderMap()
            this._Map.AddMarkersClusterGroup()
            this._Map.OnClickOnMarker = this.ClickOnMarker.bind(this)
            // Get All marker by page
            this.GetAllMarkersByPage()
        }
        
        // DivTrackInfo
        let divtrackinfo = CoreXBuild.Div(this._IdDivTrackInfo, "DivTrackInfo", "margin-left:auto; margin-right:auto;")
        this._DivApp.appendChild(divtrackinfo)
        divtrackinfo.appendChild(CoreXBuild.Div(this._IdDivContentTrackInfo, "DivContentTrackInfo", ""))
        divtrackinfo.appendChild(this.BuildEmptySpace())

        // DivFollowTrack
        this._DivApp.appendChild(CoreXBuild.Div(this._IdDivMapFollow, "", "height: 100vh; width: 100%; display: none;")) 
    }

    BuildEmptySpace(){
        let divempty = document.createElement('div')
        divempty.style.height = "2rem"
        return divempty
    }

    GetPosts(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiGetAllPost", FctData, "", "").then((reponse)=>{
            this.RenderPosts(reponse)
        },(erreur)=>{
            alert("Error: " + erreur)
        })
    }

    GetDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerText = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        return diverror
    }

    RenderPosts (Data){
        if (Data.length != 0){
            let MiddlepointData = Math.ceil(Data.length / 2)-1
            let CurrentpointData = 0
            Data.forEach(element => {
                // Creation du post
                let TempGeoxPsot = new HtmlElemGeoxPost(element)
                TempGeoxPsot.OnClickPost = this.GetTrackData.bind(this, element._id)
                TempGeoxPsot.OnClickSave = this.ClickSaveToMyTrack.bind(this, element._id)
                TempGeoxPsot.OnClickGpx = this.ClickDownloadGPX.bind(this, element._id, element.Name)
                TempGeoxPsot.OnClickGoTo = this.ClickGoToStart.bind(this, element.StartPoint)
                TempGeoxPsot.OnClickFollow = this.ClickFollowTrackOnPost.bind(this, element._id)

                TempGeoxPsot.style.width = "100%"
                document.getElementById(this._IdDivApp).appendChild(TempGeoxPsot)
                // si l'element est l'element milieu
                if (CurrentpointData == MiddlepointData){
                    // ajouter le listener pour declancher le GetPosts
                    this._Observer.observe(TempGeoxPsot)
                }
                CurrentpointData ++
            });
        } else {
            // End of Post
            document.getElementById(this._IdDivApp).appendChild(this.GetDivError("End of posts"))
            // Remove DivWaitingPost
            if (document.getElementById("DivWaitingPost")){
                document.getElementById("Conteneur").removeChild(document.getElementById("DivWaitingPost"))
            }
        }
    }

    ClickFollowTrackOnPost(TrackId){
        // Scroll to
        this._WindowScrollY = window.scrollY
        // Click on follow Track
        this.ClickFollowTrack(TrackId)
    }

    GetTrackData(Id){
        // Scroll to
        this._WindowScrollY = window.scrollY

        // Hide divapp 
        let divApp = document.getElementById("Conteneur")
        divApp.style.display = "none"

        // Hide action button
        GlobalDisplayAction('Off')


        // Show IdDivTrackInfo
        let divTrackInfo = document.getElementById(this._IdDivTrackInfo)
        divTrackInfo.style.display = "flex"

        // Text
        let divwaiting = document.createElement('div')
        divwaiting.id = "DivWaiting"
        divwaiting.innerText = "Waiting data..."
        divwaiting.style.textAlign = "center"
        divwaiting.style.marginTop = "2rem"
        divwaiting.style.marginBottom = "2rem"
        document.getElementById(this._IdDivContentTrackInfo).appendChild(divwaiting)

        let FctData = {PostId: Id}
        GlobalCallApiPromise("ApiGetPostData", FctData, "", "").then((reponse)=>{
            this.RenderTrackData(reponse)
        },(erreur)=>{
            alert("Error: " + erreur)
        })
    }

    RenderTrackData(Data){
        let divbackground = document.getElementById(this._IdDivContentTrackInfo)

        // Remove waiting
        divbackground.removeChild(document.getElementById("DivWaiting"))

        // Close button
        let button = document.createElement('button')
        button.classList.add("ButtonX");
        button.style.marginBottom = "-2.5rem"
        button.style.zIndex = "100"
        button.onclick = this.RemoveTrackData.bind(this)
        divbackground.appendChild(button)

        // Add InfoOnTrack
        let DivData = document.createElement('div')
        DivData.id = "DivData"
        divbackground.appendChild(DivData)
        let InfoTrackView = new InfoOnTrack(Data, "DivData")

        // Div Button Action
        let DivButtonAction = CoreXBuild.DivFlexRowAr("ButtonAction")
        divbackground.appendChild(DivButtonAction)
        // Button Save
        let ButtonSave = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.SaveBlack(), "Save Track"), this.ClickSaveToMyTrack.bind(this, Data._id), "CloseButton", "SaveToMe")
        DivButtonAction.appendChild(ButtonSave)
        // Button download GPX
        let ButtonGPX = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Download(), "GPX"), this.ClickDownloadGPX.bind(this, Data._id, Data.Name), "CloseButton", "GPX")
        DivButtonAction.appendChild(ButtonGPX)
        // Button Go To Start
        let ButtonGo = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.StartFlag(), "Go to start"), this.ClickGoToStart.bind(this, Data.StartPoint), "CloseButton", "GoToStart")
        DivButtonAction.appendChild(ButtonGo)
        // Button Follow track
        let ButtonFollow = CoreXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Follow(), "Follow Track"), this.ClickFollowTrack.bind(this, Data._id), "CloseButton", "FollowTrack")
        DivButtonAction.appendChild(ButtonFollow)
    }

    RemoveTrackData(){
        event.stopPropagation()

        // show divapp
        let divApp = document.getElementById("Conteneur")
        divApp.style.display = "flex"

        // Show action button
        GlobalDisplayAction('On')

        // Hide divinfotrack
        let divTrackInfo = document.getElementById(this._IdDivTrackInfo)
        divTrackInfo.style.display = "none"
        document.getElementById(this._IdDivContentTrackInfo).innerHTML = ""

        // Scroll to
        window.scrollTo(0, this._WindowScrollY);
    }

    ClickSaveToMyTrack(TrackId){
        // Get all group of user
        GlobalCallApiPromise("ApiGetAllGroups", "", "", "").then((reponse)=>{
            this._UserGroup = reponse
        },(erreur)=>{
            console.log(erreur)
        })
        // Open save box
        this.BuildSaveTrackVue(TrackId)
    }

    BuildSaveTrackVue(TrackId){
        let Content = CoreXBuild.DivFlexColumn("")
        // Empty space
        Content.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Titre
        Content.append(CoreXBuild.DivTexte("Save Track", "", "SousTitre"))
        // Input Name
        Content.appendChild(CoreXBuild.InputWithLabel("InputBoxCoreXWindow", "Track Name:", "Text", "InputTrackName","", "Input Text", "text", "Name","",true))
        // Input `Group
        Content.appendChild(CoreXBuild.InputWithLabel("InputBoxCoreXWindow", "Track Group:", "Text", "InputTrackGroup","", "Input Text", "text", "Group","",true))
        // Description
        let DivDescription = CoreXBuild.Div("", "InputBoxCoreXWindow Text", "")
        Content.appendChild(DivDescription)
        DivDescription.appendChild(CoreXBuild.DivTexte("Description", "", "Text", ""))
        let DivContDesc = CoreXBuild.Div("DivContDesc", "DivContentEdit TextSmall", "")
        DivContDesc.contentEditable = "True"
        DivDescription.appendChild(DivContDesc)
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Content.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", true))
        // Error Text
        Content.appendChild(CoreXBuild.DivTexte("", "ErrorSaveTrack", "Text", "Color: red; margin-top: 2vh; height: 4vh;"))
        // Div Button
        let DivButton = CoreXBuild.DivFlexRowAr("")
        Content.appendChild(DivButton)
        // Button save
        DivButton.appendChild(CoreXBuild.Button("Save",this.SaveToMyTrack.bind(this, TrackId),"Text Button ButtonWidth30", "SaveTrack"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.CancelSaveToMyTrack.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Content.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Open Window
        CoreXWindow.BuildWindow(Content)
        // Add AutoComplete
        let me = this
        autocomplete({
            input: document.getElementById("InputTrackGroup"),
            minLength: 1,
            emptyMsg: 'No suggestion',
            fetch: function(text, update) {
                if (me._UserGroup != null){
                    text = text.toLowerCase();
                    var GroupFiltred = me._UserGroup.filter(n => n.toLowerCase().startsWith(text))
                    var suggestions = []
                    GroupFiltred.forEach(element => {
                        var MyObject = new Object()
                        MyObject.label = element
                        suggestions.push(MyObject)
                    });
                    update(suggestions);
                }
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item.label;
            }
        });
    }

    /**
     * Cancel Save track view
     */
    CancelSaveToMyTrack(){
        CoreXWindow.DeleteWindow()
    }

    SaveToMyTrack(TrackId){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            // effacer le message d'erreur
            document.getElementById("ErrorSaveTrack").innerText = ""
            // modifier le boutton save
            document.getElementById("SaveTrack").innerText = "Saving..."
            document.getElementById("SaveTrack").disabled = true
            // Send action
            let NewName = document.getElementById("InputTrackName").value 
            let NewGroup = document.getElementById("InputTrackGroup").value
            let NewPublic = document.getElementById("TogglePublic").checked
            let NewDescription = document.getElementById("DivContDesc").innerText
            let FctData = {TrackId: TrackId, Name: NewName, Group: NewGroup, Public: NewPublic, Description: NewDescription}
            GlobalCallApiPromise("ApiCopyTrack", FctData, "", "").then((reponse)=>{
                // Delete Window
                CoreXWindow.DeleteWindow()
            },(erreur)=>{
                document.getElementById("ErrorSaveTrack").innerText = erreur
                document.getElementById("SaveTrack").disabled = false
            })
        } else {
            document.getElementById("ErrorSaveTrack").innerText = "Enter a name and a group before saving"
        }
    }

    ClickDownloadGPX(Id, Name){
        let FctData = {TrackId: Id, GetData: "GPX"}
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
     * Click on button Map
     */
    ClickOnToogleMapPost(){
        if (this._IsPostPresentation){
            this._IsPostPresentation = false
        } else {
            this._IsPostPresentation = true
            this._PageOfPosts = 0
        }
        this.LoadStartView()
    }

    /**
     * Get makers of all tracks of GeoX by page
     */
    GetAllMarkersByPage(){
        let FctData = {Page: this._PageOfMarkers, Filter: this._FiltrePost}
        GlobalCallApiPromise("ApiGetAllMarkers", FctData, "", "").then((reponse)=>{
            if (reponse.length != 0){
                this.RenderMarkersOnMap(reponse)
                this._PageOfMarkers ++
                this.GetAllMarkersByPage()
            }
        },(erreur)=>{
            alert("Error: " + erreur)
        })
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
     * executee lors d'un click sur un marker
     * @param {String} TrackId Track id of the clicked marker
     */
    ClickOnMarker(TrackId){
        this.RenderTrackDataOnMap(TrackId)
        this.RenderTrackGeoJSonOnMap(this._Map, TrackId)
    }

    RenderTrackDataOnMap(TrackId){
        // Get Track data
        let TrackData =  this._AllMarkers.find(x => x._id === TrackId)
        // Build div track data on map
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap == null){
            DivTrackDataOnMap = CoreXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap", "")
            document.getElementById("Conteneur").appendChild(DivTrackDataOnMap)
            DivTrackDataOnMap.addEventListener("click", this.GetTrackData.bind(this, TrackId))
        } else {
            document.getElementById("Conteneur").removeChild(DivTrackDataOnMap)
            DivTrackDataOnMap = CoreXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap", "")
            document.getElementById("Conteneur").appendChild(DivTrackDataOnMap)
            DivTrackDataOnMap.addEventListener("click", this.GetTrackData.bind(this, TrackId))
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

    RemoveTrackDataOnMap(){
        event.stopPropagation()

        // Remove all track on map
        this._Map.RemoveAllTracks()
        // Remove track data
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap != null){
            document.getElementById("Conteneur").removeChild(DivTrackDataOnMap)
        }
    }

    RenderTrackGeoJSonOnMap(Map, TrackId){
        let FctData = {TrackId: TrackId, GetData: "GeoJSon"}
        GlobalCallApiPromise("ApiGetTrackData", FctData, "", "").then((reponse)=>{
            Map.RemoveAllTracks()
            Map.AddTrackOnMap(TrackId, reponse, false)        
        },(erreur)=>{
            alert(erreur)
        })
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
     * Button Go to start clicked
     * @param {Object} StartPoint Start point of the track
     */
    ClickGoToStart(StartPoint){
        if ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPad") != -1) || (navigator.platform.indexOf("iPod") != -1)){
            window.open(`maps://maps.google.com/maps?daddr=${StartPoint.Lat},${StartPoint.Lng}&amp;ll=`);
        } else {
            window.open(`https://maps.google.com/maps?daddr=${StartPoint.Lat},${StartPoint.Lng}&amp;ll=`)
        }
    }

    ClickFollowTrack(TrackId){
        // Add wainting box
        this.BuildWaitingBox()
        // Get Track Data
        let FctData = {TrackId: TrackId, GetData: "GeoJSon"}
        GlobalCallApiPromise("ApiGetTrackData", FctData, "", "").then((reponse)=>{
            this.RemoveWaitingBox()
            this.RenderTrackToFollowAndMap(TrackId, reponse)
        },(erreur)=>{
            this.RemoveWaitingBox()
            alert(erreur)
        })
    }

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

    RemoveWaitingBox(){
        CoreXWindow.DeleteWindow()
    }

    RenderTrackToFollowAndMap(TrackId, TrackGeoJson){
        // Hide Conteneur 
        let divApp = document.getElementById("Conteneur")
        divApp.style.display = "none"

        // Hide IdDivTrackInfo
        let DivTrackInfo = document.getElementById(this._IdDivTrackInfo)
        DivTrackInfo.style.display = "none"
        document.getElementById(this._IdDivContentTrackInfo).innerHTML = ""

        // Show IdDivMapFollow
        let DivMapFollow = document.getElementById(this._IdDivMapFollow)
        DivMapFollow.style.display = "block"

        // On efface le bouton menu action
        GlobalDisplayAction('Off')

        // Start Follow Track on map
        let TrackData = {TrackId: TrackId, TrackGeoJson: TrackGeoJson}
        this._FollowMyTrack = new FollowTrackOnMap(this._IdDivMapFollow, TrackData)
        this._FollowMyTrack.OnStop = this.StopFollowingTrack.bind(this)
        this._FollowMyTrack.Start()
    }

    StopFollowingTrack(){
        // Vider DivMapFollow
        document.getElementById(this._IdDivMapFollow).innerHTML = ""

        // Show Conteneur 
        let divApp = document.getElementById("Conteneur")
        divApp.style.display = "flex"

        // Hide IdDivMapFollow
        let DivMapFollow = document.getElementById(this._IdDivMapFollow)
        DivMapFollow.style.display = "none"

        // On efface le bouton menu action
        GlobalDisplayAction('On')

        // Stop Follow Track
        this._FollowMyTrack = null

        // Scroll to
        window.scrollTo(0, this._WindowScrollY);
    }

    ClickOnFilter(){
        // Create filter view
        let Conteneur = CoreXBuild.DivFlexColumn("")
        // Titre
        Conteneur.appendChild(CoreXBuild.DivTexte("Filter", "", "Titre", "width:100%; text-align: center;"))
        // Min Km
        let DivMinKm = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Conteneur.appendChild(DivMinKm)
        DivMinKm.appendChild(CoreXBuild.DivTexte("Distance Min (Km):", "", "", ""))
        DivMinKm.appendChild(CoreXBuild.Input("MinKm", this._FiltrePost.DistanceMin, "Input", "width: 20%;", "number", "MinKm"))
        // Max Km
        let DivMaxKm = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Conteneur.appendChild(DivMaxKm)
        DivMaxKm.appendChild(CoreXBuild.DivTexte("Max Distance (Km):", "", "", ""))
        DivMaxKm.appendChild(CoreXBuild.Input("MaxKm", this._FiltrePost.DistanceMax, "Input", "width: 20%;", "number", "MaxKm"))
        // Toggle HideMyTrack
        let DivToogleHideMyTrack = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Conteneur.appendChild(DivToogleHideMyTrack)
        DivToogleHideMyTrack.appendChild(CoreXBuild.DivTexte("Hide my Track:", "", "", ""))
        DivToogleHideMyTrack.appendChild(CoreXBuild.ToggleSwitch("ToggleHideMyTrack", this._FiltrePost.HideMyTrack))
        // Empty space
        Conteneur.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Div Button
        let DivButton = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivButton)
        // Button save
        DivButton.appendChild(CoreXBuild.Button("Save",this.SetFilter.bind(this),"Text Button ButtonWidth30", "Save"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",CoreXWindow.DeleteWindow,"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Conteneur.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Build window
        CoreXWindow.BuildWindow(Conteneur)
    }

    SetFilter(){
        // Set filter
        this._FiltrePost.DistanceMin = parseInt(document.getElementById("MinKm").value)
        this._FiltrePost.DistanceMax = parseInt(document.getElementById("MaxKm").value)
        this._FiltrePost.HideMyTrack = document.getElementById("ToggleHideMyTrack").checked 
        // close window
        CoreXWindow.DeleteWindow()
        if (this._IsPostPresentation){
            // retrive post
            this._PageOfPosts = 0
        } else {
            this._PageOfMarkers = 0
        }
        this.LoadStartView()
    }
}

// Creation de l'application
let MyGeoXActivities = new GeoXActivities(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Activities", IconGeoX.GeoXMapIcon(), MyGeoXActivities.Initiation.bind(MyGeoXActivities), true)