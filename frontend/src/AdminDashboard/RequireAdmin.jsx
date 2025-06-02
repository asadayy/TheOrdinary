import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function RequireAdmin({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setIsAdmin(false);
            return;
        }
        fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
                setLoading(false);
            })
            .catch(() => {
                setIsAdmin(false);
                setLoading(false);
                setError('Failed to fetch user info');
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!isAdmin) return <Navigate to="/admin/not-authorized" replace />;
    return children;
}

export default RequireAdmin;