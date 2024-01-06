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
      <span>&copy; 2024. <a href="https://clickso.com.tr/tr" target="_blank" rel="noopener noreferrer">Clickso</a>. All Rights Reserved.</span>
      <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} font>
        {isHovering ? null : (
          <>
            Created By : <a href="">Crims & Trojan</a>
          </>
        )}
      </span>
      {isHovering && <img src={CrimsTrojanLogo} alt="Crims & Trojan Logo" style={imgStyle} onMouseLeave={handleMouseLeave} />}
    </div>
  );
}