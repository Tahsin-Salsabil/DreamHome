'use strict';
var debug = require('debug')('my express app');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const oracledb = require('oracledb');
require('dotenv').config({ path: 'db.env' });



var routes = require('./routes/index');
var users = require('./routes/users');

const app = express();
const port = 4001;

oracledb.autoCommit = true;

app.post('/hireStaff', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            connectString: process.env.DB_CS
        });

        const { staffno, fname, lname, position, sex, dob, salary, branchNo, telephone, mobile, email } = req.body;
        await connection.execute(
            `CALL Staff_hire_sp(:staffno, :fname, :lname, :position, :sex, TO_DATE(:dob, 'YYYY-MM-DD'), :salary, :branchNo, :telephone, :mobile, :email)`,
            [staffno, fname, lname, position, sex, dob, salary, branchNo, telephone, mobile, email],
        );

        res.json({ message: 'Staff hired successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error hiring staff' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});








// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
