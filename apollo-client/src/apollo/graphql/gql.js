import gql from 'graphql-tag';
import {
  GraphQLEnumType
} from 'graphql';


const FriendshipEnum = new GraphQLEnumType({
  name: "FriendshipState",
  values: {
    STRANGER: {
      value: 0
    },
    FOLLOWING: {
      value: 1
    },
    FOLLOWER: {
      value: 2
    },
    FRIEND: {
      value: 3
    }
  }
})

const UserStatusEnum = new GraphQLEnumType({
  name: "UserStatus",
  values: {
    OFFLINE: {
      value: 0
    },
    ONLINE: {
      value: 1
    },
    PLAYING: {
      value: 2
    }
  }
})

const ClientModeEnum = new GraphQLEnumType({
  name: "ClientMode",
  values: {
    WEB: {
      value: 0
    },
    HUB: {
      value: 0
    },
    EDITOR: {
      value: 0
    },
    SITE_MAIN: {
      value: 0
    },
  }
})

export const GET_LOGIN_LOADING = gql`
    query getLoginLoading {
        loginLoading @client
    }
`;

export const GET_MYSELF_AVATAR = gql`
    query getMyself {
        userInfo @client(always: true) {
            nickname
            nameSeq
            iconURL
            avatarBodyURL
        }
    }
`;

export const GET_MYSELF_INFO = gql`
    query getMyself {
        userInfo @client {
            userID
            numberID
            nickname
            nameSeq
            gender
            status
            gameID
            gameName
            iconURL
            avatarBodyURL
            profile
            hasAvatar
            avatarJSON
            followingCount
            followerCount
            friendshipState
        }
    }
`;

export const fragments = {
  login: {
    userInfo: gql`
        fragment LoginUserInfo on DisplayUserInfo {
            userID
            numberID
            nickname
            nameSeq
            gender
            status
            gameID
            gameName
            iconURL
            hasAvatar
            avatarJSON
            avatarBodyURL
            profile
            followingCount
            followerCount
            friendshipState
        }
    `
  },
  friend: {
    userInfo: gql`
        fragment FriendUserInfo on DisplayUserInfo {
            userID
            numberID
            nickname
            nameSeq
            gender
            status
            gameID
            gameName
            iconURL
            hasAvatar
            avatarJSON
            avatarBodyURL
            profile
            followingCount
            followerCount
            friendshipState
        }
    `
  },
  game: {
    gameInfo: gql`
    fragment Game on Game {
      id
      author
      name
      assetID
      assetHash
      iconURL
      coverURL
      description
      thumbnailURLs
      publicStatus
      genre
      tags
      upvotes
      voteType
      downvotes
      heatValue
      favorites
      favorited
      lastPublishTime
      minPlayers
      maxPlayers
      version
      timestamp
    }
    `
  }
}

export const QUERY_MYSELF = gql`
    query queryMyself {
        queryMyself {
            userInfo {
                userID
                numberID
                nickname
                nameSeq
                gender
                status
                gameID
                gameName
                iconURL
                avatarBodyURL
                profile
                hasAvatar
                avatarJSON
                followingCount
                followerCount
                friendshipState
            }
        }
    }
`;

export const QUERY_BANNER = gql`
    query querBanner {
        queryMyself {
            userInfo {
                questionnaireDone
                questionnaireAble
            }
        }
    }
`;

export const friendInfo = gql`
    fragment friendInfo on DisplayUserInfo {
        userID
        nickname
        nameSeq
        gender
        status
        gameID
        gameName
        iconURL
        hasAvatar
        avatarJSON
        avatarBodyURL
        profile
        followingCount
        followerCount
        friendshipState
    }
`


export const QUERY_FRIENDS = gql`
    query queryFriends($userID: String $typ: FriendshipState! $status: UserStatus $status1: UserStatus $skipLen: Int! $limitLen: Int!) {
        online: queryFriends(userID: $userID, typ: $typ, status: $status, skipLen: $skipLen, limitLen: $limitLen) {
            ...friendInfo
        }
        offline: queryFriends(userID: $userID, typ: $typ, status: $status1, skipLen: $skipLen, limitLen: $limitLen) {
            ...friendInfo
        }
    }
    ${friendInfo}
`;

