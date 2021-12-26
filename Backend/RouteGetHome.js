function CallRouteGetHome(req, res, MyApp){
    res.send(GetHtmlHomePage(MyApp.AppName))
}

function GetHtmlHomePage (Titre){
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="GeoX">
    <link rel="apple-touch-icon" href="apple-icon.png">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${Titre}</title>
    <style>${GetCSSHomePAge()}</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script>
    <script defer>${GetJSHomePAge()}</script>
    </head>
    <body>
        <div style="height: 1rem;"></div>
    </body>
    </html>
    `
}

function GetCSSHomePAge(){
    let os = require('os')

    let Css =`
    body{
        margin: 0;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none; 
        -webkit-user-select: none;   
        -khtml-user-select: none;    
        -moz-user-select: none;      
        -ms-user-select: none;      
        user-select: none;  
        cursor: default;
        font-family: Arial, Verdana, sans-serif;
        font-synthesis: none;
        letter-spacing: normal;
        text-rendering: optimizelegibility;
        background-color: rgb(247, 247, 250);
        color: black;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        align-content: center;
    }
    
    .OpenButton{
        padding: 0.5rem;
        cursor: pointer;
        border: 1px solid blue;
        border-radius: 1rem;
        text-align: center;
        display: inline-block;
        color: blue;
        outline: none;
        font-size: 1rem;
        background-color: white;
        max-width: 10rem;
        margin-left: auto;
        margin-right: auto;
    }

    .FixedRight{
        right: 1rem;
        top: 1.5rem;
        position: fixed;
    }

    .InfoBox{
        width:40rem;
        box-sizing: border-box;
        max-width: 85%;
        display: flex;
        flex-direction: column;
        text-align: center;
        border: 1px solid black;
        border-radius: 1rem;
        background-color: white;
        top: 30vh;
        position: fixed;
        padding: 0.5rem;
        box-shadow: 0.4rem 0.4rem 1rem black;
    }

    .DivPostApp{
        width:45rem;
        box-sizing: border-box;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        align-content: center;
        margin-top: 2rem;
    }
    
    .ButtonX{
        margin-bottom: 1rem;
        cursor: pointer;
        border: 3px solid black;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        color: black;
        background: transparent;
        outline: none;
        font-size: 1.5rem;
        margin-left: auto;
        background-color: white;
        font-weight: bold;
        padding: 1px 6px;
        -webkit-appearance: none;
    }
    .ButtonX::after{
        content: "X";
    }
    `
    Css += os.EOL

    return Css
}

function GetJSHomePAge(){
    let js = ""

    let os = require('os')
    let fs = require('fs')
    let path = require('path');

    // HtmlElem-Post
    let Path = path.join(__dirname, '../Frontend/Common/HtmlElemGeoxPost.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL

    // Home
    Path = path.join(__dirname, '../Frontend/HomePage/HomePage.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL
    return js
}

module.exports.CallRouteGetHome = CallRouteGetHome