import fs = require('fs')
import path = require('path')
import sharp = require('sharp')
import isImage = require('is-image')
import { Config, Injectable } from '@dynejs/core'

sharp.concurrency(2)
sharp.cache(false)

export interface IImageDimensions {
    width?: number
    height?: number
    fit?: 'cover' | 'container' | 'fill' | 'inside' | 'outside'
}

@Injectable()
export class Resizer {

    enabledSizes: Set<string>

    constructor(config: Config) {
        const imageSizes = config.get('imageSizes')

        this.enabledSizes = new Set()

        if (imageSizes) {
            Object.keys(imageSizes).map(key => {
                const size: IImageDimensions = imageSizes[key]
                this.enabledSizes.add((size.width || '') + 'x' + (size.height || ''))
            })
        }
    }

    async resizeOne(baseDir: string, key: string, filename: string): Promise<string> {
        const enabledSize = this.enabledSizes.has(key)

        const [width, height] = key.split('x').map(v => v ? Number(v) : null)
        const dimensions = {width, height}

        const requestPath = path.join(baseDir, key)
        const requestedFile = path.join(requestPath, filename)
        const mainFile = path.join(baseDir, filename)
        const existsMain = fs.existsSync(mainFile)

        // No such files at all
        if (!existsMain || !isImage(mainFile)) {
            return null
        }

        // This is size not enabled, return original
        if (!enabledSize) {
            return mainFile
        }

        const original = fs.readFileSync(mainFile)

        // Main file exists, but not the resized one, we make a resize
        if (!fs.existsSync(requestPath)) {
            fs.mkdirSync(requestPath)
        }

        const buffer = await sharp(original)
            .resize(dimensions)
            // .withoutEnlargement()
            .toBuffer()

        fs.writeFileSync(requestedFile, buffer)

        return requestedFile
    }
}