export const QUERY_USERS = gql`
    query searchUserList($keyword: String!, $skipLen: Int!, $limitLen: Int!) {
        searchUserList(keyword: $keyword, skipLen: $skipLen, limitLen: $limitLen) {
            ...LoginUserInfo
        }
        searchUserCount(keyword: $keyword)
    }
    ${fragments.login.userInfo}
`;

export const QUERY_USER_INFO = gql`
    query queryUserInfo($queryUserID: String) {
        queryUserInfo(queryUserID: $queryUserID) {
            ...LoginUserInfo
        }
        userPlayedGameList(userID:$queryUserID,skipLen:0,limitLen:100){
          gameID
          iconURL
          coverURL
          name
        }
        queryFriendsCount(userID:$queryUserID,typ:FRIEND)
    }
    ${fragments.login.userInfo}
`;

// export const QUERY_FRIENDS = gql`
//     query queryFriends($userID: String, $typ: FriendshipState!, $status: UserState, $skipLen: Int!, $limitLen: Int!) {
//         queryFriends(userID: $userID, typ: $typ, status: $status, skipLen: $skipLen, limitLen: $limitLen) {
//             ...FriendUserInfo
//         }
//     }
//     ${fragments.friend.userInfo}
// `;

export const CHECK_ACCOUNT = gql`
    query CheckAccount(
        $deviceID: String
    ){
        checkAccount(deviceID: $deviceID){
            exist
        }
    }
`;

export const MUTATION_LOGIN = gql`
    mutation LoginMutation($account: String!, $password: String) {
        login(account: $account, password: $password) {
            token
            userInfo {
                ...LoginUserInfo
            }
        }
    }
    ${fragments.login.userInfo}
`;

export const GOOGLE_LOGIN = gql`
    mutation googleLogin($gpToken: String!) {
        loginByGooglePlay(gpToken: $gpToken) {
            token
            userInfo {
                ...LoginUserInfo
            }
            firstLogin
            svrInfo {
                unixTimestamp
                imEnvID
            }
        }
    }
    ${fragments.login.userInfo}
`;

export const LILITH_LOGIN = gql`
    mutation LoginByLilithSDK($appid: String!, $appuid: String!, $apptoken: String!, $mode: ClientMode) {
        loginByLilithSDK(appid: $appid, appuid: $appuid, apptoken: $apptoken, mode: $mode) {
            token
            userInfo {
                ...LoginUserInfo
            }
            svrInfo {
                unixTimestamp
                imEnvID
            }
        }
    }
    ${fragments.login.userInfo}
`;

export const LOGIN_WITH_DEVICE = gql`
    mutation LoginWithDevice($account: String!) {
        login(account: $account) {
            token
            userInfo {
                ...LoginUserInfo
            }
            svrInfo {
                unixTimestamp
                imEnvID
            }
        }
    }
    ${fragments.login.userInfo}
`;

export const REGISTER_WITH_DEVICE = gql`
    mutation RegisterWithDevice($deviceID: String) {
        register(deviceID: $deviceID) {
            token,
            userID
        }
    }
`;


export const SET_NICKNAME = gql`
    mutation setNicknameMutation($nickname: String!) {
        setUserNickname(nickname: $nickname) {
            code
        }
    }
`;

export const FOLLOW_USER = gql`
    mutation followUser($followUserID: String!) {
        followUser(followUserID: $followUserID) {
            code
        }
    }
`;

export const UNFOLLOW_USER = gql`
    mutation unfollowUser($followUserID: String!) {
        unfollowUser(followUserID: $followUserID) {
            code
        }
    }
`;

export const GET_SEARCH_USERS = gql`
    query GetSearchUsers {
        searchUsers @client
    }
`;

