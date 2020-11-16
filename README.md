# Geox
Geox is Node.js application for gpx visualisation

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/geox --save
```

## File App.js
Create a "App.js" file with this content:
```js
let GeoX = require('@gregvanko/geox').GeoX
const Name = "GeoX"
const Port = 9002
const Debug = false
let MyApp = new GeoX(Name, Port, Debug)
MyApp.Start()
```