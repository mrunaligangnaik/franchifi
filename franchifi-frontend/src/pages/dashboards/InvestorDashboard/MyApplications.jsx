import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiClock, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import {
    coffee,
    restaurant,
    retail,
    fitness,
    beauty,
    education,
    automotive,
} from "../../../assets";

const statusColor = (status) => {
    if (status === "approved") return "#16a34a";
    if (status === "under_review") return "#dc2626";
    return "#fbbf24";
};

const statusTextColor = (status) => {
    if (status === "submitted" || !status) return "#000000";
    return "#ffffff";
};

const MyApplications = () => {
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Image map for local assets
    const imageMap = {
        "coffee.jpg": coffee,
        "restaurant.jpg": restaurant,
        "retail.jpg": retail,
        "fitness.jpg": fitness,
        "beauty.jpg": beauty,
        "education.jpg": education,
        "automotive.jpg": automotive,
    };

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchApplications = async () => {
            try {
                console.log("Fetching applications...");
                const res = await axios.get(
                    "http://localhost:5000/api/applications/my",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log("Applications received:", res.data);
                setApplications(res.data);
            } catch (err) {
                console.error("Error fetching applications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [token]);

    if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
    if (applications.length === 0) return <p style={{ padding: 24 }}>No applications found !!</p>;

    const submittedCount = applications.length;
    const underReviewCount = applications.filter((a) => a.status === "under_review").length;
    const approvedCount = applications.filter((a) => a.status === "approved").length;

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 16 }}>Application Status</h2>

            {/* STATUS CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                    marginBottom: 32,
                }}
            >
                <StatusCard title="Applications Submitted" count={submittedCount} icon={<FiFileText size={22} />} />
                <StatusCard title="Under Review" count={underReviewCount} icon={<FiClock size={22} />} />
                <StatusCard title="Approved" count={approvedCount} icon={<FiCheckCircle size={22} />} />
            </div>

            <h2 style={{ marginBottom: 16 }}>My Applications</h2>

            {/* APPLICATION CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 20,
                }}
            >
                {applications.map((app) => {
                    // ✅ FIX: Use stored franchise data from application
                    const franchiseName = app.franchiseName || "Unknown Franchise";

                    // ✅ FIX: Map the image filename to the imported asset
                    const franchiseImage = app.franchiseImage
                        ? (imageMap[app.franchiseImage] || app.franchiseImage)
                        : "https://via.placeholder.com/400x180?text=No+Image";

                    const franchiseLocation = app.franchiseLocation || app.preferredLocation || "Not specified";
                    const status = app.status || "submitted";

                    console.log(`Application ${app._id}:`, {
                        franchiseName,
                        franchiseImage: app.franchiseImage,
                        mappedImage: franchiseImage,
                        franchiseLocation,
                        status
                    });

                    return (
                        <div
                            key={app._id}
                            style={{
                                background: "#fff",
                                borderRadius: 12,
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div style={{ position: "relative" }}>
                                <img
                                    src={franchiseImage}
                                    alt={franchiseName}
                                    style={{
                                        width: "100%",
                                        height: 180,
                                        objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                        console.error("Image failed to load:", franchiseImage);
                                        e.target.src = "https://via.placeholder.com/400x180?text=No+Image";
                                    }}
                                />

                                {/* STATUS BADGE */}
                                <span
                                    className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${app.status === "approved"
                                            ? "bg-green-500 text-white"
                                            : app.status === "rejected"
                                                ? "bg-red-500 text-white"
                                                : app.status === "shortlisted"
                                                    ? "bg-blue-500 text-white"
                                                        : "bg-white text-black"
                                        }`}
                                >
                                    {app.status?.replace("_", " ").toUpperCase()}
                                </span>


                            </div>

                            <div style={{ padding: 16 }}>
                                <h3>{franchiseName}</h3>
                                <p style={{ fontSize: 14, color: "#6b7280" }}>📍 {franchiseLocation}</p>

                                <button
                                    onClick={() => navigate(`/dashboard/investor/applications/${app._id}`)}
                                    style={{
                                        marginTop: 12,
                                        width: "100%",
                                        padding: "8px 0",
                                        borderRadius: 6,
                                        fontSize: 12,
                                        background: "#fff",
                                        color: "#000",
                                        border: "1px solid #e5e7eb",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#000";
                                        e.target.style.color = "#fff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#fff";
                                        e.target.style.color = "#000";
                                    }}
                                >
                                    View Application
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatusCard = ({ title, count, icon }) => (
    <div
        style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}
    >
        <div>
            <p style={{ fontSize: 14, color: "#6b7280" }}>{title}</p>
            <h2>{count}</h2>
        </div>
        <div style={{ color: "#6b7280" }}>{icon}</div>
    </div>
);

export default MyApplications;