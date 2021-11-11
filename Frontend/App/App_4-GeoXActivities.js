class GeoXActivities {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)

        this._IdDivApp = "divapp"
        this._IdDivTrackInfo = "DivTrackInfo"
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
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("Activities", "", "Titre"))
        // DivApp
        let divapp = CoreXBuild.Div(this._IdDivApp, "DivPostApp", "")
        Conteneur.appendChild(divapp)
        // DivTrackInfo
        let divtrackinfo = CoreXBuild.Div(this._IdDivTrackInfo, "DivTrackInfo", "")
        Conteneur.appendChild(divtrackinfo)
        // Div Waiting
        let divwaiting = CoreXBuild.DivTexte("Waiting...", "DivWaitingPost", "Texte", "margin-bottom: 2rem;")
        Conteneur.appendChild(divwaiting)
        // empty space
        let divempty = document.createElement('div')
        Conteneur.appendChild(divempty)
        divempty.style.height = "2rem"
        // Get Posts
        this.GetPosts()
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

        // Hide divapp
        let divApp = document.getElementById(this._IdDivApp)
        divApp.style.display = "none"

        // Hide waiting
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
        divTrackInfo.appendChild(divwaiting)

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
        let divbackground = document.getElementById(this._IdDivTrackInfo)
        divbackground.removeChild(document.getElementById("DivWaiting"))

        // Close button
        let button = document.createElement('button')
        button.classList.add("ButtonX");
        button.style.marginBottom = "-1rem"
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

        // show divapp
        let divApp = document.getElementById(this._IdDivApp)
        divApp.style.display = "flex"

        // show waiting
        if (document.getElementById("DivWaitingPost")){
            document.getElementById("DivWaitingPost").style.display = "block"
        }

        // Hide divinfotrack
        let divTrackInfo = document.getElementById(this._IdDivTrackInfo)
        divTrackInfo.innerHTML = ""
        divTrackInfo.style.display = "none"

        // Scroll to
        window.scrollTo(0, this._WindowScrollY);
    }

    ClickSaveToMyTrack(TrackId){
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
            document.getElementById("ErrorSaveTrack").innerText = ""
            document.getElementById("SaveTrack").innerText = "Saving..."
            // Send action
            let NewName = document.getElementById("InputTrackName").value 
            let NewGroup = document.getElementById("InputTrackGroup").value
            let NewPublic = document.getElementById("TogglePublic").checked
            let NewDescription = document.getElementById("DivContDesc").innerText
            let FctData = {SaveType: "ById", TrackId: TrackId, Name: NewName, Group: NewGroup, Public: NewPublic, Description: NewDescription}
            GlobalCallApiPromise("SaveTrack", FctData, "", "").then((reponse)=>{
                // Delete Window
                CoreXWindow.DeleteWindow()
            },(erreur)=>{
                document.getElementById("ErrorSaveTrack").innerText = erreur
            })
        } else {
            document.getElementById("ErrorSaveTrack").innerText = "Enter a name and a group before saving"
        }
    }

    ClickDownloadGPX(Id){
        let FctData = {TrackId: Id, GetData: "GPX"}
        GlobalCallApiPromise("GetTrackData", FctData, "", "").then((reponse)=>{
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
}

// Creation de l'application
let MyGeoXActivities = new GeoXActivities(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Activities", Icon.GeoXActivities(), MyGeoXActivities.Initiation.bind(MyGeoXActivities), true)