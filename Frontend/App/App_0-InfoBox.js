class InfoBox{
    constructor(DivApp, ToogleTrack, ClickOnBoxTrack, ChangeTrackColor, ClickOnFollowTrack, CheckboxGroupChange){
        this._DivApp = DivApp
        this.ToogleTrack = ToogleTrack
        this.ClickOnBoxTrack = ClickOnBoxTrack
        this.ChangeTrackColor = ChangeTrackColor
        this.ClickOnFollowTrack = ClickOnFollowTrack
        this.CheckboxGroupChange = CheckboxGroupChange
        // Statu de l'infobox
        this._InfoBowIsShown = false
        // UserGroup
        this._UserGroup = null
        // ListOfTrack
        this._ListOfTrack = null
        // Filter
        this._Filter = {Sort:"Date", MinKm: "0", MaxKm: "1000"}
    }

    set ListOfTrack(val){this._ListOfTrack = val}
    get InfoBowIsShown() {return this._InfoBowIsShown}

    /**
     * Toggle Show Hide Info Box
     */
    InfoBoxToggle(UserGroup, ListOfTrack){
        this._UserGroup = UserGroup
        this._ListOfTrack = ListOfTrack
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
        this.AddTrackData()
        // Start transition
        setTimeout(function(){
            //let DivBoxTracks = document.getElementById("DivBoxTracks")
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
        this.AddTrackData()
    }

    /**
     * Construit la vue track
     * @param {String} DivId Id du div du conteneur
     */
    AddTrackData(){
        // Get Action
        let action = document.getElementById("InfoBoxAction")
        // Clear Action
        action.innerHTML = ""
        // Add filter button
        action.appendChild(CoreXBuild.Button (`<img src="${Icon.Filter()}" alt="icon" width="30" height="30">`, this.FilterTrack.bind(this), "ButtonInfoBoxNav", ""))
        // Add button Hide all
        action.appendChild(CoreXBuild.Button (`<img src="${Icon.Oeil()}" alt="icon" width="30" height="30">`, this.ToogleTrack.bind(this, null), "ButtonInfoBoxNav", ""))
        // Get content
        let content = document.getElementById("InfoBoxContent")
        // Clear content
        content.innerHTML = ""
        // Filter track
        let ListOfTrackFiltered = []
        this._ListOfTrack.forEach(Track => {
            if ((Track.Length > parseInt(this._Filter.MinKm))&&(Track.Length < parseInt(this._Filter.MaxKm))){
                ListOfTrackFiltered.push(Track)
            }
        })
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
            ListOfTrackFiltered.forEach(Track => {
                // Box pour toutes les info d'un track
                let DivBoxTrackInfo = CoreXBuild.Div("", "DivBoxTrackInfo", "")
                content.appendChild(DivBoxTrackInfo)
                // Conteneur flewRow
                let Conteneur = CoreXBuild.DivFlexRowStart("")
                DivBoxTrackInfo.appendChild(Conteneur)
                // Box pour click sur le nom de la track et pour faire un zoom sur la track
                let DivTrackinfo = CoreXBuild.Div("", "", "cursor: pointer; width: 56%; display: -webkit-flex; display: flex; flex-direction: column; justify-content:flex-start;")
                Conteneur.appendChild(DivTrackinfo)
                DivTrackinfo.addEventListener('click', this.ClickOnBoxTrack.bind(this, Track))
                // Nom de la track
                DivTrackinfo.appendChild(CoreXBuild.DivTexte(Track.Name,"","TextTrackInfo", "color: white; margin-left: 4%;"))
                // Group de la track
                DivTrackinfo.appendChild(CoreXBuild.DivTexte(Track.Group,"","TextTrackInfo", "color: white; margin-left: 4%;"))
                // Conteur sub info des track
                let DivSubInfo = CoreXBuild.Div("","","width: 100%; display: -webkit-flex; display: flex; flex-direction: row;  justify-content:space-between;")
                DivTrackinfo.appendChild(DivSubInfo)
                // Date de la track
                DivSubInfo.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(Track.Date),"","TextTrackInfo", "color: white; margin-left: 4%;"))
                // Longeur de la track
                DivSubInfo.appendChild(CoreXBuild.DivTexte(Track.Length.toFixed(1) + "Km","","TextTrackInfo", "color: white; margin-left: 0%;"))
                // Box pour les bouttons
                let DivButton = document.createElement("div")
                Conteneur.appendChild(DivButton)
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                // Boutton Color track
                let inputcolor = document.createElement("input")
                inputcolor.setAttribute("id","color" + Track._id)
                inputcolor.setAttribute("type","color")
                inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; width: 34px; border: 1px solid black;")
                inputcolor.value = Track.Color
                inputcolor.onchange = (event)=>{this.ChangeTrackColor(event.target.value, Track.Name, Track.Length, Track._id)}
                DivButton.appendChild(inputcolor)
                // Boutton Follow
                DivButton.appendChild(CoreXBuild.Button (`<img src="${Icon.Follow()}" alt="icon" width="25" height="25">`, this.ClickOnFollowTrack.bind(this,Track), "ButtonIcon"))
                // Button show/hide track
                DivButton.appendChild(CoreXBuild.Button (`<img src="${Icon.Oeil()}" alt="icon" width="25" height="25">`, this.ToogleTrack.bind(this,Track._id), "ButtonIcon"))
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
        this.AddTrackData()
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
                Checkbox.addEventListener('change', (event)=>{this.CheckboxGroupChange(element, event.target.checked)})
                Conteneur.append(CoreXBuild.DivTexte(element, "", "TextTrackInfo", "color: white; margin-left: 4%;"))
            });
        }
    }

}