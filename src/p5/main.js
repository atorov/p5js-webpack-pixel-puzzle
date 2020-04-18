import delay from '../lib/utils/delay'

import cfg from './cfg'
import StateMachine from './StateMachine'

new p5((sketch) => {
    const s = sketch

    let data = {}

    const imgTileArr = []
    let imgSrc

    let pgImgSrc = null
    const pgImgSrcPixelsVector = []

    let pgImgSrcWindowPointerX = 0
    let pgImgSrcWindowPointerY = 0

    const sm = new StateMachine(s)

    s.preload = () => {
        imgSrc = s.loadImage(cfg.imageSrcFile)

        for (let i = cfg.imageTileFileCountMin; i <= cfg.imageTileFileCountMax; i++) {
            const img = s.loadImage(`${cfg.imageTileFileBase}-${i}.${cfg.imageTileFileExtension}`)
            imgTileArr.push(img)
        }
    }

    s.setup = () => {
        sm.setStatus(':PENDING:')

        s.createCanvas(cfg.canvasWidth, cfg.canvasHeight)
        s.frameRate(cfg.frameRate)

        s.background(cfg.canvasBgnd)

        sm.nextStep()
        sm.setStatus(':READY:')
    }

    s.draw = async () => {
        if (sm.state.status === ':READY:') {
            // Display pgImgSrc
            if (sm.state.step === 1) {
                sm.setStatus(':PENDING:')

                pgImgSrc = s.createGraphics(cfg.pgImgSrcWidth, cfg.pgImgSrcHeight)
                pgImgSrc.imageMode(s.CORNER)
                pgImgSrc.image(imgSrc, 0, 0, cfg.pgImgSrcWidth, cfg.pgImgSrcHeight)

                if (cfg.isPgImgPosterized) {
                    pgImgSrc.filter(s.POSTERIZE, cfg.pgImgSrcPosterizeDepth)
                }

                s.image(pgImgSrc, cfg.pgImgSrcViewX, cfg.pgImgSrcViewY, cfg.pgImgSrcViewWidth, cfg.pgImgSrcViewHeight)

                sm.nextStep()
                sm.setStatus(':READY:')
            }

            // Calculate pgImgSrcPixelsVector
            else if (sm.state.step === 2) {
                sm.setStatus(':PENDING:')

                pgImgSrc.loadPixels()
                const pgImgSrcPixels = [...pgImgSrc.pixels]
                while (pgImgSrcPixels.length) {
                    pgImgSrcPixels.pop()
                    pgImgSrcPixelsVector.push([pgImgSrcPixels.pop(), pgImgSrcPixels.pop(), pgImgSrcPixels.pop()].reverse())
                }
                pgImgSrcPixelsVector.reverse()
                console.log(`::: step: ${sm.state.step}, pgImgSrcPixelsVector:`, pgImgSrcPixelsVector)

                sm.nextStep()
                sm.setStatus(':READY:')
            }

            // Calculate colorsVector
            else if (sm.state.step === 3) {
                sm.setStatus(':PENDING:')

                const colorsVector = [...new Set(pgImgSrcPixelsVector.map((row = []) => row.join(', ')))]
                    .map((str = '') => ({
                        str,
                        comp: str.split(', '),
                        idx: pgImgSrcPixelsVector.reduce((acc = [], row = [], i) => {
                            if (row.join(', ') === str) {
                                return [...acc, i]
                            }

                            return acc
                        }, []),
                    }))
                    .sort(({ idx: a = [] }, { idx: b = [] }) => b.length - a.length)

                data = {
                    allCrops: cfg.cropsNumX * cfg.cropsNumY,
                    allPixels: cfg.pgImgSrcWidth * cfg.pgImgSrcHeight,
                    colorsVector,
                }
                console.log(`::: step: ${sm.state.step}, data:`, data)

                sm.nextStep()
                sm.setStatus(':READY:')
            }

            // Display pgImgSrc blocks
            else if (sm.state.step === 4) {
                sm.setStatus(':PENDING:')

                const blockWidth = cfg.pgImgSrcViewWidth / cfg.pgImgSrcWidth
                const blockHeight = cfg.pgImgSrcViewHeight / cfg.pgImgSrcHeight

                s.noStroke()
                for (let y = 0; y < cfg.pgImgSrcHeight; y++) {
                    for (let x = 0; x < cfg.pgImgSrcWidth; x++) {
                        const { comp = [] } = data.colorsVector.find(({ idx = [] }) => idx.some((i) => i === y * cfg.pgImgSrcWidth + x))
                        s.fill(comp)
                        s.rect(
                            x * blockWidth,
                            y * blockHeight,
                            blockWidth,
                            blockHeight,
                        )
                    }
                }

                sm.nextStep()
                sm.setStatus(':READY:')
            }

            else if (sm.state.step === 5) {
                sm.setStatus(':PENDING:')

                const paletteItemWidth = cfg.paletteViewWidth / data.colorsVector.length

                s.noStroke()
                s.rectMode(s.CORNER)
                for (let i = 0; i < data.colorsVector.length; i++) {
                    s.fill(data.colorsVector[i].comp)
                    s.rect(
                        cfg.paletteViewX + i * paletteItemWidth,
                        cfg.paletteViewY,
                        paletteItemWidth,
                        cfg.paletteViewHeight,
                    )
                }

                // sm.nextStep()
                sm.setStatus(':READY:')
            }

            else if (sm.state.step === 6) {
                sm.setStatus(':PENDING:')

                s.background(cfg.canvasBgnd)

                const pg = s.createGraphics(cfg.cropsNumX * cfg.cropBlockWidth, cfg.cropsNumY * cfg.cropBlockHeight)

                pg.noStroke()
                pg.rectMode(s.CORNER)
                pg.imageMode(s.CORNER)

                pg.background(cfg.cropBgnd)
                let index
                for (let y = 0; y < cfg.cropsNumY; y++) {
                    for (let x = 0; x < cfg.cropsNumX; x++) {
                        index = (pgImgSrcWindowPointerY + y) * cfg.pgImgSrcWidth + pgImgSrcWindowPointerX + x
                        const { comp = [0, 0, 0] } = data.colorsVector.find(({ idx = [] }) => idx.some((_i) => _i === index)) || {}

                        // pg.fill([...comp, 127])
                        // pg.ellipseMode(s.CENTER)
                        // pg.ellipse(
                        //     x * cfg.cropBlockWidth + cfg.cropBlockWidth / 2,
                        //     y * cfg.cropBlockHeight + cfg.cropBlockHeight / 2,
                        //     cfg.cropBlockWidth * cfg.cropOverlapX,
                        //     cfg.cropBlockHeight * cfg.cropOverlapY,
                        // )

                        // pg.fill(comp)
                        // pg.textAlign(s.CENTER, s.CENTER)
                        // pg.text(
                        //     `${pgImgSrcWindowPointerX},${pgImgSrcWindowPointerY};${index}`,
                        //     x * cfg.cropBlockWidth + cfg.cropBlockWidth / 2,
                        //     y * cfg.cropBlockHeight + cfg.cropBlockHeight / 2,
                        // )

                        const imgTileArrIndex = Math.floor(s.random(0, imgTileArr.length))
                        pg.tint(comp)
                        pg.imageMode(s.CENTER)
                        pg.image(
                            imgTileArr[imgTileArrIndex],
                            x * cfg.cropBlockWidth + cfg.cropBlockWidth / 2,
                            y * cfg.cropBlockHeight + cfg.cropBlockHeight / 2,
                            cfg.cropBlockWidth * cfg.cropOverlapX,
                            cfg.cropBlockHeight * cfg.cropOverlapY,
                        )
                    }
                }

                s.imageMode(s.CENTER)
                s.image(pg, s.width / 2, s.height / 2, pg.width, pg.height)

                if (cfg.isSaveCropEnabled) {
                    pg.saveCanvas(pg, `${cfg.cropFileBase}-${pgImgSrcWindowPointerY + 100}-${pgImgSrcWindowPointerX + 100}`, cfg.cropFileExtension)
                }

                console.log(`::: step: ${sm.state.step}, completed %:`, Math.round((index / data.allPixels) * 100))

                pgImgSrcWindowPointerX += cfg.cropsNumX
                if (pgImgSrcWindowPointerX >= cfg.pgImgSrcWidth) {
                    pgImgSrcWindowPointerX = 0
                    pgImgSrcWindowPointerY += cfg.cropsNumY
                }

                if (pgImgSrcWindowPointerY >= cfg.pgImgSrcHeight) {
                    sm.nextStep()
                }

                await delay(cfg.cropPreviewDelay)
                sm.setStatus(':READY:')
            }
        }
    }

    s.keyPressed = () => {
        if (sm.state.status === ':READY:') {
            sm.nextStep()
            console.log('::: step #:', sm.state.step)
        }
    }
}, 'p5-main')
