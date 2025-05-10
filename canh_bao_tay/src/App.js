import React, { useEffect, useRef } from "react";
import "./App.css";
import soundURL from "./assets/warning.mp3";
import { Howl, Howler } from "howler";
import * as tf from "@tensorflow/tfjs";

const mobilenet = require("@tensorflow-models/mobilenet");
const knnClassifier = require("@tensorflow-models/knn-classifier");

var sound = new Howl({
  src: [soundURL],
});

const NOT_TOUCH_LABEL = "not_touch";
const TOUCHED_LABEL = "touched";
const TRAINING_TIMES = 50;

function App() {
  const video = useRef();
  const classifier = useRef();
  const model = useRef();
  const isRunning = useRef(false);

  const init = async () => {
    console.log("init...");
    await setUpCamera();
    console.log("OK");

    model.current = await mobilenet.load();
    classifier.current = knnClassifier.create();

    console.log("Setup Done");
    console.log("Khong cham tay len mat va bam Train 1");
  };

  const setUpCamera = () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozgetUserMedia ||
        navigator.msgetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true },
          (stream) => {
            video.current.srcObject = stream;
            video.current.addEventListener("loadeddata", resolve);
          },
          (error) => reject(error)
        );
      }
    });
  };

  const train = async (label) => {
    console.log(`[${label}] Đang train cho máy của bạn`);
    for (let i = 0; i < TRAINING_TIMES; i++) {
      console.log(`Progress ${parseInt(((i + 1) / TRAINING_TIMES) * 100)}%`);
      await training(label);
    }
  };

  const training = (label) => {
    return new Promise(async (resolve) => {
      const embedding = model.current.infer(video.current, true);
      classifier.current.addExample(embedding, label);
      await sleep(100);
      resolve();
    });
  };

  const run = async () => {
    if (!isRunning.current) return;

    if (
      !classifier.current ||
      classifier.current.getNumClasses() === 0 ||
      !model.current
    ) {
      console.log("Chưa train đủ dữ liệu.");
      return;
    }

    const embedding = model.current.infer(video.current, true);
    const result = await classifier.current.predictClass(embedding);

    console.log("Label: ", result.label);
    console.log("Confidences: ", result.confidences);

    if (result.label === TOUCHED_LABEL) {
      soundURL.play();
    }

    await sleep(200);
    run();
  };

  const sleep = (ms = 0) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    init();

    // cleanup
    return () => {};
  }, []);

  return (
    <div className="main">
      <video ref={video} className="video" autoPlay></video>
      <div className="control">
        <button className="btn" onClick={() => train(NOT_TOUCH_LABEL)}>
          Train 1
        </button>
        <button className="btn" onClick={() => train(TOUCHED_LABEL)}>
          Train 2
        </button>
        <button
          className="btn"
          onClick={() => {
            isRunning.current = true;
            run();
          }}
        >
          Start
        </button>
        <button
          className="btn"
          onClick={() => {
            isRunning.current = false;
          }}
        >
          Stop
        </button>
      </div>
    </div>
  );
}

export default App;
