import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

export default function PageFour() {
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [uploadedImageURL, setUploadedImageURL] = useState(null);

  useEffect(() => {
    // Fetch the latest uploaded image URL from Firestore
    const fetchImage = async () => {
      const imagesRef = db.collection("images");
      const snapshot = await imagesRef
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();
      console.log("Snapshot:", snapshot); // Add this line
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        console.log("Doc data:", doc.data()); // Add this line
        setUploadedImageURL(doc.data().url);
      }
    };

    fetchImage();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Upload the file to firebase storage
        const storageRef = storage.ref();
        const fileRef = storageRef.child(file.name);
        console.log("Uploading file:", file.name); // Add this line
        await fileRef.put(file);

        // Get the download URL
        const downloadURL = await fileRef.getDownloadURL();
        console.log("Download URL:", downloadURL); // Add this line

        // Set the state
        setBackgroundImage(downloadURL);
      } catch (error) {
        // Log the error to the console
        console.error("Error uploading file:", error);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("backgroundImage:", backgroundImage); // Add this line
    console.log(gameName, gameDescription, backgroundImage, uploadedImageURL);
    if (
      !gameName ||
      !gameDescription ||
      !backgroundImage ||
      !uploadedImageURL
    ) {
      alert("Please fill all the fields and upload the images.");
      return;
    }

    // Create a new document with the image URL and other data
    await db.collection("projects").add({
      gameName,
      gameDescription,
      backgroundImage, // this is now a download URL from Firebase storage
      uploadedImage: uploadedImageURL,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <h1 style={{ color: "white" }}>Game Details</h1>
      <input
        style={{ marginBottom: "20px" }}
        placeholder="Game name"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
      />
      <textarea
        style={{ marginBottom: "20px" }}
        placeholder="Game description"
        value={gameDescription}
        onChange={(e) => setGameDescription(e.target.value)}
      />
      <input
        type="file"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="bg-image-upload"
        accept="image/jpeg, image/png"
      />
      <label
        htmlFor="bg-image-upload"
        style={{
          cursor: "pointer",
          padding: "50px",
          marginTop: "20px",
          border: "5px dashed #888",
          borderRadius: "5px",
          backgroundColor: "transparent",
          textAlign: "center",
        }}
      >
        <FontAwesomeIcon icon={faUpload} size="5x" color="#888" />
        <p style={{ fontSize: "1.2rem", color: "white" }}>
          Click to upload background image
        </p>
      </label>
      {backgroundImage && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            margin: "1rem",
          }}
        >
          <img
            src={backgroundImage}
            alt="Uploaded"
            style={{
              maxWidth: "100%",
              transition: "transform 1s ease-out",
            }}
          />
        </div>
      )}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
