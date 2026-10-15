import CryptoJS from 'crypto-js'

let defaultKey = CryptoJS.enc.Utf8.parse("                ");

//加密，当前方法的结果 不能直接使用aesDecrypt进行解码，而是其结果的encryptPassword.ciphertext.toString(),而后台使用的是encryptPassword.toString()
export function aesEncrypt(word, keyStr) {
  return  CryptoJS.AES.encrypt(word, getKey(keyStr), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
}

//解密
export function aesDecrypt(word, keyStr) {
  let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let decryptedData =  CryptoJS.AES.decrypt(encryptedBase64Str, getKey(keyStr), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decryptedData.toString(CryptoJS.enc.Utf8);
}

function getKey(keyStr) {
  if(!keyStr){
    return defaultKey;
  }

  //过长裁剪
  if(keyStr.length > 16){
    keyStr.substr(0,16);
  }

  //短了补空格
  while(16-keyStr.length){
    keyStr+=" ";
  }
  return CryptoJS.enc.Utf8.parse(keyStr);
}
