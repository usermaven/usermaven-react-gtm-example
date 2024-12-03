import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, dbService } from '../services/db';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize IndexedDB
    dbService.init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await dbService.login(email, password);
      if (user) {
        setUser(user);
        // Trigger GTM user_identify event
        window.dataLayer?.push({
          event: 'user_identify',
          usermaven_event: {
            name: 'user_identify',

            user_name: user.name,
            id: user.id?.toString(),
            email: user.email,
            created_at: user.created_at,
            custom: {
              plan: 'free',
            }
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const newUser = await dbService.createUser({ email, password, name });
      setUser(newUser);
      // Trigger GTM signed_up event
      window.dataLayer?.push({
        event: 'signed_up',
        usermaven_event: {
          name: 'signed_up',

          user_name: newUser.name,
          id: newUser.id?.toString(),
          email: newUser.email,
          created_at: newUser.created_at,
          custom: {
            plan: 'free',
          }
        }
      });

      // Also identify the user after signup
      window.dataLayer?.push({
        event: 'user_identify',
        usermaven_event: {
          name: 'user_identify',

          user_name: newUser.name,
          id: newUser.id?.toString(),
          email: newUser.email,
          created_at: newUser.created_at,
          custom: {
            plan: 'free',
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
