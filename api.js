

// const user = fetch("http://localhost:3001/users");

// const userData = user.then((res) => res.json());
//  json-server --watch db.json --port 3001

// console.log(JSON.stringify(userData));
async function getUserData() {
  const user = await fetch("http://localhost:3001/users");
  const userData = await user.json();
  //console.log(JSON.stringify(userData));
  return userData;
}

// Await the function call itself
const users = await getUserData(); 
console.log(JSON.stringify(users));


users.map(
    user => {
      console.log(user);
      
        
    }
)


