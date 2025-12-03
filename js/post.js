const params = new URLSearchParams(window.location.search)
const id = params.get('id')

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
    if (user) {
      db.collection('comments').doc('_' + commentId).set({

        id: commentId,
        text: text,
        created_at: date,
        user: user.uid,
        post: id,
      })
      let comments = getComments()
      comments.then((snapchot) => {
        commentCount.textContent = snapchot.size
      })
    }
  })

  formComments.reset()
})


let query = getComments()


query.then((snapchot) => {
  commentCount.textContent = snapchot.size
  snapchot.forEach((doc) => {
    // Создать функцию генерации и отьрисовки комментариев на экране
  })
})


function getComments() {
  return db.collection('comments').where('post', '==', id).get()

}