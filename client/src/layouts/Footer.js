import React, { useState } from "react";
import CrimsTrojanLogo from "../assets/img/CrimsTrojanLogo.png";

export default function Footer() {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const imgStyle = {
    width: '100px',
    height: 'auto',
    borderRadius: '50%', // Adding this to create rounded corners
  };

  return (
    <div className="main-footer">
    
    </div>
  );
}