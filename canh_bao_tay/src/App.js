import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import soundURL from "./assets/warning.mp3";
import { Howl } from "howler";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";

import  Header  from './components/Header';
import  VideoStream  from './components/VideoStream';
import  ProgressBar  from './components/ProgressBar';
import  ControlPanel  from './components/ControlPanel';

const sound = new Howl({ src: [soundURL] });

const NOT_TOUCH_LABEL = "not_touch";
const TOUCHED_LABEL = "touched";
const TRAINING_TIMES = 50;

function App() {
  const video = useRef();
  const classifier = useRef();
  const model = useRef();
  const isRunning = useRef(false);

  const [step, setStep] = useState("train1");
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const init = async () => {
    await setUpCamera();
    model.current = await mobilenet.load();
    classifier.current = knnClassifier.create();
    console.log("Setup Done");
  };

  const setUpCamera = () =>
    new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.current.srcObject = stream;
          video.current.addEventListener("loadeddata", resolve);
        })
        .catch(reject);
    });

  const train = async (label) => {
    setIsTraining(true);
    setProgress(0);
    setStatusText(label === NOT_TOUCH_LABEL ? "Đang train mẫu KHÔNG CHẠM..." : "Đang train mẫu CHẠM MẶT...");

    for (let i = 0; i < TRAINING_TIMES; i++) {
      setProgress(((i + 1) / TRAINING_TIMES) * 100);
      const embedding = model.current.infer(video.current, true);
      classifier.current.addExample(embedding, label);
      await sleep(100);
    }

    setStep(label === NOT_TOUCH_LABEL ? "train2" : "ready");
    setIsTraining(false);
    setStatusText("");
  };

  const run = async () => {
    if (!isRunning.current) return;
    const embedding = model.current.infer(video.current, true);
    const result = await classifier.current.predictClass(embedding);

    if (result.label === TOUCHED_LABEL) {
      sound.play();
    }

    await sleep(200);
    run();
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="main">
      <Header />
      <VideoStream ref={video} />
      {statusText && <p style={{ color: "#fff", marginTop: "16px" }}>{statusText}</p>}
      {isTraining && <ProgressBar progress={progress} />}
      <ControlPanel
        step={step}
        isTraining={isTraining}
        onTrain={(label) => train(label === "not_touch" ? NOT_TOUCH_LABEL : TOUCHED_LABEL)}
        onStart={() => {
          isRunning.current = true;
          run();
        }}
        onStop={() => {
          isRunning.current = false;
        }}
      />
    </div>
  );
}

export default App;
