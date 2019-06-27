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

var bgGeo;

var app = {
  // Application Constructor
  initialize: function() {
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
  onDeviceReady: function() {
    this.receivedEvent("deviceready");
    document.addEventListener("resume", () => {
      console.log("resume");
      this.resume();
    });
    document.getElementById("deviceready").addEventListener("click", () => {
      localStorage.clear();
    });

    setInterval(() => {
      this.resume();
    }, 3000);
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector(".listening");
    var receivedElement = parentElement.querySelector(".received");

    listeningElement.setAttribute("style", "display:none;");
    receivedElement.setAttribute("style", "display:block;");

    console.log("Received Event: " + id);

    bgGeo = window.BackgroundGeolocation;

    bgGeo.configure(
      {
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
        url: "https://kiku-nyan.t-lab.cs.teu.ac.jp/api/locations",
        params: {
          userId: 1
        },
        method: "POST",
        autoSync: true,

        // アプリケーションの設定
        debug: true,
        stopOnTerminate: false,
        startOnBoot: true,
        maxRecordsToPersist: 50
      },
      function(state) {
        // 設定完了時のコールバック
        console.log("BackgroundGeolocation ready: ", state);

        // 設定が終わったら起動します
        if (!state.enabled) {
          bgGeo.start();
        }
      }
    );

    bgGeo.on("location", this.onSuccess, this.onError);
  },

  onSuccess: (location, taskId) => {
    // 位置情報から必要な情報を抽出
    const coords = location.coords;
    const lat = coords.latitude;
    const lng = coords.longitude;

    console.log(`location get success: [${lat} , ${lng}]`);

    let geoData = localStorage.getItem("locations")
      ? JSON.parse(localStorage.getItem("locations"))
      : [];

    geoData.push(location);

    localStorage.setItem("locations", JSON.stringify(geoData));

    bgGeo.finish(taskId);
  },

  onError: error => {
    console.warn(
      "code: " + error.code + "\n" + "message: " + error.message + "\n"
    );
  },

  resume: () => {
    const textarea = document.getElementById("textarea");
    const geoDatas = JSON.parse(localStorage.getItem("locations"));
    if (!geoDatas) {
      textarea.innerHTML = `no logs`;
      return;
    }

    const geoData = geoDatas[geoDatas.length - 1];
    const timestamp = geoData.timestamp;
    const latitude = geoData.coords.latitude;
    const longitude = geoData.coords.longitude;
    textarea.innerHTML = `timestamp: ${timestamp} <br /> latitude: ${latitude} <br /> longitude: ${longitude} <br />`;
  }
};

app.initialize();
