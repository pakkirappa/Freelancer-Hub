import "./App.css";

function App() {
  return (
    <div
      className="container mx-auto 
    grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid cols-4 gap-4 px-2 py-2 
    "
    >
      <div className="max-w-sm rounded overflow-hidden shadow-lg">
        <img
          className="w-full h-64 object-cover object-center rounded
          shadow-md hover:shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 cursor-pointer hover:opacity-50 
          "
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
          alt="random"
        />
        <div className="px-6 py-4">
          <div className="font-bold text-purple-500 text-xl mb-2">
            Photo by John Doe
          </div>
          <ul>
            <li>
              <strong>Views: </strong>4000
            </li>
            <li>
              <strong>Downloads: </strong>300
            </li>
            <li>
              <strong>Likes: </strong>400
            </li>
          </ul>
        </div>
        <div className="px-6 py-4">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
            #tag1
          </span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
            #tag2
          </span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
            #tag3
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
