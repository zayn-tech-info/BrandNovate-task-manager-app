

# task_manager_app


The README file will include:

1. A brief project description --
    
    A full-stack task management web application with user authentication. Built using React, Node.js, Express.js, and MongoDB, with JWT for secure authentication.

2. Features -- 

    ✅ User authentication (JWT-based)

    ✅ Create, update, delete, and manage task
    
    ✅ User-specific task management

    ✅ Responsive UI with React

    ✅ RESTful API with Express.js & MongoDB

3. Tech stack --

    Frontend: React.js

    Backend: Node.js, Express.js

    Database: MongoDB
    
    Authentication: JWT

4. Project structure --

This project is organized into two main directories:

frontend/: Contains the React frontend application

backend/: Contains the Node.js/Express backend API

4. Installation and setup instructions -- 

    Prerequisites:
    Ensure you have the following installed:

    #Node.js

    #MongoDB (local or cloud-based)

    npm or yarn

5. How to run the app locally --
    
    Clone the repository:

    https://github.com/MuntasirAraf14/task_manager_app.git
    cd task_manager_app

    Navigate to the backend folder:

        cd backend

    Install dependencies:

        npm install

    Create a .env file and add the following:

        PORT=5000

        MONGO_URI=your_mongodb_connection_string

        JWT_SECRET=your_jwt_secret

    Start the backend server:

        npm run dev

    Navigate to the frontend folder:

        cd ../frontend

    Install dependencies:

        npm install

    Start the React development server:

        npm start

    The backend will run on http://localhost:5000.

    The frontend will run on http://localhost:3000.

    Open the browser and go to http://localhost:3000 to access the application.
