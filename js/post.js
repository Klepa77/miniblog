const params = new URLSearchParams(window.location.search)
const id = params.get('id')
let commentsContainer = document.querySelector('.comments-container')
let deleteId = ''
let editId = ''
let editModal = document.getElementById('editCommentModal')
let textInput = document.querySelector('[name="title"]')
let editForm = document.querySelector('#editCommentForm')
let btnLike = document.querySelector('.like')
let btnDisLike = document.querySelector('.dislike')

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('posts')
      .doc(id)
      .get()
      .then(doc => {
        let data = doc.data()

        renderData(data)
      })
    updateLikeButtons()
  }
})

function renderData (postObject) {
  let img = document.querySelector('.post-cover')
  img.src = postObject.photo

  let postTitle = document.querySelector('.post-title')
  postTitle.textContent = postObject.title

  let fullDescription = document.querySelector('.post-body')
  fullDescription.textContent = postObject.fullDescription

  let category = document.querySelector('.category')
  category.textContent = postObject.category

  let date = document.querySelector('.date')
  let dateValue = postObject.date.split(',')[0]
  date.textContent = dateValue

  let time = document.querySelector('.time')
  time.textContent = postObject.readingTime + ' ' + 'минут  чтения'
}
let formComments = document.querySelector('.comment-form')
let commentCount = document.querySelector('.comment-count')

formComments.addEventListener('submit', function (e) {
  e.preventDefault()

  let commentInput = formComments.querySelector('textarea')
  let text = commentInput.value
  let commentId = new Date().getTime()
  let date = new Date().toLocaleString('ru-RU')

  auth.onAuthStateChanged(user => {
    if (!user) return

    let data = {
      text: text,
      created_at: date,
      user: user.uid,
      post: id
    }

    db.collection('users')
      .doc(user.uid)
      .get()
      .then(doc => {
        const username = doc.data().username
        data.author = username

        db.collection('comments')
          .doc('_' + commentId)
          .set(data)

        let comments = getComments()

        comments.then(snapchot => {
          commentCount.textContent = snapchot.size

          commentsContainer.innerHTML = ''

          snapchot.forEach(el => {
            let comment = el.data()
            renderComments(comment)
          })
        })
      })
    formComments.reset()
  })
})

let query = getComments()
setupRealtimeListeners()

function getComments () {
  return db.collection('comments').where('post', '==', id).get()
}

function renderComments (comment) {
  let divComment = document.createElement('div')
  let userData = document.createElement('div')
  let btnEdit = document.createElement('button')
  let btnDelete = document.createElement('button')
  let btnContainer = document.createElement('div')
  btnContainer.className = 'btn-container'
  divComment.id = comment.id
  btnDelete.className = 'btn btn-danger btn-delete'
  btnEdit.className = 'btn btn-primary btn-edit'
  btnEdit.textContent = 'edit'
  btnDelete.textContent = 'delete'
  btnDelete.id = comment.id
  btnEdit.id = comment.id

  btnContainer.appendChild(btnEdit)
  btnContainer.appendChild(btnDelete)

  userData.className = 'user-data'
  divComment.className = 'comment'

  let author = document.createElement('strong')

  author.textContent = comment.author
  userData.appendChild(author)
  userData.appendChild(btnContainer)
  divComment.appendChild(userData)

  let text = document.createElement('p')
  text.textContent = comment.text
  divComment.appendChild(text)

  commentsContainer.appendChild(divComment)

  btnEdit.addEventListener('click', function (e) {
    openEditModal()

    editId = e.target.id
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('comments')
          .doc(editId)
          .get()
          .then(doc => {
            if (doc.exists) {
              let data = doc.data()
              textInput.value = data.text
            }
          })
      }
    })
  })

  btnDelete.addEventListener('click', function (e) {
    deleteId = e.target.id
    console.log(deleteId)
    openDeleteModal()
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
    db.collection('comments').doc(deleteId).delete()
  })
  closeDeleteModal()
}
auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('comments').onSnapshot(snapshot => {
      let changes = snapshot.docChanges()
      changes.forEach(el => {
        let parentDiv = document.getElementById(el.doc.id)
        if (el.type == 'removed') {
          parentDiv.remove()
          console.log('removed')
        } else if (el.type === 'added') {
          renderComments({ ...el.doc.data(), id: el.doc.id })
        } else if (el.type == 'modified') {
          parentDiv.remove()
          renderComments({ ...el.doc.data(), id: el.doc.id })
        }
      })
      query.then(snapchot => {
        commentCount.textContent = snapchot.size
      })
    })
  }
})

