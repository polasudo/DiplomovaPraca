"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // useParams for dynamic routing
import Navbar from "../../../../components/Navbar";

const Page = () => {
  const { id } = useParams(); // Get the 'id' from the URL
  const [prevTask, setPrevTask] = useState({ name: "", description: "", value: "" });
  const [task, setTask] = useState({ name: "", description: "", value: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch task details using centralized API service
  useEffect(() => {
    if (id) {
      const fetchTaskDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const { getTaskById } = await import('../../../api/apiService');
          const taskData = await getTaskById(id as string);
          
          if (taskData) {
            setPrevTask(taskData); // Set previous task data to state
            setTask(taskData); // Set task data to state
          } else {
            setError("Task not found");
            console.error("Task not found");
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch task details');
          console.error("Error fetching task data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTaskDetails();
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
    setError(null);

    try {
      // Build the update payload, ensuring 'id' is included
      const updatePayload = {
        id: id as string, // Send the task ID for the update
        name: task.name,
        description: task.description,
        value: task.value,
      };

      const { updateTask } = await import('../../../api/apiService');
      const result = await updateTask(updatePayload);
      console.log("Task updated successfully:", result);
      
      // Update the prevTask state with the new values
      setPrevTask(result);
      
      // Show success message
      setSuccessMessage("Task updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
      console.error("Error updating task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-12 mt-10">
            Task Detail
          </h1>
          <div className="flex justify-center">
            <div className="w-1/2 bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h2>
              
              {/* Success message */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold">Name</label>
                  <h1 className="text-black block">Previous name: {prevTask.name}</h1>
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
                  <label className="block text-gray-700 font-bold">Description</label>
                  <h1 className="text-black block">Previous description: {prevTask.description}</h1>
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
                  <label className="block text-gray-700 font-bold">Value</label>
                  <h1 className="text-black block">Previous value: {prevTask.value}</h1>
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
