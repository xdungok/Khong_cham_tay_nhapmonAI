import React from "react";

const VideoStream = React.forwardRef((props, ref) => {
  return <video ref={ref} className="video" autoPlay></video>;
});

export default VideoStream;
