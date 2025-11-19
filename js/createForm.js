let form = document.querySelector('#form-main')
form.addEventListener('submit',function(e){
    e.preventDefault()

    let title = form.querySelector('#title').value
    let textmesage = form.querySelector('#short_description').value
    let fullDescription = form.querySelector('#full_description').value
    let readingTime = form.querySelector('#reading_time').value  
    let category = form.querySelector('#category').value
    let photo = form.querySelector('#photo').value 
    let id = new Date().getTime()
    let date = new Date().toLocaleString('ru-RU')
    
    auth.onAuthStateChanged((user)=>{
        if(user){
            db.collection('posts').doc('_' + id).set({
                title:title,
                textmesage:textmesage,
                fullDescription:fullDescription,
                readingTime:readingTime,
                category:category,
                photo:photo,
                user: user.uid,
                date:date,
            }).then(()=>{
                console.log('Пост добавлен')
                window.location.href='index.html'
            }).catch((error)=>{
                console.log(error.message)
            })
        }
    })
    
})


