function CallRouteGetDataOfPost(req, res, MyApp){
    let Post = req.params.post
    GetDataOfPost(Post, res, MyApp)
}

async function GetDataOfPost (Post, res, MyApp){
    // Get Post data
    let ReponseDataOfPostFromDb = await PromiseGetDataOfPostFromDb(Post, MyApp)
    if(ReponseDataOfPostFromDb.Error){
        MyApp.LogAppliError(ReponseDataOfPostFromDb.ErrorMsg, "GetDataOfPost", "GetDataOfPost")
        res.status("500").json(ReponseDataOfPostFromDb)
    } else {
        res.status("200").json(ReponseDataOfPostFromDb)
    }
}

function PromiseGetDataOfPostFromDb(Post, MyApp){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection
        let MongoObjectId = require('@gregvanko/corex').MongoObjectId

        let ReponsePost = new Object()
        ReponsePost.Error = true
        ReponsePost.ErrorMsg = ""
        ReponsePost.Data = []

        const Query = {'_id': new MongoObjectId(Post)}
        const Projection = { projection:{[MongoTracksCollection.GpxData]: 0, [MongoTracksCollection.Color]: 0, [MongoTracksCollection.Group]: 0, [MongoTracksCollection.Owner]: 0, [MongoTracksCollection.Owner]: 0}}
        const Sort = {[MongoTracksCollection.Image]: -1}
        Mongo.FindSortPromise(Query, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                ReponsePost.Error = false
                ReponsePost.ErrorMsg = null
                ReponsePost.Data = []
            } else {
                ReponsePost.Error = false
                ReponsePost.ErrorMsg = null
                ReponsePost.Data = reponse[0]
            }
            resolve(ReponsePost)
        },(erreur)=>{
            ReponsePost.Error = true
            ReponsePost.ErrorMsg = "PromiseGetDataOfPostFromDb error: " + erreur
            ReponsePost.Data = []
            resolve(ReponsePost)
        })
    })
}

module.exports.CallRouteGetDataOfPost = CallRouteGetDataOfPost