class FilterBox {
    constructor(Data){
        this._InitialData = Data
        this.BuildView()
    }

    BuildView(){
        // Create filter view
        let Conteneur = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")

        // Titre
        Conteneur.appendChild(NanoXBuild.DivText("Filter", null, "Titre", "width:100%; text-align: center; margin-bottom: 0rem"))

        // Min Km
        if(this._InitialData.DistanceMin != undefined){
            let DivMinKm = NanoXBuild.Div(null,"Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivMinKm)
            DivMinKm.appendChild(NanoXBuild.DivText("Distance Min (Km):"))
            DivMinKm.appendChild(NanoXBuild.Input(this._InitialData.DistanceMin, "number", "MinKm", "", "MinKm", "Input", "width: 20%;"))
        }
        
        // Max Km
        if(this._InitialData.DistanceMax != undefined){
            let DivMaxKm = NanoXBuild.Div(null,"Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivMaxKm)
            DivMaxKm.appendChild(NanoXBuild.DivText("Max Distance (Km):"))
            DivMaxKm.appendChild(NanoXBuild.Input(this._InitialData.DistanceMax, "number", "MaxKm", "", "MaxKm", "Input", "width: 20%;"))
        }

        // Toggle HideMyTrack
        if(this._InitialData.HideMyTrack != undefined){
            let DivToogleHideMyTrack = NanoXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivToogleHideMyTrack)
            DivToogleHideMyTrack.appendChild(NanoXBuild.DivText("Hide my Track:"))
            let divToogleSwitch = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 20%;")
            DivToogleHideMyTrack.appendChild(divToogleSwitch)
            divToogleSwitch.appendChild(NanoXBuild.ToggleSwitch({Id: "ToggleHideMyTrack", Checked: this._InitialData.HideMyTrack, HeightRem:2}))
        }

        // User Group
        if(this._InitialData.Group != undefined){
            // Input
            let DivInputGroup = NanoXBuild.Div(null,"Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivInputGroup)
            DivInputGroup.appendChild(NanoXBuild.DivText("Group:"))
            
            let inputStyle="box-sizing: border-box; outline: none; margin: 0; -webkit-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -moz-box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); box-shadow: inset 0 1px 3px 0 rgba(0,0,0,.08); -webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #666; width: 60%;"
            let InputGroup = NanoXBuild.Input(this._InitialData.Group, "text", "InputTrackGroup", "", "InputTrackGroup", "Input Text", inputStyle)
            InputGroup.onfocus = function(){InputGroup.placeholder = ""}
            InputGroup.setAttribute("autocomplete", "off")
            DivInputGroup.appendChild(InputGroup)

            // Add AutoComplete
            if ((this._InitialData.AllGroups != undefined) && (this._InitialData.AllGroups != null)){
                let MyGroups = this._InitialData.AllGroups
                autocomplete({
                    input: InputGroup,
                    minLength: 0,
                    showOnFocus: true,
                    emptyMsg: 'No suggestion',
                    fetch: function(text, update) {
                        text = text.toLowerCase();
                        var GroupFiltred = MyGroups.filter(n => n.toLowerCase().startsWith(text))
                        var suggestions = []
                        GroupFiltred.forEach(element => {
                            var MyObject = new Object()
                            MyObject.label = element
                            suggestions.push(MyObject)
                        });
                        update(suggestions);
                    },
                    onSelect: function(item) {
                        InputGroup.value = item.label;
                    }
                });
            }
        }
        
        let ListOfButton = [
            {Titre: "Save", Action: this.ClickSave.bind(this), Id: null},
            {Titre: "Cancel", Action: this.CloseBox.bind(this), Id: null}
        ]
        // Build window
        NanoXBuild.PopupCreate(Conteneur, ListOfButton)
    }

    CloseBox(){
        NanoXBuild.PopupDelete()
    }

    ClickSave(){
        let Filter = this._InitialData

        if(this._InitialData.DistanceMin != undefined){Filter.DistanceMin = parseInt(document.getElementById("MinKm").value)}
        if(this._InitialData.DistanceMax != undefined){Filter.DistanceMax = parseInt(document.getElementById("MaxKm").value)}
        if(this._InitialData.HideMyTrack != undefined){Filter.HideMyTrack = document.getElementById("ToggleHideMyTrack").checked}
        if(this._InitialData.Group != undefined){Filter.Group = document.getElementById("InputTrackGroup").value}

        // close window
        NanoXBuild.PopupDelete()
        // Start save action
        this.Save(Filter)
    }

    Save(Filter){
        alert("Save Filter")
    }
}