/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var baseURL = "https://kiku-nyan.t-lab.cs.teu.ac.jp"

var bgGeo;
var userID;

var app = {
  // Application Constructor
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function () {
    // 準備ができたらイベント実行
    this.receivedEvent("deviceready");

    // setInterval(() => {
    //   this.resume();
    // }, 3000);
  },

  // Update DOM on a Received Event
  receivedEvent: function (id) {
    /* ========== デバイスの準備完了 ==================== */
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector(".listening");
    var receivedElement = parentElement.querySelector(".received");
    listeningElement.setAttribute("style", "display:none;");
    receivedElement.setAttribute("style", "display:block;");

    // LINE情報を格納
    window.lineLogin.initialize({
      channel_id: "1593360387"
    });
    // きくにゃんIDを取得
    userID = localStorage.getItem("userID");

    if (!userID) { // 初回起動なら登録
      receivedElement.setAttribute("style", "display:none;");
      parentElement.querySelector(".notlogin").setAttribute("style", "display:block");

      const loginBtn = document.getElementById("line-button");
      loginBtn.setAttribute("style", "display:block");
      loginBtn.addEventListener("click", () => {
        window.lineLogin.login({}, (result) => {
          // line-idからkikunyan_idに変換
          fetch(`${baseURL}/api/users?line_user_id=${result.userID}`).then((response) => {
            return response.json();
          }).then((json) => {
            if (!json.user_id) {
              alert("kikunyan was not registered.")
              return false
            }

            userID = json.user_id
            localStorage.setItem("userID", userID)

            document.getElementById("line-button").setAttribute("style", "display:none");
            parentElement.querySelector(".notlogin").setAttribute("style", "display:none");
            parentElement.querySelector(".running").setAttribute("style", "display:block");

            this.prepareGet()
          });
        }, (error) => {
          alert(error);
        })
      })
    } else {
      parentElement.querySelector(".received").setAttribute("style", "display:none");
      parentElement.querySelector(".running").setAttribute("style", "display:block");

      this.prepareGet()
    }
  },

  prepareGet: () => {
    if (userID === undefined) {
      alert("userID is not found")
      return
    }

    bgGeo = window.BackgroundGeolocation;

    bgGeo.on("location", app.onSuccess, app.onError);

    bgGeo.configure({
        // 位置情報に関する設定
        desiredAccuracy: 0,
        distanceFilter: 10,
        stationaryRadius: 50,
        locationUpdateInterval: 1000,
        fastestLocationUpdateInterval: 5000,

        // アクティビティ認識の初期設定
        activityType: "AutomotiveNavigation",
        activityRecognitionInterval: 5000,
        stopTimeout: 5,

        // HTTP送信を行う
        url: `${baseURL}/api/locations`,
        params: {
          userId: userID
        },
        method: "POST",
        autoSync: true,

        // アプリケーションの設定
        debug: true,
        stopOnTerminate: false,
        startOnBoot: true,
        maxRecordsToPersist: 50
      },
      function (state) {
        // 設定完了時のコールバック
        console.log("BackgroundGeolocation ready: ", state);

        // 設定が終わったら起動します
        if (!state.enabled) {
          bgGeo.start();
        }
      }
    );
  },

  onSuccess: (location, taskId) => {
    // 位置情報から必要な情報を抽出
    const coords = location.coords;
    const lat = coords.latitude;
    const lng = coords.longitude;

    console.log(`location get success: [${lat} , ${lng}]`);

    // let geoData = localStorage.getItem("locations") ?
    //   JSON.parse(localStorage.getItem("locations")) : [];

    // geoData.push(location);
    // localStorage.setItem("locations", JSON.stringify(geoData));

    bgGeo.finish(taskId);
  },

  onError: error => {
    console.warn(
      "code: " + error.code + "\n" + "message: " + error.message + "\n"
    );
  },
};


var old = console.log;
console.log = function () {
  old.apply(this, arguments)

  const target = document.getElementById('console');
  const log = document.createElement('p');
  log.textContent = JSON.stringify(arguments);
  target.insertBefore(log, target.firstChild)
}

var olderror = console.error;
console.error = function () {
  olderror.apply(this, arguments)

  const target = document.getElementById('console');
  const log = document.createElement('p');
  log.textContent = JSON.stringify(arguments);
  log.style("color", "red");
  target.insertBefore(log, target.firstChild)
}


var oldwarn = console.warn;
console.warn = function () {
  oldwarn.apply(this, arguments)

  const target = document.getElementById('console');
  const log = document.createElement('p');
  log.textContent = JSON.stringify(arguments);
  log.style("color", "yellow");
  target.insertBefore(log, target.firstChild)
}


app.initialize();
