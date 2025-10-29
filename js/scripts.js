let deleteId 
function logout () {
  auth.signOut()
}

auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = 'login.html'
  }
})

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('posts').onSnapshot(snapshot => {
      let changes = snapshot.docChanges()
      changes.forEach(element => {
        if (element.type === 'added') {
          renderData({ ...element.doc.data(), id: element.doc.id })
        }
      })
    })
  }
})

function renderData (postObject) {
  let article = document.createElement('article')
  article.id =  postObject.id
  article.className = 'post'

  let image = document.createElement('img')
  image.className = 'img'
  image.src = postObject.photo

  article.appendChild(image)

  let div = document.createElement('div')
  let meta = document.createElement('div')
  meta.className = 'meta'

  meta.textContent = `${postObject.category} · ${postObject.date} · ${postObject.readingTime} минут чтения `

  div.appendChild(meta)

  let title = document.createElement('h3')
  title.className = 'post-title'
  title.textContent = postObject.title
  div.appendChild(title)

  let text = document.createElement('div')
  text.className = 'post-body'
  text.textContent = postObject.textmesage
  div.appendChild(text)

  let btnContainer = document.createElement('div')
  btnContainer.className = 'post-actions'

  let btnEdit = document.createElement('button')
  btnEdit.className = 'btn btn-edit'
  btnEdit.textContent = '✏'
  btnContainer.appendChild(btnEdit)

  article.appendChild(btnContainer)

  let btnDelete = document.createElement('button')
  btnDelete.id = postObject.id
  btnDelete.className = 'btn btn-delete'
  btnDelete.textContent = '🗑'
  btnContainer.appendChild(btnDelete)

  btnContainer.appendChild(btnDelete)

  article.appendChild(div)
  div.className = 'post-data'

  let articleContainer = document.querySelector('.article-container')
  articleContainer.appendChild(article)

  btnDelete.addEventListener('click', function (e) {
    openDeleteModal()
    
    deleteId = e.target.id
    
  })
}

let deleteModal = document.getElementById('deleteModal')
let closeBtn = deleteModal.querySelector('.btn-cancel')
function openDeleteModal () {
  deleteModal.style.display = 'flex'
}

function closeDeleteModal () {
  deleteModal.style.display = 'none'
}

closeBtn.onclick = closeDeleteModal

function confirmDelete () {

  auth.onAuthStateChanged(user => {
    db.collection('posts').doc(deleteId).delete()

  })
  closeDeleteModal()
}


auth.onAuthStateChanged((user)=>{
    if(user){
        db.collection('posts').onSnapshot((snapshot)=>{
            let changes= snapshot.docChanges()
            changes.forEach(el=>{
                console.log(el.type)
                if(el.type == 'removed'){
                    let parentDiv=document.getElementById(el.doc.id)
                    console.log(parentDiv)
                    parentDiv.remove()
                    
                }
            })
        })
    }
})