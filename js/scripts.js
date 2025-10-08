function logout() {
    auth.signOut()
}

auth.onAuthStateChanged((user) => {
    if (!user) {
        location.href = 'login.html'
    }
})