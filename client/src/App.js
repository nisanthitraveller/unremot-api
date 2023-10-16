// client/src/App.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios('/api/data');
      setData(result.data);
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 className="my-5">Data from API</h1>
      <ul className="list-group">
        {data.map(item => (
          <li className="list-group-item" key={item.id}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
