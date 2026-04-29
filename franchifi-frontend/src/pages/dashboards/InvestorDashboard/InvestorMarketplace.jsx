import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Marketplace from "../../Marketplace";

const InvestorMarketplace = () => {
  const { token } = useAuth();
  const [appliedFranchiseIds, setAppliedFranchiseIds] = useState([]);

  useEffect(() => {
    const fetchAppliedFranchises = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/applications/my-applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const ids = data.map(app => app.franchiseId);
          setAppliedFranchiseIds(ids);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };

    if (token) {
      fetchAppliedFranchises();
    }
  }, [token]);

  return <Marketplace appliedFranchiseIds={appliedFranchiseIds} />;
};

export default InvestorMarketplace;