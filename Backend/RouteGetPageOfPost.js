function CallRouteGetPageOfPost(req, res, MyApp){
    let Page = req.params.page
    GetPostOfPage(Page, res, MyApp)
}

async function GetPostOfPage (Page, res, MyApp){
    // Get Post of page
    let ReponsePostOfPageFromDb = await PromiseGetPostOfPageFromDb(parseInt(Page), MyApp)
    if(ReponsePostOfPageFromDb.Error){
        MyApp.LogAppliError(ReponsePostOfPageFromDb.ErrorMsg, "GetPageOfPost", "GetPageOfPost")
        res.status("500").json(ReponsePostOfPageFromDb)
    } else {
        res.status("200").json(ReponsePostOfPageFromDb)
    }
}

function PromiseGetPostOfPageFromDb(Page, MyApp){
    return new Promise(resolve => {
        let numberofitem = 2
        let cursor = Page * numberofitem
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponsePost = new Object()
        ReponsePost.Error = true
        ReponsePost.ErrorMsg = ""
        ReponsePost.Data = []

        const Query = {[MongoTracksCollection.Public]: true}
        const Projection = {projection:{[MongoTracksCollection.GpxData]: 0, [MongoTracksCollection.GeoJsonData]: 0, [MongoTracksCollection.Elevation]: 0, [MongoTracksCollection.Color]: 0, [MongoTracksCollection.Group]: 0, [MongoTracksCollection.ExteriorPoint]: 0, [MongoTracksCollection.StartPoint]: 0}}
        const Sort = {[MongoTracksCollection.Date]: -1}
        Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                ReponsePost.Error = false
                ReponsePost.ErrorMsg = null
                ReponsePost.Data = []
            } else {
                ReponsePost.Error = false
                ReponsePost.ErrorMsg = null
                ReponsePost.Data = reponse
            }
            resolve(ReponsePost)
        },(erreur)=>{
            ReponsePost.Error = true
            ReponsePost.ErrorMsg = "PromiseGetPostOfPageFromDb error: " + erreur
            ReponsePost.Data = []
            resolve(ReponsePost)
        })
    })
}

module.exports.CallRouteGetPageOfPost = CallRouteGetPageOfPost