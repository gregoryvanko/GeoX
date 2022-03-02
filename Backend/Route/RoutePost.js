const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelTracks = require("../MongooseModel/Model_Tracks")
const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetPostOfPage = require("./HelperPost").GetPostOfPage
const GetMarkerOfPage = require("./HelperPost").GetMarkerOfPage
const AddPostPromise = require("./HelperPost").AddPostPromise

//Get liste of x post based on page number and used in public mode (no auth)
router.get("/public/:page", (req, res) => {
    let Parametres = {Page : req.params.page, ViewPost: true}
    GetPostOfPage(Parametres, res)
})

// Get liste of x post based on page number
router.get("/", AuthBasic, (req, res) => {
    let Parametres = {Page : req.query.Page, Filter: JSON.parse(req.query.Filter), AllPublicPost: JSON.parse(req.query.AllPublicPost), ViewPost: JSON.parse(req.query.ViewPost)}
    GetPostOfPage(Parametres, res, req.user)
})

// Get liste of x marker based on page number
router.get("/marker", AuthBasic, (req, res) => {
    let Parametres = {Page : req.query.Page, Filter: JSON.parse(req.query.Filter), AllPublicPost: JSON.parse(req.query.AllPublicPost)}
    GetMarkerOfPage(Parametres, res, req.user)
})

// Get One post data
router.get("/onepost/:id", AuthBasic, (req, res) => {
    let Id = req.params.id
    LogInfo(`Route /post/onepost GET: ${JSON.stringify(Id)}`, req.user)

    const Projection = { GpxData: 0}
    ModelTracks.findById(Id, Projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`Get one post db error: ${err}`, req.user)
        } else {
            if (result != null){
                res.status(200).send(result) 
            } else {
                let errormsg = "Track Id not found"
                res.status(500).send(errormsg)
                LogError(`Get one post error: ${errormsg}`, req.user)
            }
        }
    })
})

// Delete one post
router.delete("/:postid", AuthBasic, (req, res) => {
    let Parametres = {PostId : req.params.postid}
    LogInfo(`Route /post DELETE: ${Parametres.PostId}`, req.user)

    ModelTracks.findByIdAndDelete(Parametres.PostId, (err, result)=>{
        if (err) {
            res.status(500).send(err)
            LogError(`DeletePost db eroor: ${err}`, req.user)
        } else {
            res.status(200).send("OK")
            LogInfo(`Postid ${Parametres.PostId} is deleted`, req.user)
        }
    })
})

// Add one post
router.post("/", AuthBasic, async (req, res) => {
    const TrackPost = req.body
    if (JSON.stringify(TrackPost) != "{}"){
        let ReponseAddPost = await AddPostPromise(TrackPost, req.user.User)
        if(ReponseAddPost.Error){
            res.status("500").send(ReponseAddPost.ErrorMsg)
            LogError(ReponseAddPost.ErrorMsg, req.user)
        } else {
            res.status(200).send("OK")
            if (TrackPost.Id != null){
                LogInfo("Track of one post updated", req.user)
            } else {
                LogInfo("New Post saved", req.user)
            }
        }
    } else {
        const TheError = `Route /post POST error: Data not found in req`
        res.status(500).send(TheError)
        LogError(TheError, req.user)
    }
})

// Copy one post to a new post of the user
router.post("/copypost", AuthBasic, (req, res) => {
    const CopyTrackData = req.body
    if (JSON.stringify(CopyTrackData) != "{}"){
        LogInfo(`Route /post/copypost POST: ${JSON.stringify(CopyTrackData)}`, req.user)
        const Projection = {_id: 0}
        ModelTracks.findById(CopyTrackData.TrackId, Projection, (err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`Route /post/copypost POST db error: ${err}`, req.user)
            } else {
                if (result != null){
                    // Copy de la track
                    let TrackData = JSON.parse(JSON.stringify(result))
                    // Modification de la track
                    TrackData.Name = CopyTrackData.Name
                    TrackData.Group = CopyTrackData.Group
                    TrackData.Public = CopyTrackData.Public
                    TrackData.Description = CopyTrackData.Description
                    TrackData.Color = "#0000FF"
                    TrackData.Date = new Date()
                    TrackData.Owner = req.user.User

                    const NewTrack = new ModelTracks(TrackData)
                    NewTrack.save((err, result) => {
                        if (err) {
                            res.status(500).send(err)
                            LogError(`copypost db error: ${err}`, req.user)
                        } else {
                            res.status(200).send("Ok")
                        }
                    })

                } else {
                    let errormsg = "Track Id not found"
                    res.status(500).send(errormsg)
                    LogError(`Route /post/copypost POST error: ${errormsg}`, req.user)
                }
            }
        })
    } else {
        const TheError = `Route /post/copypost POST error: Data not found in req`
        LogError(TheError, req.user)
        res.status(500).send(TheError)
    }
})

// Modify one Post by id
router.patch("/", AuthBasic, (req, res) => {
    const TrackData = req.body
    if (JSON.stringify(TrackData) != "{}"){
        LogInfo(`Route /post PATCH: ${JSON.stringify(TrackData)}`, req.user)

        let DataToDb = new Object()
        if(TrackData.Name){DataToDb.Name= TrackData.Name}
        if(TrackData.Group){DataToDb.Group= TrackData.Group}
        if(TrackData.Public != undefined){DataToDb.Public= TrackData.Public}
        if(TrackData.Color){DataToDb.Color= TrackData.Color}
        if(TrackData.Description){DataToDb.Description= TrackData.Description}
        ModelTracks.findByIdAndUpdate(TrackData.Id, DataToDb, (err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`Route /post PATCH db error: ${err}`, req.user)
            } else {
                res.status(200).send("OK")
            }
        })

    } else {
        const TheError = `Route /post PATCH error: Data not found in req`
        res.status(500).send(TheError)
        LogError(TheError, req.user)
    }
})


module.exports = router