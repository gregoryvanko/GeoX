class ElevationBox {
    constructor(DivApp){
        this._DivApp = DivApp
        this._DivBox = null
        this._scatterChart = null

        this.BuildBox()
    }

    BuildBox(){
        // Div du box
        let DivBox = CoreXBuild.Div("DivElevationBox", "DivElevationBox", "")
        this._DivBox = DivBox
        this._DivApp.appendChild(DivBox)
        // Add Txt
        let DivFlexTxt = CoreXBuild.DivFlexColumn()
        DivFlexTxt.style.height= "100%"
        DivFlexTxt.style.justifyContent = "center"
        this._DivBox.appendChild(DivFlexTxt)
        DivFlexTxt.appendChild(CoreXBuild.DivTexte("No Elevation", "", "Text", "color:white;"))
    }

    BuildGraph(Elevation){
        this._DivBox.innerHTML = ""
        // Graph
        let me = this
        let canvas = document.createElement("canvas")
        canvas.setAttribute("id", "myChart")
        canvas.addEventListener ("mouseout", this.CanvansMouseOutEvent.bind(this), false);
        this._DivBox.appendChild(canvas)
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
                    //ctx.setLineDash([2,3]);
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
                    data: Elevation,
                    showLine: true,
                    fill: false,
                    borderColor: 'white',
                    pointRadius: 0
                }]
            },
            options: {
                animation: false,
                aspectRatio: 2.5,
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
                            beginAtZero: true,
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

    DrawElevationPointOnMap(Index, x, elevation){
        // let ElevationPoint = this._Elevation[Index]
        // let latlng = [ElevationPoint.coord.lat, ElevationPoint.coord.long]
        // if (this._GpsPointer == null){
        //     this._GpsPointer = L.circleMarker([50.709446,4.543413], {radius: 8, weight:4,color: 'white', fillColor:'red', fillOpacity:1}).addTo(this._Map)
        // }
        // this._GpsPointer.setLatLng(latlng)
    }

    CanvansMouseOutEvent(){
        // if (this._GpsPointer){
        //     this._Map.removeLayer(this._GpsPointer)
        //     this._GpsPointer = null
        // }
    }

    UpdateGraph(Elevation){
        if (this._scatterChart == null){
            this.BuildGraph(Elevation)
        } else {
            this._scatterChart.data.datasets[0].data = Elevation
            this._scatterChart.update()
        }
    }
}