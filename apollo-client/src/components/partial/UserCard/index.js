import React, { useContext, useState, useEffect } from 'react'
import { getImg } from 'utils'
import { PlatformContext } from "states/context/PlatformContext";
import Image from 'components/partial/image'
import { history } from 'react-router-guard';
import { unityJSON } from "utils/lib/unity";
import { FOLLOW_USER, UNFOLLOW_USER, QUERY_USER_INFO } from "@gql";
import ListDetailContext from 'states/context/ListDetailContext'

export default function UserCard(props) {
  const context = useContext(PlatformContext)
  const { triggerTrasition } = useContext(ListDetailContext)
  const { detail: { userID }, detail, onclose, gameID, handleUserLeave, gameInfo } = props;
  const { i18nMsg, client, userInfo } = context;

  const [sendingRequest, setSendingRequest] = useState(false)
  const [userDetail, setUserDetail] = useState(false)

  useEffect(() => {
    if (detail) {
      setUserDetail(detail)
    }
  }, [detail])

  const mapStatus = {
    'ONLINE': i18nMsg['friend.online'],
    'OFFLINE': i18nMsg['friend.offline'],
    '': i18nMsg['friend.offline'],
    'PLAYING': i18nMsg['friend.playing']
  }

  const goDetail = (id) => {
    history.push(`/home/games/${id}`)
    onclose();
  }

  const handleFriendRequest = async type => {
    const mutationMap = {
      'invite': FOLLOW_USER,
      'cancel': UNFOLLOW_USER
    }
    if (sendingRequest) {
      return
    }
    setSendingRequest(true)
    await client._mutate({
      mutation: mutationMap[type],
      variables: {
        followUserID: userID
      }
    })
    setSendingRequest(false)
    updateUser()
  }

  const showAvatarBody = (targetUser) => {
    const { avatarJSON, userID, hasAvatar } = targetUser;
    if (userInfo.userID === userID) {
      unityJSON("setAvatar");
    } else {
      // unityJSON("showOtherAvatar", {
      //   avatarJSON,
      //   hasAvatar
      // });
    }
  }

  const updateUser = async () => {
    const userRes = await client._query({
      query: QUERY_USER_INFO,
      variables: {
        queryUserID: userID
      },
      fetchPolicy: 'no-cache',
      passCondition: ['data']
    })
    if (userRes) {
      const { queryUserInfo, userPlayedGameList, queryFriendsCount } = userRes
      setUserDetail({
        ...queryUserInfo,
        playedList: userPlayedGameList,
        friendsCount: queryFriendsCount
      })
    }
  }

  return (
    <div className="user-card">
      <div className="top">
        <div className="avatar">
          <img className="icon" src={userDetail.iconURL || getImg('Icon_head.png')} alt="" />
          <img className="gender" src={getImg(userDetail.avatarGender === 2 ? 'female.png' : 'male.png')} alt="" />
        </div>
        <div className="detail">
          <div className="name">{userDetail.nickname} <span className="number">#{userDetail.nameSeq}</span></div>
          <div>
            {userDetail.gameID ? i18nMsg['friend.playing'] : mapStatus[userDetail.status]}
            {userDetail.gameID && <span className="game" style={{ cursor: 'pointer' }} onClick={() => goDetail(userDetail.gameID)}>{`${userDetail.gameName} >`}</span>}
          </div>
        </div>
        <img className="close" onClick={() => onclose()} style={{ cursor: 'pointer', padding: '20px' }} src={getImg('close-dialog.png')} alt="" />
      </div>
      <div className="content">
        <div className="left">
          <div className="friend">
            <div className="gray-title">
              {i18nMsg['friend.friendcount']} :
            </div>
            <span className="number">
              {userDetail.friendsCount}
            </span>
          </div>
          <div className="last-play">
            <div className="gray-title">
              {i18nMsg['friend.lastplayed']} :
            </div>
            <div className="list">
              {userDetail.playedList && userDetail.playedList.map((game, index) => {
                return index < 4 &&
                  <div className="image" key={game.gameID} onClick={e => {
                    if (gameID && gameID === game.gameID) {
                      onclose()
                      return
                    }
                    handleUserLeave(gameInfo, () => {
                      triggerTrasition(game, e);
                      setTimeout(() => {
                        onclose()
                      }, 500)
                    })
                  }}>
                    <Image src={game.iconURL} />
                  </div>
              })}
            </div>
          </div>
          {userInfo.userID !== userDetail.userID && <div>
            {['STRANGER', 'FOLLOWER', ''].indexOf(userDetail.friendshipState) > -1 && <button className="control-button" onClick={() => handleFriendRequest('invite')}>
              <img src={getImg('add_friends.png')} alt="" />
              {i18nMsg['friend.addfriend']}
            </button>}
            {['FRIEND'].indexOf(userDetail.friendshipState) > -1 && <button className="cancel-btn">
              <img src={getImg('friend-added.png')} alt="" />
              {i18nMsg['friend.friend']}
            </button>}
            {['FOLLOWING'].indexOf(userDetail.friendshipState) > -1 && <button className="cancel-btn" onClick={() => handleFriendRequest('cancel')}>
              <img src={getImg('cancel-request.png')} alt="" />
              {i18nMsg['friend.cancelrequest']}
            </button>}
          </div>}
        </div>
        <div className="right">
          {userDetail.avatarBodyURL ? <Image src={userDetail.avatarBodyURL}
            onClick={() => showAvatarBody(userDetail)}
          /> :
            <img className="placeholder-body" src={userDetail.gender === 0 ?
              getImg('avatar_girl_body.png')
              : getImg('avatar_body.png')}
              onClick={() => showAvatarBody(userDetail)}
              alt=""
            />}
        </div>
      </div>
    </div>
  )
}
