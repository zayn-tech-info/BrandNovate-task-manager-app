# Task Manager Frontend

A modern, responsive frontend for the Task Manager application built with React, Tailwind CSS, and other modern web technologies.

## Features

- **Modern UI/UX**: Clean and intuitive interface with a purple/lavender color scheme
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Authentication**: Login, registration, password reset functionality
- **Task Management**: Create, view, edit, and delete tasks
- **Task Organization**: Filter tasks by status, priority, category, and due date
- **Calendar View**: Visualize tasks in a calendar format
- **User Profile**: Update personal information and avatar
- **Settings**: Customize application preferences

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/                    # Source code
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layout components
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   ├── styles/             # CSS and style-related files
│   ├── utils/              # Utility functions and constants
│   ├── App.js              # Main App component
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Project dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Technologies Used

- **React**: Frontend library for building user interfaces
- **React Router**: For navigation and routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: For API requests
- **Chart.js**: For data visualization
- **React Icons**: For icons
- **React Toastify**: For notifications

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Application

1. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```
2. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```
npm run build
```
or
```
yarn build
```

This will create an optimized production build in the `build` folder.

## Connecting to the Backend

By default, the frontend is configured to connect to a backend running at `http://localhost:8080`. You can change this by modifying the `API_URL` constant in `src/utils/constants.js`.

## Color Scheme

The application uses a purple/lavender color scheme:

- Primary: `#a855f7` (Purple)
- Secondary: `#c4b5fd` (Lavender)
- Background: `#ede9fe` (Light Lavender)

These colors can be customized in the `tailwind.config.js` file.

## Browser Support

The application supports all modern browsers, including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.
