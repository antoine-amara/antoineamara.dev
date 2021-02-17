/* eslint-disable */

const nodeMailer = require('nodemailer')
const contactFunctionModule = require('../contact-form')

describe('GCP function: contact form submission', () => {
  describe('sendContactMail', () => {
    let fakeTransporter = null
    beforeEach(() => {
      fakeTransporter = {
        sendMail: jest.fn((data) => Promise.resolve('successfully send the email'))
      }
      nodeMailer.createTransport = jest.fn(() => fakeTransporter)
    })
    afterEach(() => {
      nodeMailer.createTransport.mockRestore()
    })

    test('it should be defined', () => expect(contactFunctionModule.sendContactMail).toBeDefined())
    test('it should be a function', () => expect(typeof contactFunctionModule.sendContactMail).toBe('function'))
    test('it should throw an error if one of the required contact fields is undefined', () => {
      expect(() => contactFunctionModule.sendContactMail({ name: undefined, email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' })).toThrow()
      expect(() => contactFunctionModule.sendContactMail({ email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: undefined })).toThrow()
      expect(() => contactFunctionModule.sendContactMail({ email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: undefined })).toThrow()
      expect(() => contactFunctionModule.sendContactMail({ email: undefined, subject: 'cours de cuisine', message: 'Hello there !' })).toThrow()
      expect(() => contactFunctionModule.sendContactMail({ name: 'ObiWan Kenobi', email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' })).not.toThrow()
    })
    test('it should throw an error if the transport cannot send a mail', () => {
      fakeTransporter = {
        sendMail: jest.fn((data) => Promise.reject('cannot send an email'))
      }

      return contactFunctionModule.sendContactMail({ name: 'ObiWan Kenobi', email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' })
        .then(res => {
          throw new Error('test don\'t have to resolve here, if this error appear, it mean the system success to send a mail but it have to fail')
        })
        .catch(err => {
          expect(err).toBeTruthy()
          expect(err).toEqual('cannot send an email')
        })
    })
    test('it should create a transport and send a mail', () => {
      
      return contactFunctionModule.sendContactMail({ name: 'ObiWan Kenobi', email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' })
        .then(_res => {
          expect(nodeMailer.createTransport).toHaveBeenCalled()
          expect(fakeTransporter.sendMail).toHaveBeenCalled()
        })
    })
  })

  describe('submitContactForm middleware', () => {
    let jsonSendMock = null;

    beforeEach(() => {
      process.env = Object.assign({}, process.env, { AUTHORIZED_ORIGINS: 'https://antoineamara.dev' })
      jsonSendMock = jest.fn()
    })
    afterEach(() => {
      jsonSendMock.mockRestore()
    })

    test('it should be defined', () => expect(contactFunctionModule.submitContactForm).toBeDefined())
    test('it should be a function', () => expect(typeof contactFunctionModule.submitContactForm).toBe('function'))
    test('it should check authorized origins and return 403 error if the origin is not allowed', () => {
      const fakeReq = {
        origin: 'https://hackerman.com',
        get: jest.fn(() => 'https://hackerman.com'),
        body: { email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' }
      }

      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      contactFunctionModule.sendContactMail = jest.fn(() => Promise.resolve('successfully send the email'))
      contactFunctionModule.submitContactForm(fakeReq, fakeRes)
      
      expect(fakeRes.status).toHaveBeenCalledWith(403)
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'bad origin' }))
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'you\'re not authorized to use this service.' }))
    })
    test('it should send a 400 error if one required field is missing', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: { email: undefined, subject: 'cours de cuisine', message: 'Hello there !' }
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }
      contactFunctionModule.submitContactForm(fakeReq, fakeRes)

      expect(fakeRes.status).toHaveBeenCalledWith(400)
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'missing required field' }))
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'missing field, you have to provide and email, a subject and a message.' }))
    })
    test('it should send a 500 error if the system failed to send a mail', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: { name: 'ObiWan Kenobi', email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' }
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      contactFunctionModule.sendContactMail = jest.fn(() => Promise.reject('cannot send an email'))

      return contactFunctionModule.submitContactForm(fakeReq, fakeRes)
        .then(_ => {
          expect(fakeRes.status).toHaveBeenCalledWith(500)
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'sending mail fail' }))
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'an error occured, cannot send your message. please retry later.' }))
        })
    })
    test('it should send a 200 response if the mail was successfully sended', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: { name: 'ObiWan Kenobi', email: 'obiwan.kenobi@jeditemple.force', subject: 'cours de cuisine', message: 'Hello there !' }
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      contactFunctionModule.sendContactMail = jest.fn(() => Promise.resolve('successfully send the email'))

      return  contactFunctionModule.submitContactForm(fakeReq, fakeRes)
        .then(_ => {
          expect(fakeRes.status).toHaveBeenCalledWith(200)
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ successMessage: 'message successfully send, I will respond as soon as possible.' }))
        })
    })
  })
})
