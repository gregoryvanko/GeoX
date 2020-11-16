class GeoX{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
        // var googlescript = document.createElement('script')
        // googlescript.setAttribute('src','https://maps.googleapis.com/maps/api/&libraries=&v=weekly')
        // document.head.appendChild(googlescript)
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        link.integrity='sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
        link.crossOrigin =""
        document.head.appendChild(link)
        var Leafletjs = document.createElement('script')
        Leafletjs.setAttribute('src','https://unpkg.com/leaflet@1.7.1/dist/leaflet.js')
        Leafletjs.setAttribute('integrity','sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==')
        Leafletjs.setAttribute('crossorigin','')
        document.head.appendChild(Leafletjs)
    }
  
  /** Start de l'application */
  Start(){
    // Clear view
    this.ClearView()
    // Contener
    let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
    this._DivApp.appendChild(Conteneur)
    // Titre de l'application
    Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
    // on construit le texte d'attente
    Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center;"))
    // SocketIo Listener
    let SocketIo = GlobalGetSocketIo()
    SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
    SocketIo.on('StartGeoXApp', (Value) => {this.StartGeoXApp(Value)})
  
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
    if(SocketIo.hasListeners('GeoXError')){SocketIo.off('GeoXError')}
    if(SocketIo.hasListeners('StartGeoXApp')){SocketIo.off('StartGeoXApp')}
  }
  
  /**
  * Affichage du message d'erreur venant du serveur
  * @param {String} ErrorMsg Message d'erreur envoyé du serveur
  */
  Error(ErrorMsg){
    this.ClearView()
    let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
    this._DivApp.appendChild(Conteneur)
    Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red"))
  }

  StartGeoXApp(ListOfGeoJsonData){
    // Get Conteneur
    let Conteneur = document.getElementById("Conteneur")
    Conteneur.innerHTML = ""
    Conteneur.appendChild(CoreXBuild.Div("mapid", "", "height: 400px; width: 100%"))
    // Coordonne du centre de la belgique
    let lat = "333"
    let long = "555"
    // If receive data from server
    if (ListOfGeoJsonData != null){
      console.log("Start with data");
    }
    // Load google map
    //const uluru = { lat: -25.344, lng: 131.036 };
    // const map = new google.maps.Map(document.getElementById("map"), {
    //   zoom: 4,
    //   center: uluru,
    // });
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(mymap);
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
