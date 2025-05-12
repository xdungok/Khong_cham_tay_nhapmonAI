import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import soundURL from "./assets/warning.mp3";
import { Howl } from "howler";
import * as tf from "@tensorflow/tfjs";

const mobilenet = require("@tensorflow-models/mobilenet");
const knnClassifier = require("@tensorflow-models/knn-classifier");

const sound = new Howl({
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

  const [step, setStep] = useState("train1"); // train1 -> train2 -> ready
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const init = async () => {
    console.log("init...");
    await setUpCamera();
    console.log("OK");

    model.current = await mobilenet.load();
    classifier.current = knnClassifier.create();

    console.log("Setup Done");
    console.log("Không chạm tay lên mặt và bấm Train 1");
  };

  const setUpCamera = () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozgetUserMedia ||
        navigator.msGetUserMedia;

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
    setIsTraining(true);
    setProgress(0);
    setStatusText(
      label === NOT_TOUCH_LABEL
        ? "Đang train mẫu KHÔNG CHẠM..."
        : "Đang train mẫu CHẠM MẶT..."
    );

    for (let i = 0; i < TRAINING_TIMES; i++) {
      setProgress(((i + 1) / TRAINING_TIMES) * 100);
      await training(label);
    }

    if (label === NOT_TOUCH_LABEL) setStep("train2");
    else if (label === TOUCHED_LABEL) setStep("ready");

    setIsTraining(false);
    setStatusText("");
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
      sound.play();
    }

    await sleep(200);
    run();
  };

  const sleep = (ms = 0) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    init();
    return () => {};
  }, []);

  return (
    <div className="main">
      <h2 style={{ marginBottom: "16px" }}>🧠 AI Touch Detection</h2>
      <video ref={video} className="video" autoPlay></video>

      {statusText && <p style={{ color: "#fff", marginTop: "16px" }}>{statusText}</p>}

      {isTraining && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="control">
        {step === "train1" && (
          <button
            className="btn"
            onClick={() => train(NOT_TOUCH_LABEL)}
            disabled={isTraining}
          >
            {isTraining ? "Đang Train 1..." : "Train 1"}
          </button>
        )}

        {step === "train2" && (
          <button
            className="btn"
            onClick={() => train(TOUCHED_LABEL)}
            disabled={isTraining}
          >
            {isTraining ? "Đang Train 2..." : "Train 2"}
          </button>
        )}

        {step === "ready" && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
