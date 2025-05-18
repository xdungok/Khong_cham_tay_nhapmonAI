import React from "react";

const ControlPanel = ({ step, isTraining, onTrain, onStart, onStop }) => {
  return (
    <div className="control">
      {step === "train1" && (
        <button className="btn" onClick={() => onTrain("not_touch")} disabled={isTraining}>
          {isTraining ? "Đang Train 1..." : "Train 1"}
        </button>
      )}

      {step === "train2" && (
        <button className="btn" onClick={() => onTrain("touched")} disabled={isTraining}>
          {isTraining ? "Đang Train 2..." : "Train 2"}
        </button>
      )}

      {step === "ready" && (
        <>
          <button className="btn" onClick={onStart}>Start</button>
          <button className="btn" onClick={onStop}>Stop</button>
        </>
      )}
    </div>
  );
};

export default ControlPanel;
