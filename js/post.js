const params = new URLSearchParams(window.location.search)
const id = params.get('id')
let commentsContainer = document.querySelector('.comments-container')

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
  commentCount.textContent = snapchot.size
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
  divComment.className = 'comment'
  let author = document.createElement('strong')
  author.textContent = comment.author
  divComment.appendChild(author)
  let text = document.createElement('p')
  text.textContent = comment.text
  divComment.appendChild(text)

  commentsContainer.appendChild(divComment)
}