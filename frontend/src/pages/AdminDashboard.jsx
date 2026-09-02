import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function AdminDashboard() {
  const { user, logout } = useAuth();

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
        `"${response.data.filename}" uploaded successfully.`
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


  const totalDocuments = documents.length;

  const processedDocuments = documents.filter(
    (document) => document.status === "processed"
  ).length;

  const failedDocuments = documents.filter(
    (document) => document.status === "failed"
  ).length;


  return (
    <div className="admin-app">

      {/* Header */}

      <header className="admin-header">

        <div className="admin-brand">

          <div className="brand-icon small">
            ✦
          </div>

          <div>
            <h1>AI Support Admin</h1>

            <p>
              Knowledge base management
            </p>
          </div>

        </div>


        <div className="admin-user">

          <div>
            <strong>
              {user?.name || "Admin"}
            </strong>

            <span>
              Administrator
            </span>
          </div>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </header>


      <main className="admin-content">

        {/* Page heading */}

        <section className="admin-page-heading">

          <div>
            <h2>Dashboard</h2>

            <p>
              Manage the documents used by the AI support assistant.
            </p>
          </div>

        </section>


        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">

            <span className="stat-label">
              Total documents
            </span>

            <strong className="stat-value">
              {totalDocuments}
            </strong>

          </div>


          <div className="stat-card">

            <span className="stat-label">
              Processed
            </span>

            <strong className="stat-value">
              {processedDocuments}
            </strong>

          </div>


          <div className="stat-card">

            <span className="stat-label">
              Failed
            </span>

            <strong className="stat-value">
              {failedDocuments}
            </strong>

          </div>

        </section>


        {/* Upload */}

        <section className="admin-card">

          <div className="card-heading">

            <div>
              <h2>Upload document</h2>

              <p>
                Add support documentation to the AI knowledge base.
              </p>
            </div>

          </div>


          <form
            className="upload-form"
            onSubmit={handleUpload}
          >

            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => {
                setSelectedFile(event.target.files[0]);
                setError("");
                setMessage("");
              }}
            />

            <button
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Processing..." : "Upload document"}
            </button>

          </form>


          <p className="upload-help">
            PDF, DOCX and TXT files • Maximum size: 10 MB
          </p>


          {message && (
            <div className="success-message">
              {message}
            </div>
          )}


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        </section>


        {/* Documents */}

        <section className="admin-card">

          <div className="card-heading">

            <div>
              <h2>Documents</h2>

              <p>
                Documents currently available to the AI assistant.
              </p>
            </div>

          </div>


          {documents.length === 0 ? (

            <div className="empty-documents">
              <div className="empty-icon">
                📄
              </div>

              <h3>No documents yet</h3>

              <p>
                Upload your first support document to build the
                knowledge base.
              </p>
            </div>

          ) : (

            <div className="document-table-wrapper">

              <table className="document-table">

                <thead>

                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>


                <tbody>

                  {documents.map((document) => (

                    <tr key={document.id}>

                      <td>

                        <div className="document-name">

                          <div className="file-icon">
                            📄
                          </div>

                          <div>
                            <strong>
                              {document.filename}
                            </strong>

                            <span>
                              Document #{document.id}
                            </span>
                          </div>

                        </div>

                      </td>


                      <td>
                        {document.file_type.toUpperCase()}
                      </td>


                      <td>
                        {(document.file_size / 1024).toFixed(1)} KB
                      </td>


                      <td>

                        <span
                          className={`status-badge ${document.status}`}
                        >
                          {document.status}
                        </span>

                      </td>


                      <td>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(document.id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default AdminDashboard;