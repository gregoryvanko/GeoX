function CallRouteGetPageOfPost(req, res, MyApp){
    let Page = req.params.page
    GetPostOfPage(Page, res, MyApp)
}

async function GetPostOfPage (Page, res, MyApp){
    // Get Post of page
    let ReponsePostOfPageFromDb = await PromiseGetPostOfPageFromDb(parseInt(Page), MyApp)
    if(ReponsePostOfPageFromDb.Error){
        MyApp.LogAppliError(ReponsePostOfPageFromDb.ErrorMsg, "RouteGetPageOfPost", "RouteGetPageOfPost")
        res.status("500").json(ReponsePostOfPageFromDb)
    } else {
        res.status("200").json(ReponsePostOfPageFromDb)
    }
}

function PromiseGetPostOfPageFromDb(Page, MyApp){
    return new Promise(resolve => {
        let numberofitem = 5
        let cursor = Page * numberofitem
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponsePost = new Object()
        ReponsePost.Error = true
        ReponsePost.ErrorMsg = ""
        ReponsePost.Data = []

        let Query = {[MongoTracksCollection.Public]: true}
        const Projection = {projection:{[MongoTracksCollection.Name]: 1, [MongoTracksCollection.Date]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.Description]: 1, [MongoTracksCollection.InfoElevation]: 1, [MongoTracksCollection.Image]: 1, [MongoTracksCollection.StartPoint]: 1}}
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