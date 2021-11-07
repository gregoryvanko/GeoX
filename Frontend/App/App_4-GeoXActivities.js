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

    ClickSaveToMyTrack(Id){
        alert("Save " + Id)
    }

    ClickDownloadGPX(Id){
        alert("GPX " + Id)
    }
}

// Creation de l'application
let MyGeoXActivities = new GeoXActivities(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Activities", Icon.GeoXActivities(), MyGeoXActivities.Initiation.bind(MyGeoXActivities), true)