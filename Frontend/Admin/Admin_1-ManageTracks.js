class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._AppData = null
    }

    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // SocketIO
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('AdminManageTrack', (Value) => {this.MessageRecieved(Value)})
        // Load Data
        this.LoadViewGetAppData()
    }

    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
     Error(ErrorMsg){
        // Clear view
        this._DivApp.innerHTML=""
        // Add conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Add Error Text
        Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red; margin-top: 20vh;"))
    }

    /**
     * Action a realiser lorsque l'on recoit un message
     * @param {Object} Value Object du message : {Action, Data}
     */
    MessageRecieved(Value){
        if (Value.Action == "SetData"){
            this._AppData = Value.AppData
            this.LoadViewManageTracks()
        } else if (Value.Action == "SetTrackInfo" ){
            // Load Info Track view
            let InfoTrackView = new InfoOnTrack(Value.Data, "ContentInfoTrack")
        } else {
            console.log("error, Action not found: " + Value.Action)
        }
    }

    /**
     * Load des Data de l'application
     */
    LoadViewGetAppData(){
        // Clear view
        this._DivApp.innerHTML=""
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center; margin-top: 10vh;"))
        // Send status to serveur
        let CallToServer = new Object()
        CallToServer.Action = "GetData"
        GlobalSendSocketIo("GeoX", "AdminManageTrack", CallToServer)
    }

    LoadViewManageTracks(){
        // Clear view
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre
        Contener.appendChild(CoreXBuild.DivTexte("Manage GeoX Tracks", "", "Titre", "margin-bottom:0%"))
        // Conteneur de la liste des tracks
        let AppConteneur = CoreXBuild.Div("AppConteneur", "AppConteneur", "")
        Contener.appendChild(AppConteneur)
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        BoxTitre.style.marginTop = "4vh"
        AppConteneur.appendChild(BoxTitre)
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 33%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 20%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 15%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Owner","","TextBoxTitre", "width: 21%;"))
        // Ajout d'une ligne
        AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout des lignes des tracks
        if (this._AppData.length == 0){
            let BoxTracks = CoreXBuild.DivFlexRowStart("")
            AppConteneur.appendChild(BoxTracks)
            BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh; width: 100%; text-align: center;"))
        } else {
            this._AppData.forEach(Track => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "1vh"
                BoxTracks.style.marginBottom = "1vh"
                if (!Track.Public){
                    BoxTracks.style.color = "red"
                }
                AppConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 33%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","TextSmall", "width: 20%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(Track.Date),"","TextSmall", "width: 15%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Owner,"","TextSmall", "width: 21%;"))
                let DivButton = CoreXBuild.Div("", "", "margin-left:auto;")
                BoxTracks.appendChild(DivButton)
                DivButton.appendChild(CoreXBuild.Button(`<img src="${Icon.Information()}" alt="icon" width="30" height="30">`, this.LoadViewInfoTrack.bind(this,Track._id), "ButtonIcon"))
                
                // Ajout d'une ligne
                AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
    }

    LoadViewInfoTrack(TrackId){
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        Contener.style.width = "90%"
        Contener.style.marginLeft = "auto"
        Contener.style.marginRight = "auto"
        Contener.style.maxWidth = "900px"
        this._DivApp.appendChild(Contener)
        // Content Info Track
        let ContentInfoTrack = CoreXBuild.DivFlexColumn("ContentInfoTrack")
        Contener.appendChild(ContentInfoTrack)
        // waitinf data txt
        ContentInfoTrack.appendChild(CoreXBuild.DivTexte("Waiting track data...","","Text", "text-align: center; margin-top: 10vh;"))
        // Button select file
        Contener.appendChild(CoreXBuild.Button("Go to manage track",this.LoadViewManageTracks.bind(this),"Text Button", "GoToManageTrack"))
        // Blank div
        Contener.appendChild(CoreXBuild.Div("","","height: 6vh;"))
        // Send status to serveur
        GlobalSendSocketIo("GeoX", "AdminManageTrack", {Action: "GetTrackInfo", Data: TrackId})
    }
}

// Creation de l'application
let MyManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", Icon.GeoXManageTracks(), MyManageTracks.Initiation.bind(MyManageTracks))