import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [inviteData, setInviteData] = useState(null);
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const token = searchParams.get("token");

    // ================= VERIFY TOKEN ON LOAD =================
    useEffect(() => {
        if (!token) {
            setError("Invalid invite link");
            setLoading(false);
            return;
        }

        axios
            .post(`${API_URL}/api/public/invites/verify`, { token })
            .then((res) => {
                setInviteData(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Invite link is invalid or expired");
                setLoading(false);
            });
    }, [token]);

    // ================= ACCEPT INVITE =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${API_URL}/api/public/invites/accept`, {
                token,
                full_name: fullName,
                password,
            });

            setSuccess(true);

            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.detail || "Failed to accept invite");
        }
    };

    if (loading) return <div className="p-10 text-center">Verifying invite...</div>;
    if (error) return <div className="p-10 text-red-600 text-center">{error}</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

                {!success ? (
                    <>
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            Accept Invitation
                        </h2>

                        <p className="text-sm text-gray-500 mb-4">
                            Invited as: <b>{inviteData?.email}</b>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full border p-3 rounded-lg"
                            />

                            <input
                                type="password"
                                placeholder="Create Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border p-3 rounded-lg"
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-lg"
                            >
                                Create Account
                            </button>

                        </form>
                    </>
                ) : (
                    <div className="text-center text-green-600 font-semibold">
                        Account created successfully! Redirecting to login...
                    </div>
                )}

            </div>
        </div>
    );
};

export default AcceptInvite;
