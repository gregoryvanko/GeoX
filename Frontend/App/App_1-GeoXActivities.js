class GeoXActivities {
    constructor(){
        this._DivApp = NanoXGetDivApp()

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
        // Clear view
        this._DivApp.innerHTML=""
        // Load Start view
        this.LoadStartView()
    }

    LoadStartView(){
        // Clear view
        this._DivApp.innerHTML=""

        // Contener
        let Conteneur = NanoXBuild.DivFlexColumn("Conteneur", null, "width: 100%;")
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
            NanoXClearMenuButtonRight()
            NanoXAddMenuButtonRight("ActionMap", "Map or Post", IconGeoX.GeoXMapIcon(), this.ClickOnToogleMapPost.bind(this))
            // Button Filter
            NanoXAddMenuButtonRight("ButtonFilter", "Filter", Icon.Filter(), this.ClickOnFilter.bind(this))
            // Titre de l'application
            Conteneur.appendChild(NanoXBuild.DivText("Activities", "TitreActivities", "Titre"))
            // DivApp
            let divapp = NanoXBuild.Div(this._IdDivApp, "DivPostApp")
            Conteneur.appendChild(divapp)
            // Div Waiting
            let divwaiting = NanoXBuild.DivText("Waiting...", "DivWaitingPost", "Texte", "margin-bottom: 2rem;")
            Conteneur.appendChild(divwaiting)
            // Get Posts
            this.GetPosts()
        // Si on presente la vue Map
        } else {
            // Change button image
            document.getElementById("ActionMap").innerHTML = Icon.Liste()
            // Ajout du div qui va contenir la map
            Conteneur.appendChild(NanoXBuild.Div(this._IdDivMap, null, "height: 100vh; width: 100%;"))
            this._Map = new GeoXMap(this._IdDivMap) 
            this._Map.RenderMap()
            this._Map.AddMarkersClusterGroup()
            this._Map.OnClickOnMarker = this.ClickOnMarker.bind(this)
            // Get All marker by page
            this.GetAllMarkersByPage()
        }
        
        // DivTrackInfo
        let divtrackinfo = NanoXBuild.Div(this._IdDivTrackInfo, "DivTrackInfo", "margin-left:auto; margin-right:auto;")
        this._DivApp.appendChild(divtrackinfo)
        divtrackinfo.appendChild(NanoXBuild.Div(this._IdDivContentTrackInfo, "DivContentTrackInfo"))
        divtrackinfo.appendChild(this.BuildEmptySpace())

        // DivFollowTrack
        this._DivApp.appendChild(NanoXBuild.Div(this._IdDivMapFollow, null, "height: 100vh; width: 100%; display: none;")) 
    }

    BuildEmptySpace(){
        let divempty = document.createElement('div')
        divempty.style.height = "2rem"
        return divempty
    }

    GetPosts(){
        let FctData = {Page: this._PageOfPosts, Filter: this._FiltrePost, AllPublicPost: true}
        NanoXApiGet("/post/", FctData).then((reponse)=>{
            this.RenderPosts(reponse)
        },(erreur)=>{
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(this.GetDivError(erreur))
        })
    }

    GetDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerHTML = MyError
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
                let TempGeoxPsot = new HtmlElemGeoxPost(element, false)
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

        NanoXApiGet("/track/onetrack/" + Id).then((reponse)=>{
            this.RenderTrackData(reponse)
        },(erreur)=>{
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(this.GetDivError(erreur))
        })
    }

    RenderTrackData(Data){
        let divbackground = document.getElementById(this._IdDivContentTrackInfo)

        // Remove waiting
        divbackground.removeChild(document.getElementById("DivWaiting"))

        // Add Button Back
        NanoXClearMenuButtonLeft()
        NanoXAddMenuButtonLeft("ActionLeftBack", "Back", `<img src="${Icon.LeftArrow()}" alt="icon" width="32" height="32">`, this.RemoveTrackData.bind(this))

        // Add InfoOnTrack
        let DivData = NanoXBuild.DivFlexColumn("DivData", null, "width: 100%;")
        divbackground.appendChild(DivData)
        let InfoTrackView = new InfoOnTrack(Data, "DivData")

        // Div Button Action
        let DivButtonAction = NanoXBuild.DivFlexRowSpaceAround("ButtonAction", null, "width: 100%")
        divbackground.appendChild(DivButtonAction)
        // Button Save
        let ButtonSave = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.SaveBlack(), "Save Track"), this.ClickSaveToMyTrack.bind(this, Data._id),"SaveToMe", "CloseButton")
        DivButtonAction.appendChild(ButtonSave)
        // Button download GPX
        let ButtonGPX = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Download(), "GPX"), this.ClickDownloadGPX.bind(this, Data._id, Data.Name),"GPX", "CloseButton")
        DivButtonAction.appendChild(ButtonGPX)
        // Button Go To Start
        let ButtonGo = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.StartFlag(), "Go to start"), this.ClickGoToStart.bind(this, Data.StartPoint), "GoToStart", "CloseButton")
        DivButtonAction.appendChild(ButtonGo)
        // Button Follow track
        let ButtonFollow = NanoXBuild.Button(this.BuildImageAndTextButtonContent(Icon.Follow(), "Follow Track"), this.ClickFollowTrack.bind(this, Data._id), "FollowTrack", "CloseButton")
        DivButtonAction.appendChild(ButtonFollow)
    }

    RemoveTrackData(){
        event.stopPropagation()

        // show divapp
        let divApp = document.getElementById("Conteneur")
        divApp.style.display = "flex"

        // Hide divinfotrack
        let divTrackInfo = document.getElementById(this._IdDivTrackInfo)
        divTrackInfo.style.display = "none"
        document.getElementById(this._IdDivContentTrackInfo).innerHTML = ""

        // Scroll to
        window.scrollTo(0, this._WindowScrollY);
    }

    ClickSaveToMyTrack(TrackId){
        // Get all group of user
        NanoXApiGet("/track/mygroups").then((reponse)=>{
            this._UserGroup = reponse
        },(erreur)=>{
            // Clear view
            this._DivApp.innerHTML=""
            this._DivApp.appendChild(this.GetDivError(erreur))
        })
        // Open save box
        this.BuildSaveTrackVue(TrackId)
    }

    BuildSaveTrackVue(TrackId){
        let Content = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
        // Titre
        Content.append(NanoXBuild.DivText("Save Track", null, "SousTitre"))
        // Input Name
        Content.appendChild(NanoXBuild.InputWithLabel("InputBoxCoreXWindow", "Track Name:", "Text", "InputTrackName","", "Input Text", "text", "Name","",true))
        // Input `Group
        Content.appendChild(NanoXBuild.InputWithLabel("InputBoxCoreXWindow", "Track Group:", "Text", "InputTrackGroup","", "Input Text", "text", "Group","",true))
        // Description
        let DivDescription = NanoXBuild.Div(null, "InputBoxCoreXWindow Text")
        Content.appendChild(DivDescription)
        DivDescription.appendChild(NanoXBuild.DivText("Description", null, "Text"))
        let DivContDesc = NanoXBuild.Div("DivContDesc", "DivContentEdit TextSmall")
        DivContDesc.contentEditable = "True"
        DivDescription.appendChild(DivContDesc)
        // Toggle Public
        let DivTooglePublic = NanoXBuild.Div(null,"Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Content.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(NanoXBuild.DivText("Public Track:"))
        DivTooglePublic.appendChild(NanoXBuild.ToggleSwitch({Id:"TogglePublic",Checked: true, HeightRem: 2}))
        // Error Text
        Content.appendChild(NanoXBuild.DivText("", "ErrorSaveTrack", "Text", "Color: red; margin-top: 2vh;"))
        
        let ListOfButton = [
            {Titre: "Save", Action: this.SaveToMyTrack.bind(this, TrackId), Id: "SaveTrack"},
            {Titre: "Cancel", Action: this.CancelSaveToMyTrack.bind(this), Id: "Cancel"}
        ]
        // Open Window
        NanoXBuild.PopupCreate(Content, ListOfButton)

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
        NanoXBuild.PopupDelete()
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

            let CopyTrackData = {TrackId: TrackId, Name: NewName, Group: NewGroup, Public: NewPublic, Description: NewDescription}

            NanoXApiPost("/track/CopyTrack", CopyTrackData).then((reponse)=>{
                // Delete Window info copy
                NanoXBuild.PopupDelete()
                // Show Message Track saved
                let Content = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
                Content.append(NanoXBuild.DivText("Save Track", null, "SousTitre"))
                Content.append(NanoXBuild.DivText("Track saved", null, "Text", "margin-top: 1rem;"))
                NanoXBuild.PopupCreate(Content)
            },(erreur)=>{
                document.getElementById("ErrorSaveTrack").innerText = erreur
                document.getElementById("SaveTrack").disabled = false
            })
        } else {
            document.getElementById("ErrorSaveTrack").innerText = "Enter a name and a group before saving"
        }
    }

    ClickDownloadGPX(Id, Name){
        NanoXApiGet("/track/gpx/" + Id).then((reponse)=>{
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
        let FctData = {Page: this._PageOfMarkers, Filter: this._FiltrePost, AllPublicPost: true}
        NanoXApiGet("/post/marker/", FctData).then((reponse)=>{
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
            DivTrackDataOnMap = NanoXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap")
            document.getElementById("Conteneur").appendChild(DivTrackDataOnMap)
            DivTrackDataOnMap.addEventListener("click", this.GetTrackData.bind(this, TrackId))
        } else {
            document.getElementById("Conteneur").removeChild(DivTrackDataOnMap)
            DivTrackDataOnMap = NanoXBuild.Div(this._IdDivTrackDataOnMap, "DivTrackDataOnMap")
            document.getElementById("Conteneur").appendChild(DivTrackDataOnMap)
            DivTrackDataOnMap.addEventListener("click", this.GetTrackData.bind(this, TrackId))
        }
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
        Map.RemoveAllTracks()
        NanoXApiGet("/track/geojson/" + TrackId).then((reponse)=>{
            Map.AddTrackOnMap(TrackId, reponse.GeoJsonData, false, null)        
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
        NanoXApiGet("/track/geojson/" + TrackId).then((reponse)=>{
            this.RemoveWaitingBox()
            this.RenderTrackToFollowAndMap(TrackId, reponse.GeoJsonData)
        },(erreur)=>{
            this.RemoveWaitingBox()
            alert(erreur)
        })
    }

    BuildWaitingBox(){
        // Add WaitingBox
        let Content = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Texte waiting
        Content.appendChild(NanoXBuild.DivText("Waiting data...", null, "text"))
        // Empty space
        Content.appendChild(this.BuildEmptySpace())
        // Show window
        NanoXBuild.PopupCreate(Content)
    }

    RemoveWaitingBox(){
        NanoXBuild.PopupDelete()
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

        // Stop Follow Track
        this._FollowMyTrack = null

        // Scroll to
        window.scrollTo(0, this._WindowScrollY);
    }

    ClickOnFilter(){
        let FilterView = new FilterBox(this._FiltrePost)
        FilterView.Save = this.SetFilter.bind(this)
    }

    SetFilter(Filter){
        // Set filter
        this._FiltrePost = Filter
        // Reset page
        if (this._IsPostPresentation){
            // retrive post
            this._PageOfPosts = 0
        } else {
            this._PageOfMarkers = 0
        }
        // Load Start View
        this.LoadStartView()
    }
}

// Creation de l'application
let MyGeoXActivities = new GeoXActivities()
// Ajout de l'application
NanoXAddModule("Activities", IconGeoX.GeoXMapIcon(), MyGeoXActivities.Initiation.bind(MyGeoXActivities), true)