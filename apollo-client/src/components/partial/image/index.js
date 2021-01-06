import React, { useState, useRef, useEffect } from 'react'
import { cacheImage } from "utils";
import { getImg } from 'utils';

export default function Image(props) {
  const { src, cache, ...restProps } = props;
  const imgElement = useRef()
  const placeholderImg = useRef();
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (placeholderImg.parentNode) {
      placeholderImg.parentNode.style.position = 'relative';
    }
  }, [placeholderImg])

  
  const imgStyle = {
    transition: 'all 1s ease-in-out',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)'
  }


  const handleLoad = () => {
    if (cache) {
      cacheImage(src)
    }
    const image = imgElement.current
    image.parentNode.style.position = 'relative';
    const { width, height } = image.getBoundingClientRect();
    const { width: parentWidth, height: parentHeight } = image.parentNode.getBoundingClientRect();
    if ((width / height) > (parentWidth / parentHeight)) {
      image.style.height = "100%"
    } else {
      image.style.width = "100%"
    }
    setLoaded(true)
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!loaded && <img ref={placeholderImg} className={'placeholder-img'} src={getImg('gray-loading.png')} alt="" />}
      <img ref={imgElement}
        onLoad={() => handleLoad()}
        onError={() => setLoaded(true)}
        style={loaded ? imgStyle : { ...imgStyle, opacity: 0 }}
        src={src}
        alt=""
        {...restProps} />
    </div>
  )
}
