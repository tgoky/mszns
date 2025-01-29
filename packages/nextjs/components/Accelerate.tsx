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
      link: "https://t.me/yourtelegram",
      buttonText: "Join Telegram",
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
    <div className="min-h-screen bg-yellow-500 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-white mb-8 font-modak">Accelerate Starter Pack</h1>

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
                  <button className="bg-green-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">
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
