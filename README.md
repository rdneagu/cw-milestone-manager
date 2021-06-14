<br/>
<p align="center">
        <img width="40%" src="https://i.postimg.cc/MHHmnCfX/AppLogo.png" alt="App logo">
</p>
<br/>

# Coursework Scheduling Application
Project for the Web Platform Development 2 module at GCU. 

This is a web-based coursework scheduling application designed to help students cope with multiple coursework assignments. 

The application is built using Node.js, Node Express and Vue.js.

[Sequelize](https://sequelize.org/v5/index.html) is used for the database. Sequelize is an ORM that makes it easier to create and handle queries by using virtual models mapped to the real database.

## Features
* User registration and authentication
* Secure account recovery based on JSON Web Tokens
* Coursework managing:
  * Create, soft delete or modify the coursework
  * List all the completed or in progress courseworks
  * Set a specific deadline
  * Enable or disable sharing
  * Share the coursework using a specific token which can be renewed
  * Make the coursework public or private
  * Add participants to the coursework
  * Change the progress of the coursework to complete or incomplete
  * Manage milestones:
    * Create, delete or modify a milestone
    * Set a specific deadline for each milestone
    * Keep an eye on your performance using the various implemented animated graphs
    * Change the progress of the milestone to complete or incomplete
  
## Demo

Use the app online at https://milestone-manager-production.herokuapp.com/

# Get Started
Assumes local installation of [Node.js](https://nodejs.org/).

Make sure when you install nodejs to check the **"Automatically install the necessary tools"** if you use Windows because Python and Build Tools will be needed. On Debian GNU/Linux you need to install **build-essentials** while on other repositories you need **base-devel**.

## To run the project locally after cloning the repository:
### Project setup
```
npm install
```

#### Compiles and hot-reloads for development
To serve the front-end on http://localhost:8080/ during development use:
```
npm run serve
```

This requires the **web server** (see below) to be running in order for the development server to communicate with the back-end, the reason being that the HTTP requests are proxied through http://localhost:5000/.

If you instead prefer to simulate the production server on your local machine, you should run `npm run build` then proceed with starting the web server. The application will be located at http://localhost:5000/

### Web service start
To start the web server on http://localhost:5000/ use:
```
npm run start now
```

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
