/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import ListDetailContext from '@/states/context/ListDetailContext'
import { PlatformContext } from "states/context/PlatformContext";
import { ENTER_START_GAMEPAGE } from "@gql";
import { getImg } from "utils";

export default props => {
  const { children, history } = props;
  const { client } = useContext(PlatformContext)
  const [imageShow, setImageShow] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [position, setPosition] = useState([0, 0])

  const triggerTrasition = (detail, e) => {
    const { coverURL, iconURL, id, gameID, publicStatus } = detail
    const { clientX, clientY } = e
    const navID = id || gameID
    setPosition(navigator.platform.startsWith('Win') ? [clientX, clientY] : [0, 0])
    setImageShow(publicStatus === 'DEVELOPING' ? getImg('icon_workshop.png') : coverURL || iconURL)
    setTimeout(() => {
      setLoaded(true)
    }, 500)
    setTimeout(() => {
      client._mutate({
        mutation: ENTER_START_GAMEPAGE,
        variables: {
          gameID: navID
        }
      })
      history.push(`/home/games/${navID}`)
    }, 1000)
  }

  const detailLoaded = () => {
    setImageShow('')
  }

  useEffect(() => {
    setLoaded(false)
  }, [imageShow])

  const hideImg = () => {
    setImageShow('')
  }

  useEffect(() => {
    document.addEventListener('game load', hideImg)
    return () => {
      document.removeEventListener('game load', hideImg)
    }
  }, [])


  const imgStyle = {
    position: 'fixed',
    zIndex: 999,
    transition: 'all 0.5s ease-in-out',
    width: 0,
    height: 0,
  }

  const originalStyle = {
    left: position[0] || '50%',
    top: position[1] || '100%',
    transform: 'translate(-50%,-50%)',
    opacity: 0
  }

  const transferdStyle = {
    left: 0,
    top: 0,
    width: '100%',
    height: 'auto',
  }

  const judgeStyle = () => {
    return imageShow.length && loaded
      ? { ...imgStyle, ...transferdStyle }
      : { ...imgStyle, ...originalStyle }
  }

  return (
    <ListDetailContext.Provider value={{ triggerTrasition, detailLoaded }}>
      <img src={imageShow} alt=""
        className={'change-img'}
        style={judgeStyle()} />
      <div className="home-container">
        {children}
      </div>
    </ListDetailContext.Provider >
  )
}