import * as restify from 'restify'
import {User} from './users.model'
import { NotFoundError } from 'restify-errors';
import {ModelRouter} from '../common/model-router'

class UsersRouter extends ModelRouter<User> {

    constructor() {
        super(User)
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    findByEmail = (req, resp, next) => {
        if(req.query.email) {
            User.findByEmail(req.query.email)
                .then(user => user ? [user] : [])
                .then(this.renderAll(resp, next))
                .catch(next)
        }
        else {
            next()
        }
    }

    applyRoutes(app: restify.Server) {
        app.get({path:`${this.basePath}`, version: '2.0.0'}, [this.findByEmail, this.findAll])
        app.get({path:`${this.basePath}`, version: '1.0.0'}, this.findAll)
        app.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        app.post(`${this.basePath}`, this.save)
        app.put(`${this.basePath}/:id`, [this.validateId, this.replace])
        app.patch(`${this.basePath}/:id`, [this.validateId, this.update])
        app.del(`${this.basePath}/:id`, [this.validateId, this.delete])
    }
}

export const usersRouter = new UsersRouter()