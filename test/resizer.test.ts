import chakram = require('chakram')
import assert = require('assert')
import fs = require('fs')
import { app } from '@dynejs/core'
import { ImageModule } from '../src/module'

const testFolder = process.cwd() + '/test'

describe('Image', () => {
    before(() => {
        app([
            ImageModule
        ], process.cwd() + '/test').start()
    })

    it('should resize images based on url', async () => {
        const res = await chakram.get('http://localhost:3000/storage/50x200/test-img.png')
        assert(res.response.headers['content-type'] === 'image/png')
        assert(res.response.statusCode === 200)
        assert(fs.existsSync(testFolder + '/images/50x200/test-img.png') === true)
    })

    it('should give back original if file presented but no defined size', async () => {
        const res = await chakram.get('http://localhost:3000/storage/1000x1000/test-img.png')
        assert(res.response.headers['content-type'] === 'image/png')
        assert(res.response.statusCode === 200)
        assert(fs.existsSync(testFolder + '/images/1000x1000/test-img.png') === false)
    })
})