export const UPDATE_USER_STATUS = gql`
    mutation UpdateSearchUser($id: String) {
        updateSearchUser(id: $id) @client
    }
`;

export const GET_GAME_LIST = gql`
    query getGameList($sortType: String, $skipLen: Int!, $limitLen: Int!) {
        gameList(sortType: $sortType, skipLen: $skipLen, limitLen: $limitLen) {
            id
            name
            author
            assetID
            iconURL
            coverURL
            thumbnailURLs
            genre
            tags
            upvotes
            downvotes
            minPlayers
            maxPlayers
            version
            timestamp
        }
        gameCount(sortType: $sortType)
    }
`;

export const SEARCH_GAME_LIST = gql`
    query ($keyword: String, $skipLen: Int!, $limitLen: Int!) {
      searchGameList(keyword: $keyword, skipLen: $skipLen, limitLen: $limitLen) {
            id
            name
            author
            assetID
            iconURL
            coverURL
            thumbnailURLs
            genre
            tags
            upvotes
            downvotes
            minPlayers
            maxPlayers
            version
            timestamp
        }
    }
`;


export const GET_GAME = gql`
    query getGame($id: String!) {
      game(id: $id) {
        ...Game
      }
    }
    ${fragments.game.gameInfo}
`;

export const GET_GAME_COMMENT = gql`
    query ($id: String!,$skipLen:Int!,$limitLen:Int!) {
      playerHubGameCommentList(input:{
        gameID:$id,
        skipLen:$skipLen,
        limitLen:$limitLen
      }){
        list{
          id
          gameID
          commentatorID
          commentatorName
          commentatorIconURL
          comment
          timestamp
        }
        totalCount
      }
    }
`;

export const MAKE_COMMENT = gql`
  mutation ($gameID:String!,$comment:String!){
    commentPlayerHubGame(input:{
      gameID:$gameID,
      comment:$comment
    }){
      status{
        code
        msg
      }
    }
  }
`

export const DELETE_COMMENT = gql`
  mutation ($commentID:String!){
    deletePlayerHubGameComment(input:{
      commentID:$commentID
    }){
      status{
        code
        msg
      }
    }
  }
`

export const TOGGLE_GAME_FAVOUR = gql`
mutation ($input: ToggleFavoritePlayerHubGameInput!) {
  toggleFavoritePlayerHubGame(input: $input) {
      status{
        code
        msg
      }
    }
}
`;

export const VOTE_GAME = gql`
mutation ($input: VotePlayerHubGameInput!) {
  votePlayerHubGame(input: $input) {
    status{
        code
        msg
      }
    }
}
`;

/* 组队逻辑 START*/

const inviteFrag = gql`
    fragment inviteFrag on TeamInviteInfo {
        version
        inviteList {
            inviteID
            teamID
            gameID
            gameName
            userID
            inviterID
            inviterName
            inviteeID
            inviteeName
            timestamp
            iconURL
        }
    }
`

export const GET_TEAM_INVITE_MSG = gql`
    ${inviteFrag}
    query QueryTeamInvite ($version:String!) {
        isOnline
        teamInviteMsg (version:$version) {
            ...inviteFrag
        }
    }
`;


export const IS_ONLINE = gql`
    query KeepOnline ($version:String!){
        isOnline
        teamInviteMsg (version:$version) {
            ...inviteFrag
        }
    }
    ${inviteFrag}
`
export const INVITE_TEAM_MEMBERS = gql`
    mutation InviteTeamMembers($input:InviteTeamMembersInput!){
        inviteTeamMembers(input:$input){
            userIDList
        }
    }
`

export const GET_TEAM_INFO = gql`
    query QueryTeamInfo ($teamID:String!,$version:String!){
        teamInfo(teamID:$teamID,version:$version){
            version
            teamID
            leaderID
            state
            members {
                userID
                userName
                state
                iconURL
            }
            pendingMembers{
                userID
                userName
                state
                iconURL
            }
            gameInfo{
                gameID
                assetID
                gameName
                assetHash
                minPlayers
                maxPlayers
            }
            roomInfo{
                roomID
                roomAddr
                roomPort
                roomToken
            }
        }
    }
`

