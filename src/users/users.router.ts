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

    applyRoutes(app: restify.Server) {
        app.get('/users', this.findAll)
        app.get('/users/:id', [this.validateId, this.findById])
        app.post('/users', this.save)
        app.put('/users/:id', [this.validateId, this.replace])
        app.patch('/users/:id', [this.validateId, this.update])
        app.del('/users/:id', [this.validateId, this.delete])
    }
}

export const usersRouter = new UsersRouter()