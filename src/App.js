import React from "react";
import Start from "./components/Start";
import Quiz from "./components/Quiz";
import { DataProvider } from "./context/dataContext";

function App() {
  return (
    <DataProvider>
      <div className="obscurus spinnerHolder" id="spinnerHolder">
        <div className="spinner" id="spinner"></div>
      </div>
      {/* Welcome Page */}
      <Start />

      {/* Quiz Page */}
      <Quiz />
    </DataProvider>
  );
}

export default App;
