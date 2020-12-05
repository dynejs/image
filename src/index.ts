import fs = require('fs')
import path = require('path')
import sharp = require('sharp')
import isImage = require('is-image')
import { pathToRegexp } from 'path-to-regexp'

sharp.concurrency(2)
sharp.cache(false)

export interface IImageDimensions {
    width?: number
    height?: number
    fit?: 'cover' | 'container' | 'fill' | 'inside' | 'outside'
}

export interface ImageOpts {
    sizes: { [key: string]: IImageDimensions }
    url: string
    baseDir: string
}

export class Image {

    opts: ImageOpts
    regexp: any
    segments: any

    constructor(opts: ImageOpts) {
        this.opts = opts
        this.segments = []
        this.regexp = pathToRegexp(this.opts.url, this.segments)
    }

    async resize(key: string, filename: string): Promise<string> {
        const dimensions = this.opts.sizes[key]

        if (!dimensions) {
            throw new Error(`Image size not found: ${key}`)
        }

        if (!dimensions.fit) {
            dimensions.fit = 'inside'
        }

        const baseDir = this.opts.baseDir
        const requestPath = path.join(baseDir, key)
        const requestedFile = path.join(requestPath, filename)
        const mainFile = path.join(baseDir, filename)
        const existsMain = fs.existsSync(mainFile)

        // No such files at all
        if (!existsMain || !isImage(mainFile)) {
            return null
        }

        const original = fs.readFileSync(mainFile)

        // Main file exists, but not the resized one, we make a resize
        if (!fs.existsSync(requestPath)) {
            fs.mkdirSync(requestPath)
        }

        const buffer = await sharp(original)
            .resize(dimensions)
            .toBuffer()

        fs.writeFileSync(requestedFile, buffer)

        return requestedFile
    }

    middleware() {
        return async (req, res, next) => {
            const match = this.regexp.exec(req.path)
            if (!match || !Array.isArray(match)) {
                return next()
            }
            const size = match[1]
            const name = match[2]
            if (!name || !size) {
                throw new Error(`Error parsing image url segments, got: ${size}, ${name}`)
            }
            const filePath = await this.resize(size, name)
            if (!filePath) {
                return next()
            }
            res.sendFile(path.join(process.cwd(), filePath))
        }
    }
}
