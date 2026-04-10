import { useEffect, useState } from "react";
import { getSignsByLesson } from "../api/signs";
import AddSignForm from "../components/AddSignForm";

export default function LessonSignsPage({ lessonId }) {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSigns = async () => {
    try {
      setLoading(true);
      const data = await getSignsByLesson(lessonId);
      setSigns(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load signs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSigns();
  }, [lessonId]);

  return (
    <div style={{ padding: "24px" }}>
      <h2>Lesson Signs</h2>

      <AddSignForm lessonId={lessonId} onCreated={fetchSigns} />

      {loading ? (
        <p>Loading signs...</p>
      ) : error ? (
        <p>{error}</p>
      ) : signs.length === 0 ? (
        <p>No signs added yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {signs.map((sign) => (
            <div
              key={sign.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
                background: "#fff",
              }}
            >
              {sign.imageUrl ? (
                <img
                  src={sign.imageUrl}
                  alt={sign.word}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    background: "#f2f2f2",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#777",
                  }}
                >
                  No image
                </div>
              )}

              <h3 style={{ margin: "0 0 8px" }}>{sign.word}</h3>
              <p style={{ margin: "0 0 8px", color: "#444" }}>{sign.meaningUz}</p>

              {sign.description && (
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                  {sign.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}