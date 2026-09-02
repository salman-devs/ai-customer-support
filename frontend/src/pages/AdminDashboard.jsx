
import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function AdminDashboard() {
  const { logout } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDocuments = async () => {
    try {
      const response = await api.get("/documents/");
      setDocuments(response.data);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to load documents."
      );
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        `Document "${response.data.filename}" uploaded successfully.`
      );

      setSelectedFile(null);
      event.target.reset();

      await loadDocuments();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Document upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);

      setMessage("Document deleted successfully.");
      setError("");

      await loadDocuments();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to delete document."
      );
    }
  };

  return (
    <div className="admin-dashboard">

      <header>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage customer-support documents</p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </header>

      <main>

        <section className="upload-section">
          <h2>Upload Document</h2>

          <p>
            Supported formats: PDF, DOCX, TXT. Maximum size: 10 MB.
          </p>

          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => {
                setSelectedFile(event.target.files[0]);
              }}
            />

            <button
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}
        </section>

        <section className="documents-section">
          <h2>Documents</h2>

          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <div className="document-list">

              {documents.map((document) => (
                <div
                  className="document-card"
                  key={document.id}
                >
                  <div>
                    <h3>{document.filename}</h3>

                    <p>
                      Type: {document.file_type.toUpperCase()}
                    </p>

                    <p>
                      Size:{" "}
                      {(document.file_size / 1024).toFixed(1)} KB
                    </p>

                    <p>
                      Status:{" "}
                      <strong>{document.status}</strong>
                    </p>

                    {document.error_message && (
                      <p>
                        Error: {document.error_message}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(document.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>
          )}
        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;

