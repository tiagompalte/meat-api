import 'jest'
import * as request from 'supertest'
import {Server} from '../server/server'
import {environment} from '../common/environment'
import {usersRouter} from './users.router'
import {User} from './users.model'
import { response } from 'spdy';

const address: string = (<any> global).address
const auth: string = (<any> global).auth

test('get /users - v1.0.0', () => {
  return request(address)
    .get('/users')
    .set('Accept-version', '1.0.0')
    .set("Authorization", auth)
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body.items).toBeInstanceOf(Array)
    })
    .catch(fail)
})

test('post /users', () => {
  return request(address)
    .post('/users')
    .set("Authorization", auth)
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
    .set("Authorization", auth)
    .then(response => {
      expect(response.status).toBe(404)
    })
    .catch(fail)
})

test('put /users:id', () => {
  return request(address)
    .post('/users')
    .set("Authorization", auth)
    .send({
      name: 'usuario_put',
      email: 'usuario_put@email.com',
      password: '123456'
    })
    .then(response =>
      request(address)
        .put(`/users/${response.body._id}`)
        .set("Authorization", auth)
        .send({
          name: 'usuario_put2',
          email: 'usuario_put@email.com',
          password: 'alterado'
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
    .set("Authorization", auth)
    .send({
      name: 'usuario_patch',
      email: 'usuario_patch@email.com',
      password: '123456'
    })
    .then(response =>
      request(address)
        .patch(`/users/${response.body._id}`)
        .set("Authorization", auth)
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
    .set("Authorization", auth)
    .send({
      name: 'usuario_delete',
      email: 'usuario_delete@email.com',
      password: '123456'
    })
    .then(response =>
      request(address)
        .delete(`/users/${response.body._id}`)
        .set("Authorization", auth)
    )
    .then(response => {
      expect(response.status).toBe(404)
    })
    .catch(fail)
})

test('authenticate /users/authenticate', () => {
  return request(address)
    .post('/users')
    .set("Authorization", auth)
    .send({
      name: 'usuario_auth',
      email: 'usuario_auth@email.com',
      password: 'usuario_auth'
    })
    .then(response =>
      request(address)
        .post('/users/authenticate')
        .send({
            email: 'usuario_auth@email.com',
            password: 'usuario_auth'
        })
    )
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('usuario_auth')
      expect(response.body.email).toBe('usuario_auth@email.com')
      expect(response.body.accessToken).toBeDefined()
    })
    .catch(fail)
})

test('authenticate /users/authenticate --wrong password', () => {
  return request(address)
    .post('/users')
    .set("Authorization", auth)
    .send({
      name: 'usuario_auth2',
      email: 'usuario_auth2@email.com',
      password: 'usuario_auth'
    })
    .then(response =>
      request(address)
        .post('/users/authenticate')
        .send({
            email: 'usuario_auth2@email.com',
            password: 'auth'
        })
    )
    .then(response => {
      expect(response.status).toBe(403)
    })
    .catch(fail)
})

test('authenticate /users/authenticate --wrong email', () => {
  return request(address)
    .post('/users')
    .set("Authorization", auth)
    .send({
      name: 'usuario_auth3',
      email: 'usuario_auth3@email.com',
      password: 'usuario_auth'
    })
    .then(response =>
      request(address)
        .post('/users/authenticate')
        .send({
            email: 'usuario_wrong_email@email.com',
            password: 'usuario_auth'
        })
    )
    .then(response => {
      expect(response.status).toBe(403)
    })
    .catch(fail)
})
