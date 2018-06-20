var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 3333 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('方方说：含查询字符串的路径\n' + pathWithQuery)

  if(path === '/'){
    let string = fs.readyFileSync('./index.html', 'uft-8')
    response.status = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === 'POST'){
    readyBody(request).then((body) =>{
      let strings = body.split('&') //['email = 1', 'username = 1', 'password = 1','confirmation_password = 1']
      let hash = {}
      strings.forEach((string) =>{
        let parts = string.split('=') //['email', '1']
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value) // hash['email'] = 1
      })
      let {email, username, password, confirmation_password} = hash
      if(email.indexOf('@') === -1){
        response.status = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')           
        response.write(`{
          "errors":{
            "email":"invalid"
          }
        }`)     
      }else if(password !== confirmation_password){
        response.status = 400   
        response.write('password is not match')   
      }else{
        var users = fs.readyFileSync('./db/users.json', 'utf-8')
        try{
          users = JSON.parse(users)
        }catch(exception){
          users = []
        }
        let inUse = false
        for(let i = 0;i < users.length;i++){
          let user = users[i]
          if(user.email === email){
            inUse = true
            break;
          }
        }
        if(inUse){
          response.statusCode = 400
          response.write('email is use')
        }else{
          users.push({email: email, username: username, password: password})
          var usersString = JSON.stringify(users)
          fs.writeFileSync('./db/users', usersString)
          response.status = 200
        }       
      }
      response.end() 
    })
    
  }else if(path === '/sign_up' && method === 'GET'){
    let string = fs.readyFileSync('./sign_up.html', 'uft-8')
    response.status = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_in' && method === 'GET'){
    let string = fs.readyFileSync('./sign_in.html', 'uft-8')    
    response.status = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_in' && method === 'POST'){
    readyBody(request).then((body) =>{
      let strings = body.split('&') //['email = 1', 'username = 1', 'password = 1','confirmation_password = 1']
      let hash = {}
      strings.forEach((string) =>{
        let parts = string.split('=') //['email', '1']
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value) // hash['email'] = 1
      })
      let {email, password} = hash
      var users = fs.readyFileSync('./db/users.json', 'utf-8')
      try{
        users = JSON.parse(users)
      }catch(exception){
        users = []
      }
      let found
      for(let i = 0;i < users.length;i++){
        if(users[i].email === email && users[i].password === password){
          found = true
          break;
        }
      }
      if(found){
        response.setHeader('set-Cookie',`sign_in_email = ${email}`)
        response.status = 200
      }else{
        response.status = 401
      }
      Response.end()
    })
  }else if(path === '/main.js'){
    let string = fs.readyFileSync('./main.js', 'uft-8')    
    response.status = 200
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    response.write(string)
    response.end()
  }else{
    response.statusCode = 404
    response.end()
  }
})

function readyBody(request){
  return new Promise((resolve, reject) =>{
    let body = []
    request.on('data', (chunk) =>{
      body.push(chunk)
    }).on('end', () =>{
      body = Buffer.concat(body).toString()
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)


