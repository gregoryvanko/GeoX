class ElevationBox {
    
    constructor(DivApp, DrawElevationPointOnMap, HideElevationPointOnMap){
        this._DivApp = DivApp
        this.DrawElevationPointOnMap = DrawElevationPointOnMap
        this.HideElevationPointOnMap = HideElevationPointOnMap

        this._scatterChart = null
        this._Elevation = [{x: 0,y: 0}]

        this._IdElevationBoxtext = "ElevationBoxtext"
        this._IdElevationBoxGraph = "ElevationBoxGraph"
        this._IdElevLength = "ElevLength"
        this._IdElevCumulP = "ElevCumulP"
        this._IdElevCumulM = "ElevCumulM"
        this._IdElevMax = "ElevMax"
        this._IdElevMin = "ElevMin"

        this.BuildBox()
    }

    BuildBox(){
        // Div du box
        let DivBox = NanoXBuild.Div("DivElevationBox", "DivElevationBox")
        this._DivApp.appendChild(DivBox)
        // DivFlex
        let DivFlexBox = NanoXBuild.DivFlexColumn(null, null, "width: 100%;")
        DivFlexBox.style.height= "100%"
        DivBox.appendChild(DivFlexBox)
        // Add Txt
        this.BuildText(DivFlexBox)
        // Add Graph
        this.BuildGraph(DivFlexBox)
    }

    BuildText(Div){
        Div.appendChild(NanoXBuild.DivText("No Elevation", this._IdElevationBoxtext, "Text", "color:white;"))
    }

    BuildGraph(Div){        
        let DivGraph = NanoXBuild.Div(this._IdElevationBoxGraph, null, "width:100%; display:none")
        Div.appendChild(DivGraph)
        // Build elevation data
        this.BuildElevationData(DivGraph)
        // Build graph
        let me = this
        let chartdiv = document.createElement("div")
        chartdiv.setAttribute("Class", "ElevationBoxChart")
        DivGraph.appendChild(chartdiv)
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
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();
                    ctx.restore();
           }
        }
        });
        this._scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    data: this._Elevation,
                    showLine: true,
                    fill: false,
                    borderColor: 'white',
                    pointRadius: 0
                }]
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom',
                    display: false
                },
                tooltips: {
                    intersect: false,
                    mode: 'x-axis',
                    custom: function(tooltip) {
                        if (!tooltip) return;
                        // disable displaying the color box;
                        tooltip.displayColors = false;
                    },
                    callbacks: {
                      label: function(tooltipItem, data) {
                          me.DrawElevationPoint(tooltipItem.index)
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
                            beginAtZero: true,
                            fontColor: "white",
                            callback: function(value, index, values) {
                                if (value >= 1000){
                                    return  value / 1000 + " Km"
                                } else {
                                    return value + ' m'
                                }
                            }
                        },
                        gridLines: {
                            zeroLineColor: 'white',
                            color: "white",
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: "white",
                            stepSize: 10,
                            callback: function(value, index, values) {
                                return value + ' m'
                            }
                        },
                        gridLines: {
                            zeroLineColor: 'white',
                            color: "white",
                        }
                    }]
                }
            }
        });
    }

    BuildElevationData(DivData){
        let conteneur = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
        conteneur.style.marginBottom = "1vh"
        DivData.appendChild(conteneur)
        conteneur.appendChild(this.DrawDataInfo(this._IdElevLength, "0", "Km", CommonIcon.LenghtWhite()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._IdElevCumulP, "0", "m", CommonIcon.ElevationPlusWhite()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._IdElevCumulM, "0", "m", CommonIcon.ElevationMoinsWhite()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._IdElevMax, "0", "m", CommonIcon.ElevationMaxWhite()))
        conteneur.appendChild(this.DrawVerticalLine())
        conteneur.appendChild(this.DrawDataInfo(this._IdElevMin, "0", "m", CommonIcon.ElevationMinWhite()))
    }

    DrawDataInfo(Id, Value, Unite, Description){
        let conteneur = NanoXBuild.Div(null, null, "display: -webkit-flex; display: flex; flex-direction: column; justify-content:space-around; align-content:center; align-items: center; flex-wrap: wrap;")

        let conteneurdescription = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
        conteneurdescription.appendChild(NanoXBuild.Image64(Description,"", "", "height: 2.5vh; margin-bottom:0.5vh"))
        conteneur.appendChild(conteneurdescription)

        let conteneurvalue = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
        conteneurvalue.appendChild(NanoXBuild.DivText(Value,Id,"TextSmall", "padding-right: 0.5vw; color:white;"))
        conteneurvalue.appendChild(NanoXBuild.DivText(Unite,null,"TextSmall", "color:white;"))
        conteneur.appendChild(conteneurvalue)

        return conteneur
    }

    DrawVerticalLine(){
        let conteneur = NanoXBuild.Div(null, null, "border-left: 2px solid #dfdfe8; height: 4vh;")
        return conteneur
    }

    DrawElevationPoint(Index){
        let ElevationPoint = this._Elevation[Index]
        let latlng = [ElevationPoint.coord.lat, ElevationPoint.coord.long]
        this.DrawElevationPointOnMap(latlng)
    }

    CanvansMouseOutEvent(){
        this.HideElevationPointOnMap()
    }

    UpdateGraph(Elevation){
        // Save Data
        this._Elevation = Elevation.AllElevation
        // Hide Text
        document.getElementById(this._IdElevationBoxtext).style.display = "none"
        // Show Graph
        document.getElementById(this._IdElevationBoxGraph).style.display = "block"
        // Update Graph
        this._scatterChart.data.datasets[0].data = this._Elevation
        this._scatterChart.update()
        // Update data
        let lenght = this._Elevation[this._Elevation.length-1].x
        lenght = lenght/1000
        lenght = lenght.toFixed(1)
        document.getElementById(this._IdElevLength).innerHTML = lenght
        document.getElementById(this._IdElevCumulP).innerHTML = Elevation.InfoElevation.ElevCumulP
        document.getElementById(this._IdElevCumulM).innerHTML = Elevation.InfoElevation.ElevCumulM
        document.getElementById(this._IdElevMax).innerHTML = Elevation.InfoElevation.ElevMax
        document.getElementById(this._IdElevMin).innerHTML = Elevation.InfoElevation.ElevMin
    }

    UpdateText(Text){
        // Hide Graph
        document.getElementById(this._IdElevationBoxGraph).style.display = "none"
        // Show Text
        document.getElementById(this._IdElevationBoxtext).style.display = "block"
        // Update Text
        document.getElementById(this._IdElevationBoxtext).innerHTML = Text
    }
    
}