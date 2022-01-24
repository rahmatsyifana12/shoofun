const fs = require('fs');

const dirPath = './data';
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

const dataPath = 'data/users.json';
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

const loadUsers = () => {
    const fileBuffer = fs.readFileSync('data/users.json', 'utf-8');
    const users = JSON.parse(fileBuffer);

    return users;
};

const saveUsers = (users) => {
    fs.writeFileSync('data/users.json', JSON.stringify(users, null, 4));
}

const addUser = (user) => {
    const users = loadUsers();
    users.push(user);
    saveUsers(users);
}

const userAlreadyExist = (username, email) => {
    const users = loadUsers();

    return users.find((user) => user.username === username || user.email === email);
}

const findUser = (usernameOrEmail) => {
    const users = loadUsers();

    return users.find((user) => user.username === usernameOrEmail || user.email === usernameOrEmail);
}

module.exports = { addUser, userAlreadyExist, findUser };