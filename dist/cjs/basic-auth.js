"use strict";
var basicAuth = require('basic-auth');
module.exports = function (username, password) {
    return function (req, res, next) {
        var user = basicAuth(req);
        if (!user || user.name !== username || user.pass !== password) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaWMtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2ljLWF1dGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV0QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsUUFBUSxFQUFFLFFBQVE7SUFDMUMsTUFBTSxDQUFDLFVBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1FBQzVCLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDOUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLEVBQUUsQ0FBQztJQUNULENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyJ9