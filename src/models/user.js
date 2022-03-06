const User = class User {
    constructor (
        id, username, displayName, email, phoneNumber, address, password
    ) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.password = password;
    }
};

module.exports = User;