const User = class User {
    constructor (id, username, displayName, email, phoneNumber, password) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
    }
};

module.exports = User;