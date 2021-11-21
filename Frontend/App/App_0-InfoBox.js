class InfoBox{
    
    constructor(DivApp, ClickOnBoxTrack, CheckboxGroupChange, ToogleMarkerOnMap, GetCornerOfMap, LoadViewAction, SetFitBound){
        this._DivApp = DivApp
        this.ToogleMarkerOnMap = ToogleMarkerOnMap
        this.ClickOnBoxTrack = ClickOnBoxTrack
        this.CheckboxGroupChange = CheckboxGroupChange
        this.GetCornerOfMap = GetCornerOfMap
        this.LoadViewAction = LoadViewAction
        this.SetFitBound = SetFitBound
        // Statu de l'infobox
        this._InfoBowIsShown = false
        // Statu de la vue dans infobox
        this.TrackDataIsShown = true
        // UserGroup
        this._UserGroup = null
        // ListOfTrack
        this._ListOfTrack = null
        // ListeOfMarkers
        this._ListeOfMarkers = null
        // Filter
        this._Filter = {Sort:"Date", MinKm: "0", MaxKm: "1000"}
        // Initial FitBound
        this._InitFitBound = null
    }

    set UserGroup(val){this._UserGroup = val}
    set ListOfTrack(val){this._ListOfTrack = val}
    set ListeOfMarkers(val){this._ListeOfMarkers = val}
    set InitFitBound(val){this._InitFitBound = val}
    get InfoBowIsShown() {return this._InfoBowIsShown}

    /**
     * Toggle Show Hide Info Box
     */
    InfoBoxToggle(){
        if (this._InfoBowIsShown){
            // Change statu of _InfoBowIsShown
            this._InfoBowIsShown = false
            // Hide InfoBox
            this.InfoBoxDestroy()
        } else {
            // Change statu of _InfoBowIsShown
            this._InfoBowIsShown = true
            // Build infoBox
            this.InfoBoxBuild()
        }
    }

    /**
     * Build infobox
     */
    InfoBoxBuild(){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxTracks", "DivBoxTracks", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Add event for transition end
        DivBoxTracks.addEventListener('transitionend',this.InfoBoxTransitionEnd.bind(this))
        // Div Nav
        let DivNav = CoreXBuild.DivFlexRowAr("")
        DivNav.style.height = "4vh"
        DivBoxTracks.appendChild(DivNav)
        // Add button left
        DivNav.appendChild(CoreXBuild.Button (`<img src="${Icon.LefArrow()}" alt="icon" width="30" height="30">`, this.ClickButtonInfoBoxLeft.bind(this), "ButtonTrackInfoBoxLeft", "ButtonInfoBoxLeft"))
        // Titre
        DivNav.appendChild(CoreXBuild.DivTexte("Tracks", "InfoBoxTitre", "TextBoxTitre", "color:white;"))
        // Add button right
        DivNav.appendChild(CoreXBuild.Button (`<img src="${Icon.RightArrow()}" alt="icon" width="30" height="30">`, this.ClickButtonInfoBoxRight.bind(this, null), "ButtonTrackInfoBoxRight", "ButtonInfoBoxRight"))
        ButtonInfoBoxRight.style.display = "none"
        // Div empty
        DivBoxTracks.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Div Action
        let DivAction = CoreXBuild.DivFlexRowAr("InfoBoxAction")
        DivBoxTracks.appendChild(DivAction)
        DivAction.style.width = "86%"
        DivAction.style.margin = "0vh auto"
        DivAction.style.justifyContent = "space-between"
        // Div Content
        DivBoxTracks.appendChild(CoreXBuild.Div("InfoBoxContent", "", ""))
        // Add track data
        this.UpdateTrackDataInView()
        // Start transition
        setTimeout(function(){
            DivBoxTracks.classList.add("DivBoxTracksShow")
        }, 100);
    }

    /**
     * Delete infobox
     */
    InfoBoxDestroy(){
        let MyDivBoxTracks = document.getElementById("DivBoxTracks")
        if(MyDivBoxTracks){
            MyDivBoxTracks.classList.remove("DivBoxTracksShow")
        }
    }

    /**
     * Action to execute a the end of transition
     */
    InfoBoxTransitionEnd(){
        let MyDivBoxTracks = document.getElementById("DivBoxTracks")
        if (MyDivBoxTracks.classList.contains("DivBoxTracksShow")){ // La box a fini d'apparaitre
            // change button ButtonInfoBoxToggle 
            let Button = document.getElementById("ButtonInfoBoxToggle").getElementsByTagName('button')[0]
            Button.innerHTML = `<img src="${Icon.ClosePanel()}" alt="icon" width="25" height="25">`
        } else { // la box a fini de disparaitre
            // change button ButtonInfoBoxToggle
            let Button = document.getElementById("ButtonInfoBoxToggle").getElementsByTagName('button')[0]
            Button.innerHTML = `<img src="${Icon.OpenPanel()}" alt="icon" width="25" height="25">`
            // remove InfoBox
            MyDivBoxTracks.parentNode.removeChild(MyDivBoxTracks)
        }
    }

    /**
     * Click du bouton gauche de la navigation
     */
    ClickButtonInfoBoxLeft(){
        // Changer le titre
        document.getElementById("InfoBoxTitre").innerHTML = "Folder"
        // Changer les bouttons
        document.getElementById("ButtonInfoBoxLeft").style.display = "none"
        document.getElementById("ButtonInfoBoxRight").style.display = "block"
        // Vider Action
        document.getElementById("InfoBoxAction").innerHTML=""
        // Vider le content
        document.getElementById("InfoBoxContent").innerHTML=""
        // Add folder data
        this.TrackDataIsShown = false
        this.AddFolderData()
    }

    /**
     * Click bouton droit de la navigation
     */
    ClickButtonInfoBoxRight(){
        // Changer le titre
        document.getElementById("InfoBoxTitre").innerHTML = "Tracks"
        // Changer les bouttons
        document.getElementById("ButtonInfoBoxLeft").style.display = "block"
        document.getElementById("ButtonInfoBoxRight").style.display = "none"
        // Vider Action
        document.getElementById("InfoBoxAction").innerHTML=""
        // Vider le content
        document.getElementById("InfoBoxContent").innerHTML=""
        // Add track data
        this.TrackDataIsShown = true
        this.UpdateTrackDataInView()
    }

    /**
     * Construit la vue track
     * @param {String} DivId Id du div du conteneur
     */
    UpdateTrackDataInView(){
        // Get Action
        let action = document.getElementById("InfoBoxAction")
        // Clear Action
        action.innerHTML = ""
        // Add button Init Fitbound
        action.appendChild(CoreXBuild.Button (`<img src="${Icon.FitBoundWhite()}" alt="icon" width="30" height="30">`, this.SetFitBound.bind(this, this._InitFitBound), "ButtonInfoBoxNav", ""))
        // Add filter button
        action.appendChild(CoreXBuild.Button (`<img src="${Icon.FilterBlanc()}" alt="icon" width="30" height="30">`, this.FilterTrack.bind(this), "ButtonInfoBoxNav", ""))
        
        // Get content
        let content = document.getElementById("InfoBoxContent")
        // Clear content
        content.innerHTML = ""
        
        // List of track filtered
        let ListOfTrackFiltered = []
        // Get Corner of map
        let Corner = this.GetCornerOfMap()
        // Create Polygone
        let polyCorner = turf.polygon([[
            [Corner.NW.lat, Corner.NW.lng],
            [Corner.NE.lat, Corner.NE.lng],
            [Corner.SE.lat, Corner.SE.lng],
            [Corner.SW.lat, Corner.SW.lng],
            [Corner.NW.lat, Corner.NW.lng]]]);
        // Add my track
        this._ListOfTrack.forEach(element => {
            let PolyBorder = turf.polygon([[ 
                [element.ExteriorPoint.MinLong, element.ExteriorPoint.MinLat],
                [element.ExteriorPoint.MaxLong, element.ExteriorPoint.MinLat],
                [element.ExteriorPoint.MaxLong, element.ExteriorPoint.MaxLat],
                [element.ExteriorPoint.MinLong, element.ExteriorPoint.MaxLat],
                [element.ExteriorPoint.MinLong, element.ExteriorPoint.MinLat]]]);
            if ((turf.booleanWithin(PolyBorder, polyCorner)) || (turf.booleanOverlap(PolyBorder, polyCorner)) ){
                let InfoTrackObject = {Type: "MyTrack", From:"InfoBox", Name: element.Name, Group: element.Group, Date: element.Date, Length: element.Length, Id: element._id, Track: element}
                if ((element.Length > parseInt(this._Filter.MinKm))&&(element.Length < parseInt(this._Filter.MaxKm))){
                    ListOfTrackFiltered.push(InfoTrackObject)
                }
            }
        })
        // Add Geox Marker
        if (this._ListeOfMarkers != null){
            this._ListeOfMarkers.forEach(element => {
                let point = turf.point([element.StartPoint.Lat, element.StartPoint.Lng])
                if (turf.booleanWithin(point, polyCorner)){
                    let InfoTrackObject = {Type: "GeoxMarker", From:"InfoBox", Name: element.Name, Group: element.Group, Date: element.Date, Length: element.Length, Id: element._id, Track: null, StartPoint:element.StartPoint}
                    if ((element.Length > parseInt(this._Filter.MinKm))&&(element.Length < parseInt(this._Filter.MaxKm))){
                        ListOfTrackFiltered.push(InfoTrackObject)
                    }
                }
            });
        }
        // Filter track
        if (this._Filter.Sort == "Km"){
            // Sort By Distance
            ListOfTrackFiltered.sort((a,b)=>{
                if (a.Length <= b.Length) return -1;
                if (a.Length > b.Length) return 1;
            })
        } else {
            // Sort By Date
            ListOfTrackFiltered.sort((a,b)=>{
                if (a.Date <= b.Date) return 1;
                if (a.Date > b.Date) return -1;
            })
        }
        // Add track in content
        if (ListOfTrackFiltered.length == 0){
            content.append(CoreXBuild.DivTexte("No Track", "", "TextTrackInfo", "color: white; text-align: center;"))
        } else {
            ListOfTrackFiltered.forEach(element => {
                // Box pour toutes les info d'un track
                let DivBoxTrackInfo = CoreXBuild.Div("", "DivBoxTrackInfo", "")
                if (element.Type == "GeoxMarker"){
                    DivBoxTrackInfo.style.borderColor = "var(--CoreX-color)"
                }
                content.appendChild(DivBoxTrackInfo)
                // Conteneur flewRow
                let Conteneur = CoreXBuild.DivFlexRowStart("")
                DivBoxTrackInfo.appendChild(Conteneur)
                // Box pour click sur le nom de la track et pour faire un zoom sur la track
                let DivTrackinfo = CoreXBuild.Div("", "", "cursor: pointer; width: 65%; display: -webkit-flex; display: flex; flex-direction: column; justify-content:flex-start;")
                if (element.Type == "MyTrack"){
                    DivTrackinfo.style.color = "white"
                } else {
                    DivTrackinfo.style.color = "var(--CoreX-color)"
                }
                Conteneur.appendChild(DivTrackinfo)
                if (element.Type == "MyTrack"){
                    DivTrackinfo.addEventListener('click', this.ClickOnBoxTrack.bind(this, element.Track, true))
                } else {
                    DivTrackinfo.addEventListener('click', this.ToogleMarkerOnMap.bind(this, element.Id, true))
                }
                // Nom de la track
                DivTrackinfo.appendChild(CoreXBuild.DivTexte(element.Name,"","TextTrackInfo", "margin-left: 4%;"))
                // Group de la track
                DivTrackinfo.appendChild(CoreXBuild.DivTexte(element.Group,"","TextTrackInfo", "margin-left: 4%;"))
                // Conteur sub info des track
                let DivSubInfo = CoreXBuild.Div("","","width: 100%; display: -webkit-flex; display: flex; flex-direction: row;  justify-content:space-between;")
                DivTrackinfo.appendChild(DivSubInfo)
                // Date de la track
                DivSubInfo.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(element.Date),"","TextTrackInfo", "margin-left: 4%;"))
                // Longeur de la track
                DivSubInfo.appendChild(CoreXBuild.DivTexte(element.Length.toFixed(1) + "Km","","TextTrackInfo", "margin-left: 0%;"))
                // Box pour les bouttons
                let DivButton = document.createElement("div")
                Conteneur.appendChild(DivButton)
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")

                DivButton.appendChild(CoreXBuild.Button (`<img src="${Icon.EngrenageWhite()}" alt="icon" width="25" height="25">`, this.LoadViewAction.bind(this,element), "ButtonIcon ButtonIconWhiteBorder"))
            });
        }
    }

    FilterTrack(){
        // Create filter view
        let Conteneur = CoreXBuild.DivFlexColumn("")
        // Titre
        Conteneur.appendChild(CoreXBuild.DivTexte("Filter", "", "Titre", "width:100%; text-align: center;"))
        // Sort Type
        let DivSort = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Conteneur.appendChild(DivSort)
        DivSort.appendChild(CoreXBuild.DivTexte("Sort:", "", "", ""))
        let DivDropDown = CoreXBuild.Div("", "", "width:50%")
        DivSort.appendChild(DivDropDown)
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "SortFilter")
        DropDown.setAttribute("class", "Text MapGroupDropDown")
        let option1 = document.createElement("option")
        option1.setAttribute("value", "Km")
        option1.innerHTML = "Km"
        if (this._Filter.Sort == "Km"){option1.selected = true}
        DropDown.appendChild(option1)
        let option2 = document.createElement("option")
        option2.setAttribute("value", "Date")
        option2.innerHTML = "Date"
        if (this._Filter.Sort == "Date"){option2.selected = true}
        DropDown.appendChild(option2)
        DivDropDown.appendChild(DropDown)
        // Min Km
        let DivMinKm = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Conteneur.appendChild(DivMinKm)
        DivMinKm.appendChild(CoreXBuild.DivTexte("Min Distance (Km):", "", "", ""))
        DivMinKm.appendChild(CoreXBuild.Input("MinKm", this.GetMinMaxKm("Min"), "Input", "width: 20%;", "number", "MinKm"))
        // Max Km
        let DivMaxKm = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Conteneur.appendChild(DivMaxKm)
        DivMaxKm.appendChild(CoreXBuild.DivTexte("Max Distance (Km):", "", "", ""))
        DivMaxKm.appendChild(CoreXBuild.Input("MaxKm", this.GetMinMaxKm("Max"), "Input", "width: 20%;", "number", "MaxKm"))
        // Empty space
        Conteneur.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Div Button
        let DivButton = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivButton)
        // Button save
        DivButton.appendChild(CoreXBuild.Button("Save",this.SetFilter.bind(this),"Text Button ButtonWidth30", "Save"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.CancelSetFilter.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Conteneur.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Build window
        CoreXWindow.BuildWindow(Conteneur)
    }

    GetMinMaxKm(Type){
        let reponse = null
        this._ListOfTrack.forEach(element => {
            if (Type == "Min"){
                if (reponse == null){
                    reponse = Math.floor(element.Length)
                } else {
                    if (element.Length < reponse){reponse = Math.floor(element.Length)}
                }
            } else {
                if (reponse == null){
                    reponse = Math.ceil(element.Length)
                } else {
                    if (element.Length > reponse){reponse = Math.ceil(element.Length)}
                }
            }
        });
        if (this._ListeOfMarkers){
            this._ListeOfMarkers.forEach(element => {
                if (Type == "Min"){
                    if (reponse == null){
                        reponse = Math.floor(element.Length)
                    } else {
                        if (element.Length < reponse){reponse = Math.floor(element.Length)}
                    }
                } else {
                    if (reponse == null){
                        reponse = Math.ceil(element.Length)
                    } else {
                        if (element.Length > reponse){reponse = Math.ceil(element.Length)}
                    }
                }
            });
        }
        // si pas de marker alors la reponse est = 0
        if (reponse == null){
            reponse = "0"
        }
        return reponse
    }

    SetFilter(){
        // Get all filter data
        this._Filter.Sort = document.getElementById("SortFilter").value
        this._Filter.MinKm = document.getElementById("MinKm").value
        this._Filter.MaxKm = document.getElementById("MaxKm").value
        // Show track
        this.UpdateTrackDataInView()
        // close window
        CoreXWindow.DeleteWindow()
    }

    CancelSetFilter(){
        // close window
        CoreXWindow.DeleteWindow()
    }

    AddFolderData(){
        // Get Action
        let action = document.getElementById("InfoBoxAction")
        // Clear Action
        action.innerHTML = ""
        // Get content
        let content = document.getElementById("InfoBoxContent")
        // Clear content
        content.innerHTML = ""
        // Get Group in all track
        let groupused = []
        groupused = [...new Set(this._ListOfTrack.map(item => item.Group))] 
        // Add Folder Data
        if (this._UserGroup.length == 0){
            content.append(CoreXBuild.DivTexte("No Folder", "", "TextTrackInfo", "color: white; text-align: center;"))
        } else {
            this._UserGroup.forEach(element => {
                // Box pour toutes les info du folder
                let DivBoxTrackInfo = CoreXBuild.Div("", "DivBoxTrackInfo", "")
                content.appendChild(DivBoxTrackInfo)
                DivBoxTrackInfo.style.padding = "1vh"
                DivBoxTrackInfo.style.width= "80%"
                // Conteneur flewRow
                let Conteneur = CoreXBuild.DivFlexRowStart("")
                DivBoxTrackInfo.appendChild(Conteneur)
                // checkbox du folder
                let Checkbox = CoreXBuild.Input("CheckBox" + element, "", "", "", "checkbox", "CheckBox" + element, "")
                Conteneur.appendChild(Checkbox)
                let IsChecked = false
                groupused.forEach(elementused => {
                    if (elementused == element){IsChecked = true}
                });
                Checkbox.checked = IsChecked
                Checkbox.addEventListener('change', (event)=>{this.ResetFilterMinMax(); this.CheckboxGroupChange(element, event.target.checked)})
                Conteneur.append(CoreXBuild.DivTexte(element, "", "TextTrackInfo", "color: white; margin-left: 4%;"))
            });
        }
    }

    ResetFilterMinMax(){
        this._Filter.MinKm = "0"
        this._Filter.MaxKm = '1000'
    }

    UpdateInfoboxTrackData(){
        if (this.InfoBowIsShown){
            if (this.TrackDataIsShown){
                this.UpdateTrackDataInView()
            }
        }
    }

}