"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { getTasks, createTask, deleteTask, Task } from "../../api/apiService";

// Using Task interface from apiService

const Page = () => {
  const { isAuthenticated } = useAuth();
  // API URL is now managed in the centralized apiService
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    value: "",
  });

  // Fetch tasks on component mount using centralized API service
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasks = await getTasks();
        setData(tasks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // State for tracking form submission status
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  // Handle adding a new task
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const taskData = {
      name: newTask.name,
      description: newTask.description,
      value: newTask.value,
    };

    try {
      const result = await createTask(taskData);
      console.log("Success:", result);

      // Add the new task to the list with the ID from the response
      setData([...data, { ...newTask, id: result.id }]);
      
      // Reset the form
      setNewTask({ name: "", description: "", value: "" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create task');
      console.error("Error posting data:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteInProgress(id);
    try {
      await deleteTask(id);
      console.log("Task deleted successfully");

      // Remove the deleted task from the list
      setData(data.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error("Error deleting task:", err);
    } finally {
      setDeleteInProgress(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-12">
            Task Manager
          </h1>

          {/* Loading and Error States */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Form to add new task */}
              <div className="flex justify-center">
                <div className="w-full md:w-2/3 lg:w-1/2 bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Add a New Task</h2>
                  {submitError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                      <strong className="font-bold">Error: </strong>
                      <span className="block sm:inline">{submitError}</span>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newTask.name}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium">Description</label>
                      <textarea
                        name="description"
                        value={newTask.description}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        rows={4}
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium">Value</label>
                      <input
                        type="text"
                        name="value"
                        value={newTask.value}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        disabled={submitting}
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300 flex items-center justify-center"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Task'
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Display the items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {data.length > 0 ? (
                  data.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{item.name}</h2>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Description:</span> {item.description}
                      </p>
                      <p className="text-gray-600 mb-4">
                        <span className="font-semibold">Value:</span> {item.value}
                      </p>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition-colors duration-300 flex items-center justify-center min-w-[80px]"
                          disabled={deleteInProgress === item.id}
                        >
                          {deleteInProgress === item.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              <span>...</span>
                            </>
                          ) : (
                            'Delete'
                          )}
                        </button>
                        <Link href={`/tasks/${item.id}`}>
                          <button className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300">
                            Detail
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-xl text-gray-600">No tasks available. Create your first task above!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
