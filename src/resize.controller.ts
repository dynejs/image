import { Config, Get, Injectable, Request, Response } from '@dynejs/core'
import { Resizer } from './resizer'

@Injectable()
export class ResizeController {

    private resizer: Resizer

    private config: Config

    constructor(resizer: Resizer, config: Config) {
        this.resizer = resizer
        this.config = config
    }

    @Get('/storage/:size/:name')
    async serve(req: Request, res: Response, next) {
        const filePath = await this.resizer.resizeOne(this.config.get('storagePath'), req.params.size, req.params.name)

        if (!filePath) {
            return next()
        }

        res.sendFile(filePath)
    }
}
