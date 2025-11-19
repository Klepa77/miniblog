const params = new URLSearchParams(window.location.search);
console.log(params)
const id = params.get("id");
console.log(id)


auth.onAuthStateChanged((user)=>{
    if(user){
        db.collection('posts').doc(id).get().then((doc)=>{
               let data = doc.data()
               console.log(data)
            renderData(data)
        })
    }

})

function renderData(postObject){
    let img = document.querySelector('.post-cover')
    img.src = postObject.photo
    let postTitle = document.querySelector('.post-title')
    console.log(postTitle)
    postTitle.textContent = postObject.title
    let fullDescription = document.querySelector('.post-body')
    fullDescription.textContent = postObject.fullDescription
    let category = document.querySelector('.category')
    category.textContent = postObject.category 

    let date = document.querySelector('.date')
    date.textContent = postObject.date







    


}