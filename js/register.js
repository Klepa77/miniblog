let form = document.getElementById('signup-form')
form.addEventListener('submit',function(e){
    e.preventDefault()
    let mail = document.getElementById('email').value
    let password1 = document.getElementById('password1').value
    let password2 = document.getElementById('password2').value
    if(!isvalidPassword(password1)){
        alert('Пароль должен содержать минимум 1 -заглавную, 1-строчную букву и 1-число ')
    }
    if(password1!=password2){
        alert('Пароли не совпадают')
    }
    auth.createUserWithEmailAndPassword(mail,password1)
    .then(credentials=>{
         return db.collection('users').doc(credentials.user.uid)
        .set({email:mail})
        .then(()=>{
            form.reset()
            window.location.href='login.html'
        })
        .catch((error)=>{
            console.log(error.message)
        })
        
    })
    .catch((error)=>{
        console.log(error.message)
    })
})

function isvalidPassword(password){
    if(password.length<6){
        return false
    }
    if(password.search(/[0-9]/)<0){
        return false
    }
    if(password.search(/[A-Z]/)<0){
        return false
    }
    if(password.search(/[a-z]/)<0){
        return false
    }
    return true
}
