import { useState, useEffect } from "react";
import { AuthPage } from "../components/auth/AuthPage";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { NotesPage } from "../components/notes/NotesPage";
import { UpgradeModal } from "../components/upgrade/UpgradeModal";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  tenant_slug: string;
  plan: "free" | "pro";
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Initialize database on component mount
  useEffect(() => {
    const initDB = async () => {
      try {
        await fetch('/api/init', { method: 'POST' });
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initDB();
  }, []);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Get tenant info to determine plan
        const tenantResponse = await fetch(`/api/tenants/${userData.tenant_slug}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let plan = 'free';
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          plan = tenantData.subscription_plan;
        }
        
        setUser({
          id: userData.id,
          name: userData.email.split('@')[0],
          email: userData.email,
          role: userData.role === 'member' ? 'user' : userData.role,
          tenant_slug: userData.tenant_slug,
          plan: plan as "free" | "pro"
        });
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get tenant info to determine plan
        const tenantResponse = await fetch(`/api/tenants/${data.user.tenant_slug}`, {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        
        let plan = 'free';
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          plan = tenantData.subscription_plan;
        }
        
        setUser({
          id: data.user.id,
          name: data.user.email.split('@')[0],
          email: data.user.email,
          role: data.user.role === 'member' ? 'user' : data.user.role,
          tenant_slug: data.user.tenant_slug,
          plan: plan as "free" | "pro"
        });
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);
        
        alert("Welcome back! Successfully signed in to your account.");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Invalid credentials");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    setAuthToken(null);
    alert("You have been successfully signed out.");
  };

  const handleUpgrade = async () => {
    if (!user || !authToken) return;
    
    try {
      const response = await fetch(`/api/tenants/${user.tenant_slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, plan: "pro" } : null);
        alert("Welcome to Pro! Your account has been upgraded successfully.");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to upgrade account");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  if (!isAuthenticated || !user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <>
      <DashboardLayout
        user={user}
        onLogout={handleLogout}
        onUpgrade={() => setIsUpgradeModalOpen(true)}
      >
        <NotesPage userPlan={user.plan} authToken={authToken} />
      </DashboardLayout>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default Index;