function openEditModal () {
  editModal.style.display = 'flex'
}

function closeEditModal () {
  editModal.style.display = 'none'
}

editForm.addEventListener('submit', function (e) {
  e.preventDefault()

  let data = {
    text: textInput.value
  }
  auth.onAuthStateChanged(user => {
    if (user) {
      let item = db.collection('comments').doc(editId)

      item.get().then(doc => item.update(data))
    }
    closeEditModal()
  })
})

btnLike.addEventListener('click', async function (e) {
  const user = auth.currentUser
  if (!user) return

  const likeExists = await isExists('likes')
  const dislikeExists = await isExists('dislikes')
  
  if(dislikeExists){
    await removeData('dislikes')

  }


  if (likeExists) {
    await removeData('likes')

    return
  }

  const likeId = new Date().getTime()

  await db
    .collection('likes')
    .doc('_' + likeId)
    .set({
      user: user.uid,
      post: id
    })

  getCount('likes')
})

btnDisLike.addEventListener('click', async function (e) {
  const user = auth.currentUser
  if (!user) return

  const dislikeExists = await isExists('dislikes')
  const likeExists = await isExists('likes')
  
  if(likeExists){
  await removeData('likes')

  }

  if (dislikeExists) {
    await removeData('dislikes')
    return
  }

  const dislikeId = new Date().getTime()

  await db
    .collection('dislikes')
    .doc('_' + dislikeId)
    .set({
      user: user.uid,
      post: id
    })

  getCount('dislikes')
})

// Реализация likes & disllikes без основной логиики продлолжаем во вторник
let likes = document.querySelector('.count-likes')
let dislikes = document.querySelector('.count-dislikes')

async function getCount (tableName) {
  let cnt = await db.collection(tableName).where('post', '==', id).get()

  if (tableName == 'likes') {
    likes.textContent = cnt.size
  }
  if (tableName == 'dislikes') {
    dislikes.textContent = cnt.size
  }
}
async function isExists (table) {
  let user = auth.currentUser
  if (!user) return

  let exists = await db
    .collection(table)
    .where('post', '==', id)
    .where('user', '==', user.uid)
    .get()
  return exists.size > 0
}
async function removeData (tableName) {
  let user = auth.currentUser
  let snapchot = await db
    .collection(tableName)
    .where('post', '==', id)
    .where('user', '==', user.uid)
    .get()
  const userLikes = db.batch()
  snapchot.forEach(doc => {
    userLikes.delete(doc.ref)
  })
  await userLikes.commit()
}

async function updateUserLikeStatus () {
  const user = auth.currentUser
  if (!user) return

  const likeExists = await isExists('likes')
  if (likeExists) {
    btnLike.classList.add('btn-success')
  } else {
    btnLike.classList.remove('btn-success')
  }
}

async function updateUserDislikeStatus () {
  const user = auth.currentUser
  if (!user) return

  const dislikeExists = await isExists('dislikes')
  if (dislikeExists) {
    btnDisLike.classList.add('btn-danger')
  } else {
    btnDisLike.classList.remove('btn-danger')
  }
}

async function updateLikeButtons () {
  await updateUserLikeStatus()
  await updateUserDislikeStatus()
}

function setupRealtimeListeners () {
  // Слушатель для лайков
  db.collection('likes')
    .where('post', '==', id)
    .onSnapshot(snapshot => {
      likes.textContent = snapshot.size
      updateUserLikeStatus()
    })

  // Слушатель для дизлайков
  db.collection('dislikes')
    .where('post', '==', id)
    .onSnapshot(snapshot => {
      dislikes.textContent = snapshot.size
      updateUserDislikeStatus()
    })
}

// Сделать логику удаления лайка при нажаотия дизлайка и наоборот 

