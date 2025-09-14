import { useState } from "react";

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(email, password);
    setIsLoading(false);
  };

  const testAccounts = [
    { email: "admin@acme.test", role: "Admin", tenant: "Acme" },
    { email: "user@acme.test", role: "Member", tenant: "Acme" },
    { email: "admin@globex.test", role: "Admin", tenant: "Globex" },
    { email: "user@globex.test", role: "Member", tenant: "Globex" },
  ];

  const fillTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("password");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "#f5f5f5" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Multi-Tenant Notes</h1>
          <p style={{ color: "#666" }}>Sign in to access your notes</p>
        </div>

        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                width: "100%", 
                padding: "12px", 
                backgroundColor: "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                fontSize: "16px", 
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "15px", fontSize: "16px", fontWeight: "600" }}>Test Accounts</h3>
          <p style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>Click to auto-fill (password: "password")</p>
          
          {testAccounts.map((account, index) => (
            <div
              key={index}
              onClick={() => fillTestAccount(account.email)}
              style={{ 
                padding: "10px", 
                border: "1px solid #eee", 
                borderRadius: "4px", 
                marginBottom: "8px", 
                cursor: "pointer",
                backgroundColor: "#fafafa"
              }}
            >
              <div style={{ fontWeight: "500", fontSize: "14px" }}>{account.email}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{account.tenant} • {account.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
