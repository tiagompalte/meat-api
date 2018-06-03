import * as mongoose from 'mongoose'
import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'
import {ModelRouter} from '../common/model-router'
import {Review} from './reviews.model'

class ReviewRouter extends ModelRouter<Review> {
    constructor() {
        super(Review)
    }

    protected prepareOne(query: mongoose.DocumentQuery<Review,Review>) :mongoose.DocumentQuery<Review,Review> {
        return query.populate('user', 'name')
                    .populate('restaurant')
    }

    envelope(document) {
        let resource = super.envelope(document)
        const restId = document.restaurant._id ? document.restaurant._id : document.restaurant
        resource._links.restaurant = `/restaurants/${restId}`
        return resource
    }

    /*findById = (req, resp, next) => {
        this.model.findById(req.params.id)
            .populate('user', 'name')
            .populate('restaurant')
            .then(this.render(resp,next))
            .catch(next)
    }*/

    applyRoutes(app: restify.Server) {
        app.get(`${this.basePath}`, this.findAll)
        app.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        app.post(`${this.basePath}`, this.save)
    }
}

export const reviewsRouter = new ReviewRouter()