class GeoXActivities {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)

        this._IdDivApp = "divapp"
        this._IdDivTrackInfo = "DivTrackInfo"
        this._IdDivContentTrackInfo = "DivContentTrackInfo"
        this._IdDivMap = "mapid"
        this._IdDivTrackDataOnMap = "DivTrackDataOnMap"

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
        this._PageOfMarkers = 0
        this._AllMarkers = []
    }

    Initiation(){
        // Reset page of post
        this._PageOfPosts = 0
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
                this.RemoveMap()
            }
            // Button Map
            Conteneur.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnToogleMapPost.bind(this), "ActionMap",  `<img src="${Icon.GeoXMapIcon()}" alt="icon" width="32" height="32">`))
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
            Conteneur.appendChild(CoreXBuild.ButtonLeftAction(this.ClickOnToogleMapPost.bind(this), "ActionMap",  `<img src="${Icon.GeoXActivities()}" alt="icon" width="32" height="32">`))
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
        let divtrackinfo = CoreXBuild.Div(this._IdDivTrackInfo, "DivTrackInfo", "")
        Conteneur.appendChild(divtrackinfo)
        let divcontenttrackinfo = CoreXBuild.Div(this._IdDivContentTrackInfo, "DivContentTrackInfo", "")
        divtrackinfo.appendChild(divcontenttrackinfo)
        // empty space
        let divempty = document.createElement('div')
        divempty.style.height = "2rem"
        divtrackinfo.appendChild(divempty)

    }

    GetPosts(){
        fetch("/getpageofpost/" + this._PageOfPosts).then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("get posts failed: " + response.status + " " + response.statusText);
            }
        })
        .then((responseJson) => {
            if (responseJson.Error){
                document.getElementById(this._IdDivApp).appendChild(this.GetDivError(responseJson.ErrorMsg))
            } else {
                this.RenderPosts(responseJson.Data)
            }
        })
        .catch((error) => {
            let divapp = document.getElementById(this._IdDivApp)
            divapp.innerHTML = ""
            divapp.appendChild(this.GetDivError(error))
        });
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
                let TempGeoxPsot = new GeoxPost(element)
                TempGeoxPsot.addEventListener("click", this.GetTrackData.bind(this, element._id))
                TempGeoxPsot.style.cursor = "pointer"
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

    GetTrackData(Id){
        // Scroll to
        this._WindowScrollY = window.scrollY

        // Hide titre
        let DivTitreActivities = document.getElementById("TitreActivities")
        DivTitreActivities.style.display = "none"

        // Hide divapp
        let divApp = document.getElementById(this._IdDivApp)
        divApp.style.display = "none"

        // Hide waitingPost
        if (document.getElementById("DivWaitingPost")){
            document.getElementById("DivWaitingPost").style.display = "none"
        }

        // Show divinfotrack
        let divTrackInfo = document.getElementById(this._IdDivTrackInfo)
        divTrackInfo.style.display = "flex"

        // Text
        let divwaiting = document.createElement('div')
        divwaiting.id = "DivWaiting"
        divwaiting.innerText = "Waiting data..."
        divwaiting.style.textAlign = "center"
        divwaiting.style.marginTop = "5vh"
        document.getElementById(this._IdDivContentTrackInfo).appendChild(divwaiting)

        // fetch
        fetch("/getdataofpost/" + Id).then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("get track of posts failed: " + response.status + " " + response.statusText);
            }
        })
        .then((responseJson) => {
            if (responseJson.Error){
                document.getElementById(this._IdDivApp).appendChild(this.GetDivError(responseJson.ErrorMsg))
            } else {
                this.RenderTrackData(responseJson.Data)
            }
        })
        .catch((error) => {
            let divapp = document.getElementById(this._IdDivApp)
            divapp.innerHTML = ""
            divapp.appendChild(this.GetDivError(error))
        });
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

        // Save Button and download GPX Button
        let DivButtonAction = CoreXBuild.DivFlexRowAr("ButtonAction")
        divbackground.appendChild(DivButtonAction)
        let ButtonSave = CoreXBuild.Button("Save", this.ClickSaveToMyTrack.bind(this, Data._id), "CloseButton", "SaveToMe")
        DivButtonAction.appendChild(ButtonSave)
        let ButtonGPX = CoreXBuild.Button("GPX", this.ClickDownloadGPX.bind(this, Data._id), "CloseButton", "GPX")
        DivButtonAction.appendChild(ButtonGPX)
    }

    RemoveTrackData(){
        event.stopPropagation()

        // show titre
        let DivTitreActivities = document.getElementById("TitreActivities")
        DivTitreActivities.style.display = "block"

        // show divapp
        let divApp = document.getElementById(this._IdDivApp)
        divApp.style.display = "flex"

        // show waiting
        if (document.getElementById("DivWaitingPost")){
            document.getElementById("DivWaitingPost").style.display = "block"
        }

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
            let FctData = {SaveType: "ById", TrackId: TrackId, Name: NewName, Group: NewGroup, Public: NewPublic, Description: NewDescription}
            GlobalCallApiPromise("ApiSaveTrack", FctData, "", "").then((reponse)=>{
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

    ClickDownloadGPX(Id){
        let FctData = {TrackId: Id, GetData: "GPX"}
        GlobalCallApiPromise("ApiGetTrackData", FctData, "", "").then((reponse)=>{
            var link = document.createElement('a')
            link.download = 'Track.gpx'
            var blob = new Blob([reponse], {typde: 'text/plain'})
            link.href = window.URL.createObjectURL(blob)
            link.click()
        },(erreur)=>{
            console.log(erreur)
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
        }
        this.LoadStartView()
    }

    /**
     * Remove map and reset map data
     */
    RemoveMap(){
        this._Map.RemoveMap()
        this._Map = null
        this._PageOfMarkers = 0
        this._AllMarkers = []
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap != null){document.body.removeChild(DivTrackDataOnMap)}

    }

    /**
     * Get makers of all tracks of GeoX by page
     */
    GetAllMarkersByPage(){
        let FctData = {Page: this._PageOfMarkers}
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
    }

    RenderTrackDataOnMap(TrackId){
        // Get Track data
        let TrackData =  this._AllMarkers.find(x => x._id === TrackId)
        // Build div trak data on map
        let DivTrackDataOnMap = document.getElementById(this._IdDivTrackDataOnMap)
        if (DivTrackDataOnMap == null){
            DivTrackDataOnMap = CoreXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap", "")
            document.body.appendChild(DivTrackDataOnMap)
        } else {
            DivTrackDataOnMap.innerHTML = ""
        }
        // Add track name
        let divname = document.createElement('div')
        divname.innerHTML = TrackData.Name
        divname.style.width ="100%"
        divname.style.fontWeight ="bold"
        divname.style.textAlign ="left"
        divname.style.marginBottom ="0.5rem"
        divname.style.marginLeft ="0.5rem"
        divname.classList.add("Text")
        DivTrackDataOnMap.appendChild(divname)
        // Add track ingo
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
}

// Creation de l'application
let MyGeoXActivities = new GeoXActivities(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Activities", Icon.GeoXActivities(), MyGeoXActivities.Initiation.bind(MyGeoXActivities), true)