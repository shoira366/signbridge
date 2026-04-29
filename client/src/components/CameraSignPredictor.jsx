import { useEffect, useRef, useState } from "react";

const CameraSignPredictor = ({
  question,
  disabled = false,
  onPredictionResult,
}) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [prediction, setPrediction] = useState(null);
    const [cameraStream, setCameraStream] = useState(null);

    useEffect(() => {
        const attachStream = async () => {
            if (!isCameraOn || !cameraStream || !videoRef.current) return;

            try {
            videoRef.current.srcObject = cameraStream;
            await videoRef.current.play();
            } catch (error) {
            console.error("Failed to attach/play video:", error);
            setCameraError("Unable to display camera stream");
            }
        };

        attachStream();
    }, [isCameraOn, cameraStream]);

    useEffect(() => {
        const handleExternalStop = (event) => {
            if (event.detail?.questionId === question?.id) {
            stopCamera();
            }
        };

        window.addEventListener("stop-camera-sign-predictor", handleExternalStop);

        return () => {
            window.removeEventListener("stop-camera-sign-predictor", handleExternalStop);
        };
    }, [question]);

    const startCamera = async () => {
    try {
        setCameraError("");

        if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
        });

        streamRef.current = stream;
        setCameraStream(stream);
        setIsCameraOn(true);
    } catch (error) {
        console.error(error);
        setCameraError("Unable to access camera");
    }
    };

    const stopCamera = () => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }

    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setIsCameraOn(false);
    };

  const captureFrameAndPredict = async () => {
    if (!videoRef.current || !question) return;

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const res = await fetch("http://localhost:8001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();

      const normalized = {
        label: data.stable_label || data.label || "",
        rawLabel: data.label || "",
        confidence: data.confidence ?? 0,
        handDetected: !!data.hand_detected,
      };

      setPrediction(normalized);

      if (onPredictionResult) {
        onPredictionResult(question, normalized);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

  // const captureAndPredict = async () => {
  //   if (!videoRef.current || !!isCameraOn) return;
    
  //   setIsDetecting(true);
    
  //   try {
  //     const canvas = document.createElement("canvas");
  //     canvas.width = videoRef.current.videoWidth || 640;
  //     canvas.height = videoRef.current.videoHeight || 480;
  //     const ctx = canvas.getContext("2d");
  //     ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
  //     // Send as data URL (already correct format)
  //     const image = canvas.toDataURL("image/jpeg", 0.8);
      
  //     // Get or create session ID
  //     let sessionId = localStorage.getItem("camera_session_id");
  //     if (!sessionId) {
  //       sessionId = Date.now().toString();
  //       localStorage.setItem("camera_session_id", sessionId);
  //     }
      
  //     const response = await fetch("http://localhost:8001/predict", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ 
  //         image: image,
  //         session_id: sessionId 
  //       }),
  //     });
      
  //     const data = await response.json();
      
  //     if (data.error) {
  //       console.error("Prediction error:", data.error);
  //       return;
  //     }
      
  //     onPredictionResult(data);
      
  //   } catch (error) {
  //     console.error("Prediction failed:", error);
  //   } finally {
  //     setIsDetecting(false);
  //   }
  // };

  useEffect(() => {
    if (!isCameraOn || disabled) return;

    intervalRef.current = setInterval(() => {
      captureFrameAndPredict();
    }, 600);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isCameraOn, disabled, question]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gap: "14px",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "14px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "14px",
          alignItems: "start",
        }}
      >
        {/* <div>
          {question?.sign?.imageUrl ? (
            <img
              src={question.sign.imageUrl}
              alt={question.sign.word}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "220px",
                borderRadius: "12px",
                background: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              No reference image
            </div>
          )}

          <div style={{ marginTop: "10px", fontWeight: 700 }}>
            Show this sign:
          </div>
          <div style={{ color: "#0f172a" }}>
            {question?.sign?.word || question?.correctAnswer || "Linked sign"}
          </div>
        </div> */}

        <div
            style={{
                width: "100%",
                minHeight: "220px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                textAlign: "center",
            }}
        >
            <div
                style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#64748b",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                }}
            >
                Show the sign for
            </div>

            <div
                style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.2,
                }}
            >
                {question?.sign?.meaningUz || question?.sign?.word || question?.correctAnswer || "Unknown"}
            </div>

            {question?.sign?.word && question?.sign?.meaningUz && (
                <div
                style={{
                    marginTop: "10px",
                    color: "#64748b",
                    fontSize: "0.95rem",
                }}
                >
                Letter: {question.sign.word}
                </div>
            )}
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
            <div
            style={{
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#0f172a",
                minHeight: "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
            {isCameraOn ? (
                <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: "100%",
                    height: "260px",
                    objectFit: "cover",
                    display: "block",
                    background: "#000",
                    transform: "scaleX(-1)",
                }}
                />
            ) : (
                <div style={{ color: "#cbd5e1" }}>Camera is off</div>
            )}
            </div>

          {cameraError && (
            <div style={{ color: "#dc2626", fontWeight: 600 }}>
              {cameraError}
            </div>
          )}

          <div className="actions-row">
            {isCameraOn ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
                disabled={disabled}
              >
                Stop Camera
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={startCamera}
                disabled={disabled}
              >
                Start Camera
              </button>
            )}
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>
              ML Prediction
            </div>

            <div style={{ color: "#334155" }}>
              Predicted:
              <strong style={{ marginLeft: "6px" }}>
                {prediction?.label || "—"}
              </strong>
            </div>

            <div style={{ color: "#64748b", marginTop: "4px" }}>
              Confidence:
              <strong style={{ marginLeft: "6px" }}>
                {prediction?.confidence != null
                  ? `${Math.round(prediction.confidence * 100)}%`
                  : "—"}
              </strong>
            </div>

            <div style={{ color: "#64748b", marginTop: "4px" }}>
              Hand:
              <strong style={{ marginLeft: "6px" }}>
                {prediction?.handDetected ? "Detected" : "Not detected"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraSignPredictor;