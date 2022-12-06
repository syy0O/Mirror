const mqtt = require('mqtt')
const spawn = require('child_process').spawn;
const createLoginMessage = require('./loginMessage')
const _db = require('../mirror_db')
const axios = require('axios')
const loading = require('./loading');
var user_id = '';
var name;

const options = {
  host: '192.168.0.2',
  port: 1883
};
// const options = {
//   host: '127.0.0.1',
//   port: 1883
// };


function setUserId(id) {
  this.user_id = id;
}
function getUserId() {
  return this.user_id;
}
const client = mqtt.connect(options);
client.on('connect', function () {

  console.log("서버 mqtt와 연결");
  
  client.subscribe(`${_db.getMirror_id()}/loginCheck`)
  client.subscribe(`${_db.getMirror_id()}/createAccount/check`)
  client.subscribe(`${_db.getMirror_id()}/exist/check`)
  client.subscribe(`${_db.getMirror_id()}/reTrain/check`)
  client.subscribe(`${_db.getMirror_id()}/error`);
})


//여기 mqtt는 모두 얼굴인식 서버로부터 온 결과를 미러에 보여주는 역할
client.on('message', (topic, message, packet) => {
  let loginBtnFlag = false;
  let signUpBtnFlag = false;

  let btn; // 눌린 버튼 정보 저장
  let btnText="";

  if (topic ==`${_db.getMirror_id()}/reTrain/check`) {
    msg = String(message)
    console.log(msg + '폴더로 재학습 되었습니다.')
    createLoginMessage.createMessage(String(msg) + '폴더로 재학습 되었습니다.')
    loading.stopLoading();
  }
  if(topic == `${_db.getMirror_id()}/error`){
    var msg = String(message);
    const warningText = "Face Not Found";
     console.log("error 도착")
    return

    if(loginBtnFlag){ // Login 버튼을 눌렀는데 얼굴이 안 보일 경우
        btn = document.getElementById("loginBtn");
        btnText = "Login";
        loginBtnFlag = false;
        console.log("1도착")
    }
    else if(signUpBtnFlag){ // Sign Up 버튼을 눌렀는데 얼굴이 안 보일 경우
        btn = document.getElementById("signUpBtn");
        btnText = "Sign Up";
        signUpBtnFlag = false;
        console.log("2 도착")
    }

    if(msg == "notFound"){ // 그 버튼에 Error 문구 띄우기
        btn.textContent  = warningText;
        console.log("3 도착")
        btn.setAttribute("style", "color: red; border: solid 3px red; box-shadow: 0 0 25px red;");
    }
    else { // 얼굴을 찾았을 경우 버튼 복구
        btn.textContent = btnText;
        console.log("4 도착")
        btn.setAttribute("style", "color: white; border: solid 2px white;");
    }
}
  // if (topic == "exist/check") {
  //   user_id = String(message)
  //   setUserId(user_id)
  //   if (user_id == 'NULL') {
  //     //회원가입 하게 만들기
  //     document.location.href = './faceRecognition/sign_up.html'
  //   }
  //   else {
  //     _db.select('name', 'user', `id =${user_id}`)
  //       .then(values => {
  //         if (values.length <= 0) {
  //           //회원가입 하게 만들기
  //           document.location.href = './faceRecognition/sign_up.html'
  //           return;
  //         }
  //         document.getElementById("loginMessage").innerHTML = (String(values[0].name)) + "님은 이미 가입된 유저입니다."

  //         loading.stopLoading();
  //       })
  //   }

  // }
  //서버에서 로그인을 하고 신호가 들어옴
  if (topic == `${_db.getMirror_id()}/loginCheck`) {
    console.log("topic == loginCheck")
    document.getElementById("loading").style.display = "none";
    user_id = message
    console.log('loginCheck : 디비에서 이름 받아오기')
    if (user_id == 'NULL') {
      createLoginMessage.createLoginMessage(String('등록된 유저가 아닙니다.'))
      loading.stopLoading();
    }
    else {

      _db.select('name', 'user', `id =${user_id}`)
        .then(values => {
          if (values.length <= 0) {
            createLoginMessage.createLoginMessage(String('등록된 유저가 아닙니다.'))
          }
          loading.stopLoading();
          // 'oo님 환영합니다' 문구 
          createLoginMessage.createLoginMessage(String(values[0].name))
          var mirror_id_ = _db.getMirror_id()
          //console.log(mirror_id_)
          client.publish(`${mirror_id_}/closeCamera`, (String)(mirror_id_))
          // user 디비에 회원 추가
          _db.setMirror(String(user_id))

        })
    }
  }

  //서버에서 계정을 추가하고 신호가 올 때
  if (topic == `${_db.getMirror_id()}/createAccount/check`) {
    console.log("topic == createAccount/check")
    var createMessageDiv = document.createElement("div")
    createMessageDiv.setAttribute("id", "createMessageDiv")
    createMessageDiv.setAttribute("width", "500px")
    createMessageDiv.setAttribute("height", "100px")
    createMessageDiv.setAttribute("style", "text-align=center;")
    var name = document.getElementById('name').value
    var buf = {
      id :  String(message),
      name : name
    }
    //회원가입
    client.publish("server/signUp",  JSON.stringify(buf));
    document.location.href = '../home.html'
    // var name = document.getElementById('name').value;
    // var id = user_id;
    // console.log('서버에게 보낼 id:',id);
    // axios({
    //   url: 'http://113.198.84.128:80/signUp',
    //   method: 'post',
    //   data: {
    //     id: user_id,
    //     name: name
    //   }
    // }).then(() => {
     
    // })
  }
})




module.exports = client
