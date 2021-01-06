import React, { Fragment, useState, useEffect, useRef, createRef } from 'react'
import Mask from 'components/partial/modal/Mask'
import { enableDrag, getImg } from 'utils'
import AlloyFinger from 'alloyfinger'

export default function PreviewList(props) {
  const { imgList } = props;
  const scrollSection = useRef()
  const maskScrollSection = useRef()
  const [previewImgRefs, setPreviewImgRefs] = useState([])
  const [currentIndex, setCurrentIndex] = useState('')
  const [zoom, setZoom] = useState(1)
  const [enableSwipe, setEnableSwipe] = useState(true)

  useEffect(() => {
    new AlloyFinger(maskScrollSection.current, {
      swipe: function (e) {
        let timer
        const { direction } = e;
        if (!enableSwipe || timer) {
          return
        }
        setEnableSwipe(false);
        timer = setTimeout(() => {
          setEnableSwipe(true)
          clearTimeout(timer)
          timer = undefined
        }, 1000)
        if (direction === 'Left') {
          setCurrentIndex(current => {
            return current === imgList.length - 1 ? current : current + 1
          })
        } else if (direction === 'Right') {
          setCurrentIndex(current=>{
            return current === 0 ? current : current - 1
          })
        }
      }
    })
    if (navigator.platform.startsWith('Win')) {
      enableDrag(scrollSection.current)
    }
    setPreviewImgRefs(imgList.map(() => createRef()))
  }, [])

  useEffect(() => {
    if (previewImgRefs.length) {
      previewImgRefs.forEach(item => {
        let originalScale = 1;
        new AlloyFinger(item.current, {
          multipointStart: function (e) {
            originalScale = zoom
          },
          multipointEnd: function (e) {
            if (item.current) {
              console.log(item.current.style.transform)
              setZoom(Number(item.current.style.transform.slice(27, -1)))
            }
          },
          pinch: e => {
            let pendingZoom
            pendingZoom = originalScale * e.zoom
            if (pendingZoom > 2.5) {
              pendingZoom = 2.5
            } else if (pendingZoom < 0.6) {
              pendingZoom = 0.6
            }
            if (item.current) {
              item.current.style.transform = `translate(-50%,-50%) scale(${pendingZoom})`
            }
          },
        })
      })
    }
  }, [previewImgRefs])

  useEffect(() => {
    setZoom(1)
    previewImgRefs.forEach(item => {
      item.current.style.transform = `translate(-50%,-50%) scale(1)`
    })
  }, [currentIndex])

  const preventClose = (e) => {
    e.stopPropagation();
  }

  return (
    <Fragment>
      <Mask visible={currentIndex !== ''} onClose={() => setCurrentIndex('')} contentWidth="100%">
        <div className="img-list-mask-wrapper" onClick={(e) => { setCurrentIndex('') }}>
          <div className="top-bar-number">{`${currentIndex + 1}/${imgList.length}`}</div>
          <img className="close" src={getImg('close.png')} alt="" />
          <div className="mask-list-wrapper">
            <div className="mask-list" style={{ transform: `translateX(-${currentIndex * 100}vw)` }} ref={maskScrollSection} onClick={(e) => preventClose(e)}>
              {imgList.map((image, index) => (
                <div className="img-item" key={index}>
                  <img src={image} alt="" ref={previewImgRefs[index]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Mask>
      <div className="scroll-img-list" ref={scrollSection}>
        {imgList.map((image, index) => (
          <div className="thumb" key={index} onClick={(e) => { e.stopPropagation(); setCurrentIndex(index) }}>
            <img src={image} alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>
    </Fragment>
  )
}
