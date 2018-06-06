import * as restify from 'restify'
import { User } from './users.model'
import { NotFoundError, UnauthorizedError } from 'restify-errors'
import { ModelRouter } from '../common/model-router'
import {authenticate} from '../security/auth.handler'
import { authorize } from '../security/authz.handler'

class UsersRouter extends ModelRouter<User> {

  constructor() {
    super(User)
    this.on('beforeRender', document => {
      document.password = undefined
    })
  }

  findByEmail = (req, resp, next) => {
    if (req.query.email) {
      User.findByEmail(req.query.email)
        .then(user => user ? [user] : [])
        .then(this.renderAll(resp, next, {url: req.url}))
        .catch(next)
    }
    else {
      next()
    }
  }

  verifyUser = (req: restify.Request, resp, next) => {
    if(req.authenticated.hasAny('admin')) {
      return next()
    }
    else if(req.authenticated.hasAny('user')) {
      if(req.params.id === req.authenticated.id) {
        return next()
      }
    }
    return next(new UnauthorizedError())
  }

  applyRoutes(app: restify.Server) {
    app.get({ path: `${this.basePath}`, version: '2.0.0' }, [authorize('admin'), this.findByEmail, this.findAll])
    app.get({ path: `${this.basePath}`, version: '1.0.0' }, [authorize('admin'), this.findAll])
    app.get(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.findById])
    app.post(`${this.basePath}`, [authorize('admin'), this.save])
    app.put(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.verifyUser, this.replace])
    app.patch(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.verifyUser, this.update])
    app.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

    app.post(`${this.basePath}/authenticate`, authenticate)
  }
}

export const usersRouter = new UsersRouter()
