
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory.
// This means that files like 'styl.css' (in public/css) and 'app.js' (in public/js)
// will be accessible directly via their paths (e.g., /css/styl.css, /js/app.js).
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the root URL ('/').
// When a GET request is made to the root, this callback function will be executed.
app.get('/', (req, res) => {
    // Render the 'index.ejs' file.
    // Assuming your posture detection EJS code is saved as 'index.ejs' inside the 'views' folder.
    // The second argument can be an object containing data to pass to the EJS template,
    // but in this case, the template doesn't require any dynamic data from the server.
    res.render('index.ejs');
});

// Start the server and make it listen for incoming requests on the specified port.
app.listen(PORT, () => {
    // Log a message to the console once the server has successfully started.
    console.log(`Server is running ${PORT}`);

});
