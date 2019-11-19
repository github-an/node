// 连接 mysql 数据库 
var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'nodedb',
})

connection.connect()


//  ------ 引入 URL 模块
const url = require("url")

// -------  引入 http 模块
const http = require("http")

// 引入 qs 模块：qs 是对路径进行 json 化或者将 json 转换为 string 路径
const qs = require("querystring");

// ---- 用http模块创建服务

// req 获取 URL 信息
// res 浏览器返回相应信息
http.createServer(function (req,res) {

    // 设置跨域
    res.setHeader("Access-Control-Allow-Origin","*");

    res.setHeader("Access-Control-Allow-Headers",'Conten-Type');

    // 跨域允许的请求方式
    res.setHeader('Content-Type','application/json');

    if (req.method === "POST") {

        let  pathName = req.url;

        // 接收发送过来的参数
        let tempResult = "";

        req.addListener("data",function (chunk) {
            tempResult += chunk;
        })

        // 数据接收完成
        req.addListener("end",function () {
            var result = JSON.stringify(qs.parse(tempResult));
            
            if (pathName === "/sendMessage") {  // 提交留言信息
                result = JSON.parse(result);
                let username =  result.username;
                let useid =  result.userid;
                let usermessage =  result.message;
                let time = getNowFormatDate()
                
                let addSql = "INSERT INTO messages(useid,username,usermessage,time) VALUES(?,?,?,?)"; 
                let addSqlParams = [result.userid, result.username,result.message,time];

                connection.query(addSql,addSqlParams,function (errM,resM) {
                    if (errM) {
                        console.log(errM,"留言失败")
                    }else{
                        console.log("留言成功");
                        res.write(JSON.stringify({
                            code:'0',
                            message:'留言成功！'
                        }))
                        res.end();
                        
                    }
                })
                


            }else if (pathName === "/login"){ // 登陆
                result = JSON.parse(result);
                // 新增的 SQL 语句及新增的字段信息
                let username =  result.username;
                let password =  result.password;

                let readSql = "SELECT * FROM user";

                connection.query(readSql,function (errL,respL) {

                    let newRes = JSON.parse(JSON.stringify(respL))
                    let id = "";

                     let nameRepeat = false

                     for (let index in newRes) {
                         if (newRes[index].username === username && newRes[index].password === password){
                            nameRepeat = true;   
                            useid = newRes[index].useid
                         }
                     }

                     if (nameRepeat) {
                         res.write(JSON.stringify({
                            code:'0',
                            message:"登陆成功！",
                            data:{
                                userName:username,
                                id:useid
                            }

                        }))
                        res.end();
                     }else{
                         res.end("错了")
                     }

                })


            }else if (pathName == "/register") { // 注册
                result = JSON.parse(result);
                // 新增的 SQL 语句及新增的字段信息
                let username =  result.username;
                let password =  result.password;
                let time = getNowFormatDate();


            new Promise((resolve,reject)=>{

                let readSql = "SELECT * FROM user";   

                connection.query(readSql,function (errR,respR) {

                    // 去掉存储表数据带的外壳
                    let  newRes = JSON.parse(JSON.stringify(respR))

                    // 名字不能重复
                    let nameRepeat = false;
                    for (let item in newRes) {
                        if (newRes[item].username === username) nameRepeat = true;  
                        
                    }

                    if (nameRepeat) {
                        res.end("注册失败，名字重复")
                    }else{
                    resolve() // 可以注册 
                    }
                })
           
            }).then(()=>{

                let addSql = "INSERT INTO user(username,password,time) VALUES(?,?,?)"; 
                let addSqlParams = [result.username, result.password,time];
    
                  // 连接 SQL 并实施语句
                connection.query(addSql,addSqlParams, function (err2, respon) {
                    if (err2) {
    
                        console.log("新增错误：");
                        console.log(err2);
                        return;
                    } else {
                        console.log("新增成功：");
                        res.write(JSON.stringify({
                            code: "0",
                            message: "注册成功！"
                        }));
                
                        // 结束响应
                        res.end();
                
                    }
                });
            })





           }

        })
    }else if(req.method == "GET"){
        let paramsObj = url.parse(req.url,true)
        
        let pathName = paramsObj.pathname;

        req.query = paramsObj.query;

        

       if (pathName == "/getMessage") { // 获取留言信息
            // 接收发送过来的参数
            let userid = req.query.userid;

            console.log(userid,"来了");
            

            let readSql = `SELECT * FROM messages WHERE useid = ${userid}`

            connection.query(readSql,function (err2,resm) {
                if (err2) {
                    throw err2;
                    
                }else{
                    let newRes = JSON.parse(JSON.stringify(resm));
                    res.write(JSON.stringify({
                        code:"1",
                        message:'查询成功！',
                        data:newRes
                    }))

                    res.end()
                    
                }
            })
         
        
           
       }else if(pathName == "/"){  // 首页
         
       res.writeHead(200,{

        "Content-Type":"text/html;chartset=UTF-8"
       })

       res.write('<h1 style="text-align:center">Hello NodeJs </h1>')

       res.end()
       }
    }  
    

}).listen(3000);



// 获取当前时间
 function getNowFormatDate() {
     var date = new Date();
     var year = date.getFullYear();
     var month = date.getMonth() + 1;
     var strDate = date.getDate();
     var hour = date.getHours();
     var minute = date.getMinutes();
     var second = date.getSeconds();
     if (month >= 1 && month <= 9) {
         month = "0" + month
     }
     if (strDate >= 0 && strDate <= 9) {
         strDate = "0" + strDate;
     }

     var  currentdate = year + "-" + month + "-" + strDate + " " + hour + ":" + minute + ":" + second;
     return currentdate;
     
 }