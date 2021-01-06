/**
 * 
 * @param {Object} obj {}
        {
            cssValue: "字体库别名"，
            url: '绝对路径'
        }
 * 
 */
function loadFont(obj) {
    try {
        // if (document.fonts && !checkFont(obj.cssValue)) {
        if (document.fonts) {
            let that = this;
            let fontFamily = obj.cssValue;
            let fontFace = new FontFace(obj.cssValue, `local('${obj.cssValue}'),url('${obj.url}') format('ttf'),url('${obj.url}')`);
            fontFace.load();
            document.fonts.add(fontFace);
            // fontFace.load().then(function (loadedFontFace) {
            //   document.fonts.add(loadedFontFace);
            //   that.canvasDemo.updateTextFontFamily(fontFamily);
            // }).catch(e => {
            //   console.log('dsada', e)
            // })
        }
    } catch (e) {
        console.log('fontLoad-error', e)
    }
}
//检测字体文件是否已加载，不适用本项目场景
function checkFont(name) {
    let values = document.fonts.values();
    let isHave = false;
    let item = values.next();
    while (!item.done && !isHave) {
        console.log('itemitemitem', item)
        let fontFace = item.value;
        // console.log('font====', fontFace.family)
        // if (fontFace.family == name) {
        //   isHave = true;
        // }
        item = values.next();
    }
    console.log('isHave', isHave)
    return isHave;
}

export default loadFont