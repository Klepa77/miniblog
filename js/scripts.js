let deleteId
let editId
function logout() {
  auth.signOut()
}

auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = 'login.html'
  }
})

let editmModal = document.getElementById('editPostModal')
let inputTitle = document.querySelector('[name="title"]')
let inputDescription = document.querySelector('[name="short_desc"]')
let tetxAreaFull = document.querySelector('[name="full_desc"]')
let readingTimeInput = document.querySelector('[name="reading_time"]')
let categorys = document.querySelector('[name="category"]')
let linkImage = document.querySelector('[name="image_url"]')
let articleContainer = document.querySelector('.article-container')

function renderData(postObject) {
  let article = document.createElement('article')
  article.id = postObject.id
  article.className = 'post'

  let image = document.createElement('img')
  image.className = 'img'
  image.src = postObject.photo

  image.onclick = function () {
    const id = postObject.id
    location.href = `post.html?id=${id}`
  }

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
  let btnDelete = document.createElement('button')
  let btnEdit = document.createElement('button')

  auth.onAuthStateChanged(user => {
    if (user.uid == postObject.user) {
      let btnContainer = document.createElement('div')
      btnContainer.className = 'post-actions'

      btnEdit.id = postObject.id
      btnEdit.className = 'btn btn-edit'
      btnEdit.textContent = '✏'
      btnContainer.appendChild(btnEdit)

      article.appendChild(btnContainer)

      btnDelete.id = postObject.id
      btnDelete.className = 'btn btn-delete'
      btnDelete.textContent = '🗑'
      btnContainer.appendChild(btnDelete)
    }
  })
  article.appendChild(div)
  div.className = 'post-data'


  articleContainer.appendChild(article)

  btnDelete.addEventListener('click', function (e) {
    openDeleteModal()

    deleteId = e.target.id
  })

  btnEdit.addEventListener('click', function (e) {
    openEditModal()

    editId = e.target.id

    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('posts')
          .doc(editId)
          .get()
          .then(doc => {
            if (doc.exists) {
              let data = doc.data()
              inputTitle.value = data.title
              inputDescription.value = data.textmesage
              tetxAreaFull.value = data.fullDescription
              readingTimeInput.value = data.readingTime
              categorys.value = data.category
              linkImage.value = data.photo
            }
          })
      }
    })
  })
}

let deleteModal = document.getElementById('deleteModal')
let closeBtn = deleteModal.querySelector('.btn-cancel')

function openDeleteModal() {
  deleteModal.style.display = 'flex'
}

function closeDeleteModal() {
  deleteModal.style.display = 'none'
}

closeBtn.onclick = closeDeleteModal

function confirmDelete() {
  auth.onAuthStateChanged(user => {
    db.collection('posts').doc(deleteId).delete()
  })
  closeDeleteModal()
}

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('posts').onSnapshot(snapshot => {
      let changes = snapshot.docChanges()
      changes.forEach(el => {
        let parentDiv = document.getElementById(el.doc.id)
        if (el.type == 'removed') {
          parentDiv.remove()
        } else if (el.type === 'added') {
          renderData({ ...el.doc.data(), id: el.doc.id })
        } else if (el.type == 'modified') {
          parentDiv.remove()
          renderData({ ...el.doc.data(), id: el.doc.id })
        }
      })
    })
  }
})

function openEditModal() {
  editmModal.style.display = 'flex'
}

function closeEditModal() {
  editmModal.style.display = 'none'
}

let editCloseButton = editmModal.querySelector('.btn-cancel')
editCloseButton.onclick = closeEditModal

let editForm = document.querySelector('#editPostForm')

editForm.addEventListener('submit', function (e) {
  e.preventDefault()

  let editPost = {
    title: inputTitle.value,
    textmesage: inputDescription.value,
    fullDescription: tetxAreaFull.value,
    readingTime: readingTimeInput.value,
    category: categorys.value,
    photo: linkImage.value
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      let item = db.collection('posts').doc(editId)

      item.get().then(doc => item.update(editPost))
    }
    closeEditModal()
  })
})

let categoryes = document.querySelectorAll('.tag')


categoryes.forEach((el) => {

  el.addEventListener('click', function (event) {
    let category = event.target.dataset.value

    if (category != 'all') {

      filterHandler(category)
    } else {
      db.collection('posts').onSnapshot(snapshot => {
        articleContainer.innerHTML = ''
        snapshot.docs.forEach(doc => {
          renderData({ ...doc.data(), id: doc.id })

        })
      })

    }


  })

})

function filterHandler(category) {
  let query = db.collection('posts').where('category', '==', category)

  query.get().then((snapchot) => {
    articleContainer.innerHTML = ''
    snapchot.forEach((doc) => {
      renderData({ ...doc.data(), id: doc.id })
      console.log({ ...doc.data(), id: doc.id })
    })
  })
}

let formSearch = document.querySelector('.search')

formSearch.addEventListener('submit', function (e) {
  e.preventDefault()

  let input = formSearch.querySelector('input')
  let text = input.value
  articleContainer.innerHTML=''
  db.collection('posts').onSnapshot(snapshot => {
    snapshot.docs.forEach(doc => {
      if( 
        doc.data().title.toLowerCase().includes(text) ||
        doc.data().textmesage.toLowerCase().includes(text)
      
      ){
        renderData({...doc.data(),id:doc.id})

      }

    })


    })
  })


  formSearch.reset()



