import React from "react";
import {useState, useEffect} from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import HeaderMobile from "./HeaderMobile";


export default function Main() {

  const offsets = ["/apps/file-manager", "/apps/email", "/apps/calendar"];
  const { pathname } = useLocation();
  const bc = document.body.classList;



  (offsets.includes(pathname)) ? bc.add("sidebar-offset") : bc.remove("sidebar-offset");

  bc.remove("sidebar-show");

  window.scrollTo(0, 0);

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header/> 
      <Sidebar />
      <Header />
      <Outlet />
    </React.Fragment>
  )
}