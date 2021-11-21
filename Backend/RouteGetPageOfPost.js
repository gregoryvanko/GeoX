function CallRouteGetPageOfPost(req, res, MyApp){
    let Page = req.params.page
    let Filter = null
    if (req.headers["x-filter"]){
        Filter = JSON.parse(req.headers["x-filter"])
    }
    GetPostOfPage(Page, Filter, res, MyApp)
}

async function GetPostOfPage (Page, Filter, res, MyApp){
    // Get Post of page
    let ReponsePostOfPageFromDb = await PromiseGetPostOfPageFromDb(parseInt(Page), Filter, MyApp)
    if(ReponsePostOfPageFromDb.Error){
        MyApp.LogAppliError(ReponsePostOfPageFromDb.ErrorMsg, "GetPageOfPost", "GetPageOfPost")
        res.status("500").json(ReponsePostOfPageFromDb)
    } else {
        res.status("200").json(ReponsePostOfPageFromDb)
    }
}

function PromiseGetPostOfPageFromDb(Page, Filter, MyApp){
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
        if (Filter != null){
            if ((Filter.DistanceMin != 1) || (Filter.DistanceMax != 200)){
                Query = {
                    $and:[
                        {[MongoTracksCollection.Public]: true},
                        {[MongoTracksCollection.Length]:{$gte: Filter.DistanceMin}},
                        {[MongoTracksCollection.Length]:{$lte: Filter.DistanceMax}}
                    ]}
            }
        }
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