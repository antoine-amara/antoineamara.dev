/* eslint-disable */
const getBlogPostsModule = require('../get-blog-posts');
const { blogposts } = require('./dumb/get-blog-posts.dumb')

describe('GCP Function: get my last blog posts from dev.to', () => {
  describe('getLastBlogArticles', () => {
    // let requestBlogArticlesMock = null;

    beforeEach(() => {
      getBlogPostsModule.requestBlogArticles = jest.fn(() => Promise.resolve(blogposts));
    });

    afterEach(() => {
      getBlogPostsModule.requestBlogArticles.mockRestore()
    })

    test('it should be defined', () => expect(getBlogPostsModule.getLastBlogArticles).toBeDefined())
    test('it should be a function', () => expect(typeof getBlogPostsModule.getLastBlogArticles).toBe('function'))
    test('it should call requestBlogArticles to make the HTTPS request to dev.to api', () => {
      return getBlogPostsModule.getLastBlogArticles()
        .then(_ =>
          expect(getBlogPostsModule.requestBlogArticles).toHaveBeenCalled()
        )
    })
    test('it should return 10 elememts / articles', () => {
      return getBlogPostsModule.getLastBlogArticles()
      .then(blogPosts =>
        expect(blogPosts.length).toEqual(10)
      )
    })
    test('it should return only usefull info (title, publish date, url, tag list)', () => {
      return getBlogPostsModule.getLastBlogArticles()
      .then(blogPosts => {
        blogPosts.forEach(post => {
          expect(post).toHaveProperty('title')
          expect(post).toHaveProperty('publishDate')
          expect(post).toHaveProperty('url')
          expect(post).toHaveProperty('tagList')
        })
      }
      )
    })
  })
  describe('getBlogPost', () => {
    let jsonSendMock = null;

    beforeEach(() => {
      process.env = Object.assign({}, process.env, { AUTHORIZED_ORIGINS: 'https://antoineamara.dev' })
      jsonSendMock = jest.fn()
    })
    afterEach(() => {
      jsonSendMock.mockRestore()
    })

    test('it should be defined', () => expect(getBlogPostsModule.getBlogPost).toBeDefined())
    test('it should be a function', () => expect(typeof getBlogPostsModule.getBlogPost).toBe('function'))
    test('it should check authorized origins and return 403 error if the origin is not allowed', () => {
      const fakeReq = {
        origin: 'https://hackerman.com',
        get: jest.fn(() => 'https://hackerman.com'),
        body: {}
      }

      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      getBlogPostsModule.getBlogPost(fakeReq, fakeRes)
      
      expect(fakeRes.status).toHaveBeenCalledWith(403)
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'bad origin' }))
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'you\'re not authorized to use this service.' }))
    })
    test('it should return a 500 error if it failed to retrieve the blog posts', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: {}
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      getBlogPostsModule.getLastBlogArticles = jest.fn(() => Promise.reject('cannot retrieve the blog posts.'))

      return  getBlogPostsModule.getBlogPost(fakeReq, fakeRes)
        .then(_ => {
          expect(fakeRes.status).toHaveBeenCalledWith(500)
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'request fail' }))
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'cannot retrieve the blog posts.' }))
        })
    })
    test('it should return a 200 response if it sucess to retrieve the blog posts', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: {}
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      getBlogPostsModule.getLastBlogArticles = jest.fn(() => Promise.resolve(blogposts.slice(10)))

      return  getBlogPostsModule.getBlogPost(fakeReq, fakeRes)
        .then(_ => {
          expect(fakeRes.status).toHaveBeenCalledWith(200)
          expect(fakeRes.status().json).toHaveBeenCalledWith(blogposts.slice(10))
        })
    })
  })
})
