import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if guest has access code stored
    const guestId = localStorage.getItem('guestId');
    
    if (guestId) {
      navigate('/wedding');
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-xl text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
