import 'jest'
import * as request from 'supertest'
import {Server} from '../server/server'
import {environment} from '../common/environment'
import {usersRouter} from './users.router'
import {User} from './users.model'

let address: string = (<any> global).address

test('get /users - v1.0.0', () => {
  return request(address)
    .get('/users')
    .set('Accept-version', '1.0.0')
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body.items).toBeInstanceOf(Array)
    })
    .catch(fail)
})

test('post /users', () => {
  return request(address)
    .post('/users')
    .send({
      name: 'usuario_post',
      email: 'usuario_post@email.com',
      password: '123456',
      cpf: '110.975.010-27'
    })
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body._id).toBeDefined()
      expect(response.body.name).toBe('usuario_post')
      expect(response.body.email).toBe('usuario_post@email.com')
      expect(response.body.cpf).toBe('110.975.010-27')
      expect(response.body.password).toBeUndefined()
    })
    .catch(fail)
})

test('get /users/aaaa - not found', () => {
  return request(address)
    .get('/users/aaaa')
    .then(response => {
      expect(response.status).toBe(404)
    })
    .catch(fail)
})

test('put /users:id', () => {
  return request(address)
    .post('/users')
    .send({
      name: 'usuario_put',
      email: 'usuario_put@email.com',
      password: '123456'
    })
    .then(response =>
      request(address)
        .patch(`/users/${response.body._id}`)
        .send({
          name: 'usuario_put2',
          email: 'usuario_put@email.com',
        })
    )
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body._id).toBeDefined()
      expect(response.body.name).toBe('usuario_put2')
      expect(response.body.email).toBe('usuario_put@email.com')
      expect(response.body.password).toBeUndefined()
    })
    .catch(fail)
})

test('patch /users:id', () => {
  return request(address)
    .post('/users')
    .send({
      name: 'usuario_patch',
      email: 'usuario_patch@email.com',
      password: '123456'
    })
    .then(response =>
      request(address)
        .patch(`/users/${response.body._id}`)
        .send({
          name: 'usuario_patch2'
        })
    )
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body._id).toBeDefined()
      expect(response.body.name).toBe('usuario_patch2')
      expect(response.body.email).toBe('usuario_patch@email.com')
      expect(response.body.password).toBeUndefined()
    })
    .catch(fail)
})

test('delete /users:id', () => {
  return request(address)
    .delete('/users')
    .send({
      name: 'usuario_delete',
      email: 'usuario_delete@email.com',
      password: '123456'
    })
    .then(response =>
      request(address)
        .delete(`/users/${response.body._id}`)
    )
    .then(response => {
      expect(response.status).toBe(404)
    })
    .catch(fail)
})
