import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-100 p-8">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] flex flex-col items-center justify-center text-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-white mb-6">Welcome to Our Awesome Platform</h1>
          <p className="text-lg text-gray-200 mb-8">Task Manager.</p>
          <a
            href="#features"
            className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Features Section */}
      {/* <div id="features" className="z-10 w-full max-w-6xl items-center justify-between font-sans text-lg lg:flex py-16">
        <div className="grid text-center lg:grid-cols-4 gap-8 w-full">
          <a
            href="https://nextjs.org/docs"
            className="group rounded-lg border border-transparent p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-4 text-2xl font-semibold text-indigo-800">
              Docs <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
            </h2>
            <p className="m-0 text-gray-600">Find in-depth information about Next.js features and API.</p>
          </a>

          <a
            href="https://nextjs.org/learn"
            className="group rounded-lg border border-transparent p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-4 text-2xl font-semibold text-indigo-800">
              Learn <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
            </h2>
            <p className="m-0 text-gray-600">Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://vercel.com/templates"
            className="group rounded-lg border border-transparent p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-4 text-2xl font-semibold text-indigo-800">
              Templates <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
            </h2>
            <p className="m-0 text-gray-600">Explore starter templates for Next.js.</p>
          </a>

          <a
            href="https://vercel.com/new"
            className="group rounded-lg border border-transparent p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-4 text-2xl font-semibold text-indigo-800">
              Deploy <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
            </h2>
            <p className="m-0 text-gray-600">Instantly deploy your Next.js site to a shareable URL with Vercel.</p>
          </a>
        </div>
      </div> */}

      {/* Footer Section */}
      <footer className="w-full py-8 bg-indigo-800 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </main>
  );
}
