import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAdminAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AuthProvider');
    }
    return context;
};
