const mongoose=require('mongoose');


mongo_url="mongodb+srv://sanyuktakulkarni5902:12345@clusterroxiller.e1wiw.mongodb.net/Roxiler?retryWrites=true&w=majority&appName=ClusterRoxiller"

mongoose.connect(mongo_url)
.then(()=>{
    console.log("db connection succesful");
}).catch((err)=>{
    console.log("db connection failed", err)
})