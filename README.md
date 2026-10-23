# MediCart – Cloud-Based Online Pharmacy Ordering and Inventory Management System

MediCart is a full-stack web application designed to simplify online pharmacy ordering and inventory management. Customers can browse medicines, search products, manage their shopping cart, place orders, and track order status. Administrators can manage products, monitor inventory, and process customer orders.

The project demonstrates full-stack web development and cloud deployment using containerization and cloud hosting.

## 🌐 Live Demo

**[Visit MediCart – Live Application](https://medicart-pharmacy-system.onrender.com)**

## 📂 GitHub Repository

**[View Source Code on GitHub](https://github.com/muthukoornandini/medicart-pharmacy-system)**

## ✨ Features

### Customer Features
- Browse medicines and view product details.
- Search medicines and filter by category.
- Register and log in securely.
- Add medicines to the shopping cart.
- Place orders with delivery details.
- View order history and order status.
- Cancel eligible pending orders.

### Administrator Features
- Add, update, and delete medicine products.
- Manage inventory and stock availability.
- View and manage customer orders.
- Update order status.
- Monitor dashboard statistics.

### Cloud and Deployment Features
- Containerized application using Docker.
- Cloud deployment through Render.
- Public access through a hosted web URL.
- React frontend and Node.js backend served by the application.

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| API | REST API |
| Containerization | Docker |
| Cloud Hosting | Render |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

```text
Customer / Administrator
          |
          v
    React Frontend
          |
          v
    Express REST API
          |
          v
   Application Data Store
          |
          v
    Docker Container
          |
          v
     Render Cloud
```

## ⚙️ Run the Project Locally

### Prerequisites
- Node.js and npm
- Git
- Visual Studio Code (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/muthukoornandini/medicart-pharmacy-system.git
cd medicart-pharmacy-system
```

### 2. Install dependencies and build the frontend

```bash
npm run setup
```

### 3. Configure environment variables

Set a strong, private `JWT_SECRET` environment variable before running the application. Do not commit secrets to GitHub.

### 4. Start the application

```bash
npm start
```

Open **http://localhost:5000** in your browser.

## ☁️ Cloud Deployment

MediCart is deployed on Render using Docker. The deployment process builds the frontend, packages the application, and runs the Node.js server in the cloud.

- **Live application:** https://medicart-pharmacy-system.onrender.com
- **Source repository:** https://github.com/muthukoornandini/medicart-pharmacy-system

**Note:** Persistent cloud database storage should be configured and verified separately if the application needs to retain orders, users, and inventory across service restarts or redeployments.

## 🎯 Project Objectives

- Demonstrate cloud hosting and application deployment.
- Develop a full-stack online ordering application.
- Implement authentication and role-based access.
- Provide basic medicine catalogue and inventory management.
- Demonstrate REST API integration and Docker-based deployment.

## 🔮 Future Enhancements

- Integrate a managed cloud database such as PostgreSQL.
- Add automated backups and persistent data storage.
- Implement prescription verification workflows.
- Add email or SMS order notifications.
- Improve audit logging, monitoring, and security.
- Add automated testing and CI/CD workflows.

## 🔐 Disclaimer

MediCart is an educational project intended for demonstration purposes. It is not a substitute for a licensed pharmacy service. Real-world deployment would require appropriate prescription verification, regulatory compliance, privacy safeguards, and secure handling of customer information.

## 👩‍💻 Developer

**Muthukoornandini**

GitHub: [@muthukoornandini](https://github.com/muthukoornandini)

---

*Built to demonstrate full-stack development, containerization, and cloud deployment.*
