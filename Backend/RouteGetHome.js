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
    let Css= ""
    let os = require('os')
    let fs = require('fs')
    let path = require('path');

    let reqPath = path.join(__dirname, '../Frontend/Common/0-leaflet.css')
    Css += fs.readFileSync(reqPath, 'utf8')
    Css += os.EOL

    reqPath = path.join(__dirname, '../Frontend/Common/Common.css')
    Css += fs.readFileSync(reqPath, 'utf8')
    Css += os.EOL

    reqPath = path.join(__dirname, '../Frontend/HomePage/HomePage.css')
    Css += fs.readFileSync(reqPath, 'utf8')
    Css += os.EOL

    return Css
}

function GetJSHomePAge(){
    let js = ""

    let os = require('os')
    let fs = require('fs')
    let path = require('path');

    // HtmlElem-Post
    let Path = path.join(__dirname, '../Frontend/Common/HtmlElem-Post.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL

    // InfoOnTrack
    Path = path.join(__dirname, '../Frontend/Common/InfoOnTrack.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL

    // Icon
    Path = path.join(__dirname, '../Frontend/Common/CommonIcon.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL
    Path = path.join(__dirname, '../Frontend/Common/Icon.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL

    // leaflet
    Path = path.join(__dirname, '../Frontend/Common/0-leaflet.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL
    Path = path.join(__dirname, '../Frontend/Common/1-leaflet.geometryutil.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL
    Path = path.join(__dirname, '../Frontend/Common/2-leaflet-arrowheads.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL

    // Home
    Path = path.join(__dirname, '../Frontend/HomePage/HomePage.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL
    return js
}

module.exports.CallRouteGetHome = CallRouteGetHome