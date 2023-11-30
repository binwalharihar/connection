const MongoClient=require("mongodb").MongoClient;
const readline = require("readline");
const Table = require("cli-table");
const {ObjectId}=require("mongodb");

const url="mongodb://localhost:27017";
const dbName="test";
const collectionName="dtest";

const rl =readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});

function takeinput(){
    return new Promise((resolve,reject)=>{
        rl.question("enter name : ",(name)=>{
            rl.question("enter age : ",(age)=>{
                rl.question("enter email : ",(email)=>{
                    rl.question("enter salary : ",(salary)=>{
                        age=parseInt(age);
                        if(!(age>=18&&age<=100)){
                            console.log("invalid age");
                            reject();
                            return;
                        }
                        if(email.length>50){
                            console.log("invalid email");
                            reject();
                            return;
                        }
                        if(salary<10000){
                            console.log("invalid salary");
                            reject();
                            return;
                        }

                        resolve({name,age,email,salary});
                    });
                });
            });
        });
    });
}

async function savedata(name,age,email,salary){
  const client=new MongoClient(url);
  try{
    await client.connect();
    const db=client.db(dbName);
    const collection=db.collection(collectionName);

    await collection.insertOne({name,age,email,salary});
  } finally{
    await client.close();
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
            head:["ID","name","age","email","salary"],
            colWidths:[24,20,5,25,15],
        });
         records.forEach((record)=>{
            const idString=
            record._id instanceof ObjectId ? record._id.toString():record._id;
             table.push([idString,record.name,record.age,record.email,record.salary]);
         });
         console.log(table.toString());
     }else{
        console.log("no records found");
     }
    }catch(error){
        console.log("error is : ",error);
    } finally{
      await client.close();
    } 
}

async function main() {
    try {
        const input = await takeinput();
        await savedata(input.name, input.age, input.email, input.salary);
        await display();
    } finally {
        rl.close();
    }
}

main();