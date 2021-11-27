class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._ConteneurManageTrack = "ConteneurManageTrack"
        this._ConteneurViewOnMap = "ConteneurViewOnMap"
        this._ConteneurAddTrack = "ConteneurAddTrack"
        this._ListOfMyPosts = "ListOfMyPosts"
        this._PageOfPosts = 0

        let me = this
        this._Observer = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetMyPosts()
                    me._Observer.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

        this._StartWithLoadViewManageTrack = true
    }

    Initiation(StartWithLoadViewManageTrack = true){
        this._StartWithLoadViewManageTrack = StartWithLoadViewManageTrack
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // Load Data
        this.LoadView()
    }

    /** Load view de l'application */
    LoadView(ShowOnMap = false){
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
        if (this._StartWithLoadViewManageTrack){
            if (ShowOnMap){
                this.LoadViewOnMap()
            } else {
                this.LoadViewManageTracks()
            }
        } else {
            this.LoadViewAddTrack()
        }
    }

    LoadViewManageTracks(){
        // Show ConteneurManageTrack
        let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
        ConteneurManageTrack.style.display = "flex"
        // Hide ConteneurViewOnMap
        let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "none"
        // Hide ConteneurAddTrack
        let ConteneurAddTrack = document.getElementById(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "none"
        // Hide Action Button
        GlobalDisplayAction('On')

        // Titre de l'application
        ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("My Tracks", "", "Titre"))
        // Button view on map
        ConteneurManageTrack.appendChild(CoreXBuild.ButtonLeftAction(this.LoadView.bind(this, true), "ActionLeft",  `<img src="${Icon.GeoXMapIcon()}" alt="icon" width="32" height="32">`))
        // Button Add track
        ConteneurManageTrack.appendChild(CoreXBuild.Button(`<img src="${Icon.Add()}" alt="icon" width="32" height="32">`,this.Initiation.bind(this, false),"ButtonLeftActionSecond","ButtonAddTrack"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        BoxTitre.style.width = "60rem"
        BoxTitre.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(BoxTitre)
        BoxTitre.style.marginTop = "2rem"
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 45%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 30%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 14%;"))
        // Liste despost
        let ListofMyPost = CoreXBuild.DivFlexColumn(this._ListOfMyPosts)
        ListofMyPost.style.width = "60rem"
        ListofMyPost.style.maxWidth = "90%"
        ConteneurManageTrack.appendChild(ListofMyPost)
        // Ajout d'une ligne
        ListofMyPost.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // on construit le texte d'attente
        ConteneurManageTrack.appendChild(CoreXBuild.DivTexte("Waiting data...","WaitingDataManageTrack","Text", "text-align: center; margin-top: 2rem; margin-bottom: 2rem;"))
        
        // GetData
        this.GetMyPosts()
    }

    LoadViewAddTrack(){
        // Hide ConteneurManageTrack
        let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
        ConteneurManageTrack.style.display = "none"
        // Hide ConteneurViewOnMap
        let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "none"
        // Hide ConteneurAddTrack
        let ConteneurAddTrack = document.getElementById(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "flex"
        // Hide Action Button
        GlobalDisplayAction('Off')

        // Titre de l'application
        ConteneurAddTrack.appendChild(CoreXBuild.DivTexte("Add Track", "", "Titre"))
        
        // ToDo
    }

    LoadViewOnMap(){
        // Show ConteneurManageTrack
        let ConteneurManageTrack = document.getElementById(this._ConteneurManageTrack)
        ConteneurManageTrack.style.display = "none"
        // Hide ConteneurViewOnMap
        let ConteneurViewOnMap = document.getElementById(this._ConteneurViewOnMap)
        ConteneurViewOnMap.style.display = "flex"
        // Hide ConteneurAddTrack
        let ConteneurAddTrack = document.getElementById(this._ConteneurAddTrack)
        ConteneurAddTrack.style.display = "none"
        // Hide Action Button
        GlobalDisplayAction('On')

        // Add button manage my track
        ConteneurViewOnMap.appendChild(CoreXBuild.ButtonLeftAction(this.LoadView.bind(this, false), "ActionLeft",  `<img src="${Icon.GeoXActivities()}" alt="icon" width="32" height="32">`))
        // GetData
        // ToDo
    }

    GetMyPosts(){
        let FctData = {Page: this._PageOfPosts}
        GlobalCallApiPromise("ApiGetMyPosts", FctData, "", "").then((reponse)=>{
            this.RenderPosts(reponse)
        },(erreur)=>{
            alert("Error: " + erreur)
        })
    }

    RenderPosts(Data){
        if (Data.length != 0){
            let MiddlepointData = Math.ceil(Data.length / 2)-1
            let CurrentpointData = 0
            Data.forEach(element => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "0.7rem"
                BoxTracks.style.marginBottom = "0.7rem"
                document.getElementById(this._ListOfMyPosts).appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Name,"","Text", "width: 45%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(element.Group,"","TextSmall", "width: 30%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(element.Date),"","TextSmall", "width: 14%;"))
                if (! element.Public){
                    let DivPublic = CoreXBuild.Div("", "", "width: 9%;")
                    DivPublic.style.textAlign = "right"
                    BoxTracks.appendChild(DivPublic)
                    DivPublic.appendChild(CoreXBuild.Image64(Icon.Key(),"", "IconeInList", ""))
                }
                BoxTracks.style.cursor = "pointer"
                BoxTracks.onclick = this.ClickOnPost.bind(this, element._id)
                // Ajout d'une ligne
                document.getElementById(this._ListOfMyPosts).appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
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
            ConteneurManageTrack.appendChild(this.SetDivError("End of posts"))
            // Remove WaitingDataManageTrack
            if (document.getElementById("WaitingDataManageTrack")){
                ConteneurManageTrack.removeChild(document.getElementById("WaitingDataManageTrack"))
            }
        }
    }

    ClickOnPost(Id){
        alert(Id)
    }

    SetDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerText = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        return diverror
    }
}

// Creation de l'application
let MyGeoXManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", Icon.GeoXManageTracks(), MyGeoXManageTracks.Initiation.bind(MyGeoXManageTracks))