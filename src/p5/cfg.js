const cfg = {
    canvasWidth: 800,
    canvasHeight: 700,
    canvasBgnd: [191, 191, 191],

    frameRate: 60,

    imageSrcFile: 'data/sample-300/sample-301.png',

    imageTileFileBase: 'data/sample-300/egg',
    imageTileFileCountMin: 101,
    imageTileFileCountMax: 187,
    imageTileFileExtension: 'png',

    pgImgSrcWidth: 72,
    pgImgSrcHeight: 56,
    isPgImgPosterized: false,
    pgImgSrcPosterizeDepth: 4,
    pgImgSrcViewX: 0,
    pgImgSrcViewY: 0,
    pgImgSrcViewWidth: 800,
    pgImgSrcViewHeight: 600,

    paletteViewWidth: 800,
    paletteViewHeight: 100,
    paletteViewX: 0,
    paletteViewY: 600,

    cropsNumX: 9, // * 8, // pgImgSrcWidth % cropsNumX === 0
    cropsNumY: 7, // * 8, // pgImgSrcHeight % cropsNumY === 0
    cropBlockWidth: 64, // / 8,
    cropBlockHeight: 64, // / 8,
    cropOverlapX: 1.05,
    cropOverlapY: 1.05,
    cropBgnd: [255, 255, 255, 255],
    cropPreviewDelay: 1.755,

    isSaveCropEnabled: false,
    cropFileBase: 'crop',
    cropFileExtension: 'png',
}

export default cfg
