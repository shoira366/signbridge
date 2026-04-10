import { useState } from "react";
import { createSign } from "../api/signs";

export default function AddSignForm({ lessonId, onCreated }) {
  const [word, setWord] = useState("");
  const [meaningUz, setMeaningUz] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("word", word);
      formData.append("meaningUz", meaningUz);
      formData.append("description", description);
      formData.append("order", order);

      if (image) {
        formData.append("image", image);
      }

      await createSign(lessonId, formData);

      setWord("");
      setMeaningUz("");
      setDescription("");
      setOrder("");
      setImage(null);
      setPreview("");

      onCreated?.();
    } catch (err) {
      console.error(err);
      setError("Failed to create sign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
        background: "#fff",
      }}
    >
      <h3>Add Sign</h3>

      <input
        type="text"
        placeholder="Word / letter"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
        required
      />

      <input
        type="text"
        placeholder="Meaning (Uz)"
        value={meaningUz}
        onChange={(e) => setMeaningUz(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="number"
        placeholder="Order"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "block", marginBottom: "12px" }}
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{
            width: "160px",
            height: "160px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        />
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Create Sign"}
      </button>
    </form>
  );
}