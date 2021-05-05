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
        if (Value.Action == "SetUserData"){
            this._AppData = Value.Data.AppData
            this._AppGroup = Value.Data.AppGroup
            this.LoadViewManageTracks()
        } else if (Value.Action == "SetDownloadedFile" ){
            this.DownloadedFileToClient(Value.Data)
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
}

// Creation de l'application
let MyManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", Icon.ManageTracks(), MyManageTracks.Initiation.bind(MyManageTracks))