export const PLAY_TEAM_GAME = gql`
    mutation PlayTeamGame($input:PlayTeamGameInput!){
        playTeamGame(input:$input){
            code
            msg
        }
    }
`

export const JOIN_GAME = gql`
    mutation JoinGameV1($input:JoinGameV1Input!){
        joinGameV1(input:$input){
            code
            msg
        }
    }
`

export const JOIN_GAME_V2 = gql`
    mutation JoinGameV2($input:JoinGameV1Input!){
        joinGameV2(input:$input){
            roomInfo{
              roomID
              roomAddr
              roomPort
              roomToken
            }
        }
    }
`

export const ACCEPT_TEAM_INVITE = gql`
    mutation AcceptTeamInvite($input:AcceptTeamInviteInput!){
        acceptTeamInvite(input:$input){
            code
            msg
        }
    }
`

export const LEAVE_TEAM = gql`
    mutation LeaveTeam($input:LeaveTeamInput!){
        leaveTeam(input:$input){
            code
            msg
        }
    }
`

export const LEAVE_GAME = gql`
    mutation LeaveGame($input:LeaveGameV1Input!){
        leaveGameV1(input:$input){
            code
            msg
        }
    }
`

export const KEEP_ONLINE = gql`
    mutation onlineTick{
        onlineTick{
            unreadMsgCount
        }
    }
`
export const REJECT_TEAM_INVITE = gql`
    mutation rejectTeamInvite($input: RejectTeamInviteInput!){
        rejectTeamInvite(input:$input){
            code
            msg
        }
    }
`
/* 组队逻辑 END*/

// 游戏进入记录
export const ENTER_START_GAMEPAGE = gql`
    mutation enterStartGamePage($gameID: String!){
        enterStartGamePage(gameID:$gameID)
    }
`
// 进入调查问卷
export const ENTER_QUESTIONNAIRE = gql`
    mutation enterQuestionnaire{
        enterQuestionnaire
    }
`


/* 老版本登录注册流程 start*/

export const CHECK_TOKEN = gql`
    query checkToken {
        checkToken
    }
`;

export const LOGIN_MUTATION = gql`
    mutation LoginMutation($account: String!, $password: String!, $mode: ClientMode) {
        login(account: $account, password: $password, mode: $mode) {
            token
            userInfo {
                userID
                numberID
                nickname
                gender
                hasAvatar
                avatarJSON
                status
                gameID
                gameName
            }
            svrInfo {
                unixTimestamp
                imEnvID
            }
        }
    }
`;

export const CHECK_ACCOUNT_MAIL = gql`
    query CheckAccount(
        $email: String!
    ){
        checkAccount(email: $email){
            exist
        }
    }
`;
export const SEND_EMAIL_VERIFICATION = gql`
    mutation sendEmailVerification(
        $email: String!
    ){
        sendVrfCodeEmail(email: $email) {
            code
        }
    }
`;

export const CHECK_CODE = gql`
    query checkVrfCode(
        $target: String!,
        $vrfCode: String!
    ){
        checkVrfCode(target: $target, vrfCode: $vrfCode)
    }
`;

export const EMAIL_REGISTER_MUTATION = gql`
    mutation RegisterMutation($email: String!, $password: String!, $vrfCode: String!, $mode: ClientMode) {
        register(email: $email, password: $password, vrfCode: $vrfCode, mode: $mode) {
            token
        }
    }
`;

export const SET_BIRTHDAY_MUTATION = gql`
    mutation setBirthdayMutation(
        $birthday: String!
    ){
        setUserBirthday(birthday: $birthday){
            code
        }
    }
`;
export const SET_GENDER_MUTATION = gql`
    mutation setGenderMutation(
        $gender: Int!
    ){
        setUserGender(gender: $gender){
            code
        }
    }
`;

