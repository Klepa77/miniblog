let form = document.getElementById('login-form')
form.addEventListener('submit',function(e){
    e.preventDefault()
    let mail=document.getElementById('email').value
    let password= document.getElementById('password').value
    auth.signInWithEmailAndPassword(mail , password)
    .then(()=>{
        window.location.href='index.html'
    })

})