"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import Accelerate from "./Accelerate"; // Import the Accelerate component

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 bg-black text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal

  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(burgerMenuRef, useCallback(() => setIsDrawerOpen(false), []));
  useOutsideClick(profileMenuRef, useCallback(() => setIsProfileOpen(false), []));

  return (
    <div className="sticky lg:static bg-yellow-500 top-0 navbar bg-base-200 min-h-0 flex-shrink-0 justify-between z-20 border-b-2 border-base-100 px-0 sm:px-2 py-4">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen((prevIsOpenState) => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-6 h-6">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="./logo.svg" />
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      {/* Center Menu for Modal */}
      <div className="navbar-center">
        <button
          className="btn btn-primary text-white bg-orange-500 font-bold px-6 py-2 rounded-full"
          onClick={() => setIsModalOpen(true)}
        >
          Click for Accelerate Starter Pack!
        </button>
      </div>
      <div className="navbar-end flex-grow mr-4 flex items-center space-x-4">
        <div className="relative" ref={profileMenuRef}>
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setIsProfileOpen((prev) => !prev)}
          >
            <UserCircleIcon className="h-8 w-8" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-500 rounded-lg shadow-lg p-4 z-30 border border-green-500">
              <div className="flex flex-col items-center justify-center mb-4 border-b border-green-500 pb-4">
                <RainbowKitCustomConnectButton />
              </div>
              <div className="flex flex-col items-center justify-center pt-4"></div>
            </div>
          )}
        </div>
        <FaucetButton />
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <Accelerate /> {/* Render the Accelerate component */}
          </div>
        </div>
      )}
    </div>
  );
};
