interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal = ({ isOpen, onClose, onUpgrade }: UpgradeModalProps) => {
  if (!isOpen) return null;

  const handleUpgrade = async () => {
    onUpgrade();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "500px"
      }}>
        <h2 style={{ margin: "0 0 20px 0", textAlign: "center" }}>Upgrade to Pro</h2>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ 
            fontSize: "48px", 
            fontWeight: "bold", 
            color: "#007bff",
            marginBottom: "10px" 
          }}>
            ₹2,000
          </div>
          <div style={{ fontSize: "16px", color: "#666" }}>One-time upgrade fee</div>
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Free Plan (Current)</h3>
          <ul style={{ margin: "0 0 20px 0", paddingLeft: "20px" }}>
            <li>Maximum 3 notes</li>
            <li>Basic features</li>
          </ul>
          
          <h3 style={{ margin: "0 0 10px 0", color: "#007bff" }}>Pro Plan</h3>
          <ul style={{ margin: "0 0 20px 0", paddingLeft: "20px", color: "#007bff" }}>
            <li>Unlimited notes</li>
            <li>All premium features</li>
            <li>Priority support</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Pay ₹2,000 & Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};

