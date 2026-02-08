import React, { createContext, useContext, useEffect, useState } from 'react';

import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate checking for persistent session
    useEffect(() => {
        const checkSession = async () => {
            // Simulate delay
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        };
        checkSession();
    }, []);

    const signIn = async (email: string) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setUser({
                id: '123',
                name: 'Test User',
                email,
            });
            setIsLoading(false);
        }, 1500);
    };

    const signUp = async (name: string, email: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setUser({
                id: '123',
                name,
                email,
            });
            setIsLoading(false);
        }, 1500);
    };

    const signOut = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setUser(null);
            setIsLoading(false);
        }, 500);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
