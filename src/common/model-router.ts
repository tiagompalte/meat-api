import { Router } from './router'
import * as mongoose from 'mongoose'
import { NotFoundError } from 'restify-errors'

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

  basePath: string

  constructor(protected model: mongoose.Model<D>) {
    super()
    this.basePath = `/${model.collection.name}`
  }

  protected prepareOne(query: mongoose.DocumentQuery<D, D>): mongoose.DocumentQuery<D, D> {
    return query
  }

  envelope(document: any): any {
    let resource = Object.assign({ _links: {} }, document.toJSON())
    resource._links.self = `${this.basePath}/${resource._id}`
    return resource
  }

  envelopeAll(documents: any[], options: any = {}): any {
    const resource: any = {
      _links: {
        self: `${options.url}`
      },
      items: documents
    }

    if (options.page && options.count && options.pageSize) {
      if (options.page > 1) {
        resource._links.previous = `${this.basePath}?_page=${options.page - 1}&_pageSize=${options.pageSize}`
      }
      const remaining = options.count - (options.page * options.pageSize)
      if (remaining > 0) {
        resource._links.next = `${this.basePath}?_page=${options.page + 1}&_pageSize=${options.pageSize}`
      }
    }

    return resource
  }

  validateId = (req, resp, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      next(new NotFoundError('Document not found'))
    }
    else {
      next()
    }
  }

  findAll = (req, resp, next) => {
    let limit = parseInt(req.query._pageSize || 4)
    let page = parseInt(req.query._page || 1)
    page = page > 0 ? page : 1

    const skip = (page - 1) * limit

    this.model.count({})
      .exec()
      .then(count => {
        this.model.find()
          .skip(skip)
          .limit(limit)
          .then(this.renderAll(resp, next, {
            page, count, pageSize: limit, url: req.url
          }))
          .catch(next)
      })
      .catch(next)
  }

  findById = (req, resp, next) => {
    this.prepareOne(this.model.findById(req.params.id))
      .then(this.render(resp, next))
      .catch(next)
  }

  save = (req, resp, next) => {
    let document = new this.model(req.body)
    document.save()
      .then(this.render(resp, next))
      .catch(next)
  }

  replace = (req, resp, next) => {
    const options = { runValidators: true, overwrite: true }
    this.model.update({ _id: req.params.id }, req.body, options)
      .exec().then(result => {
        if (result.n) {
          return this.model.findById(req.params.id)
        }
        else {
          throw new NotFoundError('Documento não encontrado')
        }
      })
      .then(this.render(resp, next))
      .catch(next)
  }

  update = (req, resp, next) => {
    const options = { runValidators: true, new: true }
    this.model.findByIdAndUpdate(req.params.id, req.body, options)
      .then(this.render(resp, next))
      .catch(next)
  }

  delete = (req, resp, next) => {
    this.model.remove({ _id: req.params.id }).exec()
      .then((cmdResult: any) => {
        if (cmdResult.result.n) {
          resp.send(204)
        }
        else {
          throw new NotFoundError('Documento não encontrado')
        }
        return next()
      })
      .catch(next)
  }
}
