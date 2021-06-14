# How to use the mail service

#### Import the mail functions into your file
```javascript
/* You don't have to specify index.js (./mail/index.js) since JS
   will automatically pick that file if it exists in the folder */
const mail = require('./mail');
```

#### Use the `send` function correctly
```javascript
mail.send({
  user: 'User', // If the user is specified then the mail address will be formatted like "User <destination@gmail.com>"
  email: 'destination@gmail.com',
  subject: 'Title',
  message: '<p style="color: red;">Your message here</p>', // Note: It supports html tags and styling
});
```

###### The result will be:

```
from: Milestone Manager <milestonemanager.noreply@gmail.com>
to: User <destination@gmail.com>
title: Title
message: Your message here (in a red color)
```

#### Note: In case the send function parameters are wrongly formatted and no email or user can be picked by the script, the server console will print an error to let you know
