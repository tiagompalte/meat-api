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

    /*findById = (req, resp, next) => {
        this.model.findById(req.params.id)
            .populate('user', 'name')
            .populate('restaurant')
            .then(this.render(resp,next))
            .catch(next)
    }*/

    applyRoutes(app: restify.Server) {
        app.get('/reviews', this.findAll)
        app.get('/reviews/:id', [this.validateId, this.findById])
        app.post('/reviews', this.save)
    }
}

export const reviewsRouter = new ReviewRouter()