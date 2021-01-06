export function toggleLoginLoading(status, client) {

  if (status === 'yes') {
    client.writeData({
      data: {
        loginLoading: 'yes'
      }
    })
  } else {
    client.writeData({
      data: {
        loginLoading: 'no'
      }
    })
  }

  //
  // client.writeData({
  //     data: {
  //         loginLoading: status === 'yes' ? 'yes' : 'no'
  //     }
  // })
}
