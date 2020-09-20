import { Module } from '@dynejs/core'
import { Resizer } from './resizer'
import { ResizeController } from './resize.controller'

export class ImageModule extends Module {
    register() {
        this.container.registerMany([
            Resizer,
            ResizeController
        ])
    }

    boot() {

    }
}
