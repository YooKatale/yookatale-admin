import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import Sidenav from "./Sidenav";
import Navbar from "./Navbar";
import AdminDashboard from './AdminDashboard'; ///dashboard component
import Notifications from './Notifications'; //notifications component
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const socket = io('http://localhost:4400'); 

const App = () => {
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('updateData', (newData) => {
      setData((prevData) => [...prevData, newData]);
    });

    socket.on('newNotification', (newNotification) => {
      setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
    });

    return () => {
      socket.off('connect');
      socket.off('updateData');
      socket.off('newNotification');
    };
  }, []);

  return (
    <Router>
      <div>
        <Navbar />
        <Sidenav />
        <Switch>
          <Route path="/dashboard">
            <AdminDashboard data={data} />
          </Route>
          <Route path="/notifications">
            <Notifications notifications={notifications} />
          </Route>
          <Route path="/" exact>
            <AdminDashboard data={data} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
