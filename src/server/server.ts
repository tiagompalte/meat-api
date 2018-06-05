import * as fs from 'fs'
import * as restify from 'restify'
import * as mongoose from 'mongoose'

import { environment } from '../common/environment'
import { Router } from '../common/router'
import { mergePatchBodyParser } from './merge-patch.parser'
import { handleError } from './error.handler'
import {tokenParser} from '../security/token.parser'

export class Server {

  app: restify.Server

  initializeDb(): mongoose.MongooseThenable {
    (<any>mongoose).Promise = global.Promise
    return mongoose.connect(environment.db.url, {
      useMongoClient: true
    })
  }

  initRoutes(routers: Router[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {

        const options: restify.ServerOptions = {
          name: 'meat-api',
          version: '1.0.0',
        }
        if(environment.security.enableHTTPS) {
          options.certificate = fs.readFileSync(process.env.CERT_FILE)
          options.key = fs.readFileSync(process.env.CERT_KEY)
        }

        this.app = restify.createServer(options)

        this.app.use(restify.plugins.queryParser())
        this.app.use(restify.plugins.bodyParser())
        this.app.use(mergePatchBodyParser)
        this.app.use(tokenParser)

        //routes
        for (let router of routers) {
          router.applyRoutes(this.app)
        }

        this.app.listen(environment.server.port, () => {
          resolve(this.app)
        })

        this.app.on('restifyError', handleError)
      }
      catch (error) {
        reject(error)
      }
    })
  }

  bootstrap(routers: Router[] = []): Promise<Server> {
    return this.initializeDb().then(() =>
      this.initRoutes(routers).then(() => this))
  }

  shutdown() {
    return mongoose.disconnect().then(() => this.app.close())
  }
}
