import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CanvasList() {
  const [userName, setUserName] = useState("");
  const [canvases, setCanvases] = useState([]);
  const [error, setError] = useState("");
  const [canvasName, setCanvasName] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [selectedCanvasId, setSelectedCanvasId] = useState(null);
  const [selectedCanvasName, setSelectedCanvasName] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCanvases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("https://whiteboard-ftu8.onrender.com/canvas/list", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch canvases");
        }

        setUserName(data.userName || "User");
        setCanvases(Array.isArray(data.canvases) ? data.canvases : []);
      } catch (err) {
        setError(err.message);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchCanvases();
  }, [navigate]);

  const handleCreateCanvas = async () => {
    if (!canvasName.trim()) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://whiteboard-ftu8.onrender.com/canvas/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: canvasName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create canvas");
      }

      setCanvases((prevCanvases) => [...prevCanvases, data]);
      setCanvasName("");

      navigate(`/canvas/${data._id}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const openDeleteConfirmation = (canvas, event) => {
    event.stopPropagation();
    setSelectedCanvasId(canvas._id);
    setSelectedCanvasName(canvas.name);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedCanvasId(null);
    setSelectedCanvasName("");
  };

  const confirmDeleteCanvas = async () => {
    if (!selectedCanvasId) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`https://whiteboard-ftu8.onrender.com/canvas/delete/${selectedCanvasId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete canvas");
      }

      setCanvases((prevCanvases) => prevCanvases.filter((canvas) => canvas._id !== selectedCanvasId));
      closeDeleteModal();
    } catch (error) {
      setError(error.message);
      closeDeleteModal();
    }
  };

  const handleShareClick = (canvasId, event) => {
    event.stopPropagation();
    setSelectedCanvasId(canvasId);
    setShareEmail("");
    setShareStatus("");
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedCanvasId(null);
    setShareEmail("");
    setShareStatus("");
  };

  const handleShareCanvas = async () => {
    if (!shareEmail.trim() || !selectedCanvasId) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`https://whiteboard-ftu8.onrender.com/canvas/share/${selectedCanvasId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shared: shareEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to share canvas");
      }

      setShareStatus("Canvas shared successfully!");
      setTimeout(() => {
        closeShareModal();
      }, 2000);
    } catch (error) {
      setShareStatus(`Error: ${error.message}`);
    }
  };

  const handleCanvasClick = (canvasId) => {
    navigate(`/canvas/${canvasId}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.welcomeMessage}>Welcome Back, {userName}! 👋</h1>
        <p style={styles.subtitle}>Manage and create your canvas projects</p>
      </div>

      <div style={styles.createContainer}>
        <input
          type="text"
          placeholder="Enter canvas name"
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          style={styles.inputField}
        />
        <button
          style={canvasName.trim() ? styles.createButton : styles.createButtonDisabled}
          onClick={handleCreateCanvas}
          disabled={!canvasName.trim()}
        >
          <span style={styles.createButtonIcon}>➕</span> Create New Canvas
        </button>
      </div>

      <div style={styles.divider}></div>

      <h2 style={styles.sectionTitle}>Your Canvases</h2>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.canvasGrid}>
        {canvases.length > 0 ? (
          canvases.map((canvas) => (
            <div key={canvas._id} style={styles.canvasItem}>
              <div style={styles.canvasCard}>
                <div 
                  style={styles.canvasContent}
                  onClick={() => handleCanvasClick(canvas._id)}
                >
                  <div style={styles.canvasIcon}>🎨</div>
                  <div style={styles.canvasName}>{canvas.name}</div>
                </div>
                <div style={styles.buttonActions}>
                  <button
                    style={styles.shareActionButton}
                    onClick={(event) => handleShareClick(canvas._id, event)}
                    title="Share Canvas"
                  >
                    <span style={styles.actionButtonText}>Share</span>
                  </button>
                  <button
                    style={styles.deleteActionButton}
                    onClick={(event) => openDeleteConfirmation(canvas, event)}
                    title="Delete Canvas"
                  >
                    <span style={styles.actionButtonText}>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📝</div>
            <p style={styles.emptyStateText}>No canvases found. Create your first canvas to get started!</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Share Canvas</h3>
              <button style={styles.closeButton} onClick={closeShareModal}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>Enter the email of the user you want to share this canvas with:</p>
              <input
                type="email"
                placeholder="Email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                style={styles.modalInput}
              />
              {shareStatus && <p style={shareStatus.includes("Error") ? styles.error : styles.success}>{shareStatus}</p>}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={closeShareModal}>
                Cancel
              </button>
              <button 
                style={shareEmail.trim() ? styles.shareButton : styles.shareButtonDisabled} 
                onClick={handleShareCanvas}
                disabled={!shareEmail.trim()}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.warningTitle}>⚠️ Delete Canvas</h3>
              <button style={styles.closeButton} onClick={closeDeleteModal}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>Are you sure you want to delete "<strong>{selectedCanvasName}</strong>"?</p>
              <p style={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={closeDeleteModal}>
                Cancel
              </button>
              <button 
                style={styles.deleteButton} 
                onClick={confirmDeleteCanvas}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    backgroundColor: "#1e1e2e",
    color: "#e2e2e2",
    fontFamily: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  },
  header: {
    marginBottom: "25px",
  },
  welcomeMessage: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#89b4fa",
    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    color: "#a6adc8",
    fontSize: "16px",
    margin: "0",
  },
  createContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "30px",
  },
  inputField: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    width: "250px",
    backgroundColor: "#313244",
    color: "#e2e2e2",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
    outline: "none",
    transition: "all 0.3s ease",
  },
  createButton: {
    padding: "12px 20px",
    backgroundColor: "#89b4fa",
    color: "#1e1e2e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  createButtonDisabled: {
    padding: "12px 20px",
    backgroundColor: "#45475a",
    color: "#a6adc8",
    border: "none",
    borderRadius: "8px",
    cursor: "not-allowed",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  },
  createButtonIcon: {
    fontSize: "18px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#45475a",
    margin: "20px 0 30px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "25px",
    color: "#cdd6f4",
    textAlign: "left",
    paddingLeft: "10px",
  },
  error: {
    color: "#f38ba8",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center",
    padding: "10px",
    backgroundColor: "rgba(243, 139, 168, 0.1)",
    borderRadius: "6px",
  },
  success: {
    color: "#a6e3a1",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center",
    padding: "10px",
    backgroundColor: "rgba(166, 227, 161, 0.1)",
    borderRadius: "6px",
  },
  canvasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  canvasItem: {
    transition: "transform 0.3s ease",
  },
  canvasCard: {
    width: "100%",
    height: "180px",
    padding: "20px",
    backgroundColor: "#313244",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "500",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    color: "#e2e2e2",
    position: "relative",
    overflow: "hidden",
  },
  canvasContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    flex: "1",
    paddingBottom: "10px",
    cursor: "pointer",
  },
  canvasIcon: {
    fontSize: "32px",
    marginBottom: "5px",
  },
  canvasName: {
    fontSize: "16px",
    fontWeight: "600",
    wordBreak: "break-word",
    maxWidth: "100%",
  },
  buttonActions: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "auto",
    padding: "0 2px",
  },
  shareActionButton: {
    flex: "1",
    marginRight: "4px",
    padding: "8px 0",
    backgroundColor: "rgba(137, 180, 250, 0.2)",
    color: "#89b4fa",
    border: "1px solid #89b4fa",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "36px",
  },
  deleteActionButton: {
    flex: "1",
    marginLeft: "4px",
    padding: "8px 0",
    backgroundColor: "rgba(243, 139, 168, 0.1)",
    color: "#f38ba8",
    border: "1px solid #f38ba8",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "36px",
  },
  actionButtonText: {
    display: "inline-block",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    width: "400px",
    backgroundColor: "#1e1e2e",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    animation: "fadeInUp 0.3s",
    border: "1px solid #45475a",
  },
  modalHeader: {
    padding: "15px 20px",
    borderBottom: "1px solid #45475a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    margin: "0",
    color: "#cdd6f4",
    fontSize: "18px",
    fontWeight: "600",
  },
  warningTitle: {
    margin: "0",
    color: "#f38ba8",
    fontSize: "18px",
    fontWeight: "600",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#a6adc8",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    transition: "all 0.2s",
  },
  modalBody: {
    padding: "20px",
  },
  modalText: {
    color: "#cdd6f4",
    marginBottom: "15px",
  },
  modalInput: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #45475a",
    borderRadius: "8px",
    backgroundColor: "#313244",
    color: "#e2e2e2",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s",
  },
  modalFooter: {
    padding: "15px 20px",
    borderTop: "1px solid #45475a",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancelButton: {
    padding: "10px 16px",
    backgroundColor: "#45475a",
    color: "#cdd6f4",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  shareButton: {
    padding: "10px 16px",
    backgroundColor: "#89b4fa",
    color: "#1e1e2e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  shareButtonDisabled: {
    padding: "10px 16px",
    backgroundColor: "#45475a",
    color: "#a6adc8",
    border: "none",
    borderRadius: "8px",
    cursor: "not-allowed",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  deleteButton: {
    padding: "10px 16px",
    backgroundColor: "#f38ba8",
    color: "#1e1e2e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  warningText: {
    color: "#f38ba8",
    fontStyle: "italic",
    fontSize: "14px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    backgroundColor: "#313244",
    borderRadius: "10px",
    gridColumn: "1 / -1",
  },
  emptyStateIcon: {
    fontSize: "40px",
    marginBottom: "20px",
    opacity: "0.7",
  },
  emptyStateText: {
    color: "#a6adc8",
    fontSize: "16px",
    textAlign: "center",
    maxWidth: "400px",
    margin: "0 auto",
  },
};

export default CanvasList;