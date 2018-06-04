import { Router } from './common/router'
import * as restify from 'restify'

class MainRouter extends Router {
  applyRoutes(app: restify.Server) {
    app.get('/', (req, resp, next) => {
      resp.json({
        users: '/users',
        restaurants: '/restaurants',
        reviews: '/reviews'
      })
    })
  }
}

export const mainRouter = new MainRouter()
