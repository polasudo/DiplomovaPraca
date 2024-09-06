"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../../components/Navbar";

const Page = () => {
  const router = useRouter();
  const { id } = router.query; // Extract task ID from the URL
  const [task, setTask] = useState({ name: "", description: "", value: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch task details using POST request on page load
  useEffect(() => {
    if (id) {
      fetch(
        "https://ow522u3m10.execute-api.eu-central-1.amazonaws.com/v1/get_example_lambda_try_part",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }), // Send the 'id' in the body
        }
      )
        .then((response) => response.json())
        .then((json) => {
          setTask(json); // Set task data to state
          setIsLoading(false); // Disable loading state
        })
        .catch((error) => console.error("Error fetching task data:", error));
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
        id: id, // Make sure the 'id' is sent in the update request
        name: task.name,
        description: task.description,
        value: task.value,
      };

      const response = await fetch(
        "https://ow522u3m10.execute-api.eu-central-1.amazonaws.com/v1/update_task",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload), // Send updated task data in the body
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the task");
      }

      const result = await response.json();
      console.log("Task updated successfully:", result);

      setIsUpdating(false);
      // Optionally redirect to the main page or show a success message
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
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={task.name}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={task.description}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
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
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
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
    </>
  );
};

export default Page;
