"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";

const Page = () => {
  const url = "https://2wjgvjivrf.execute-api.eu-central-1.amazonaws.com/v1"
  const [data, setData] = useState<
    { id: string; name: string; description: string; value: string }[]
  >([]);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    value: "",
  });

  useEffect(() => {
    fetch(
      `${url}/get_function`,
    )
      .then((response) => response.json())
      .then((json) => {
        const transformedData = JSON.parse(json.body);
        setData(transformedData); // Update the state with the fetched data
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const postData = {
      name: newTask.name,
      description: newTask.description,
      value: newTask.value,
    };

    try {
      const response = await fetch(
        `${url}/put_function`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Success:", result);

      // Update the local state to include the new task
      setData([...data, { ...newTask, id: result.id }]);
      setNewTask({ name: "", description: "", value: "" }); // Reset form fields after submission
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-12">
            Task Manager
          </h1>

          {/* Form to add new task */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add a New Task
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
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
                  value={newTask.description}
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
                  value={newTask.value}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
              >
                Add Task
              </button>
            </form>
          </div>

          {/* Display the items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item) => (
              <div
                key={item.id}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {item.name}
                </h2>
                <p className="text-gray-600 mb-2">
                  Description: {item.description}
                </p>
                <p className="text-gray-600">Value: {item.value}</p>
                <button className="mt-6 bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-400 transition-colors duration-300">
                  Delete
                </button>
                <Link href={`/tasks/${item.id}`}>
                  <button className="mt-6 bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-400 transition-colors duration-300">
                    Detail
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
