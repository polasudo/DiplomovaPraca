"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // useParams for dynamic routing
import Navbar from "../../../../components/Navbar";

const Page = () => {
  const url = "https://2odiv1ixc0.execute-api.eu-central-1.amazonaws.com/v1";
  const { id } = useParams(); // Get the 'id' from the URL
  const [task, setTask] = useState({ name: "", description: "", value: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch task details using GET request on page load
  useEffect(() => {
    if (id) {
      fetch(`${url}/get_task/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          if (json) {
            setTask(json); // Set task data to state
          } else {
            console.error("Task not found");
          }
          setIsLoading(false); // Disable loading state
        })
        .catch((error) => {
          console.error("Error fetching task data:", error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Build the update payload, ensuring 'id' is included
      const updatePayload = {
        id: id, // Send the task ID for the update
        name: task.name,
        description: task.description,
        value: task.value,
      };

      const response = await fetch(`${url}/update_task`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload), // Send updated task data in the body
      });

      if (!response.ok) {
        throw new Error("Failed to update the task");
      }

      const result = await response.json();
      console.log("Task updated successfully:", result);

      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating task:", error);
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-12">
            Task Detail
          </h1>
          <div className="flex justify-center">
            <div className="w-1/2 bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={task.name}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Description</label>
                  <textarea
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Value</label>
                  <input
                    type="text"
                    name="value"
                    value={task.value}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>
                <button
                  type="submit"
                  className={`mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300 ${
                    isUpdating ? "opacity-50" : ""
                  }`}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Task"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
