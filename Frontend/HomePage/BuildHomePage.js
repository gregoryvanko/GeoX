const os = require('os')
const fs = require('fs')
const path = require('path')

function BuildAndAddHomePage(){
    require("@gregvanko/nanox").NanoXAddPageToBuild("HomePage.html", "","GeoX", GetCSS(), GetJS())
}

function GetJS(){
    let js = ""
    Path = path.join(__dirname, '/HomePage.js')
    js += fs.readFileSync(Path, 'utf8')
    js += os.EOL
    return js
}

function GetCSS(){
    let css = ""
    Path = path.join(__dirname, '/HomePage.css')
    css += fs.readFileSync(Path, 'utf8')
    css += os.EOL
    return css
}

module.exports.BuildAndAddHomePage = BuildAndAddHomePage