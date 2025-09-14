interface User {
  name: string;
  email: string;
  plan: "free" | "pro";
  role: "admin" | "user";
}

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void;
  onUpgrade: () => void;
}

export const DashboardLayout = ({ user, children, onLogout, onUpgrade }: DashboardLayoutProps) => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #dee2e6", padding: "15px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Multi-Tenant Notes</h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span 
                key={user.plan}
                style={{ 
                  padding: "4px 8px", 
                  backgroundColor: user.plan === "pro" ? "#28a745" : "#6c757d", 
                  color: "white", 
                  borderRadius: "4px", 
                  fontSize: "12px", 
                  fontWeight: "500" 
                }}>
                {user.plan === "pro" ? "Pro" : "Free"}
              </span>
              <span style={{ 
                padding: "4px 8px", 
                backgroundColor: user.role === "admin" ? "#dc3545" : "#17a2b8", 
                color: "white", 
                borderRadius: "4px", 
                fontSize: "12px", 
                fontWeight: "500" 
              }}>
                {user.role === "admin" ? "Admin" : "Member"}
              </span>
              {user.plan === "free" && user.role === "admin" && (
                <button
                  onClick={onUpgrade}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
            
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "500", fontSize: "14px" }}>{user.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{user.email}</div>
            </div>
            
            <button
              onClick={onLogout}
              style={{
                padding: "8px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        {children}
      </div>
    </div>
  );
};

