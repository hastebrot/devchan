# devchan

> An image board for programmers.

## Installation

    $ cd devchan
    $ npm install
    npm http GET https://registry.npmjs.org/superagent/0.9.1
    npm http GET https://registry.npmjs.org/mocha/1.4.2
    npm http GET https://registry.npmjs.org/marked/0.2.5
    ...

    $ node seeds Board boards.yml
    Seeding model 'Board' with data from 'boards.yml'...
    { name: 'prog', description: 'prog' }
    { name: 'foo', description: 'foo' }
    { name: 'bar', description: 'bar' }
    { name: 'baz', description: 'baz' }

    $ node server
    Connected to database on port 27017
    Express server listening on port 3789

## Development

    $ npm install nodemon -g
    $ nodemon server.js --watch app --watch node_modules

    $ node shell
