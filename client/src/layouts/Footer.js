import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="main-footer">
      <span>&copy; 2024. Clickso. All Rights Reserved.</span>
      <span>Created by: <Link target="_blank">Crims & Trojan</Link></span>
    </div>
  )
}