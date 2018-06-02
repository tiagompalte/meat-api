import * as restify from 'restify'
import {Router} from '../common/router'
import {User} from './users.model'

class UsersRouter extends Router {

    constructor() {
        super()
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    applyRoutes(app: restify.Server) {
        app.get('/users', (req, resp, next) => {
            User.find().then(this.render(resp,next))
        })

        app.get('/users/:id', (req, resp, next) => {
            User.findById(req.params.id).then(this.render(resp,next))
        })

        app.post('/users', (req, resp, next) => {
            let user = new User(req.body)            
            user.save().then(this.render(resp,next))
        })

        app.put('/users/:id', (req, resp, next) => {
            const options = {overwrite: true}
            User.update({_id: req.params.id}, req.body, options)
                .exec().then(result => {
                    if(result.n) {
                        return User.findById(req.params.id)
                    }
                    else {
                        resp.send(404)
                    }
                }).then(this.render(resp,next))
        })

        app.patch('/users/:id', (req, resp, next) => {
            const options = {new: true}
            User.findByIdAndUpdate(req.params.id, req.body, options).then(this.render(resp,next))
        })

        app.del('/users/:id', (req, resp, next) => {
            User.remove({_id:req.params.id}).exec().then((cmdResult:any) => {
                if(cmdResult.result.n) {
                    resp.send(204)
                }
                else {
                    resp.send(404)
                }
                return next()
            })
        })
    }
}

export const usersRouter = new UsersRouter()