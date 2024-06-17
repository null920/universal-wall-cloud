export const formatTime = (e) => {
  const date = new Date(e);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);
  const second = date.getSeconds()

  //console.log(`${year}-${month}-${day} ${hour}:${minute}`);
  //正则表达式自动补0
  return `${year}-${month}-${day} ${hour}:${minute}`;
}