export const FETCH_MY_INFO = gql`
    query getMyInfo {
        queryMyself {
            email
            phone
            userInfo {
                userID
                nickname
                gender
                status
                gameID
                gameName
                iconURL
                hasAvatar
                avatarJSON
            }
        }
    }
`;

export const SET_NICKNAME_MUTATION = gql`
    mutation setNicknameMutation(
        $nickname: String!
    ){
        setUserNickname(nickname: $nickname){
            code
        }
    }
`;
/* 老版本登录注册流程 end*/


/* 资源市场 start*/
export const GET_CATEGORIES = gql`
    query getAssetCategoryList {
        assetCategoryList {
            id
            name
            assetSubCategoryList {
                id
                name
            }
        }
        assetClassList {
            id
            name
        }
        assetLevelList {
            id
            name
        }
    }
`;

/* Disk */
export const CREATE_ASSET_FOLDER = gql`
    mutation createMyStorageAssetFolder(
        $input:CreateMyStorageAssetFolderInput!
    ){
        createMyStorageAssetFolder(input: $input){
            code
            msg
        }
    }
`

export const ASSET_STORAGE_LIST = gql`
    query userAssetStorageList(
        $filter:AssetStorageFilter!,
        $storageTypes:[Int!],
        $skipLen: Int!,
        $limitLen: Int!){
        userAssetStorageList(filter: $filter, storageTypes: $storageTypes, skipLen: $skipLen, limitLen: $limitLen) {
            storageID
            assetID
            containTypes
            isAuthor
            thumbnailURLs
            storageTypes
            name
            timestamp
            public
            assetLevel
    }
}
`;

export const ASSET_STORAGE_FOLDER_LIST = gql`
    query userAssetStorageFolderList(
        $id: String!,
        $skipLen: Int!,
        $limitLen: Int!){
        userAssetStorageFolderList(id: $id, skipLen: $skipLen, limitLen: $limitLen) {
            storageID
            assetID
            containTypes
            isAuthor
            thumbnailURLs
            storageTypes
            name
            timestamp
            public
            assetLevel
    }
}
`;


export const MV_ASSET_FOLDER = gql`
    mutation moveMyStorageAssetFolderItem(
        $input: MoveMyStorageAssetFolderItemInput!
    ){
        moveMyStorageAssetFolderItem(input: $input) {
            code
            msg
        }
    }
`;

export const RENAME_ASSET_FOLDER = gql`
    mutation changeMyStorageAssetFolderName(
        $input: ChangeMyStorageAssetFolderNameInput!
    ) {
        changeMyStorageAssetFolderName(input: $input) {
            code
            msg
        }
    }
`;

export const DEL_ASSET_FAVORITE = gql`
    mutation delAssetFavorite(
        $input: DelAssetFavoriteInput!
    ) {
        delAssetFavorite(input: $input) {
            code
            msg
        }
    }
`

export const DEL_MYSTORAGE_ASSETITEM_INPUT = gql`
    mutation delMyStorageAssetItem(
        $input: DelMyStorageAssetItemInput!
    ) {
        delMyStorageAssetItem(input: $input) {
            code
            msg
        }
    }
`
export const ARCHIVE_ASSET = gql`
    mutation archiveAsset(
        $input: ArchiveAssetInput!
    ) {
        archiveAsset(input: $input) {
            assetID
            status {
                code
                msg
            }
        }
    }
`
export const UPDATE_MYSTORE_ASSETITEM = gql`
    mutation updateMyStorageAssetItem (
        $input: UpdateMyStorageAssetItemInput!
    ) {
        updateMyStorageAssetItem(input: $input) {
            code
            msg
        }
    }
`

export const TRACK_CLIENT = gql`
    mutation trackClient(
        $input: TrackClientInput!
    ) {
        trackClient(input: $input) {
            ok {
                code
            }
        }
    }
`;

/* 资源市场 end*/
