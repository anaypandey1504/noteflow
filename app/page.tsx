'use client';

import { useState, useEffect } from "react";
import { AuthPage } from "@/components/auth/AuthPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { NotesPage } from "@/components/notes/NotesPage";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  tenant_slug: string;
  plan: "free" | "pro";
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

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
          name: userData.email.split('@')[0], // Use email prefix as name
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
          name: data.user.email.split('@')[0], // Use email prefix as name
          email: data.user.email,
          role: data.user.role === 'member' ? 'user' : data.user.role,
          tenant_slug: data.user.tenant_slug,
          plan: plan as "free" | "pro"
        });
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Login failed",
          description: errorData.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    setAuthToken(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const handleUpgrade = async () => {
    if (!user || !authToken) return;
    
    // Mock payment confirmation
    if (!confirm("Confirm payment of ₹2,000 to upgrade to Pro plan?")) return;
    
    try {
      const response = await fetch(`/api/tenants/${user.tenant_slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Immediately update user state to Pro
        setUser(prevUser => ({
          ...prevUser!,
          plan: "pro"
        }));
        
        // Force component re-render
        setRefreshKey(prev => prev + 1);
        
        toast({
          title: "Payment Successful!",
          description: "Your account has been upgraded to Pro. Enjoy unlimited notes!",
        });
        
        // Reload page to ensure all components reflect the change
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        const errorData = await response.json();
        toast({
          title: "Upgrade failed",
          description: errorData.error || "Failed to upgrade account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (!isAuthenticated || !user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div key={refreshKey}>
      <DashboardLayout
        user={user}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
      >
        <NotesPage userPlan={user.plan} authToken={authToken} />
      </DashboardLayout>
    </div>
  );
}