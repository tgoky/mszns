"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

// Optional: You can use any icon library for the tick icon.

const Accelerate = () => {
  const image = { src: "/backshot.PNG", alt: "Birdy Tasks" };

  // Task state to track completion
  const [tasks, setTasks] = useState([
    {
      id: "twitter",
      title: "Follow us on Twitter",
      description: "Start accelerating with us on X!",
      link: "https://x.com/blockhashlabs",
      buttonText: "Follow on X",
      completed: false,
    },
    {
      id: "telegram",
      title: "Join our Telegram",
      description: "Accelerate with the community on TG",
      link: "https://t.me/monadszns",
      buttonText: "Join Telegram",
      completed: false,
    },
    {
      id: "discord",
      title: "Join our Discord",
      description: "connect, engage and earn roles",
      link: "https://discord.gg/TdX2NaXgP3",
      buttonText: "Join Discord",
      completed: false,
    },
  ]);

  // Simulated verification function
  const verifyTask = (taskId: string) => {
    // Simulate verification (e.g., via an API call to check if the user followed/joined)
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? { ...task, completed: true } : task)));
    }, 1000); // Simulate API delay
  };

  return (
    <div
      className="min-h-screen bg-yellow-500 flex flex-col items-center p-6 
                border-4 border-yellow-700 shadow-[10px_10px_0px_0px_#B45309] 
                hover:shadow-[8px_8px_0px_0px_#B45309] hover:translate-x-[2px] hover:translate-y-[2px] 
                active:shadow-[4px_4px_0px_0px_#B45309] active:translate-x-[4px] active:translate-y-[4px] 
                transition-all"
    >
      <h1
        className="relative text-3xl md:text-4xl font-bold text-white mb-6 font-modak uppercase tracking-wide 
               drop-shadow-[3px_3px_0px_#FACC15] 
               hover:drop-shadow-[2px_2px_0px_#EAB308] transition-all duration-200"
      >
        Accelerate Starter Pack
      </h1>

      {/* Single Rectangle Card */}
      <div className="bg-orange-800 shadow-lg hover:shadow-xl transition rounded-lg overflow-hidden w-full max-w-5xl">
        {/* Single Image */}
        <img src={image.src} alt={image.alt} className="object-cover w-full h-64" />

        {/* Tasks Section */}
        <div className="p-6">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-gray-700 pb-4 last:border-b-0"
            >
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg text-white font-semibold">{task.title}</h3>
                <p className="text-gray-400">{task.description}</p>
              </div>

              {!task.completed ? (
                // If task is not completed
                <Link
                  href={task.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  passHref
                  onClick={() => verifyTask(task.id)} // Trigger verification on click
                >
                  <button
                    className="px-6 py-3 bg-green-500 text-white font-black text-lg rounded-lg
                   border-4 border-green-700 shadow-[6px_6px_0px_0px_#065F46] 
                   hover:bg-red-600 hover:border-red-800 hover:shadow-[4px_4px_0px_0px_#7F1D1D] 
                   hover:translate-x-[2px] hover:translate-y-[2px] 
                   active:shadow-[2px_2px_0px_0px_#7F1D1D] active:translate-x-[4px] active:translate-y-[4px] 
                   transition-all uppercase tracking-widest"
                  >
                    {task.buttonText}
                  </button>
                </Link>
              ) : (
                // If task is completed, show "Done" with a tick
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500 w-6 h-6" />
                  <span className="text-green-500 font-semibold">Done</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accelerate;
