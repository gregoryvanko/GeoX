class GeoX{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
    }
  
  /** Start de l'application */
  Start(){
    // Clear view
    this.ClearView()
    let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
    this._DivApp.appendChild(Conteneur)
    // on construit le texte d'attente
    this._DivApp.appendChild(CoreXBuild.DivTexte("Waiting server data...","TxtZone","Text", "text-align: center;"))
    // on construit le texte du message d'erreur
    this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorZone","Text","color:red; text-align: center;"))
    // SocketIo Listener
    let SocketIo = GlobalGetSocketIo()
    SocketIo.on('AppError', (Value) => {this.Error(Value)})
  
    // Send status to serveur
    GlobalSendSocketIo("GeoX", "Start", "")
  }
  
  /** Clear view */
  ClearView(){
    // Clear Global action
    GlobalClearActionList()
    GlobalAddActionInList("Refresh", this.Start.bind(this))
    // Clear view
    this._DivApp.innerHTML=""
    // Clear socket
    let SocketIo = GlobalGetSocketIo()
    if(SocketIo.hasListeners('AppError')){SocketIo.off('AppError')}
  }
  
  /**
  * Affichage du message d'erreur venant du serveur
  * @param {String} ErrorMsg Message d'erreur envoyé du serveur
  */
  Error(ErrorMsg){
    document.getElementById("TxtZone").innerHTML = ""
    document.getElementById("ErrorZone").innerHTML = ErrorMsg
  }
  
  /** Get Titre de l'application */
  GetTitre(){return "GeoX"}
  /** Get Img Src de l'application */
  GetImgSrc(){
  return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNjQwLjAwMDAwMHB0IiBoZWlnaHQ9IjEyODAuMDAwMDAwcHQiIHZpZXdCb3g9IjAgMCA2NDAuMDAwMDAwIDEyODAuMDAwMDAwIgogcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+CjxtZXRhZGF0YT4KQ3JlYXRlZCBieSBwb3RyYWNlIDEuMTUsIHdyaXR0ZW4gYnkgUGV0ZXIgU2VsaW5nZXIgMjAwMS0yMDE3CjwvbWV0YWRhdGE+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDEyODAuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNMzA3MyAxMDk1NyBsLTI5MTIgLTE4NDIgLTEgLTgwIDAgLTgwIDM3MSAtNjQ1IGMyMDMgLTM1NSA0NTQgLTc5MAo1NTYgLTk2OCBsMTg1IC0zMjMgNDQyIDIyNSBjMzc2IDE5MSAxMzE1IDY2NCAxMzM5IDY3NCA0IDIgNyAtMTc3OSA3IC0zOTU3CmwwIC0zOTYxIDEwMyAwIGM2NCAwIDE5NiAxMyAzNDggMzUgMjQzIDM0IDcwOCAxMDAgMTUxOSAyMTQgMjM0IDMzIDU4NyA4Mwo3ODUgMTExIDE5OCAyNyAzNzUgNTIgMzkzIDU1IGwzMiA2IDAgNjE4OSAwIDYxOTAgLTEyNyAtMSAtMTI4IC0xIC0yOTEyCi0xODQxeiIvPgo8L2c+Cjwvc3ZnPgo="
  }
}
  
// Creation de l'application
let MyClientApp = new GeoX(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp(MyClientApp.GetTitre(), MyClientApp.GetImgSrc(), MyClientApp.Start.bind(MyClientApp))