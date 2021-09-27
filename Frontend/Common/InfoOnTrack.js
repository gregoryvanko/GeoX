class InfoOnTrack {
    
    constructor(Data, HtmlDiv){
        this._Id = Data._id
        this._Name = Data.Name
        this._Date = Data.Date
        this._GeoJsonData = Data.GeoJsonData
        this._Length = Data.Length
        this._Center = Data.Center
        this._StartPoint = Data.StartPoint
        this._Elevation = Data.Elevation
        this._Description = Data.Description
        this._ElevMax = Data.InfoElevation.ElevMax
        this._ElevMin = Data.InfoElevation.ElevMin
        this._ElevCumulP = Data.InfoElevation.ElevCumulP
        this._ElevCumulM = Data.InfoElevation.ElevCumulM

        this._HtmlDiv = document.getElementById(HtmlDiv)
        this._Map = null
        this._MapId = "mapid"
        this._LayerGroup = null
        this._WeightTrack = (L.Browser.mobile) ? 5 : 3
        this._IconPointStartOption = L.icon({
            iconUrl: Icon.MarkerVert(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        this._IconPointEndOption = L.icon({
            iconUrl: Icon.MarkerRouge(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        this._GpsPointer = null

        this.LoadView()

    }

    LoadView(){
        this._HtmlDiv.innerHTML=""
        // Blank
        let divblank = document.createElement('div')
        divblank.style.height ="4vh"
        //this._HtmlDiv.appendChild(divblank)
        // Info
        let DivInfo = document.createElement('div')
        DivInfo.classList.add("DivInfoOneTrack")
        DivInfo.style.borderWidth = "0px"
        this._HtmlDiv.appendChild(DivInfo)
        this.DrawInfo(DivInfo)
        // Div Data
        let DivData = document.createElement('div')
        DivData.classList.add("DivInfoOneTrack")
        this._HtmlDiv.appendChild(DivData)
        this.DrawData(DivData)
        // Div Carte
        let DivCarte = document.createElement('div')
        DivCarte.classList.add("DivInfoOneTrack")
        this._HtmlDiv.appendChild(DivCarte)
        this.DrawMap(DivCarte)
        // Div Elevation
        let DivElevation = document.createElement('div')
        DivElevation.classList.add("DivInfoOneTrack")
        this._HtmlDiv.appendChild(DivElevation)
        this.DrawElevation(DivElevation)
    }

    DrawInfo(DivInfo){
        // Name
        let divname = document.createElement('div')
        divname.innerHTML = this._Name
        divname.style.width ="100%"
        divname.classList.add("TitreInfoOneTrack")
        DivInfo.appendChild(divname)
        // Date
        let divdate = document.createElement('div')
        divdate.innerHTML = this.GetDateString(this._Date)
        divdate.classList.add("TextSmall")
        divdate.style.width ="100%"
        divdate.style.paddingLeft ="2vh"
        divdate.style.marginBottom ="2vh"
        DivInfo.appendChild(divdate)
        // Description
        if (this._Description != ""){
            let divdesc = document.createElement('div')
            divdesc.innerHTML = this._Description
            divdesc.classList.add("Text")
            divdesc.style.width ="100%"
            divdesc.style.paddingLeft ="2vh"
            DivInfo.appendChild(divdesc)
        }
    }

    GetDateString(DateString){
        var Now = new Date(DateString)
        var dd = Now.getDate()
        var mm = Now.getMonth()+1
        var yyyy = Now.getFullYear()
        if(dd<10) {dd='0'+dd} 
        if(mm<10) {mm='0'+mm}
        return yyyy + "-" + mm + "-" + dd
    }

    DrawData(DivData){
        let conteneur = document.createElement('div')
        conteneur.setAttribute("style","width: 100%; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center;")
        DivData.appendChild(conteneur)
        conteneur.appendChild(this.DrawDataInfo(this._Length, "Km", CommonIcon.Lenght()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._ElevCumulP, "m", CommonIcon.ElevationPlus()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._ElevCumulM, "m", CommonIcon.ElevationMoins()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._ElevMax, "m", CommonIcon.ElevationMax()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._ElevMin, "m", CommonIcon.ElevationMin()))
    }

    DrawDataInfo(Value, Unite, Description){
        let conteneur = document.createElement('div')
        conteneur.setAttribute("style","display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center;")

        let conteneurvalue = document.createElement('div')
        conteneurvalue.setAttribute("style","width: 100%; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center;")

        let divdesc = document.createElement('div')
        divdesc.innerHTML = Value
        divdesc.classList.add("Text")
        divdesc.style.paddingRight ="0.5vw"
        divdesc.style.fontWeight ="bold"
        conteneurvalue.appendChild(divdesc)

        let divunite = document.createElement('div')
        divunite.innerHTML = Unite
        divunite.classList.add("TextSmall")
        divunite.style.fontWeight ="bold"
        conteneurvalue.appendChild(divunite)

        conteneur.appendChild(conteneurvalue)

        let conteneurdescription = document.createElement('div')
        conteneurdescription.setAttribute("style","width: 100%; display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center;")

        let image = document.createElement("img")
        image.setAttribute("src", Description)
        image.setAttribute("Style", "height: 3vh;")
        conteneurdescription.appendChild(image)

        conteneur.appendChild(conteneurdescription)
        return conteneur
    }

    DrawVerticalLine(){
        let line = document.createElement("div")
        line.setAttribute("Style", "border-left: 2px solid #dfdfe8; height: 6vh;")
        return line
    }

    DrawMap(DivCarte){
        if (this._GeoJsonData){
            let Divmap = document.createElement('div')
            Divmap.setAttribute("id", this._MapId)
            Divmap.classList.add("InfoOnTrackMap")
            DivCarte.appendChild(Divmap)
            // Parametre de la carte
            let CenterPoint = {Lat: this._Center.Lat, Long: this._Center.Long}
            let Zoom = 14
            // Creation de la carte
            var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            })
            var Openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            })
            var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            });
            var baseLayers = {
                "OpenStreet": Openstreetmap,
                "OpenStreetFrance" : OpenStreetMap_France,
                "OpenTopMap" : OpenTopoMap,
                "Satellite": satellite
            };
            this._Map = L.map(this._MapId , {zoomControl: false, tapTolerance:40, tap:false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], Zoom);
            L.control.zoom({position: 'bottomright'}).addTo(this._Map);
            L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
            // Creation du groupe de layer
            this._LayerGroup = new L.LayerGroup()
            this._LayerGroup.addTo(this._Map)
    
            let WeightTrack = this._WeightTrack
            var TrackStyle = {
                "color": "blue",
                "weight": WeightTrack
            };
            var layerTrack1=L.geoJSON(this._GeoJsonData , 
                {
                    style: TrackStyle, 
                    filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                    arrowheads: {frequency: '100px', size: '15m', fill: true}
                }).addTo(this._LayerGroup)
            layerTrack1.Type= "Track"
            layerTrack1.id = this._Id
            
            
            // Get Start and end point
            var numPts = this._GeoJsonData.features[0].geometry.coordinates.length;
            var beg = this._GeoJsonData.features[0].geometry.coordinates[0];
            var end = this._GeoJsonData.features[0].geometry.coordinates[numPts-1];
            
            // Marker Start
            var MarkerStart = new L.marker([beg[1],beg[0]], {icon: this._IconPointStartOption}).addTo(this._LayerGroup)
            MarkerStart.id = this._Id + "start"
            MarkerStart.Type = "Marker"
            MarkerStart.dragging.disable();
            // Marker End
            var MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).addTo(this._LayerGroup)
            MarkerEnd.id = this._Id + "end"
            MarkerEnd.Type = "Marker"
            MarkerEnd.dragging.disable();
            // FitBound
            this._Map.fitBounds(layerTrack1.getBounds());
        } else {
            let Diverreur = document.createElement('div')
            Diverreur.innerHTML = "No Geojson data available."
            Diverreur.classList.add("Text")
            DivCarte.appendChild(Diverreur)
        }
        
    }

    DrawElevation(DivElevation){
        if (this._Elevation){
            let me = this
            let chartdiv = document.createElement("div")
            chartdiv.setAttribute("Class", "InfoOnTrackChart")
            DivElevation.appendChild(chartdiv)

            let canvas = document.createElement("canvas")
            canvas.setAttribute("id", "myChart")
            canvas.addEventListener ("mouseout", this.CanvansMouseOutEvent.bind(this), false);
            chartdiv.appendChild(canvas)
            let ctx = document.getElementById('myChart').getContext('2d')

            Chart.plugins.register ( {
                afterDatasetsDraw: function(chart) {
                    let chart_type = chart.config.type;
                    if (chart.tooltip._active && chart.tooltip._active.length && chart_type === 'scatter') {
                        let activePoint = chart.tooltip._active[0],
                        ctx = chart.chart.ctx,
                        x_axis = chart.scales['x-axis-1'],
                        y_axis = chart.scales['y-axis-1'],
                        x = activePoint.tooltipPosition().x,
                        topY = y_axis.top,
                        bottomY = y_axis.bottom;
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(x, topY+1);
                        ctx.lineTo(x, bottomY+1);
                        ctx.setLineDash([2,3]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'red';
                        ctx.stroke();
                        ctx.restore();
               }
            }
            });

            var scatterChart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Elevation',
                        data: this._Elevation,
                        showLine: true,
                        fill: false,
                        borderColor: 'blue',
                        pointRadius: 0
                    }]
                },
                options: {
                    animation: false,
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },tooltips: {
                        intersect: false,
                        mode: 'x-axis',
                        custom: function(tooltip) {
                            if (!tooltip) return;
                            // disable displaying the color box;
                            tooltip.displayColors = false;
                        },
                        callbacks: {
                          label: function(tooltipItem, data) {
                              me.DrawElevationPointOnMap(tooltipItem.index, tooltipItem.label, tooltipItem.value)
                              let x = "Distance: " + tooltipItem.label + "m"
                              let multistringText = [x]
                              let y = "Elevation: " + tooltipItem.value + "m"
                              multistringText.push(y);
                              return multistringText;
                          },
                          title: function(tooltipItem, data) {
                            return;
                          }
                        }
                    },
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                callback: function(value, index, values) {
                                    if (value >= 1000){
                                        return  value / 1000 + " Km"
                                    } else {
                                        return value + ' m'
                                    }
                                }
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                stepSize: 10,
                                callback: function(value, index, values) {
                                    return value + ' m'
                                }
                            }
                        }]
                    }
                }
            });
        } else {
            let Diverreur = document.createElement('div')
            Diverreur.innerHTML = "No Elevation data available."
            Diverreur.classList.add("Text")
            DivElevation.appendChild(Diverreur)
        }
    }

    DrawElevationPointOnMap(Index, x, elevation){
        let ElevationPoint = this._Elevation[Index]
        let latlng = [ElevationPoint.coord.lat, ElevationPoint.coord.long]
        if (this._GpsPointer == null){
            this._GpsPointer = L.circleMarker([50.709446,4.543413], {radius: 8, weight:4,color: 'white', fillColor:'red', fillOpacity:1}).addTo(this._Map)
        }
        this._GpsPointer.setLatLng(latlng)
    }

    CanvansMouseOutEvent(){
        if (this._GpsPointer){
            this._Map.removeLayer(this._GpsPointer)
            this._GpsPointer = null
        }
    }
}