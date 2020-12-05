import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { Image } from '../dist'

const image = new Image({
    url: '/',
    sizes: {
        large: {
            width: 300,
            height: 300
        }
    },
    baseDir: path.join(process.cwd(), 'test/images')
})

describe('Image', () => {
    it('should resize an image', async () => {
        await image.resize('large', 'test-img.png')
        const newImage = path.join(process.cwd(), 'test/images/large/test-img.png')
        assert(fs.existsSync(newImage))
    })
})
