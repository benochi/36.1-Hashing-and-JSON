const Router = require("express").Router;
const User = require("../models/user");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const router = new Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', async function getMessageDetail(req, res, next){
    const result = await Message.get(id)
    //make sure user is to or from user. 
    if(result.to_username != req.user.username || result.from_username != req.user.username){
        throw new ExpressError("Not authorized", 404);
    }
    return res.json(result.rows[0]);
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req,res,next){
    const {from_username, to_username, body} = req.body;
    const result = await Message.create(from_username, to_username, body) //models message.js
    const message = result.rows[0];
    return res.send({message});
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureCorrectUser, async function(req, res, next){
    const result = await Message.get(id)
    const {id, read_at} = result.rows[0]
    if(req.user.username != result.rows[0].to_username){
        throw new ExpressError("Not authorized to view message.", 404);
    }
    return res.json({message:{id, read_at}});
});


//export module
module.exports = router;