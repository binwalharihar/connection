const MongoClient=require("mongodb").MongoClient;
const readline=require("readline");
const Table=require("cli-table");
const {ObjectId}=require("mongodb");

const url="mongodb://localhost:27017";
const dbName="test";
const collectionName="dtest";

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});

function takeinput() {
    return new Promise((resolve, reject) => {
        let name, age, email, salary; 

        const getEmail = () => {
            rl.question("enter email : ", async (userEmail) => {
                email = userEmail; 

                if (!email || email.length === 0) {
                    console.log("Email cannot be empty. Please enter a valid email.");
                    getEmail();
                } else {
                    try {
                        const isEmailUnique = await checkEmailUniqueness(email);
                        if (isEmailUnique) {
                            resolve({ name, age, email, salary });
                        } else {
                            console.log("Email already exists. Please enter a unique email.");
                            getEmail();
                        }
                    } catch (error) {
                        console.error("Error checking email uniqueness:", error);
                        reject();
                    }
                }
            });
        };

        rl.question("enter name : ", (userName) => {
            name = userName;

            rl.question("enter age : ", (userAge) => {
                age = parseInt(userAge, 10);
                if (isNaN(age) || !(age >= 18 && age <= 100)) {
                    console.log("Invalid age. Please enter a valid integer age between 18 and 100.");
                    reject();
                    return;
                }

                rl.question("enter salary : ", (userSalary) => {
                    salary = parseInt(userSalary, 10);
                    if (isNaN(salary) || salary < 10000) {
                        console.log("Invalid salary. Please enter a valid salary.");
                        reject();
                        return;
                    }
                    
                        getEmail();
                });
            });
        });
    });
}

async function updatesalary(salary){
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

      const result = await collection.updateMany({},{$inc:{salary:5000}});
    } finally {
        await client.close();
    }
}

function calculation(salary){
    return salary+5000;
}

async function checkEmailUniqueness(email) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Check if the email already exists in the database
        const existingUser = await collection.findOne({ email });
        return !existingUser; // If existingUser is null, email is unique
    } finally {
        await client.close();
    }
}

async function savedata(name,age,email,salary){
    const client=new MongoClient(url);
    try{
        await client.connect();
        const db=client.db(dbName);
        const collection=db.collection(collectionName);

        await collection.insertOne({name,age,email,salary});
    }finally{
      await  client.close();
    }
}

async function display(){
    const client=new MongoClient(url);
    try{
        await client.connect();
        const db=client.db(dbName);
        const collection=db.collection(collectionName);

       const records=await collection.find().toArray();
       if(records.length>0){
        const table=new Table({
            head:["ID","Name","Age","Email","Salary"],
            colWidths:[24,20,5,30,15],
        });
        records.forEach((record)=>{
            const idString=
            record._id instanceof ObjectId ? record._id.toString() : record._id;
             table.push([idString,record.name,record.age,record.email,record.salary]);
        });
        console.log(table.toString());
       }else{
        console.log("record not found");
       }
    }finally{
        client.close();
    }
}

async function sortdisplay(){
    const client=new MongoClient(url);
    try{
        await client.connect();
        const db=client.db(dbName);
        const collection=db.collection(collectionName);

       const records=await collection.find().sort({salary:1}).toArray();
       if(records.length>0){
        const table=new Table({
            head:["ID","Name","Age","Email","Salary"],
            colWidths:[24,20,5,30,15],
        });
        records.forEach((record)=>{
            const idString=
            record._id instanceof ObjectId ? record._id.toString() : record._id;
             table.push([idString,record.name,record.age,record.email,record.salary]);
        });
        console.log(table.toString());
       }else{
        console.log("record not found");
       }
    }finally{
        client.close();
    }
}

async function main(){
    try{
        const input=await takeinput();
        await savedata(input.name,input.age,input.email,input.salary);
        await display();
        const ans= calculation(input.salary);
        await updatesalary(input.salary);
        await sortdisplay();
    }finally{
        rl.close();
    }
}

main();
