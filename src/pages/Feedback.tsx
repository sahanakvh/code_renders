import React from "react";

const Feedback: React.FC = () => {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <p className="mb-4">Share your feedback with us!</p>
      <textarea
        className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
        placeholder="Type your feedback here..."
      />
    </div>
  );
};

export default Feedback;
