const params = new URLSearchParams(window.location.search)
const id = params.get('id')
let commentsContainer = document.querySelector('.comments-container')
let deleteId = ''
let editId = ''

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('posts')
      .doc(id)
      .get()
      .then(doc => {
        let data = doc.data()

        renderData(data)
      })
  }
})

function renderData(postObject) {
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


  auth.onAuthStateChanged((user) => {
    if (!user) return;

    let data = {
      id: commentId,
      text: text,
      created_at: date,
      user: user.uid,
      post: id,
    };

    db.collection('users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        const username = doc.data().username;
        data.author = username;

        db.collection('comments')
          .doc('_' + commentId)
          .set(data)

        let comments = getComments()

        comments.then((snapchot) => {
          commentCount.textContent = snapchot.size

          commentsContainer.innerHTML = ''

          snapchot.forEach((el) => {
            let comment = el.data()
            renderComments(comment)
          })
        })

      });
    formComments.reset()
  })
})

let query = getComments()


query.then((snapchot) => {
  // commentCount.textContent = snapchot.size
  snapchot.forEach((doc) => {
    // Создать функцию генерации и отьрисовки комментариев на экране
    renderComments(doc.data())
  })
})


function getComments() {
  return db.collection('comments').where('post', '==', id).get()

}

function renderComments(comment) {
  let divComment = document.createElement('div')
  let userData = document.createElement('div')
  let btnEdit = document.createElement('button')
  let btnDelete = document.createElement('button')
  let btnContainer = document.createElement('div')
  btnContainer.className = 'btn-container'
  divComment.id = "_" + comment.id

  btnDelete.className = 'btn btn-danger btn-delete'
  btnEdit.className = 'btn btn-primary btn-edit'
  btnEdit.textContent = 'edit'
  btnDelete.textContent = 'delete'
  btnDelete.id = "_" + comment.id
  btnEdit.id = "_" + comment.id

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

  btnEdit.addEventListener('click', function () {

  })

  btnDelete.addEventListener('click', function (e) {
    deleteId = e.target.id
    console.log(deleteId)
    openDeleteModal()
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
          renderData({ ...el.doc.data(), id: el.doc.id })
        } else if (el.type == 'modified') {
          parentDiv.remove()
          renderData({ ...el.doc.data(), id: el.doc.id })
        }
      })
      query.then((snapchot) => {
        commentCount.textContent = snapchot.size
      })
    })
  }
})