import * as restify from 'restify'
import * as mongoose from 'mongoose'

import {environment} from '../common/environment'
import {Router} from '../common/router'
import {mergePatchBodyParser} from './merge-patch.parser'

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

                this.app = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                })

                this.app.use(restify.plugins.queryParser())
                this.app.use(restify.plugins.bodyParser())
                this.app.use(mergePatchBodyParser)

                //routes
                for (let router of routers) {
                    router.applyRoutes(this.app)                    
                }

                this.app.listen(environment.server.port, () => {
                    resolve(this.app)
                })
            }
            catch(error) {
                reject(error)
            }
        })
    }

    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.initializeDb().then(() => 
            this.initRoutes(routers).then(() => this))        
    }
}